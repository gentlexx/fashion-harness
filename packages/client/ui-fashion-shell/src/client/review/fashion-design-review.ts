/**
 * F3-02 review/deliverable methods expected on {@link Context.fashionDesign}
 * once the Remote projection lands.
 */
import type { ProjectId } from '@gentlexx/dsh-fashion-project/types'
import type {
  ApprovalValidity,
  AudienceProfile,
  ConceptSetId,
  DesignConceptId,
  DesignDeliverable,
  DesignDeliverableId,
  ExportArtifactView,
  ReviewRound,
  ReviewRoundId,
} from '@gentlexx/dsh-fashion-design/types'

/** Extended Fashion Design client face for review and deliverables. */
export interface FashionDesignReviewClient {
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
  }): Promise<unknown>
  approveSelectedConcept(input: {
    projectId: ProjectId
    reviewRoundId: ReviewRoundId
    reasonCodes: readonly string[]
    reasonText?: string | null
  }): Promise<unknown>
  getApprovalValidity(projectId: ProjectId, reviewRoundId: ReviewRoundId): Promise<ApprovalValidity>
  previewDeliverable(input: {
    projectId: ProjectId
    reviewRoundId: ReviewRoundId
    audienceProfile: AudienceProfile
  }): Promise<unknown>
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
