/**
 * Unary Fashion Evaluation Remote calls.
 * @module @gentlexx/dsh-api-fashion-evaluation-controller/src/client/model
 */

import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol'
import type {
  EvaluationCaseValue,
  EvaluationDefinitionValue,
  EvaluationReportValue,
  EvaluationRunValue,
  EvaluationScopeRequest,
  GetImprovementRequest,
  GetRuleResultsRequest,
  GetRunRequest,
  HumanAssessmentValue,
  ImprovementDecisionRequest,
  ImprovementValue,
  ProposeImprovementRequest,
  RecordAssessmentRequest,
  RuleResultValue,
  RunEvaluationRequest,
  SupersedeAssessmentRequest,
} from '../types.ts'

/** Generated `fashionEvaluation` namespace. */
export interface FashionEvaluationRemote {
  listDefinitions(): Promise<RemoteResult<readonly EvaluationDefinitionValue[]>>
  listCases(): Promise<RemoteResult<readonly EvaluationCaseValue[]>>
  listEvaluationRuns(request: EvaluationScopeRequest): Promise<RemoteResult<readonly EvaluationRunValue[]>>
  runEvaluation(request: RunEvaluationRequest): Promise<RemoteResult<EvaluationRunValue>>
  getEvaluationRun(request: GetRunRequest): Promise<RemoteResult<EvaluationRunValue>>
  getRuleResults(request: GetRuleResultsRequest): Promise<RemoteResult<readonly RuleResultValue[]>>
  recordHumanAssessment(request: RecordAssessmentRequest): Promise<RemoteResult<HumanAssessmentValue>>
  supersedeHumanAssessment(request: SupersedeAssessmentRequest): Promise<RemoteResult<HumanAssessmentValue>>
  listHumanAssessments(request: GetRunRequest): Promise<RemoteResult<readonly HumanAssessmentValue[]>>
  listImprovementItems(request: EvaluationScopeRequest): Promise<RemoteResult<readonly ImprovementValue[]>>
  getImprovementItem(request: GetImprovementRequest): Promise<RemoteResult<ImprovementValue>>
  proposeImprovementFromFailures(request: ProposeImprovementRequest): Promise<RemoteResult<readonly ImprovementValue['item'][]>>
  recordImprovementDecision(request: ImprovementDecisionRequest): Promise<RemoteResult<ImprovementValue>>
  exportEvaluationReport(request: GetRunRequest): Promise<RemoteResult<readonly EvaluationReportValue[]>>
  listEvaluationReports(request: GetRunRequest): Promise<RemoteResult<readonly EvaluationReportValue[]>>
}

/** @param remote - Mounted fashionEvaluation namespace. */
export class ClientFashionEvaluationModel {
  constructor(private readonly remote: FashionEvaluationRemote) {}

  listDefinitions() { return unwrap(this.remote.listDefinitions()) }
  listCases() { return unwrap(this.remote.listCases()) }
  listRuns(request: EvaluationScopeRequest) { return unwrap(this.remote.listEvaluationRuns(request)) }
  runEvaluation(request: RunEvaluationRequest) { return unwrap(this.remote.runEvaluation(request)) }
  getRun(request: GetRunRequest) { return unwrap(this.remote.getEvaluationRun(request)) }
  getRuleResults(request: GetRuleResultsRequest) { return unwrap(this.remote.getRuleResults(request)) }
  recordAssessment(request: RecordAssessmentRequest) { return unwrap(this.remote.recordHumanAssessment(request)) }
  supersedeAssessment(request: SupersedeAssessmentRequest) { return unwrap(this.remote.supersedeHumanAssessment(request)) }
  listAssessments(request: GetRunRequest) { return unwrap(this.remote.listHumanAssessments(request)) }
  listImprovements(request: EvaluationScopeRequest) { return unwrap(this.remote.listImprovementItems(request)) }
  getImprovement(request: GetImprovementRequest) { return unwrap(this.remote.getImprovementItem(request)) }
  proposeImprovements(request: ProposeImprovementRequest) { return unwrap(this.remote.proposeImprovementFromFailures(request)) }
  recordImprovementDecision(request: ImprovementDecisionRequest) { return unwrap(this.remote.recordImprovementDecision(request)) }
  exportReport(request: GetRunRequest) { return unwrap(this.remote.exportEvaluationReport(request)) }
  listReports(request: GetRunRequest) { return unwrap(this.remote.listEvaluationReports(request)) }
}

function unwrap<T>(result: Promise<RemoteResult<T>>): Promise<T> {
  return result.then((value) => {
    if (!value.ok) throw value.error
    return value.value
  })
}
