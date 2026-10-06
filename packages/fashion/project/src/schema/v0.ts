/**
 * Fashion Project Storage Domain record schema v0.
 * Published semantics must not be rewritten in place; later versions add adjacent files.
 * @module @gentlexx/dsh-fashion-project/src/schema/v0
 */

import { z } from 'zod'

/**
 * Durable Project row body. Table key is the {@link import('../types.ts').ProjectId};
 * the id itself is not duplicated in the record.
 */
export const projectRecordV0 = z.object({
  title: z.string().min(1).max(120),
  origin: z.enum(['user', 'public-rebuild']),
  accessMode: z.enum(['editable', 'read-only']),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  revision: z.number().int().nonnegative(),
}).strict()

/** Durable Project record body inferred from {@link projectRecordV0}. */
export type ProjectRecordV0 = z.infer<typeof projectRecordV0>
