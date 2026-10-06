/**
 * Fashion Evaluation Remote command projection onto the Host registry.
 * @module @gentlexx/dsh-api-fashion-evaluation-controller/src/commands
 */

import type { Context } from '@deepseek-ai/cordis'
import { ProjectId } from '@gentlexx/dsh-fashion-project'
import {
  EvaluationCaseId,
  EvaluationDefinitionId,
  EvaluationRunId,
  FashionEvaluationError,
  HumanAssessmentId,
  ImprovementItemId,
} from '@gentlexx/dsh-fashion-evaluation'
import { RemoteError } from '@deepseek-ai/dsh-typert-protocol'
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

/** Maps registry operations onto serializable Remote values. */
export class FashionEvaluationCommands {
  /** @param ctx - Host context providing fashionEvaluationRegistry. */
  constructor(private readonly ctx: Context) {}

  /** List definitions. */
  listDefinitions(): readonly EvaluationDefinitionValue[] {
    return this.runSync(() => this.ctx.fashionEvaluationRegistry.listDefinitions())
  }

  /** List cases. */
  listCases(): readonly EvaluationCaseValue[] {
    return this.runSync(() => this.ctx.fashionEvaluationRegistry.listCases())
  }

  /** @param request - run evaluation. */
  runEvaluation(request: RunEvaluationRequest): Promise<EvaluationRunValue> {
    return this.run(() => this.ctx.fashionEvaluationRegistry.runEvaluation({
      projectId: ProjectId(String(request.projectId)),
      definitionId: EvaluationDefinitionId(request.definitionId),
      caseIds: request.caseIds.map(EvaluationCaseId),
    }))
  }

  /** @param request - get one run. */
  getEvaluationRun(request: GetRunRequest): EvaluationRunValue {
    return this.runSync(() => this.ctx.fashionEvaluationRegistry.getEvaluationRun(EvaluationRunId(request.runId)))
  }

  /** @param request - list runs. */
  listEvaluationRuns(request: EvaluationScopeRequest): readonly EvaluationRunValue[] {
    return this.runSync(() => this.ctx.fashionEvaluationRegistry.listEvaluationRuns(ProjectId(String(request.projectId))))
  }

  /** @param request - rule results. */
  getRuleResults(request: GetRuleResultsRequest): readonly RuleResultValue[] {
    return this.runSync(() => this.ctx.fashionEvaluationRegistry.getRuleResults(EvaluationRunId(request.runId)))
  }

  /** @param request - record assessment. */
  recordHumanAssessment(request: RecordAssessmentRequest): Promise<HumanAssessmentValue> {
    return this.run(() => this.ctx.fashionEvaluationRegistry.recordHumanAssessment({
      projectId: ProjectId(String(request.projectId)),
      runId: EvaluationRunId(request.runId),
      criterionId: request.criterionId,
      rating: request.rating,
      reason: request.reason,
    }))
  }

  /** @param request - supersede assessment. */
  supersedeHumanAssessment(request: SupersedeAssessmentRequest): Promise<HumanAssessmentValue> {
    return this.run(() => this.ctx.fashionEvaluationRegistry.supersedeHumanAssessment({
      projectId: ProjectId(String(request.projectId)),
      runId: EvaluationRunId(request.runId),
      criterionId: request.criterionId,
      rating: request.rating,
      reason: request.reason,
      supersedesAssessmentId: HumanAssessmentId(request.supersedesAssessmentId),
      expectedHeadId: HumanAssessmentId(request.expectedHeadId),
    }))
  }

  /** @param request - list assessments. */
  listHumanAssessments(request: GetRunRequest): readonly HumanAssessmentValue[] {
    return this.runSync(() => this.ctx.fashionEvaluationRegistry.listHumanAssessments(EvaluationRunId(request.runId)))
  }

  /** @param request - propose improvements. */
  proposeImprovementFromFailures(request: ProposeImprovementRequest): Promise<readonly ImprovementValue['item'][]> {
    return this.run(() => this.ctx.fashionEvaluationRegistry.proposeImprovementFromFailures({
      projectId: ProjectId(String(request.projectId)),
      runId: EvaluationRunId(request.runId),
    }))
  }

  /** @param request - improvement decision. */
  recordImprovementDecision(request: ImprovementDecisionRequest): Promise<ImprovementValue> {
    return this.run(() => this.ctx.fashionEvaluationRegistry.recordImprovementDecision({
      projectId: ProjectId(String(request.projectId)),
      itemId: ImprovementItemId(request.itemId),
      action: request.action,
      reason: request.reason,
      ...(request.resolutionRefs === undefined ? {} : { resolutionRefs: request.resolutionRefs }),
      confirmedPlanner: request.confirmedPlanner,
    }))
  }

  /**
   * Reconcile follow-up feedback and does_not_meet assessments into candidates, then list the Project's items.
   * @param request - list improvements.
   */
  listImprovementItems(request: EvaluationScopeRequest): Promise<readonly ImprovementValue[]> {
    const projectId = ProjectId(String(request.projectId))
    return this.run(async () => {
      await this.ctx.fashionEvaluationRegistry.reconcileImprovementCandidates(projectId)
      return this.ctx.fashionEvaluationRegistry.listImprovementItems(projectId)
    })
  }

  /** @param request - get improvement. */
  getImprovementItem(request: GetImprovementRequest): ImprovementValue {
    return this.runSync(() => this.ctx.fashionEvaluationRegistry.getImprovementItem(
      ProjectId(String(request.projectId)),
      ImprovementItemId(request.itemId),
    ))
  }

  /** @param request - export report. */
  exportEvaluationReport(request: GetRunRequest): Promise<readonly EvaluationReportValue[]> {
    return this.run(() => this.ctx.fashionEvaluationRegistry.exportEvaluationReport(EvaluationRunId(request.runId)))
  }

  /** @param request - list reports. */
  listEvaluationReports(request: GetRunRequest): readonly EvaluationReportValue[] {
    return this.runSync(() => this.ctx.fashionEvaluationRegistry.listEvaluationReports(EvaluationRunId(request.runId)))
  }

  private run<T>(fn: () => Promise<T>): Promise<T> {
    return fn().catch((error) => {
      mapEvaluationError(error)
    })
  }

  private runSync<T>(fn: () => T): T {
    try {
      return fn()
    } catch (error) {
      mapEvaluationError(error)
    }
  }
}

function mapEvaluationError(error: unknown): never {
  if (error instanceof FashionEvaluationError) {
    const details = { reason: error.message }
    switch (error.code) {
      case 'not-found':
        throw new RemoteError('fashion-evaluation/not-found', error.message, details)
      case 'cross-project':
        throw new RemoteError('fashion-evaluation/cross-project', error.message, details)
      case 'project-read-only':
        throw new RemoteError('fashion-evaluation/project-read-only', error.message, details)
      case 'definition-not-published':
        throw new RemoteError('fashion-evaluation/definition-not-published', error.message, details)
      case 'case-not-published':
        throw new RemoteError('fashion-evaluation/case-not-published', error.message, details)
      case 'version-conflict':
        throw new RemoteError('fashion-evaluation/version-conflict', error.message, details)
      case 'human-required':
        throw new RemoteError('fashion-evaluation/human-required', error.message, details)
      case 'assessment-head-conflict':
        throw new RemoteError('fashion-evaluation/assessment-head-conflict', error.message, details)
      case 'improvement-transition-invalid':
        throw new RemoteError('fashion-evaluation/improvement-transition-invalid', error.message, details)
      case 'planner-confirmation-required':
        throw new RemoteError('fashion-evaluation/planner-confirmation-required', error.message, details)
      case 'seed-conflict':
        throw new RemoteError('fashion-evaluation/seed-conflict', error.message, details)
      case 'invalid-expected-outcome':
        throw new RemoteError('fashion-evaluation/invalid-expected-outcome', error.message, details)
      default:
        throw error
    }
  }
  throw error
}
