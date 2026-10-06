/**
 * Fashion Feedback registry (`ctx.fashionFeedbackRegistry`) over `fashion_feedback@0`.
 * Reads upstream exact refs only through public registries. Does not write F2/F3 storage.
 * @module @gentlexx/dsh-fashion-feedback/src/registry
 */

import { randomUUID } from 'node:crypto'
import { Context, Service } from '@deepseek-ai/cordis'
import { R0_PROJECT_ID } from '@gentlexx/dsh-fashion-project'
import type { ProjectId } from '@gentlexx/dsh-fashion-project/types'
import { DesignDeliverableId as brandDeliverableId } from '@gentlexx/dsh-fashion-design'
import '@gentlexx/dsh-fashion-research'
import '@gentlexx/dsh-fashion-analysis'
import type { KvTable } from '@deepseek-ai/dsh-storage-domain'
import { METRIC_CATALOG } from './catalog.ts'
import {
  FashionFeedbackAvailabilityValueForbiddenError,
  FashionFeedbackCrossProjectError,
  FashionFeedbackCurrencyRequiredError,
  FashionFeedbackHumanRequiredError,
  FashionFeedbackIdCollisionError,
  FashionFeedbackInvalidInputError,
  FashionFeedbackInvalidWindowError,
  FashionFeedbackMetricDefinitionMismatchError,
  FashionFeedbackNotFoundError,
  FashionFeedbackProjectNotFoundError,
  FashionFeedbackProjectReadOnlyError,
  FashionFeedbackRevisionConflictError,
  FashionFeedbackSeedConflictError,
  FashionFeedbackSourceRequiredError,
  FashionFeedbackSupersedesConflictError,
  FashionFeedbackTargetRevisionMissingError,
  FashionFeedbackTargetStaleError,
  FashionFeedbackUnitMismatchError,
} from './errors.ts'
import {
  DesignerFeedbackId as brandFeedbackId,
  DevelopmentEventId as brandEventId,
  OutcomeAvailabilityId as brandAvailabilityId,
  OutcomeMetricDefinitionId as brandDefinitionId,
  OutcomeMetricObservationId as brandObservationId,
} from './ids.ts'
import { compareFeedbackRecordedDesc } from './order.ts'
import type {
  DesignerFeedbackRecordV0,
  DevelopmentEventRecordV0,
  OutcomeAvailabilityRecordV0,
  OutcomeMetricDefinitionRecordV0,
  OutcomeMetricObservationRecordV0,
} from './schema/v0/records.ts'
import { fashionFeedbackDomainSpec } from './spec.ts'
import type {
  CurrentDevelopmentStage,
  CurrentOutcomeAvailability,
  DesignerFeedback,
  DesignerFeedbackId,
  DevelopmentEvent,
  DevelopmentEventId,
  ExactSubjectRef,
  FeedbackAction,
  FeedbackActor,
  FeedbackDataReality,
  FeedbackModification,
  FeedbackOrigin,
  FeedbackReasonCode,
  FeedbackSubjectRef,
  FeedbackSummary,
  FeedbackVisibility,
  MeasurementWindow,
  MetricValue,
  OutcomeAvailability,
  OutcomeAvailabilityId,
  OutcomeAvailabilityState,
  OutcomeMetricDefinitionId,
  OutcomeMetricDefinitionRef,
  OutcomeMetricObservation,
  OutcomeMetricObservationId,
  OutcomeSourceRef,
  OutcomeSourceType,
  OutcomeTimeline,
  ProfessionalValidity,
  RevisionEffort,
  TimeSavedEstimate,
  VerificationStatus,
} from './types.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    fashionFeedbackRegistry: FashionFeedbackRegistry
  }
}

/** Fixed R0 recorded feedback id. */
export const R0_FEEDBACK_ID = brandFeedbackId('r0-feedback-cropped-modified')

/** Fixed R0 not_available outcome id. */
export const R0_AVAILABILITY_ID = brandAvailabilityId('r0-outcome-availability-not-available')

const R0_DELIVERABLE_ID = 'r0-deliverable-public-portfolio'
const R0_RECORDED_AT = '2026-03-01T00:00:00.000Z'
const BLOCKING_AVAILABILITY = new Set(['not_yet_observed', 'not_available', 'not_authorized'])
const REASON_REQUIRED = new Set<FeedbackAction>(['modified', 'rejected', 'ignored', 'unable_to_assess'])
const CURRENCY_UNITS = new Set(['currency'])

function mintId<T extends string>(brand: (id: string) => T, occupied: (id: T) => boolean): T {
  let id = brand(randomUUID())
  if (!occupied(id)) return id
  id = brand(randomUUID())
  if (occupied(id)) throw new FashionFeedbackIdCollisionError(String(id))
  return id
}

function tableHas<K extends string, V>(table: KvTable<K, V>, id: K): boolean {
  return table.get(id) !== undefined
}

function localHuman(): FeedbackActor {
  return { actorId: 'local-human', actorKind: 'local_human' }
}

function recordedDemoActor(): FeedbackActor {
  return { actorId: 'recorded-demo', actorKind: 'recorded_demo_human' }
}

/**
 * Host Fashion Feedback registry over Storage Domain `fashion_feedback@0`.
 */
export class FashionFeedbackRegistry extends Service {
  static inject = [
    'storageDomain',
    'fashionProjectRegistry',
    'fashionResearchRegistry',
    'fashionAnalysisRegistry',
    'fashionDesignRegistry',
  ]

  private feedback?: KvTable<DesignerFeedbackId, DesignerFeedbackRecordV0>
  private availability?: KvTable<OutcomeAvailabilityId, OutcomeAvailabilityRecordV0>
  private events?: KvTable<DevelopmentEventId, DevelopmentEventRecordV0>
  private definitions?: KvTable<OutcomeMetricDefinitionId, OutcomeMetricDefinitionRecordV0>
  private observations?: KvTable<OutcomeMetricObservationId, OutcomeMetricObservationRecordV0>
  private keyedWriteTail: Promise<void> = Promise.resolve()

  /** @param ctx - Host context. */
  constructor(ctx: Context) {
    super(ctx, 'fashionFeedbackRegistry')
  }

  /** Open the domain, publish the metric catalog, and ensure the R0 seed. */
  protected async [Service.init](): Promise<void> {
    const domain = await this.ctx.storageDomain.open(fashionFeedbackDomainSpec)
    this.ctx.effect(() => () => domain.close(), 'fashionFeedback.domainClose')
    this.feedback = domain.table('designer_feedback')
    this.availability = domain.table('outcome_availability')
    this.events = domain.table('development_events')
    this.definitions = domain.table('outcome_metric_definitions')
    this.observations = domain.table('outcome_metric_observations')
    await this.ensureCatalog()
    await this.ensureR0Seed()
  }

  /**
   * Record designer feedback. Host stamps local_human. Clients cannot set actorKind.
   * @param input - Feedback fields without an actor kind.
   */
  recordFeedback(input: FeedbackWrite): Promise<DesignerFeedback> {
    return this.serializeKeyedWrite(async () => {
      this.requireEditableProject(input.projectId)
      this.rejectForeignActor(input.actorKind)
      const subject = this.resolveSubject(input.projectId, input.subjectRef, input.expectedSubjectRevision)
      this.requireReasons(input.action, input.reasonCodes, input.reasonText)
      this.requireReality(input.dataReality, input.confirmedRealWork)
      const existing = this.findIdempotent(this.requireFeedback(), input.projectId, input.idempotencyKey)
      if (existing !== undefined) return this.toFeedback(existing.id, existing.record)
      const now = input.recordedAt ?? new Date().toISOString()
      const id = mintId(brandFeedbackId, candidate => tableHas(this.requireFeedback(), candidate))
      const record = this.feedbackRecord(input, subject, now, null, null)
      await this.requireFeedback().put(id, record)
      return this.toFeedback(id, record)
    })
  }

  /**
   * Append a superseding feedback. The previous row stays readable.
   * @param input - New feedback plus the expected current head.
   */
  supersedeFeedback(input: FeedbackWrite & {
    supersedesId: DesignerFeedbackId
    expectedHeadId: DesignerFeedbackId
    correctionReason: string
  }): Promise<DesignerFeedback> {
    return this.serializeKeyedWrite(async () => {
      this.requireEditableProject(input.projectId)
      this.rejectForeignActor(input.actorKind)
      const existing = this.findIdempotent(this.requireFeedback(), input.projectId, input.idempotencyKey)
      if (existing !== undefined) return this.toFeedback(existing.id, existing.record)
      const previous = this.requireFeedbackInProject(input.supersedesId, input.projectId)
      const head = this.chainHead(this.requireFeedback(), input.supersedesId)
      if (String(head) !== String(input.expectedHeadId)) {
        throw new FashionFeedbackSupersedesConflictError(String(input.expectedHeadId), String(head))
      }
      const subject = this.resolveSubject(input.projectId, input.subjectRef, input.expectedSubjectRevision)
      this.requireReasons(input.action, input.reasonCodes, input.reasonText)
      this.requireReality(input.dataReality, input.confirmedRealWork)
      const now = input.recordedAt ?? new Date().toISOString()
      const id = mintId(brandFeedbackId, candidate => tableHas(this.requireFeedback(), candidate))
      const record = this.feedbackRecord(input, subject, now, String(previous.id), input.correctionReason)
      await this.requireFeedback().put(id, record)
      return this.toFeedback(id, record)
    })
  }

  /**
   * Read one feedback row.
   * @param projectId - Expected project.
   * @param feedbackId - Feedback identity.
   */
  getFeedback(projectId: ProjectId, feedbackId: DesignerFeedbackId): DesignerFeedback {
    return this.toFeedback(feedbackId, this.requireFeedbackInProject(feedbackId, projectId))
  }

  /**
   * List feedback for a project, newest first.
   * @param projectId - Owning project.
   */
  listFeedback(projectId: ProjectId): readonly DesignerFeedback[] {
    this.requireProject(projectId)
    const rows: DesignerFeedback[] = []
    for (const [id, record] of this.requireFeedback().entries()) {
      if (record.projectId !== String(projectId)) continue
      rows.push(this.toFeedback(id, record))
    }
    rows.sort(compareFeedbackRecordedDesc)
    return rows
  }

  /**
   * Record outcome availability. Unknown states carry no numeric value.
   * @param input - Availability statement.
   */
  recordOutcomeAvailability(input: AvailabilityWrite): Promise<OutcomeAvailability> {
    return this.serializeKeyedWrite(async () => {
      this.requireEditableProject(input.projectId)
      this.rejectForeignActor(input.actorKind)
      this.resolveDeliverablePair(input.projectId, input.deliverableRef, input.conceptRef)
      const existing = this.findIdempotent(this.requireAvailability(), input.projectId, input.idempotencyKey)
      if (existing !== undefined) return this.toAvailability(existing.id, existing.record)
      const now = input.recordedAt ?? new Date().toISOString()
      const id = mintId(brandAvailabilityId, candidate => tableHas(this.requireAvailability(), candidate))
      const record: OutcomeAvailabilityRecordV0 = {
        ...this.envelope(input, now, input.supersedesId ?? null, input.correctionReason ?? null),
        deliverableRef: input.deliverableRef,
        conceptRef: input.conceptRef,
        availability: input.availability,
        reasonCode: input.reasonCode,
        reasonText: input.reasonText ?? null,
        expectedAfter: input.expectedAfter ?? null,
        asOf: input.asOf,
        actor: localHuman(),
      }
      if (input.supersedesId !== undefined) {
        this.requireAvailabilityInProject(brandAvailabilityId(input.supersedesId), input.projectId)
        this.assertHead(this.requireAvailability(), input.supersedesId, input.expectedHeadId)
      }
      await this.requireAvailability().put(id, record)
      return this.toAvailability(id, record)
    })
  }

  /**
   * Current availability for one deliverable, plus history.
   * @param projectId - Owning project.
   * @param deliverableRef - Exact deliverable.
   */
  getCurrentOutcomeAvailability(projectId: ProjectId, deliverableRef: ExactSubjectRef): CurrentOutcomeAvailability {
    const history = this.listOutcomeAvailabilityHistory(projectId, deliverableRef)
    const heads = history.filter(row => !history.some(other => other.supersedesId === String(row.id)))
    const current = [...heads].sort(compareFeedbackRecordedDesc)[0] ?? null
    return { projectId, deliverableRef, current, history }
  }

  /**
   * Availability history for one deliverable.
   * @param projectId - Owning project.
   * @param deliverableRef - Exact deliverable.
   */
  listOutcomeAvailabilityHistory(projectId: ProjectId, deliverableRef: ExactSubjectRef): readonly OutcomeAvailability[] {
    this.requireProject(projectId)
    const rows: OutcomeAvailability[] = []
    for (const [id, record] of this.requireAvailability().entries()) {
      if (record.projectId !== String(projectId)) continue
      if (record.deliverableRef.id !== deliverableRef.id) continue
      rows.push(this.toAvailability(id, record))
    }
    rows.sort(compareFeedbackRecordedDesc)
    return rows
  }

  /**
   * Append a development event. listed and selling do not create sales numbers.
   * @param input - Event fields.
   */
  recordDevelopmentEvent(input: DevelopmentWrite): Promise<DevelopmentEvent> {
    return this.serializeKeyedWrite(async () => {
      this.requireEditableProject(input.projectId)
      this.rejectForeignActor(input.actorKind)
      this.resolveDeliverablePair(input.projectId, input.deliverableRef, input.conceptRef)
      const existing = this.findIdempotent(this.requireEvents(), input.projectId, input.idempotencyKey)
      if (existing !== undefined) return this.toEvent(existing.id, existing.record)
      this.requireSource(input.sourceType, input.sourceRef)
      if (input.stage === 'stopped' && input.limitations.length === 0 && (input.correctionReason ?? '') === '') {
        throw new FashionFeedbackInvalidInputError('stopped-reason-required')
      }
      if (input.supersedesId !== undefined) {
        this.requireEventInProject(brandEventId(input.supersedesId), input.projectId)
        this.assertHead(this.requireEvents(), input.supersedesId, input.expectedHeadId)
        if ((input.correctionReason ?? '').trim() === '') {
          throw new FashionFeedbackInvalidInputError('correction-reason-required')
        }
      }
      const now = input.recordedAt ?? new Date().toISOString()
      const id = mintId(brandEventId, candidate => tableHas(this.requireEvents(), candidate))
      const record: DevelopmentEventRecordV0 = {
        ...this.envelope(input, now, input.supersedesId ?? null, input.correctionReason ?? null),
        deliverableRef: input.deliverableRef,
        conceptRef: input.conceptRef,
        stage: input.stage,
        occurredAt: input.occurredAt,
        marketRegion: input.marketRegion ?? null,
        channel: input.channel ?? null,
        businessContext: input.businessContext,
        sourceType: input.sourceType,
        sourceRef: input.sourceRef,
        verificationStatus: input.verificationStatus,
        limitations: [...input.limitations],
        actor: localHuman(),
      }
      await this.requireEvents().put(id, record)
      return this.toEvent(id, record)
    })
  }

  /**
   * Current stage projection. Same occurredAt uses later recordedAt, then greater id.
   * @param projectId - Owning project.
   * @param deliverableRef - Exact deliverable.
   */
  getCurrentDevelopmentStage(projectId: ProjectId, deliverableRef: ExactSubjectRef): CurrentDevelopmentStage {
    const timeline = this.listDevelopmentTimeline(projectId, deliverableRef)
    const heads = timeline.filter(row => !timeline.some(other => other.supersedesId === String(row.id)))
    const current = [...heads].sort(compareDevelopmentCurrent)[0] ?? null
    return { projectId, deliverableRef, current, timeline }
  }

  /**
   * Full development timeline, including superseded events.
   * @param projectId - Owning project.
   * @param deliverableRef - Exact deliverable.
   */
  listDevelopmentTimeline(projectId: ProjectId, deliverableRef: ExactSubjectRef): readonly DevelopmentEvent[] {
    this.requireProject(projectId)
    const rows: DevelopmentEvent[] = []
    for (const [id, record] of this.requireEvents().entries()) {
      if (record.projectId !== String(projectId)) continue
      if (record.deliverableRef.id !== deliverableRef.id) continue
      rows.push(this.toEvent(id, record))
    }
    rows.sort(compareDevelopmentCurrent)
    return rows
  }

  /** @param projectId - Optional project scope. Catalog rows are always included. */
  listMetricDefinitions(projectId: ProjectId | null): readonly OutcomeMetricDefinitionRef[] {
    if (projectId !== null) this.requireProject(projectId)
    const rows: OutcomeMetricDefinitionRef[] = []
    for (const [id, record] of this.requireDefinitions().entries()) {
      if (record.scope === 'project' && record.projectId !== (projectId === null ? null : String(projectId))) continue
      rows.push(this.toDefinition(id, record))
    }
    return rows
  }

  /**
   * Publish a project-scoped custom metric. Free-text “index” names still need definition, unit, and limitations.
   * @param input - Custom definition.
   */
  async createProjectMetricDefinition(input: {
    projectId: ProjectId
    metricKey: string
    displayName: string
    valueType: OutcomeMetricDefinitionRecordV0['valueType']
    unit: string
    description: string
    limitations: readonly string[]
    actorKind?: string
  }): Promise<OutcomeMetricDefinitionRef> {
    this.requireEditableProject(input.projectId)
    this.rejectForeignActor(input.actorKind)
    if (input.limitations.length === 0) throw new FashionFeedbackInvalidInputError('custom-metric-limitations-required')
    if (input.metricKey.trim() === '' || input.unit.trim() === '') {
      throw new FashionFeedbackInvalidInputError('custom-metric-incomplete')
    }
    const id = brandDefinitionId(`project-${String(input.projectId)}-${input.metricKey}-v1`)
    if (tableHas(this.requireDefinitions(), id)) throw new FashionFeedbackRevisionConflictError('definition-exists')
    const record: OutcomeMetricDefinitionRecordV0 = {
      projectId: String(input.projectId),
      metricKey: input.metricKey,
      definitionVersion: 'project-v1',
      displayName: input.displayName,
      valueType: input.valueType,
      unit: input.unit,
      aggregationSemantics: 'point',
      description: input.description,
      requiredDimensions: ['marketRegion', 'channel'],
      scope: 'project',
      limitations: [...input.limitations],
      schemaVersion: 0,
    }
    await this.requireDefinitions().put(id, record)
    return this.toDefinition(id, record)
  }

  /**
   * Record one metric observation. Refused while availability is unknown, unauthorized, or unavailable.
   * @param input - One metric point.
   */
  recordMetricObservation(input: MetricWrite): Promise<OutcomeMetricObservation> {
    return this.serializeKeyedWrite(async () => {
      this.requireEditableProject(input.projectId)
      this.rejectForeignActor(input.actorKind)
      if (input.causalClaim !== undefined && input.causalClaim !== 'none') {
        throw new FashionFeedbackInvalidInputError('causal-claim-forbidden')
      }
      if (input.sourceType !== 'manual_entry' && input.sourceType !== 'authorized_export') {
        throw new FashionFeedbackInvalidInputError('official-api-refused')
      }
      this.resolveDeliverablePair(input.projectId, input.deliverableRef, input.conceptRef)
      const existing = this.findIdempotent(this.requireObservations(), input.projectId, input.idempotencyKey)
      if (existing !== undefined) return this.toObservation(existing.id, existing.record)
      const current = this.getCurrentOutcomeAvailability(input.projectId, input.deliverableRef).current
      if (current !== null && BLOCKING_AVAILABILITY.has(current.availability) && input.value.kind !== 'unavailable') {
        throw new FashionFeedbackAvailabilityValueForbiddenError(current.availability)
      }
      const definition = this.requireDefinition(input.projectId, input.metricKey, input.definitionVersion)
      this.requireMetricValue(definition, input.value, input.currencyCode)
      this.requireWindow(input.measurementWindow)
      this.requireSource(input.sourceType, input.sourceRef)
      if (input.marketRegion.trim() === '' || input.channel.trim() === '') {
        throw new FashionFeedbackInvalidInputError('region-channel-required')
      }
      if (input.supersedesId !== undefined) {
        this.requireObservationInProject(brandObservationId(input.supersedesId), input.projectId)
        this.assertHead(this.requireObservations(), input.supersedesId, input.expectedHeadId)
      }
      const now = input.recordedAt ?? new Date().toISOString()
      const id = mintId(brandObservationId, candidate => tableHas(this.requireObservations(), candidate))
      const record: OutcomeMetricObservationRecordV0 = {
        ...this.envelope(input, now, input.supersedesId ?? null, input.correctionReason ?? null),
        deliverableRef: input.deliverableRef,
        conceptRef: input.conceptRef,
        metricDefinitionRef: { metricKey: input.metricKey, definitionVersion: input.definitionVersion },
        value: input.value,
        currencyCode: input.currencyCode ?? null,
        measurementWindow: input.measurementWindow,
        observedAt: input.observedAt,
        marketRegion: input.marketRegion,
        channel: input.channel,
        sourceType: input.sourceType,
        sourceRef: input.sourceRef,
        sourceFieldName: input.sourceFieldName ?? null,
        verificationStatus: input.verificationStatus,
        dimensions: [...input.dimensions],
        limitations: [...input.limitations],
        causalClaim: 'none',
        actor: localHuman(),
      }
      await this.requireObservations().put(id, record)
      return this.toObservation(id, record)
    })
  }

  /**
   * Replace a restricted source with an unavailable tombstone. The old row stays.
   * @param input - Observation to supersede and the withdrawal reason.
   */
  async restrictSource(input: {
    projectId: ProjectId
    observationId: OutcomeMetricObservationId
    expectedHeadId: string
    reason: string
  }): Promise<OutcomeMetricObservation> {
    const previous = this.requireObservationInProject(input.observationId, input.projectId)
    return this.recordMetricObservation({
      projectId: input.projectId,
      deliverableRef: previous.deliverableRef,
      conceptRef: previous.conceptRef,
      metricKey: previous.metricDefinitionRef.metricKey,
      definitionVersion: previous.metricDefinitionRef.definitionVersion,
      value: { kind: 'unavailable', reason: input.reason },
      measurementWindow: previous.measurementWindow,
      observedAt: previous.observedAt,
      marketRegion: previous.marketRegion,
      channel: previous.channel,
      sourceType: previous.sourceType,
      sourceRef: { ...previous.sourceRef, note: 'source-restricted' },
      verificationStatus: 'not_verifiable',
      dimensions: previous.dimensions,
      limitations: ['source-restricted', input.reason],
      dataReality: previous.dataReality,
      visibility: previous.visibility,
      origin: 'manual_entry',
      supersedesId: String(input.observationId),
      expectedHeadId: input.expectedHeadId,
      correctionReason: input.reason,
      confirmedRealWork: previous.dataReality === 'real_work',
    })
  }

  /**
   * List raw metric points. This method does not sum across unit, currency, channel, or window.
   * @param projectId - Owning project.
   * @param deliverableRef - Exact deliverable.
   */
  listMetricObservations(projectId: ProjectId, deliverableRef: ExactSubjectRef): readonly OutcomeMetricObservation[] {
    this.requireProject(projectId)
    const rows: OutcomeMetricObservation[] = []
    for (const [id, record] of this.requireObservations().entries()) {
      if (record.projectId !== String(projectId)) continue
      if (record.deliverableRef.id !== deliverableRef.id) continue
      rows.push(this.toObservation(id, record))
    }
    rows.sort(compareFeedbackRecordedDesc)
    return rows
  }

  /**
   * Refuse automatic aggregation. Identical dimensions still do not produce a total in v0.
   * @param rows - Candidate points.
   */
  refuseAutomaticAggregate(rows: readonly OutcomeMetricObservation[]): never {
    const first = rows[0]
    if (first === undefined) throw new FashionFeedbackUnitMismatchError('empty')
    for (const row of rows) {
      if (row.metricDefinitionRef.metricKey !== first.metricDefinitionRef.metricKey
        || row.metricDefinitionRef.definitionVersion !== first.metricDefinitionRef.definitionVersion) {
        throw new FashionFeedbackMetricDefinitionMismatchError('definition-differs')
      }
      if (row.currencyCode !== first.currencyCode || row.channel !== first.channel || row.marketRegion !== first.marketRegion) {
        throw new FashionFeedbackUnitMismatchError('dimension-differs')
      }
      if (row.measurementWindow.start !== first.measurementWindow.start || row.measurementWindow.end !== first.measurementWindow.end) {
        throw new FashionFeedbackUnitMismatchError('window-differs')
      }
    }
    throw new FashionFeedbackUnitMismatchError('aggregation-not-supported')
  }

  /**
   * Feedback summary: current heads and full history.
   * @param projectId - Owning project.
   */
  getFeedbackSummary(projectId: ProjectId): FeedbackSummary {
    const history = this.listFeedback(projectId)
    const current = history.filter(row => !history.some(other => other.supersedesId === String(row.id)))
    return { projectId, current, history }
  }

  /**
   * Joined timeline. No causal claim and no numeric total.
   * @param projectId - Owning project.
   * @param deliverableRef - Exact deliverable.
   */
  getOutcomeTimeline(projectId: ProjectId, deliverableRef: ExactSubjectRef): OutcomeTimeline {
    return {
      projectId,
      feedback: this.getFeedbackSummary(projectId),
      availability: this.listOutcomeAvailabilityHistory(projectId, deliverableRef),
      development: this.listDevelopmentTimeline(projectId, deliverableRef),
      metrics: this.listMetricObservations(projectId, deliverableRef),
    }
  }

  private async ensureCatalog(): Promise<void> {
    const table = this.requireDefinitions()
    for (const row of METRIC_CATALOG) {
      const existing = table.get(row.id)
      if (existing === undefined) {
        await table.put(row.id, row.record)
        continue
      }
      if (existing.metricKey !== row.record.metricKey || existing.definitionVersion !== row.record.definitionVersion) {
        throw new FashionFeedbackSeedConflictError('metric-catalog-drift')
      }
    }
  }

  private async ensureR0Seed(): Promise<void> {
    const deliverable = this.ctx.fashionDesignRegistry.getDeliverable(
      R0_PROJECT_ID,
      brandDeliverableId(R0_DELIVERABLE_ID),
    )
    const subject: FeedbackSubjectRef = {
      subjectType: 'deliverable',
      subjectId: String(deliverable.id),
      subjectRevision: deliverable.revision,
      relatedDeliverableRef: { id: String(deliverable.id), revision: deliverable.revision },
      workflowStep: null,
    }
    const feedbackTable = this.requireFeedback()
    const existing = feedbackTable.get(R0_FEEDBACK_ID)
    if (existing === undefined) {
      const record: DesignerFeedbackRecordV0 = {
        projectId: String(R0_PROJECT_ID),
        schemaVersion: 0,
        origin: 'recorded_seed',
        dataReality: 'recorded_demo',
        visibility: 'public_rebuild',
        recordedBy: 'recorded-demo',
        recordedAt: R0_RECORDED_AT,
        supersedesId: null,
        correctionReason: null,
        archivedAt: null,
        accessMode: 'read-only',
        revision: 0,
        idempotencyKey: 'r0-feedback-cropped-modified',
        subjectRef: durableSubject(subject),
        action: 'modified',
        reasonCodes: ['silhouette_or_proportion', 'cost_or_production_unknown'],
        reasonText: 'Recorded demo only: soften the shoulder structure and keep the cropped proportion. Materials, cost, and process still need a real designer and supply-chain check. This is not a real fashion-designer conclusion.',
        modifications: [{
          area: 'shoulder-and-proportion',
          summary: 'Soften shoulder structure; keep cropped proportion.',
          reasonCodes: ['silhouette_or_proportion'],
          artifactRef: null,
        }],
        professionalValidity: 'unknown',
        revisionEffort: 'unknown',
        timeSavedEstimate: 'not_estimated',
        feedbackActor: recordedDemoActor(),
        followUpNeeded: true,
        followUpNote: 'Public rebuild demo. Not a user, client, or designer verdict.',
      }
      await feedbackTable.put(R0_FEEDBACK_ID, record)
    } else if (
      existing.origin !== 'recorded_seed'
      || existing.dataReality !== 'recorded_demo'
      || existing.action !== 'modified'
      || existing.subjectRef.subjectRevision !== deliverable.revision
    ) {
      throw new FashionFeedbackSeedConflictError('r0-feedback-drift')
    }

    const availabilityTable = this.requireAvailability()
    const availability = availabilityTable.get(R0_AVAILABILITY_ID)
    if (availability === undefined) {
      const record: OutcomeAvailabilityRecordV0 = {
        projectId: String(R0_PROJECT_ID),
        schemaVersion: 0,
        origin: 'recorded_seed',
        dataReality: 'recorded_demo',
        visibility: 'public_rebuild',
        recordedBy: 'recorded-demo',
        recordedAt: R0_RECORDED_AT,
        supersedesId: null,
        correctionReason: null,
        archivedAt: null,
        accessMode: 'read-only',
        revision: 0,
        idempotencyKey: 'r0-outcome-not-available',
        deliverableRef: { id: String(deliverable.id), revision: deliverable.revision },
        conceptRef: deliverable.selectedConceptRef,
        availability: 'not_available',
        reasonCode: 'public_rebuild_no_real_launch_data',
        reasonText: 'Public rebuild has no real launch, sales, or channel data.',
        expectedAfter: null,
        asOf: R0_RECORDED_AT,
        actor: recordedDemoActor(),
      }
      await availabilityTable.put(R0_AVAILABILITY_ID, record)
    } else if (availability.availability !== 'not_available' || availability.dataReality !== 'recorded_demo') {
      throw new FashionFeedbackSeedConflictError('r0-availability-drift')
    }

    for (const [, record] of this.requireEvents().entries()) {
      if (record.projectId === String(R0_PROJECT_ID)) throw new FashionFeedbackSeedConflictError('r0-development-forbidden')
    }
    for (const [, record] of this.requireObservations().entries()) {
      if (record.projectId === String(R0_PROJECT_ID) && record.value.kind !== 'unavailable') {
        throw new FashionFeedbackSeedConflictError('r0-metric-forbidden')
      }
    }
  }

  private resolveSubject(
    projectId: ProjectId,
    subject: FeedbackSubjectRef,
    expectedRevision: number,
  ): FeedbackSubjectRef {
    if (subject.subjectRevision !== expectedRevision) {
      throw new FashionFeedbackTargetStaleError(subject.subjectId, expectedRevision, subject.subjectRevision)
    }
    if (subject.subjectType === 'workflow_step') {
      const step = subject.workflowStep
      if (step === null || step.stepKey === '' || step.moduleId === '' || step.relatedRefs.length === 0) {
        throw new FashionFeedbackInvalidInputError('workflow-step-incomplete')
      }
      return subject
    }
    const actual = this.lookupRevision(projectId, subject)
    if (actual === undefined) throw new FashionFeedbackTargetRevisionMissingError(subject.subjectId)
    if (actual !== expectedRevision) {
      throw new FashionFeedbackTargetStaleError(subject.subjectId, expectedRevision, actual)
    }
    return subject
  }

  private lookupRevision(projectId: ProjectId, subject: FeedbackSubjectRef): number | undefined {
    const design = this.ctx.fashionDesignRegistry
    try {
      if (subject.subjectType === 'deliverable') {
        return design.getDeliverable(projectId, brandDeliverableId(subject.subjectId)).revision
      }
      if (subject.subjectType === 'concept') {
        return design.getConcept(projectId, subject.subjectId as never).revision
      }
      if (subject.subjectType === 'brief') {
        return design.getBrief(projectId, subject.subjectId as never).revision
      }
    } catch (error) {
      if (isNotFound(error)) return undefined
      throw error
    }
    if (subject.subjectType === 'evidence') {
      const evidence = this.ctx.fashionResearchRegistry.getEvidence(subject.subjectId as never)
      if (evidence === undefined) return undefined
      if (String(evidence.projectId) !== String(projectId)) {
        throw new FashionFeedbackCrossProjectError(projectId, String(evidence.projectId))
      }
      return evidence.revision
    }
    if (subject.subjectType === 'opportunity') {
      const tasks = this.ctx.fashionResearchRegistry.listTasks(projectId)
      for (const task of tasks) {
        const rows = this.ctx.fashionAnalysisRegistry.listOpportunities(projectId, task.id)
        const found = rows.find(row => String(row.id) === subject.subjectId)
        if (found !== undefined) return found.revision
      }
      return undefined
    }
    return undefined
  }

  private resolveDeliverablePair(projectId: ProjectId, deliverableRef: ExactSubjectRef, conceptRef: ExactSubjectRef): void {
    let deliverable
    try {
      deliverable = this.ctx.fashionDesignRegistry.getDeliverable(projectId, brandDeliverableId(deliverableRef.id))
    } catch (error) {
      if (isNotFound(error)) throw new FashionFeedbackTargetRevisionMissingError(deliverableRef.id)
      throw error
    }
    if (deliverable.revision !== deliverableRef.revision) {
      throw new FashionFeedbackTargetStaleError(deliverableRef.id, deliverableRef.revision, deliverable.revision)
    }
    if (deliverable.selectedConceptRef.id !== conceptRef.id || deliverable.selectedConceptRef.revision !== conceptRef.revision) {
      const concept = this.ctx.fashionDesignRegistry.getConcept(projectId, conceptRef.id as never)
      if (String(concept.projectId) !== String(projectId)) {
        throw new FashionFeedbackCrossProjectError(projectId, String(concept.projectId))
      }
      if (concept.revision !== conceptRef.revision) {
        throw new FashionFeedbackTargetStaleError(conceptRef.id, conceptRef.revision, concept.revision)
      }
    }
  }

  private requireReasons(action: FeedbackAction, codes: readonly FeedbackReasonCode[], text: string | null | undefined): void {
    if (!REASON_REQUIRED.has(action)) return
    const hasSpecific = codes.some(code => code !== 'other')
    if (!hasSpecific && (text ?? '').trim() === '') throw new FashionFeedbackInvalidInputError('reason-required')
    if (codes.includes('other') && (text ?? '').trim() === '') throw new FashionFeedbackInvalidInputError('other-reason-text-required')
  }

  private requireReality(reality: FeedbackDataReality, confirmed: boolean | undefined): void {
    if (reality === 'recorded_demo') throw new FashionFeedbackHumanRequiredError('recorded-demo-actor-forbidden')
    if (reality === 'real_work' && confirmed !== true) throw new FashionFeedbackInvalidInputError('real-work-unconfirmed')
  }

  private requireSource(sourceType: OutcomeSourceType, source: OutcomeSourceRef): void {
    if (source.ref.trim() === '' || source.usageBoundary.trim() === '') {
      throw new FashionFeedbackSourceRequiredError('source-ref-required')
    }
    if (sourceType === 'authorized_export' && (source.contentHash === null || source.providerName === null)) {
      throw new FashionFeedbackSourceRequiredError('authorized-export-hash-required')
    }
    if (source.sourceKind === 'f2_evidence') {
      const evidence = this.ctx.fashionResearchRegistry.getEvidence(source.ref as never)
      if (evidence === undefined) throw new FashionFeedbackSourceRequiredError('evidence-missing')
    }
  }

  private requireWindow(window: MeasurementWindow): void {
    if (window.timezone.trim() === '') throw new FashionFeedbackInvalidWindowError('timezone-required')
    if (window.start >= window.end) throw new FashionFeedbackInvalidWindowError('start-not-before-end')
  }

  private requireMetricValue(
    definition: OutcomeMetricDefinitionRecordV0,
    value: MetricValue,
    currencyCode: string | null | undefined,
  ): void {
    if (value.kind === 'unavailable') return
    if (value.kind !== definition.valueType) {
      throw new FashionFeedbackMetricDefinitionMismatchError('value-type')
    }
    if (definition.valueType === 'decimal_string') {
      if (value.kind !== 'decimal_string' || !/^-?\d+(\.\d+)?$/.test(value.value)) {
        throw new FashionFeedbackMetricDefinitionMismatchError('decimal-string')
      }
      if (CURRENCY_UNITS.has(definition.unit) && (currencyCode === undefined || currencyCode === null)) {
        throw new FashionFeedbackCurrencyRequiredError(definition.metricKey)
      }
    }
    if (definition.valueType === 'ratio') {
      if (value.kind !== 'ratio' || value.denominator === 0) {
        throw new FashionFeedbackMetricDefinitionMismatchError('ratio')
      }
    }
    if (definition.valueType === 'integer' && value.kind === 'integer' && !Number.isInteger(value.value)) {
      throw new FashionFeedbackMetricDefinitionMismatchError('integer')
    }
  }

  private requireDefinition(projectId: ProjectId, metricKey: string, definitionVersion: string): OutcomeMetricDefinitionRecordV0 {
    for (const [, record] of this.requireDefinitions().entries()) {
      if (record.metricKey !== metricKey || record.definitionVersion !== definitionVersion) continue
      if (record.scope === 'catalog' || record.projectId === String(projectId)) return record
    }
    throw new FashionFeedbackMetricDefinitionMismatchError('unknown-definition')
  }

  private rejectForeignActor(actorKind: string | undefined): void {
    if (actorKind === undefined) return
    if (actorKind !== 'local_human') throw new FashionFeedbackHumanRequiredError(actorKind)
  }

  private envelope(
    input: {
      projectId: ProjectId
      origin?: FeedbackOrigin
      dataReality: FeedbackDataReality
      visibility?: FeedbackVisibility
      idempotencyKey?: string | null
    },
    now: string,
    supersedesId: string | null,
    correctionReason: string | null,
  ): Omit<DesignerFeedbackRecordV0, 'subjectRef' | 'action' | 'reasonCodes' | 'reasonText' | 'modifications' | 'professionalValidity' | 'revisionEffort' | 'timeSavedEstimate' | 'feedbackActor' | 'followUpNeeded' | 'followUpNote'> {
    return {
      projectId: String(input.projectId),
      schemaVersion: 0,
      origin: input.origin ?? 'manual_entry',
      dataReality: input.dataReality,
      visibility: input.visibility ?? 'project_private',
      recordedBy: 'local-human',
      recordedAt: now,
      supersedesId,
      correctionReason,
      archivedAt: null,
      accessMode: 'editable',
      revision: 0,
      idempotencyKey: input.idempotencyKey ?? null,
    }
  }

  private feedbackRecord(
    input: FeedbackWrite,
    subject: FeedbackSubjectRef,
    now: string,
    supersedesId: string | null,
    correctionReason: string | null,
  ): DesignerFeedbackRecordV0 {
    return {
      ...this.envelope(input, now, supersedesId, correctionReason),
      subjectRef: durableSubject(subject),
      action: input.action,
      reasonCodes: [...input.reasonCodes],
      reasonText: input.reasonText ?? null,
      modifications: input.modifications.map(row => ({ ...row, reasonCodes: [...row.reasonCodes] })),
      professionalValidity: input.professionalValidity,
      revisionEffort: input.revisionEffort,
      timeSavedEstimate: input.timeSavedEstimate ?? null,
      feedbackActor: localHuman(),
      followUpNeeded: input.followUpNeeded ?? false,
      followUpNote: input.followUpNote ?? null,
    }
  }

  // `KvTable.put` updates `entries()` only after persistence settles, so an unqueued
  // second write could pass `findIdempotent` before the first row becomes visible.
  private serializeKeyedWrite<T>(write: () => Promise<T>): Promise<T> {
    const run = this.keyedWriteTail.then(write)
    this.keyedWriteTail = run.then(() => undefined, () => undefined)
    return run
  }

  private findIdempotent<Id extends string, R extends { projectId: string; idempotencyKey: string | null }>(
    table: KvTable<Id, R>,
    projectId: ProjectId,
    key: string | null | undefined,
  ): { id: Id; record: R } | undefined {
    if (key === undefined || key === null) return undefined
    for (const [id, record] of table.entries()) {
      if (record.projectId === String(projectId) && record.idempotencyKey === key) {
        return { id, record }
      }
    }
    return undefined
  }

  private chainHead(table: KvTable<DesignerFeedbackId, DesignerFeedbackRecordV0>, start: DesignerFeedbackId): DesignerFeedbackId {
    let current = start
    for (const [id, record] of table.entries()) {
      if (record.supersedesId === String(current)) {
        current = id
        return this.chainHead(table, current)
      }
    }
    return current
  }

  private assertHead(
    table: { entries(): Iterable<[unknown, { supersedesId: string | null }]> },
    supersedesId: string,
    expectedHeadId: string | undefined,
  ): void {
    let head = supersedesId
    let moved = true
    while (moved) {
      moved = false
      for (const [id, record] of table.entries()) {
        if (record.supersedesId === head) {
          head = String(id)
          moved = true
          break
        }
      }
    }
    if (expectedHeadId !== undefined && expectedHeadId !== head) {
      throw new FashionFeedbackSupersedesConflictError(expectedHeadId, head)
    }
  }

  private requireProject(projectId: ProjectId): void {
    if (this.ctx.fashionProjectRegistry.get(projectId) === undefined) {
      throw new FashionFeedbackProjectNotFoundError(projectId)
    }
  }

  private requireEditableProject(projectId: ProjectId): void {
    const project = this.ctx.fashionProjectRegistry.get(projectId)
    if (project === undefined) throw new FashionFeedbackProjectNotFoundError(projectId)
    if (project.accessMode === 'read-only') throw new FashionFeedbackProjectReadOnlyError(projectId)
  }

  private requireFeedback(): KvTable<DesignerFeedbackId, DesignerFeedbackRecordV0> {
    if (this.feedback === undefined) throw new Error('fashion feedback table not open')
    return this.feedback
  }

  private requireAvailability(): KvTable<OutcomeAvailabilityId, OutcomeAvailabilityRecordV0> {
    if (this.availability === undefined) throw new Error('fashion availability table not open')
    return this.availability
  }

  private requireEvents(): KvTable<DevelopmentEventId, DevelopmentEventRecordV0> {
    if (this.events === undefined) throw new Error('fashion development table not open')
    return this.events
  }

  private requireDefinitions(): KvTable<OutcomeMetricDefinitionId, OutcomeMetricDefinitionRecordV0> {
    if (this.definitions === undefined) throw new Error('fashion metric definition table not open')
    return this.definitions
  }

  private requireObservations(): KvTable<OutcomeMetricObservationId, OutcomeMetricObservationRecordV0> {
    if (this.observations === undefined) throw new Error('fashion metric observation table not open')
    return this.observations
  }

  private requireFeedbackInProject(id: DesignerFeedbackId, projectId: ProjectId): DesignerFeedbackRecordV0 & { id: DesignerFeedbackId } {
    const record = this.requireFeedback().get(id)
    if (record === undefined) throw new FashionFeedbackNotFoundError(String(id))
    if (record.projectId !== String(projectId)) throw new FashionFeedbackCrossProjectError(projectId, record.projectId)
    return { ...record, id }
  }

  private requireAvailabilityInProject(id: OutcomeAvailabilityId, projectId: ProjectId): OutcomeAvailabilityRecordV0 {
    const record = this.requireAvailability().get(id)
    if (record === undefined) throw new FashionFeedbackNotFoundError(String(id))
    if (record.projectId !== String(projectId)) throw new FashionFeedbackCrossProjectError(projectId, record.projectId)
    return record
  }

  private requireEventInProject(id: DevelopmentEventId, projectId: ProjectId): DevelopmentEventRecordV0 {
    const record = this.requireEvents().get(id)
    if (record === undefined) throw new FashionFeedbackNotFoundError(String(id))
    if (record.projectId !== String(projectId)) throw new FashionFeedbackCrossProjectError(projectId, record.projectId)
    return record
  }

  private requireObservationInProject(id: OutcomeMetricObservationId, projectId: ProjectId): OutcomeMetricObservationRecordV0 {
    const record = this.requireObservations().get(id)
    if (record === undefined) throw new FashionFeedbackNotFoundError(String(id))
    if (record.projectId !== String(projectId)) throw new FashionFeedbackCrossProjectError(projectId, record.projectId)
    return record
  }

  private toFeedback(id: DesignerFeedbackId, record: DesignerFeedbackRecordV0): DesignerFeedback {
    return { id, ...record, projectId: record.projectId as ProjectId }
  }

  private toAvailability(id: OutcomeAvailabilityId, record: OutcomeAvailabilityRecordV0): OutcomeAvailability {
    return { id, ...record, projectId: record.projectId as ProjectId }
  }

  private toEvent(id: DevelopmentEventId, record: DevelopmentEventRecordV0): DevelopmentEvent {
    return { id, ...record, projectId: record.projectId as ProjectId }
  }

  private toObservation(id: OutcomeMetricObservationId, record: OutcomeMetricObservationRecordV0): OutcomeMetricObservation {
    return { id, ...record, projectId: record.projectId as ProjectId }
  }

  private toDefinition(id: OutcomeMetricDefinitionId, record: OutcomeMetricDefinitionRecordV0): OutcomeMetricDefinitionRef {
    return {
      id,
      projectId: record.projectId as ProjectId | null,
      metricKey: record.metricKey,
      definitionVersion: record.definitionVersion,
      displayName: record.displayName,
      valueType: record.valueType,
      unit: record.unit,
      aggregationSemantics: record.aggregationSemantics,
      description: record.description,
      requiredDimensions: record.requiredDimensions,
      scope: record.scope,
      limitations: record.limitations,
    }
  }
}

function compareDevelopmentCurrent(left: DevelopmentEvent, right: DevelopmentEvent): number {
  if (left.occurredAt !== right.occurredAt) return left.occurredAt < right.occurredAt ? 1 : -1
  if (left.recordedAt !== right.recordedAt) return left.recordedAt < right.recordedAt ? 1 : -1
  if (left.id === right.id) return 0
  return String(left.id) < String(right.id) ? 1 : -1
}

function isNotFound(error: unknown): boolean {
  return error instanceof Error && error.name.endsWith('NotFoundError')
}

/** Shared write fields for feedback commands. actorKind is rejected when present and not local_human. */
interface FeedbackWrite {
  projectId: ProjectId
  subjectRef: FeedbackSubjectRef
  expectedSubjectRevision: number
  action: FeedbackAction
  reasonCodes: readonly FeedbackReasonCode[]
  reasonText?: string | null
  modifications: readonly FeedbackModification[]
  professionalValidity: ProfessionalValidity
  revisionEffort: RevisionEffort
  timeSavedEstimate?: TimeSavedEstimate | null
  followUpNeeded?: boolean
  followUpNote?: string | null
  origin?: FeedbackOrigin
  dataReality: FeedbackDataReality
  visibility?: FeedbackVisibility
  confirmedRealWork?: boolean
  idempotencyKey?: string | null
  recordedAt?: string
  actorKind?: string
}

/** Availability write. */
interface AvailabilityWrite {
  projectId: ProjectId
  deliverableRef: ExactSubjectRef
  conceptRef: ExactSubjectRef
  availability: OutcomeAvailabilityState
  reasonCode: string
  reasonText?: string | null
  expectedAfter?: string | null
  asOf: string
  dataReality: FeedbackDataReality
  visibility?: FeedbackVisibility
  origin?: FeedbackOrigin
  supersedesId?: string
  expectedHeadId?: string
  correctionReason?: string
  idempotencyKey?: string | null
  recordedAt?: string
  actorKind?: string
  confirmedRealWork?: boolean
}

/** Development event write. */
interface DevelopmentWrite {
  projectId: ProjectId
  deliverableRef: ExactSubjectRef
  conceptRef: ExactSubjectRef
  stage: DevelopmentEvent['stage']
  occurredAt: string
  marketRegion?: string | null
  channel?: string | null
  businessContext: string
  sourceType: OutcomeSourceType
  sourceRef: OutcomeSourceRef
  verificationStatus: VerificationStatus
  limitations: readonly string[]
  dataReality: FeedbackDataReality
  visibility?: FeedbackVisibility
  origin?: FeedbackOrigin
  supersedesId?: string
  expectedHeadId?: string
  correctionReason?: string
  idempotencyKey?: string | null
  recordedAt?: string
  actorKind?: string
  confirmedRealWork?: boolean
}

function durableSubject(subject: FeedbackSubjectRef): DesignerFeedbackRecordV0['subjectRef'] {
  return {
    subjectType: subject.subjectType,
    subjectId: subject.subjectId,
    subjectRevision: subject.subjectRevision,
    relatedDeliverableRef: subject.relatedDeliverableRef === null
      ? null
      : { id: subject.relatedDeliverableRef.id, revision: subject.relatedDeliverableRef.revision },
    workflowStep: subject.workflowStep === null
      ? null
      : {
        stepKey: subject.workflowStep.stepKey,
        moduleId: subject.workflowStep.moduleId,
        moduleSchemaVersion: subject.workflowStep.moduleSchemaVersion,
        relatedRefs: subject.workflowStep.relatedRefs.map(ref => ({ id: ref.id, revision: ref.revision })),
      },
  }
}

/** Metric observation write. */
interface MetricWrite {
  projectId: ProjectId
  deliverableRef: ExactSubjectRef
  conceptRef: ExactSubjectRef
  metricKey: string
  definitionVersion: string
  value: MetricValue
  currencyCode?: string | null
  measurementWindow: MeasurementWindow
  observedAt: string
  marketRegion: string
  channel: string
  sourceType: OutcomeSourceType
  sourceRef: OutcomeSourceRef
  sourceFieldName?: string | null
  verificationStatus: VerificationStatus
  dimensions: readonly string[]
  limitations: readonly string[]
  dataReality: FeedbackDataReality
  visibility?: FeedbackVisibility
  origin?: FeedbackOrigin
  causalClaim?: string
  supersedesId?: string
  expectedHeadId?: string
  correctionReason?: string
  idempotencyKey?: string | null
  recordedAt?: string
  actorKind?: string
  confirmedRealWork?: boolean
}
