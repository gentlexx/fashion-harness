/**
 * Host Fashion Feedback Remote owner.
 * @module @gentlexx/dsh-api-fashion-feedback-controller
 */

import { Context } from '@deepseek-ai/cordis'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { FashionFeedbackCommands } from './commands.ts'
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
} from './types.ts'
import type {
  RecordAvailabilityRequest,
  RecordDevelopmentRequest,
  RecordFeedbackRequest,
  RecordMetricRequest,
  SupersedeFeedbackRequest,
} from './types.ts'
import type {
  CurrentDevelopmentStage,
  CurrentOutcomeAvailability,
} from '@gentlexx/dsh-fashion-feedback/types'

export type * from './types.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Host Fashion Feedback business API and Remote namespace owner. */
    fashionFeedbackController: FashionFeedbackController
  }
}

/** Host service backing the `fashionFeedback` Remote namespace. */
export class FashionFeedbackController extends TypertRemoteService {
  static inject = ['typert', 'fashionFeedbackRegistry']

  private readonly commands: FashionFeedbackCommands

  /** @param ctx - Host context containing the Fashion Feedback registry. */
  constructor(ctx: Context) {
    super(ctx, 'fashionFeedbackController', { namespace: 'fashionFeedback' })
    this.commands = new FashionFeedbackCommands(ctx)
  }

  /** @param request - record feedback. */
  @Remote('recordFeedback')
  recordFeedback(request: RecordFeedbackRequest): Promise<DesignerFeedbackValue> {
    return this.commands.recordFeedback(request)
  }

  /** @param request - supersede feedback. */
  @Remote('supersedeFeedback')
  supersedeFeedback(request: SupersedeFeedbackRequest): Promise<DesignerFeedbackValue> {
    return this.commands.supersedeFeedback(request)
  }

  /** @param request - read one feedback row. */
  @Remote('getFeedback')
  getFeedback(request: GetFeedbackRequest): DesignerFeedbackValue {
    return this.commands.getFeedback(request)
  }

  /** @param request - list feedback. */
  @Remote('listFeedback')
  listFeedback(request: FeedbackScopeRequest): readonly DesignerFeedbackValue[] {
    return this.commands.listFeedback(request)
  }

  /** @param request - feedback summary. */
  @Remote('getFeedbackSummary')
  getFeedbackSummary(request: FeedbackScopeRequest): FeedbackSummaryValue {
    return this.commands.getFeedbackSummary(request)
  }

  /** @param request - record availability. */
  @Remote('recordOutcomeAvailability')
  recordOutcomeAvailability(request: RecordAvailabilityRequest): Promise<OutcomeAvailabilityValue> {
    return this.commands.recordOutcomeAvailability(request)
  }

  /** @param request - current availability. */
  @Remote('getCurrentOutcomeAvailability')
  getCurrentOutcomeAvailability(request: DeliverableScopeRequest): CurrentOutcomeAvailability {
    return this.commands.getCurrentOutcomeAvailability(request)
  }

  /** @param request - availability history. */
  @Remote('listOutcomeAvailabilityHistory')
  listOutcomeAvailabilityHistory(request: DeliverableScopeRequest): readonly OutcomeAvailabilityValue[] {
    return this.commands.listOutcomeAvailabilityHistory(request)
  }

  /** @param request - record a development event. */
  @Remote('recordDevelopmentEvent')
  recordDevelopmentEvent(request: RecordDevelopmentRequest): Promise<DevelopmentEventValue> {
    return this.commands.recordDevelopmentEvent(request)
  }

  /** @param request - current stage. */
  @Remote('getCurrentDevelopmentStage')
  getCurrentDevelopmentStage(request: DeliverableScopeRequest): CurrentDevelopmentStage {
    return this.commands.getCurrentDevelopmentStage(request)
  }

  /** @param request - development timeline. */
  @Remote('listDevelopmentTimeline')
  listDevelopmentTimeline(request: DeliverableScopeRequest): readonly DevelopmentEventValue[] {
    return this.commands.listDevelopmentTimeline(request)
  }

  /** @param request - metric definitions. */
  @Remote('listMetricDefinitions')
  listMetricDefinitions(request: FeedbackScopeRequest): readonly MetricDefinitionValue[] {
    return this.commands.listMetricDefinitions(request)
  }

  /** @param request - record one metric. */
  @Remote('recordMetricObservation')
  recordMetricObservation(request: RecordMetricRequest): Promise<MetricObservationValue> {
    return this.commands.recordMetricObservation(request)
  }

  /** @param request - list metric points. */
  @Remote('listMetricObservations')
  listMetricObservations(request: DeliverableScopeRequest): readonly MetricObservationValue[] {
    return this.commands.listMetricObservations(request)
  }

  /** @param request - joined timeline. */
  @Remote('getOutcomeTimeline')
  getOutcomeTimeline(request: DeliverableScopeRequest): OutcomeTimelineValue {
    return this.commands.getOutcomeTimeline(request)
  }
}

export default FashionFeedbackController
