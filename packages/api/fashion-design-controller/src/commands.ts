/**
 * Fashion Design Remote command projection onto the Host registry.
 * @module @gentlexx/dsh-api-fashion-design-controller/src/commands
 */

import type { Context } from '@deepseek-ai/cordis'
import {
  DesignOpportunityId,
  OpportunityDecisionId,
} from '@gentlexx/dsh-fashion-analysis'
import {
  ConceptSetId,
  DesignBriefId,
  DesignConceptId,
  DesignDeliverableId,
  FashionDesignApprovalInvalidError,
  FashionDesignBriefNotConfirmedError,
  FashionDesignBriefNotFoundError,
  FashionDesignCanonicalizationFailedError,
  FashionDesignConceptCountInvalidError,
  FashionDesignConceptNotFoundError,
  FashionDesignConceptNotInRoundError,
  FashionDesignConceptSetNotFoundError,
  FashionDesignConceptSetNotReadyError,
  FashionDesignCrossProjectReferenceError,
  FashionDesignDeliverableNotFoundError,
  FashionDesignDifferentiationFailedError,
  FashionDesignHumanRequiredError,
  FashionDesignIntegrityMismatchError,
  FashionDesignInvalidInputError,
  FashionDesignInvalidTransitionError,
  FashionDesignProjectNotFoundError,
  FashionDesignProjectReadOnlyError,
  FashionDesignRenderFailedError,
  FashionDesignReviewAlreadyOpenError,
  FashionDesignReviewClosedError,
  FashionDesignReviewNotFoundError,
  FashionDesignRevisionConflictError,
  FashionDesignSelectionRequiredError,
  FashionDesignUpstreamNotSelectedError,
  FashionDesignUpstreamStaleError,
  FashionDesignVisualDraftNotFoundError,
  ReviewRoundId,
  VisualDraftId,
} from '@gentlexx/dsh-fashion-design'
import { ProjectId } from '@gentlexx/dsh-fashion-project'
import { RemoteError } from '@deepseek-ai/dsh-typert-protocol'
import type {
  ApprovalValidityValue,
  ApproveSelectedConceptRequest,
  BriefValue,
  CloseReviewDecisionRequest,
  ConfirmBriefRequest,
  ConceptSetValue,
  ConceptValue,
  CreateBriefFromOpportunityRequest,
  CreateConceptRequest,
  CreateConceptSetRequest,
  DeliverablePreviewValue,
  DesignDeliverableValue,
  DesignScopeRequest,
  DesignWorkspaceValue,
  DifferentiationCheck,
  EvaluateDifferentiationRequest,
  EvaluateReadinessRequest,
  ExportArtifactValue,
  GenerateDeliverableRequest,
  GetBriefRequest,
  GetConceptRequest,
  GetConceptSetRequest,
  GetDeliverableRequest,
  GetReviewRequest,
  GetVisualDraftRequest,
  ListVisualDraftsRequest,
  MarkConceptSetReviewReadyRequest,
  OpenReviewRequest,
  ReadinessCheck,
  ReviseConceptRequest,
  RevokeApprovalRequest,
  ReviewDecisionValue,
  ReviewRoundValue,
  SelectConceptRequest,
  VisualDraftValue,
} from './types.ts'

/** Maps registry operations onto serializable Remote values. */
export class FashionDesignCommands {
  /** @param ctx - Host context providing {@link Context.fashionDesignRegistry}. */
  constructor(private readonly ctx: Context) {}

  /** @param request - workspace scope. */
  loadWorkspace(request: DesignScopeRequest): DesignWorkspaceValue {
    return this.runSync(() => {
      const projectId = ProjectId(String(request.projectId))
      const briefs = this.ctx.fashionDesignRegistry.listBriefs(projectId)
      const conceptSets = this.ctx.fashionDesignRegistry.listConceptSets(projectId)
      const concepts = conceptSets.flatMap(set =>
        this.ctx.fashionDesignRegistry.listConcepts(projectId, set.id),
      )
      return { briefs, conceptSets, concepts }
    })
  }

  /** @param request - create brief. */
  async createBriefFromOpportunity(request: CreateBriefFromOpportunityRequest): Promise<BriefValue> {
    return this.runAsync(async () => this.ctx.fashionDesignRegistry.createBriefFromOpportunity(definedProps({
      projectId: ProjectId(String(request.projectId)),
      opportunityId: DesignOpportunityId(String(request.opportunityId)),
      expectedOpportunityRevision: request.expectedOpportunityRevision,
      selectionDecisionId: OpportunityDecisionId(String(request.selectionDecisionId)),
      market: request.market,
      season: request.season,
      category: request.category,
      targetUser: request.targetUser,
      brandContext: request.brandContext,
      priceTarget: request.priceTarget,
      mustKeep: request.mustKeep,
      mustAvoid: request.mustAvoid,
      materialsConstraints: request.materialsConstraints,
      costConstraints: request.costConstraints,
      productionConstraints: request.productionConstraints,
      differentiationGoals: request.differentiationGoals,
      openQuestions: request.openQuestions,
      constraintSources: request.constraintSources,
    }) as never))
  }

  /** @param request - get brief. */
  getBrief(request: GetBriefRequest): BriefValue {
    return this.runSync(() => this.ctx.fashionDesignRegistry.getBrief(
      ProjectId(String(request.projectId)),
      DesignBriefId(String(request.briefId)),
    ))
  }

  /** @param request - confirm brief. */
  async confirmBrief(request: ConfirmBriefRequest): Promise<BriefValue> {
    return this.runAsync(async () => this.ctx.fashionDesignRegistry.confirmBrief({
      projectId: ProjectId(String(request.projectId)),
      briefId: DesignBriefId(String(request.briefId)),
      expectedRevision: request.expectedRevision,
    }))
  }

  /** @param request - create concept set. */
  async createConceptSet(request: CreateConceptSetRequest): Promise<ConceptSetValue> {
    return this.runAsync(async () => this.ctx.fashionDesignRegistry.createConceptSet({
      projectId: ProjectId(String(request.projectId)),
      briefId: DesignBriefId(String(request.briefId)),
      expectedBriefRevision: request.expectedBriefRevision,
    }))
  }

  /** @param request - get concept set. */
  getConceptSet(request: GetConceptSetRequest): ConceptSetValue {
    return this.runSync(() => this.ctx.fashionDesignRegistry.getConceptSet(
      ProjectId(String(request.projectId)),
      ConceptSetId(String(request.conceptSetId)),
    ))
  }

  /** @param request - mark review ready. */
  async markConceptSetReviewReady(request: MarkConceptSetReviewReadyRequest): Promise<ConceptSetValue> {
    return this.runAsync(async () => this.ctx.fashionDesignRegistry.markConceptSetReviewReady({
      projectId: ProjectId(String(request.projectId)),
      conceptSetId: ConceptSetId(String(request.conceptSetId)),
      expectedRevision: request.expectedRevision,
    }))
  }

  /** @param request - create concept. */
  async createConcept(request: CreateConceptRequest): Promise<ConceptValue> {
    return this.runAsync(async () => this.ctx.fashionDesignRegistry.createConcept(definedProps({
      projectId: ProjectId(String(request.projectId)),
      conceptSetId: ConceptSetId(String(request.conceptSetId)),
      expectedConceptSetRevision: request.expectedConceptSetRevision,
      conceptName: request.conceptName,
      designIntent: request.designIntent,
      silhouette: request.silhouette,
      proportionAndLength: request.proportionAndLength,
      materialDirection: request.materialDirection,
      colorDirection: request.colorDirection,
      constructionAndDetails: request.constructionAndDetails,
      functionalValue: request.functionalValue,
      targetUseScenarios: request.targetUseScenarios,
      marketEvidenceLinks: request.marketEvidenceLinks,
      originalTransformationNotes: request.originalTransformationNotes,
      competitorSimilarityRisks: request.competitorSimilarityRisks,
      productionUnknowns: request.productionUnknowns,
      constraintCoverage: request.constraintCoverage,
    }) as never))
  }

  /** @param request - revise concept. */
  async reviseConcept(request: ReviseConceptRequest): Promise<ConceptValue> {
    return this.runAsync(async () => this.ctx.fashionDesignRegistry.reviseConcept(definedProps({
      projectId: ProjectId(String(request.projectId)),
      conceptId: DesignConceptId(String(request.conceptId)),
      expectedRevision: request.expectedRevision,
      conceptName: request.conceptName,
      designIntent: request.designIntent,
      silhouette: request.silhouette,
      proportionAndLength: request.proportionAndLength,
      materialDirection: request.materialDirection,
      colorDirection: request.colorDirection,
      constructionAndDetails: request.constructionAndDetails,
      functionalValue: request.functionalValue,
      targetUseScenarios: request.targetUseScenarios,
      originalTransformationNotes: request.originalTransformationNotes,
      productionUnknowns: request.productionUnknowns,
    }) as never))
  }

  /** @param request - get concept. */
  getConcept(request: GetConceptRequest): ConceptValue {
    return this.runSync(() => this.ctx.fashionDesignRegistry.getConcept(
      ProjectId(String(request.projectId)),
      DesignConceptId(String(request.conceptId)),
    ))
  }

  /** @param request - evaluate differentiation. */
  evaluateDifferentiation(request: EvaluateDifferentiationRequest): DifferentiationCheck {
    return this.runSync(() => this.ctx.fashionDesignRegistry.evaluateDifferentiation(
      ProjectId(String(request.projectId)),
      ConceptSetId(String(request.conceptSetId)),
    ))
  }

  /** @param request - evaluate readiness. */
  evaluateReadiness(request: EvaluateReadinessRequest): ReadinessCheck {
    return this.runSync(() => this.ctx.fashionDesignRegistry.evaluateReadiness(
      ProjectId(String(request.projectId)),
      ConceptSetId(String(request.conceptSetId)),
    ))
  }

  /** @param request - get visual draft. */
  getVisualDraft(request: GetVisualDraftRequest): VisualDraftValue {
    return this.runSync(() => this.ctx.fashionDesignRegistry.getVisualDraft(
      ProjectId(String(request.projectId)),
      VisualDraftId(String(request.visualDraftId)),
    ))
  }

  /** @param request - list visual drafts. */
  listVisualDrafts(request: ListVisualDraftsRequest): readonly VisualDraftValue[] {
    return this.runSync(() => this.ctx.fashionDesignRegistry.listVisualDrafts(
      ProjectId(String(request.projectId)),
      DesignConceptId(String(request.conceptId)),
    ))
  }

  /** @param request - open review. */
  async openReview(request: OpenReviewRequest): Promise<ReviewRoundValue> {
    return this.runAsync(async () => this.ctx.fashionDesignRegistry.openReview(definedProps({
      projectId: ProjectId(String(request.projectId)),
      conceptSetId: ConceptSetId(String(request.conceptSetId)),
      expectedConceptSetRevision: request.expectedConceptSetRevision,
      idempotencyKey: request.idempotencyKey,
    }) as never))
  }

  /** @param request - get review. */
  getReview(request: GetReviewRequest): ReviewRoundValue {
    return this.runSync(() => this.ctx.fashionDesignRegistry.getReview(
      ProjectId(String(request.projectId)),
      ReviewRoundId(String(request.reviewRoundId)),
    ))
  }

  /** @param request - list reviews. */
  listReviews(request: DesignScopeRequest): readonly ReviewRoundValue[] {
    return this.runSync(() => this.ctx.fashionDesignRegistry.listReviews(
      ProjectId(String(request.projectId)),
    ))
  }

  /** @param request - select concept. */
  async selectConcept(request: SelectConceptRequest): Promise<ReviewDecisionValue> {
    return this.runAsync(async () => this.ctx.fashionDesignRegistry.selectConcept(definedProps({
      projectId: ProjectId(String(request.projectId)),
      reviewRoundId: ReviewRoundId(String(request.reviewRoundId)),
      conceptId: DesignConceptId(String(request.conceptId)),
      expectedConceptRevision: request.expectedConceptRevision,
      reasonCodes: request.reasonCodes,
      reasonText: request.reasonText,
    }) as never))
  }

  /** @param request - approve selected. */
  async approveSelectedConcept(request: ApproveSelectedConceptRequest): Promise<ReviewDecisionValue> {
    return this.runAsync(async () => this.ctx.fashionDesignRegistry.approveSelectedConcept(definedProps({
      projectId: ProjectId(String(request.projectId)),
      reviewRoundId: ReviewRoundId(String(request.reviewRoundId)),
      reasonCodes: request.reasonCodes,
      reasonText: request.reasonText,
    }) as never))
  }

  /** @param request - request revision. */
  async requestConceptRevision(request: CloseReviewDecisionRequest): Promise<ReviewDecisionValue> {
    return this.runAsync(async () => this.ctx.fashionDesignRegistry.requestConceptRevision({
      projectId: ProjectId(String(request.projectId)),
      reviewRoundId: ReviewRoundId(String(request.reviewRoundId)),
      subjectType: request.subjectType,
      subjectId: String(request.subjectId),
      expectedRevision: request.expectedRevision,
      reasonCodes: request.reasonCodes,
      reasonText: request.reasonText,
    }))
  }

  /** @param request - reject. */
  async rejectConceptOrSet(request: CloseReviewDecisionRequest): Promise<ReviewDecisionValue> {
    return this.runAsync(async () => this.ctx.fashionDesignRegistry.rejectConceptOrSet({
      projectId: ProjectId(String(request.projectId)),
      reviewRoundId: ReviewRoundId(String(request.reviewRoundId)),
      subjectType: request.subjectType,
      subjectId: String(request.subjectId),
      expectedRevision: request.expectedRevision,
      reasonCodes: request.reasonCodes,
      reasonText: request.reasonText,
    }))
  }

  /** @param request - needs research. */
  async requestMoreResearch(request: CloseReviewDecisionRequest): Promise<ReviewDecisionValue> {
    return this.runAsync(async () => this.ctx.fashionDesignRegistry.requestMoreResearch({
      projectId: ProjectId(String(request.projectId)),
      reviewRoundId: ReviewRoundId(String(request.reviewRoundId)),
      subjectType: request.subjectType,
      subjectId: String(request.subjectId),
      expectedRevision: request.expectedRevision,
      reasonCodes: request.reasonCodes,
      reasonText: request.reasonText,
    }))
  }

  /** @param request - revoke approval. */
  async revokeApproval(request: RevokeApprovalRequest): Promise<ReviewDecisionValue> {
    return this.runAsync(async () => this.ctx.fashionDesignRegistry.revokeApproval(definedProps({
      projectId: ProjectId(String(request.projectId)),
      reviewRoundId: ReviewRoundId(String(request.reviewRoundId)),
      reasonText: request.reasonText,
      reasonCodes: request.reasonCodes,
    }) as never))
  }

  /** @param request - approval validity. */
  async getApprovalValidity(request: GetReviewRequest): Promise<ApprovalValidityValue> {
    return this.runAsync(async () => this.ctx.fashionDesignRegistry.getApprovalValidity(
      ProjectId(String(request.projectId)),
      ReviewRoundId(String(request.reviewRoundId)),
    ))
  }

  /** @param request - preview deliverable. */
  async previewDeliverable(request: GenerateDeliverableRequest): Promise<DeliverablePreviewValue> {
    return this.runAsync(async () => this.ctx.fashionDesignRegistry.previewDeliverable({
      projectId: ProjectId(String(request.projectId)),
      reviewRoundId: ReviewRoundId(String(request.reviewRoundId)),
      audienceProfile: request.audienceProfile,
    }))
  }

  /** @param request - generate deliverable. */
  async generateDeliverable(request: GenerateDeliverableRequest): Promise<DesignDeliverableValue> {
    return this.runAsync(async () => this.ctx.fashionDesignRegistry.generateDeliverable(definedProps({
      projectId: ProjectId(String(request.projectId)),
      reviewRoundId: ReviewRoundId(String(request.reviewRoundId)),
      audienceProfile: request.audienceProfile,
      idempotencyKey: request.idempotencyKey,
    }) as never))
  }

  /** @param request - get deliverable. */
  getDeliverable(request: GetDeliverableRequest): DesignDeliverableValue {
    return this.runSync(() => this.ctx.fashionDesignRegistry.getDeliverable(
      ProjectId(String(request.projectId)),
      DesignDeliverableId(String(request.deliverableId)),
    ))
  }

  /** @param request - list deliverables. */
  listDeliverables(request: DesignScopeRequest): readonly DesignDeliverableValue[] {
    return this.runSync(() => this.ctx.fashionDesignRegistry.listDeliverables(
      ProjectId(String(request.projectId)),
    ))
  }

  /** @param request - list artifacts. */
  listDeliverableArtifacts(request: GetDeliverableRequest): readonly ExportArtifactValue[] {
    return this.runSync(() => this.ctx.fashionDesignRegistry.listDeliverableArtifacts(
      ProjectId(String(request.projectId)),
      DesignDeliverableId(String(request.deliverableId)),
    ))
  }

  /** @param request - verify deliverable. */
  verifyDeliverable(request: GetDeliverableRequest): { readonly ok: boolean; readonly mismatches: readonly string[] } {
    return this.runSync(() => this.ctx.fashionDesignRegistry.verifyDeliverable(
      ProjectId(String(request.projectId)),
      DesignDeliverableId(String(request.deliverableId)),
    ))
  }

  private async runAsync<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      mapDesignError(error)
    }
  }

  private runSync<T>(fn: () => T): T {
    try {
      return fn()
    } catch (error) {
      mapDesignError(error)
    }
  }
}

function mapDesignError(error: unknown): never {
  if (error instanceof FashionDesignProjectNotFoundError) {
    throw new RemoteError('fashion-design/project-not-found', error.message, { projectId: error.projectId })
  }
  if (error instanceof FashionDesignBriefNotFoundError) {
    throw new RemoteError('fashion-design/brief-not-found', error.message, { briefId: error.briefId })
  }
  if (error instanceof FashionDesignConceptSetNotFoundError) {
    throw new RemoteError('fashion-design/concept-set-not-found', error.message, {
      conceptSetId: error.conceptSetId,
    })
  }
  if (error instanceof FashionDesignConceptNotFoundError) {
    throw new RemoteError('fashion-design/concept-not-found', error.message, { conceptId: error.conceptId })
  }
  if (error instanceof FashionDesignVisualDraftNotFoundError) {
    throw new RemoteError('fashion-design/visual-draft-not-found', error.message, {
      visualDraftId: error.visualDraftId,
    })
  }
  if (error instanceof FashionDesignProjectReadOnlyError) {
    throw new RemoteError('fashion-design/project-read-only', error.message, { projectId: error.projectId })
  }
  if (error instanceof FashionDesignCrossProjectReferenceError) {
    throw new RemoteError('fashion-design/cross-project-reference', error.message, {
      projectId: error.projectId,
      otherProjectId: error.otherProjectId,
    })
  }
  if (error instanceof FashionDesignRevisionConflictError) {
    throw new RemoteError('fashion-design/revision-conflict', error.message, {
      expected: error.expected,
      actual: error.actual,
    })
  }
  if (error instanceof FashionDesignInvalidInputError) {
    throw new RemoteError('fashion-design/invalid-input', error.message, { reason: error.reason })
  }
  if (error instanceof FashionDesignInvalidTransitionError) {
    throw new RemoteError('fashion-design/invalid-transition', error.message, { reason: error.reason })
  }
  if (error instanceof FashionDesignUpstreamNotSelectedError) {
    throw new RemoteError('fashion-design/upstream-not-selected', error.message, {
      opportunityId: error.opportunityId,
    })
  }
  if (error instanceof FashionDesignUpstreamStaleError) {
    throw new RemoteError('fashion-design/upstream-stale', error.message, {
      opportunityId: error.opportunityId,
    })
  }
  if (error instanceof FashionDesignBriefNotConfirmedError) {
    throw new RemoteError('fashion-design/brief-not-confirmed', error.message, { briefId: error.briefId })
  }
  if (error instanceof FashionDesignConceptCountInvalidError) {
    throw new RemoteError('fashion-design/concept-count-invalid', error.message, { count: error.count })
  }
  if (error instanceof FashionDesignDifferentiationFailedError) {
    throw new RemoteError('fashion-design/differentiation-failed', error.message, { reason: error.reason })
  }
  if (error instanceof FashionDesignHumanRequiredError) {
    throw new RemoteError('fashion-design/human-required', error.message, { reason: error.reason })
  }
  if (error instanceof FashionDesignReviewNotFoundError) {
    throw new RemoteError('fashion-design/review-not-found', error.message, {
      reviewRoundId: ReviewRoundId(error.reviewRoundId),
    })
  }
  if (error instanceof FashionDesignConceptSetNotReadyError) {
    throw new RemoteError('fashion-design/concept-set-not-ready', error.message, { reason: error.reason })
  }
  if (error instanceof FashionDesignReviewAlreadyOpenError) {
    throw new RemoteError('fashion-design/review-already-open', error.message, {
      reviewRoundId: ReviewRoundId(error.reviewRoundId),
    })
  }
  if (error instanceof FashionDesignReviewClosedError) {
    throw new RemoteError('fashion-design/review-closed', error.message, {
      reviewRoundId: ReviewRoundId(error.reviewRoundId),
    })
  }
  if (error instanceof FashionDesignConceptNotInRoundError) {
    throw new RemoteError('fashion-design/concept-not-in-round', error.message, {
      conceptId: DesignConceptId(error.conceptId),
    })
  }
  if (error instanceof FashionDesignSelectionRequiredError) {
    throw new RemoteError('fashion-design/selection-required', error.message, { reason: error.reason })
  }
  if (error instanceof FashionDesignApprovalInvalidError) {
    throw new RemoteError('fashion-design/approval-invalid', error.message, { reason: error.reason })
  }
  if (error instanceof FashionDesignDeliverableNotFoundError) {
    throw new RemoteError('fashion-design/deliverable-not-found', error.message, {
      deliverableId: DesignDeliverableId(error.deliverableId),
    })
  }
  if (error instanceof FashionDesignCanonicalizationFailedError) {
    throw new RemoteError('fashion-design/canonicalization-failed', error.message, { reason: error.reason })
  }
  if (error instanceof FashionDesignRenderFailedError) {
    throw new RemoteError('fashion-design/render-failed', error.message, { reason: error.reason })
  }
  if (error instanceof FashionDesignIntegrityMismatchError) {
    throw new RemoteError('fashion-design/integrity-mismatch', error.message, { reason: error.reason })
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
