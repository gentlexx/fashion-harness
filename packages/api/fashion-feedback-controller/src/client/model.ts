/**
 * Unary Fashion Feedback Remote calls.
 * @module @gentlexx/dsh-api-fashion-feedback-controller/src/client/model
 */

import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol'
import type {
  CurrentDevelopmentStage,
  CurrentOutcomeAvailability,
  DesignerFeedback,
  DevelopmentEvent,
  FeedbackSummary,
  OutcomeAvailability,
  OutcomeMetricDefinitionRef,
  OutcomeMetricObservation,
  OutcomeTimeline,
} from '@gentlexx/dsh-fashion-feedback/types'
import type {
  DeliverableScopeRequest,
  FeedbackScopeRequest,
  GetFeedbackRequest,
  RecordAvailabilityRequest,
  RecordDevelopmentRequest,
  RecordFeedbackRequest,
  RecordMetricRequest,
  SupersedeFeedbackRequest,
} from '../types.ts'

/** Generated `fashionFeedback` namespace. */
export interface FashionFeedbackRemote {
  listFeedback(request: FeedbackScopeRequest): Promise<RemoteResult<readonly DesignerFeedback[]>>
  getFeedback(request: GetFeedbackRequest): Promise<RemoteResult<DesignerFeedback>>
  getFeedbackSummary(request: FeedbackScopeRequest): Promise<RemoteResult<FeedbackSummary>>
  recordFeedback(request: RecordFeedbackRequest): Promise<RemoteResult<DesignerFeedback>>
  supersedeFeedback(request: SupersedeFeedbackRequest): Promise<RemoteResult<DesignerFeedback>>
  recordOutcomeAvailability(request: RecordAvailabilityRequest): Promise<RemoteResult<OutcomeAvailability>>
  getCurrentOutcomeAvailability(request: DeliverableScopeRequest): Promise<RemoteResult<CurrentOutcomeAvailability>>
  listOutcomeAvailabilityHistory(request: DeliverableScopeRequest): Promise<RemoteResult<readonly OutcomeAvailability[]>>
  recordDevelopmentEvent(request: RecordDevelopmentRequest): Promise<RemoteResult<DevelopmentEvent>>
  getCurrentDevelopmentStage(request: DeliverableScopeRequest): Promise<RemoteResult<CurrentDevelopmentStage>>
  listDevelopmentTimeline(request: DeliverableScopeRequest): Promise<RemoteResult<readonly DevelopmentEvent[]>>
  listMetricDefinitions(request: FeedbackScopeRequest): Promise<RemoteResult<readonly OutcomeMetricDefinitionRef[]>>
  recordMetricObservation(request: RecordMetricRequest): Promise<RemoteResult<OutcomeMetricObservation>>
  listMetricObservations(request: DeliverableScopeRequest): Promise<RemoteResult<readonly OutcomeMetricObservation[]>>
  getOutcomeTimeline(request: DeliverableScopeRequest): Promise<RemoteResult<OutcomeTimeline>>
}

/** @param remote - Mounted fashionFeedback namespace. */
export class ClientFashionFeedbackModel {
  constructor(private readonly remote: FashionFeedbackRemote) {}

  /** @param request - Project scope. */
  listFeedback(request: FeedbackScopeRequest): Promise<readonly DesignerFeedback[]> {
    return unwrap(this.remote.listFeedback(request))
  }

  /** @param request - One feedback id. */
  getFeedback(request: GetFeedbackRequest): Promise<DesignerFeedback> {
    return unwrap(this.remote.getFeedback(request))
  }

  /** @param request - Summary. */
  getFeedbackSummary(request: FeedbackScopeRequest): Promise<FeedbackSummary> {
    return unwrap(this.remote.getFeedbackSummary(request))
  }

  /** @param request - New feedback. Host stamps the actor. */
  recordFeedback(request: RecordFeedbackRequest): Promise<DesignerFeedback> {
    return unwrap(this.remote.recordFeedback(request))
  }

  /** @param request - Correction as a new row. */
  supersedeFeedback(request: SupersedeFeedbackRequest): Promise<DesignerFeedback> {
    return unwrap(this.remote.supersedeFeedback(request))
  }

  /** @param request - Availability row. */
  recordOutcomeAvailability(request: RecordAvailabilityRequest): Promise<OutcomeAvailability> {
    return unwrap(this.remote.recordOutcomeAvailability(request))
  }

  /** @param request - Current availability. */
  getCurrentOutcomeAvailability(request: DeliverableScopeRequest): Promise<CurrentOutcomeAvailability> {
    return unwrap(this.remote.getCurrentOutcomeAvailability(request))
  }

  /** @param request - Availability history. */
  listOutcomeAvailabilityHistory(request: DeliverableScopeRequest): Promise<readonly OutcomeAvailability[]> {
    return unwrap(this.remote.listOutcomeAvailabilityHistory(request))
  }

  /** @param request - Development event. */
  recordDevelopmentEvent(request: RecordDevelopmentRequest): Promise<DevelopmentEvent> {
    return unwrap(this.remote.recordDevelopmentEvent(request))
  }

  /** @param request - Current stage. */
  getCurrentDevelopmentStage(request: DeliverableScopeRequest): Promise<CurrentDevelopmentStage> {
    return unwrap(this.remote.getCurrentDevelopmentStage(request))
  }

  /** @param request - Development timeline. */
  listDevelopmentTimeline(request: DeliverableScopeRequest): Promise<readonly DevelopmentEvent[]> {
    return unwrap(this.remote.listDevelopmentTimeline(request))
  }

  /** @param request - Metric definitions. */
  listMetricDefinitions(request: FeedbackScopeRequest): Promise<readonly OutcomeMetricDefinitionRef[]> {
    return unwrap(this.remote.listMetricDefinitions(request))
  }

  /** @param request - Metric observation. */
  recordMetricObservation(request: RecordMetricRequest): Promise<OutcomeMetricObservation> {
    return unwrap(this.remote.recordMetricObservation(request))
  }

  /** @param request - Metric observations. */
  listMetricObservations(request: DeliverableScopeRequest): Promise<readonly OutcomeMetricObservation[]> {
    return unwrap(this.remote.listMetricObservations(request))
  }

  /** @param request - Joined timeline. */
  getOutcomeTimeline(request: DeliverableScopeRequest): Promise<OutcomeTimeline> {
    return unwrap(this.remote.getOutcomeTimeline(request))
  }
}

function unwrap<T>(result: Promise<RemoteResult<T>>): Promise<T> {
  return result.then((value) => {
    if (!value.ok) throw value.error
    return value.value
  })
}
