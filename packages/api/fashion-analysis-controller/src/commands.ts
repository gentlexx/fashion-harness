/**
 * Fashion Analysis Remote command projection onto the Host registry.
 * @module @gentlexx/dsh-api-fashion-analysis-controller/src/commands
 */

import type { Context } from '@deepseek-ai/cordis'
import { ProjectId } from '@gentlexx/dsh-fashion-project'
import {
  AttributeAssertionId,
  DesignOpportunityId,
  FashionAnalysisClusterNotFoundError,
  FashionAnalysisCrossProjectReferenceError,
  FashionAnalysisCrossTaskReferenceError,
  FashionAnalysisEvidenceNotEligibleError,
  FashionAnalysisInvalidInputError,
  FashionAnalysisInvalidTransitionError,
  FashionAnalysisItemNotFoundError,
  FashionAnalysisOpportunityNotFoundError,
  FashionAnalysisProjectNotFoundError,
  FashionAnalysisProjectReadOnlyError,
  FashionAnalysisRevisionConflictError,
  FashionAnalysisSignalNotFoundError,
  FashionAnalysisTaskNotFoundError,
  MarketItemId,
  PopularitySignalId,
  TrendClusterId,
} from '@gentlexx/dsh-fashion-analysis'
import { EvidenceId, ResearchTaskId, SampleId, SourceId } from '@gentlexx/dsh-fashion-research'
import { RemoteError } from '@deepseek-ai/dsh-typert-protocol'
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

/** Maps registry operations onto serializable Remote values. */
export class FashionAnalysisCommands {
  /** @param ctx - Host context providing {@link Context.fashionAnalysisRegistry}. */
  constructor(private readonly ctx: Context) {}

  /** @param request - workspace scope; reconciles stale rows before listing. */
  async loadWorkspace(request: AnalysisScopeRequest): Promise<AnalysisWorkspaceValue> {
    return this.runAsync(async () => {
      const projectId = ProjectId(String(request.projectId))
      const taskId = ResearchTaskId(String(request.taskId))
      const staleMarked = await this.ctx.fashionAnalysisRegistry.reconcileStale(projectId, taskId)
      return {
        marketItems: this.ctx.fashionAnalysisRegistry.listMarketItems(projectId, taskId),
        ontologyVersions: this.ctx.fashionAnalysisRegistry.listOntologyVersions(projectId, taskId),
        ontologyTerms: this.ctx.fashionAnalysisRegistry.listOntologyTerms(projectId, taskId),
        assertions: this.ctx.fashionAnalysisRegistry.listAssertions(projectId, taskId),
        signals: this.ctx.fashionAnalysisRegistry.listSignals(projectId, taskId),
        runs: this.ctx.fashionAnalysisRegistry.listRuns(projectId, taskId),
        clusters: this.ctx.fashionAnalysisRegistry.listClusters(projectId, taskId),
        opportunities: this.ctx.fashionAnalysisRegistry.listOpportunities(projectId, taskId),
        decisions: this.ctx.fashionAnalysisRegistry.listDecisions(projectId, taskId),
        staleMarked,
      }
    })
  }

  /** @param request - create market item payload. */
  async createMarketItem(request: CreateMarketItemRequest): Promise<MarketItemValue> {
    return this.runAsync(async () => this.ctx.fashionAnalysisRegistry.createMarketItem(definedProps({
      projectId: ProjectId(String(request.projectId)),
      taskId: ResearchTaskId(String(request.taskId)),
      itemType: request.itemType,
      displayName: request.displayName,
      brandOrCreator: request.brandOrCreator,
      categoryCandidate: request.categoryCandidate,
      matchingMethod: request.matchingMethod,
      observationLinks: request.observationLinks.map(link => ({
        sampleId: SampleId(String(link.sampleId)),
        sourceId: SourceId(String(link.sourceId)),
        evidenceIds: link.evidenceIds.map(id => EvidenceId(String(id))),
      })),
    }) as never))
  }

  /** @param request - get market item payload. */
  getMarketItem(request: GetMarketItemRequest): MarketItemValue {
    return this.runSync(() => this.ctx.fashionAnalysisRegistry.getMarketItem(
      ProjectId(String(request.projectId)),
      ResearchTaskId(String(request.taskId)),
      MarketItemId(String(request.marketItemId)),
    ))
  }

  /** @param request - human dedupe confirmation. */
  async confirmDedupe(request: ConfirmDedupeRequest): Promise<MarketItemValue> {
    return this.runAsync(async () => this.ctx.fashionAnalysisRegistry.confirmDedupe({
      projectId: ProjectId(String(request.projectId)),
      taskId: ResearchTaskId(String(request.taskId)),
      marketItemId: MarketItemId(String(request.marketItemId)),
      expectedRevision: request.expectedRevision,
      dedupeStatus: request.dedupeStatus,
    }))
  }

  /** @param request - create signal payload. */
  async createPopularitySignal(request: CreatePopularitySignalRequest): Promise<SignalValue> {
    return this.runAsync(async () => this.ctx.fashionAnalysisRegistry.createPopularitySignal(definedProps({
      projectId: ProjectId(String(request.projectId)),
      taskId: ResearchTaskId(String(request.taskId)),
      signalType: request.signalType,
      subjectRefs: request.subjectRefs,
      platform: request.platform,
      marketRegion: request.marketRegion,
      windowStart: request.windowStart,
      windowEnd: request.windowEnd,
      observedAt: request.observedAt,
      rawValue: request.rawValue,
      rawUnit: request.rawUnit,
      evidenceIds: request.evidenceIds.map(id => EvidenceId(String(id))),
      methodVersion: request.methodVersion,
      limitations: request.limitations,
    }) as never))
  }

  /** @param request - get signal payload. */
  getSignal(request: GetSignalRequest): SignalValue {
    return this.runSync(() => this.ctx.fashionAnalysisRegistry.getSignal(
      ProjectId(String(request.projectId)),
      ResearchTaskId(String(request.taskId)),
      PopularitySignalId(String(request.signalId)),
    ))
  }

  /** @param request - create cluster payload. */
  async createTrendCluster(request: CreateTrendClusterRequest): Promise<ClusterValue> {
    return this.runAsync(async () => this.ctx.fashionAnalysisRegistry.createTrendCluster(definedProps({
      projectId: ProjectId(String(request.projectId)),
      taskId: ResearchTaskId(String(request.taskId)),
      name: request.name,
      definition: request.definition,
      memberRefs: request.memberRefs,
      sharedAttributeAssertionIds: (request.sharedAttributeAssertionIds ?? []).map(AttributeAssertionId),
      signalIds: (request.signalIds ?? []).map(id => PopularitySignalId(String(id))),
      clusterMethod: request.clusterMethod,
      methodVersion: request.methodVersion,
      marketRegions: request.marketRegions,
      timeContext: request.timeContext,
      evidenceGrade: request.evidenceGrade,
      counterEvidence: request.counterEvidence,
      biasesAndGaps: request.biasesAndGaps,
      lifecycleHypothesis: request.lifecycleHypothesis,
    }) as never))
  }

  /** @param request - get cluster payload. */
  getCluster(request: GetClusterRequest): ClusterValue {
    return this.runSync(() => this.ctx.fashionAnalysisRegistry.getCluster(
      ProjectId(String(request.projectId)),
      ResearchTaskId(String(request.taskId)),
      TrendClusterId(String(request.clusterId)),
    ))
  }

  /** @param request - create opportunity payload. */
  async createDesignOpportunity(request: CreateDesignOpportunityRequest): Promise<OpportunityValue> {
    return this.runAsync(async () => this.ctx.fashionAnalysisRegistry.createDesignOpportunity(definedProps({
      projectId: ProjectId(String(request.projectId)),
      taskId: ResearchTaskId(String(request.taskId)),
      title: request.title,
      opportunityStatement: request.opportunityStatement,
      trendClusterIds: request.trendClusterIds.map(id => TrendClusterId(String(id))),
      targetMarket: request.targetMarket,
      targetUserHypothesis: request.targetUserHypothesis,
      category: request.category,
      timing: request.timing,
      commercialHypotheses: request.commercialHypotheses,
      creativeSpaces: request.creativeSpaces,
      saturationRisks: request.saturationRisks,
      copyingOrIpRisks: request.copyingOrIpRisks,
      unknowns: request.unknowns,
      evidenceGrade: request.evidenceGrade,
    }) as never))
  }

  /** @param request - get opportunity payload. */
  getOpportunity(request: GetOpportunityRequest): OpportunityValue {
    return this.runSync(() => this.ctx.fashionAnalysisRegistry.getOpportunity(
      ProjectId(String(request.projectId)),
      ResearchTaskId(String(request.taskId)),
      DesignOpportunityId(String(request.opportunityId)),
    ))
  }

  /** @param request - human decision payload. */
  async decideOpportunity(request: DecideOpportunityRequest): Promise<DecideOpportunityValue> {
    return this.runAsync(async () => this.ctx.fashionAnalysisRegistry.decideOpportunity({
      projectId: ProjectId(String(request.projectId)),
      taskId: ResearchTaskId(String(request.taskId)),
      opportunityId: DesignOpportunityId(String(request.opportunityId)),
      expectedRevision: request.expectedRevision,
      action: request.action,
      reasonCodes: request.reasonCodes,
      note: request.note,
    }))
  }

  private async runAsync<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      mapAnalysisError(error)
    }
  }

  private runSync<T>(fn: () => T): T {
    try {
      return fn()
    } catch (error) {
      mapAnalysisError(error)
    }
  }
}

function mapAnalysisError(error: unknown): never {
  if (error instanceof FashionAnalysisProjectNotFoundError) {
    throw new RemoteError('fashion-analysis/project-not-found', error.message, { projectId: error.projectId })
  }
  if (error instanceof FashionAnalysisTaskNotFoundError) {
    throw new RemoteError('fashion-analysis/task-not-found', error.message, { taskId: error.taskId })
  }
  if (error instanceof FashionAnalysisItemNotFoundError) {
    throw new RemoteError('fashion-analysis/item-not-found', error.message, { marketItemId: error.marketItemId })
  }
  if (error instanceof FashionAnalysisSignalNotFoundError) {
    throw new RemoteError('fashion-analysis/signal-not-found', error.message, { signalId: error.signalId })
  }
  if (error instanceof FashionAnalysisClusterNotFoundError) {
    throw new RemoteError('fashion-analysis/cluster-not-found', error.message, { clusterId: error.clusterId })
  }
  if (error instanceof FashionAnalysisOpportunityNotFoundError) {
    throw new RemoteError('fashion-analysis/opportunity-not-found', error.message, {
      opportunityId: error.opportunityId,
    })
  }
  if (error instanceof FashionAnalysisProjectReadOnlyError) {
    throw new RemoteError('fashion-analysis/project-read-only', error.message, { projectId: error.projectId })
  }
  if (error instanceof FashionAnalysisCrossProjectReferenceError) {
    throw new RemoteError('fashion-analysis/cross-project-reference', error.message, {
      projectId: error.projectId,
      otherProjectId: error.otherProjectId,
    })
  }
  if (error instanceof FashionAnalysisCrossTaskReferenceError) {
    throw new RemoteError('fashion-analysis/cross-task-reference', error.message, {
      taskId: error.taskId,
      otherTaskId: error.otherTaskId,
    })
  }
  if (error instanceof FashionAnalysisRevisionConflictError) {
    throw new RemoteError('fashion-analysis/revision-conflict', error.message, {
      expected: error.expected,
      actual: error.actual,
    })
  }
  if (error instanceof FashionAnalysisInvalidInputError) {
    throw new RemoteError('fashion-analysis/invalid-input', error.message, { reason: error.reason })
  }
  if (error instanceof FashionAnalysisInvalidTransitionError) {
    throw new RemoteError('fashion-analysis/invalid-transition', error.message, { reason: error.reason })
  }
  if (error instanceof FashionAnalysisEvidenceNotEligibleError) {
    throw new RemoteError('fashion-analysis/evidence-not-eligible', error.message, {
      evidenceId: error.evidenceId,
    })
  }
  throw error
}

/** Drop keys whose value is `undefined` for exactOptionalPropertyTypes call sites. */
function definedProps(input: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) out[key] = value
  }
  return out
}
