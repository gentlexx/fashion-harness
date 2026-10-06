/**
 * Public type vocabulary of the Fashion Feedback domain.
 * Types only — factories and errors live in runtime modules.
 * @module @gentlexx/dsh-fashion-feedback/src/types
 */

import type { Branded } from '@deepseek-ai/dsh-brand'
import type { ProjectId } from '@gentlexx/dsh-fashion-project/types'
import type {} from '@deepseek-ai/dsh-typert-protocol'

/** Stable DesignerFeedback identity. */
export type DesignerFeedbackId = Branded<'FashionDesignerFeedbackId'>

/** Stable OutcomeAvailability identity. */
export type OutcomeAvailabilityId = Branded<'FashionOutcomeAvailabilityId'>

/** Stable DevelopmentEvent identity. */
export type DevelopmentEventId = Branded<'FashionDevelopmentEventId'>

/** Stable OutcomeMetricObservation identity. */
export type OutcomeMetricObservationId = Branded<'FashionOutcomeMetricObservationId'>

/** Stable project-scoped custom metric definition identity. */
export type OutcomeMetricDefinitionId = Branded<'FashionOutcomeMetricDefinitionId'>

/** Stable subject identity carried inside a feedback subject ref. */
export type FeedbackSubjectId = Branded<'FashionFeedbackSubjectId'>

/** Storage schema generation for fashion_feedback rows. */
export const FASHION_FEEDBACK_SCHEMA_VERSION = 0

/** How a feedback record entered storage. */
export type FeedbackOrigin = 'manual_entry' | 'recorded_seed' | 'authorized_import'

/** Whether the record describes real work, a user test, or a recorded demo. */
export type FeedbackDataReality = 'real_work' | 'user_test' | 'recorded_demo'

/** Visibility of a feedback or outcome record. */
export type FeedbackVisibility = 'project_private' | 'internal_demo' | 'public_rebuild' | 'view_only'

/** Host-owned human actor kinds. Agent and system are not admitted. */
export type FeedbackActorKind = 'local_human' | 'recorded_demo_human'

/** Subject kinds a DesignerFeedback may bind. */
export type FeedbackSubjectType =
  | 'deliverable'
  | 'concept'
  | 'brief'
  | 'opportunity'
  | 'evidence'
  | 'workflow_step'

/** Designer action on an exact subject. */
export type FeedbackAction =
  | 'adopted'
  | 'modified'
  | 'rejected'
  | 'ignored'
  | 'needs_follow_up'
  | 'unable_to_assess'

/** Versioned engineering reason codes. */
export type FeedbackReasonCode =
  | 'evidence_useful'
  | 'evidence_missing'
  | 'analysis_clear'
  | 'analysis_unreliable'
  | 'market_fit'
  | 'brand_fit'
  | 'originality_helpful'
  | 'similarity_risk'
  | 'silhouette_or_proportion'
  | 'material_or_process'
  | 'construction_or_function'
  | 'cost_or_production_unknown'
  | 'visual_mismatch'
  | 'handoff_usable'
  | 'too_much_manual_work'
  | 'terminology_unclear'
  | 'other'

/** Professional usefulness judgment. Not a system quality score. */
export type ProfessionalValidity = 'valid' | 'partly_valid' | 'invalid' | 'unknown'

/** Subjective revision effort. */
export type RevisionEffort = 'none' | 'light' | 'moderate' | 'heavy' | 'unknown'

/** Subjective time-saved band. Never aggregated into an efficiency KPI. */
export type TimeSavedEstimate =
  | 'not_estimated'
  | 'none'
  | 'under_15m'
  | 'm15_to_30'
  | 'm30_to_60'
  | 'over_60m'

/** Whether later commercial facts can be recorded. */
export type OutcomeAvailabilityState =
  | 'not_yet_observed'
  | 'not_available'
  | 'not_authorized'
  | 'available_partial'
  | 'available'

/** Append-only development stage. A stage is not a success conclusion. */
export type DevelopmentStage =
  | 'handed_off'
  | 'sampled'
  | 'revised_after_sample'
  | 'produced'
  | 'listed'
  | 'selling'
  | 'closed'
  | 'stopped'

/** How a development or metric fact was obtained. official_api is refused. */
export type OutcomeSourceType = 'manual_entry' | 'authorized_export'

/** How far a fact was checked against its source. */
export type VerificationStatus =
  | 'self_reported'
  | 'source_attached'
  | 'verified_against_source'
  | 'not_verifiable'

/** Metric value kinds. Missing data is unavailable, never numeric 0. */
export type MetricValueType = 'integer' | 'decimal_string' | 'ratio'

/** How a metric point should be read. v0 does not auto-aggregate. */
export type AggregationSemantics = 'point' | 'window_total' | 'window_average' | 'end_of_window'

/** Source kind on an OutcomeSourceRef. */
export type OutcomeSourceKind = 'human_statement' | 'project_artifact' | 'f2_evidence' | 'authorized_export'

/** Shared durable envelope. accessMode keeps R0 rows read-only, matching sibling Fashion domains. */
export interface FeedbackEnvelope {
  readonly projectId: ProjectId
  readonly schemaVersion: typeof FASHION_FEEDBACK_SCHEMA_VERSION
  readonly origin: FeedbackOrigin
  readonly dataReality: FeedbackDataReality
  readonly visibility: FeedbackVisibility
  readonly recordedBy: string
  readonly recordedAt: string
  readonly supersedesId: string | null
  readonly correctionReason: string | null
  readonly archivedAt: string | null
  readonly accessMode: 'editable' | 'read-only'
  readonly revision: number
  readonly idempotencyKey: string | null
}

/** Workflow step identity when the subject is a product step, not a business object. */
export interface WorkflowStepRef {
  readonly stepKey: string
  readonly moduleId: string
  readonly moduleSchemaVersion: number
  readonly relatedRefs: readonly ExactSubjectRef[]
}

/** Exact upstream id + revision. */
export interface ExactSubjectRef {
  readonly id: string
  readonly revision: number
}

/** Feedback subject. Non-workflow subjects are checked against upstream registries. */
export interface FeedbackSubjectRef {
  readonly subjectType: FeedbackSubjectType
  readonly subjectId: string
  readonly subjectRevision: number
  readonly relatedDeliverableRef: ExactSubjectRef | null
  readonly workflowStep: WorkflowStepRef | null
}

/** One modification note. Does not store a private design file. */
export interface FeedbackModification {
  readonly area: string
  readonly summary: string
  readonly reasonCodes: readonly FeedbackReasonCode[]
  readonly artifactRef: string | null
}

/** Host-stamped actor. Clients cannot upload actorKind. */
export interface FeedbackActor {
  readonly actorId: string
  readonly actorKind: FeedbackActorKind
}

/** Append-only designer feedback. */
export interface DesignerFeedback extends FeedbackEnvelope {
  readonly id: DesignerFeedbackId
  readonly subjectRef: FeedbackSubjectRef
  readonly action: FeedbackAction
  readonly reasonCodes: readonly FeedbackReasonCode[]
  readonly reasonText: string | null
  readonly modifications: readonly FeedbackModification[]
  readonly professionalValidity: ProfessionalValidity
  readonly revisionEffort: RevisionEffort
  readonly timeSavedEstimate: TimeSavedEstimate | null
  readonly feedbackActor: FeedbackActor
  readonly followUpNeeded: boolean
  readonly followUpNote: string | null
}

/** Append-only statement of whether outcome data exists. No numeric value. */
export interface OutcomeAvailability extends FeedbackEnvelope {
  readonly id: OutcomeAvailabilityId
  readonly deliverableRef: ExactSubjectRef
  readonly conceptRef: ExactSubjectRef
  readonly availability: OutcomeAvailabilityState
  readonly reasonCode: string
  readonly reasonText: string | null
  readonly expectedAfter: string | null
  readonly asOf: string
  readonly actor: FeedbackActor
}

/** Append-only development event. Stage is not a sales or success claim. */
export interface DevelopmentEvent extends FeedbackEnvelope {
  readonly id: DevelopmentEventId
  readonly deliverableRef: ExactSubjectRef
  readonly conceptRef: ExactSubjectRef
  readonly stage: DevelopmentStage
  readonly occurredAt: string
  readonly marketRegion: string | null
  readonly channel: string | null
  readonly businessContext: string
  readonly sourceType: OutcomeSourceType
  readonly sourceRef: OutcomeSourceRef
  readonly verificationStatus: VerificationStatus
  readonly limitations: readonly string[]
  readonly actor: FeedbackActor
}

/** Versioned metric definition. Custom rows are project-scoped. */
export interface OutcomeMetricDefinitionRef {
  readonly id: OutcomeMetricDefinitionId
  readonly projectId: ProjectId | null
  readonly metricKey: string
  readonly definitionVersion: string
  readonly displayName: string
  readonly valueType: MetricValueType
  readonly unit: string
  readonly aggregationSemantics: AggregationSemantics
  readonly description: string
  readonly requiredDimensions: readonly string[]
  readonly scope: 'catalog' | 'project'
  readonly limitations: readonly string[]
}

/** Structured source pointer. A bare URL is not enough. */
export interface OutcomeSourceRef {
  readonly sourceKind: OutcomeSourceKind
  readonly ref: string
  readonly locator: string | null
  readonly recordedOrExportedAt: string
  readonly usageBoundary: string
  readonly contentHash: string | null
  readonly providerName: string | null
  readonly note: string | null
}

/** One metric point, or an explicit unavailable tombstone. Never a fake zero. */
export type MetricValue =
  | { readonly kind: 'integer'; readonly value: number }
  | { readonly kind: 'decimal_string'; readonly value: string }
  | { readonly kind: 'ratio'; readonly numerator: number; readonly denominator: number }
  | { readonly kind: 'unavailable'; readonly reason: string }

/** Measurement window. start must be strictly before end. */
export interface MeasurementWindow {
  readonly start: string
  readonly end: string
  readonly timezone: string
}

/** One observed metric. causalClaim is fixed to none. */
export interface OutcomeMetricObservation extends FeedbackEnvelope {
  readonly id: OutcomeMetricObservationId
  readonly deliverableRef: ExactSubjectRef
  readonly conceptRef: ExactSubjectRef
  readonly metricDefinitionRef: {
    readonly metricKey: string
    readonly definitionVersion: string
  }
  readonly value: MetricValue
  readonly currencyCode: string | null
  readonly measurementWindow: MeasurementWindow
  readonly observedAt: string
  readonly marketRegion: string
  readonly channel: string
  readonly sourceType: OutcomeSourceType
  readonly sourceRef: OutcomeSourceRef
  readonly sourceFieldName: string | null
  readonly verificationStatus: VerificationStatus
  readonly dimensions: readonly string[]
  readonly limitations: readonly string[]
  readonly causalClaim: 'none'
  readonly actor: FeedbackActor
}

/** Current feedback heads grouped by subject, plus full history. */
export interface FeedbackSummary {
  readonly projectId: ProjectId
  readonly current: readonly DesignerFeedback[]
  readonly history: readonly DesignerFeedback[]
}

/** Current availability is the newest unsuperseded head. History stays. */
export interface CurrentOutcomeAvailability {
  readonly projectId: ProjectId
  readonly deliverableRef: ExactSubjectRef
  readonly current: OutcomeAvailability | null
  readonly history: readonly OutcomeAvailability[]
}

/** Current stage is the newest unsuperseded event by occurredAt, then recordedAt, then id. */
export interface CurrentDevelopmentStage {
  readonly projectId: ProjectId
  readonly deliverableRef: ExactSubjectRef
  readonly current: DevelopmentEvent | null
  readonly timeline: readonly DevelopmentEvent[]
}

/** Raw metric points. No cross-dimension total. */
export interface MetricTimeline {
  readonly projectId: ProjectId
  readonly deliverableRef: ExactSubjectRef
  readonly points: readonly OutcomeMetricObservation[]
}

/** Deliverable-to-feedback-to-stage-to-metric projection. No causal conclusion. */
export interface OutcomeTimeline {
  readonly projectId: ProjectId
  readonly feedback: FeedbackSummary
  readonly availability: readonly OutcomeAvailability[]
  readonly development: readonly DevelopmentEvent[]
  readonly metrics: readonly OutcomeMetricObservation[]
}

declare module '@deepseek-ai/dsh-typert-protocol' {
  interface RemoteErrorDetailsMap {
    'fashion-feedback/not-found': { readonly id: string }
    'fashion-feedback/cross-project': { readonly projectId: ProjectId; readonly otherProjectId: string }
    'fashion-feedback/project-read-only': { readonly projectId: ProjectId }
    'fashion-feedback/target-revision-missing': { readonly subjectId: string }
    'fashion-feedback/target-stale-warning': { readonly subjectId: string; readonly expected: number; readonly actual: number }
    'fashion-feedback/invalid-input': { readonly reason: string }
    'fashion-feedback/invalid-transition': { readonly reason: string }
    'fashion-feedback/revision-conflict': { readonly reason: string }
    'fashion-feedback/human-required': { readonly reason: string }
    'fashion-feedback/supersedes-conflict': { readonly expectedHead: string; readonly actualHead: string }
    'fashion-feedback/availability-value-forbidden': { readonly availability: string }
    'fashion-feedback/metric-definition-mismatch': { readonly reason: string }
    'fashion-feedback/unit-mismatch': { readonly reason: string }
    'fashion-feedback/currency-required': { readonly metricKey: string }
    'fashion-feedback/invalid-window': { readonly reason: string }
    'fashion-feedback/source-required': { readonly reason: string }
    'fashion-feedback/source-restricted': { readonly ref: string }
    'fashion-feedback/artifact-unavailable': { readonly ref: string }
    'fashion-feedback/seed-conflict': { readonly reason: string }
    'fashion-feedback/project-not-found': { readonly projectId: ProjectId }
  }
}
