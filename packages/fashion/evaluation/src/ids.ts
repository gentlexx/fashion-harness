/**
 * Branded identity factories for Fashion Evaluation.
 * @module @gentlexx/dsh-fashion-evaluation/src/ids
 */

import { brandString } from '@deepseek-ai/dsh-brand'
import type {
  EvaluationCaseId,
  EvaluationDefinitionId,
  EvaluationReportArtifactId,
  EvaluationRunId,
  HumanAssessmentId,
  ImprovementEventId,
  ImprovementItemId,
  RuleResultId,
} from './types.ts'

/** @param id - Raw definition id. @returns branded EvaluationDefinitionId. */
export function EvaluationDefinitionId(id: string): EvaluationDefinitionId {
  return brandString<EvaluationDefinitionId>(id)
}

/** @param id - Raw case id. @returns branded EvaluationCaseId. */
export function EvaluationCaseId(id: string): EvaluationCaseId {
  return brandString<EvaluationCaseId>(id)
}

/** @param id - Raw run id. @returns branded EvaluationRunId. */
export function EvaluationRunId(id: string): EvaluationRunId {
  return brandString<EvaluationRunId>(id)
}

/** @param id - Raw rule result id. @returns branded RuleResultId. */
export function RuleResultId(id: string): RuleResultId {
  return brandString<RuleResultId>(id)
}

/** @param id - Raw assessment id. @returns branded HumanAssessmentId. */
export function HumanAssessmentId(id: string): HumanAssessmentId {
  return brandString<HumanAssessmentId>(id)
}

/** @param id - Raw improvement item id. @returns branded ImprovementItemId. */
export function ImprovementItemId(id: string): ImprovementItemId {
  return brandString<ImprovementItemId>(id)
}

/** @param id - Raw improvement event id. @returns branded ImprovementEventId. */
export function ImprovementEventId(id: string): ImprovementEventId {
  return brandString<ImprovementEventId>(id)
}

/** @param id - Raw report artifact id. @returns branded EvaluationReportArtifactId. */
export function EvaluationReportArtifactId(id: string): EvaluationReportArtifactId {
  return brandString<EvaluationReportArtifactId>(id)
}
