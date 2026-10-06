/**
 * Sort helpers for Fashion Evaluation lists.
 * @module @gentlexx/dsh-fashion-evaluation/src/order
 */

/** Rows ordered by createdAt descending. */
export interface EvaluationCreatedOrderable {
  readonly createdAt: string
  readonly id: string
}

/**
 * Newest first by createdAt, then greater id.
 * @param left - Left row.
 * @param right - Right row.
 */
export function compareEvaluationCreatedDesc(left: EvaluationCreatedOrderable, right: EvaluationCreatedOrderable): number {
  if (left.createdAt !== right.createdAt) return left.createdAt < right.createdAt ? 1 : -1
  if (left.id === right.id) return 0
  return String(left.id) < String(right.id) ? 1 : -1
}
