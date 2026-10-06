/**
 * Frozen approval inputs and invalidation notes for F3-02 exact refs.
 * @module @gentlexx/dsh-fashion-design/src/export/exact-inputs
 */

import type { ApprovalInvalidationCause, ExactRef } from '../types.ts'
import { hashSnapshotPayload } from './jcs.ts'

/** Key input kinds frozen on approve. */
export type FrozenTargetType = 'brief' | 'concept_set' | 'concept' | 'visual_draft' | 'evidence'

/** One frozen exact ref plus content hash. */
export interface FrozenExactEntry {
  targetType: FrozenTargetType
  ref: { id: string; revision: number }
  contentHash: string
}

/** Complete key-input set captured at approve time. */
export interface FrozenApprovalInputs {
  entries: FrozenExactEntry[]
  inputSetHash: string
}

/** Live observation of one frozen target. */
export interface LiveExactObservation {
  readonly available: boolean
  readonly revision: number | null
  readonly contentHash: string | null
  readonly stale: boolean
  readonly unavailableReason: string | null
}

/** One drift that must append an invalidation. */
export interface ExactRefDrift {
  readonly cause: ApprovalInvalidationCause
  readonly note: string
  readonly affectedRef: ExactRef
  readonly triggerRef: ExactRef | null
}

/**
 * Canonicalize and hash a frozen input set.
 * @param entries - Unordered frozen entries.
 * @returns Sorted entries and the set hash.
 */
export function sealFrozenInputs(entries: readonly FrozenExactEntry[]): FrozenApprovalInputs {
  const sorted = [...entries].sort((left, right) =>
    `${left.targetType}:${left.ref.id}`.localeCompare(`${right.targetType}:${right.ref.id}`),
  )
  return {
    entries: sorted.map(entry => ({
      targetType: entry.targetType,
      ref: { id: entry.ref.id, revision: entry.ref.revision },
      contentHash: entry.contentHash,
    })),
    inputSetHash: hashSnapshotPayload(sorted),
  }
}

/**
 * Compare one frozen entry with its live observation.
 * @param entry - Frozen exact ref.
 * @param live - Current observation.
 * @returns A drift, or null when the input still matches.
 */
export function diffFrozenEntry(
  entry: FrozenExactEntry,
  live: LiveExactObservation,
): ExactRefDrift | null {
  if (!live.available || live.revision === null || live.contentHash === null) {
    return {
      cause: causeFor(entry.targetType, false),
      note: `${entry.targetType} unavailable: oldRevision=${entry.ref.revision} reason=${live.unavailableReason ?? 'missing'}`,
      affectedRef: entry.ref,
      triggerRef: null,
    }
  }
  if (live.stale || live.revision !== entry.ref.revision || live.contentHash !== entry.contentHash) {
    return {
      cause: causeFor(entry.targetType, live.stale),
      note: `${entry.targetType} revision changed: oldRevision=${entry.ref.revision} newRevision=${live.revision}`,
      affectedRef: entry.ref,
      triggerRef: { id: entry.ref.id, revision: live.revision },
    }
  }
  return null
}

function causeFor(targetType: FrozenTargetType, stale: boolean): ApprovalInvalidationCause {
  if (targetType === 'brief') return 'brief_revision_changed'
  if (targetType === 'concept_set') return 'concept_set_revision_changed'
  if (targetType === 'concept') return stale ? 'upstream_stale' : 'concept_revision_changed'
  if (targetType === 'visual_draft') return 'visual_reference_withdrawn'
  return 'evidence_withdrawn'
}
