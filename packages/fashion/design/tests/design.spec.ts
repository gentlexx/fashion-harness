/**
 * Fashion Design registry: R0 seed, ordinary empty, selected gate, differentiation.
 */

import { afterEach, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Storage from '@deepseek-ai/dsh-storage'
import { DomainFacility } from '@deepseek-ai/dsh-storage-domain'
import { MemoryStorageBackend } from '../../../storage/storage-domain/tests/helpers/memory-backend.ts'
import FashionProjectRegistry, { R0_PROJECT_ID } from '@gentlexx/dsh-fashion-project'
import FashionResearchRegistry from '@gentlexx/dsh-fashion-research'
import FashionAnalysisRegistry, {
  R0_DECISION_ID,
  R0_OPPORTUNITY_ID,
} from '@gentlexx/dsh-fashion-analysis'
import FashionDesignRegistry, {
  FashionDesignDifferentiationFailedError,
  FashionDesignProjectReadOnlyError,
  FashionDesignUpstreamNotSelectedError,
  R0_BRIEF_ID,
  R0_CONCEPT_SET_ID,
  R0_CONCEPT_URBAN_ID,
  R0_VISUAL_URBAN_ID,
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
  await ctx.plugin(FashionDesignRegistry)
  return ctx
}

function unknownConstraint(id: string, text: string) {
  return {
    id,
    text,
    kind: 'unknown',
    claimType: 'needs_validation' as const,
    sourceRefs: [] as string[],
    note: null,
  }
}

describe('FashionDesignRegistry', () => {
  it('seeds R0 brief, three concepts, and recorded visuals under the R0 project', async () => {
    const ctx = await boot()
    const design = ctx.fashionDesignRegistry
    const brief = design.getBrief(R0_PROJECT_ID, R0_BRIEF_ID)
    expect(brief.status).toBe('confirmed')
    expect(brief.origin).toBe('recorded_seed')
    expect(brief.accessMode).toBe('read-only')
    expect(brief.opportunityId).toBe(R0_OPPORTUNITY_ID)
    expect(brief.selectionDecisionId).toBe(R0_DECISION_ID)
    const set = design.getConceptSet(R0_PROJECT_ID, R0_CONCEPT_SET_ID)
    expect(set.status).toBe('review_ready')
    expect(set.conceptRefs).toHaveLength(3)
    const concepts = design.listConcepts(R0_PROJECT_ID, R0_CONCEPT_SET_ID)
    expect(concepts).toHaveLength(3)
    expect(concepts.some(row => row.id === R0_CONCEPT_URBAN_ID)).toBe(true)
    const visuals = design.listVisualDrafts(R0_PROJECT_ID, R0_CONCEPT_URBAN_ID)
    expect(visuals.some(row => row.id === R0_VISUAL_URBAN_ID && row.generationMode === 'recorded_fixture')).toBe(true)
    expect(design.evaluateDifferentiation(R0_PROJECT_ID, R0_CONCEPT_SET_ID).passed).toBe(true)
    expect(typeof (design as { approveConcept?: unknown }).approveConcept).toBe('undefined')
  })

  it('keeps ordinary projects empty and refuses non-selected brief creation', async () => {
    const ctx = await boot()
    const project = await ctx.fashionProjectRegistry.create({ title: 'Ordinary design' })
    const task = await ctx.fashionResearchRegistry.createTask({
      projectId: project.id,
      title: 'User research task',
    })
    expect(ctx.fashionDesignRegistry.listBriefs(project.id)).toEqual([])
    expect(ctx.fashionDesignRegistry.listConceptSets(project.id)).toEqual([])

    await expect(ctx.fashionDesignRegistry.createBriefFromOpportunity({
      projectId: project.id,
      opportunityId: R0_OPPORTUNITY_ID,
      expectedOpportunityRevision: 0,
      selectionDecisionId: R0_DECISION_ID,
      market: 'US',
      season: 'Fall',
      category: 'Jacket',
      targetUser: 'testers',
    })).rejects.toBeInstanceOf(FashionDesignUpstreamNotSelectedError)

    // R0 project is read-only for user writes
    await expect(ctx.fashionDesignRegistry.createBriefFromOpportunity({
      projectId: R0_PROJECT_ID,
      opportunityId: R0_OPPORTUNITY_ID,
      expectedOpportunityRevision: 0,
      selectionDecisionId: R0_DECISION_ID,
      market: 'US',
      season: 'Fall',
      category: 'Jacket',
      targetUser: 'testers',
    })).rejects.toBeInstanceOf(FashionDesignProjectReadOnlyError)

    void task
  })

  it('creates confirmed brief and three concepts; color-only differentiation fails review_ready', async () => {
    const ctx = await boot()
    const project = await ctx.fashionProjectRegistry.create({ title: 'Design path' })
    const task = await ctx.fashionResearchRegistry.createTask({
      projectId: project.id,
      title: 'Research for design',
    })

    // Build minimal selected opportunity via analysis (empty → create → decide)
    // Need confirmed evidence chain for analysis createMarketItem path — use opportunity create API after cluster.
    // Simpler path: create opportunity with empty cluster list may fail. Mirror analysis test stubs.
    const source = await ctx.fashionResearchRegistry.createSource({
      projectId: project.id,
      taskId: task.id,
      locatorType: 'url',
      url: 'https://example.com/design-item',
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
      reviewNote: 'confirmed',
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
    const signal = await ctx.fashionAnalysisRegistry.createPopularitySignal({
      projectId: project.id,
      taskId: task.id,
      signalType: 'view_count',
      subjectRefs: [{ type: 'market_item', id: String(item.id) }],
      platform: 'example',
      observedAt: new Date().toISOString(),
      rawValue: '10',
      rawUnit: 'views',
      evidenceIds: [evidence.id],
      methodVersion: 'v0',
      limitations: ['synthetic'],
    })
    const cluster = await ctx.fashionAnalysisRegistry.createTrendCluster({
      projectId: project.id,
      taskId: task.id,
      name: 'User cluster',
      definition: 'Test cluster',
      memberRefs: [{ type: 'market_item', id: String(item.id) }],
      signalIds: [signal.id],
      clusterMethod: 'manual',
      methodVersion: 'v0',
      marketRegions: ['US'],
      timeContext: 'test',
      evidenceGrade: 'G1',
      counterEvidence: [],
      biasesAndGaps: ['synthetic'],
    })
    const opportunity = await ctx.fashionAnalysisRegistry.createDesignOpportunity({
      projectId: project.id,
      taskId: task.id,
      title: 'User opportunity',
      opportunityStatement: 'Explore a utility direction',
      trendClusterIds: [cluster.id],
      targetMarket: 'US',
      targetUserHypothesis: 'Testers',
      category: 'Jacket',
      timing: 'Now',
      commercialHypotheses: ['h1'],
      creativeSpaces: ['c1'],
      saturationRisks: ['s1'],
      copyingOrIpRisks: ['r1'],
      unknowns: ['u1'],
      evidenceGrade: 'G1',
    })
    const decided = await ctx.fashionAnalysisRegistry.decideOpportunity({
      projectId: project.id,
      taskId: task.id,
      opportunityId: opportunity.id,
      expectedRevision: opportunity.revision,
      action: 'selected',
      reasonCodes: ['evidence_sufficient'],
      note: 'selected for design test',
    })

    const briefDraft = await ctx.fashionDesignRegistry.createBriefFromOpportunity({
      projectId: project.id,
      opportunityId: opportunity.id,
      expectedOpportunityRevision: decided.opportunity.revision,
      selectionDecisionId: decided.decision.id,
      market: 'United States',
      season: 'Fall',
      category: 'Utility Jacket',
      targetUser: 'Test users',
      mustKeep: [unknownConstraint('mk1', 'Keep utility cues')],
      mustAvoid: [unknownConstraint('ma1', 'Avoid SKU copy')],
      materialsConstraints: [unknownConstraint('mat1', 'Materials unknown')],
      costConstraints: [unknownConstraint('cost1', 'Cost unknown')],
      productionConstraints: [unknownConstraint('prod1', 'Production unknown')],
      differentiationGoals: [unknownConstraint('diff1', 'Differentiate silhouette')],
      openQuestions: [unknownConstraint('oq1', 'Brand fit open')],
    })
    const brief = await ctx.fashionDesignRegistry.confirmBrief({
      projectId: project.id,
      briefId: briefDraft.id,
      expectedRevision: briefDraft.revision,
    })
    expect(brief.status).toBe('confirmed')

    const set = await ctx.fashionDesignRegistry.createConceptSet({
      projectId: project.id,
      briefId: brief.id,
      expectedBriefRevision: brief.revision,
    })

    const baseFields = {
      projectId: project.id,
      conceptSetId: set.id,
      designIntent: 'Intent',
      silhouette: 'Same silhouette',
      proportionAndLength: 'Same proportion',
      materialDirection: 'Same material',
      constructionAndDetails: ['Same construction'],
      functionalValue: ['Same function'],
      targetUseScenarios: ['Same scenario'],
      originalTransformationNotes: ['Transformed from market cues'],
      productionUnknowns: ['Unknown finish'],
    }

    let setRevision = set.revision
    const c1 = await ctx.fashionDesignRegistry.createConcept({
      ...baseFields,
      expectedConceptSetRevision: setRevision,
      conceptName: 'A',
      colorDirection: 'Red',
    })
    setRevision += 1
    await ctx.fashionDesignRegistry.createConcept({
      ...baseFields,
      expectedConceptSetRevision: setRevision,
      conceptName: 'B',
      colorDirection: 'Blue',
    })
    setRevision += 1
    await ctx.fashionDesignRegistry.createConcept({
      ...baseFields,
      expectedConceptSetRevision: setRevision,
      conceptName: 'C',
      colorDirection: 'Green',
    })
    setRevision += 1

    const colorOnly = ctx.fashionDesignRegistry.evaluateDifferentiation(project.id, set.id)
    expect(colorOnly.passed).toBe(false)
    expect(colorOnly.failureReasons.some(reason => reason.includes('color-only') || reason.includes('structural-hits'))).toBe(true)

    await expect(ctx.fashionDesignRegistry.markConceptSetReviewReady({
      projectId: project.id,
      conceptSetId: set.id,
      expectedRevision: setRevision,
    })).rejects.toBeInstanceOf(FashionDesignDifferentiationFailedError)

    // Fix structural differences on first concept path via revise
    await ctx.fashionDesignRegistry.reviseConcept({
      projectId: project.id,
      conceptId: c1.id,
      expectedRevision: c1.revision,
      silhouette: 'Relaxed body',
      proportionAndLength: 'Hip length',
      materialDirection: 'Cotton twill',
      constructionAndDetails: ['Patch pockets'],
      functionalValue: ['Commute layer'],
      targetUseScenarios: ['City commute'],
    })
    // After revise, set revision bumped and status draft; fetch current
    const setAfter = ctx.fashionDesignRegistry.getConceptSet(project.id, set.id)
    const concepts = ctx.fashionDesignRegistry.listConcepts(project.id, set.id)
    const other = concepts.filter(row => row.id !== c1.id)
    expect(other).toHaveLength(2)
    await ctx.fashionDesignRegistry.reviseConcept({
      projectId: project.id,
      conceptId: other[0]!.id,
      expectedRevision: other[0]!.revision,
      silhouette: 'Boxy cropped',
      proportionAndLength: 'Cropped',
      materialDirection: 'Canvas',
      constructionAndDetails: ['Flap pockets', 'Storm flap'],
      functionalValue: ['Structured layer'],
      targetUseScenarios: ['Editorial daywear'],
    })
    const mid = ctx.fashionDesignRegistry.getConceptSet(project.id, set.id)
    const last = ctx.fashionDesignRegistry.listConcepts(project.id, set.id).find(row =>
      row.id !== c1.id && row.id !== other[0]!.id,
    )!
    await ctx.fashionDesignRegistry.reviseConcept({
      projectId: project.id,
      conceptId: last.id,
      expectedRevision: last.revision,
      silhouette: 'Slim A-line shell',
      proportionAndLength: 'Mid-thigh',
      materialDirection: 'Light technical shell',
      constructionAndDetails: ['Hidden zip', 'Adjustable hem'],
      functionalValue: ['Packable travel'],
      targetUseScenarios: ['Travel transition'],
    })
    const readySet = ctx.fashionDesignRegistry.getConceptSet(project.id, set.id)
    expect(ctx.fashionDesignRegistry.evaluateDifferentiation(project.id, set.id).passed).toBe(true)
    const marked = await ctx.fashionDesignRegistry.markConceptSetReviewReady({
      projectId: project.id,
      conceptSetId: set.id,
      expectedRevision: readySet.revision,
    })
    expect(marked.status).toBe('review_ready')
    void setAfter
    void mid
  })
})
