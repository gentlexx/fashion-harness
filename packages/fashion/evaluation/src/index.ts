/**
 * Fashion Evaluation registry (`ctx.fashionEvaluationRegistry`): durable
 * Definition, Case, Run, Assessment, and Improvement over `fashion_evaluation@0`.
 * @module @gentlexx/dsh-fashion-evaluation
 */

import {
  EvaluationCaseId as brandCaseId,
  EvaluationDefinitionId as brandDefinitionId,
  EvaluationReportArtifactId as brandReportId,
  EvaluationRunId as brandRunId,
  HumanAssessmentId as brandAssessmentId,
  ImprovementEventId as brandEventId,
  ImprovementItemId as brandItemId,
  RuleResultId as brandResultId,
} from './ids.ts'
import type {
  EvaluationCaseId as EvaluationCaseIdBrand,
  EvaluationDefinitionId as EvaluationDefinitionIdBrand,
  EvaluationReportArtifactId as EvaluationReportArtifactIdBrand,
  EvaluationRunId as EvaluationRunIdBrand,
  HumanAssessmentId as HumanAssessmentIdBrand,
  ImprovementEventId as ImprovementEventIdBrand,
  ImprovementItemId as ImprovementItemIdBrand,
  RuleResultId as RuleResultIdBrand,
} from './types.ts'

export type {
  CaseMode,
  CaseStatus,
  CurrentImprovement,
  DefinitionStatus,
  EvaluationActorKind,
  EvaluationCase,
  EvaluationDataReality,
  EvaluationDefinition,
  EvaluationEnvelope,
  EvaluationOrigin,
  EvaluationReportArtifact,
  EvaluationRun,
  EvaluationSnapshot,
  EvaluationVisibility,
  ExactEvalRef,
  ExecutionStatus,
  FixtureKind,
  HumanAssessment,
  HumanRating,
  ImprovementAction,
  ImprovementEvent,
  ImprovementItem,
  PassPolicy,
  RuleDefinitionRef,
  RuleOutcome,
  RuleResult,
  RuleStatus,
  RunVerdict,
} from './types.ts'
export { FASHION_EVALUATION_SCHEMA_VERSION } from './types.ts'

/** Branded identities; factories below share these names. */
export type EvaluationDefinitionId = EvaluationDefinitionIdBrand
export type EvaluationCaseId = EvaluationCaseIdBrand
export type EvaluationRunId = EvaluationRunIdBrand
export type RuleResultId = RuleResultIdBrand
export type HumanAssessmentId = HumanAssessmentIdBrand
export type ImprovementItemId = ImprovementItemIdBrand
export type ImprovementEventId = ImprovementEventIdBrand
export type EvaluationReportArtifactId = EvaluationReportArtifactIdBrand

/** @param id - Raw id. @returns branded EvaluationDefinitionId. */
export function EvaluationDefinitionId(id: string): EvaluationDefinitionId {
  return brandDefinitionId(id)
}
/** @param id - Raw id. @returns branded EvaluationCaseId. */
export function EvaluationCaseId(id: string): EvaluationCaseId {
  return brandCaseId(id)
}
/** @param id - Raw id. @returns branded EvaluationRunId. */
export function EvaluationRunId(id: string): EvaluationRunId {
  return brandRunId(id)
}
/** @param id - Raw id. @returns branded RuleResultId. */
export function RuleResultId(id: string): RuleResultId {
  return brandResultId(id)
}
/** @param id - Raw id. @returns branded HumanAssessmentId. */
export function HumanAssessmentId(id: string): HumanAssessmentId {
  return brandAssessmentId(id)
}
/** @param id - Raw id. @returns branded ImprovementItemId. */
export function ImprovementItemId(id: string): ImprovementItemId {
  return brandItemId(id)
}
/** @param id - Raw id. @returns branded ImprovementEventId. */
export function ImprovementEventId(id: string): ImprovementEventId {
  return brandEventId(id)
}
/** @param id - Raw id. @returns branded EvaluationReportArtifactId. */
export function EvaluationReportArtifactId(id: string): EvaluationReportArtifactId {
  return brandReportId(id)
}

export {
  FashionEvaluationAssessmentHeadConflictError,
  FashionEvaluationCaseNotPublishedError,
  FashionEvaluationCrossProjectError,
  FashionEvaluationDefinitionNotPublishedError,
  FashionEvaluationError,
  FashionEvaluationHumanRequiredError,
  FashionEvaluationImprovementTransitionError,
  FashionEvaluationInvalidInputError,
  FashionEvaluationNotFoundError,
  FashionEvaluationPlannerConfirmationError,
  FashionEvaluationProjectNotFoundError,
  FashionEvaluationProjectReadOnlyError,
  FashionEvaluationSeedConflictError,
  FashionEvaluationVersionConflictError,
} from './errors.ts'

export { compareEvaluationCreatedDesc } from './order.ts'
export type { EvaluationCreatedOrderable } from './order.ts'
export { FASHION_EVALUATION_DOMAIN_VERSION, fashionEvaluationDomainSpec } from './spec.ts'
export {
  CLOSED_LOOP_RULE_IDS,
  deriveVerdict,
  evaluateSnapshot,
} from './rules.ts'
export { NEGATIVE_CASES } from './fixtures.ts'
export { REPORT_RENDERER_VERSION, renderReport } from './report.ts'
export {
  EVALUATOR_BUNDLE_VERSION,
  HUMAN_RUBRIC_CRITERIA,
  HUMAN_RUBRIC_REF,
  QUEUE_EXERCISE_CASE_ID,
  R0_DEFINITION_ID,
  R0_POSITIVE_CASE_ID,
  R0_POSITIVE_SNAPSHOT,
  R0_RUN_ID,
  hashContent,
} from './catalog.ts'
export {
  FashionEvaluationRegistry,
} from './registry.ts'
export { FashionEvaluationRegistry as default } from './registry.ts'
