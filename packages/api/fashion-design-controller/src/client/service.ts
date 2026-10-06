/**
 * Client Fashion Design service face (`ctx.fashionDesign`).
 * @module @gentlexx/dsh-api-fashion-design-controller/src/client/service
 */

import { Service, type Context } from '@deepseek-ai/cordis'
import type {
  ApprovalValidity,
  AudienceProfile,
  ConceptSet,
  ConceptSetId,
  DeliverablePreview,
  DesignConcept,
  DesignConceptId,
  DesignDeliverable,
  DesignDeliverableId,
  DesignOpportunityBrief,
  DifferentiationCheck,
  ExportArtifactView,
  ReadinessCheck,
  ReviewDecision,
  ReviewRound,
  ReviewRoundId,
  VisualDraft,
} from '@gentlexx/dsh-fashion-design/types'
import type { ProjectId } from '@gentlexx/dsh-fashion-project/types'
import type { ObservableSnapshot } from '@deepseek-ai/dsh-client-store'
import type { RemoteFailure } from '@deepseek-ai/dsh-typert-protocol'
import type {
  ConfirmBriefRequest,
  CreateBriefFromOpportunityRequest,
  CreateConceptRequest,
  CreateConceptSetRequest,
  EvaluateDifferentiationRequest,
  EvaluateReadinessRequest,
  GetBriefRequest,
  GetConceptRequest,
  GetConceptSetRequest,
  GetVisualDraftRequest,
  ListVisualDraftsRequest,
  MarkConceptSetReviewReadyRequest,
  ReviseConceptRequest,
} from '../types.ts'
import type { ClientFashionDesignModel, DesignListState } from './model.ts'

/** Structured command failure for callers that distinguish Host business errors. */
export class FashionDesignCommandError extends Error {
  override readonly name = 'FashionDesignCommandError'

  /** @param rpcError - Host business or folded carrier failure. */
  constructor(readonly rpcError: RemoteFailure) {
    super(`fashion design command failed: ${rpcError.code}: ${rpcError.message}`)
  }
}

/** Browser Fashion Design service. */
export interface FashionDesignClient {
  readonly briefs: ObservableSnapshot<DesignListState<DesignOpportunityBrief>>
  readonly conceptSets: ObservableSnapshot<DesignListState<ConceptSet>>
  readonly concepts: ObservableSnapshot<DesignListState<DesignConcept>>
  loadWorkspace(projectId: ProjectId): Promise<void>
  createBriefFromOpportunity(request: CreateBriefFromOpportunityRequest): Promise<DesignOpportunityBrief>
  getBrief(request: GetBriefRequest): Promise<DesignOpportunityBrief>
  confirmBrief(request: ConfirmBriefRequest): Promise<DesignOpportunityBrief>
  createConceptSet(request: CreateConceptSetRequest): Promise<ConceptSet>
  getConceptSet(request: GetConceptSetRequest): Promise<ConceptSet>
  markConceptSetReviewReady(request: MarkConceptSetReviewReadyRequest): Promise<ConceptSet>
  createConcept(request: CreateConceptRequest): Promise<DesignConcept>
  reviseConcept(request: ReviseConceptRequest): Promise<DesignConcept>
  getConcept(request: GetConceptRequest): Promise<DesignConcept>
  evaluateDifferentiation(request: EvaluateDifferentiationRequest): Promise<DifferentiationCheck>
  evaluateReadiness(request: EvaluateReadinessRequest): Promise<ReadinessCheck>
  getVisualDraft(request: GetVisualDraftRequest): Promise<VisualDraft>
  listVisualDrafts(request: ListVisualDraftsRequest): Promise<readonly VisualDraft[]>
  openReview(input: {
    projectId: ProjectId
    conceptSetId: ConceptSetId
    expectedConceptSetRevision: number
    idempotencyKey?: string | null
  }): Promise<ReviewRound>
  listReviews(projectId: ProjectId): Promise<readonly ReviewRound[]>
  getReview(projectId: ProjectId, reviewRoundId: ReviewRoundId): Promise<ReviewRound>
  selectConcept(input: {
    projectId: ProjectId
    reviewRoundId: ReviewRoundId
    conceptId: DesignConceptId
    expectedConceptRevision: number
    reasonCodes: readonly string[]
    reasonText?: string | null
  }): Promise<ReviewDecision>
  approveSelectedConcept(input: {
    projectId: ProjectId
    reviewRoundId: ReviewRoundId
    reasonCodes: readonly string[]
    reasonText?: string | null
  }): Promise<ReviewDecision>
  requestConceptRevision(input: {
    projectId: ProjectId
    reviewRoundId: ReviewRoundId
    subjectType: 'concept_set' | 'concept'
    subjectId: string
    expectedRevision: number
    reasonCodes: readonly string[]
    reasonText: string
  }): Promise<ReviewDecision>
  rejectConceptOrSet(input: {
    projectId: ProjectId
    reviewRoundId: ReviewRoundId
    subjectType: 'concept_set' | 'concept'
    subjectId: string
    expectedRevision: number
    reasonCodes: readonly string[]
    reasonText: string
  }): Promise<ReviewDecision>
  requestMoreResearch(input: {
    projectId: ProjectId
    reviewRoundId: ReviewRoundId
    subjectType: 'concept_set' | 'concept'
    subjectId: string
    expectedRevision: number
    reasonCodes: readonly string[]
    reasonText: string
  }): Promise<ReviewDecision>
  revokeApproval(input: {
    projectId: ProjectId
    reviewRoundId: ReviewRoundId
    reasonText: string
    reasonCodes?: readonly string[]
  }): Promise<ReviewDecision>
  getApprovalValidity(projectId: ProjectId, reviewRoundId: ReviewRoundId): Promise<ApprovalValidity>
  previewDeliverable(input: {
    projectId: ProjectId
    reviewRoundId: ReviewRoundId
    audienceProfile: AudienceProfile
  }): Promise<DeliverablePreview>
  generateDeliverable(input: {
    projectId: ProjectId
    reviewRoundId: ReviewRoundId
    audienceProfile: AudienceProfile
    idempotencyKey?: string | null
  }): Promise<DesignDeliverable>
  listDeliverables(projectId: ProjectId): Promise<readonly DesignDeliverable[]>
  getDeliverable(projectId: ProjectId, deliverableId: DesignDeliverableId): Promise<DesignDeliverable>
  listDeliverableArtifacts(
    projectId: ProjectId,
    deliverableId: DesignDeliverableId,
  ): Promise<readonly ExportArtifactView[]>
  verifyDeliverable(
    projectId: ProjectId,
    deliverableId: DesignDeliverableId,
  ): Promise<{ readonly ok: boolean; readonly mismatches: readonly string[] }>
}

/** Owns the bare Fashion Design snapshots and commands. */
export class FashionDesignService extends Service implements FashionDesignClient {
  readonly briefs: ObservableSnapshot<DesignListState<DesignOpportunityBrief>>
  readonly conceptSets: ObservableSnapshot<DesignListState<ConceptSet>>
  readonly concepts: ObservableSnapshot<DesignListState<DesignConcept>>

  /**
   * @param ctx - Client context.
   * @param model - Snapshot + Remote model.
   */
  constructor(
    ctx: Context,
    private readonly model: ClientFashionDesignModel,
  ) {
    super(ctx, 'fashionDesign')
    this.briefs = model.briefs
    this.conceptSets = model.conceptSets
    this.concepts = model.concepts
  }

  /** @param projectId - Owning project. */
  loadWorkspace(projectId: ProjectId): Promise<void> {
    return this.model.loadWorkspace(projectId)
  }

  /** @param request - create brief. */
  async createBriefFromOpportunity(request: CreateBriefFromOpportunityRequest): Promise<DesignOpportunityBrief> {
    try {
      return await this.model.createBriefFromOpportunity(request)
    } catch (error) {
      throw wrap(error)
    }
  }

  /** @param request - get brief. */
  async getBrief(request: GetBriefRequest): Promise<DesignOpportunityBrief> {
    try {
      return await this.model.getBrief(request)
    } catch (error) {
      throw wrap(error)
    }
  }

  /** @param request - confirm brief. */
  async confirmBrief(request: ConfirmBriefRequest): Promise<DesignOpportunityBrief> {
    try {
      return await this.model.confirmBrief(request)
    } catch (error) {
      throw wrap(error)
    }
  }

  /** @param request - create concept set. */
  async createConceptSet(request: CreateConceptSetRequest): Promise<ConceptSet> {
    try {
      return await this.model.createConceptSet(request)
    } catch (error) {
      throw wrap(error)
    }
  }

  /** @param request - get concept set. */
  async getConceptSet(request: GetConceptSetRequest): Promise<ConceptSet> {
    try {
      return await this.model.getConceptSet(request)
    } catch (error) {
      throw wrap(error)
    }
  }

  /** @param request - mark review ready. */
  async markConceptSetReviewReady(request: MarkConceptSetReviewReadyRequest): Promise<ConceptSet> {
    try {
      return await this.model.markConceptSetReviewReady(request)
    } catch (error) {
      throw wrap(error)
    }
  }

  /** @param request - create concept. */
  async createConcept(request: CreateConceptRequest): Promise<DesignConcept> {
    try {
      return await this.model.createConcept(request)
    } catch (error) {
      throw wrap(error)
    }
  }

  /** @param request - revise concept. */
  async reviseConcept(request: ReviseConceptRequest): Promise<DesignConcept> {
    try {
      return await this.model.reviseConcept(request)
    } catch (error) {
      throw wrap(error)
    }
  }

  /** @param request - get concept. */
  async getConcept(request: GetConceptRequest): Promise<DesignConcept> {
    try {
      return await this.model.getConcept(request)
    } catch (error) {
      throw wrap(error)
    }
  }

  /** @param request - evaluate differentiation. */
  async evaluateDifferentiation(request: EvaluateDifferentiationRequest): Promise<DifferentiationCheck> {
    try {
      return await this.model.evaluateDifferentiation(request)
    } catch (error) {
      throw wrap(error)
    }
  }

  /** @param request - evaluate readiness. */
  async evaluateReadiness(request: EvaluateReadinessRequest): Promise<ReadinessCheck> {
    try {
      return await this.model.evaluateReadiness(request)
    } catch (error) {
      throw wrap(error)
    }
  }

  /** @param request - get visual draft. */
  async getVisualDraft(request: GetVisualDraftRequest): Promise<VisualDraft> {
    try {
      return await this.model.getVisualDraft(request)
    } catch (error) {
      throw wrap(error)
    }
  }

  /** @param request - list visual drafts. */
  async listVisualDrafts(request: ListVisualDraftsRequest): Promise<readonly VisualDraft[]> {
    try {
      return await this.model.listVisualDrafts(request)
    } catch (error) {
      throw wrap(error)
    }
  }

  /** @param input - open review. */
  async openReview(input: {
    projectId: ProjectId
    conceptSetId: ConceptSetId
    expectedConceptSetRevision: number
    idempotencyKey?: string | null
  }): Promise<ReviewRound> {
    try {
      return await this.model.openReview(input)
    } catch (error) {
      throw wrap(error)
    }
  }

  /** @param projectId - Project. */
  async listReviews(projectId: ProjectId): Promise<readonly ReviewRound[]> {
    try {
      return await this.model.listReviews({ projectId })
    } catch (error) {
      throw wrap(error)
    }
  }

  /** @param projectId - Project. @param reviewRoundId - Round. */
  async getReview(projectId: ProjectId, reviewRoundId: ReviewRoundId): Promise<ReviewRound> {
    try {
      return await this.model.getReview({ projectId, reviewRoundId })
    } catch (error) {
      throw wrap(error)
    }
  }

  /** @param input - select concept. */
  async selectConcept(input: {
    projectId: ProjectId
    reviewRoundId: ReviewRoundId
    conceptId: DesignConceptId
    expectedConceptRevision: number
    reasonCodes: readonly string[]
    reasonText?: string | null
  }): Promise<ReviewDecision> {
    try {
      return await this.model.selectConcept(input)
    } catch (error) {
      throw wrap(error)
    }
  }

  /** @param input - approve selected. */
  async approveSelectedConcept(input: {
    projectId: ProjectId
    reviewRoundId: ReviewRoundId
    reasonCodes: readonly string[]
    reasonText?: string | null
  }): Promise<ReviewDecision> {
    try {
      return await this.model.approveSelectedConcept(input)
    } catch (error) {
      throw wrap(error)
    }
  }

  /** @param input - request revision. */
  async requestConceptRevision(input: {
    projectId: ProjectId
    reviewRoundId: ReviewRoundId
    subjectType: 'concept_set' | 'concept'
    subjectId: string
    expectedRevision: number
    reasonCodes: readonly string[]
    reasonText: string
  }): Promise<ReviewDecision> {
    try {
      return await this.model.requestConceptRevision(input)
    } catch (error) {
      throw wrap(error)
    }
  }

  /** @param input - reject. */
  async rejectConceptOrSet(input: {
    projectId: ProjectId
    reviewRoundId: ReviewRoundId
    subjectType: 'concept_set' | 'concept'
    subjectId: string
    expectedRevision: number
    reasonCodes: readonly string[]
    reasonText: string
  }): Promise<ReviewDecision> {
    try {
      return await this.model.rejectConceptOrSet(input)
    } catch (error) {
      throw wrap(error)
    }
  }

  /** @param input - needs research. */
  async requestMoreResearch(input: {
    projectId: ProjectId
    reviewRoundId: ReviewRoundId
    subjectType: 'concept_set' | 'concept'
    subjectId: string
    expectedRevision: number
    reasonCodes: readonly string[]
    reasonText: string
  }): Promise<ReviewDecision> {
    try {
      return await this.model.requestMoreResearch(input)
    } catch (error) {
      throw wrap(error)
    }
  }

  /** @param input - revoke approval. */
  async revokeApproval(input: {
    projectId: ProjectId
    reviewRoundId: ReviewRoundId
    reasonText: string
    reasonCodes?: readonly string[]
  }): Promise<ReviewDecision> {
    try {
      return await this.model.revokeApproval(input)
    } catch (error) {
      throw wrap(error)
    }
  }

  /** @param projectId - Project. @param reviewRoundId - Round. */
  async getApprovalValidity(projectId: ProjectId, reviewRoundId: ReviewRoundId): Promise<ApprovalValidity> {
    try {
      return await this.model.getApprovalValidity({ projectId, reviewRoundId })
    } catch (error) {
      throw wrap(error)
    }
  }

  /** @param input - preview. */
  async previewDeliverable(input: {
    projectId: ProjectId
    reviewRoundId: ReviewRoundId
    audienceProfile: AudienceProfile
  }): Promise<DeliverablePreview> {
    try {
      return await this.model.previewDeliverable(input)
    } catch (error) {
      throw wrap(error)
    }
  }

  /** @param input - generate. */
  async generateDeliverable(input: {
    projectId: ProjectId
    reviewRoundId: ReviewRoundId
    audienceProfile: AudienceProfile
    idempotencyKey?: string | null
  }): Promise<DesignDeliverable> {
    try {
      return await this.model.generateDeliverable(input)
    } catch (error) {
      throw wrap(error)
    }
  }

  /** @param projectId - Project. */
  async listDeliverables(projectId: ProjectId): Promise<readonly DesignDeliverable[]> {
    try {
      return await this.model.listDeliverables({ projectId })
    } catch (error) {
      throw wrap(error)
    }
  }

  /** @param projectId - Project. @param deliverableId - Deliverable. */
  async getDeliverable(projectId: ProjectId, deliverableId: DesignDeliverableId): Promise<DesignDeliverable> {
    try {
      return await this.model.getDeliverable({ projectId, deliverableId })
    } catch (error) {
      throw wrap(error)
    }
  }

  /** @param projectId - Project. @param deliverableId - Deliverable. */
  async listDeliverableArtifacts(
    projectId: ProjectId,
    deliverableId: DesignDeliverableId,
  ): Promise<readonly ExportArtifactView[]> {
    try {
      return await this.model.listDeliverableArtifacts({ projectId, deliverableId })
    } catch (error) {
      throw wrap(error)
    }
  }

  /** @param projectId - Project. @param deliverableId - Deliverable. */
  async verifyDeliverable(
    projectId: ProjectId,
    deliverableId: DesignDeliverableId,
  ): Promise<{ readonly ok: boolean; readonly mismatches: readonly string[] }> {
    try {
      return await this.model.verifyDeliverable({ projectId, deliverableId })
    } catch (error) {
      throw wrap(error)
    }
  }
}

function wrap(error: unknown): never {
  if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
    throw new FashionDesignCommandError(error as RemoteFailure)
  }
  throw error
}
