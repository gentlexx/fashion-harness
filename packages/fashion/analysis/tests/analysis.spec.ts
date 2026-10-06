/**
 * Fashion Analysis registry: R0 seed, ordinary empty, human gates, reconcileStale.
 */

import { afterEach, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Storage from '@deepseek-ai/dsh-storage'
import { DomainFacility } from '@deepseek-ai/dsh-storage-domain'
import { MemoryStorageBackend } from '../../../storage/storage-domain/tests/helpers/memory-backend.ts'
import FashionProjectRegistry, { R0_PROJECT_ID } from '@gentlexx/dsh-fashion-project'
import FashionResearchRegistry, {
  EvidenceId,
  R0_TASK_ID,
  SampleId,
  SourceId,
} from '@gentlexx/dsh-fashion-research'
import FashionAnalysisRegistry, {
  FashionAnalysisInvalidTransitionError,
  R0_CLUSTER_ID,
  R0_MARKET_ITEM_SEEDS,
  R0_OPPORTUNITY_ID,
  R0_SIGNAL_SEEDS,
} from '../src/index.ts'

const contexts: Context[] = []

afterEach(async () => {
  while (contexts.length > 0) {
    const ctx = contexts.pop()!
    await ctx.fiber.dispose()
  }
})

async function boot() {
  const ctx = new Context()
  contexts.push(ctx)
  await ctx.plugin(Storage)
  ctx.storage.backend.register('memory', new MemoryStorageBackend())
  const facility = new DomainFacility(ctx, { backend: 'memory', routes: {} })
  ctx.storage.mount('domain', facility)
  ctx.provide('storageDomain', facility)
  await ctx.plugin(FashionProjectRegistry)
  await ctx.plugin(FashionResearchRegistry)
  await ctx.plugin(FashionAnalysisRegistry)
  return ctx
}

describe('FashionAnalysisRegistry', () => {
  it('seeds R0 analysis graph under the R0 project/task', async () => {
    const ctx = await boot()
    const analysis = ctx.fashionAnalysisRegistry
    expect(analysis.listMarketItems(R0_PROJECT_ID, R0_TASK_ID)).toHaveLength(R0_MARKET_ITEM_SEEDS.length)
    expect(analysis.listSignals(R0_PROJECT_ID, R0_TASK_ID)).toHaveLength(R0_SIGNAL_SEEDS.length)
    expect(analysis.listClusters(R0_PROJECT_ID, R0_TASK_ID).some(row => row.id === R0_CLUSTER_ID)).toBe(true)
    const opportunity = analysis.getOpportunity(R0_PROJECT_ID, R0_TASK_ID, R0_OPPORTUNITY_ID)
    expect(opportunity.publicRebuildRecorded).toBe(true)
    expect(opportunity.reviewStatus).toBe('selected')
    const decisions = analysis.listDecisions(R0_PROJECT_ID, R0_TASK_ID)
    expect(decisions.some(row => row.publicRebuildRecorded && row.actor === 'local-human' && row.action === 'selected')).toBe(true)
    expect(analysis.listOntologyVersions(R0_PROJECT_ID, R0_TASK_ID)).toHaveLength(1)
  })

  it('keeps ordinary projects empty and enforces human opportunity decisions', async () => {
    const ctx = await boot()
    const project = await ctx.fashionProjectRegistry.create({ title: 'Ordinary analysis' })
    const task = await ctx.fashionResearchRegistry.createTask({
      projectId: project.id,
      title: 'User research task',
    })
    expect(ctx.fashionAnalysisRegistry.listMarketItems(project.id, task.id)).toEqual([])
    expect(ctx.fashionAnalysisRegistry.listSignals(project.id, task.id)).toEqual([])
    expect(ctx.fashionAnalysisRegistry.listClusters(project.id, task.id)).toEqual([])
    expect(ctx.fashionAnalysisRegistry.listOpportunities(project.id, task.id)).toEqual([])

    const source = await ctx.fashionResearchRegistry.createSource({
      projectId: project.id,
      taskId: task.id,
      locatorType: 'url',
      url: 'https://example.com/analysis-item',
      title: 'User source',
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
      label: 'User sample',
    })
    const evidence = await ctx.fashionResearchRegistry.createEvidence({
      projectId: project.id,
      taskId: task.id,
      subjectType: 'sample',
      subjectId: sample.id,
      observation: 'Observed listing text',
      evidenceGrade: 'G1',
    })
    await ctx.fashionResearchRegistry.reviewEvidence({
      evidenceId: evidence.id,
      expectedRevision: evidence.revision,
      reviewStatus: 'confirmed',
      reviewNote: 'confirmed for analysis',
    })

    const item = await ctx.fashionAnalysisRegistry.createMarketItem({
      projectId: project.id,
      taskId: task.id,
      itemType: 'garment_product',
      displayName: 'User market item',
      observationLinks: [{
        sampleId: sample.id,
        sourceId: source.id,
        evidenceIds: [evidence.id],
      }],
    })
    await expect(ctx.fashionAnalysisRegistry.confirmDedupe({
      projectId: project.id,
      taskId: task.id,
      marketItemId: item.id,
      expectedRevision: item.revision,
      dedupeStatus: 'confirmed_same',
      actor: 'system-rule',
    })).rejects.toThrow(FashionAnalysisInvalidTransitionError)

    const signal = await ctx.fashionAnalysisRegistry.createPopularitySignal({
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
    const cluster = await ctx.fashionAnalysisRegistry.createTrendCluster({
      projectId: project.id,
      taskId: task.id,
      name: 'User cluster',
      definition: 'Two members for draft cluster',
      memberRefs: [
        { type: 'market_item', id: String(item.id) },
        { type: 'signal', id: String(signal.id) },
      ],
      clusterMethod: 'manual',
      methodVersion: 'test-v1',
      marketRegions: ['US'],
      timeContext: 'test',
      evidenceGrade: 'G1',
      counterEvidence: ['none'],
      biasesAndGaps: ['tiny sample'],
    })
    const opportunity = await ctx.fashionAnalysisRegistry.createDesignOpportunity({
      projectId: project.id,
      taskId: task.id,
      title: 'User opportunity',
      opportunityStatement: 'Candidate only',
      trendClusterIds: [cluster.id],
      targetMarket: 'US',
      targetUserHypothesis: 'testers',
      category: 'jacket',
      timing: 'now',
      evidenceGrade: 'G1',
      actor: 'system-rule',
    })
    expect(opportunity.reviewStatus).toBe('candidate')
    await expect(ctx.fashionAnalysisRegistry.decideOpportunity({
      projectId: project.id,
      taskId: task.id,
      opportunityId: opportunity.id,
      expectedRevision: opportunity.revision,
      action: 'selected',
      reasonCodes: ['evidence_sufficient'],
      note: 'should fail',
      actor: 'system-rule',
    })).rejects.toThrow(FashionAnalysisInvalidTransitionError)

    const decided = await ctx.fashionAnalysisRegistry.decideOpportunity({
      projectId: project.id,
      taskId: task.id,
      opportunityId: opportunity.id,
      expectedRevision: opportunity.revision,
      action: 'selected',
      reasonCodes: ['evidence_sufficient'],
      note: 'human selected',
    })
    expect(decided.opportunity.reviewStatus).toBe('selected')
    expect(decided.decision.actor).toBe('local-human')
  })

  it('marks dependent signals and opportunities stale after evidence rejection', async () => {
    const ctx = await boot()
    const project = await ctx.fashionProjectRegistry.create({ title: 'Stale cascade' })
    const task = await ctx.fashionResearchRegistry.createTask({
      projectId: project.id,
      title: 'Stale task',
    })
    const source = await ctx.fashionResearchRegistry.createSource({
      projectId: project.id,
      taskId: task.id,
      locatorType: 'url',
      url: 'https://example.com/stale',
      title: 'Stale source',
      sourceKind: 'web_page',
      captureMode: 'manual_link',
      usageBoundary: 'view_only',
      externalProcessing: 'denied',
      attribution: 'manual',
    })
    const sample = await ctx.fashionResearchRegistry.createSample({
      projectId: project.id,
      taskId: task.id,
      sourceId: source.id,
      label: 'Stale sample',
    })
    const evidence = await ctx.fashionResearchRegistry.createEvidence({
      projectId: project.id,
      taskId: task.id,
      subjectType: 'sample',
      subjectId: sample.id,
      observation: 'Will reject later',
      evidenceGrade: 'G1',
    })
    const confirmed = await ctx.fashionResearchRegistry.reviewEvidence({
      evidenceId: evidence.id,
      expectedRevision: evidence.revision,
      reviewStatus: 'confirmed',
      reviewNote: 'confirm',
    })
    const item = await ctx.fashionAnalysisRegistry.createMarketItem({
      projectId: project.id,
      taskId: task.id,
      itemType: 'garment_product',
      displayName: 'Stale item',
      observationLinks: [{
        sampleId: SampleId(String(sample.id)),
        sourceId: SourceId(String(source.id)),
        evidenceIds: [EvidenceId(String(confirmed.id))],
      }],
    })
    const signal = await ctx.fashionAnalysisRegistry.createPopularitySignal({
      projectId: project.id,
      taskId: task.id,
      signalType: 'engagement',
      subjectRefs: [{ type: 'market_item', id: String(item.id) }],
      platform: 'manual',
      observedAt: new Date().toISOString(),
      rawValue: '1',
      rawUnit: 'count',
      evidenceIds: [confirmed.id],
      methodVersion: 'test-v1',
      limitations: ['test'],
    })
    const cluster = await ctx.fashionAnalysisRegistry.createTrendCluster({
      projectId: project.id,
      taskId: task.id,
      name: 'Stale cluster',
      definition: 'depends on signal',
      memberRefs: [
        { type: 'market_item', id: String(item.id) },
        { type: 'signal', id: String(signal.id) },
      ],
      signalIds: [signal.id],
      clusterMethod: 'manual',
      methodVersion: 'test-v1',
      marketRegions: ['US'],
      timeContext: 'test',
      evidenceGrade: 'G1',
      counterEvidence: ['n/a'],
      biasesAndGaps: ['n/a'],
    })
    const opportunity = await ctx.fashionAnalysisRegistry.createDesignOpportunity({
      projectId: project.id,
      taskId: task.id,
      title: 'Stale opportunity',
      opportunityStatement: 'will stale',
      trendClusterIds: [cluster.id],
      targetMarket: 'US',
      targetUserHypothesis: 'testers',
      category: 'jacket',
      timing: 'now',
      evidenceGrade: 'G1',
    })

    await ctx.fashionResearchRegistry.reviewEvidence({
      evidenceId: confirmed.id,
      expectedRevision: confirmed.revision,
      reviewStatus: 'rejected',
      reviewNote: 'no longer valid',
    })
    const marked = await ctx.fashionAnalysisRegistry.reconcileStale(project.id, task.id)
    expect(marked).toBeGreaterThanOrEqual(1)
    expect(ctx.fashionAnalysisRegistry.getSignal(project.id, task.id, signal.id).status).toBe('stale')
    expect(ctx.fashionAnalysisRegistry.getCluster(project.id, task.id, cluster.id).status).toBe('stale')
    expect(ctx.fashionAnalysisRegistry.getOpportunity(project.id, task.id, opportunity.id).status).toBe('stale')
  })
})
