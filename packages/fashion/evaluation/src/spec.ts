/**
 * Fashion Evaluation domain declaration opened by the registry.
 * @module @gentlexx/dsh-fashion-evaluation/src/spec
 */

import { defineDomain, domainTable } from '@deepseek-ai/dsh-storage-domain'
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
import {
  evaluationCaseRecordV0,
  evaluationDefinitionRecordV0,
  evaluationReportArtifactRecordV0,
  evaluationRunRecordV0,
  humanAssessmentRecordV0,
  improvementEventRecordV0,
  improvementItemRecordV0,
  ruleResultRecordV0,
  type EvaluationCaseRecordV0,
  type EvaluationDefinitionRecordV0,
  type EvaluationReportArtifactRecordV0,
  type EvaluationRunRecordV0,
  type HumanAssessmentRecordV0,
  type ImprovementEventRecordV0,
  type ImprovementItemRecordV0,
  type RuleResultRecordV0,
} from './schema/v0/records.ts'

/** Current Storage Domain version for fashion_evaluation. */
export const FASHION_EVALUATION_DOMAIN_VERSION = 0

/**
 * Domain `fashion_evaluation@0`: authoritative tables for evaluation and improvement.
 * Invalid records reject open; no compatibleVersions in v0.
 */
export const fashionEvaluationDomainSpec = defineDomain({
  name: 'fashion_evaluation',
  version: FASHION_EVALUATION_DOMAIN_VERSION,
  tables: {
    evaluation_definitions: domainTable<EvaluationDefinitionId, EvaluationDefinitionRecordV0>(evaluationDefinitionRecordV0),
    evaluation_cases: domainTable<EvaluationCaseId, EvaluationCaseRecordV0>(evaluationCaseRecordV0),
    evaluation_runs: domainTable<EvaluationRunId, EvaluationRunRecordV0>(evaluationRunRecordV0),
    rule_results: domainTable<RuleResultId, RuleResultRecordV0>(ruleResultRecordV0),
    human_assessments: domainTable<HumanAssessmentId, HumanAssessmentRecordV0>(humanAssessmentRecordV0),
    improvement_items: domainTable<ImprovementItemId, ImprovementItemRecordV0>(improvementItemRecordV0),
    improvement_events: domainTable<ImprovementEventId, ImprovementEventRecordV0>(improvementEventRecordV0),
    evaluation_report_artifacts: domainTable<EvaluationReportArtifactId, EvaluationReportArtifactRecordV0>(
      evaluationReportArtifactRecordV0,
    ),
  },
})

export type {
  EvaluationCaseRecordV0,
  EvaluationDefinitionRecordV0,
  EvaluationReportArtifactRecordV0,
  EvaluationRunRecordV0,
  HumanAssessmentRecordV0,
  ImprovementEventRecordV0,
  ImprovementItemRecordV0,
  RuleResultRecordV0,
}
