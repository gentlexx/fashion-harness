/**
 * Fashion Research registry (`ctx.fashionResearchRegistry`): durable
 * ResearchTask / Source / Sample / Evidence over Storage Domain `fashion_research@0`.
 * @module @gentlexx/dsh-fashion-research
 */

import {
  AttachmentRef as brandAttachmentRef,
  EvidenceId as brandEvidenceId,
  ResearchTaskId as brandResearchTaskId,
  SampleId as brandSampleId,
  SourceId as brandSourceId,
} from './ids.ts'
import type {
  AttachmentRef as AttachmentRefBrand,
  EvidenceId as EvidenceIdBrand,
  ResearchTaskId as ResearchTaskIdBrand,
  SampleId as SampleIdBrand,
  SourceId as SourceIdBrand,
} from './types.ts'

export type {
  ActorRef,
  AvailabilityStatus,
  CaptureMode,
  ClaimType,
  Evidence,
  EvidenceGrade,
  EvidenceReviewStatus,
  EvidenceSubjectType,
  ExternalProcessing,
  RawField,
  ResearchAccessMode,
  ResearchOrigin,
  ResearchTask,
  ResearchTaskStatus,
  Sample,
  SampleStatus,
  Source,
  SourceKind,
  SourceLocatorType,
  UsageBoundary,
} from './types.ts'
export { FASHION_RESEARCH_SCHEMA_VERSION } from './types.ts'

/** Branded identities; factories below share these names. */
export type AttachmentRef = AttachmentRefBrand
export type EvidenceId = EvidenceIdBrand
export type ResearchTaskId = ResearchTaskIdBrand
export type SampleId = SampleIdBrand
export type SourceId = SourceIdBrand

/**
 * Brand a string as a {@link ResearchTaskId}.
 * @param id - Raw task id string.
 * @returns the same string, branded at compile time.
 */
export function ResearchTaskId(id: string): ResearchTaskId {
  return brandResearchTaskId(id)
}

/**
 * Brand a string as a {@link SourceId}.
 * @param id - Raw source id string.
 * @returns the same string, branded at compile time.
 */
export function SourceId(id: string): SourceId {
  return brandSourceId(id)
}

/**
 * Brand a string as a {@link SampleId}.
 * @param id - Raw sample id string.
 * @returns the same string, branded at compile time.
 */
export function SampleId(id: string): SampleId {
  return brandSampleId(id)
}

/**
 * Brand a string as an {@link EvidenceId}.
 * @param id - Raw evidence id string.
 * @returns the same string, branded at compile time.
 */
export function EvidenceId(id: string): EvidenceId {
  return brandEvidenceId(id)
}

/**
 * Brand a string as an {@link AttachmentRef}.
 * @param id - Opaque attachment reference string.
 * @returns the same string, branded at compile time.
 */
export function AttachmentRef(id: string): AttachmentRef {
  return brandAttachmentRef(id)
}

export {
  FashionResearchAttachmentInvalidError,
  FashionResearchCrossProjectReferenceError,
  FashionResearchCrossTaskReferenceError,
  FashionResearchEvidenceNotFoundError,
  FashionResearchIdCollisionError,
  FashionResearchInvalidInputError,
  FashionResearchInvalidTransitionError,
  FashionResearchInvalidUrlError,
  FashionResearchProjectNotFoundError,
  FashionResearchProjectReadOnlyError,
  FashionResearchRevisionConflictError,
  FashionResearchSampleNotFoundError,
  FashionResearchSeedConflictError,
  FashionResearchSourceNotFoundError,
  FashionResearchTaskNotFoundError,
  FashionResearchUsageBoundaryDeniedError,
} from './errors.ts'

export { compareResearchUpdatedDesc } from './order.ts'
export type { ResearchListOrderable } from './order.ts'

export {
  fashionResearchDomainSpec,
  FASHION_RESEARCH_DOMAIN_VERSION,
} from './spec.ts'
export type {
  EvidenceRecordV0,
  ResearchTaskRecordV0,
  SampleRecordV0,
  SourceRecordV0,
} from './spec.ts'

export { researchTaskRecordV0 } from './schema/v0/research-task.ts'
export { sourceRecordV0 } from './schema/v0/source.ts'
export { sampleRecordV0 } from './schema/v0/sample.ts'
export { evidenceRecordV0 } from './schema/v0/evidence.ts'

export {
  isValidR0ChildSeed,
  isValidR0TaskSeed,
  R0_EVIDENCE_SEEDS,
  R0_RESEARCH_ACCESSED_AT,
  R0_SOURCE_SEEDS,
  R0_TASK_ID,
  R0_TASK_RECORD,
} from './seed/r0-utility-jacket.ts'

export { normalizeSourceUrl } from './url.ts'
export type { NormalizedSourceUrl } from './url.ts'

export {
  FashionResearchRegistry,
  normalizeOptionalNote,
  normalizeResearchTaskTitle,
  RESEARCH_TASK_NOTE_MAX_LENGTH,
  RESEARCH_TASK_TITLE_MAX_LENGTH,
} from './registry.ts'

export { FashionResearchRegistry as default } from './registry.ts'
