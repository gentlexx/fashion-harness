/**
 * Wire types for the Fashion Research Remote namespace.
 * @module @gentlexx/dsh-api-fashion-research-controller/src/types
 */

import type { ProjectId } from '@gentlexx/dsh-fashion-project/types'
import type {
  AvailabilityStatus,
  CaptureMode,
  ClaimType,
  Evidence,
  EvidenceGrade,
  EvidenceId,
  EvidenceReviewStatus,
  EvidenceSubjectType,
  ExternalProcessing,
  RawField,
  ResearchTask,
  ResearchTaskId,
  ResearchTaskStatus,
  Sample,
  SampleId,
  SampleStatus,
  Source,
  SourceId,
  SourceKind,
  SourceLocatorType,
  UsageBoundary,
} from '@gentlexx/dsh-fashion-research/types'

export type {
  Evidence,
  EvidenceId,
  ProjectId,
  ResearchTask,
  ResearchTaskId,
  Sample,
  SampleId,
  Source,
  SourceId,
}

/** Create ResearchTask request. */
export interface CreateTaskRequest {
  readonly projectId: ProjectId
  readonly title: string
  readonly note?: string | null
}

/** Update ResearchTask request. */
export interface UpdateTaskRequest {
  readonly projectId: ProjectId
  readonly taskId: ResearchTaskId
  readonly expectedRevision: number
  readonly title?: string
  readonly note?: string | null
  readonly status?: ResearchTaskStatus
}

/** Archive ResearchTask request. */
export interface ArchiveTaskRequest {
  readonly projectId: ProjectId
  readonly taskId: ResearchTaskId
  readonly expectedRevision: number
}

/** Get ResearchTask request. */
export interface GetTaskRequest {
  readonly projectId: ProjectId
  readonly taskId: ResearchTaskId
}

/** List ResearchTasks request. */
export interface ListTasksRequest {
  readonly projectId: ProjectId
}

/** Create Source request. */
export interface CreateSourceRequest {
  readonly projectId: ProjectId
  readonly taskId: ResearchTaskId
  readonly locatorType: SourceLocatorType
  readonly url?: string
  readonly attachmentRef?: string
  readonly title: string
  readonly publisherOrPlatform?: string | null
  readonly sourceKind: SourceKind
  readonly publishedAt?: string | null
  readonly captureMode: CaptureMode
  readonly usageBoundary: UsageBoundary
  readonly externalProcessing: ExternalProcessing
  readonly availabilityStatus?: AvailabilityStatus
  readonly attribution: string
  readonly contentFingerprint?: string | null
}

/** Update Source request. */
export interface UpdateSourceRequest {
  readonly projectId: ProjectId
  readonly taskId: ResearchTaskId
  readonly sourceId: SourceId
  readonly expectedRevision: number
  readonly title?: string
  readonly publisherOrPlatform?: string | null
  readonly availabilityStatus?: AvailabilityStatus
  readonly attribution?: string
}

/** Archive Source request. */
export interface ArchiveSourceRequest {
  readonly projectId: ProjectId
  readonly taskId: ResearchTaskId
  readonly sourceId: SourceId
  readonly expectedRevision: number
}

/** Get Source request. */
export interface GetSourceRequest {
  readonly projectId: ProjectId
  readonly taskId: ResearchTaskId
  readonly sourceId: SourceId
}

/** List Sources request. */
export interface ListSourcesRequest {
  readonly projectId: ProjectId
  readonly taskId: ResearchTaskId
}

/** Create Sample request. */
export interface CreateSampleRequest {
  readonly projectId: ProjectId
  readonly taskId: ResearchTaskId
  readonly sourceId: SourceId
  readonly label: string
  readonly externalItemId?: string | null
  readonly locator?: string | null
  readonly rawFields?: readonly RawField[]
  readonly screenshotRefs?: readonly string[]
  readonly note?: string | null
  readonly status?: SampleStatus
}

/** Update Sample request. */
export interface UpdateSampleRequest {
  readonly projectId: ProjectId
  readonly taskId: ResearchTaskId
  readonly sampleId: SampleId
  readonly expectedRevision: number
  readonly label?: string
  readonly note?: string | null
  readonly status?: SampleStatus
  readonly rawFields?: readonly RawField[]
}

/** Archive Sample request. */
export interface ArchiveSampleRequest {
  readonly projectId: ProjectId
  readonly taskId: ResearchTaskId
  readonly sampleId: SampleId
  readonly expectedRevision: number
}

/** Get Sample request. */
export interface GetSampleRequest {
  readonly projectId: ProjectId
  readonly taskId: ResearchTaskId
  readonly sampleId: SampleId
}

/** List Samples request. */
export interface ListSamplesRequest {
  readonly projectId: ProjectId
  readonly taskId: ResearchTaskId
}

/** Create Evidence request. */
export interface CreateEvidenceRequest {
  readonly projectId: ProjectId
  readonly taskId: ResearchTaskId
  readonly subjectType: EvidenceSubjectType
  readonly subjectId: SourceId | SampleId
  readonly excerpt?: string | null
  readonly observation: string
  readonly claim?: string | null
  readonly claimType?: ClaimType | null
  readonly evidenceGrade: EvidenceGrade
  readonly method?: string | null
  readonly limitations?: readonly string[]
}

/** Update Evidence request. */
export interface UpdateEvidenceRequest {
  readonly projectId: ProjectId
  readonly taskId: ResearchTaskId
  readonly evidenceId: EvidenceId
  readonly expectedRevision: number
  readonly excerpt?: string | null
  readonly observation?: string
  readonly claim?: string | null
  readonly claimType?: ClaimType | null
  readonly evidenceGrade?: EvidenceGrade
  readonly method?: string | null
  readonly limitations?: readonly string[]
}

/** Archive Evidence request. */
export interface ArchiveEvidenceRequest {
  readonly projectId: ProjectId
  readonly taskId: ResearchTaskId
  readonly evidenceId: EvidenceId
  readonly expectedRevision: number
}

/** Get Evidence request. */
export interface GetEvidenceRequest {
  readonly projectId: ProjectId
  readonly taskId: ResearchTaskId
  readonly evidenceId: EvidenceId
}

/** List Evidence request. */
export interface ListEvidenceRequest {
  readonly projectId: ProjectId
  readonly taskId: ResearchTaskId
}

/** Human review Evidence request. */
export interface ReviewEvidenceRequest {
  readonly projectId: ProjectId
  readonly taskId: ResearchTaskId
  readonly evidenceId: EvidenceId
  readonly expectedRevision: number
  readonly reviewStatus: Extract<EvidenceReviewStatus, 'confirmed' | 'rejected' | 'invalidated'>
  readonly reviewNote: string
}

export interface TaskValue { readonly task: ResearchTask }
export interface TaskListValue { readonly items: readonly ResearchTask[] }
export interface SourceValue { readonly source: Source }
export interface SourceListValue { readonly items: readonly Source[] }
export interface SampleValue { readonly sample: Sample }
export interface SampleListValue { readonly items: readonly Sample[] }
export interface EvidenceValue { readonly evidence: Evidence }
export interface EvidenceListValue { readonly items: readonly Evidence[] }
