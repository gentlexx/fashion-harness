/**
 * Shared zod helpers for Fashion Design durable envelopes.
 * @module @gentlexx/dsh-fashion-design/src/schema/v0/envelope
 */

import { z } from 'zod'
import { FASHION_DESIGN_SCHEMA_VERSION } from '../../types.ts'

/** ActorRef admitted in v0 without an account system. */
export const actorRefV0 = z.enum(['local-human', 'system-rule', 'system-seed'])

/** DesignOrigin admitted in v0. */
export const designOriginV0 = z.enum(['user', 'recorded_seed', 'imported', 'provider_generated'])

/** DesignAccessMode. */
export const designAccessModeV0 = z.enum(['editable', 'read-only'])

/** Shared envelope fields stamped on every durable design row. */
export const designEnvelopeV0 = {
  projectId: z.string().min(1),
  origin: designOriginV0,
  accessMode: designAccessModeV0,
  revision: z.number().int().nonnegative(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  createdBy: actorRefV0,
  updatedBy: actorRefV0,
  schemaVersion: z.literal(FASHION_DESIGN_SCHEMA_VERSION),
  archivedAt: z.iso.datetime().nullable(),
  staleReason: z.string().max(2000).nullable(),
}

/** Constraint entry shared by Brief arrays. */
export const constraintEntryV0 = z.object({
  id: z.string().min(1).max(80),
  text: z.string().min(1).max(2000),
  kind: z.string().min(1).max(80),
  claimType: z.enum(['observed', 'human_decision', 'hypothesis', 'needs_validation']),
  sourceRefs: z.array(z.string().min(1).max(200)),
  note: z.string().max(2000).nullable(),
}).strict()
