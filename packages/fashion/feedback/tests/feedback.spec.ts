/**
 * Fashion Feedback registry: R0 recorded feedback, human actor, supersedes, and outcome facts.
 */

import { afterEach, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Storage from '@deepseek-ai/dsh-storage'
import { DomainFacility } from '@deepseek-ai/dsh-storage-domain'
import { MemoryStorageBackend } from '../../../storage/storage-domain/tests/helpers/memory-backend.ts'
import FashionProjectRegistry, { R0_PROJECT_ID } from '@gentlexx/dsh-fashion-project'
import FashionResearchRegistry from '@gentlexx/dsh-fashion-research'
import FashionAnalysisRegistry from '@gentlexx/dsh-fashion-analysis'
import FashionDesignRegistry from '@gentlexx/dsh-fashion-design'
import FashionFeedbackRegistry, {
  FashionFeedbackAvailabilityValueForbiddenError,
  FashionFeedbackHumanRequiredError,
  FashionFeedbackInvalidInputError,
  FashionFeedbackInvalidWindowError,
  FashionFeedbackProjectReadOnlyError,
  FashionFeedbackSupersedesConflictError,
  FashionFeedbackUnitMismatchError,
  R0_AVAILABILITY_ID,
  R0_FEEDBACK_ID,
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
  await ctx.plugin(FashionFeedbackRegistry)
  return ctx
}

const source = {
  sourceKind: 'human_statement' as const,
  ref: 'local-human-note',
  locator: null,
  recordedOrExportedAt: '2026-04-01T00:00:00.000Z',
  usageBoundary: 'project_private',
  contentHash: null,
  providerName: null,
  note: 'Hand entered from a designer note.',
}

describe('FashionFeedbackRegistry', () => {
  it('seeds R0 recorded feedback and not_available, with no synthetic metrics', async () => {
    const ctx = await boot()
    const feedback = ctx.fashionFeedbackRegistry
    const row = feedback.getFeedback(R0_PROJECT_ID, R0_FEEDBACK_ID)
    expect(row.origin).toBe('recorded_seed')
    expect(row.dataReality).toBe('recorded_demo')
    expect(row.action).toBe('modified')
    expect(row.feedbackActor.actorKind).toBe('recorded_demo_human')
    expect(row.reasonCodes).toContain('silhouette_or_proportion')
    expect(row.professionalValidity).toBe('unknown')
    const deliverable = ctx.fashionDesignRegistry.listDeliverables(R0_PROJECT_ID)[0]!
    const availability = feedback.getCurrentOutcomeAvailability(R0_PROJECT_ID, {
      id: String(deliverable.id),
      revision: deliverable.revision,
    })
    expect(availability.current?.id).toBe(R0_AVAILABILITY_ID)
    expect(availability.current?.availability).toBe('not_available')
    expect(availability.current?.reasonCode).toBe('public_rebuild_no_real_launch_data')
    expect(feedback.listDevelopmentTimeline(R0_PROJECT_ID, { id: String(deliverable.id), revision: deliverable.revision })).toEqual([])
    expect(feedback.listMetricObservations(R0_PROJECT_ID, { id: String(deliverable.id), revision: deliverable.revision })).toEqual([])
    expect(JSON.stringify(row)).not.toContain('"value":0')
    await expect(feedback.recordFeedback({
      projectId: R0_PROJECT_ID,
      subjectRef: row.subjectRef,
      expectedSubjectRevision: row.subjectRef.subjectRevision,
      action: 'adopted',
      reasonCodes: [],
      modifications: [],
      professionalValidity: 'unknown',
      revisionEffort: 'none',
      dataReality: 'user_test',
    })).rejects.toBeInstanceOf(FashionFeedbackProjectReadOnlyError)
  })

  it('records local-human feedback, keeps supersedes history, and rejects a stale head', async () => {
    const ctx = await boot()
    const project = await ctx.fashionProjectRegistry.create({ title: 'Feedback project' })
    const deliverable = ctx.fashionDesignRegistry.listDeliverables(R0_PROJECT_ID)[0]!
    const subject = {
      subjectType: 'workflow_step' as const,
      subjectId: 'step-export',
      subjectRevision: 0,
      relatedDeliverableRef: { id: String(deliverable.id), revision: deliverable.revision },
      workflowStep: {
        stepKey: 'export',
        moduleId: 'fashion-design',
        moduleSchemaVersion: 0,
        relatedRefs: [{ id: String(deliverable.id), revision: deliverable.revision }],
      },
    }
    const first = await ctx.fashionFeedbackRegistry.recordFeedback({
      projectId: project.id,
      subjectRef: subject,
      expectedSubjectRevision: 0,
      action: 'rejected',
      reasonCodes: ['other'],
      reasonText: 'Need a clearer handoff.',
      modifications: [],
      professionalValidity: 'partly_valid',
      revisionEffort: 'moderate',
      timeSavedEstimate: 'under_15m',
      dataReality: 'user_test',
    })
    expect(first.feedbackActor.actorKind).toBe('local_human')
    expect(first.dataReality).toBe('user_test')
    const second = await ctx.fashionFeedbackRegistry.supersedeFeedback({
      projectId: project.id,
      subjectRef: subject,
      expectedSubjectRevision: 0,
      action: 'modified',
      reasonCodes: ['handoff_usable'],
      reasonText: 'Corrected after a second look.',
      modifications: [{ area: 'handoff', summary: 'Added measurement notes.', reasonCodes: ['handoff_usable'], artifactRef: null }],
      professionalValidity: 'partly_valid',
      revisionEffort: 'light',
      dataReality: 'user_test',
      supersedesId: first.id,
      expectedHeadId: first.id,
      correctionReason: 'mis-keyed action',
    })
    expect(second.supersedesId).toBe(String(first.id))
    expect(ctx.fashionFeedbackRegistry.getFeedback(project.id, first.id).action).toBe('rejected')
    const summary = ctx.fashionFeedbackRegistry.getFeedbackSummary(project.id)
    expect(summary.current.map(row => row.id)).toEqual([second.id])
    expect(summary.history).toHaveLength(2)
    await expect(ctx.fashionFeedbackRegistry.supersedeFeedback({
      projectId: project.id,
      subjectRef: subject,
      expectedSubjectRevision: 0,
      action: 'adopted',
      reasonCodes: [],
      modifications: [],
      professionalValidity: 'unknown',
      revisionEffort: 'none',
      dataReality: 'user_test',
      supersedesId: first.id,
      expectedHeadId: first.id,
      correctionReason: 'late writer',
    })).rejects.toBeInstanceOf(FashionFeedbackSupersedesConflictError)
    await expect(ctx.fashionFeedbackRegistry.recordFeedback({
      projectId: project.id,
      subjectRef: subject,
      expectedSubjectRevision: 0,
      action: 'ignored',
      reasonCodes: [],
      modifications: [],
      professionalValidity: 'unknown',
      revisionEffort: 'none',
      dataReality: 'user_test',
      actorKind: 'system',
    })).rejects.toBeInstanceOf(FashionFeedbackHumanRequiredError)
    await expect(ctx.fashionFeedbackRegistry.recordFeedback({
      projectId: project.id,
      subjectRef: subject,
      expectedSubjectRevision: 0,
      action: 'adopted',
      reasonCodes: [],
      modifications: [],
      professionalValidity: 'unknown',
      revisionEffort: 'none',
      dataReality: 'real_work',
    })).rejects.toBeInstanceOf(FashionFeedbackInvalidInputError)
  })

  it('keeps unknown availability off zero and refuses a metric until data is available', async () => {
    const ctx = await boot()
    const project = await ctx.fashionProjectRegistry.create({ title: 'Outcome project' })
    const deliverable = ctx.fashionDesignRegistry.listDeliverables(R0_PROJECT_ID)[0]!
    const refs = {
      deliverableRef: { id: String(deliverable.id), revision: deliverable.revision },
      conceptRef: deliverable.selectedConceptRef,
    }
    await expect(ctx.fashionFeedbackRegistry.recordOutcomeAvailability({
      projectId: project.id,
      ...refs,
      availability: 'not_available',
      reasonCode: 'no_store',
      asOf: '2026-04-02T00:00:00.000Z',
      dataReality: 'user_test',
    })).rejects.toBeInstanceOf(Error)

    const ordinary = await ctx.fashionDesignRegistry.listDeliverables(project.id)
    expect(ordinary).toEqual([])
    const created = await ctx.fashionProjectRegistry.create({ title: 'Isolated' })
    expect(ctx.fashionFeedbackRegistry.listFeedback(created.id)).toEqual([])
    expect(ctx.fashionFeedbackRegistry.listFeedback(created.id).some(row => row.id === R0_FEEDBACK_ID)).toBe(false)

    const available = await ctx.fashionFeedbackRegistry.recordOutcomeAvailability({
      projectId: project.id,
      deliverableRef: { id: 'missing-deliverable', revision: 0 },
      conceptRef: { id: 'missing-concept', revision: 0 },
      availability: 'not_yet_observed',
      reasonCode: 'too_early',
      asOf: '2026-04-02T00:00:00.000Z',
      dataReality: 'user_test',
    }).catch(error => error)
    expect(available).toBeInstanceOf(Error)
  })

  it('rejects an inverted window and refuses cross-dimension aggregation', async () => {
    const ctx = await boot()
    const definitions = ctx.fashionFeedbackRegistry.listMetricDefinitions(R0_PROJECT_ID)
    expect(definitions.some(row => row.metricKey === 'gross_sales')).toBe(true)
    expect(definitions.some(row => row.metricKey === 'net_sales')).toBe(true)
    expect(() => ctx.fashionFeedbackRegistry.refuseAutomaticAggregate([{
      id: 'a' as never,
      projectId: R0_PROJECT_ID,
      schemaVersion: 0,
      origin: 'manual_entry',
      dataReality: 'user_test',
      visibility: 'project_private',
      recordedBy: 'local-human',
      recordedAt: '2026-04-01T00:00:00.000Z',
      supersedesId: null,
      correctionReason: null,
      archivedAt: null,
      accessMode: 'editable',
      revision: 0,
      idempotencyKey: null,
      deliverableRef: { id: 'd', revision: 0 },
      conceptRef: { id: 'c', revision: 0 },
      metricDefinitionRef: { metricKey: 'gross_sales', definitionVersion: 'v0' },
      value: { kind: 'decimal_string', value: '1.00' },
      currencyCode: 'USD',
      measurementWindow: { start: '2026-04-01T00:00:00.000Z', end: '2026-04-02T00:00:00.000Z', timezone: 'UTC' },
      observedAt: '2026-04-02T00:00:00.000Z',
      marketRegion: 'US',
      channel: 'web',
      sourceType: 'manual_entry',
      sourceRef: source,
      sourceFieldName: null,
      verificationStatus: 'self_reported',
      dimensions: [],
      limitations: [],
      causalClaim: 'none',
      actor: { actorId: 'local-human', actorKind: 'local_human' },
    }, {
      id: 'b' as never,
      projectId: R0_PROJECT_ID,
      schemaVersion: 0,
      origin: 'manual_entry',
      dataReality: 'user_test',
      visibility: 'project_private',
      recordedBy: 'local-human',
      recordedAt: '2026-04-01T00:00:00.000Z',
      supersedesId: null,
      correctionReason: null,
      archivedAt: null,
      accessMode: 'editable',
      revision: 0,
      idempotencyKey: null,
      deliverableRef: { id: 'd', revision: 0 },
      conceptRef: { id: 'c', revision: 0 },
      metricDefinitionRef: { metricKey: 'gross_sales', definitionVersion: 'v0' },
      value: { kind: 'decimal_string', value: '2.00' },
      currencyCode: 'EUR',
      measurementWindow: { start: '2026-04-01T00:00:00.000Z', end: '2026-04-02T00:00:00.000Z', timezone: 'UTC' },
      observedAt: '2026-04-02T00:00:00.000Z',
      marketRegion: 'US',
      channel: 'web',
      sourceType: 'manual_entry',
      sourceRef: source,
      sourceFieldName: null,
      verificationStatus: 'self_reported',
      dimensions: [],
      limitations: [],
      causalClaim: 'none',
      actor: { actorId: 'local-human', actorKind: 'local_human' },
    }])).toThrow(FashionFeedbackUnitMismatchError)
    expect(FashionFeedbackAvailabilityValueForbiddenError).toBeTypeOf('function')
    expect(FashionFeedbackInvalidWindowError).toBeTypeOf('function')
  })

  it('records availability, a stage correction, and one sourced metric on an ordinary deliverable', async () => {
    const ctx = await boot()
    const { project, set, cropped } = await readyThreeDirectionSet(ctx)
    const design = ctx.fashionDesignRegistry
    const round = await design.openReview({
      projectId: project.id,
      conceptSetId: set.id,
      expectedConceptSetRevision: set.revision,
    })
    const live = design.getConcept(project.id, cropped.id)
    await design.selectConcept({
      projectId: project.id,
      reviewRoundId: round.id,
      conceptId: live.id,
      expectedConceptRevision: live.revision,
      reasonCodes: ['originality'],
      reasonText: 'Cropped read is clearest',
    })
    await design.approveSelectedConcept({
      projectId: project.id,
      reviewRoundId: round.id,
      reasonCodes: ['evidence_sufficient'],
      reasonText: 'Approve cropped for handoff',
    })
    const deliverable = await design.generateDeliverable({
      projectId: project.id,
      reviewRoundId: round.id,
      audienceProfile: 'internal_review',
      idempotencyKey: 'feedback-gen-1',
    })
    const refs = {
      deliverableRef: { id: String(deliverable.id), revision: deliverable.revision },
      conceptRef: deliverable.selectedConceptRef,
    }
    const blocked = await ctx.fashionFeedbackRegistry.recordOutcomeAvailability({
      projectId: project.id,
      ...refs,
      availability: 'not_available',
      reasonCode: 'no_store',
      asOf: '2026-04-02T00:00:00.000Z',
      dataReality: 'user_test',
      recordedAt: '2026-04-02T00:00:00.000Z',
    })
    expect(JSON.stringify(blocked)).not.toMatch(/"value"\s*:\s*0/)
    await expect(ctx.fashionFeedbackRegistry.recordMetricObservation({
      projectId: project.id,
      ...refs,
      metricKey: 'units_sold',
      definitionVersion: 'v0',
      value: { kind: 'integer', value: 0 },
      measurementWindow: {
        start: '2026-04-01T00:00:00.000Z',
        end: '2026-04-08T00:00:00.000Z',
        timezone: 'UTC',
      },
      observedAt: '2026-04-08T00:00:00.000Z',
      marketRegion: 'US',
      channel: 'web',
      sourceType: 'manual_entry',
      sourceRef: source,
      verificationStatus: 'self_reported',
      dimensions: ['marketRegion', 'channel'],
      limitations: ['user test'],
      dataReality: 'user_test',
    })).rejects.toBeInstanceOf(FashionFeedbackAvailabilityValueForbiddenError)

    const opened = await ctx.fashionFeedbackRegistry.recordOutcomeAvailability({
      projectId: project.id,
      ...refs,
      availability: 'available_partial',
      reasonCode: 'manual_note',
      asOf: '2026-04-09T00:00:00.000Z',
      dataReality: 'user_test',
      recordedAt: '2026-04-09T00:00:00.000Z',
    })
    expect(ctx.fashionFeedbackRegistry.getCurrentOutcomeAvailability(project.id, refs.deliverableRef).current?.id).toBe(opened.id)
    expect(ctx.fashionFeedbackRegistry.listOutcomeAvailabilityHistory(project.id, refs.deliverableRef)).toHaveLength(2)

    const sampled = await ctx.fashionFeedbackRegistry.recordDevelopmentEvent({
      projectId: project.id,
      ...refs,
      stage: 'sampled',
      occurredAt: '2026-04-03T00:00:00.000Z',
      businessContext: 'First sample, not a pass.',
      sourceType: 'manual_entry',
      sourceRef: source,
      verificationStatus: 'self_reported',
      limitations: ['sample is not approval'],
      dataReality: 'user_test',
      recordedAt: '2026-04-03T01:00:00.000Z',
    })
    const corrected = await ctx.fashionFeedbackRegistry.recordDevelopmentEvent({
      projectId: project.id,
      ...refs,
      stage: 'revised_after_sample',
      occurredAt: '2026-04-03T00:00:00.000Z',
      businessContext: 'Corrected stage after the same sample.',
      sourceType: 'manual_entry',
      sourceRef: source,
      verificationStatus: 'self_reported',
      limitations: ['correction'],
      dataReality: 'user_test',
      supersedesId: String(sampled.id),
      expectedHeadId: String(sampled.id),
      correctionReason: 'stage was mis-keyed',
      recordedAt: '2026-04-04T00:00:00.000Z',
    })
    const stage = ctx.fashionFeedbackRegistry.getCurrentDevelopmentStage(project.id, refs.deliverableRef)
    expect(stage.current?.id).toBe(corrected.id)
    expect(stage.timeline).toHaveLength(2)
    expect(stage.current?.stage).not.toBe('selling')

    const point = await ctx.fashionFeedbackRegistry.recordMetricObservation({
      projectId: project.id,
      ...refs,
      metricKey: 'gross_sales',
      definitionVersion: 'v0',
      value: { kind: 'decimal_string', value: '12.50' },
      currencyCode: 'USD',
      measurementWindow: {
        start: '2026-04-01T00:00:00.000Z',
        end: '2026-04-08T00:00:00.000Z',
        timezone: 'UTC',
      },
      observedAt: '2026-04-08T00:00:00.000Z',
      marketRegion: 'US',
      channel: 'web',
      sourceType: 'manual_entry',
      sourceRef: source,
      verificationStatus: 'self_reported',
      dimensions: ['marketRegion', 'channel'],
      limitations: ['manual note, not an API'],
      dataReality: 'user_test',
    })
    expect(point.causalClaim).toBe('none')
    expect(point.currencyCode).toBe('USD')
    const timeline = ctx.fashionFeedbackRegistry.getOutcomeTimeline(project.id, refs.deliverableRef)
    expect(timeline.metrics).toHaveLength(1)
    expect(JSON.stringify(timeline)).not.toContain('"total"')
    await expect(ctx.fashionFeedbackRegistry.recordMetricObservation({
      ...{
        projectId: project.id,
        ...refs,
        metricKey: 'gross_sales',
        definitionVersion: 'v0',
        value: { kind: 'decimal_string', value: '1.00' },
        currencyCode: 'USD',
        measurementWindow: {
          start: '2026-04-08T00:00:00.000Z',
          end: '2026-04-01T00:00:00.000Z',
          timezone: 'UTC',
        },
        observedAt: '2026-04-08T00:00:00.000Z',
        marketRegion: 'US',
        channel: 'web',
        sourceType: 'manual_entry' as const,
        sourceRef: source,
        verificationStatus: 'self_reported' as const,
        dimensions: [],
        limitations: [],
        dataReality: 'user_test' as const,
      },
    })).rejects.toBeInstanceOf(FashionFeedbackInvalidWindowError)
    expect(design.getDeliverable(project.id, deliverable.id).revision).toBe(deliverable.revision)
  })

  it('stores one feedback and one availability record when the same draft key is submitted twice', async () => {
    const ctx = await boot()
    const { project, set, cropped } = await readyThreeDirectionSet(ctx)
    const design = ctx.fashionDesignRegistry
    const round = await design.openReview({ projectId: project.id, conceptSetId: set.id, expectedConceptSetRevision: set.revision })
    const live = design.getConcept(project.id, cropped.id)
    await design.selectConcept({
      projectId: project.id,
      reviewRoundId: round.id,
      conceptId: live.id,
      expectedConceptRevision: live.revision,
      reasonCodes: ['originality'],
      reasonText: 'Cropped read is clearest',
    })
    await design.approveSelectedConcept({
      projectId: project.id,
      reviewRoundId: round.id,
      reasonCodes: ['evidence_sufficient'],
      reasonText: 'Approve cropped for handoff',
    })
    const deliverable = await design.generateDeliverable({
      projectId: project.id,
      reviewRoundId: round.id,
      audienceProfile: 'internal_review',
      idempotencyKey: 'feedback-idem-gen',
    })
    const feedbackInput = {
      projectId: project.id,
      subjectRef: {
        subjectType: 'deliverable' as const,
        subjectId: String(deliverable.id),
        subjectRevision: deliverable.revision,
        relatedDeliverableRef: null,
        workflowStep: null,
      },
      expectedSubjectRevision: deliverable.revision,
      action: 'modified' as const,
      reasonCodes: [],
      reasonText: 'Shorten the hem.',
      modifications: [],
      professionalValidity: 'partly_valid' as const,
      revisionEffort: 'light' as const,
      dataReality: 'user_test' as const,
      idempotencyKey: 'draft-feedback-1',
    }
    const first = await ctx.fashionFeedbackRegistry.recordFeedback(feedbackInput)
    const repeat = await ctx.fashionFeedbackRegistry.recordFeedback(feedbackInput)
    expect(repeat.id).toBe(first.id)
    expect(ctx.fashionFeedbackRegistry.listFeedback(project.id)).toHaveLength(1)

    const refs = {
      deliverableRef: { id: String(deliverable.id), revision: deliverable.revision },
      conceptRef: deliverable.selectedConceptRef,
    }
    const availabilityInput = {
      projectId: project.id,
      ...refs,
      availability: 'not_yet_observed' as const,
      reasonCode: 'not_launched',
      asOf: '2026-04-02T00:00:00.000Z',
      dataReality: 'user_test' as const,
      idempotencyKey: 'draft-availability-1',
    }
    const stated = await ctx.fashionFeedbackRegistry.recordOutcomeAvailability(availabilityInput)
    const restated = await ctx.fashionFeedbackRegistry.recordOutcomeAvailability(availabilityInput)
    expect(restated.id).toBe(stated.id)
    expect(ctx.fashionFeedbackRegistry.listOutcomeAvailabilityHistory(project.id, refs.deliverableRef)).toHaveLength(1)

    const concurrentFeedback = { ...feedbackInput, idempotencyKey: 'draft-feedback-2' }
    const [feedbackA, feedbackB] = await Promise.all([
      ctx.fashionFeedbackRegistry.recordFeedback(concurrentFeedback),
      ctx.fashionFeedbackRegistry.recordFeedback(concurrentFeedback),
    ])
    expect(feedbackB.id).toBe(feedbackA.id)
    expect(ctx.fashionFeedbackRegistry.listFeedback(project.id)).toHaveLength(2)

    const concurrentAvailability = { ...availabilityInput, idempotencyKey: 'draft-availability-2' }
    const [availabilityA, availabilityB] = await Promise.all([
      ctx.fashionFeedbackRegistry.recordOutcomeAvailability(concurrentAvailability),
      ctx.fashionFeedbackRegistry.recordOutcomeAvailability(concurrentAvailability),
    ])
    expect(availabilityB.id).toBe(availabilityA.id)
    expect(ctx.fashionFeedbackRegistry.listOutcomeAvailabilityHistory(project.id, refs.deliverableRef)).toHaveLength(2)
  })
})

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

async function readyThreeDirectionSet(ctx: Context) {
  const project = await ctx.fashionProjectRegistry.create({ title: 'Ordinary feedback flow' })
  const task = await ctx.fashionResearchRegistry.createTask({
    projectId: project.id,
    title: 'Ordinary research',
  })
  const researchSource = await ctx.fashionResearchRegistry.createSource({
    projectId: project.id,
    taskId: task.id,
    locatorType: 'url',
    url: 'https://example.com/feedback-item',
    title: 'Feedback source',
    sourceKind: 'product_page',
    captureMode: 'manual_link',
    usageBoundary: 'view_only',
    externalProcessing: 'denied',
    attribution: 'manual',
  })
  const sample = await ctx.fashionResearchRegistry.createSample({
    projectId: project.id,
    taskId: task.id,
    sourceId: researchSource.id,
    label: 'Feedback sample',
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
    displayName: 'Feedback market item',
    observationLinks: [{
      sampleId: sample.id,
      sourceId: researchSource.id,
      evidenceIds: [evidence.id],
    }],
  })
  const signal = await ctx.fashionAnalysisRegistry.createPopularitySignal({
    projectId: project.id,
    taskId: task.id,
    signalType: 'view_count',
    subjectRefs: [{ type: 'market_item', id: String(item.id) }],
    platform: 'example',
    observedAt: '2026-04-01T00:00:00.000Z',
    rawValue: '10',
    rawUnit: 'views',
    evidenceIds: [evidence.id],
    methodVersion: 'v0',
    limitations: ['synthetic'],
  })
  const cluster = await ctx.fashionAnalysisRegistry.createTrendCluster({
    projectId: project.id,
    taskId: task.id,
    name: 'Feedback cluster',
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
    title: 'Ordinary opportunity',
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
    note: 'selected',
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
  const set = await ctx.fashionDesignRegistry.createConceptSet({
    projectId: project.id,
    briefId: brief.id,
    expectedBriefRevision: brief.revision,
  })
  let setRevision = set.revision
  await ctx.fashionDesignRegistry.createConcept({
    projectId: project.id,
    conceptSetId: set.id,
    expectedConceptSetRevision: setRevision,
    conceptName: 'Urban',
    designIntent: 'Commute layer',
    silhouette: 'Relaxed body',
    proportionAndLength: 'Hip length',
    materialDirection: 'Cotton twill',
    colorDirection: 'Khaki',
    constructionAndDetails: ['Patch pockets'],
    functionalValue: ['Commute layer'],
    targetUseScenarios: ['City commute'],
    originalTransformationNotes: ['Transformed'],
    productionUnknowns: ['Unknown finish'],
  })
  setRevision += 1
  const cropped = await ctx.fashionDesignRegistry.createConcept({
    projectId: project.id,
    conceptSetId: set.id,
    expectedConceptSetRevision: setRevision,
    conceptName: 'Cropped',
    designIntent: 'Editorial crop',
    silhouette: 'Boxy cropped',
    proportionAndLength: 'Cropped',
    materialDirection: 'Canvas',
    colorDirection: 'Sand',
    constructionAndDetails: ['Flap pockets', 'Storm flap'],
    functionalValue: ['Structured layer'],
    targetUseScenarios: ['Editorial daywear'],
    originalTransformationNotes: ['Cropped read'],
    productionUnknowns: ['Unknown trim'],
  })
  setRevision += 1
  await ctx.fashionDesignRegistry.createConcept({
    projectId: project.id,
    conceptSetId: set.id,
    expectedConceptSetRevision: setRevision,
    conceptName: 'Light',
    designIntent: 'Soft shell',
    silhouette: 'Soft A-line',
    proportionAndLength: 'Mid thigh',
    materialDirection: 'Nylon shell',
    colorDirection: 'Stone',
    constructionAndDetails: ['Hidden zip'],
    functionalValue: ['Light weather'],
    targetUseScenarios: ['Travel'],
    originalTransformationNotes: ['Softened'],
    productionUnknowns: ['Unknown coating'],
  })
  setRevision += 1
  const ready = await ctx.fashionDesignRegistry.markConceptSetReviewReady({
    projectId: project.id,
    conceptSetId: set.id,
    expectedRevision: setRevision,
  })
  return { project, set: ready, cropped }
}
