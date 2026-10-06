import { brandString } from '@deepseek-ai/dsh-brand'
import type {
  ApprovalInvalidationId,
  ConceptSetId,
  DeliverableSnapshotId,
  DesignArtifactId,
  DesignBriefId,
  DesignConceptId,
  DesignDeliverableId,
  ExportArtifactId,
  ReviewDecisionId,
  ReviewRoundId,
  SourceManifestId,
  VisualDraftId,
} from './types.ts'

/** @param id - Raw brief id. @returns branded DesignBriefId. */
export function DesignBriefId(id: string): DesignBriefId {
  return brandString<DesignBriefId>(id)
}

/** @param id - Raw concept set id. @returns branded ConceptSetId. */
export function ConceptSetId(id: string): ConceptSetId {
  return brandString<ConceptSetId>(id)
}

/** @param id - Raw concept id. @returns branded DesignConceptId. */
export function DesignConceptId(id: string): DesignConceptId {
  return brandString<DesignConceptId>(id)
}

/** @param id - Raw visual draft id. @returns branded VisualDraftId. */
export function VisualDraftId(id: string): VisualDraftId {
  return brandString<VisualDraftId>(id)
}

/** @param id - Raw artifact id. @returns branded DesignArtifactId. */
export function DesignArtifactId(id: string): DesignArtifactId {
  return brandString<DesignArtifactId>(id)
}

/** @param id - Raw review round id. @returns branded ReviewRoundId. */
export function ReviewRoundId(id: string): ReviewRoundId {
  return brandString<ReviewRoundId>(id)
}

/** @param id - Raw review decision id. @returns branded ReviewDecisionId. */
export function ReviewDecisionId(id: string): ReviewDecisionId {
  return brandString<ReviewDecisionId>(id)
}

/** @param id - Raw approval invalidation id. @returns branded ApprovalInvalidationId. */
export function ApprovalInvalidationId(id: string): ApprovalInvalidationId {
  return brandString<ApprovalInvalidationId>(id)
}

/** @param id - Raw deliverable snapshot id. @returns branded DeliverableSnapshotId. */
export function DeliverableSnapshotId(id: string): DeliverableSnapshotId {
  return brandString<DeliverableSnapshotId>(id)
}

/** @param id - Raw source manifest id. @returns branded SourceManifestId. */
export function SourceManifestId(id: string): SourceManifestId {
  return brandString<SourceManifestId>(id)
}

/** @param id - Raw design deliverable id. @returns branded DesignDeliverableId. */
export function DesignDeliverableId(id: string): DesignDeliverableId {
  return brandString<DesignDeliverableId>(id)
}

/** @param id - Raw export artifact id. @returns branded ExportArtifactId. */
export function ExportArtifactId(id: string): ExportArtifactId {
  return brandString<ExportArtifactId>(id)
}
