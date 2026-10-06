/**
 * Shared zod helpers for Fashion Research durable envelopes.
 * @module @gentlexx/dsh-fashion-research/src/schema/v0/envelope
 */

import { z } from 'zod'
import { FASHION_RESEARCH_SCHEMA_VERSION } from '../../types.ts'

/** ActorRef admitted in v0 without an account system. */
export const actorRefV0 = z.enum(['local-human', 'system-seed'])

/** ResearchOrigin admitted in v0 (no agent write origin). */
export const researchOriginV0 = z.enum(['human', 'import', 'system_seed'])

/** ResearchAccessMode. */
export const researchAccessModeV0 = z.enum(['editable', 'read-only'])

/** Shared envelope fields stamped on every durable research row. */
export const researchEnvelopeV0 = {
  projectId: z.string().min(1),
  origin: researchOriginV0,
  accessMode: researchAccessModeV0,
  revision: z.number().int().nonnegative(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  createdBy: actorRefV0,
  updatedBy: actorRefV0,
  schemaVersion: z.literal(FASHION_RESEARCH_SCHEMA_VERSION),
  archivedAt: z.iso.datetime().nullable(),
}
