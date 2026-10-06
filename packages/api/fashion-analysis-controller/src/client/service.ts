/**
 * Client Fashion Analysis service face (`ctx.fashionAnalysis`).
 * @module @gentlexx/dsh-api-fashion-analysis-controller/src/client/service
 */

import { Service, type Context } from '@deepseek-ai/cordis'
import type { ProjectId } from '@gentlexx/dsh-fashion-project/types'
import type { ResearchTaskId } from '@gentlexx/dsh-fashion-research/types'
import type {
  DesignOpportunity,
  MarketItem,
  PopularitySignal,
  TrendCluster,
} from '@gentlexx/dsh-fashion-analysis/types'
import type { ObservableSnapshot } from '@deepseek-ai/dsh-client-store'
import type { RemoteFailure } from '@deepseek-ai/dsh-typert-protocol'
import type {
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
} from '../types.ts'
import type { AnalysisListState, ClientFashionAnalysisModel } from './model.ts'

/** Structured command failure for callers that distinguish Host business errors. */
export class FashionAnalysisCommandError extends Error {
  override readonly name = 'FashionAnalysisCommandError'

  /** @param rpcError - Host business or folded carrier failure. */
  constructor(readonly rpcError: RemoteFailure) {
    super(`fashion analysis command failed: ${rpcError.code}: ${rpcError.message}`)
  }
}

/** Browser Fashion Analysis service. */
export interface FashionAnalysisClient {
  readonly marketItems: ObservableSnapshot<AnalysisListState<MarketItem>>
  readonly signals: ObservableSnapshot<AnalysisListState<PopularitySignal>>
  readonly clusters: ObservableSnapshot<AnalysisListState<TrendCluster>>
  readonly opportunities: ObservableSnapshot<AnalysisListState<DesignOpportunity>>
  loadWorkspace(projectId: ProjectId, taskId: ResearchTaskId): Promise<void>
  createMarketItem(request: CreateMarketItemRequest): Promise<MarketItem>
  getMarketItem(request: GetMarketItemRequest): Promise<MarketItem>
  confirmDedupe(request: ConfirmDedupeRequest): Promise<MarketItem>
  createPopularitySignal(request: CreatePopularitySignalRequest): Promise<PopularitySignal>
  getSignal(request: GetSignalRequest): Promise<PopularitySignal>
  createTrendCluster(request: CreateTrendClusterRequest): Promise<TrendCluster>
  getCluster(request: GetClusterRequest): Promise<TrendCluster>
  createDesignOpportunity(request: CreateDesignOpportunityRequest): Promise<DesignOpportunity>
  getOpportunity(request: GetOpportunityRequest): Promise<DesignOpportunity>
  decideOpportunity(request: DecideOpportunityRequest): Promise<DecideOpportunityValue>
}

/** Owns the bare Fashion Analysis snapshots and commands. */
export class FashionAnalysisService extends Service implements FashionAnalysisClient {
  readonly marketItems: ObservableSnapshot<AnalysisListState<MarketItem>>
  readonly signals: ObservableSnapshot<AnalysisListState<PopularitySignal>>
  readonly clusters: ObservableSnapshot<AnalysisListState<TrendCluster>>
  readonly opportunities: ObservableSnapshot<AnalysisListState<DesignOpportunity>>

  /**
   * @param ctx - Client context.
   * @param model - Snapshot + Remote model.
   */
  constructor(
    ctx: Context,
    private readonly model: ClientFashionAnalysisModel,
  ) {
    super(ctx, 'fashionAnalysis')
    this.marketItems = model.marketItems
    this.signals = model.signals
    this.clusters = model.clusters
    this.opportunities = model.opportunities
  }

  /** @param projectId - Owning project. @param taskId - Owning task. */
  loadWorkspace(projectId: ProjectId, taskId: ResearchTaskId): Promise<void> {
    return this.model.loadWorkspace(projectId, taskId)
  }

  /** @param request - create market item. */
  async createMarketItem(request: CreateMarketItemRequest): Promise<MarketItem> {
    try {
      return await this.model.createMarketItem(request)
    } catch (error) {
      throw wrap(error)
    }
  }

  /** @param request - get market item. */
  async getMarketItem(request: GetMarketItemRequest): Promise<MarketItem> {
    try {
      return await this.model.getMarketItem(request)
    } catch (error) {
      throw wrap(error)
    }
  }

  /** @param request - confirm dedupe. */
  async confirmDedupe(request: ConfirmDedupeRequest): Promise<MarketItem> {
    try {
      return await this.model.confirmDedupe(request)
    } catch (error) {
      throw wrap(error)
    }
  }

  /** @param request - create signal. */
  async createPopularitySignal(request: CreatePopularitySignalRequest): Promise<PopularitySignal> {
    try {
      return await this.model.createPopularitySignal(request)
    } catch (error) {
      throw wrap(error)
    }
  }

  /** @param request - get signal. */
  async getSignal(request: GetSignalRequest): Promise<PopularitySignal> {
    try {
      return await this.model.getSignal(request)
    } catch (error) {
      throw wrap(error)
    }
  }

  /** @param request - create cluster. */
  async createTrendCluster(request: CreateTrendClusterRequest): Promise<TrendCluster> {
    try {
      return await this.model.createTrendCluster(request)
    } catch (error) {
      throw wrap(error)
    }
  }

  /** @param request - get cluster. */
  async getCluster(request: GetClusterRequest): Promise<TrendCluster> {
    try {
      return await this.model.getCluster(request)
    } catch (error) {
      throw wrap(error)
    }
  }

  /** @param request - create opportunity. */
  async createDesignOpportunity(request: CreateDesignOpportunityRequest): Promise<DesignOpportunity> {
    try {
      return await this.model.createDesignOpportunity(request)
    } catch (error) {
      throw wrap(error)
    }
  }

  /** @param request - get opportunity. */
  async getOpportunity(request: GetOpportunityRequest): Promise<DesignOpportunity> {
    try {
      return await this.model.getOpportunity(request)
    } catch (error) {
      throw wrap(error)
    }
  }

  /** @param request - decide opportunity. */
  async decideOpportunity(request: DecideOpportunityRequest): Promise<DecideOpportunityValue> {
    try {
      return await this.model.decideOpportunity(request)
    } catch (error) {
      throw wrap(error)
    }
  }
}

function wrap(error: unknown): FashionAnalysisCommandError {
  if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
    return new FashionAnalysisCommandError(error as RemoteFailure)
  }
  throw error
}
