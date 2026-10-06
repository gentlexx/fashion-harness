/**
 * Client-local Research id brand factories (browser-safe; no Host /ids import).
 * @module @gentlexx/dsh-client-ui-fashion-shell/src/client/research/ids
 */

import { brandString } from '@deepseek-ai/dsh-brand'
import type {
  EvidenceId,
  ResearchTaskId,
  SampleId,
  SourceId,
} from '@gentlexx/dsh-fashion-research/types'

/** @param id - Raw task id string. */
export function ResearchTaskId(id: string): ResearchTaskId {
  return brandString<ResearchTaskId>(id)
}

/** @param id - Raw source id string. */
export function SourceId(id: string): SourceId {
  return brandString<SourceId>(id)
}

/** @param id - Raw sample id string. */
export function SampleId(id: string): SampleId {
  return brandString<SampleId>(id)
}

/** @param id - Raw evidence id string. */
export function EvidenceId(id: string): EvidenceId {
  return brandString<EvidenceId>(id)
}
