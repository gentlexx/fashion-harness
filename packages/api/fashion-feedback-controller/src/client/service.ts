/**
 * Browser Fashion Feedback service (`ctx.fashionFeedback`).
 * @module @gentlexx/dsh-api-fashion-feedback-controller/src/client/service
 */

import { Service, type Context } from '@deepseek-ai/cordis'
import type { ProjectId } from '@gentlexx/dsh-fashion-project/types'
import type { ClientFashionFeedbackModel } from './model.ts'
import type {
  DeliverableScopeRequest,
  GetFeedbackRequest,
  RecordAvailabilityRequest,
  RecordDevelopmentRequest,
  RecordFeedbackRequest,
  RecordMetricRequest,
  SupersedeFeedbackRequest,
} from '../types.ts'

/** Methods the Fashion shell calls. Actor kind is never a parameter. */
export interface FashionFeedbackClient {
  listFeedback(projectId: string): ReturnType<ClientFashionFeedbackModel['listFeedback']>
  getFeedback(request: GetFeedbackRequest): ReturnType<ClientFashionFeedbackModel['getFeedback']>
  getFeedbackSummary(projectId: string): ReturnType<ClientFashionFeedbackModel['getFeedbackSummary']>
  recordFeedback(request: RecordFeedbackRequest): ReturnType<ClientFashionFeedbackModel['recordFeedback']>
  supersedeFeedback(request: SupersedeFeedbackRequest): ReturnType<ClientFashionFeedbackModel['supersedeFeedback']>
  recordOutcomeAvailability(request: RecordAvailabilityRequest): ReturnType<ClientFashionFeedbackModel['recordOutcomeAvailability']>
  getCurrentOutcomeAvailability(request: DeliverableScopeRequest): ReturnType<ClientFashionFeedbackModel['getCurrentOutcomeAvailability']>
  listOutcomeAvailabilityHistory(request: DeliverableScopeRequest): ReturnType<ClientFashionFeedbackModel['listOutcomeAvailabilityHistory']>
  recordDevelopmentEvent(request: RecordDevelopmentRequest): ReturnType<ClientFashionFeedbackModel['recordDevelopmentEvent']>
  getCurrentDevelopmentStage(request: DeliverableScopeRequest): ReturnType<ClientFashionFeedbackModel['getCurrentDevelopmentStage']>
  listDevelopmentTimeline(request: DeliverableScopeRequest): ReturnType<ClientFashionFeedbackModel['listDevelopmentTimeline']>
  listMetricDefinitions(projectId: string): ReturnType<ClientFashionFeedbackModel['listMetricDefinitions']>
  recordMetricObservation(request: RecordMetricRequest): ReturnType<ClientFashionFeedbackModel['recordMetricObservation']>
  listMetricObservations(request: DeliverableScopeRequest): ReturnType<ClientFashionFeedbackModel['listMetricObservations']>
  getOutcomeTimeline(request: DeliverableScopeRequest): ReturnType<ClientFashionFeedbackModel['getOutcomeTimeline']>
}

/** @param ctx - Client context. @param model - Remote model. */
export class FashionFeedbackService extends Service implements FashionFeedbackClient {
  constructor(ctx: Context, private readonly model: ClientFashionFeedbackModel) {
    super(ctx, 'fashionFeedback')
  }

  /** @param projectId - Project. */
  listFeedback(projectId: string) {
    return this.model.listFeedback({ projectId: projectId as ProjectId })
  }

  /** @param request - Feedback id. */
  getFeedback(request: GetFeedbackRequest) {
    return this.model.getFeedback(request)
  }

  /** @param projectId - Project. */
  getFeedbackSummary(projectId: string) {
    return this.model.getFeedbackSummary({ projectId: projectId as ProjectId })
  }

  /** @param request - New feedback. */
  recordFeedback(request: RecordFeedbackRequest) {
    return this.model.recordFeedback(request)
  }

  /** @param request - Correction. */
  supersedeFeedback(request: SupersedeFeedbackRequest) {
    return this.model.supersedeFeedback(request)
  }

  /** @param request - Availability. */
  recordOutcomeAvailability(request: RecordAvailabilityRequest) {
    return this.model.recordOutcomeAvailability(request)
  }

  /** @param request - Current availability. */
  getCurrentOutcomeAvailability(request: DeliverableScopeRequest) {
    return this.model.getCurrentOutcomeAvailability(request)
  }

  /** @param request - History. */
  listOutcomeAvailabilityHistory(request: DeliverableScopeRequest) {
    return this.model.listOutcomeAvailabilityHistory(request)
  }

  /** @param request - Development event. */
  recordDevelopmentEvent(request: RecordDevelopmentRequest) {
    return this.model.recordDevelopmentEvent(request)
  }

  /** @param request - Current stage. */
  getCurrentDevelopmentStage(request: DeliverableScopeRequest) {
    return this.model.getCurrentDevelopmentStage(request)
  }

  /** @param request - Timeline. */
  listDevelopmentTimeline(request: DeliverableScopeRequest) {
    return this.model.listDevelopmentTimeline(request)
  }

  /** @param projectId - Project. */
  listMetricDefinitions(projectId: string) {
    return this.model.listMetricDefinitions({ projectId: projectId as ProjectId })
  }

  /** @param request - Metric. */
  recordMetricObservation(request: RecordMetricRequest) {
    return this.model.recordMetricObservation(request)
  }

  /** @param request - Observations. */
  listMetricObservations(request: DeliverableScopeRequest) {
    return this.model.listMetricObservations(request)
  }

  /** @param request - Timeline. */
  getOutcomeTimeline(request: DeliverableScopeRequest) {
    return this.model.getOutcomeTimeline(request)
  }
}
