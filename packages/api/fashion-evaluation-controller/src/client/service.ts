/**
 * Browser Fashion Evaluation service (`ctx.fashionEvaluation`).
 * @module @gentlexx/dsh-api-fashion-evaluation-controller/src/client/service
 */

import { Service, type Context } from '@deepseek-ai/cordis'
import type { ProjectId } from '@gentlexx/dsh-fashion-project/types'
import type { ClientFashionEvaluationModel } from './model.ts'
import type {
  GetImprovementRequest,
  GetRunRequest,
  ImprovementDecisionRequest,
  ProposeImprovementRequest,
  RecordAssessmentRequest,
  RunEvaluationRequest,
  SupersedeAssessmentRequest,
} from '../types.ts'

/** Methods the Fashion shell calls. Verdict and actor kind are not parameters. */
export interface FashionEvaluationClient {
  listDefinitions(): ReturnType<ClientFashionEvaluationModel['listDefinitions']>
  listCases(): ReturnType<ClientFashionEvaluationModel['listCases']>
  listRuns(projectId: string): ReturnType<ClientFashionEvaluationModel['listRuns']>
  runEvaluation(request: RunEvaluationRequest): ReturnType<ClientFashionEvaluationModel['runEvaluation']>
  getRuleResults(runId: string): ReturnType<ClientFashionEvaluationModel['getRuleResults']>
  recordAssessment(request: RecordAssessmentRequest): ReturnType<ClientFashionEvaluationModel['recordAssessment']>
  supersedeAssessment(request: SupersedeAssessmentRequest): ReturnType<ClientFashionEvaluationModel['supersedeAssessment']>
  listAssessments(request: GetRunRequest): ReturnType<ClientFashionEvaluationModel['listAssessments']>
  listImprovements(projectId: string): ReturnType<ClientFashionEvaluationModel['listImprovements']>
  proposeImprovements(request: ProposeImprovementRequest): ReturnType<ClientFashionEvaluationModel['proposeImprovements']>
  recordImprovementDecision(request: ImprovementDecisionRequest): ReturnType<ClientFashionEvaluationModel['recordImprovementDecision']>
  getImprovement(request: GetImprovementRequest): ReturnType<ClientFashionEvaluationModel['getImprovement']>
  exportReport(runId: string): ReturnType<ClientFashionEvaluationModel['exportReport']>
  listReports(runId: string): ReturnType<ClientFashionEvaluationModel['listReports']>
}

/** @param ctx - Client context. @param model - Remote model. */
export class FashionEvaluationService extends Service implements FashionEvaluationClient {
  constructor(ctx: Context, private readonly model: ClientFashionEvaluationModel) {
    super(ctx, 'fashionEvaluation')
  }

  listDefinitions() { return this.model.listDefinitions() }
  listCases() { return this.model.listCases() }
  listRuns(projectId: string) { return this.model.listRuns({ projectId: projectId as ProjectId }) }
  runEvaluation(request: RunEvaluationRequest) { return this.model.runEvaluation(request) }
  getRuleResults(runId: string) { return this.model.getRuleResults({ runId }) }
  recordAssessment(request: RecordAssessmentRequest) { return this.model.recordAssessment(request) }
  supersedeAssessment(request: SupersedeAssessmentRequest) { return this.model.supersedeAssessment(request) }
  listAssessments(request: GetRunRequest) { return this.model.listAssessments(request) }
  listImprovements(projectId: string) { return this.model.listImprovements({ projectId: projectId as ProjectId }) }
  proposeImprovements(request: ProposeImprovementRequest) { return this.model.proposeImprovements(request) }
  recordImprovementDecision(request: ImprovementDecisionRequest) { return this.model.recordImprovementDecision(request) }
  getImprovement(request: GetImprovementRequest) { return this.model.getImprovement(request) }
  exportReport(runId: string) { return this.model.exportReport({ runId }) }
  listReports(runId: string) { return this.model.listReports({ runId }) }
}
