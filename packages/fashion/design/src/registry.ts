/**
 * Fashion Design registry (`ctx.fashionDesignRegistry`) over `fashion_design@0`.
 * @module @gentlexx/dsh-fashion-design/src/registry
 */

import { randomUUID } from 'node:crypto'
import { Context, Service } from '@deepseek-ai/cordis'
import {
  DesignOpportunityId as brandOpportunityId,
  OpportunityDecisionId as brandDecisionId,
  R0_DECISION_ID,
  R0_OPPORTUNITY_ID,
} from '@gentlexx/dsh-fashion-analysis'
import type {
  DesignOpportunityId,
  OpportunityDecisionId,
} from '@gentlexx/dsh-fashion-analysis/types'
import { R0_PROJECT_ID } from '@gentlexx/dsh-fashion-project'
import type { ProjectId } from '@gentlexx/dsh-fashion-project/types'
import type { ResearchTaskId } from '@gentlexx/dsh-fashion-research/types'
import { ResearchTaskId as brandTaskId } from '@gentlexx/dsh-fashion-research'
import type { KvTable } from '@deepseek-ai/dsh-storage-domain'
import {
  DIFFERENTIATION_RULE_VERSION,
  evaluateDifferentiation,
} from './differentiation.ts'
import {
  FashionDesignBriefNotConfirmedError,
  FashionDesignBriefNotFoundError,
  FashionDesignConceptCountInvalidError,
  FashionDesignConceptNotFoundError,
  FashionDesignConceptSetNotFoundError,
  FashionDesignCrossProjectReferenceError,
  FashionDesignDifferentiationFailedError,
  FashionDesignHumanRequiredError,
  FashionDesignIdCollisionError,
  FashionDesignInvalidInputError,
  FashionDesignInvalidTransitionError,
  FashionDesignProjectNotFoundError,
  FashionDesignProjectReadOnlyError,
  FashionDesignRevisionConflictError,
  FashionDesignSeedConflictError,
  FashionDesignUpstreamNotSelectedError,
  FashionDesignUpstreamStaleError,
  FashionDesignVisualDraftNotFoundError,
} from './errors.ts'
import {
  ConceptSetId as brandConceptSetId,
  DesignBriefId as brandBriefId,
  DesignConceptId as brandConceptId,
  VisualDraftId as brandVisualId,
} from './ids.ts'
import { compareDesignUpdatedDesc } from './order.ts'
import type {
  ConceptSetRecordV0,
  DesignArtifactRecordV0,
  DesignBriefRecordV0,
  DesignConceptRecordV0,
  VisualDraftRecordV0,
} from './schema/v0/records.ts'
import {
  isValidR0DesignSeed,
  R0_ARTIFACT_SEEDS,
  R0_BRIEF_SEED,
  R0_CONCEPT_SEEDS,
  R0_CONCEPT_SET_SEED,
  R0_VISUAL_SEEDS,
} from './seed/r0-design.ts'
import { fashionDesignDomainSpec } from './spec.ts'
import type {
  ActorRef,
  BriefStatus,
  ConceptSet,
  ConceptSetId,
  ConstraintEntry,
  DesignBriefId,
  DesignConcept,
  DesignConceptId,
  DesignOpportunityBrief,
  DifferentiationCheck,
  PriceTarget,
  ReadinessCheck,
  VisualDraft,
  VisualDraftId,
  VisualGenerationMode,
} from './types.ts'
import { FASHION_DESIGN_SCHEMA_VERSION } from './types.ts'

function mintId<T extends string>(
  brand: (id: string) => T,
  occupied: (id: T) => boolean,
): T {
  let id = brand(randomUUID())
  if (!occupied(id)) return id
  id = brand(randomUUID())
  if (occupied(id)) throw new FashionDesignIdCollisionError(String(id))
  return id
}

function toBrief(id: DesignBriefId, record: DesignBriefRecordV0): DesignOpportunityBrief {
  return {
    id,
    projectId: record.projectId as ProjectId,
    opportunityId: brandOpportunityId(record.opportunityId),
    opportunityRevision: record.opportunityRevision,
    selectionDecisionId: brandDecisionId(record.selectionDecisionId),
    taskId: brandTaskId(record.taskId),
    market: record.market,
    season: record.season,
    category: record.category,
    targetUser: record.targetUser,
    brandContext: record.brandContext,
    priceTarget: record.priceTarget,
    mustKeep: record.mustKeep,
    mustAvoid: record.mustAvoid,
    materialsConstraints: record.materialsConstraints,
    costConstraints: record.costConstraints,
    productionConstraints: record.productionConstraints,
    differentiationGoals: record.differentiationGoals,
    openQuestions: record.openQuestions,
    constraintSources: record.constraintSources,
    confirmation: record.confirmation,
    status: record.status,
    origin: record.origin,
    accessMode: record.accessMode,
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

function toConceptSet(id: ConceptSetId, record: ConceptSetRecordV0): ConceptSet {
  return {
    id,
    projectId: record.projectId as ProjectId,
    briefId: brandBriefId(record.briefId),
    briefRevision: record.briefRevision,
    conceptRefs: record.conceptRefs.map(ref => ({
      conceptId: brandConceptId(ref.conceptId),
      conceptRevision: ref.conceptRevision,
    })),
    differentiationRuleVersion: record.differentiationRuleVersion,
    differentiationCheck: record.differentiationCheck === null
      ? null
      : {
        ...record.differentiationCheck,
        pairwise: record.differentiationCheck.pairwise.map(row => ({
          ...row,
          conceptAId: brandConceptId(row.conceptAId),
          conceptBId: brandConceptId(row.conceptBId),
        })),
      },
    readinessCheck: record.readinessCheck,
    status: record.status,
    isCurrent: record.isCurrent,
    origin: record.origin,
    accessMode: record.accessMode,
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

function toConcept(id: DesignConceptId, record: DesignConceptRecordV0): DesignConcept {
  return {
    id,
    projectId: record.projectId as ProjectId,
    conceptSetId: brandConceptSetId(record.conceptSetId),
    briefId: brandBriefId(record.briefId),
    briefRevision: record.briefRevision,
    conceptName: record.conceptName,
    designIntent: record.designIntent,
    silhouette: record.silhouette,
    proportionAndLength: record.proportionAndLength,
    materialDirection: record.materialDirection,
    colorDirection: record.colorDirection,
    constructionAndDetails: record.constructionAndDetails,
    functionalValue: record.functionalValue,
    targetUseScenarios: record.targetUseScenarios,
    marketEvidenceLinks: record.marketEvidenceLinks,
    originalTransformationNotes: record.originalTransformationNotes,
    competitorSimilarityRisks: record.competitorSimilarityRisks,
    productionUnknowns: record.productionUnknowns,
    constraintCoverage: record.constraintCoverage,
    status: record.status,
    origin: record.origin,
    accessMode: record.accessMode,
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

function toVisual(id: VisualDraftId, record: VisualDraftRecordV0): VisualDraft {
  return {
    id,
    projectId: record.projectId as ProjectId,
    conceptId: brandConceptId(record.conceptId),
    conceptRevision: record.conceptRevision,
    generationMode: record.generationMode,
    providerRef: record.providerRef,
    modelRef: record.modelRef,
    providerJobRef: record.providerJobRef,
    inputSnapshotRef: record.inputSnapshotRef,
    inputSnapshotHash: record.inputSnapshotHash,
    promptOrContextRef: record.promptOrContextRef,
    referenceAssetRefs: record.referenceAssetRefs,
    artifactRef: record.artifactRef,
    artifactHash: record.artifactHash,
    mediaType: record.mediaType,
    width: record.width,
    height: record.height,
    requestedAt: record.requestedAt,
    generatedAt: record.generatedAt,
    failedAt: record.failedAt,
    status: record.status,
    failureCode: record.failureCode,
    failureMessage: record.failureMessage,
    attributeConsistencyChecks: record.attributeConsistencyChecks,
    humanReviewStatus: record.humanReviewStatus,
    usageBoundary: record.usageBoundary,
    aiDisclosure: record.aiDisclosure,
    contentCredential: record.contentCredential,
    origin: record.origin,
    accessMode: record.accessMode,
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

function cloneConstraints(rows: readonly ConstraintEntry[]): DesignBriefRecordV0['mustKeep'] {
  return rows.map(row => ({
    id: row.id,
    text: row.text,
    kind: row.kind,
    claimType: row.claimType,
    sourceRefs: [...row.sourceRefs],
    note: row.note,
  }))
}

/**
 * Host Fashion Design registry over Storage Domain `fashion_design@0`.
 * Reads selected Opportunities only through `fashionAnalysisRegistry`.
 */
export class FashionDesignRegistryBase extends Service {
  static inject = [
    'storageDomain',
    'fashionProjectRegistry',
    'fashionResearchRegistry',
    'fashionAnalysisRegistry',
  ]

  protected briefs?: KvTable<DesignBriefId, DesignBriefRecordV0>
  protected conceptSets?: KvTable<ConceptSetId, ConceptSetRecordV0>
  protected concepts?: KvTable<DesignConceptId, DesignConceptRecordV0>
  protected visuals?: KvTable<VisualDraftId, VisualDraftRecordV0>
  protected artifacts?: KvTable<ReturnType<typeof import('./ids.ts').DesignArtifactId>, DesignArtifactRecordV0>
  protected reviewRounds?: KvTable<import('./types.ts').ReviewRoundId, import('./schema/v0/review.ts').ReviewRoundRecordV0>
  protected reviewDecisions?: KvTable<import('./types.ts').ReviewDecisionId, import('./schema/v0/review.ts').ReviewDecisionRecordV0>
  protected approvalInvalidations?: KvTable<import('./types.ts').ApprovalInvalidationId, import('./schema/v0/review.ts').ApprovalInvalidationRecordV0>
  protected deliverableSnapshots?: KvTable<import('./types.ts').DeliverableSnapshotId, import('./schema/v0/review.ts').DeliverableSnapshotRecordV0>
  protected sourceManifests?: KvTable<import('./types.ts').SourceManifestId, import('./schema/v0/review.ts').SourceManifestRecordV0>
  protected designDeliverables?: KvTable<import('./types.ts').DesignDeliverableId, import('./schema/v0/review.ts').DesignDeliverableRecordV0>
  protected exportArtifacts?: KvTable<import('./types.ts').ExportArtifactId, import('./schema/v0/review.ts').ExportArtifactRecordV0>

  /** @param ctx - Host context. */
  constructor(ctx: Context) {
    super(ctx, 'fashionDesignRegistry')
  }

  /** Open the domain, ensure R0 design seed, and register the close disposer. */
  protected async [Service.init](): Promise<void> {
    const domain = await this.ctx.storageDomain.open(fashionDesignDomainSpec)
    this.ctx.effect(() => () => domain.close(), 'fashionDesign.domainClose')
    this.briefs = domain.table('design_briefs')
    this.conceptSets = domain.table('concept_sets')
    this.concepts = domain.table('design_concepts')
    this.visuals = domain.table('visual_drafts')
    this.artifacts = domain.table('design_artifacts')
    this.reviewRounds = domain.table('review_rounds')
    this.reviewDecisions = domain.table('review_decisions')
    this.approvalInvalidations = domain.table('approval_invalidations')
    this.deliverableSnapshots = domain.table('deliverable_snapshots')
    this.sourceManifests = domain.table('source_manifests')
    this.designDeliverables = domain.table('design_deliverables')
    this.exportArtifacts = domain.table('export_artifacts')
    await this.ensureR0Seed()
    await this.ensureR0ReviewSeed()
  }

  /** F3-02 R0 recorded review/deliverable seed — overridden in registry-f302. */
  protected async ensureR0ReviewSeed(): Promise<void> {
    // F3-01 base opens tables; F3-02 subclass fills recorded review seed.
  }

  /**
   * List Briefs for a Project.
   * @param projectId - Owning project.
   */
  listBriefs(projectId: ProjectId): readonly DesignOpportunityBrief[] {
    this.requireProject(projectId)
    const rows: DesignOpportunityBrief[] = []
    for (const [id, record] of this.requireBriefs().entries()) {
      if (record.projectId !== String(projectId)) continue
      rows.push(toBrief(id, record))
    }
    rows.sort(compareDesignUpdatedDesc)
    return rows
  }

  /**
   * Read one Brief with project check.
   * @param projectId - Expected project.
   * @param briefId - Brief identity.
   */
  getBrief(projectId: ProjectId, briefId: DesignBriefId): DesignOpportunityBrief {
    return toBrief(briefId, this.requireBriefInProject(briefId, projectId))
  }

  /**
   * Create a draft Brief from a human-selected Opportunity exact revision.
   * @param input - Parent Opportunity binding and Brief fields.
   */
  async createBriefFromOpportunity(input: {
    projectId: ProjectId
    opportunityId: DesignOpportunityId
    expectedOpportunityRevision: number
    selectionDecisionId: OpportunityDecisionId
    market: string
    season: string
    category: string
    targetUser: string
    brandContext?: string | null
    priceTarget?: PriceTarget | null
    mustKeep?: readonly ConstraintEntry[]
    mustAvoid?: readonly ConstraintEntry[]
    materialsConstraints?: readonly ConstraintEntry[]
    costConstraints?: readonly ConstraintEntry[]
    productionConstraints?: readonly ConstraintEntry[]
    differentiationGoals?: readonly ConstraintEntry[]
    openQuestions?: readonly ConstraintEntry[]
    constraintSources?: readonly string[]
    actor?: ActorRef
  }): Promise<DesignOpportunityBrief> {
    const actor = input.actor ?? 'local-human'
    this.requireEditableProject(input.projectId)
    const opportunity = this.requireSelectedOpportunity(
      input.projectId,
      input.opportunityId,
      input.expectedOpportunityRevision,
      input.selectionDecisionId,
    )
    const now = new Date().toISOString()
    const table = this.requireBriefs()
    const id = mintId(brandBriefId, candidate => table.get(candidate) !== undefined)
    const record: DesignBriefRecordV0 = {
      projectId: String(input.projectId),
      opportunityId: String(input.opportunityId),
      opportunityRevision: input.expectedOpportunityRevision,
      selectionDecisionId: String(input.selectionDecisionId),
      taskId: String(opportunity.taskId),
      market: input.market.trim(),
      season: input.season.trim(),
      category: input.category.trim(),
      targetUser: input.targetUser.trim(),
      brandContext: input.brandContext?.trim() || null,
      priceTarget: input.priceTarget ?? null,
      mustKeep: cloneConstraints(input.mustKeep ?? []),
      mustAvoid: cloneConstraints(input.mustAvoid ?? []),
      materialsConstraints: cloneConstraints(input.materialsConstraints ?? []),
      costConstraints: cloneConstraints(input.costConstraints ?? []),
      productionConstraints: cloneConstraints(input.productionConstraints ?? []),
      differentiationGoals: cloneConstraints(input.differentiationGoals ?? []),
      openQuestions: cloneConstraints(input.openQuestions ?? []),
      constraintSources: [...(input.constraintSources ?? [])],
      confirmation: null,
      status: 'draft',
      origin: 'user',
      accessMode: 'editable',
      revision: 0,
      createdAt: now,
      updatedAt: now,
      createdBy: actor,
      updatedBy: actor,
      schemaVersion: FASHION_DESIGN_SCHEMA_VERSION,
      archivedAt: null,
      staleReason: null,
    }
    this.assertBriefDraftFields(record)
    await table.put(id, record)
    return toBrief(id, record)
  }

  /**
   * Human confirmation of a draft Brief.
   * @param input - Brief identity, expectedRevision, and human actor.
   */
  async confirmBrief(input: {
    projectId: ProjectId
    briefId: DesignBriefId
    expectedRevision: number
    actor?: ActorRef
  }): Promise<DesignOpportunityBrief> {
    const actor = input.actor ?? 'local-human'
    if (actor !== 'local-human') {
      throw new FashionDesignHumanRequiredError('confirm-brief-must-be-human')
    }
    this.requireEditableProject(input.projectId)
    const table = this.requireBriefs()
    const existing = this.requireBriefInProject(input.briefId, input.projectId)
    if (existing.accessMode === 'read-only') {
      throw new FashionDesignProjectReadOnlyError(input.projectId)
    }
    if (existing.revision !== input.expectedRevision) {
      throw new FashionDesignRevisionConflictError(input.expectedRevision, existing.revision)
    }
    if (existing.status !== 'draft') {
      throw new FashionDesignInvalidTransitionError('brief-not-draft')
    }
    this.assertBriefConfirmable(existing)
    this.requireSelectedOpportunity(
      input.projectId,
      brandOpportunityId(existing.opportunityId),
      existing.opportunityRevision,
      brandDecisionId(existing.selectionDecisionId),
    )
    const now = new Date().toISOString()
    const next: DesignBriefRecordV0 = {
      ...existing,
      status: 'confirmed',
      confirmation: {
        actorId: 'local-human',
        actorKind: 'human',
        confirmedAt: now,
      },
      revision: existing.revision + 1,
      updatedAt: now,
      updatedBy: actor,
    }
    await table.put(input.briefId, next)
    return toBrief(input.briefId, next)
  }

  /**
   * Revise Brief fields. Confirmed Briefs mint a new revision and stale current ConceptSets.
   * @param input - Patch fields and expectedRevision.
   */
  async reviseBrief(input: {
    projectId: ProjectId
    briefId: DesignBriefId
    expectedRevision: number
    market?: string
    season?: string
    category?: string
    targetUser?: string
    brandContext?: string | null
    priceTarget?: PriceTarget | null
    mustKeep?: readonly ConstraintEntry[]
    mustAvoid?: readonly ConstraintEntry[]
    materialsConstraints?: readonly ConstraintEntry[]
    costConstraints?: readonly ConstraintEntry[]
    productionConstraints?: readonly ConstraintEntry[]
    differentiationGoals?: readonly ConstraintEntry[]
    openQuestions?: readonly ConstraintEntry[]
    actor?: ActorRef
  }): Promise<DesignOpportunityBrief> {
    const actor = input.actor ?? 'local-human'
    this.requireEditableProject(input.projectId)
    const table = this.requireBriefs()
    const existing = this.requireBriefInProject(input.briefId, input.projectId)
    if (existing.accessMode === 'read-only') {
      throw new FashionDesignProjectReadOnlyError(input.projectId)
    }
    if (existing.revision !== input.expectedRevision) {
      throw new FashionDesignRevisionConflictError(input.expectedRevision, existing.revision)
    }
    if (existing.status === 'archived' || existing.status === 'stale') {
      throw new FashionDesignInvalidTransitionError('brief-not-editable')
    }
    const now = new Date().toISOString()
    const wasConfirmed = existing.status === 'confirmed'
    const next: DesignBriefRecordV0 = {
      ...existing,
      market: input.market?.trim() ?? existing.market,
      season: input.season?.trim() ?? existing.season,
      category: input.category?.trim() ?? existing.category,
      targetUser: input.targetUser?.trim() ?? existing.targetUser,
      brandContext: input.brandContext === undefined ? existing.brandContext : (input.brandContext?.trim() || null),
      priceTarget: input.priceTarget === undefined ? existing.priceTarget : input.priceTarget,
      mustKeep: input.mustKeep === undefined ? existing.mustKeep : cloneConstraints(input.mustKeep),
      mustAvoid: input.mustAvoid === undefined ? existing.mustAvoid : cloneConstraints(input.mustAvoid),
      materialsConstraints: input.materialsConstraints === undefined
        ? existing.materialsConstraints
        : cloneConstraints(input.materialsConstraints),
      costConstraints: input.costConstraints === undefined
        ? existing.costConstraints
        : cloneConstraints(input.costConstraints),
      productionConstraints: input.productionConstraints === undefined
        ? existing.productionConstraints
        : cloneConstraints(input.productionConstraints),
      differentiationGoals: input.differentiationGoals === undefined
        ? existing.differentiationGoals
        : cloneConstraints(input.differentiationGoals),
      openQuestions: input.openQuestions === undefined
        ? existing.openQuestions
        : cloneConstraints(input.openQuestions),
      status: wasConfirmed ? 'confirmed' : 'draft',
      confirmation: wasConfirmed ? existing.confirmation : null,
      revision: existing.revision + 1,
      updatedAt: now,
      updatedBy: actor,
    }
    this.assertBriefDraftFields(next)
    await table.put(input.briefId, next)
    if (wasConfirmed) {
      await this.staleConceptSetsForBrief(input.projectId, input.briefId, existing.revision, now, actor)
    }
    return toBrief(input.briefId, next)
  }

  /**
   * Soft-archive a Brief.
   * @param input - Brief identity and expectedRevision.
   */
  async archiveBrief(input: {
    projectId: ProjectId
    briefId: DesignBriefId
    expectedRevision: number
    actor?: ActorRef
  }): Promise<DesignOpportunityBrief> {
    const actor = input.actor ?? 'local-human'
    this.requireEditableProject(input.projectId)
    const table = this.requireBriefs()
    const existing = this.requireBriefInProject(input.briefId, input.projectId)
    if (existing.accessMode === 'read-only') {
      throw new FashionDesignProjectReadOnlyError(input.projectId)
    }
    if (existing.revision !== input.expectedRevision) {
      throw new FashionDesignRevisionConflictError(input.expectedRevision, existing.revision)
    }
    const now = new Date().toISOString()
    const next: DesignBriefRecordV0 = {
      ...existing,
      status: 'archived',
      archivedAt: now,
      revision: existing.revision + 1,
      updatedAt: now,
      updatedBy: actor,
    }
    await table.put(input.briefId, next)
    return toBrief(input.briefId, next)
  }

  /**
   * List ConceptSets for a Project.
   * @param projectId - Owning project.
   */
  listConceptSets(projectId: ProjectId): readonly ConceptSet[] {
    this.requireProject(projectId)
    const rows: ConceptSet[] = []
    for (const [id, record] of this.requireConceptSets().entries()) {
      if (record.projectId !== String(projectId)) continue
      rows.push(toConceptSet(id, record))
    }
    rows.sort(compareDesignUpdatedDesc)
    return rows
  }

  /**
   * Read one ConceptSet.
   * @param projectId - Expected project.
   * @param conceptSetId - Set identity.
   */
  getConceptSet(projectId: ProjectId, conceptSetId: ConceptSetId): ConceptSet {
    return toConceptSet(conceptSetId, this.requireConceptSetInProject(conceptSetId, projectId))
  }

  /**
   * Create a draft ConceptSet on a confirmed Brief revision.
   * @param input - Brief binding.
   */
  async createConceptSet(input: {
    projectId: ProjectId
    briefId: DesignBriefId
    expectedBriefRevision: number
    actor?: ActorRef
  }): Promise<ConceptSet> {
    const actor = input.actor ?? 'local-human'
    this.requireEditableProject(input.projectId)
    const brief = this.requireBriefInProject(input.briefId, input.projectId)
    if (brief.accessMode === 'read-only') {
      throw new FashionDesignProjectReadOnlyError(input.projectId)
    }
    if (brief.revision !== input.expectedBriefRevision) {
      throw new FashionDesignRevisionConflictError(input.expectedBriefRevision, brief.revision)
    }
    if (brief.status !== 'confirmed') {
      throw new FashionDesignBriefNotConfirmedError(input.briefId)
    }
    const now = new Date().toISOString()
    for (const [id, record] of this.requireConceptSets().entries()) {
      if (record.projectId !== String(input.projectId)) continue
      if (!record.isCurrent) continue
      if (record.status === 'archived') continue
      const demoted: ConceptSetRecordV0 = {
        ...record,
        isCurrent: false,
        status: record.status === 'review_ready' ? 'stale' : record.status,
        staleReason: record.status === 'review_ready' ? 'superseded-by-new-concept-set' : record.staleReason,
        updatedAt: now,
        updatedBy: actor,
        revision: record.revision + 1,
      }
      await this.requireConceptSets().put(id, demoted)
    }
    const table = this.requireConceptSets()
    const id = mintId(brandConceptSetId, candidate => table.get(candidate) !== undefined)
    const record: ConceptSetRecordV0 = {
      projectId: String(input.projectId),
      briefId: String(input.briefId),
      briefRevision: brief.revision,
      conceptRefs: [],
      differentiationRuleVersion: DIFFERENTIATION_RULE_VERSION,
      differentiationCheck: null,
      readinessCheck: null,
      status: 'draft',
      isCurrent: true,
      origin: 'user',
      accessMode: 'editable',
      revision: 0,
      createdAt: now,
      updatedAt: now,
      createdBy: actor,
      updatedBy: actor,
      schemaVersion: FASHION_DESIGN_SCHEMA_VERSION,
      archivedAt: null,
      staleReason: null,
    }
    await table.put(id, record)
    return toConceptSet(id, record)
  }

  /**
   * List Concepts for a ConceptSet.
   * @param projectId - Owning project.
   * @param conceptSetId - Parent set.
   */
  listConcepts(projectId: ProjectId, conceptSetId: ConceptSetId): readonly DesignConcept[] {
    this.requireConceptSetInProject(conceptSetId, projectId)
    const rows: DesignConcept[] = []
    for (const [id, record] of this.requireConcepts().entries()) {
      if (record.projectId !== String(projectId)) continue
      if (record.conceptSetId !== String(conceptSetId)) continue
      rows.push(toConcept(id, record))
    }
    rows.sort(compareDesignUpdatedDesc)
    return rows
  }

  /**
   * Read one Concept.
   * @param projectId - Expected project.
   * @param conceptId - Concept identity.
   */
  getConcept(projectId: ProjectId, conceptId: DesignConceptId): DesignConcept {
    return toConcept(conceptId, this.requireConceptInProject(conceptId, projectId))
  }

  /**
   * Create a Concept in a draft ConceptSet (max 3 members).
   * @param input - Concept fields.
   */
  async createConcept(input: {
    projectId: ProjectId
    conceptSetId: ConceptSetId
    expectedConceptSetRevision: number
    conceptName: string
    designIntent: string
    silhouette: string
    proportionAndLength: string
    materialDirection: string
    colorDirection: string
    constructionAndDetails: readonly string[]
    functionalValue: readonly string[]
    targetUseScenarios: readonly string[]
    marketEvidenceLinks?: DesignConcept['marketEvidenceLinks']
    originalTransformationNotes?: readonly string[]
    competitorSimilarityRisks?: DesignConcept['competitorSimilarityRisks']
    productionUnknowns?: readonly string[]
    constraintCoverage?: DesignConcept['constraintCoverage']
    actor?: ActorRef
  }): Promise<DesignConcept> {
    const actor = input.actor ?? 'local-human'
    this.requireEditableProject(input.projectId)
    const setTable = this.requireConceptSets()
    const set = this.requireConceptSetInProject(input.conceptSetId, input.projectId)
    if (set.accessMode === 'read-only') {
      throw new FashionDesignProjectReadOnlyError(input.projectId)
    }
    if (set.revision !== input.expectedConceptSetRevision) {
      throw new FashionDesignRevisionConflictError(input.expectedConceptSetRevision, set.revision)
    }
    if (set.status !== 'draft') {
      throw new FashionDesignInvalidTransitionError('concept-set-not-draft')
    }
    if (set.conceptRefs.length >= 3) {
      throw new FashionDesignConceptCountInvalidError(set.conceptRefs.length)
    }
    const brief = this.requireBriefInProject(brandBriefId(set.briefId), input.projectId)
    if (brief.status !== 'confirmed' || brief.revision !== set.briefRevision) {
      throw new FashionDesignInvalidTransitionError('brief-revision-mismatch')
    }
    const now = new Date().toISOString()
    const conceptTable = this.requireConcepts()
    const id = mintId(brandConceptId, candidate => conceptTable.get(candidate) !== undefined)
    const record: DesignConceptRecordV0 = {
      projectId: String(input.projectId),
      conceptSetId: String(input.conceptSetId),
      briefId: set.briefId,
      briefRevision: set.briefRevision,
      conceptName: input.conceptName.trim(),
      designIntent: input.designIntent.trim(),
      silhouette: input.silhouette.trim(),
      proportionAndLength: input.proportionAndLength.trim(),
      materialDirection: input.materialDirection.trim(),
      colorDirection: input.colorDirection.trim(),
      constructionAndDetails: [...input.constructionAndDetails],
      functionalValue: [...input.functionalValue],
      targetUseScenarios: [...input.targetUseScenarios],
      marketEvidenceLinks: [...(input.marketEvidenceLinks ?? [])],
      originalTransformationNotes: [...(input.originalTransformationNotes ?? [])],
      competitorSimilarityRisks: [...(input.competitorSimilarityRisks ?? [])],
      productionUnknowns: [...(input.productionUnknowns ?? [])],
      constraintCoverage: [...(input.constraintCoverage ?? [])],
      status: 'draft',
      origin: 'user',
      accessMode: 'editable',
      revision: 0,
      createdAt: now,
      updatedAt: now,
      createdBy: actor,
      updatedBy: actor,
      schemaVersion: FASHION_DESIGN_SCHEMA_VERSION,
      archivedAt: null,
      staleReason: null,
    }
    this.assertConceptFields(record)
    await conceptTable.put(id, record)
    const nextSet: ConceptSetRecordV0 = {
      ...set,
      conceptRefs: [...set.conceptRefs, { conceptId: String(id), conceptRevision: 0 }],
      differentiationCheck: null,
      readinessCheck: null,
      revision: set.revision + 1,
      updatedAt: now,
      updatedBy: actor,
    }
    await setTable.put(input.conceptSetId, nextSet)
    return toConcept(id, record)
  }

  /**
   * Revise Concept fields; bumps ConceptSet membership revision and stales VisualDrafts.
   * @param input - Patch fields.
   */
  async reviseConcept(input: {
    projectId: ProjectId
    conceptId: DesignConceptId
    expectedRevision: number
    conceptName?: string
    designIntent?: string
    silhouette?: string
    proportionAndLength?: string
    materialDirection?: string
    colorDirection?: string
    constructionAndDetails?: readonly string[]
    functionalValue?: readonly string[]
    targetUseScenarios?: readonly string[]
    marketEvidenceLinks?: DesignConcept['marketEvidenceLinks']
    originalTransformationNotes?: readonly string[]
    competitorSimilarityRisks?: DesignConcept['competitorSimilarityRisks']
    productionUnknowns?: readonly string[]
    constraintCoverage?: DesignConcept['constraintCoverage']
    actor?: ActorRef
  }): Promise<DesignConcept> {
    const actor = input.actor ?? 'local-human'
    this.requireEditableProject(input.projectId)
    const table = this.requireConcepts()
    const existing = this.requireConceptInProject(input.conceptId, input.projectId)
    if (existing.accessMode === 'read-only') {
      throw new FashionDesignProjectReadOnlyError(input.projectId)
    }
    if (existing.revision !== input.expectedRevision) {
      throw new FashionDesignRevisionConflictError(input.expectedRevision, existing.revision)
    }
    if (existing.status === 'archived' || existing.status === 'stale') {
      throw new FashionDesignInvalidTransitionError('concept-not-editable')
    }
    const now = new Date().toISOString()
    const next: DesignConceptRecordV0 = {
      ...existing,
      conceptName: input.conceptName?.trim() ?? existing.conceptName,
      designIntent: input.designIntent?.trim() ?? existing.designIntent,
      silhouette: input.silhouette?.trim() ?? existing.silhouette,
      proportionAndLength: input.proportionAndLength?.trim() ?? existing.proportionAndLength,
      materialDirection: input.materialDirection?.trim() ?? existing.materialDirection,
      colorDirection: input.colorDirection?.trim() ?? existing.colorDirection,
      constructionAndDetails: input.constructionAndDetails === undefined
        ? existing.constructionAndDetails
        : [...input.constructionAndDetails],
      functionalValue: input.functionalValue === undefined
        ? existing.functionalValue
        : [...input.functionalValue],
      targetUseScenarios: input.targetUseScenarios === undefined
        ? existing.targetUseScenarios
        : [...input.targetUseScenarios],
      marketEvidenceLinks: input.marketEvidenceLinks === undefined
        ? existing.marketEvidenceLinks
        : [...input.marketEvidenceLinks],
      originalTransformationNotes: input.originalTransformationNotes === undefined
        ? existing.originalTransformationNotes
        : [...input.originalTransformationNotes],
      competitorSimilarityRisks: input.competitorSimilarityRisks === undefined
        ? existing.competitorSimilarityRisks
        : [...input.competitorSimilarityRisks],
      productionUnknowns: input.productionUnknowns === undefined
        ? existing.productionUnknowns
        : [...input.productionUnknowns],
      constraintCoverage: input.constraintCoverage === undefined
        ? existing.constraintCoverage
        : [...input.constraintCoverage],
      status: 'draft',
      revision: existing.revision + 1,
      updatedAt: now,
      updatedBy: actor,
    }
    this.assertConceptFields(next)
    await table.put(input.conceptId, next)
    const setId = brandConceptSetId(existing.conceptSetId)
    const set = this.requireConceptSetInProject(setId, input.projectId)
    const nextSet: ConceptSetRecordV0 = {
      ...set,
      conceptRefs: set.conceptRefs.map(ref =>
        ref.conceptId === String(input.conceptId)
          ? { conceptId: ref.conceptId, conceptRevision: next.revision }
          : ref,
      ),
      status: set.status === 'review_ready' ? 'draft' : set.status,
      differentiationCheck: null,
      readinessCheck: null,
      revision: set.revision + 1,
      updatedAt: now,
      updatedBy: actor,
    }
    await this.requireConceptSets().put(setId, nextSet)
    await this.staleVisualsForConcept(input.projectId, input.conceptId, existing.revision, now, actor)
    return toConcept(input.conceptId, next)
  }

  /**
   * Evaluate pairwise differentiation for a ConceptSet (server-computed).
   * @param projectId - Owning project.
   * @param conceptSetId - Set identity.
   */
  evaluateDifferentiation(projectId: ProjectId, conceptSetId: ConceptSetId): DifferentiationCheck {
    const set = this.requireConceptSetInProject(conceptSetId, projectId)
    const concepts = set.conceptRefs.map(ref =>
      toConcept(brandConceptId(ref.conceptId), this.requireConceptInProject(brandConceptId(ref.conceptId), projectId)),
    )
    return evaluateDifferentiation(concepts, new Date().toISOString())
  }

  /**
   * Evaluate readiness for marking review_ready.
   * @param projectId - Owning project.
   * @param conceptSetId - Set identity.
   */
  evaluateReadiness(projectId: ProjectId, conceptSetId: ConceptSetId): ReadinessCheck {
    const now = new Date().toISOString()
    const failureReasons: string[] = []
    const set = this.requireConceptSetInProject(conceptSetId, projectId)
    if (set.conceptRefs.length !== 3) {
      failureReasons.push(`concept-count-${set.conceptRefs.length}`)
    }
    const brief = this.requireBriefInProject(brandBriefId(set.briefId), projectId)
    if (brief.status !== 'confirmed') failureReasons.push('brief-not-confirmed')
    if (brief.revision !== set.briefRevision) failureReasons.push('brief-revision-mismatch')
    const concepts = set.conceptRefs.map((ref) => {
      const concept = this.requireConceptInProject(brandConceptId(ref.conceptId), projectId)
      if (concept.briefId !== set.briefId || concept.briefRevision !== set.briefRevision) {
        failureReasons.push(`concept-${ref.conceptId}-brief-mismatch`)
      }
      if (concept.originalTransformationNotes.length < 1) {
        failureReasons.push(`concept-${ref.conceptId}-missing-transformation`)
      }
      if (concept.productionUnknowns.length < 1) {
        failureReasons.push(`concept-${ref.conceptId}-missing-production-unknown`)
      }
      return toConcept(brandConceptId(ref.conceptId), concept)
    })
    const diff = evaluateDifferentiation(concepts, now)
    if (!diff.passed) {
      failureReasons.push(...diff.failureReasons.map(reason => `diff:${reason}`))
    }
    return { passed: failureReasons.length === 0, failureReasons, evaluatedAt: now }
  }

  /**
   * Mark ConceptSet review_ready when readiness passes.
   * @param input - Set identity and expectedRevision.
   */
  async markConceptSetReviewReady(input: {
    projectId: ProjectId
    conceptSetId: ConceptSetId
    expectedRevision: number
    actor?: ActorRef
  }): Promise<ConceptSet> {
    const actor = input.actor ?? 'local-human'
    this.requireEditableProject(input.projectId)
    const table = this.requireConceptSets()
    const set = this.requireConceptSetInProject(input.conceptSetId, input.projectId)
    if (set.accessMode === 'read-only') {
      throw new FashionDesignProjectReadOnlyError(input.projectId)
    }
    if (set.revision !== input.expectedRevision) {
      throw new FashionDesignRevisionConflictError(input.expectedRevision, set.revision)
    }
    if (set.status !== 'draft') {
      throw new FashionDesignInvalidTransitionError('concept-set-not-draft')
    }
    if (set.conceptRefs.length !== 3) {
      throw new FashionDesignConceptCountInvalidError(set.conceptRefs.length)
    }
    const readiness = this.evaluateReadiness(input.projectId, input.conceptSetId)
    const differentiation = this.evaluateDifferentiation(input.projectId, input.conceptSetId)
    if (!readiness.passed || !differentiation.passed) {
      throw new FashionDesignDifferentiationFailedError(
        readiness.failureReasons[0] ?? differentiation.failureReasons[0] ?? 'readiness-failed',
      )
    }
    const now = new Date().toISOString()
    for (const ref of set.conceptRefs) {
      const conceptId = brandConceptId(ref.conceptId)
      const concept = this.requireConceptInProject(conceptId, input.projectId)
      const nextConcept: DesignConceptRecordV0 = {
        ...concept,
        status: 'review_ready',
        revision: concept.revision + 1,
        updatedAt: now,
        updatedBy: actor,
      }
      await this.requireConcepts().put(conceptId, nextConcept)
    }
    const refreshedRefs = set.conceptRefs.map((ref) => {
      const concept = this.requireConceptInProject(brandConceptId(ref.conceptId), input.projectId)
      return { conceptId: ref.conceptId, conceptRevision: concept.revision }
    })
    const next: ConceptSetRecordV0 = {
      ...set,
      conceptRefs: refreshedRefs,
      differentiationCheck: {
        ruleVersion: differentiation.ruleVersion,
        passed: differentiation.passed,
        pairwise: differentiation.pairwise.map(row => ({
          conceptAId: String(row.conceptAId),
          conceptBId: String(row.conceptBId),
          dimension: row.dimension,
          conceptAValueRef: row.conceptAValueRef,
          conceptBValueRef: row.conceptBValueRef,
          differenceNote: row.differenceNote,
          checkedBy: row.checkedBy,
          checkedAt: row.checkedAt,
        })),
        failureReasons: [...differentiation.failureReasons],
        evaluatedAt: differentiation.evaluatedAt,
      },
      readinessCheck: {
        passed: readiness.passed,
        failureReasons: [...readiness.failureReasons],
        evaluatedAt: readiness.evaluatedAt,
      },
      status: 'review_ready',
      revision: set.revision + 1,
      updatedAt: now,
      updatedBy: actor,
    }
    await table.put(input.conceptSetId, next)
    return toConceptSet(input.conceptSetId, next)
  }

  /**
   * Soft-archive a ConceptSet.
   * @param input - Set identity and expectedRevision.
   */
  async archiveConceptSet(input: {
    projectId: ProjectId
    conceptSetId: ConceptSetId
    expectedRevision: number
    actor?: ActorRef
  }): Promise<ConceptSet> {
    const actor = input.actor ?? 'local-human'
    this.requireEditableProject(input.projectId)
    const table = this.requireConceptSets()
    const set = this.requireConceptSetInProject(input.conceptSetId, input.projectId)
    if (set.accessMode === 'read-only') {
      throw new FashionDesignProjectReadOnlyError(input.projectId)
    }
    if (set.revision !== input.expectedRevision) {
      throw new FashionDesignRevisionConflictError(input.expectedRevision, set.revision)
    }
    const now = new Date().toISOString()
    const next: ConceptSetRecordV0 = {
      ...set,
      status: 'archived',
      isCurrent: false,
      archivedAt: now,
      revision: set.revision + 1,
      updatedAt: now,
      updatedBy: actor,
    }
    await table.put(input.conceptSetId, next)
    return toConceptSet(input.conceptSetId, next)
  }

  /**
   * List VisualDrafts for a Concept.
   * @param projectId - Owning project.
   * @param conceptId - Parent concept.
   */
  listVisualDrafts(projectId: ProjectId, conceptId: DesignConceptId): readonly VisualDraft[] {
    this.requireConceptInProject(conceptId, projectId)
    const rows: VisualDraft[] = []
    for (const [id, record] of this.requireVisuals().entries()) {
      if (record.projectId !== String(projectId)) continue
      if (record.conceptId !== String(conceptId)) continue
      rows.push(toVisual(id, record))
    }
    rows.sort(compareDesignUpdatedDesc)
    return rows
  }

  /**
   * Read one VisualDraft.
   * @param projectId - Expected project.
   * @param visualDraftId - Draft identity.
   */
  getVisualDraft(projectId: ProjectId, visualDraftId: VisualDraftId): VisualDraft {
    return toVisual(visualDraftId, this.requireVisualInProject(visualDraftId, projectId))
  }

  /**
   * Register a recorded or manual VisualDraft bound to an exact Concept revision.
   * @param input - Visual fields.
   */
  async registerVisualDraft(input: {
    projectId: ProjectId
    conceptId: DesignConceptId
    expectedConceptRevision: number
    generationMode: Exclude<VisualGenerationMode, 'provider_generated'>
    inputSnapshotRef: string
    inputSnapshotHash: string
    artifactRef?: string | null
    artifactHash?: string | null
    mediaType?: string | null
    width?: number | null
    height?: number | null
    usageBoundary: string
    aiDisclosure: string
    referenceAssetRefs?: readonly string[]
    actor?: ActorRef
  }): Promise<VisualDraft> {
    const actor = input.actor ?? 'local-human'
    this.requireEditableProject(input.projectId)
    const concept = this.requireConceptInProject(input.conceptId, input.projectId)
    if (concept.accessMode === 'read-only') {
      throw new FashionDesignProjectReadOnlyError(input.projectId)
    }
    if (concept.revision !== input.expectedConceptRevision) {
      throw new FashionDesignRevisionConflictError(input.expectedConceptRevision, concept.revision)
    }
    if (input.generationMode === 'recorded_fixture' && actor !== 'system-seed') {
      // ordinary projects may still register offline fixtures; R0 uses seed path
    }
    const now = new Date().toISOString()
    const table = this.requireVisuals()
    const id = mintId(brandVisualId, candidate => table.get(candidate) !== undefined)
    const record: VisualDraftRecordV0 = {
      projectId: String(input.projectId),
      conceptId: String(input.conceptId),
      conceptRevision: concept.revision,
      generationMode: input.generationMode,
      providerRef: null,
      modelRef: null,
      providerJobRef: null,
      inputSnapshotRef: input.inputSnapshotRef.trim(),
      inputSnapshotHash: input.inputSnapshotHash.trim(),
      promptOrContextRef: null,
      referenceAssetRefs: [...(input.referenceAssetRefs ?? [])],
      artifactRef: input.artifactRef ?? null,
      artifactHash: input.artifactHash ?? null,
      mediaType: input.mediaType ?? null,
      width: input.width ?? null,
      height: input.height ?? null,
      requestedAt: now,
      generatedAt: now,
      failedAt: null,
      status: 'succeeded',
      failureCode: null,
      failureMessage: null,
      attributeConsistencyChecks: [],
      humanReviewStatus: 'not_reviewed',
      usageBoundary: input.usageBoundary.trim(),
      aiDisclosure: input.aiDisclosure.trim(),
      contentCredential: { status: 'not_available', manifestRef: null },
      origin: 'user',
      accessMode: 'editable',
      revision: 0,
      createdAt: now,
      updatedAt: now,
      createdBy: actor,
      updatedBy: actor,
      schemaVersion: FASHION_DESIGN_SCHEMA_VERSION,
      archivedAt: null,
      staleReason: null,
    }
    if (!record.inputSnapshotRef || !record.inputSnapshotHash || !record.usageBoundary || !record.aiDisclosure) {
      throw new FashionDesignInvalidInputError('visual-required-fields')
    }
    await table.put(id, record)
    return toVisual(id, record)
  }

  /**
   * Soft-archive a VisualDraft.
   * @param input - Draft identity and expectedRevision.
   */
  async archiveVisualDraft(input: {
    projectId: ProjectId
    visualDraftId: VisualDraftId
    expectedRevision: number
    actor?: ActorRef
  }): Promise<VisualDraft> {
    const actor = input.actor ?? 'local-human'
    this.requireEditableProject(input.projectId)
    const table = this.requireVisuals()
    const existing = this.requireVisualInProject(input.visualDraftId, input.projectId)
    if (existing.accessMode === 'read-only') {
      throw new FashionDesignProjectReadOnlyError(input.projectId)
    }
    if (existing.revision !== input.expectedRevision) {
      throw new FashionDesignRevisionConflictError(input.expectedRevision, existing.revision)
    }
    const now = new Date().toISOString()
    const next: VisualDraftRecordV0 = {
      ...existing,
      status: 'stale',
      archivedAt: now,
      staleReason: 'archived',
      revision: existing.revision + 1,
      updatedAt: now,
      updatedBy: actor,
    }
    await table.put(input.visualDraftId, next)
    return toVisual(input.visualDraftId, next)
  }

  /**
   * Mark downstream design objects stale when an Opportunity / Decision changes.
   * @param projectId - Owning project.
   * @param opportunityId - Upstream opportunity.
   * @returns Number of rows marked stale.
   */
  async cascadeStaleFromOpportunity(
    projectId: ProjectId,
    opportunityId: DesignOpportunityId,
  ): Promise<number> {
    this.requireProject(projectId)
    const now = new Date().toISOString()
    let marked = 0
    for (const [briefId, brief] of this.requireBriefs().entries()) {
      if (brief.projectId !== String(projectId)) continue
      if (brief.opportunityId !== String(opportunityId)) continue
      if (brief.status === 'stale' || brief.status === 'archived') continue
      const nextBrief: DesignBriefRecordV0 = {
        ...brief,
        status: 'stale',
        staleReason: 'upstream-opportunity-changed',
        revision: brief.revision + 1,
        updatedAt: now,
        updatedBy: 'system-rule',
      }
      await this.requireBriefs().put(briefId, nextBrief)
      marked += 1
      marked += await this.staleConceptSetsForBrief(projectId, briefId, brief.revision, now, 'system-rule')
    }
    return marked
  }

  protected async ensureR0Seed(): Promise<void> {
    const briefs = this.requireBriefs()
    const existing = briefs.get(R0_BRIEF_SEED.id)
    if (existing === undefined) {
      const opportunity = this.ctx.fashionAnalysisRegistry.getOpportunity(
        R0_PROJECT_ID,
        brandTaskId(String(R0_BRIEF_SEED.record.taskId)),
        R0_OPPORTUNITY_ID,
      )
      if (opportunity.reviewStatus !== 'selected' || opportunity.status === 'stale') {
        throw new FashionDesignSeedConflictError('r0-opportunity-not-selected')
      }
      const decisions = this.ctx.fashionAnalysisRegistry.listDecisions(
        R0_PROJECT_ID,
        brandTaskId(String(R0_BRIEF_SEED.record.taskId)),
      )
      const decision = decisions.find(row => row.id === R0_DECISION_ID)
      if (decision === undefined || decision.action !== 'selected' || decision.actor !== 'local-human') {
        throw new FashionDesignSeedConflictError('r0-decision-missing')
      }
      await briefs.put(R0_BRIEF_SEED.id, R0_BRIEF_SEED.record)
      await this.requireConceptSets().put(R0_CONCEPT_SET_SEED.id, R0_CONCEPT_SET_SEED.record)
      for (const seed of R0_CONCEPT_SEEDS) {
        await this.requireConcepts().put(seed.id, seed.record)
      }
      for (const seed of R0_ARTIFACT_SEEDS) {
        await this.requireArtifacts().put(seed.id, seed.record)
      }
      for (const seed of R0_VISUAL_SEEDS) {
        await this.requireVisuals().put(seed.id, seed.record)
      }
      return
    }

    if (!isValidR0DesignSeed(existing, R0_PROJECT_ID)) {
      throw new FashionDesignSeedConflictError('invalid-r0-brief')
    }
    const set = this.requireConceptSets().get(R0_CONCEPT_SET_SEED.id)
    if (set === undefined || !isValidR0DesignSeed(set, R0_PROJECT_ID)) {
      throw new FashionDesignSeedConflictError('invalid-r0-concept-set')
    }
    for (const seed of R0_CONCEPT_SEEDS) {
      const row = this.requireConcepts().get(seed.id)
      if (row === undefined || !isValidR0DesignSeed(row, R0_PROJECT_ID)) {
        throw new FashionDesignSeedConflictError('invalid-r0-concept')
      }
    }
    for (const seed of R0_VISUAL_SEEDS) {
      const row = this.requireVisuals().get(seed.id)
      if (row === undefined || !isValidR0DesignSeed(row, R0_PROJECT_ID)) {
        throw new FashionDesignSeedConflictError('invalid-r0-visual')
      }
    }
  }

  private async staleConceptSetsForBrief(
    projectId: ProjectId,
    briefId: DesignBriefId,
    _briefRevision: number,
    now: string,
    actor: ActorRef,
  ): Promise<number> {
    let marked = 0
    for (const [setId, set] of this.requireConceptSets().entries()) {
      if (set.projectId !== String(projectId)) continue
      if (set.briefId !== String(briefId)) continue
      if (set.status === 'stale' || set.status === 'archived') continue
      const next: ConceptSetRecordV0 = {
        ...set,
        status: 'stale',
        staleReason: 'brief-revision-changed',
        revision: set.revision + 1,
        updatedAt: now,
        updatedBy: actor,
      }
      await this.requireConceptSets().put(setId, next)
      marked += 1
      for (const ref of set.conceptRefs) {
        const conceptId = brandConceptId(ref.conceptId)
        const concept = this.requireConcepts().get(conceptId)
        if (concept === undefined) continue
        if (concept.status === 'stale' || concept.status === 'archived') continue
        await this.requireConcepts().put(conceptId, {
          ...concept,
          status: 'stale',
          staleReason: 'brief-revision-changed',
          revision: concept.revision + 1,
          updatedAt: now,
          updatedBy: actor,
        })
        marked += 1
        marked += await this.staleVisualsForConcept(projectId, conceptId, concept.revision, now, actor)
      }
    }
    return marked
  }

  private async staleVisualsForConcept(
    projectId: ProjectId,
    conceptId: DesignConceptId,
    conceptRevision: number,
    now: string,
    actor: ActorRef,
  ): Promise<number> {
    let marked = 0
    for (const [visualId, visual] of this.requireVisuals().entries()) {
      if (visual.projectId !== String(projectId)) continue
      if (visual.conceptId !== String(conceptId)) continue
      if (visual.conceptRevision !== conceptRevision) continue
      if (visual.status === 'stale') continue
      await this.requireVisuals().put(visualId, {
        ...visual,
        status: 'stale',
        staleReason: 'concept-revision-changed',
        revision: visual.revision + 1,
        updatedAt: now,
        updatedBy: actor,
      })
      marked += 1
    }
    return marked
  }

  protected requireSelectedOpportunity(
    projectId: ProjectId,
    opportunityId: DesignOpportunityId,
    expectedRevision: number,
    selectionDecisionId: OpportunityDecisionId,
  ) {
    const tasks = this.ctx.fashionResearchRegistry.listTasks(projectId)
    let found: ReturnType<typeof this.ctx.fashionAnalysisRegistry.getOpportunity> | undefined
    let taskId: ResearchTaskId | undefined
    for (const task of tasks) {
      try {
        found = this.ctx.fashionAnalysisRegistry.getOpportunity(projectId, task.id, opportunityId)
        taskId = task.id
        break
      } catch {
        // Opportunity is scoped to one ResearchTask; try the next task.
      }
    }
    if (found === undefined || taskId === undefined) {
      throw new FashionDesignUpstreamNotSelectedError(opportunityId)
    }
    if (found.projectId !== projectId) {
      throw new FashionDesignCrossProjectReferenceError(projectId, found.projectId)
    }
    if (found.status === 'stale' || found.status === 'invalidated' || found.status === 'archived') {
      throw new FashionDesignUpstreamStaleError(opportunityId)
    }
    if (found.revision !== expectedRevision) {
      throw new FashionDesignRevisionConflictError(expectedRevision, found.revision)
    }
    if (found.reviewStatus !== 'selected') {
      throw new FashionDesignUpstreamNotSelectedError(opportunityId)
    }
    if (found.currentDecisionId !== selectionDecisionId) {
      throw new FashionDesignUpstreamNotSelectedError(opportunityId)
    }
    const decisions = this.ctx.fashionAnalysisRegistry.listDecisions(projectId, taskId)
    const decision = decisions.find(row => row.id === selectionDecisionId)
    if (
      decision === undefined
      || decision.action !== 'selected'
      || decision.actor !== 'local-human'
      || decision.opportunityId !== opportunityId
    ) {
      throw new FashionDesignUpstreamNotSelectedError(opportunityId)
    }
    return found
  }

  private assertBriefDraftFields(record: DesignBriefRecordV0): void {
    if (!record.market || !record.season || !record.category || !record.targetUser) {
      throw new FashionDesignInvalidInputError('brief-required-fields')
    }
  }

  private assertBriefConfirmable(record: DesignBriefRecordV0): void {
    this.assertBriefDraftFields(record)
    if (record.differentiationGoals.length < 1) {
      throw new FashionDesignInvalidInputError('differentiation-goal-required')
    }
    const empties: Array<{ name: string; rows: readonly ConstraintEntry[]; status: BriefStatus }> = []
    void empties
    for (const [name, rows] of [
      ['mustKeep', record.mustKeep],
      ['mustAvoid', record.mustAvoid],
      ['materialsConstraints', record.materialsConstraints],
      ['costConstraints', record.costConstraints],
      ['productionConstraints', record.productionConstraints],
    ] as const) {
      if (rows.length === 0) {
        throw new FashionDesignInvalidInputError(`empty-${name}-needs-explicit-unknown`)
      }
    }
  }

  private assertConceptFields(record: DesignConceptRecordV0): void {
    if (
      !record.conceptName
      || !record.designIntent
      || !record.silhouette
      || !record.proportionAndLength
      || !record.materialDirection
      || !record.colorDirection
    ) {
      throw new FashionDesignInvalidInputError('concept-required-fields')
    }
  }

  protected requireProject(projectId: ProjectId): void {
    if (this.ctx.fashionProjectRegistry.get(projectId) === undefined) {
      throw new FashionDesignProjectNotFoundError(projectId)
    }
  }

  protected requireEditableProject(projectId: ProjectId): void {
    const project = this.ctx.fashionProjectRegistry.get(projectId)
    if (project === undefined) throw new FashionDesignProjectNotFoundError(projectId)
    if (project.accessMode === 'read-only') {
      throw new FashionDesignProjectReadOnlyError(projectId)
    }
  }

  protected requireBriefs(): KvTable<DesignBriefId, DesignBriefRecordV0> {
    if (this.briefs === undefined) throw new Error('fashion design briefs table not open')
    return this.briefs
  }

  protected requireConceptSets(): KvTable<ConceptSetId, ConceptSetRecordV0> {
    if (this.conceptSets === undefined) throw new Error('fashion design concept_sets table not open')
    return this.conceptSets
  }

  protected requireConcepts(): KvTable<DesignConceptId, DesignConceptRecordV0> {
    if (this.concepts === undefined) throw new Error('fashion design design_concepts table not open')
    return this.concepts
  }

  protected requireVisuals(): KvTable<VisualDraftId, VisualDraftRecordV0> {
    if (this.visuals === undefined) throw new Error('fashion design visual_drafts table not open')
    return this.visuals
  }

  protected requireArtifacts(): NonNullable<typeof this.artifacts> {
    if (this.artifacts === undefined) throw new Error('fashion design design_artifacts table not open')
    return this.artifacts
  }

  protected requireBriefInProject(briefId: DesignBriefId, projectId: ProjectId): DesignBriefRecordV0 {
    this.requireProject(projectId)
    const record = this.requireBriefs().get(briefId)
    if (record === undefined) throw new FashionDesignBriefNotFoundError(briefId)
    if (record.projectId !== String(projectId)) {
      throw new FashionDesignCrossProjectReferenceError(projectId, record.projectId as ProjectId)
    }
    return record
  }

  protected requireConceptSetInProject(conceptSetId: ConceptSetId, projectId: ProjectId): ConceptSetRecordV0 {
    this.requireProject(projectId)
    const record = this.requireConceptSets().get(conceptSetId)
    if (record === undefined) throw new FashionDesignConceptSetNotFoundError(conceptSetId)
    if (record.projectId !== String(projectId)) {
      throw new FashionDesignCrossProjectReferenceError(projectId, record.projectId as ProjectId)
    }
    return record
  }

  protected requireConceptInProject(conceptId: DesignConceptId, projectId: ProjectId): DesignConceptRecordV0 {
    this.requireProject(projectId)
    const record = this.requireConcepts().get(conceptId)
    if (record === undefined) throw new FashionDesignConceptNotFoundError(conceptId)
    if (record.projectId !== String(projectId)) {
      throw new FashionDesignCrossProjectReferenceError(projectId, record.projectId as ProjectId)
    }
    return record
  }

  protected requireVisualInProject(visualDraftId: VisualDraftId, projectId: ProjectId): VisualDraftRecordV0 {
    this.requireProject(projectId)
    const record = this.requireVisuals().get(visualDraftId)
    if (record === undefined) throw new FashionDesignVisualDraftNotFoundError(visualDraftId)
    if (record.projectId !== String(projectId)) {
      throw new FashionDesignCrossProjectReferenceError(projectId, record.projectId as ProjectId)
    }
    return record
  }
}
