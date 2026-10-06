/**
 * Fashion Analysis Host controller projection tests.
 */

import { afterEach, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Storage from '@deepseek-ai/dsh-storage'
import { DomainFacility } from '@deepseek-ai/dsh-storage-domain'
import FashionProjectRegistry, { R0_PROJECT_ID } from '@gentlexx/dsh-fashion-project'
import FashionResearchRegistry, { R0_TASK_ID } from '@gentlexx/dsh-fashion-research'
import FashionAnalysisRegistry, {
  MarketItemId,
  R0_OPPORTUNITY_ID,
} from '@gentlexx/dsh-fashion-analysis'
import { RemoteError } from '@deepseek-ai/dsh-typert-protocol'
import { MemoryStorageBackend } from '../../../storage/storage-domain/tests/helpers/memory-backend.ts'
import FashionAnalysisController from '../src/index.ts'

const roots: Context[] = []

afterEach(async () => {
  await Promise.all(roots.splice(0).map(ctx => ctx.fiber.dispose()))
})

async function harness() {
  const ctx = new Context()
  roots.push(ctx)
  await ctx.plugin(Storage)
  ctx.storage.backend.register('memory', new MemoryStorageBackend())
  const storageDomain = new DomainFacility(ctx, { backend: 'memory', routes: {} })
  ctx.storage.mount('domain', storageDomain)
  ctx.provide('storageDomain', storageDomain)
  await ctx.plugin(FashionProjectRegistry)
  await ctx.plugin(FashionResearchRegistry)
  await ctx.plugin(FashionAnalysisRegistry)
  const dispose = (): void => {}
  ctx.provide('typert', {
    lookups: { configure: () => dispose },
    contexts: { configureHost: () => dispose },
  } as never)
  const controller = new FashionAnalysisController(ctx)
  return { controller, ctx }
}

describe('FashionAnalysisController', () => {
  it('loads R0 analysis workspace and refuses R0 writes', async () => {
    const { controller } = await harness()
    const workspace = await controller.loadWorkspace({
      projectId: R0_PROJECT_ID,
      taskId: R0_TASK_ID,
    })
    expect(workspace.marketItems.length).toBeGreaterThan(0)
    expect(workspace.signals.length).toBeGreaterThan(0)
    expect(workspace.clusters.length).toBeGreaterThan(0)
    expect(workspace.opportunities.some(row => row.id === R0_OPPORTUNITY_ID)).toBe(true)

    await expect(controller.createMarketItem({
      projectId: R0_PROJECT_ID,
      taskId: R0_TASK_ID,
      itemType: 'garment_product',
      displayName: 'nope',
      observationLinks: [],
    })).rejects.toMatchObject({ code: 'fashion-analysis/project-read-only' })

    expect(() => controller.getMarketItem({
      projectId: R0_PROJECT_ID,
      taskId: R0_TASK_ID,
      marketItemId: MarketItemId('missing'),
    })).toThrow(RemoteError)
  })

  it('projects ordinary create/get/decide and parent-chain refusal', async () => {
    const { controller, ctx } = await harness()
    const project = await ctx.fashionProjectRegistry.create({ title: 'Analysis remote' })
    const task = await ctx.fashionResearchRegistry.createTask({
      projectId: project.id,
      title: 'Task',
    })
    const other = await ctx.fashionProjectRegistry.create({ title: 'Other' })
    const otherTask = await ctx.fashionResearchRegistry.createTask({
      projectId: other.id,
      title: 'Other task',
    })

    const empty = await controller.loadWorkspace({ projectId: project.id, taskId: task.id })
    expect(empty.marketItems).toEqual([])
    expect(empty.opportunities).toEqual([])

    const source = await ctx.fashionResearchRegistry.createSource({
      projectId: project.id,
      taskId: task.id,
      locatorType: 'url',
      url: 'https://example.com/analysis-remote',
      title: 'Source',
      sourceKind: 'product_page',
      captureMode: 'manual_link',
      usageBoundary: 'view_only',
      externalProcessing: 'denied',
      attribution: 'manual',
    })
    const sample = await ctx.fashionResearchRegistry.createSample({
      projectId: project.id,
      taskId: task.id,
      sourceId: source.id,
      label: 'Sample A',
    })
    const evidence = await ctx.fashionResearchRegistry.createEvidence({
      projectId: project.id,
      taskId: task.id,
      subjectType: 'sample',
      subjectId: sample.id,
      observation: 'khaki utility silhouette',
      evidenceGrade: 'G1',
    })
    await ctx.fashionResearchRegistry.reviewEvidence({
      evidenceId: evidence.id,
      expectedRevision: evidence.revision,
      reviewStatus: 'confirmed',
      reviewNote: 'ok',
    })

    const item = await controller.createMarketItem({
      projectId: project.id,
      taskId: task.id,
      itemType: 'garment_product',
      displayName: 'Utility jacket',
      observationLinks: [{
        sampleId: sample.id,
        sourceId: source.id,
        evidenceIds: [evidence.id],
      }],
    })
    expect(item.displayName).toBe('Utility jacket')
    expect(controller.getMarketItem({
      projectId: project.id,
      taskId: task.id,
      marketItemId: item.id,
    }).id).toBe(item.id)

    expect(() => controller.getMarketItem({
      projectId: other.id,
      taskId: task.id,
      marketItemId: item.id,
    })).toThrow(RemoteError)

    expect(() => controller.getMarketItem({
      projectId: project.id,
      taskId: otherTask.id,
      marketItemId: item.id,
    })).toThrow(RemoteError)

    const signal = await controller.createPopularitySignal({
      projectId: project.id,
      taskId: task.id,
      signalType: 'search_growth',
      subjectRefs: [{ type: 'market_item', id: String(item.id) }],
      platform: 'manual',
      observedAt: new Date().toISOString(),
      rawValue: '+10%',
      rawUnit: 'search_change',
      evidenceIds: [evidence.id],
      methodVersion: 'test-v1',
      limitations: ['test only'],
    })
    const cluster = await controller.createTrendCluster({
      projectId: project.id,
      taskId: task.id,
      name: 'Utility khaki',
      definition: 'khaki utility outerwear',
      memberRefs: [
        { type: 'market_item', id: String(item.id) },
        { type: 'signal', id: String(signal.id) },
      ],
      clusterMethod: 'manual',
      methodVersion: 'v0-manual',
      marketRegions: ['US'],
      timeContext: '2026-Q1',
      evidenceGrade: 'G1',
      counterEvidence: [],
      biasesAndGaps: ['single source'],
    })
    const opportunity = await controller.createDesignOpportunity({
      projectId: project.id,
      taskId: task.id,
      title: 'Soft utility jacket',
      opportunityStatement: 'lighter utility for warm weather',
      trendClusterIds: [cluster.id],
      targetMarket: 'US women',
      targetUserHypothesis: 'commuters',
      category: 'outerwear',
      timing: 'near-term',
      commercialHypotheses: ['capsule'],
      creativeSpaces: ['soft shell'],
      saturationRisks: ['fast fashion copies'],
      copyingOrIpRisks: ['logo marks'],
      unknowns: ['fabric handfeel'],
      evidenceGrade: 'G1',
    })
    const decided = await controller.decideOpportunity({
      projectId: project.id,
      taskId: task.id,
      opportunityId: opportunity.id,
      expectedRevision: opportunity.revision,
      action: 'selected',
      reasonCodes: ['evidence_sufficient'],
      note: 'enough for brief',
    })
    expect(decided.opportunity.reviewStatus).toBe('selected')
    expect(decided.decision.action).toBe('selected')
  })
})
