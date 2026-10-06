/**
 * Client Fashion Analysis workspace snapshot and Remote call model.
 * @module @gentlexx/dsh-api-fashion-analysis-controller/src/client/model
 */

import type { ProjectId } from '@gentlexx/dsh-fashion-project/types'
import type { ResearchTaskId } from '@gentlexx/dsh-fashion-research/types'
import type {
  DesignOpportunity,
  MarketItem,
  PopularitySignal,
  TrendCluster,
} from '@gentlexx/dsh-fashion-analysis/types'
import type { ObservableSnapshot } from '@deepseek-ai/dsh-client-store'
import { createSnapshotStore } from '@deepseek-ai/dsh-client-store'
import type { RemoteFailure, RemoteResult } from '@deepseek-ai/dsh-typert-protocol'
import { compareAnalysisUpdatedDesc } from './order.ts'
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
} from '../types.ts'

/** Unary Fashion Analysis Remote namespace used by the Client model. */
export interface FashionAnalysisRemote {
  loadWorkspace(request: AnalysisScopeRequest): Promise<RemoteResult<AnalysisWorkspaceValue>>
  createMarketItem(request: CreateMarketItemRequest): Promise<RemoteResult<MarketItemValue>>
  getMarketItem(request: GetMarketItemRequest): Promise<RemoteResult<MarketItemValue>>
  confirmDedupe(request: ConfirmDedupeRequest): Promise<RemoteResult<MarketItemValue>>
  createPopularitySignal(request: CreatePopularitySignalRequest): Promise<RemoteResult<SignalValue>>
  getSignal(request: GetSignalRequest): Promise<RemoteResult<SignalValue>>
  createTrendCluster(request: CreateTrendClusterRequest): Promise<RemoteResult<ClusterValue>>
  getCluster(request: GetClusterRequest): Promise<RemoteResult<ClusterValue>>
  createDesignOpportunity(request: CreateDesignOpportunityRequest): Promise<RemoteResult<OpportunityValue>>
  getOpportunity(request: GetOpportunityRequest): Promise<RemoteResult<OpportunityValue>>
  decideOpportunity(request: DecideOpportunityRequest): Promise<RemoteResult<DecideOpportunityValue>>
}

/** List snapshot phases for analysis object collections. */
export type AnalysisListState<T> =
  | { readonly status: 'loading'; readonly items: readonly T[]; readonly error: null }
  | { readonly status: 'ready'; readonly items: readonly T[]; readonly error: null }
  | { readonly status: 'error'; readonly items: readonly T[]; readonly error: RemoteFailure }

/**
 * Owns Client Fashion Analysis workspace snapshots and unary Remote calls.
 * Workspace lists are task-scoped under a Project.
 */
export class ClientFashionAnalysisModel {
  private loadGeneration = 0
  private scopedProjectId: ProjectId | null = null
  private scopedTaskId: ResearchTaskId | null = null

  private readonly itemStore = createSnapshotStore<AnalysisListState<MarketItem>>({
    status: 'loading', items: [], error: null,
  })
  private readonly signalStore = createSnapshotStore<AnalysisListState<PopularitySignal>>({
    status: 'loading', items: [], error: null,
  })
  private readonly clusterStore = createSnapshotStore<AnalysisListState<TrendCluster>>({
    status: 'loading', items: [], error: null,
  })
  private readonly opportunityStore = createSnapshotStore<AnalysisListState<DesignOpportunity>>({
    status: 'loading', items: [], error: null,
  })

  /** @param remote - Fashion Analysis Remote namespace. */
  constructor(private readonly remote: FashionAnalysisRemote) {}

  /** MarketItem list snapshot. */
  get marketItems(): ObservableSnapshot<AnalysisListState<MarketItem>> {
    return this.itemStore
  }

  /** PopularitySignal list snapshot. */
  get signals(): ObservableSnapshot<AnalysisListState<PopularitySignal>> {
    return this.signalStore
  }

  /** TrendCluster list snapshot. */
  get clusters(): ObservableSnapshot<AnalysisListState<TrendCluster>> {
    return this.clusterStore
  }

  /** DesignOpportunity list snapshot. */
  get opportunities(): ObservableSnapshot<AnalysisListState<DesignOpportunity>> {
    return this.opportunityStore
  }

  /**
   * Load the complete analysis workspace for one ResearchTask.
   * @param projectId - Owning project.
   * @param taskId - Owning task.
   */
  async loadWorkspace(projectId: ProjectId, taskId: ResearchTaskId): Promise<void> {
    const generation = ++this.loadGeneration
    this.scopedProjectId = projectId
    this.scopedTaskId = taskId
    this.itemStore.set({ status: 'loading', items: this.itemStore.getSnapshot().items, error: null })
    this.signalStore.set({ status: 'loading', items: this.signalStore.getSnapshot().items, error: null })
    this.clusterStore.set({ status: 'loading', items: this.clusterStore.getSnapshot().items, error: null })
    this.opportunityStore.set({
      status: 'loading',
      items: this.opportunityStore.getSnapshot().items,
      error: null,
    })
    const result = await this.remote.loadWorkspace({ projectId, taskId })
    if (generation !== this.loadGeneration) return
    if (!result.ok) {
      this.itemStore.set({ status: 'error', items: [], error: result.error })
      this.signalStore.set({ status: 'error', items: [], error: result.error })
      this.clusterStore.set({ status: 'error', items: [], error: result.error })
      this.opportunityStore.set({ status: 'error', items: [], error: result.error })
      return
    }
    this.itemStore.set({
      status: 'ready',
      items: [...result.value.marketItems].sort(compareAnalysisUpdatedDesc),
      error: null,
    })
    this.signalStore.set({
      status: 'ready',
      items: [...result.value.signals].sort(compareAnalysisUpdatedDesc),
      error: null,
    })
    this.clusterStore.set({
      status: 'ready',
      items: [...result.value.clusters].sort(compareAnalysisUpdatedDesc),
      error: null,
    })
    this.opportunityStore.set({
      status: 'ready',
      items: [...result.value.opportunities].sort(compareAnalysisUpdatedDesc),
      error: null,
    })
  }

  /** @param request - create market item. */
  async createMarketItem(request: CreateMarketItemRequest): Promise<MarketItem> {
    const result = await this.remote.createMarketItem(request)
    if (!result.ok) throw result.error
    this.mergeItem(result.value)
    return result.value
  }

  /** @param request - get market item. */
  async getMarketItem(request: GetMarketItemRequest): Promise<MarketItem> {
    const result = await this.remote.getMarketItem(request)
    if (!result.ok) throw result.error
    return result.value
  }

  /** @param request - confirm dedupe. */
  async confirmDedupe(request: ConfirmDedupeRequest): Promise<MarketItem> {
    const result = await this.remote.confirmDedupe(request)
    if (!result.ok) throw result.error
    this.mergeItem(result.value)
    return result.value
  }

  /** @param request - create signal. */
  async createPopularitySignal(request: CreatePopularitySignalRequest): Promise<PopularitySignal> {
    const result = await this.remote.createPopularitySignal(request)
    if (!result.ok) throw result.error
    this.mergeSignal(result.value)
    return result.value
  }

  /** @param request - get signal. */
  async getSignal(request: GetSignalRequest): Promise<PopularitySignal> {
    const result = await this.remote.getSignal(request)
    if (!result.ok) throw result.error
    return result.value
  }

  /** @param request - create cluster. */
  async createTrendCluster(request: CreateTrendClusterRequest): Promise<TrendCluster> {
    const result = await this.remote.createTrendCluster(request)
    if (!result.ok) throw result.error
    this.mergeCluster(result.value)
    return result.value
  }

  /** @param request - get cluster. */
  async getCluster(request: GetClusterRequest): Promise<TrendCluster> {
    const result = await this.remote.getCluster(request)
    if (!result.ok) throw result.error
    return result.value
  }

  /** @param request - create opportunity. */
  async createDesignOpportunity(request: CreateDesignOpportunityRequest): Promise<DesignOpportunity> {
    const result = await this.remote.createDesignOpportunity(request)
    if (!result.ok) throw result.error
    this.mergeOpportunity(result.value)
    return result.value
  }

  /** @param request - get opportunity. */
  async getOpportunity(request: GetOpportunityRequest): Promise<DesignOpportunity> {
    const result = await this.remote.getOpportunity(request)
    if (!result.ok) throw result.error
    return result.value
  }

  /** @param request - decide opportunity. */
  async decideOpportunity(request: DecideOpportunityRequest): Promise<DecideOpportunityValue> {
    const result = await this.remote.decideOpportunity(request)
    if (!result.ok) throw result.error
    this.mergeOpportunity(result.value.opportunity)
    return result.value
  }

  private mergeItem(item: MarketItem): void {
    if (this.scopedProjectId !== item.projectId || this.scopedTaskId !== item.taskId) return
    const current = this.itemStore.getSnapshot().items
    const next = [...current.filter(row => row.id !== item.id), item].sort(compareAnalysisUpdatedDesc)
    this.itemStore.set({ status: 'ready', items: next, error: null })
  }

  private mergeSignal(signal: PopularitySignal): void {
    if (this.scopedProjectId !== signal.projectId || this.scopedTaskId !== signal.taskId) return
    const current = this.signalStore.getSnapshot().items
    const next = [...current.filter(row => row.id !== signal.id), signal].sort(compareAnalysisUpdatedDesc)
    this.signalStore.set({ status: 'ready', items: next, error: null })
  }

  private mergeCluster(cluster: TrendCluster): void {
    if (this.scopedProjectId !== cluster.projectId || this.scopedTaskId !== cluster.taskId) return
    const current = this.clusterStore.getSnapshot().items
    const next = [...current.filter(row => row.id !== cluster.id), cluster].sort(compareAnalysisUpdatedDesc)
    this.clusterStore.set({ status: 'ready', items: next, error: null })
  }

  private mergeOpportunity(opportunity: DesignOpportunity): void {
    if (this.scopedProjectId !== opportunity.projectId || this.scopedTaskId !== opportunity.taskId) return
    const current = this.opportunityStore.getSnapshot().items
    const next = [...current.filter(row => row.id !== opportunity.id), opportunity]
      .sort(compareAnalysisUpdatedDesc)
    this.opportunityStore.set({ status: 'ready', items: next, error: null })
  }
}
