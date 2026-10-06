/**
 * Shared zod helpers for Fashion Feedback durable envelopes.
 * @module @gentlexx/dsh-fashion-feedback/src/schema/v0/envelope
 */

import { z } from 'zod'
import { FASHION_FEEDBACK_SCHEMA_VERSION } from '../../types.ts'

/** FeedbackOrigin admitted in v0. */
export const feedbackOriginV0 = z.enum(['manual_entry', 'recorded_seed', 'authorized_import'])

/** FeedbackDataReality admitted in v0. */
export const feedbackDataRealityV0 = z.enum(['real_work', 'user_test', 'recorded_demo'])

/** FeedbackVisibility admitted in v0. */
export const feedbackVisibilityV0 = z.enum(['project_private', 'internal_demo', 'public_rebuild', 'view_only'])

/** FeedbackActorKind admitted in v0. Agent and system are absent. */
export const feedbackActorKindV0 = z.enum(['local_human', 'recorded_demo_human'])

/** Exact id + revision. */
export const exactSubjectRefV0 = z.object({
  id: z.string().min(1),
  revision: z.number().int().nonnegative(),
}).strict()

/** Host-stamped actor. */
export const feedbackActorV0 = z.object({
  actorId: z.string().min(1).max(200),
  actorKind: feedbackActorKindV0,
}).strict()

/** Structured source pointer. */
export const outcomeSourceRefV0 = z.object({
  sourceKind: z.enum(['human_statement', 'project_artifact', 'f2_evidence', 'authorized_export']),
  ref: z.string().min(1).max(500),
  locator: z.string().max(500).nullable(),
  recordedOrExportedAt: z.iso.datetime(),
  usageBoundary: z.string().min(1).max(200),
  contentHash: z.string().max(128).nullable(),
  providerName: z.string().max(200).nullable(),
  note: z.string().max(2000).nullable(),
}).strict()

/** Shared envelope fields stamped on every durable feedback row. */
export const feedbackEnvelopeV0 = {
  projectId: z.string().min(1),
  schemaVersion: z.literal(FASHION_FEEDBACK_SCHEMA_VERSION),
  origin: feedbackOriginV0,
  dataReality: feedbackDataRealityV0,
  visibility: feedbackVisibilityV0,
  recordedBy: z.string().min(1).max(200),
  recordedAt: z.iso.datetime(),
  supersedesId: z.string().min(1).nullable(),
  correctionReason: z.string().max(2000).nullable(),
  archivedAt: z.iso.datetime().nullable(),
  accessMode: z.enum(['editable', 'read-only']),
  revision: z.number().int().nonnegative(),
  idempotencyKey: z.string().min(1).max(200).nullable(),
}
