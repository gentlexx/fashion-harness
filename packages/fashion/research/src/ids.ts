/**
 * Brand factories for Fashion Research identities.
 * @module @gentlexx/dsh-fashion-research/src/ids
 */

import { brandString } from '@deepseek-ai/dsh-brand'
import type {
  AttachmentRef,
  EvidenceId,
  ResearchTaskId,
  SampleId,
  SourceId,
} from './types.ts'

/**
 * Brand a string as a {@link ResearchTaskId}.
 * @param id - Raw task id string.
 * @returns the same string, branded at compile time.
 */
export function ResearchTaskId(id: string): ResearchTaskId {
  return brandString<ResearchTaskId>(id)
}

/**
 * Brand a string as a {@link SourceId}.
 * @param id - Raw source id string.
 * @returns the same string, branded at compile time.
 */
export function SourceId(id: string): SourceId {
  return brandString<SourceId>(id)
}

/**
 * Brand a string as a {@link SampleId}.
 * @param id - Raw sample id string.
 * @returns the same string, branded at compile time.
 */
export function SampleId(id: string): SampleId {
  return brandString<SampleId>(id)
}

/**
 * Brand a string as an {@link EvidenceId}.
 * @param id - Raw evidence id string.
 * @returns the same string, branded at compile time.
 */
export function EvidenceId(id: string): EvidenceId {
  return brandString<EvidenceId>(id)
}

/**
 * Brand a string as an {@link AttachmentRef}.
 * @param id - Opaque attachment reference string (not a filesystem path).
 * @returns the same string, branded at compile time.
 */
export function AttachmentRef(id: string): AttachmentRef {
  return brandString<AttachmentRef>(id)
}
