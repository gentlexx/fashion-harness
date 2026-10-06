/**
 * Host Fashion Analysis Remote owner.
 * @module @gentlexx/dsh-api-fashion-analysis-controller
 */

import { Context } from '@deepseek-ai/cordis'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { FashionAnalysisCommands } from './commands.ts'
import type {
  AnalysisScopeRequest,
  AnalysisWorkspaceValue,
  ConfirmDedupeRequest,
  CreateDesignOpportunityRequest,
  CreateMarketItemRequest,
  CreatePopularitySignalRequest,
  CreateTrendClusterRequest,
  DecideOpportunityRequest,
  DecideOpportunityValue,
  GetClusterRequest,
  GetMarketItemRequest,
  GetOpportunityRequest,
  GetSignalRequest,
  MarketItemValue,
  ClusterValue,
  OpportunityValue,
  SignalValue,
} from './types.ts'

export type * from './types.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Host Fashion Analysis business API and Remote namespace owner. */
    fashionAnalysisController: FashionAnalysisController
  }
}

/** Host service backing the generated `ctx.remote.fashionAnalysis` namespace. */
export class FashionAnalysisController extends TypertRemoteService {
  static inject = ['typert', 'fashionAnalysisRegistry']

  private readonly commands: FashionAnalysisCommands

  /** @param ctx - Host context containing the Fashion Analysis registry. */
  constructor(ctx: Context) {
    super(ctx, 'fashionAnalysisController', { namespace: 'fashionAnalysis' })
    this.commands = new FashionAnalysisCommands(ctx)
  }

  /** @param request - workspace scope. */
  @Remote('loadWorkspace')
  loadWorkspace(request: AnalysisScopeRequest): Promise<AnalysisWorkspaceValue> {
    return this.commands.loadWorkspace(request)
  }

  /** @param request - create market item. */
  @Remote('createMarketItem')
  createMarketItem(request: CreateMarketItemRequest): Promise<MarketItemValue> {
    return this.commands.createMarketItem(request)
  }

  /** @param request - get market item. */
  @Remote('getMarketItem')
  getMarketItem(request: GetMarketItemRequest): MarketItemValue {
    return this.commands.getMarketItem(request)
  }

  /** @param request - confirm dedupe. */
  @Remote('confirmDedupe')
  confirmDedupe(request: ConfirmDedupeRequest): Promise<MarketItemValue> {
    return this.commands.confirmDedupe(request)
  }

  /** @param request - create signal. */
  @Remote('createPopularitySignal')
  createPopularitySignal(request: CreatePopularitySignalRequest): Promise<SignalValue> {
    return this.commands.createPopularitySignal(request)
  }

  /** @param request - get signal. */
  @Remote('getSignal')
  getSignal(request: GetSignalRequest): SignalValue {
    return this.commands.getSignal(request)
  }

  /** @param request - create cluster. */
  @Remote('createTrendCluster')
  createTrendCluster(request: CreateTrendClusterRequest): Promise<ClusterValue> {
    return this.commands.createTrendCluster(request)
  }

  /** @param request - get cluster. */
  @Remote('getCluster')
  getCluster(request: GetClusterRequest): ClusterValue {
    return this.commands.getCluster(request)
  }

  /** @param request - create opportunity. */
  @Remote('createDesignOpportunity')
  createDesignOpportunity(request: CreateDesignOpportunityRequest): Promise<OpportunityValue> {
    return this.commands.createDesignOpportunity(request)
  }

  /** @param request - get opportunity. */
  @Remote('getOpportunity')
  getOpportunity(request: GetOpportunityRequest): OpportunityValue {
    return this.commands.getOpportunity(request)
  }

  /** @param request - decide opportunity. */
  @Remote('decideOpportunity')
  decideOpportunity(request: DecideOpportunityRequest): Promise<DecideOpportunityValue> {
    return this.commands.decideOpportunity(request)
  }
}

export default FashionAnalysisController
