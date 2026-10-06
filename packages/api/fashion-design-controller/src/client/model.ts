/**
 * Client Fashion Design workspace snapshot and Remote call model.
 * @module @gentlexx/dsh-api-fashion-design-controller/src/client/model
 */

import type {
  ConceptSet,
  DesignConcept,
  DesignOpportunityBrief,
} from '@gentlexx/dsh-fashion-design/types'
import type { ProjectId } from '@gentlexx/dsh-fashion-project/types'
import type { ObservableSnapshot } from '@deepseek-ai/dsh-client-store'
import { createSnapshotStore } from '@deepseek-ai/dsh-client-store'
import type { RemoteFailure, RemoteResult } from '@deepseek-ai/dsh-typert-protocol'
import { compareDesignUpdatedDesc } from './order.ts'
import type {
  BriefValue,
  ConfirmBriefRequest,
  ConceptSetValue,
  ConceptValue,
  CreateBriefFromOpportunityRequest,
  CreateConceptRequest,
  CreateConceptSetRequest,
  DesignScopeRequest,
  DesignWorkspaceValue,
  DifferentiationCheck,
  EvaluateDifferentiationRequest,
  EvaluateReadinessRequest,
  GetBriefRequest,
  GetConceptRequest,
  GetConceptSetRequest,
  GetVisualDraftRequest,
  ListVisualDraftsRequest,
  MarkConceptSetReviewReadyRequest,
  OpenReviewRequest,
  GetReviewRequest,
  SelectConceptRequest,
  ApproveSelectedConceptRequest,
  GenerateDeliverableRequest,
  GetDeliverableRequest,
  ReadinessCheck,
  ReviewRoundValue,
  ReviewDecisionValue,
  ApprovalValidityValue,
  CloseReviewDecisionRequest,
  DeliverablePreviewValue,
  DesignDeliverableValue,
  ExportArtifactValue,
  ReviseConceptRequest,
  RevokeApprovalRequest,
  VisualDraftValue,
} from '../types.ts'

/** Unary Fashion Design Remote namespace used by the Client model. */
export interface FashionDesignRemote {
  loadWorkspace(request: DesignScopeRequest): Promise<RemoteResult<DesignWorkspaceValue>>
  createBriefFromOpportunity(request: CreateBriefFromOpportunityRequest): Promise<RemoteResult<BriefValue>>
  getBrief(request: GetBriefRequest): Promise<RemoteResult<BriefValue>>
  confirmBrief(request: ConfirmBriefRequest): Promise<RemoteResult<BriefValue>>
  createConceptSet(request: CreateConceptSetRequest): Promise<RemoteResult<ConceptSetValue>>
  getConceptSet(request: GetConceptSetRequest): Promise<RemoteResult<ConceptSetValue>>
  markConceptSetReviewReady(request: MarkConceptSetReviewReadyRequest): Promise<RemoteResult<ConceptSetValue>>
  createConcept(request: CreateConceptRequest): Promise<RemoteResult<ConceptValue>>
  reviseConcept(request: ReviseConceptRequest): Promise<RemoteResult<ConceptValue>>
  getConcept(request: GetConceptRequest): Promise<RemoteResult<ConceptValue>>
  evaluateDifferentiation(request: EvaluateDifferentiationRequest): Promise<RemoteResult<DifferentiationCheck>>
  evaluateReadiness(request: EvaluateReadinessRequest): Promise<RemoteResult<ReadinessCheck>>
  getVisualDraft(request: GetVisualDraftRequest): Promise<RemoteResult<VisualDraftValue>>
  listVisualDrafts(request: ListVisualDraftsRequest): Promise<RemoteResult<readonly VisualDraftValue[]>>
  openReview(request: OpenReviewRequest): Promise<RemoteResult<ReviewRoundValue>>
  getReview(request: GetReviewRequest): Promise<RemoteResult<ReviewRoundValue>>
  listReviews(request: DesignScopeRequest): Promise<RemoteResult<readonly ReviewRoundValue[]>>
  selectConcept(request: SelectConceptRequest): Promise<RemoteResult<ReviewDecisionValue>>
  approveSelectedConcept(request: ApproveSelectedConceptRequest): Promise<RemoteResult<ReviewDecisionValue>>
  requestConceptRevision(request: CloseReviewDecisionRequest): Promise<RemoteResult<ReviewDecisionValue>>
  rejectConceptOrSet(request: CloseReviewDecisionRequest): Promise<RemoteResult<ReviewDecisionValue>>
  requestMoreResearch(request: CloseReviewDecisionRequest): Promise<RemoteResult<ReviewDecisionValue>>
  revokeApproval(request: RevokeApprovalRequest): Promise<RemoteResult<ReviewDecisionValue>>
  getApprovalValidity(request: GetReviewRequest): Promise<RemoteResult<ApprovalValidityValue>>
  previewDeliverable(request: GenerateDeliverableRequest): Promise<RemoteResult<DeliverablePreviewValue>>
  generateDeliverable(request: GenerateDeliverableRequest): Promise<RemoteResult<DesignDeliverableValue>>
  getDeliverable(request: GetDeliverableRequest): Promise<RemoteResult<DesignDeliverableValue>>
  listDeliverables(request: DesignScopeRequest): Promise<RemoteResult<readonly DesignDeliverableValue[]>>
  listDeliverableArtifacts(request: GetDeliverableRequest): Promise<RemoteResult<readonly ExportArtifactValue[]>>
  verifyDeliverable(request: GetDeliverableRequest): Promise<RemoteResult<{
    readonly ok: boolean
    readonly mismatches: readonly string[]
  }>>
}

/** List snapshot phases for design object collections. */
export type DesignListState<T> =
  | { readonly status: 'loading'; readonly items: readonly T[]; readonly error: null }
  | { readonly status: 'ready'; readonly items: readonly T[]; readonly error: null }
  | { readonly status: 'error'; readonly items: readonly T[]; readonly error: RemoteFailure }

/**
 * Owns Client Fashion Design workspace snapshots and unary Remote calls.
 */
export class ClientFashionDesignModel {
  private loadGeneration = 0
  private scopedProjectId: ProjectId | null = null

  private readonly briefStore = createSnapshotStore<DesignListState<DesignOpportunityBrief>>({
    status: 'loading', items: [], error: null,
  })
  private readonly conceptSetStore = createSnapshotStore<DesignListState<ConceptSet>>({
    status: 'loading', items: [], error: null,
  })
  private readonly conceptStore = createSnapshotStore<DesignListState<DesignConcept>>({
    status: 'loading', items: [], error: null,
  })

  /** @param remote - Fashion Design Remote namespace. */
  constructor(private readonly remote: FashionDesignRemote) {}

  /** Brief list snapshot. */
  get briefs(): ObservableSnapshot<DesignListState<DesignOpportunityBrief>> {
    return this.briefStore
  }

  /** ConceptSet list snapshot. */
  get conceptSets(): ObservableSnapshot<DesignListState<ConceptSet>> {
    return this.conceptSetStore
  }

  /** DesignConcept list snapshot. */
  get concepts(): ObservableSnapshot<DesignListState<DesignConcept>> {
    return this.conceptStore
  }

  /**
   * Load the complete design workspace for one Project.
   * @param projectId - Owning project.
   */
  async loadWorkspace(projectId: ProjectId): Promise<void> {
    const generation = ++this.loadGeneration
    this.scopedProjectId = projectId
    this.briefStore.set({ status: 'loading', items: this.briefStore.getSnapshot().items, error: null })
    this.conceptSetStore.set({
      status: 'loading',
      items: this.conceptSetStore.getSnapshot().items,
      error: null,
    })
    this.conceptStore.set({ status: 'loading', items: this.conceptStore.getSnapshot().items, error: null })
    const result = await this.remote.loadWorkspace({ projectId })
    if (generation !== this.loadGeneration || this.scopedProjectId !== projectId) return
    if (!result.ok) {
      this.briefStore.set({ status: 'error', items: [], error: result.error })
      this.conceptSetStore.set({ status: 'error', items: [], error: result.error })
      this.conceptStore.set({ status: 'error', items: [], error: result.error })
      return
    }
    const workspace = result.value
    this.briefStore.set({
      status: 'ready',
      items: [...workspace.briefs].sort(compareDesignUpdatedDesc),
      error: null,
    })
    this.conceptSetStore.set({
      status: 'ready',
      items: [...workspace.conceptSets].sort(compareDesignUpdatedDesc),
      error: null,
    })
    this.conceptStore.set({
      status: 'ready',
      items: [...workspace.concepts].sort(compareDesignUpdatedDesc),
      error: null,
    })
  }

  /** @param request - create brief. */
  async createBriefFromOpportunity(request: CreateBriefFromOpportunityRequest): Promise<BriefValue> {
    return unwrap(await this.remote.createBriefFromOpportunity(request))
  }

  /** @param request - get brief. */
  async getBrief(request: GetBriefRequest): Promise<BriefValue> {
    return unwrap(await this.remote.getBrief(request))
  }

  /** @param request - confirm brief. */
  async confirmBrief(request: ConfirmBriefRequest): Promise<BriefValue> {
    return unwrap(await this.remote.confirmBrief(request))
  }

  /** @param request - create concept set. */
  async createConceptSet(request: CreateConceptSetRequest): Promise<ConceptSetValue> {
    return unwrap(await this.remote.createConceptSet(request))
  }

  /** @param request - get concept set. */
  async getConceptSet(request: GetConceptSetRequest): Promise<ConceptSetValue> {
    return unwrap(await this.remote.getConceptSet(request))
  }

  /** @param request - mark review ready. */
  async markConceptSetReviewReady(request: MarkConceptSetReviewReadyRequest): Promise<ConceptSetValue> {
    return unwrap(await this.remote.markConceptSetReviewReady(request))
  }

  /** @param request - create concept. */
  async createConcept(request: CreateConceptRequest): Promise<ConceptValue> {
    return unwrap(await this.remote.createConcept(request))
  }

  /** @param request - revise concept. */
  async reviseConcept(request: ReviseConceptRequest): Promise<ConceptValue> {
    return unwrap(await this.remote.reviseConcept(request))
  }

  /** @param request - get concept. */
  async getConcept(request: GetConceptRequest): Promise<ConceptValue> {
    return unwrap(await this.remote.getConcept(request))
  }

  /** @param request - evaluate differentiation. */
  async evaluateDifferentiation(request: EvaluateDifferentiationRequest): Promise<DifferentiationCheck> {
    return unwrap(await this.remote.evaluateDifferentiation(request))
  }

  /** @param request - evaluate readiness. */
  async evaluateReadiness(request: EvaluateReadinessRequest): Promise<ReadinessCheck> {
    return unwrap(await this.remote.evaluateReadiness(request))
  }

  /** @param request - get visual draft. */
  async getVisualDraft(request: GetVisualDraftRequest): Promise<VisualDraftValue> {
    return unwrap(await this.remote.getVisualDraft(request))
  }

  /** @param request - list visual drafts. */
  async listVisualDrafts(request: ListVisualDraftsRequest): Promise<readonly VisualDraftValue[]> {
    return unwrap(await this.remote.listVisualDrafts(request))
  }

  /** @param request - open review. */
  async openReview(request: OpenReviewRequest): Promise<ReviewRoundValue> {
    return unwrap(await this.remote.openReview(request))
  }

  /** @param request - get review. */
  async getReview(request: GetReviewRequest): Promise<ReviewRoundValue> {
    return unwrap(await this.remote.getReview(request))
  }

  /** @param request - list reviews. */
  async listReviews(request: DesignScopeRequest): Promise<readonly ReviewRoundValue[]> {
    return unwrap(await this.remote.listReviews(request))
  }

  /** @param request - select concept. */
  async selectConcept(request: SelectConceptRequest): Promise<ReviewDecisionValue> {
    return unwrap(await this.remote.selectConcept(request))
  }

  /** @param request - approve selected. */
  async approveSelectedConcept(request: ApproveSelectedConceptRequest): Promise<ReviewDecisionValue> {
    return unwrap(await this.remote.approveSelectedConcept(request))
  }

  /** @param request - request revision. */
  async requestConceptRevision(request: CloseReviewDecisionRequest): Promise<ReviewDecisionValue> {
    return unwrap(await this.remote.requestConceptRevision(request))
  }

  /** @param request - reject. */
  async rejectConceptOrSet(request: CloseReviewDecisionRequest): Promise<ReviewDecisionValue> {
    return unwrap(await this.remote.rejectConceptOrSet(request))
  }

  /** @param request - needs research. */
  async requestMoreResearch(request: CloseReviewDecisionRequest): Promise<ReviewDecisionValue> {
    return unwrap(await this.remote.requestMoreResearch(request))
  }

  /** @param request - revoke approval. */
  async revokeApproval(request: RevokeApprovalRequest): Promise<ReviewDecisionValue> {
    return unwrap(await this.remote.revokeApproval(request))
  }

  /** @param request - approval validity. */
  async getApprovalValidity(request: GetReviewRequest): Promise<ApprovalValidityValue> {
    return unwrap(await this.remote.getApprovalValidity(request))
  }

  /** @param request - preview deliverable. */
  async previewDeliverable(request: GenerateDeliverableRequest): Promise<DeliverablePreviewValue> {
    return unwrap(await this.remote.previewDeliverable(request))
  }

  /** @param request - generate deliverable. */
  async generateDeliverable(request: GenerateDeliverableRequest): Promise<DesignDeliverableValue> {
    return unwrap(await this.remote.generateDeliverable(request))
  }

  /** @param request - get deliverable. */
  async getDeliverable(request: GetDeliverableRequest): Promise<DesignDeliverableValue> {
    return unwrap(await this.remote.getDeliverable(request))
  }

  /** @param request - list deliverables. */
  async listDeliverables(request: DesignScopeRequest): Promise<readonly DesignDeliverableValue[]> {
    return unwrap(await this.remote.listDeliverables(request))
  }

  /** @param request - list artifacts. */
  async listDeliverableArtifacts(request: GetDeliverableRequest): Promise<readonly ExportArtifactValue[]> {
    return unwrap(await this.remote.listDeliverableArtifacts(request))
  }

  /** @param request - verify deliverable. */
  async verifyDeliverable(request: GetDeliverableRequest): Promise<{
    readonly ok: boolean
    readonly mismatches: readonly string[]
  }> {
    return unwrap(await this.remote.verifyDeliverable(request))
  }
}

function unwrap<T>(result: RemoteResult<T>): T {
  if (!result.ok) throw result.error
  return result.value
}
