/**
 * Fashion Analysis registry (`ctx.fashionAnalysisRegistry`) over `fashion_analysis@0`.
 * @module @gentlexx/dsh-fashion-analysis/src/registry
 */

import { randomUUID } from 'node:crypto'
import { Context, Service } from '@deepseek-ai/cordis'
import { R0_PROJECT_ID } from '@gentlexx/dsh-fashion-project'
import type { ProjectId } from '@gentlexx/dsh-fashion-project/types'
import {
  EvidenceId as brandEvidenceId,
  SampleId as brandSampleId,
  SourceId as brandSourceId,
} from '@gentlexx/dsh-fashion-research'
import type {
  EvidenceId,
  ResearchTaskId,
} from '@gentlexx/dsh-fashion-research/types'
import type { KvTable } from '@deepseek-ai/dsh-storage-domain'
import {
  FashionAnalysisClusterNotFoundError,
  FashionAnalysisCrossProjectReferenceError,
  FashionAnalysisCrossTaskReferenceError,
  FashionAnalysisEvidenceNotEligibleError,
  FashionAnalysisIdCollisionError,
  FashionAnalysisInvalidInputError,
  FashionAnalysisInvalidTransitionError,
  FashionAnalysisItemNotFoundError,
  FashionAnalysisOpportunityNotFoundError,
  FashionAnalysisProjectNotFoundError,
  FashionAnalysisProjectReadOnlyError,
  FashionAnalysisRevisionConflictError,
  FashionAnalysisSeedConflictError,
  FashionAnalysisSignalNotFoundError,
  FashionAnalysisTaskNotFoundError,
} from './errors.ts'
import {
  DesignOpportunityId as brandDesignOpportunityId,
  MarketItemId as brandMarketItemId,
  OpportunityDecisionId as brandOpportunityDecisionId,
  PopularitySignalId as brandPopularitySignalId,
  TrendClusterId as brandTrendClusterId,
} from './ids.ts'
import { compareAnalysisUpdatedDesc } from './order.ts'
import type {
  AnalysisRunRecordV0,
  AttributeAssertionRecordV0,
  DesignOpportunityRecordV0,
  MarketItemRecordV0,
  OntologyTermRecordV0,
  OntologyVersionRecordV0,
  OpportunityDecisionRecordV0,
  PopularitySignalRecordV0,
  TrendClusterRecordV0,
} from './schema/v0/records.ts'
import {
  isValidR0AnalysisSeed,
  R0_ANALYSIS_RUN_SEEDS,
  R0_ASSERTION_SEEDS,
  R0_CLUSTER_SEED,
  R0_DECISION_SEED,
  R0_MARKET_ITEM_SEEDS,
  R0_ONTOLOGY_TERM_SEEDS,
  R0_ONTOLOGY_VERSION_ID,
  R0_ONTOLOGY_VERSION_RECORD,
  R0_OPPORTUNITY_SEED,
  R0_SIGNAL_SEEDS,
} from './seed/r0-analysis.ts'
import { fashionAnalysisDomainSpec } from './spec.ts'
import type {
  ActorRef,
  AnalysisRun,
  AttributeAssertionId,
  ClusterMethod,
  DesignOpportunity,
  DesignOpportunityId,
  DedupeStatus,
  EvidenceGrade,
  FashionAttributeAssertion,
  MarketItem,
  MarketItemId,
  MarketItemType,
  MatchingMethod,
  ObservationLink,
  OntologyTerm,
  OntologyVersion,
  OntologyVersionId,
  OpportunityDecision,
  OpportunityDecisionAction,
  OpportunityDecisionId,
  OpportunityReasonCode,
  PopularitySignal,
  PopularitySignalId,
  PopularitySignalType,
  TrendCluster,
  TrendClusterId,
} from './types.ts'
import { FASHION_ANALYSIS_SCHEMA_VERSION } from './types.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    fashionAnalysisRegistry: FashionAnalysisRegistry
  }
}

function mintId<T extends string>(
  brand: (id: string) => T,
  occupied: (id: T) => boolean,
): T {
  let id = brand(randomUUID())
  if (!occupied(id)) return id
  id = brand(randomUUID())
  if (occupied(id)) throw new FashionAnalysisIdCollisionError(String(id))
  return id
}

function toMarketItem(id: MarketItemId, record: MarketItemRecordV0): MarketItem {
  return {
    id,
    projectId: record.projectId as ProjectId,
    taskId: record.taskId as ResearchTaskId,
    itemType: record.itemType,
    displayName: record.displayName,
    brandOrCreator: record.brandOrCreator,
    categoryCandidate: record.categoryCandidate,
    observationLinks: record.observationLinks.map((link): ObservationLink => ({
      sampleId: brandSampleId(link.sampleId),
      sourceId: brandSourceId(link.sourceId),
      evidenceIds: link.evidenceIds.map(brandEvidenceId),
    })),
    dedupeStatus: record.dedupeStatus,
    matchingMethod: record.matchingMethod,
    matchingScore: record.matchingScore,
    humanConfirmedBy: record.humanConfirmedBy,
    humanConfirmedAt: record.humanConfirmedAt,
    origin: record.origin,
    accessMode: record.accessMode,
    status: record.status,
    revision: record.revision,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    createdBy: record.createdBy,
    updatedBy: record.updatedBy,
    schemaVersion: record.schemaVersion,
    archivedAt: record.archivedAt,
    staleReason: record.staleReason,
  }
}

function toOntologyVersion(id: OntologyVersionId, record: OntologyVersionRecordV0): OntologyVersion {
  return {
    id,
    projectId: record.projectId as ProjectId,
    taskId: record.taskId as ResearchTaskId,
    versionLabel: record.versionLabel,
    ontologyStatus: record.ontologyStatus,
    scopeNote: record.scopeNote,
    publishedAt: record.publishedAt,
    origin: record.origin,
    accessMode: record.accessMode,
    status: record.status,
    revision: record.revision,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    createdBy: record.createdBy,
    updatedBy: record.updatedBy,
    schemaVersion: record.schemaVersion,
    archivedAt: record.archivedAt,
    staleReason: record.staleReason,
  }
}

function toOntologyTerm(id: OntologyTerm['id'], record: OntologyTermRecordV0): OntologyTerm {
  return {
    id,
    projectId: record.projectId as ProjectId,
    taskId: record.taskId as ResearchTaskId,
    ontologyVersionId: record.ontologyVersionId as OntologyVersion['id'],
    domain: record.domain,
    canonicalLabel: record.canonicalLabel,
    aliases: record.aliases,
    parentTermId: record.parentTermId === null ? null : record.parentTermId as OntologyTerm['id'],
    externalMappings: record.externalMappings,
    definition: record.definition,
    termStatus: record.termStatus,
    origin: record.origin,
    accessMode: record.accessMode,
    status: record.status,
    revision: record.revision,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    createdBy: record.createdBy,
    updatedBy: record.updatedBy,
    schemaVersion: record.schemaVersion,
    archivedAt: record.archivedAt,
    staleReason: record.staleReason,
  }
}

function toAssertion(id: AttributeAssertionId, record: AttributeAssertionRecordV0): FashionAttributeAssertion {
  return {
    id,
    projectId: record.projectId as ProjectId,
    taskId: record.taskId as ResearchTaskId,
    subjectType: 'market_item',
    subjectId: record.subjectId as MarketItemId,
    attributePath: record.attributePath,
    rawValue: record.rawValue,
    normalizedTermId: record.normalizedTermId === null ? null : record.normalizedTermId as FashionAttributeAssertion['normalizedTermId'],
    ontologyVersionId: record.ontologyVersionId as FashionAttributeAssertion['ontologyVersionId'],
    assertionSource: record.assertionSource,
    evidenceIds: record.evidenceIds.map(brandEvidenceId),
    confidence: record.confidence,
    reviewStatus: record.reviewStatus,
    reviewedBy: record.reviewedBy,
    reviewedAt: record.reviewedAt,
    correctionReason: record.correctionReason,
    supersedesAssertionId: record.supersedesAssertionId === null
      ? null
      : record.supersedesAssertionId as AttributeAssertionId,
    origin: record.origin,
    accessMode: record.accessMode,
    status: record.status,
    revision: record.revision,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    createdBy: record.createdBy,
    updatedBy: record.updatedBy,
    schemaVersion: record.schemaVersion,
    archivedAt: record.archivedAt,
    staleReason: record.staleReason,
  }
}

function toSignal(id: PopularitySignalId, record: PopularitySignalRecordV0): PopularitySignal {
  return {
    id,
    projectId: record.projectId as ProjectId,
    taskId: record.taskId as ResearchTaskId,
    signalType: record.signalType,
    subjectRefs: record.subjectRefs,
    platform: record.platform,
    marketRegion: record.marketRegion,
    windowStart: record.windowStart,
    windowEnd: record.windowEnd,
    observedAt: record.observedAt,
    rawValue: record.rawValue,
    rawUnit: record.rawUnit,
    normalizedValue: record.normalizedValue,
    normalizationMethod: record.normalizationMethod,
    baseline: record.baseline,
    sampleSize: record.sampleSize,
    evidenceIds: record.evidenceIds.map(brandEvidenceId),
    methodVersion: record.methodVersion,
    limitations: record.limitations,
    signalStatus: record.signalStatus,
    origin: record.origin,
    accessMode: record.accessMode,
    status: record.status,
    revision: record.revision,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    createdBy: record.createdBy,
    updatedBy: record.updatedBy,
    schemaVersion: record.schemaVersion,
    archivedAt: record.archivedAt,
    staleReason: record.staleReason,
  }
}

function toRun(id: AnalysisRun['id'], record: AnalysisRunRecordV0): AnalysisRun {
  return {
    id,
    projectId: record.projectId as ProjectId,
    taskId: record.taskId as ResearchTaskId,
    runType: record.runType,
    methodName: record.methodName,
    methodVersion: record.methodVersion,
    inputRefs: record.inputRefs,
    outputRefs: record.outputRefs,
    ontologyVersionId: record.ontologyVersionId === null
      ? null
      : record.ontologyVersionId as AnalysisRun['ontologyVersionId'],
    ruleSetVersion: record.ruleSetVersion,
    runStatus: record.runStatus,
    startedAt: record.startedAt,
    finishedAt: record.finishedAt,
    errorCode: record.errorCode,
    errorSummary: record.errorSummary,
    qualityResults: record.qualityResults,
    idempotencyKey: record.idempotencyKey,
    origin: record.origin,
    accessMode: record.accessMode,
    status: record.status,
    revision: record.revision,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    createdBy: record.createdBy,
    updatedBy: record.updatedBy,
    schemaVersion: record.schemaVersion,
    archivedAt: record.archivedAt,
    staleReason: record.staleReason,
  }
}

function toCluster(id: TrendClusterId, record: TrendClusterRecordV0): TrendCluster {
  return {
    id,
    projectId: record.projectId as ProjectId,
    taskId: record.taskId as ResearchTaskId,
    name: record.name,
    definition: record.definition,
    memberRefs: record.memberRefs,
    sharedAttributeAssertionIds: record.sharedAttributeAssertionIds.map(
      value => value as AttributeAssertionId,
    ),
    signalIds: record.signalIds.map(value => value as PopularitySignalId),
    clusterMethod: record.clusterMethod,
    methodVersion: record.methodVersion,
    marketRegions: record.marketRegions,
    timeContext: record.timeContext,
    evidenceGrade: record.evidenceGrade,
    counterEvidence: record.counterEvidence,
    biasesAndGaps: record.biasesAndGaps,
    lifecycleHypothesis: record.lifecycleHypothesis,
    humanReviewStatus: record.humanReviewStatus,
    analysisRunId: record.analysisRunId === null ? null : record.analysisRunId as AnalysisRun['id'],
    origin: record.origin,
    accessMode: record.accessMode,
    status: record.status,
    revision: record.revision,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    createdBy: record.createdBy,
    updatedBy: record.updatedBy,
    schemaVersion: record.schemaVersion,
    archivedAt: record.archivedAt,
    staleReason: record.staleReason,
  }
}

function toOpportunity(id: DesignOpportunityId, record: DesignOpportunityRecordV0): DesignOpportunity {
  return {
    id,
    projectId: record.projectId as ProjectId,
    taskId: record.taskId as ResearchTaskId,
    title: record.title,
    opportunityStatement: record.opportunityStatement,
    trendClusterIds: record.trendClusterIds.map(value => value as TrendClusterId),
    targetMarket: record.targetMarket,
    targetUserHypothesis: record.targetUserHypothesis,
    category: record.category,
    timing: record.timing,
    commercialHypotheses: record.commercialHypotheses,
    creativeSpaces: record.creativeSpaces,
    saturationRisks: record.saturationRisks,
    copyingOrIpRisks: record.copyingOrIpRisks,
    unknowns: record.unknowns,
    evidenceGrade: record.evidenceGrade,
    reviewStatus: record.reviewStatus,
    analysisRunId: record.analysisRunId === null ? null : record.analysisRunId as AnalysisRun['id'],
    currentDecisionId: record.currentDecisionId === null
      ? null
      : record.currentDecisionId as DesignOpportunity['currentDecisionId'],
    publicRebuildRecorded: record.publicRebuildRecorded,
    origin: record.origin,
    accessMode: record.accessMode,
    status: record.status,
    revision: record.revision,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    createdBy: record.createdBy,
    updatedBy: record.updatedBy,
    schemaVersion: record.schemaVersion,
    archivedAt: record.archivedAt,
    staleReason: record.staleReason,
  }
}

function toDecision(id: OpportunityDecision['id'], record: OpportunityDecisionRecordV0): OpportunityDecision {
  return {
    id,
    projectId: record.projectId as ProjectId,
    taskId: record.taskId as ResearchTaskId,
    opportunityId: record.opportunityId as DesignOpportunityId,
    opportunityRevision: record.opportunityRevision,
    action: record.action,
    reasonCodes: record.reasonCodes,
    note: record.note,
    actor: 'local-human',
    createdAt: record.createdAt,
    schemaVersion: record.schemaVersion,
    publicRebuildRecorded: record.publicRebuildRecorded,
  }
}

/**
 * Durable Fashion Analysis registry.
 * Opens `fashion_analysis@0`, seeds R0 analysis once, and exposes CRUD / human gates / stale reconcile.
 */
export class FashionAnalysisRegistry extends Service {
  static inject = ['storageDomain', 'fashionProjectRegistry', 'fashionResearchRegistry']

  private marketItems?: KvTable<MarketItemId, MarketItemRecordV0>
  private ontologyVersions?: KvTable<OntologyVersionId, OntologyVersionRecordV0>
  private ontologyTerms?: KvTable<OntologyTerm['id'], OntologyTermRecordV0>
  private assertions?: KvTable<AttributeAssertionId, AttributeAssertionRecordV0>
  private signals?: KvTable<PopularitySignalId, PopularitySignalRecordV0>
  private runs?: KvTable<AnalysisRun['id'], AnalysisRunRecordV0>
  private clusters?: KvTable<TrendClusterId, TrendClusterRecordV0>
  private opportunities?: KvTable<DesignOpportunityId, DesignOpportunityRecordV0>
  private decisions?: KvTable<OpportunityDecisionId, OpportunityDecisionRecordV0>

  /** @param ctx - Host context. */
  constructor(ctx: Context) {
    super(ctx, 'fashionAnalysisRegistry')
  }

  /** Open the domain, ensure R0 analysis seed, and register the close disposer. */
  protected async [Service.init](): Promise<void> {
    const domain = await this.ctx.storageDomain.open(fashionAnalysisDomainSpec)
    this.ctx.effect(() => () => domain.close(), 'fashionAnalysis.domainClose')
    this.marketItems = domain.table('market_items')
    this.ontologyVersions = domain.table('ontology_versions')
    this.ontologyTerms = domain.table('ontology_terms')
    this.assertions = domain.table('attribute_assertions')
    this.signals = domain.table('popularity_signals')
    this.runs = domain.table('analysis_runs')
    this.clusters = domain.table('trend_clusters')
    this.opportunities = domain.table('design_opportunities')
    this.decisions = domain.table('opportunity_decisions')
    await this.ensureR0Seed()
  }

  /**
   * List MarketItems for a Project/Task.
   * @param projectId - Owning project.
   * @param taskId - Owning research task.
   */
  listMarketItems(projectId: ProjectId, taskId: ResearchTaskId): readonly MarketItem[] {
    this.requireTaskInProject(taskId, projectId)
    const items: MarketItem[] = []
    for (const [id, record] of this.requireItems().entries()) {
      if (record.projectId !== String(projectId) || record.taskId !== String(taskId)) continue
      items.push(toMarketItem(id, record))
    }
    items.sort(compareAnalysisUpdatedDesc)
    return items
  }

  /**
   * Read one MarketItem with parent-chain check.
   * @param projectId - Expected project.
   * @param taskId - Expected task.
   * @param marketItemId - Item identity.
   */
  getMarketItem(projectId: ProjectId, taskId: ResearchTaskId, marketItemId: MarketItemId): MarketItem {
    return toMarketItem(marketItemId, this.requireItemInTask(marketItemId, projectId, taskId))
  }

  /**
   * Create a MarketItem from eligible confirmed observations.
   * @param input - Parent chain, display fields, and observation links.
   */
  async createMarketItem(input: {
    projectId: ProjectId
    taskId: ResearchTaskId
    itemType: MarketItemType
    displayName: string
    brandOrCreator?: string | null
    categoryCandidate?: string | null
    observationLinks: readonly ObservationLink[]
    matchingMethod?: MatchingMethod
    actor?: ActorRef
  }): Promise<MarketItem> {
    const actor = input.actor ?? 'local-human'
    this.requireEditableProject(input.projectId)
    this.requireTaskInProject(input.taskId, input.projectId)
    const displayName = input.displayName.trim()
    if (displayName.length < 1 || displayName.length > 200) {
      throw new FashionAnalysisInvalidInputError('invalid-display-name')
    }
    if (input.observationLinks.length < 1) {
      throw new FashionAnalysisInvalidInputError('observation-links-required')
    }
    for (const link of input.observationLinks) {
      this.requireEligibleObservation(input.projectId, input.taskId, link)
    }
    if (actor === 'system-rule' && input.matchingMethod === 'manual') {
      throw new FashionAnalysisInvalidTransitionError('rule-cannot-manual-match')
    }
    const now = new Date().toISOString()
    const table = this.requireItems()
    const id = mintId(brandMarketItemId, candidate => table.get(candidate) !== undefined)
    const record: MarketItemRecordV0 = {
      projectId: String(input.projectId),
      taskId: String(input.taskId),
      itemType: input.itemType,
      displayName,
      brandOrCreator: input.brandOrCreator?.trim() || null,
      categoryCandidate: input.categoryCandidate?.trim() || null,
      observationLinks: input.observationLinks.map(link => ({
        sampleId: String(link.sampleId),
        sourceId: String(link.sourceId),
        evidenceIds: link.evidenceIds.map(String),
      })),
      dedupeStatus: 'unreviewed',
      matchingMethod: input.matchingMethod ?? (actor === 'system-rule' ? 'rule' : 'manual'),
      matchingScore: null,
      humanConfirmedBy: null,
      humanConfirmedAt: null,
      origin: actor === 'system-rule' ? 'rule' : 'human',
      accessMode: 'editable',
      status: 'active',
      revision: 0,
      createdAt: now,
      updatedAt: now,
      createdBy: actor,
      updatedBy: actor,
      schemaVersion: FASHION_ANALYSIS_SCHEMA_VERSION,
      archivedAt: null,
      staleReason: null,
    }
    await table.put(id, record)
    return toMarketItem(id, record)
  }

  /**
   * Human-only dedupe confirmation.
   * @param input - Parent chain, expectedRevision, and confirmed_same|confirmed_distinct.
   */
  async confirmDedupe(input: {
    projectId: ProjectId
    taskId: ResearchTaskId
    marketItemId: MarketItemId
    expectedRevision: number
    dedupeStatus: Extract<DedupeStatus, 'confirmed_same' | 'confirmed_distinct'>
    actor?: ActorRef
  }): Promise<MarketItem> {
    const actor = input.actor ?? 'local-human'
    if (actor !== 'local-human') {
      throw new FashionAnalysisInvalidTransitionError('dedupe-confirm-must-be-human')
    }
    this.requireEditableProject(input.projectId)
    const table = this.requireItems()
    const existing = this.requireItemInTask(input.marketItemId, input.projectId, input.taskId)
    if (existing.accessMode === 'read-only') {
      throw new FashionAnalysisProjectReadOnlyError(input.projectId)
    }
    if (existing.revision !== input.expectedRevision) {
      throw new FashionAnalysisRevisionConflictError(input.expectedRevision, existing.revision)
    }
    const now = new Date().toISOString()
    const next: MarketItemRecordV0 = {
      ...existing,
      dedupeStatus: input.dedupeStatus,
      humanConfirmedBy: actor,
      humanConfirmedAt: now,
      revision: existing.revision + 1,
      updatedAt: now,
      updatedBy: actor,
    }
    await table.put(input.marketItemId, next)
    return toMarketItem(input.marketItemId, next)
  }

  /**
   * Rule path may only write candidate_match.
   * @param input - Parent chain and expectedRevision.
   */
  async markDedupeCandidate(input: {
    projectId: ProjectId
    taskId: ResearchTaskId
    marketItemId: MarketItemId
    expectedRevision: number
    matchingScore?: number | null
    actor?: ActorRef
  }): Promise<MarketItem> {
    const actor = input.actor ?? 'system-rule'
    if (actor === 'local-human') {
      throw new FashionAnalysisInvalidTransitionError('use-confirm-dedupe-for-human')
    }
    this.requireEditableProject(input.projectId)
    const table = this.requireItems()
    const existing = this.requireItemInTask(input.marketItemId, input.projectId, input.taskId)
    if (existing.revision !== input.expectedRevision) {
      throw new FashionAnalysisRevisionConflictError(input.expectedRevision, existing.revision)
    }
    const now = new Date().toISOString()
    const next: MarketItemRecordV0 = {
      ...existing,
      dedupeStatus: 'candidate_match',
      matchingMethod: 'rule',
      matchingScore: input.matchingScore ?? null,
      revision: existing.revision + 1,
      updatedAt: now,
      updatedBy: actor,
    }
    await table.put(input.marketItemId, next)
    return toMarketItem(input.marketItemId, next)
  }

  /** @param projectId - Owning project. @param taskId - Owning task. */
  listOntologyVersions(projectId: ProjectId, taskId: ResearchTaskId): readonly OntologyVersion[] {
    this.requireTaskInProject(taskId, projectId)
    const items: OntologyVersion[] = []
    for (const [id, record] of this.requireOntologyVersions().entries()) {
      if (record.projectId !== String(projectId) || record.taskId !== String(taskId)) continue
      items.push(toOntologyVersion(id, record))
    }
    items.sort(compareAnalysisUpdatedDesc)
    return items
  }

  /** @param projectId - Owning project. @param taskId - Owning task. */
  listOntologyTerms(projectId: ProjectId, taskId: ResearchTaskId): readonly OntologyTerm[] {
    this.requireTaskInProject(taskId, projectId)
    const items: OntologyTerm[] = []
    for (const [id, record] of this.requireOntologyTerms().entries()) {
      if (record.projectId !== String(projectId) || record.taskId !== String(taskId)) continue
      items.push(toOntologyTerm(id, record))
    }
    items.sort(compareAnalysisUpdatedDesc)
    return items
  }

  /** @param projectId - Owning project. @param taskId - Owning task. */
  listAssertions(projectId: ProjectId, taskId: ResearchTaskId): readonly FashionAttributeAssertion[] {
    this.requireTaskInProject(taskId, projectId)
    const items: FashionAttributeAssertion[] = []
    for (const [id, record] of this.requireAssertions().entries()) {
      if (record.projectId !== String(projectId) || record.taskId !== String(taskId)) continue
      items.push(toAssertion(id, record))
    }
    items.sort(compareAnalysisUpdatedDesc)
    return items
  }

  /** @param projectId - Owning project. @param taskId - Owning task. */
  listSignals(projectId: ProjectId, taskId: ResearchTaskId): readonly PopularitySignal[] {
    this.requireTaskInProject(taskId, projectId)
    const items: PopularitySignal[] = []
    for (const [id, record] of this.requireSignals().entries()) {
      if (record.projectId !== String(projectId) || record.taskId !== String(taskId)) continue
      items.push(toSignal(id, record))
    }
    items.sort(compareAnalysisUpdatedDesc)
    return items
  }

  /**
   * Read one PopularitySignal with parent-chain check.
   * @param projectId - Expected project.
   * @param taskId - Expected task.
   * @param signalId - Signal identity.
   */
  getSignal(projectId: ProjectId, taskId: ResearchTaskId, signalId: PopularitySignalId): PopularitySignal {
    return toSignal(signalId, this.requireSignalInTask(signalId, projectId, taskId))
  }

  /**
   * Create a PopularitySignal from confirmed Evidence (no hotScore).
   * @param input - Signal fields and evidence ids.
   */
  async createPopularitySignal(input: {
    projectId: ProjectId
    taskId: ResearchTaskId
    signalType: PopularitySignalType
    subjectRefs: PopularitySignal['subjectRefs']
    platform: string
    marketRegion?: string | null
    windowStart?: string | null
    windowEnd?: string | null
    observedAt: string
    rawValue: string
    rawUnit: string
    evidenceIds: readonly EvidenceId[]
    methodVersion: string
    limitations: readonly string[]
    signalStatus?: PopularitySignal['signalStatus']
    actor?: ActorRef
  }): Promise<PopularitySignal> {
    const actor = input.actor ?? 'local-human'
    this.requireEditableProject(input.projectId)
    this.requireTaskInProject(input.taskId, input.projectId)
    if (input.evidenceIds.length < 1) throw new FashionAnalysisInvalidInputError('evidence-required')
    for (const evidenceId of input.evidenceIds) {
      this.requireEligibleEvidence(input.projectId, input.taskId, evidenceId)
    }
    const now = new Date().toISOString()
    const table = this.requireSignals()
    const id = mintId(brandPopularitySignalId, candidate => table.get(candidate) !== undefined)
    const record: PopularitySignalRecordV0 = {
      projectId: String(input.projectId),
      taskId: String(input.taskId),
      signalType: input.signalType,
      subjectRefs: [...input.subjectRefs],
      platform: input.platform.trim(),
      marketRegion: input.marketRegion ?? null,
      windowStart: input.windowStart ?? null,
      windowEnd: input.windowEnd ?? null,
      observedAt: input.observedAt,
      rawValue: input.rawValue.trim(),
      rawUnit: input.rawUnit.trim(),
      normalizedValue: null,
      normalizationMethod: null,
      baseline: null,
      sampleSize: null,
      evidenceIds: input.evidenceIds.map(String),
      methodVersion: input.methodVersion.trim(),
      limitations: [...input.limitations],
      signalStatus: input.signalStatus ?? 'observed',
      origin: actor === 'system-rule' ? 'rule' : 'human',
      accessMode: 'editable',
      status: 'active',
      revision: 0,
      createdAt: now,
      updatedAt: now,
      createdBy: actor,
      updatedBy: actor,
      schemaVersion: FASHION_ANALYSIS_SCHEMA_VERSION,
      archivedAt: null,
      staleReason: null,
    }
    if (record.platform.length < 1 || record.rawValue.length < 1 || record.methodVersion.length < 1) {
      throw new FashionAnalysisInvalidInputError('signal-fields-required')
    }
    await table.put(id, record)
    return toSignal(id, record)
  }

  /** @param projectId - Owning project. @param taskId - Owning task. */
  listRuns(projectId: ProjectId, taskId: ResearchTaskId): readonly AnalysisRun[] {
    this.requireTaskInProject(taskId, projectId)
    const items: AnalysisRun[] = []
    for (const [id, record] of this.requireRuns().entries()) {
      if (record.projectId !== String(projectId) || record.taskId !== String(taskId)) continue
      items.push(toRun(id, record))
    }
    items.sort(compareAnalysisUpdatedDesc)
    return items
  }

  /** @param projectId - Owning project. @param taskId - Owning task. */
  listClusters(projectId: ProjectId, taskId: ResearchTaskId): readonly TrendCluster[] {
    this.requireTaskInProject(taskId, projectId)
    const items: TrendCluster[] = []
    for (const [id, record] of this.requireClusters().entries()) {
      if (record.projectId !== String(projectId) || record.taskId !== String(taskId)) continue
      items.push(toCluster(id, record))
    }
    items.sort(compareAnalysisUpdatedDesc)
    return items
  }

  /**
   * Read one TrendCluster with parent-chain check.
   * @param projectId - Expected project.
   * @param taskId - Expected task.
   * @param clusterId - Cluster identity.
   */
  getCluster(projectId: ProjectId, taskId: ResearchTaskId, clusterId: TrendClusterId): TrendCluster {
    return toCluster(clusterId, this.requireClusterInTask(clusterId, projectId, taskId))
  }

  /**
   * Create a TrendCluster (manual or rule). Rules stay at humanReviewStatus draft.
   * @param input - Cluster fields.
   */
  async createTrendCluster(input: {
    projectId: ProjectId
    taskId: ResearchTaskId
    name: string
    definition: string
    memberRefs: TrendCluster['memberRefs']
    sharedAttributeAssertionIds?: readonly AttributeAssertionId[]
    signalIds?: readonly PopularitySignalId[]
    clusterMethod: ClusterMethod
    methodVersion: string
    marketRegions: readonly string[]
    timeContext: string
    evidenceGrade: EvidenceGrade
    counterEvidence: readonly string[]
    biasesAndGaps: readonly string[]
    lifecycleHypothesis?: string | null
    actor?: ActorRef
  }): Promise<TrendCluster> {
    const actor = input.actor ?? 'local-human'
    this.requireEditableProject(input.projectId)
    this.requireTaskInProject(input.taskId, input.projectId)
    if (input.memberRefs.length < 1) throw new FashionAnalysisInvalidInputError('cluster-members-required')
    const now = new Date().toISOString()
    const table = this.requireClusters()
    const id = mintId(brandTrendClusterId, candidate => table.get(candidate) !== undefined)
    const record: TrendClusterRecordV0 = {
      projectId: String(input.projectId),
      taskId: String(input.taskId),
      name: input.name.trim(),
      definition: input.definition.trim(),
      memberRefs: [...input.memberRefs],
      sharedAttributeAssertionIds: (input.sharedAttributeAssertionIds ?? []).map(String),
      signalIds: (input.signalIds ?? []).map(String),
      clusterMethod: input.clusterMethod,
      methodVersion: input.methodVersion.trim(),
      marketRegions: [...input.marketRegions],
      timeContext: input.timeContext.trim(),
      evidenceGrade: input.evidenceGrade,
      counterEvidence: [...input.counterEvidence],
      biasesAndGaps: [...input.biasesAndGaps],
      lifecycleHypothesis: input.lifecycleHypothesis ?? null,
      humanReviewStatus: 'draft',
      analysisRunId: null,
      origin: actor === 'system-rule' ? 'rule' : 'human',
      accessMode: 'editable',
      status: 'active',
      revision: 0,
      createdAt: now,
      updatedAt: now,
      createdBy: actor,
      updatedBy: actor,
      schemaVersion: FASHION_ANALYSIS_SCHEMA_VERSION,
      archivedAt: null,
      staleReason: null,
    }
    await table.put(id, record)
    return toCluster(id, record)
  }

  /** @param projectId - Owning project. @param taskId - Owning task. */
  listOpportunities(projectId: ProjectId, taskId: ResearchTaskId): readonly DesignOpportunity[] {
    this.requireTaskInProject(taskId, projectId)
    const items: DesignOpportunity[] = []
    for (const [id, record] of this.requireOpportunities().entries()) {
      if (record.projectId !== String(projectId) || record.taskId !== String(taskId)) continue
      items.push(toOpportunity(id, record))
    }
    items.sort(compareAnalysisUpdatedDesc)
    return items
  }

  /**
   * Read one DesignOpportunity with parent-chain check.
   * @param projectId - Expected project.
   * @param taskId - Expected task.
   * @param opportunityId - Opportunity identity.
   */
  getOpportunity(
    projectId: ProjectId,
    taskId: ResearchTaskId,
    opportunityId: DesignOpportunityId,
  ): DesignOpportunity {
    return toOpportunity(opportunityId, this.requireOpportunityInTask(opportunityId, projectId, taskId))
  }

  /**
   * Create a DesignOpportunity candidate (system/rule/human). Never auto-selected.
   * @param input - Opportunity fields.
   */
  async createDesignOpportunity(input: {
    projectId: ProjectId
    taskId: ResearchTaskId
    title: string
    opportunityStatement: string
    trendClusterIds: readonly TrendClusterId[]
    targetMarket: string
    targetUserHypothesis: string
    category: string
    timing: string
    commercialHypotheses?: readonly string[]
    creativeSpaces?: readonly string[]
    saturationRisks?: readonly string[]
    copyingOrIpRisks?: readonly string[]
    unknowns?: readonly string[]
    evidenceGrade: EvidenceGrade
    actor?: ActorRef
  }): Promise<DesignOpportunity> {
    const actor = input.actor ?? 'local-human'
    this.requireEditableProject(input.projectId)
    this.requireTaskInProject(input.taskId, input.projectId)
    if (input.trendClusterIds.length < 1) {
      throw new FashionAnalysisInvalidInputError('cluster-required')
    }
    for (const clusterId of input.trendClusterIds) {
      this.requireClusterInTask(clusterId, input.projectId, input.taskId)
    }
    const now = new Date().toISOString()
    const table = this.requireOpportunities()
    const id = mintId(brandDesignOpportunityId, candidate => table.get(candidate) !== undefined)
    const record: DesignOpportunityRecordV0 = {
      projectId: String(input.projectId),
      taskId: String(input.taskId),
      title: input.title.trim(),
      opportunityStatement: input.opportunityStatement.trim(),
      trendClusterIds: input.trendClusterIds.map(String),
      targetMarket: input.targetMarket.trim(),
      targetUserHypothesis: input.targetUserHypothesis.trim(),
      category: input.category.trim(),
      timing: input.timing.trim(),
      commercialHypotheses: [...(input.commercialHypotheses ?? [])],
      creativeSpaces: [...(input.creativeSpaces ?? [])],
      saturationRisks: [...(input.saturationRisks ?? [])],
      copyingOrIpRisks: [...(input.copyingOrIpRisks ?? [])],
      unknowns: [...(input.unknowns ?? [])],
      evidenceGrade: input.evidenceGrade,
      reviewStatus: 'candidate',
      analysisRunId: null,
      currentDecisionId: null,
      publicRebuildRecorded: false,
      origin: actor === 'system-rule' ? 'rule' : 'human',
      accessMode: 'editable',
      status: 'active',
      revision: 0,
      createdAt: now,
      updatedAt: now,
      createdBy: actor,
      updatedBy: actor,
      schemaVersion: FASHION_ANALYSIS_SCHEMA_VERSION,
      archivedAt: null,
      staleReason: null,
    }
    await table.put(id, record)
    return toOpportunity(id, record)
  }

  /**
   * Append an immutable human OpportunityDecision and update reviewStatus.
   * @param input - Decision payload; actor must be local-human.
   */
  async decideOpportunity(input: {
    projectId: ProjectId
    taskId: ResearchTaskId
    opportunityId: DesignOpportunityId
    expectedRevision: number
    action: OpportunityDecisionAction
    reasonCodes: readonly OpportunityReasonCode[]
    note: string
    actor?: ActorRef
  }): Promise<{ opportunity: DesignOpportunity; decision: OpportunityDecision }> {
    const actor = input.actor ?? 'local-human'
    if (actor !== 'local-human') {
      throw new FashionAnalysisInvalidTransitionError('opportunity-decision-must-be-human')
    }
    this.requireEditableProject(input.projectId)
    const existing = this.requireOpportunityInTask(input.opportunityId, input.projectId, input.taskId)
    if (existing.accessMode === 'read-only') {
      throw new FashionAnalysisProjectReadOnlyError(input.projectId)
    }
    if (existing.status === 'stale' || existing.status === 'invalidated') {
      throw new FashionAnalysisInvalidTransitionError('opportunity-stale')
    }
    if (existing.revision !== input.expectedRevision) {
      throw new FashionAnalysisRevisionConflictError(input.expectedRevision, existing.revision)
    }
    const note = input.note.trim()
    if (note.length < 1 || input.reasonCodes.length < 1) {
      throw new FashionAnalysisInvalidInputError('decision-fields-required')
    }
    const now = new Date().toISOString()
    const decisionId = mintId(
      brandOpportunityDecisionId,
      candidate => this.requireDecisions().get(candidate) !== undefined,
    )
    const decisionRecord: OpportunityDecisionRecordV0 = {
      projectId: String(input.projectId),
      taskId: String(input.taskId),
      opportunityId: String(input.opportunityId),
      opportunityRevision: existing.revision,
      action: input.action,
      reasonCodes: [...input.reasonCodes],
      note,
      actor: 'local-human',
      createdAt: now,
      schemaVersion: FASHION_ANALYSIS_SCHEMA_VERSION,
      publicRebuildRecorded: false,
    }
    const nextOpp: DesignOpportunityRecordV0 = {
      ...existing,
      reviewStatus: input.action,
      currentDecisionId: decisionId as string,
      revision: existing.revision + 1,
      updatedAt: now,
      updatedBy: actor,
    }
    await this.requireDecisions().put(decisionId, decisionRecord)
    await this.requireOpportunities().put(input.opportunityId, nextOpp)
    return {
      opportunity: toOpportunity(input.opportunityId, nextOpp),
      decision: toDecision(decisionId, decisionRecord),
    }
  }

  /** @param projectId - Owning project. @param taskId - Owning task. */
  listDecisions(projectId: ProjectId, taskId: ResearchTaskId): readonly OpportunityDecision[] {
    this.requireTaskInProject(taskId, projectId)
    const items: OpportunityDecision[] = []
    for (const [id, record] of this.requireDecisions().entries()) {
      if (record.projectId !== String(projectId) || record.taskId !== String(taskId)) continue
      items.push(toDecision(id, record))
    }
    items.sort((left, right) => right.createdAt.localeCompare(left.createdAt)
      || String(left.id).localeCompare(String(right.id)))
    return items
  }

  /**
   * Mark dependent analysis rows stale when linked F2-01 Evidence/Sample/Source is invalid.
   * Does not mutate F2-01 objects.
   * @param projectId - Owning project.
   * @param taskId - Owning task.
   */
  async reconcileStale(projectId: ProjectId, taskId: ResearchTaskId): Promise<number> {
    this.requireTaskInProject(taskId, projectId)
    let marked = 0
    const now = new Date().toISOString()

    const evidenceBad = (evidenceId: string): string | null => {
      const evidence = this.ctx.fashionResearchRegistry.getEvidence(brandEvidenceId(evidenceId))
      if (evidence === undefined) return 'evidence-missing'
      if (evidence.archivedAt !== null) return 'evidence-archived'
      if (evidence.reviewStatus === 'rejected' || evidence.reviewStatus === 'invalidated') {
        return `evidence-${evidence.reviewStatus}`
      }
      return null
    }

    for (const [id, record] of this.requireSignals().entries()) {
      if (record.projectId !== String(projectId) || record.taskId !== String(taskId)) continue
      if (record.status === 'stale' || record.status === 'invalidated' || record.status === 'archived') continue
      let reason: string | null = null
      for (const evidenceId of record.evidenceIds) {
        reason = evidenceBad(evidenceId)
        if (reason !== null) break
      }
      if (reason === null) continue
      await this.requireSignals().put(id, {
        ...record,
        status: 'stale',
        signalStatus: 'stale',
        staleReason: reason,
        revision: record.revision + 1,
        updatedAt: now,
        updatedBy: 'system-rule',
      })
      marked += 1
    }

    for (const [id, record] of this.requireClusters().entries()) {
      if (record.projectId !== String(projectId) || record.taskId !== String(taskId)) continue
      if (record.status === 'stale' || record.status === 'invalidated' || record.status === 'archived') continue
      const linkedSignals = record.signalIds
      let reason: string | null = null
      for (const signalId of linkedSignals) {
        const signal = this.requireSignals().get(signalId as PopularitySignalId)
        if (signal !== undefined && (signal.status === 'stale' || signal.signalStatus === 'stale' || signal.signalStatus === 'invalidated')) {
          reason = 'linked-signal-stale'
          break
        }
      }
      if (reason === null) continue
      await this.requireClusters().put(id, {
        ...record,
        status: 'stale',
        staleReason: reason,
        revision: record.revision + 1,
        updatedAt: now,
        updatedBy: 'system-rule',
      })
      marked += 1
    }

    for (const [id, record] of this.requireOpportunities().entries()) {
      if (record.projectId !== String(projectId) || record.taskId !== String(taskId)) continue
      if (record.status === 'stale' || record.status === 'invalidated' || record.status === 'archived') continue
      let reason: string | null = null
      for (const clusterId of record.trendClusterIds) {
        const cluster = this.requireClusters().get(clusterId as TrendClusterId)
        if (cluster !== undefined && cluster.status === 'stale') {
          reason = 'linked-cluster-stale'
          break
        }
      }
      if (reason === null) continue
      await this.requireOpportunities().put(id, {
        ...record,
        status: 'stale',
        staleReason: reason,
        revision: record.revision + 1,
        updatedAt: now,
        updatedBy: 'system-rule',
      })
      marked += 1
    }

    return marked
  }

  private async ensureR0Seed(): Promise<void> {
    const items = this.requireItems()
    const existingItems = R0_MARKET_ITEM_SEEDS.map(seed => items.get(seed.id) !== undefined)
    const any = existingItems.some(Boolean)
    const all = existingItems.every(Boolean)
    const ontology = this.requireOntologyVersions().get(R0_ONTOLOGY_VERSION_ID)

    if (!any && ontology === undefined) {
      await this.requireOntologyVersions().put(R0_ONTOLOGY_VERSION_ID, R0_ONTOLOGY_VERSION_RECORD)
      for (const seed of R0_ONTOLOGY_TERM_SEEDS) {
        await this.requireOntologyTerms().put(seed.id, seed.record)
      }
      for (const seed of R0_MARKET_ITEM_SEEDS) {
        await items.put(seed.id, seed.record)
      }
      for (const seed of R0_ASSERTION_SEEDS) {
        await this.requireAssertions().put(seed.id, seed.record)
      }
      for (const seed of R0_SIGNAL_SEEDS) {
        await this.requireSignals().put(seed.id, seed.record)
      }
      for (const seed of R0_ANALYSIS_RUN_SEEDS) {
        await this.requireRuns().put(seed.id, seed.record)
      }
      await this.requireClusters().put(R0_CLUSTER_SEED.id, R0_CLUSTER_SEED.record)
      await this.requireOpportunities().put(R0_OPPORTUNITY_SEED.id, R0_OPPORTUNITY_SEED.record)
      await this.requireDecisions().put(R0_DECISION_SEED.id, R0_DECISION_SEED.record)
      return
    }

    if (!all || ontology === undefined) {
      throw new FashionAnalysisSeedConflictError('partial-r0-analysis-seed')
    }
    if (!isValidR0AnalysisSeed(ontology, R0_PROJECT_ID)) {
      throw new FashionAnalysisSeedConflictError('invalid-r0-ontology')
    }
    for (const seed of R0_MARKET_ITEM_SEEDS) {
      const row = items.get(seed.id)
      if (row === undefined || !isValidR0AnalysisSeed(row, R0_PROJECT_ID)) {
        throw new FashionAnalysisSeedConflictError('invalid-r0-market-item')
      }
    }
    for (const seed of R0_SIGNAL_SEEDS) {
      const row = this.requireSignals().get(seed.id)
      if (row === undefined || !isValidR0AnalysisSeed(row, R0_PROJECT_ID)) {
        throw new FashionAnalysisSeedConflictError('invalid-r0-signal')
      }
    }
    const cluster = this.requireClusters().get(R0_CLUSTER_SEED.id)
    const opportunity = this.requireOpportunities().get(R0_OPPORTUNITY_SEED.id)
    const decision = this.requireDecisions().get(R0_DECISION_SEED.id)
    if (
      cluster === undefined
      || opportunity === undefined
      || decision === undefined
      || !isValidR0AnalysisSeed(cluster, R0_PROJECT_ID)
      || !isValidR0AnalysisSeed(opportunity, R0_PROJECT_ID)
    ) {
      throw new FashionAnalysisSeedConflictError('invalid-r0-cluster-or-opportunity')
    }
    if (decision.publicRebuildRecorded !== true || decision.actor !== 'local-human') {
      throw new FashionAnalysisSeedConflictError('invalid-r0-decision')
    }
  }

  private requireEligibleObservation(
    projectId: ProjectId,
    taskId: ResearchTaskId,
    link: ObservationLink,
  ): void {
    const sample = this.ctx.fashionResearchRegistry.getSample(link.sampleId)
    if (sample === undefined) throw new FashionAnalysisInvalidInputError('sample-missing')
    if (sample.projectId !== projectId) {
      throw new FashionAnalysisCrossProjectReferenceError(projectId, sample.projectId)
    }
    if (sample.taskId !== taskId) {
      throw new FashionAnalysisCrossTaskReferenceError(taskId, sample.taskId)
    }
    if (sample.archivedAt !== null || sample.status === 'archived') {
      throw new FashionAnalysisInvalidInputError('sample-archived')
    }
    const source = this.ctx.fashionResearchRegistry.getSource(link.sourceId)
    if (source === undefined) throw new FashionAnalysisInvalidInputError('source-missing')
    if (source.projectId !== projectId) {
      throw new FashionAnalysisCrossProjectReferenceError(projectId, source.projectId)
    }
    if (source.taskId !== taskId) {
      throw new FashionAnalysisCrossTaskReferenceError(taskId, source.taskId)
    }
    if (source.archivedAt !== null || source.availabilityStatus === 'removed') {
      throw new FashionAnalysisInvalidInputError('source-unavailable')
    }
    if (link.sampleId !== sample.id || link.sourceId !== sample.sourceId) {
      // sample.sourceId must match link.sourceId
    }
    if (String(sample.sourceId) !== String(link.sourceId)) {
      throw new FashionAnalysisInvalidInputError('sample-source-mismatch')
    }
    for (const evidenceId of link.evidenceIds) {
      this.requireEligibleEvidence(projectId, taskId, evidenceId)
    }
  }

  private requireEligibleEvidence(
    projectId: ProjectId,
    taskId: ResearchTaskId,
    evidenceId: EvidenceId,
  ): void {
    const evidence = this.ctx.fashionResearchRegistry.getEvidence(evidenceId)
    if (evidence === undefined) throw new FashionAnalysisEvidenceNotEligibleError(evidenceId)
    if (evidence.projectId !== projectId) {
      throw new FashionAnalysisCrossProjectReferenceError(projectId, evidence.projectId)
    }
    if (evidence.taskId !== taskId) {
      throw new FashionAnalysisCrossTaskReferenceError(taskId, evidence.taskId)
    }
    if (evidence.archivedAt !== null || evidence.reviewStatus !== 'confirmed') {
      throw new FashionAnalysisEvidenceNotEligibleError(evidenceId)
    }
  }

  private requireProject(projectId: ProjectId): void {
    if (this.ctx.fashionProjectRegistry.get(projectId) === undefined) {
      throw new FashionAnalysisProjectNotFoundError(projectId)
    }
  }

  private requireEditableProject(projectId: ProjectId): void {
    const project = this.ctx.fashionProjectRegistry.get(projectId)
    if (project === undefined) throw new FashionAnalysisProjectNotFoundError(projectId)
    if (project.accessMode === 'read-only') {
      throw new FashionAnalysisProjectReadOnlyError(projectId)
    }
  }

  private requireTaskInProject(taskId: ResearchTaskId, projectId: ProjectId): void {
    this.requireProject(projectId)
    const task = this.ctx.fashionResearchRegistry.getTask(taskId)
    if (task === undefined) throw new FashionAnalysisTaskNotFoundError(taskId)
    if (task.projectId !== projectId) {
      throw new FashionAnalysisCrossProjectReferenceError(projectId, task.projectId)
    }
    if (task.archivedAt !== null || task.status === 'archived') {
      throw new FashionAnalysisInvalidInputError('task-archived')
    }
  }

  private requireItemInTask(
    marketItemId: MarketItemId,
    projectId: ProjectId,
    taskId: ResearchTaskId,
  ): MarketItemRecordV0 {
    this.requireTaskInProject(taskId, projectId)
    const record = this.requireItems().get(marketItemId)
    if (record === undefined) throw new FashionAnalysisItemNotFoundError(marketItemId)
    if (record.projectId !== String(projectId)) {
      throw new FashionAnalysisCrossProjectReferenceError(projectId, record.projectId as ProjectId)
    }
    if (record.taskId !== String(taskId)) {
      throw new FashionAnalysisCrossTaskReferenceError(taskId, record.taskId as ResearchTaskId)
    }
    return record
  }

  private requireSignalInTask(
    signalId: PopularitySignalId,
    projectId: ProjectId,
    taskId: ResearchTaskId,
  ): PopularitySignalRecordV0 {
    this.requireTaskInProject(taskId, projectId)
    const record = this.requireSignals().get(signalId)
    if (record === undefined) throw new FashionAnalysisSignalNotFoundError(signalId)
    if (record.projectId !== String(projectId)) {
      throw new FashionAnalysisCrossProjectReferenceError(projectId, record.projectId as ProjectId)
    }
    if (record.taskId !== String(taskId)) {
      throw new FashionAnalysisCrossTaskReferenceError(taskId, record.taskId as ResearchTaskId)
    }
    return record
  }

  private requireClusterInTask(
    clusterId: TrendClusterId,
    projectId: ProjectId,
    taskId: ResearchTaskId,
  ): TrendClusterRecordV0 {
    this.requireTaskInProject(taskId, projectId)
    const record = this.requireClusters().get(clusterId)
    if (record === undefined) throw new FashionAnalysisClusterNotFoundError(clusterId)
    if (record.projectId !== String(projectId)) {
      throw new FashionAnalysisCrossProjectReferenceError(projectId, record.projectId as ProjectId)
    }
    if (record.taskId !== String(taskId)) {
      throw new FashionAnalysisCrossTaskReferenceError(taskId, record.taskId as ResearchTaskId)
    }
    return record
  }

  private requireOpportunityInTask(
    opportunityId: DesignOpportunityId,
    projectId: ProjectId,
    taskId: ResearchTaskId,
  ): DesignOpportunityRecordV0 {
    this.requireTaskInProject(taskId, projectId)
    const record = this.requireOpportunities().get(opportunityId)
    if (record === undefined) throw new FashionAnalysisOpportunityNotFoundError(opportunityId)
    if (record.projectId !== String(projectId)) {
      throw new FashionAnalysisCrossProjectReferenceError(projectId, record.projectId as ProjectId)
    }
    if (record.taskId !== String(taskId)) {
      throw new FashionAnalysisCrossTaskReferenceError(taskId, record.taskId as ResearchTaskId)
    }
    return record
  }

  private requireItems(): KvTable<MarketItemId, MarketItemRecordV0> {
    if (this.marketItems === undefined) throw new Error('fashion analysis domain not open')
    return this.marketItems
  }

  private requireOntologyVersions(): KvTable<OntologyVersionId, OntologyVersionRecordV0> {
    if (this.ontologyVersions === undefined) throw new Error('fashion analysis domain not open')
    return this.ontologyVersions
  }

  private requireOntologyTerms(): KvTable<OntologyTerm['id'], OntologyTermRecordV0> {
    if (this.ontologyTerms === undefined) throw new Error('fashion analysis domain not open')
    return this.ontologyTerms
  }

  private requireAssertions(): KvTable<AttributeAssertionId, AttributeAssertionRecordV0> {
    if (this.assertions === undefined) throw new Error('fashion analysis domain not open')
    return this.assertions
  }

  private requireSignals(): KvTable<PopularitySignalId, PopularitySignalRecordV0> {
    if (this.signals === undefined) throw new Error('fashion analysis domain not open')
    return this.signals
  }

  private requireRuns(): KvTable<AnalysisRun['id'], AnalysisRunRecordV0> {
    if (this.runs === undefined) throw new Error('fashion analysis domain not open')
    return this.runs
  }

  private requireClusters(): KvTable<TrendClusterId, TrendClusterRecordV0> {
    if (this.clusters === undefined) throw new Error('fashion analysis domain not open')
    return this.clusters
  }

  private requireOpportunities(): KvTable<DesignOpportunityId, DesignOpportunityRecordV0> {
    if (this.opportunities === undefined) throw new Error('fashion analysis domain not open')
    return this.opportunities
  }

  private requireDecisions(): KvTable<OpportunityDecisionId, OpportunityDecisionRecordV0> {
    if (this.decisions === undefined) throw new Error('fashion analysis domain not open')
    return this.decisions
  }
}

export { FashionAnalysisRegistry as default }
