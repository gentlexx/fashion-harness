/**
 * Fashion Feedback Remote command projection onto the Host registry.
 * @module @gentlexx/dsh-api-fashion-feedback-controller/src/commands
 */

import type { Context } from '@deepseek-ai/cordis'
import { ProjectId } from '@gentlexx/dsh-fashion-project'
import {
  DesignerFeedbackId,
  FashionFeedbackAvailabilityValueForbiddenError,
  FashionFeedbackCrossProjectError,
  FashionFeedbackCurrencyRequiredError,
  FashionFeedbackHumanRequiredError,
  FashionFeedbackInvalidInputError,
  FashionFeedbackInvalidWindowError,
  FashionFeedbackMetricDefinitionMismatchError,
  FashionFeedbackNotFoundError,
  FashionFeedbackProjectNotFoundError,
  FashionFeedbackProjectReadOnlyError,
  FashionFeedbackRevisionConflictError,
  FashionFeedbackSeedConflictError,
  FashionFeedbackSourceRequiredError,
  FashionFeedbackSupersedesConflictError,
  FashionFeedbackTargetRevisionMissingError,
  FashionFeedbackTargetStaleError,
  FashionFeedbackUnitMismatchError,
} from '@gentlexx/dsh-fashion-feedback'
import { RemoteError } from '@deepseek-ai/dsh-typert-protocol'
import type {
  DeliverableScopeRequest,
  DesignerFeedbackValue,
  DevelopmentEventValue,
  FeedbackScopeRequest,
  FeedbackSummaryValue,
  GetFeedbackRequest,
  MetricDefinitionValue,
  MetricObservationValue,
  OutcomeAvailabilityValue,
  OutcomeTimelineValue,
  RecordAvailabilityRequest,
  RecordDevelopmentRequest,
  RecordFeedbackRequest,
  RecordMetricRequest,
  SupersedeFeedbackRequest,
} from './types.ts'

/** Maps registry operations onto serializable Remote values. */
export class FashionFeedbackCommands {
  /** @param ctx - Host context providing fashionFeedbackRegistry. */
  constructor(private readonly ctx: Context) {}

  /** @param request - record feedback. Actor kind is not accepted. */
  recordFeedback(request: RecordFeedbackRequest): Promise<DesignerFeedbackValue> {
    return this.run(() => this.ctx.fashionFeedbackRegistry.recordFeedback({
      ...request,
      projectId: ProjectId(String(request.projectId)),
    }))
  }

  /** @param request - supersede feedback. */
  supersedeFeedback(request: SupersedeFeedbackRequest): Promise<DesignerFeedbackValue> {
    return this.run(() => this.ctx.fashionFeedbackRegistry.supersedeFeedback({
      ...request,
      projectId: ProjectId(String(request.projectId)),
      supersedesId: DesignerFeedbackId(request.supersedesId),
      expectedHeadId: DesignerFeedbackId(request.expectedHeadId),
    }))
  }

  /** @param request - read one feedback row. */
  getFeedback(request: GetFeedbackRequest): DesignerFeedbackValue {
    return this.runSync(() => this.ctx.fashionFeedbackRegistry.getFeedback(
      ProjectId(String(request.projectId)),
      DesignerFeedbackId(request.feedbackId),
    ))
  }

  /** @param request - list feedback. */
  listFeedback(request: FeedbackScopeRequest): readonly DesignerFeedbackValue[] {
    return this.runSync(() => this.ctx.fashionFeedbackRegistry.listFeedback(ProjectId(String(request.projectId))))
  }

  /** @param request - feedback summary. */
  getFeedbackSummary(request: FeedbackScopeRequest): FeedbackSummaryValue {
    return this.runSync(() => this.ctx.fashionFeedbackRegistry.getFeedbackSummary(ProjectId(String(request.projectId))))
  }

  /** @param request - record availability. */
  recordOutcomeAvailability(request: RecordAvailabilityRequest): Promise<OutcomeAvailabilityValue> {
    return this.run(() => this.ctx.fashionFeedbackRegistry.recordOutcomeAvailability({
      ...request,
      projectId: ProjectId(String(request.projectId)),
    }))
  }

  /** @param request - current availability. */
  getCurrentOutcomeAvailability(request: DeliverableScopeRequest): ReturnType<Context['fashionFeedbackRegistry']['getCurrentOutcomeAvailability']> {
    return this.runSync(() => this.ctx.fashionFeedbackRegistry.getCurrentOutcomeAvailability(
      ProjectId(String(request.projectId)),
      request.deliverableRef,
    ))
  }

  /** @param request - availability history. */
  listOutcomeAvailabilityHistory(request: DeliverableScopeRequest): readonly OutcomeAvailabilityValue[] {
    return this.runSync(() => this.ctx.fashionFeedbackRegistry.listOutcomeAvailabilityHistory(
      ProjectId(String(request.projectId)),
      request.deliverableRef,
    ))
  }

  /** @param request - record a development event. */
  recordDevelopmentEvent(request: RecordDevelopmentRequest): Promise<DevelopmentEventValue> {
    return this.run(() => this.ctx.fashionFeedbackRegistry.recordDevelopmentEvent({
      ...request,
      projectId: ProjectId(String(request.projectId)),
    }))
  }

  /** @param request - current stage. */
  getCurrentDevelopmentStage(request: DeliverableScopeRequest): ReturnType<Context['fashionFeedbackRegistry']['getCurrentDevelopmentStage']> {
    return this.runSync(() => this.ctx.fashionFeedbackRegistry.getCurrentDevelopmentStage(
      ProjectId(String(request.projectId)),
      request.deliverableRef,
    ))
  }

  /** @param request - development timeline. */
  listDevelopmentTimeline(request: DeliverableScopeRequest): readonly DevelopmentEventValue[] {
    return this.runSync(() => this.ctx.fashionFeedbackRegistry.listDevelopmentTimeline(
      ProjectId(String(request.projectId)),
      request.deliverableRef,
    ))
  }

  /** @param request - metric catalog plus project definitions. */
  listMetricDefinitions(request: FeedbackScopeRequest): readonly MetricDefinitionValue[] {
    return this.runSync(() => this.ctx.fashionFeedbackRegistry.listMetricDefinitions(ProjectId(String(request.projectId))))
  }

  /** @param request - one metric observation. */
  recordMetricObservation(request: RecordMetricRequest): Promise<MetricObservationValue> {
    return this.run(() => this.ctx.fashionFeedbackRegistry.recordMetricObservation({
      ...request,
      projectId: ProjectId(String(request.projectId)),
    }))
  }

  /** @param request - raw metric points. No total. */
  listMetricObservations(request: DeliverableScopeRequest): readonly MetricObservationValue[] {
    return this.runSync(() => this.ctx.fashionFeedbackRegistry.listMetricObservations(
      ProjectId(String(request.projectId)),
      request.deliverableRef,
    ))
  }

  /** @param request - joined timeline. */
  getOutcomeTimeline(request: DeliverableScopeRequest): OutcomeTimelineValue {
    return this.runSync(() => this.ctx.fashionFeedbackRegistry.getOutcomeTimeline(
      ProjectId(String(request.projectId)),
      request.deliverableRef,
    ))
  }

  private run<T>(fn: () => Promise<T>): Promise<T> {
    return fn().catch((error) => {
      mapFeedbackError(error)
    })
  }

  private runSync<T>(fn: () => T): T {
    try {
      return fn()
    } catch (error) {
      mapFeedbackError(error)
    }
  }
}

function mapFeedbackError(error: unknown): never {
  if (error instanceof FashionFeedbackProjectNotFoundError) {
    throw new RemoteError('fashion-feedback/project-not-found', error.message, { projectId: error.projectId })
  }
  if (error instanceof FashionFeedbackNotFoundError) {
    throw new RemoteError('fashion-feedback/not-found', error.message, { id: error.id })
  }
  if (error instanceof FashionFeedbackProjectReadOnlyError) {
    throw new RemoteError('fashion-feedback/project-read-only', error.message, { projectId: error.projectId })
  }
  if (error instanceof FashionFeedbackCrossProjectError) {
    throw new RemoteError('fashion-feedback/cross-project', error.message, {
      projectId: error.projectId,
      otherProjectId: error.otherProjectId,
    })
  }
  if (error instanceof FashionFeedbackTargetRevisionMissingError) {
    throw new RemoteError('fashion-feedback/target-revision-missing', error.message, { subjectId: error.subjectId })
  }
  if (error instanceof FashionFeedbackTargetStaleError) {
    throw new RemoteError('fashion-feedback/target-stale-warning', error.message, {
      subjectId: error.subjectId,
      expected: error.expected,
      actual: error.actual,
    })
  }
  if (error instanceof FashionFeedbackInvalidInputError) {
    throw new RemoteError('fashion-feedback/invalid-input', error.message, { reason: error.reason })
  }
  if (error instanceof FashionFeedbackRevisionConflictError) {
    throw new RemoteError('fashion-feedback/revision-conflict', error.message, { reason: error.reason })
  }
  if (error instanceof FashionFeedbackHumanRequiredError) {
    throw new RemoteError('fashion-feedback/human-required', error.message, { reason: error.reason })
  }
  if (error instanceof FashionFeedbackSupersedesConflictError) {
    throw new RemoteError('fashion-feedback/supersedes-conflict', error.message, {
      expectedHead: error.expectedHead,
      actualHead: error.actualHead,
    })
  }
  if (error instanceof FashionFeedbackAvailabilityValueForbiddenError) {
    throw new RemoteError('fashion-feedback/availability-value-forbidden', error.message, { availability: error.availability })
  }
  if (error instanceof FashionFeedbackMetricDefinitionMismatchError) {
    throw new RemoteError('fashion-feedback/metric-definition-mismatch', error.message, { reason: error.reason })
  }
  if (error instanceof FashionFeedbackUnitMismatchError) {
    throw new RemoteError('fashion-feedback/unit-mismatch', error.message, { reason: error.reason })
  }
  if (error instanceof FashionFeedbackCurrencyRequiredError) {
    throw new RemoteError('fashion-feedback/currency-required', error.message, { metricKey: error.metricKey })
  }
  if (error instanceof FashionFeedbackInvalidWindowError) {
    throw new RemoteError('fashion-feedback/invalid-window', error.message, { reason: error.reason })
  }
  if (error instanceof FashionFeedbackSourceRequiredError) {
    throw new RemoteError('fashion-feedback/source-required', error.message, { reason: error.reason })
  }
  if (error instanceof FashionFeedbackSeedConflictError) {
    throw new RemoteError('fashion-feedback/seed-conflict', error.message, { reason: error.reason })
  }
  throw error
}
