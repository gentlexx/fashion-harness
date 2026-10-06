/**
 * Host Fashion Evaluation Remote owner.
 * @module @gentlexx/dsh-api-fashion-evaluation-controller
 */

import { Context } from '@deepseek-ai/cordis'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { FashionEvaluationCommands } from './commands.ts'
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
} from './types.ts'

export type * from './types.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Host Fashion Evaluation business API and Remote namespace owner. */
    fashionEvaluationController: FashionEvaluationController
  }
}

/** Host service backing the `fashionEvaluation` Remote namespace. */
export class FashionEvaluationController extends TypertRemoteService {
  static inject = ['typert', 'fashionEvaluationRegistry']

  private readonly commands: FashionEvaluationCommands

  /** @param ctx - Host context containing the Fashion Evaluation registry. */
  constructor(ctx: Context) {
    super(ctx, 'fashionEvaluationController', { namespace: 'fashionEvaluation' })
    this.commands = new FashionEvaluationCommands(ctx)
  }

  /** List definitions. */
  @Remote('listDefinitions')
  listDefinitions(): readonly EvaluationDefinitionValue[] {
    return this.commands.listDefinitions()
  }

  /** List cases. */
  @Remote('listCases')
  listCases(): readonly EvaluationCaseValue[] {
    return this.commands.listCases()
  }

  /** @param request - run evaluation. */
  @Remote('runEvaluation')
  runEvaluation(request: RunEvaluationRequest): Promise<EvaluationRunValue> {
    return this.commands.runEvaluation(request)
  }

  /** @param request - get one run. */
  @Remote('getEvaluationRun')
  getEvaluationRun(request: GetRunRequest): EvaluationRunValue {
    return this.commands.getEvaluationRun(request)
  }

  /** @param request - list runs. */
  @Remote('listEvaluationRuns')
  listEvaluationRuns(request: EvaluationScopeRequest): readonly EvaluationRunValue[] {
    return this.commands.listEvaluationRuns(request)
  }

  /** @param request - rule results. */
  @Remote('getRuleResults')
  getRuleResults(request: GetRuleResultsRequest): readonly RuleResultValue[] {
    return this.commands.getRuleResults(request)
  }

  /** @param request - record assessment. */
  @Remote('recordHumanAssessment')
  recordHumanAssessment(request: RecordAssessmentRequest): Promise<HumanAssessmentValue> {
    return this.commands.recordHumanAssessment(request)
  }

  /** @param request - supersede assessment. */
  @Remote('supersedeHumanAssessment')
  supersedeHumanAssessment(request: SupersedeAssessmentRequest): Promise<HumanAssessmentValue> {
    return this.commands.supersedeHumanAssessment(request)
  }

  /** @param request - list assessments. */
  @Remote('listHumanAssessments')
  listHumanAssessments(request: GetRunRequest): readonly HumanAssessmentValue[] {
    return this.commands.listHumanAssessments(request)
  }

  /** @param request - propose improvements. */
  @Remote('proposeImprovementFromFailures')
  proposeImprovementFromFailures(request: ProposeImprovementRequest): Promise<readonly ImprovementValue['item'][]> {
    return this.commands.proposeImprovementFromFailures(request)
  }

  /** @param request - improvement decision. */
  @Remote('recordImprovementDecision')
  recordImprovementDecision(request: ImprovementDecisionRequest): Promise<ImprovementValue> {
    return this.commands.recordImprovementDecision(request)
  }

  /** @param request - list improvements. */
  @Remote('listImprovementItems')
  listImprovementItems(request: EvaluationScopeRequest): Promise<readonly ImprovementValue[]> {
    return this.commands.listImprovementItems(request)
  }

  /** @param request - get improvement. */
  @Remote('getImprovementItem')
  getImprovementItem(request: GetImprovementRequest): ImprovementValue {
    return this.commands.getImprovementItem(request)
  }

  /** @param request - export report. */
  @Remote('exportEvaluationReport')
  exportEvaluationReport(request: GetRunRequest): Promise<readonly EvaluationReportValue[]> {
    return this.commands.exportEvaluationReport(request)
  }

  /** @param request - list reports. */
  @Remote('listEvaluationReports')
  listEvaluationReports(request: GetRunRequest): readonly EvaluationReportValue[] {
    return this.commands.listEvaluationReports(request)
  }
}

export default FashionEvaluationController
