/**
 * Deterministic list order for feedback records.
 * @module @gentlexx/dsh-fashion-feedback/src/order
 */

/** Fields used to order append-only feedback rows. */
export interface FeedbackListOrderable {
  readonly recordedAt: string
  readonly id: string
}

/**
 * Newer recordedAt first; equal times sort by id ascending.
 * @param left - First row.
 * @param right - Second row.
 */
export function compareFeedbackRecordedDesc(left: FeedbackListOrderable, right: FeedbackListOrderable): number {
  if (left.recordedAt !== right.recordedAt) return left.recordedAt < right.recordedAt ? 1 : -1
  if (left.id === right.id) return 0
  return left.id < right.id ? -1 : 1
}
