/**
 * Public type vocabulary of the Fashion Evaluation domain.
 * Types only — factories and errors live in runtime modules.
 * @module @gentlexx/dsh-fashion-evaluation/src/types
 */

import type { Branded } from '@deepseek-ai/dsh-brand'
import type { ProjectId } from '@gentlexx/dsh-fashion-project/types'
import type {} from '@deepseek-ai/dsh-typert-protocol'
import type { EvaluationSnapshot, RuleOutcome, RuleStatus } from './rules.ts'

/** Stable EvaluationDefinition identity. */
export type EvaluationDefinitionId = Branded<'FashionEvaluationDefinitionId'>

/** Stable EvaluationCase identity. */
export type EvaluationCaseId = Branded<'FashionEvaluationCaseId'>

/** Stable EvaluationRun identity. */
export type EvaluationRunId = Branded<'FashionEvaluationRunId'>

/** Stable RuleResult identity. */
export type RuleResultId = Branded<'FashionRuleResultId'>

/** Stable HumanAssessment identity. */
export type HumanAssessmentId = Branded<'FashionHumanAssessmentId'>

/** Stable ImprovementItem identity. */
export type ImprovementItemId = Branded<'FashionImprovementItemId'>

/** Stable ImprovementEvent identity. */
export type ImprovementEventId = Branded<'FashionImprovementEventId'>

/** Stable EvaluationReportArtifact identity. */
export type EvaluationReportArtifactId = Branded<'FashionEvaluationReportArtifactId'>

/** Storage schema generation for fashion_evaluation rows. */
export const FASHION_EVALUATION_SCHEMA_VERSION = 0

/** How an evaluation record entered storage. */
export type EvaluationOrigin = 'system_evaluation' | 'manual_entry' | 'recorded_seed'

/** Whether the record describes real work, a user test, or a recorded demo. */
export type EvaluationDataReality = 'real_work' | 'user_test' | 'recorded_demo'

/** Visibility of an evaluation record. */
export type EvaluationVisibility = 'project_private' | 'internal_demo' | 'public_rebuild' | 'view_only'

/** Host-owned human actor kinds for assessments. */
export type EvaluationActorKind = 'local_human' | 'recorded_demo_human'

/** Definition publication status. */
export type DefinitionStatus = 'draft' | 'published' | 'retired'

/** Case publication status. */
export type CaseStatus = 'draft' | 'published' | 'archived'

/** Case execution mode. */
export type CaseMode = 'project_snapshot' | 'isolated_fixture'

/** Fixture kind for an EvaluationCase. */
export type FixtureKind = 'recorded_public' | 'synthetic_negative' | 'private_real_opt_in' | 'queue_exercise'

/** Run execution status (completion), separate from verdict. */
export type ExecutionStatus = 'completed' | 'partial' | 'failed' | 'cancelled'

/** Run verdict derived by Host passPolicy. */
export type RunVerdict = 'pass' | 'partial' | 'fail' | 'error'

/** Human rubric rating. */
export type HumanRating = 'meets' | 'partly_meets' | 'does_not_meet' | 'unable_to_assess'

/** Improvement event actions. */
export type ImprovementAction =
  | 'proposed'
  | 'accepted'
  | 'deferred'
  | 'planned'
  | 'resolved'
  | 'wont_fix'
  | 'superseded'
  | 'reopened'

/** Exact upstream ref frozen into a snapshot. */
export interface ExactEvalRef {
  readonly type: string
  readonly id: string
  readonly revision: number
  readonly projectId: string
  readonly contentHash: string | null
}

/** Shared envelope fields on durable evaluation rows. */
export interface EvaluationEnvelope {
  readonly projectId: ProjectId | null
  readonly schemaVersion: typeof FASHION_EVALUATION_SCHEMA_VERSION
  readonly origin: EvaluationOrigin
  readonly dataReality: EvaluationDataReality
  readonly visibility: EvaluationVisibility
  readonly createdBy: string
  readonly createdAt: string
  readonly contentVersion: number
  readonly archivedAt: string | null
}

/** Published rule definition row embedded in a Definition. */
export interface RuleDefinitionRef {
  readonly ruleId: string
  readonly ruleVersion: string
  readonly category: string
  readonly title: string
  readonly severity: RuleOutcome['severity']
  readonly required: boolean
}

/** Pass policy fixed for closed-loop-integrity-v0. */
export interface PassPolicy {
  readonly requiredErrorIsError: true
  readonly blockerOrMajorFailIsFail: true
  readonly minorFailIsPartial: true
  readonly warningNotPass: true
  readonly notApplicableNotPass: true
}

/** EvaluationDefinition view. */
export interface EvaluationDefinition extends EvaluationEnvelope {
  readonly id: EvaluationDefinitionId
  readonly definitionVersion: string
  readonly name: string
  readonly objective: string
  readonly scope: 'closed_loop_integrity' | 'project_snapshot'
  readonly evaluatorBundleVersion: string
  readonly ruleDefinitions: readonly RuleDefinitionRef[]
  readonly humanRubricRef: string | null
  readonly passPolicy: PassPolicy
  readonly status: DefinitionStatus
  readonly contentHash: string
}

/** EvaluationCase view. */
export interface EvaluationCase extends EvaluationEnvelope {
  readonly id: EvaluationCaseId
  readonly caseVersion: string
  readonly title: string
  readonly objective: string
  readonly caseMode: CaseMode
  readonly fixtureKind: FixtureKind
  readonly inputHash: string
  readonly expectedRuleOutcomes: readonly { readonly ruleId: string; readonly status: RuleStatus }[]
  readonly expectedVerdict: RunVerdict
  readonly failureIntent: 'regression' | 'queue_exercise' | null
  readonly usageBoundary: string
  readonly status: CaseStatus
  readonly contentHash: string
  readonly snapshot: EvaluationSnapshot
}

/** EvaluationRun view. */
export interface EvaluationRun extends EvaluationEnvelope {
  readonly id: EvaluationRunId
  readonly definitionRef: { readonly id: string; readonly definitionVersion: string }
  readonly caseRefs: readonly string[]
  readonly inputHashes: readonly string[]
  readonly systemVersion: {
    readonly baseTag: string
    readonly baseSha: string
    readonly worktreeHead: string | null
    readonly dirtyStateHash: string | null
  }
  readonly profile: string
  readonly evaluatorBundleVersion: string
  readonly startedAt: string
  readonly finishedAt: string
  readonly executor: 'local_human_trigger' | 'test_runner' | 'recorded_seed'
  readonly executionStatus: ExecutionStatus
  readonly verdict: RunVerdict
  readonly ruleResultRefs: readonly string[]
  readonly humanAssessmentRefs: readonly string[]
  readonly reportArtifactRefs: readonly string[]
  readonly limitations: readonly string[]
}

/** RuleResult view. */
export interface RuleResult {
  readonly id: RuleResultId
  readonly runId: EvaluationRunId
  readonly ruleId: string
  readonly caseId: string
  readonly status: RuleStatus
  readonly severity: RuleOutcome['severity']
  readonly required: boolean
  readonly observed: string
  readonly expected: string
  readonly message: string
  readonly evaluatorVersion: string
  readonly limitations: readonly string[]
}

/** HumanAssessment view. */
export interface HumanAssessment extends EvaluationEnvelope {
  readonly id: HumanAssessmentId
  readonly runId: EvaluationRunId
  readonly criterionId: string
  readonly rating: HumanRating
  readonly reason: string
  readonly actorKind: EvaluationActorKind
  readonly recordedAt: string
  readonly supersedesAssessmentId: string | null
}

/** ImprovementItem view. */
export interface ImprovementItem extends EvaluationEnvelope {
  readonly id: ImprovementItemId
  readonly sourceRunRefs: readonly string[]
  readonly sourceRuleResultRefs: readonly string[]
  readonly targetRefs: readonly ExactEvalRef[]
  readonly failureType: string
  readonly summary: string
  readonly impact: string
  readonly suggestedPriority: 'low' | 'medium' | 'high'
  readonly suggestedOwnerRole: string
  readonly dedupeKey: string
  readonly createdAt: string
}

/** ImprovementEvent view. */
export interface ImprovementEvent {
  readonly id: ImprovementEventId
  readonly itemId: ImprovementItemId
  readonly action: ImprovementAction
  readonly actor: 'local_planner'
  readonly reason: string
  readonly resolutionRefs: readonly string[]
  readonly occurredAt: string
}

/** Current improvement projection. */
export interface CurrentImprovement {
  readonly item: ImprovementItem
  readonly status: ImprovementAction
  readonly events: readonly ImprovementEvent[]
}

/** EvaluationReportArtifact view. */
export interface EvaluationReportArtifact {
  readonly id: EvaluationReportArtifactId
  readonly runId: EvaluationRunId
  readonly format: 'canonical_json' | 'markdown'
  readonly snapshotHash: string
  readonly contentHash: string
  readonly rendererVersion: string
  readonly generatedAt: string
  readonly visibility: EvaluationVisibility
  readonly redacted: readonly string[]
  readonly text: string
}

export type { EvaluationSnapshot, RuleOutcome, RuleStatus }

declare module '@deepseek-ai/dsh-typert-protocol' {
  interface RemoteErrorDetailsMap {
    'fashion-evaluation/not-found': { readonly reason: string }
    'fashion-evaluation/cross-project': { readonly reason: string }
    'fashion-evaluation/project-read-only': { readonly reason: string }
    'fashion-evaluation/definition-not-published': { readonly reason: string }
    'fashion-evaluation/case-not-published': { readonly reason: string }
    'fashion-evaluation/version-conflict': { readonly reason: string }
    'fashion-evaluation/human-required': { readonly reason: string }
    'fashion-evaluation/assessment-head-conflict': { readonly reason: string }
    'fashion-evaluation/improvement-transition-invalid': { readonly reason: string }
    'fashion-evaluation/planner-confirmation-required': { readonly reason: string }
    'fashion-evaluation/seed-conflict': { readonly reason: string }
    'fashion-evaluation/invalid-expected-outcome': { readonly reason: string }
  }
}
