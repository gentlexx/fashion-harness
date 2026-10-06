/**
 * Serializable Fashion Evaluation Remote request values.
 * Actor kind and verdict are not client-writable fields.
 * @module @gentlexx/dsh-api-fashion-evaluation-controller/src/types
 */

import type { ProjectId } from '@gentlexx/dsh-fashion-project/types'
import type {
  CurrentImprovement,
  EvaluationCase,
  EvaluationDefinition,
  EvaluationReportArtifact,
  EvaluationRun,
  HumanAssessment,
  HumanRating,
  ImprovementAction,
  RuleResult,
} from '@gentlexx/dsh-fashion-evaluation/types'

/** Project-scoped request. */
export interface EvaluationScopeRequest {
  readonly projectId: ProjectId
}

/** Run evaluation. */
export interface RunEvaluationRequest {
  readonly projectId: ProjectId
  readonly definitionId: string
  readonly caseIds: readonly string[]
}

/** Get one run. */
export interface GetRunRequest {
  readonly runId: string
}

/** Get rule results. */
export interface GetRuleResultsRequest {
  readonly runId: string
}

/** Record human assessment. Host stamps local_human. */
export interface RecordAssessmentRequest {
  readonly projectId: ProjectId
  readonly runId: string
  readonly criterionId: string
  readonly rating: HumanRating
  readonly reason: string
}

/** Supersede assessment. */
export interface SupersedeAssessmentRequest extends RecordAssessmentRequest {
  readonly supersedesAssessmentId: string
  readonly expectedHeadId: string
}

/** Propose improvements from failures. */
export interface ProposeImprovementRequest {
  readonly projectId: ProjectId
  readonly runId: string
}

/** Record improvement decision. */
export interface ImprovementDecisionRequest {
  readonly projectId: ProjectId
  readonly itemId: string
  readonly action: ImprovementAction
  readonly reason: string
  readonly resolutionRefs?: readonly string[]
  readonly confirmedPlanner: boolean
}

/** Get improvement item. */
export interface GetImprovementRequest {
  readonly projectId: ProjectId
  readonly itemId: string
}

export type EvaluationDefinitionValue = EvaluationDefinition
export type EvaluationCaseValue = EvaluationCase
export type EvaluationRunValue = EvaluationRun
export type RuleResultValue = RuleResult
export type HumanAssessmentValue = HumanAssessment
export type ImprovementValue = CurrentImprovement
export type EvaluationReportValue = EvaluationReportArtifact
