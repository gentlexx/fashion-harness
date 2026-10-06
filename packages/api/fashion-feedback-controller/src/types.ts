/**
 * Serializable Fashion Feedback Remote request values.
 * Actor kind is not a client field.
 * @module @gentlexx/dsh-api-fashion-feedback-controller/src/types
 */

import type { ProjectId } from '@gentlexx/dsh-fashion-project/types'
import type {
  DesignerFeedback,
  DevelopmentEvent,
  ExactSubjectRef,
  FeedbackAction,
  FeedbackDataReality,
  FeedbackModification,
  FeedbackReasonCode,
  FeedbackSubjectRef,
  FeedbackSummary,
  FeedbackVisibility,
  MeasurementWindow,
  MetricValue,
  OutcomeAvailability,
  OutcomeAvailabilityState,
  OutcomeMetricDefinitionRef,
  OutcomeMetricObservation,
  OutcomeSourceRef,
  OutcomeSourceType,
  OutcomeTimeline,
  ProfessionalValidity,
  RevisionEffort,
  TimeSavedEstimate,
  VerificationStatus,
} from '@gentlexx/dsh-fashion-feedback/types'

/** Project scope. */
export interface FeedbackScopeRequest {
  readonly projectId: ProjectId
}

/** Record feedback. Host stamps local_human. */
export interface RecordFeedbackRequest {
  readonly projectId: ProjectId
  readonly subjectRef: FeedbackSubjectRef
  readonly expectedSubjectRevision: number
  readonly action: FeedbackAction
  readonly reasonCodes: readonly FeedbackReasonCode[]
  readonly reasonText?: string | null
  readonly modifications: readonly FeedbackModification[]
  readonly professionalValidity: ProfessionalValidity
  readonly revisionEffort: RevisionEffort
  readonly timeSavedEstimate?: TimeSavedEstimate | null
  readonly followUpNeeded?: boolean
  readonly followUpNote?: string | null
  readonly dataReality: FeedbackDataReality
  readonly visibility?: FeedbackVisibility
  readonly confirmedRealWork?: boolean
  readonly idempotencyKey?: string | null
}

/** Supersede feedback. */
export interface SupersedeFeedbackRequest extends RecordFeedbackRequest {
  readonly supersedesId: string
  readonly expectedHeadId: string
  readonly correctionReason: string
}

/** Read one feedback row. */
export interface GetFeedbackRequest {
  readonly projectId: ProjectId
  readonly feedbackId: string
}

/** Record availability. */
export interface RecordAvailabilityRequest {
  readonly projectId: ProjectId
  readonly deliverableRef: ExactSubjectRef
  readonly conceptRef: ExactSubjectRef
  readonly availability: OutcomeAvailabilityState
  readonly reasonCode: string
  readonly reasonText?: string | null
  readonly expectedAfter?: string | null
  readonly asOf: string
  readonly dataReality: FeedbackDataReality
  readonly visibility?: FeedbackVisibility
  readonly supersedesId?: string
  readonly expectedHeadId?: string
  readonly correctionReason?: string
  readonly idempotencyKey?: string | null
}

/** Deliverable-scoped read. */
export interface DeliverableScopeRequest {
  readonly projectId: ProjectId
  readonly deliverableRef: ExactSubjectRef
}

/** Record a development event. */
export interface RecordDevelopmentRequest {
  readonly projectId: ProjectId
  readonly deliverableRef: ExactSubjectRef
  readonly conceptRef: ExactSubjectRef
  readonly stage: DevelopmentEvent['stage']
  readonly occurredAt: string
  readonly marketRegion?: string | null
  readonly channel?: string | null
  readonly businessContext: string
  readonly sourceType: OutcomeSourceType
  readonly sourceRef: OutcomeSourceRef
  readonly verificationStatus: VerificationStatus
  readonly limitations: readonly string[]
  readonly dataReality: FeedbackDataReality
  readonly visibility?: FeedbackVisibility
  readonly supersedesId?: string
  readonly expectedHeadId?: string
  readonly correctionReason?: string
  readonly idempotencyKey?: string | null
}

/** Record one metric point. */
export interface RecordMetricRequest {
  readonly projectId: ProjectId
  readonly deliverableRef: ExactSubjectRef
  readonly conceptRef: ExactSubjectRef
  readonly metricKey: string
  readonly definitionVersion: string
  readonly value: MetricValue
  readonly currencyCode?: string | null
  readonly measurementWindow: MeasurementWindow
  readonly observedAt: string
  readonly marketRegion: string
  readonly channel: string
  readonly sourceType: OutcomeSourceType
  readonly sourceRef: OutcomeSourceRef
  readonly verificationStatus: VerificationStatus
  readonly dimensions: readonly string[]
  readonly limitations: readonly string[]
  readonly dataReality: FeedbackDataReality
  readonly visibility?: FeedbackVisibility
  readonly causalClaim?: 'none'
  readonly idempotencyKey?: string | null
}

export type {
  DesignerFeedback as DesignerFeedbackValue,
  DevelopmentEvent as DevelopmentEventValue,
  FeedbackSummary as FeedbackSummaryValue,
  OutcomeAvailability as OutcomeAvailabilityValue,
  OutcomeMetricDefinitionRef as MetricDefinitionValue,
  OutcomeMetricObservation as MetricObservationValue,
  OutcomeTimeline as OutcomeTimelineValue,
}
