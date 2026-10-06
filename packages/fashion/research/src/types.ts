/**
 * Public type vocabulary of the Fashion Research domain.
 * Types only — factories and errors live in runtime modules.
 * @module @gentlexx/dsh-fashion-research/src/types
 */

import type { Branded } from '@deepseek-ai/dsh-brand'
import type { ProjectId } from '@gentlexx/dsh-fashion-project/types'
import type {} from '@deepseek-ai/dsh-typert-protocol'

/** Stable Research Task identity; never a SessionId or ProjectId. */
export type ResearchTaskId = Branded<'FashionResearchTaskId'>

/** Stable Source identity within a research task. */
export type SourceId = Branded<'FashionSourceId'>

/** Stable Sample identity within a research task. */
export type SampleId = Branded<'FashionSampleId'>

/** Stable Evidence identity within a research task. */
export type EvidenceId = Branded<'FashionEvidenceId'>

/** Opaque attachment content reference; not a filesystem path or Session receipt. */
export type AttachmentRef = Branded<'FashionResearchAttachmentRef'>

/**
 * Actor that created or mutated a research object.
 * Without accounts, Host uses `local-human` or `system-seed` only.
 */
export type ActorRef = 'local-human' | 'system-seed'

/** How a research object entered durable storage. Agent write origin is not open in v0. */
export type ResearchOrigin = 'human' | 'import' | 'system_seed'

/** Whether a research object may be mutated by ordinary Host writes. */
export type ResearchAccessMode = 'editable' | 'read-only'

/** ResearchTask lifecycle; `closed` stops intake and does not imply a trend conclusion. */
export type ResearchTaskStatus =
  | 'draft'
  | 'active'
  | 'ready_for_review'
  | 'closed'
  | 'archived'

/** Source locator discriminant. */
export type SourceLocatorType = 'url' | 'attachment'

/** Coarse source kind; labels stay open text pending R1 calibration. */
export type SourceKind =
  | 'web_page'
  | 'report'
  | 'product_page'
  | 'category_page'
  | 'editorial'
  | 'social_content'
  | 'internal_file'
  | 'other'

/** How the source bytes or URL were captured. */
export type CaptureMode = 'manual_link' | 'manual_upload' | 'recorded_public_web'

/** Copyright / reuse boundary recorded at registration. */
export type UsageBoundary = 'public_attributed' | 'project_private' | 'view_only'

/** Whether external processing of source content is permitted. */
export type ExternalProcessing = 'allowed' | 'denied' | 'requires_approval'

/**
 * Locator availability recorded at registration or later human correction.
 * This is not a live fetch of the URL: `available` means the source was
 * registered as reachable, not that a current request succeeds.
 */
export type AvailabilityStatus = 'available' | 'unavailable' | 'removed'

/** Sample retention status; `confirmed` means keep the sample, not that it is popular. */
export type SampleStatus =
  | 'draft'
  | 'ready_for_review'
  | 'confirmed'
  | 'rejected'
  | 'archived'

/** Evidence review workflow status. */
export type EvidenceReviewStatus =
  | 'draft'
  | 'pending_review'
  | 'confirmed'
  | 'rejected'
  | 'invalidated'

/** Claim epistemology; kept separate from {@link EvidenceGrade}. */
export type ClaimType = 'observed' | 'derived' | 'needs_validation'

/**
 * Evidence maturity grade from domain contract 28.
 * F2-01 does not mint G4; local human confirm does not masquerade as G3.
 */
export type EvidenceGrade = 'G0' | 'G1' | 'G2' | 'G3' | 'G4'

/** Evidence subject discriminant. */
export type EvidenceSubjectType = 'source' | 'sample'

/** One raw name/value observation retained as source wording. */
export interface RawField {
  readonly name: string
  readonly value: string
  readonly unit?: string
}

/** Current schema generation stamped on every durable research row. */
export const FASHION_RESEARCH_SCHEMA_VERSION = 0

/** Shared durable envelope fields present on every research object. */
export interface ResearchEnvelope {
  readonly projectId: ProjectId
  readonly origin: ResearchOrigin
  readonly accessMode: ResearchAccessMode
  readonly revision: number
  readonly createdAt: string
  readonly updatedAt: string
  readonly createdBy: ActorRef
  readonly updatedBy: ActorRef
  readonly schemaVersion: typeof FASHION_RESEARCH_SCHEMA_VERSION
  readonly archivedAt: string | null
}

/** Authoritative ResearchTask projection. */
export interface ResearchTask extends ResearchEnvelope {
  readonly id: ResearchTaskId
  readonly title: string
  readonly note: string | null
  readonly status: ResearchTaskStatus
}

/** Authoritative Source projection. */
export interface Source extends ResearchEnvelope {
  readonly id: SourceId
  readonly taskId: ResearchTaskId
  readonly locatorType: SourceLocatorType
  readonly url: string | null
  readonly urlNormalized: string | null
  readonly attachmentRef: AttachmentRef | null
  readonly title: string
  readonly publisherOrPlatform: string | null
  readonly sourceKind: SourceKind
  readonly accessedAt: string
  readonly publishedAt: string | null
  readonly captureMode: CaptureMode
  readonly usageBoundary: UsageBoundary
  readonly externalProcessing: ExternalProcessing
  readonly availabilityStatus: AvailabilityStatus
  readonly attribution: string
  readonly contentFingerprint: string | null
}

/** Authoritative Sample projection. */
export interface Sample extends ResearchEnvelope {
  readonly id: SampleId
  readonly taskId: ResearchTaskId
  readonly sourceId: SourceId
  readonly label: string
  readonly externalItemId: string | null
  readonly locator: string | null
  readonly observedAt: string
  readonly rawFields: readonly RawField[]
  readonly screenshotRefs: readonly AttachmentRef[]
  readonly note: string | null
  readonly status: SampleStatus
}

/** Authoritative Evidence projection. */
export interface Evidence extends ResearchEnvelope {
  readonly id: EvidenceId
  readonly taskId: ResearchTaskId
  readonly subjectType: EvidenceSubjectType
  readonly subjectId: SourceId | SampleId
  readonly excerpt: string | null
  readonly observation: string
  readonly claim: string | null
  readonly claimType: ClaimType | null
  readonly evidenceGrade: EvidenceGrade
  readonly method: string | null
  readonly limitations: readonly string[]
  readonly reviewStatus: EvidenceReviewStatus
  readonly reviewedBy: ActorRef | null
  readonly reviewedAt: string | null
  readonly reviewNote: string | null
}

declare module '@deepseek-ai/dsh-typert-protocol' {
  interface RemoteErrorDetailsMap {
    'fashion-research/project-not-found': { readonly projectId: ProjectId }
    'fashion-research/task-not-found': { readonly taskId: ResearchTaskId }
    'fashion-research/source-not-found': { readonly sourceId: SourceId }
    'fashion-research/sample-not-found': { readonly sampleId: SampleId }
    'fashion-research/evidence-not-found': { readonly evidenceId: EvidenceId }
    'fashion-research/project-read-only': { readonly projectId: ProjectId }
    'fashion-research/cross-project-reference': {
      readonly projectId: ProjectId
      readonly otherProjectId: ProjectId
    }
    'fashion-research/cross-task-reference': {
      readonly taskId: ResearchTaskId
      readonly otherTaskId: ResearchTaskId
    }
    'fashion-research/invalid-url': { readonly url: string }
    'fashion-research/invalid-input': { readonly reason: string }
    'fashion-research/invalid-transition': { readonly reason: string }
    'fashion-research/revision-conflict': {
      readonly id: string
      readonly expectedRevision: number
      readonly actualRevision: number
    }
    'fashion-research/attachment-invalid': { readonly reason: string }
    'fashion-research/usage-boundary-denied': { readonly reason: string }
    'fashion-research/seed-conflict': { readonly projectId: ProjectId }
  }
}
