/**
 * Shared zod helpers for Fashion Evaluation durable envelopes.
 * @module @gentlexx/dsh-fashion-evaluation/src/schema/v0/envelope
 */

import { z } from 'zod'
import { FASHION_EVALUATION_SCHEMA_VERSION } from '../../types.ts'

/** EvaluationOrigin admitted in v0. */
export const evaluationOriginV0 = z.enum(['system_evaluation', 'manual_entry', 'recorded_seed'])

/** EvaluationDataReality admitted in v0. */
export const evaluationDataRealityV0 = z.enum(['real_work', 'user_test', 'recorded_demo'])

/** EvaluationVisibility admitted in v0. */
export const evaluationVisibilityV0 = z.enum(['project_private', 'internal_demo', 'public_rebuild', 'view_only'])

/** Assessment actor kinds. */
export const evaluationActorKindV0 = z.enum(['local_human', 'recorded_demo_human'])

/** Shared envelope fields stamped on every durable evaluation row. */
export const evaluationEnvelopeV0 = {
  projectId: z.string().min(1).nullable(),
  schemaVersion: z.literal(FASHION_EVALUATION_SCHEMA_VERSION),
  origin: evaluationOriginV0,
  dataReality: evaluationDataRealityV0,
  visibility: evaluationVisibilityV0,
  createdBy: z.string().min(1).max(200),
  createdAt: z.iso.datetime(),
  contentVersion: z.number().int().nonnegative(),
  archivedAt: z.iso.datetime().nullable(),
}
