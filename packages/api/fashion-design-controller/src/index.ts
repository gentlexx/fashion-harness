/**
 * Host Fashion Design Remote owner.
 * @module @gentlexx/dsh-api-fashion-design-controller
 */

import { Context } from '@deepseek-ai/cordis'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { FashionDesignCommands } from './commands.ts'
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

export type * from './types.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Host Fashion Design business API and Remote namespace owner. */
    fashionDesignController: FashionDesignController
  }
}

/** Host service backing the generated `ctx.remote.fashionDesign` namespace. */
export class FashionDesignController extends TypertRemoteService {
  static inject = ['typert', 'fashionDesignRegistry']

  private readonly commands: FashionDesignCommands

  /** @param ctx - Host context containing the Fashion Design registry. */
  constructor(ctx: Context) {
    super(ctx, 'fashionDesignController', { namespace: 'fashionDesign' })
    this.commands = new FashionDesignCommands(ctx)
  }

  /** @param request - workspace scope. */
  @Remote('loadWorkspace')
  loadWorkspace(request: DesignScopeRequest): DesignWorkspaceValue {
    return this.commands.loadWorkspace(request)
  }

  /** @param request - create brief. */
  @Remote('createBriefFromOpportunity')
  createBriefFromOpportunity(request: CreateBriefFromOpportunityRequest): Promise<BriefValue> {
    return this.commands.createBriefFromOpportunity(request)
  }

  /** @param request - get brief. */
  @Remote('getBrief')
  getBrief(request: GetBriefRequest): BriefValue {
    return this.commands.getBrief(request)
  }

  /** @param request - confirm brief. */
  @Remote('confirmBrief')
  confirmBrief(request: ConfirmBriefRequest): Promise<BriefValue> {
    return this.commands.confirmBrief(request)
  }

  /** @param request - create concept set. */
  @Remote('createConceptSet')
  createConceptSet(request: CreateConceptSetRequest): Promise<ConceptSetValue> {
    return this.commands.createConceptSet(request)
  }

  /** @param request - get concept set. */
  @Remote('getConceptSet')
  getConceptSet(request: GetConceptSetRequest): ConceptSetValue {
    return this.commands.getConceptSet(request)
  }

  /** @param request - mark review ready. */
  @Remote('markConceptSetReviewReady')
  markConceptSetReviewReady(request: MarkConceptSetReviewReadyRequest): Promise<ConceptSetValue> {
    return this.commands.markConceptSetReviewReady(request)
  }

  /** @param request - create concept. */
  @Remote('createConcept')
  createConcept(request: CreateConceptRequest): Promise<ConceptValue> {
    return this.commands.createConcept(request)
  }

  /** @param request - revise concept. */
  @Remote('reviseConcept')
  reviseConcept(request: ReviseConceptRequest): Promise<ConceptValue> {
    return this.commands.reviseConcept(request)
  }

  /** @param request - get concept. */
  @Remote('getConcept')
  getConcept(request: GetConceptRequest): ConceptValue {
    return this.commands.getConcept(request)
  }

  /** @param request - evaluate differentiation. */
  @Remote('evaluateDifferentiation')
  evaluateDifferentiation(request: EvaluateDifferentiationRequest): DifferentiationCheck {
    return this.commands.evaluateDifferentiation(request)
  }

  /** @param request - evaluate readiness. */
  @Remote('evaluateReadiness')
  evaluateReadiness(request: EvaluateReadinessRequest): ReadinessCheck {
    return this.commands.evaluateReadiness(request)
  }

  /** @param request - get visual draft. */
  @Remote('getVisualDraft')
  getVisualDraft(request: GetVisualDraftRequest): VisualDraftValue {
    return this.commands.getVisualDraft(request)
  }

  /** @param request - list visual drafts. */
  @Remote('listVisualDrafts')
  listVisualDrafts(request: ListVisualDraftsRequest): readonly VisualDraftValue[] {
    return this.commands.listVisualDrafts(request)
  }

  /** @param request - open review. */
  @Remote('openReview')
  openReview(request: OpenReviewRequest): Promise<ReviewRoundValue> {
    return this.commands.openReview(request)
  }

  /** @param request - get review. */
  @Remote('getReview')
  getReview(request: GetReviewRequest): ReviewRoundValue {
    return this.commands.getReview(request)
  }

  /** @param request - list reviews. */
  @Remote('listReviews')
  listReviews(request: DesignScopeRequest): readonly ReviewRoundValue[] {
    return this.commands.listReviews(request)
  }

  /** @param request - select concept. */
  @Remote('selectConcept')
  selectConcept(request: SelectConceptRequest): Promise<ReviewDecisionValue> {
    return this.commands.selectConcept(request)
  }

  /** @param request - approve selected. */
  @Remote('approveSelectedConcept')
  approveSelectedConcept(request: ApproveSelectedConceptRequest): Promise<ReviewDecisionValue> {
    return this.commands.approveSelectedConcept(request)
  }

  /** @param request - request revision. */
  @Remote('requestConceptRevision')
  requestConceptRevision(request: CloseReviewDecisionRequest): Promise<ReviewDecisionValue> {
    return this.commands.requestConceptRevision(request)
  }

  /** @param request - reject. */
  @Remote('rejectConceptOrSet')
  rejectConceptOrSet(request: CloseReviewDecisionRequest): Promise<ReviewDecisionValue> {
    return this.commands.rejectConceptOrSet(request)
  }

  /** @param request - needs research. */
  @Remote('requestMoreResearch')
  requestMoreResearch(request: CloseReviewDecisionRequest): Promise<ReviewDecisionValue> {
    return this.commands.requestMoreResearch(request)
  }

  /** @param request - revoke approval. */
  @Remote('revokeApproval')
  revokeApproval(request: RevokeApprovalRequest): Promise<ReviewDecisionValue> {
    return this.commands.revokeApproval(request)
  }

  /** @param request - approval validity. */
  @Remote('getApprovalValidity')
  getApprovalValidity(request: GetReviewRequest): Promise<ApprovalValidityValue> {
    return this.commands.getApprovalValidity(request)
  }

  /** @param request - preview deliverable. */
  @Remote('previewDeliverable')
  previewDeliverable(request: GenerateDeliverableRequest): Promise<DeliverablePreviewValue> {
    return this.commands.previewDeliverable(request)
  }

  /** @param request - generate deliverable. */
  @Remote('generateDeliverable')
  generateDeliverable(request: GenerateDeliverableRequest): Promise<DesignDeliverableValue> {
    return this.commands.generateDeliverable(request)
  }

  /** @param request - get deliverable. */
  @Remote('getDeliverable')
  getDeliverable(request: GetDeliverableRequest): DesignDeliverableValue {
    return this.commands.getDeliverable(request)
  }

  /** @param request - list deliverables. */
  @Remote('listDeliverables')
  listDeliverables(request: DesignScopeRequest): readonly DesignDeliverableValue[] {
    return this.commands.listDeliverables(request)
  }

  /** @param request - list artifacts. */
  @Remote('listDeliverableArtifacts')
  listDeliverableArtifacts(request: GetDeliverableRequest): readonly ExportArtifactValue[] {
    return this.commands.listDeliverableArtifacts(request)
  }

  /** @param request - verify deliverable. */
  @Remote('verifyDeliverable')
  verifyDeliverable(request: GetDeliverableRequest): { readonly ok: boolean; readonly mismatches: readonly string[] } {
    return this.commands.verifyDeliverable(request)
  }
}

export default FashionDesignController
