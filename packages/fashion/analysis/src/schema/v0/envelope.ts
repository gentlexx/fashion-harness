/**
 * Shared zod helpers for Fashion Analysis durable envelopes.
 * @module @gentlexx/dsh-fashion-analysis/src/schema/v0/envelope
 */

import { z } from 'zod'
import { FASHION_ANALYSIS_SCHEMA_VERSION } from '../../types.ts'

/** ActorRef admitted in v0 without an account system. */
export const actorRefV0 = z.enum(['local-human', 'system-rule', 'system-seed'])

/** AnalysisOrigin admitted in v0. */
export const analysisOriginV0 = z.enum(['human', 'rule', 'import', 'system_seed'])

/** AnalysisAccessMode. */
export const analysisAccessModeV0 = z.enum(['editable', 'read-only'])

/** Shared retention status. */
export const analysisObjectStatusV0 = z.enum(['active', 'stale', 'invalidated', 'archived'])

/** Shared envelope fields stamped on every durable analysis row. */
export const analysisEnvelopeV0 = {
  projectId: z.string().min(1),
  taskId: z.string().min(1),
  origin: analysisOriginV0,
  accessMode: analysisAccessModeV0,
  status: analysisObjectStatusV0,
  revision: z.number().int().nonnegative(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  createdBy: actorRefV0,
  updatedBy: actorRefV0,
  schemaVersion: z.literal(FASHION_ANALYSIS_SCHEMA_VERSION),
  archivedAt: z.iso.datetime().nullable(),
  staleReason: z.string().max(2000).nullable(),
}
