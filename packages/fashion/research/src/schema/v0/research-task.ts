/**
 * ResearchTask Storage Domain record schema v0.
 * @module @gentlexx/dsh-fashion-research/src/schema/v0/research-task
 */

import { z } from 'zod'
import { researchEnvelopeV0 } from './envelope.ts'

/** ResearchTask status enum for v0. */
export const researchTaskStatusV0 = z.enum([
  'draft',
  'active',
  'ready_for_review',
  'closed',
  'archived',
])

/**
 * Durable ResearchTask row body.
 * Table key is the ResearchTaskId; the id is not duplicated in the record.
 */
export const researchTaskRecordV0 = z.object({
  ...researchEnvelopeV0,
  title: z.string().min(1).max(120),
  note: z.string().max(2000).nullable(),
  status: researchTaskStatusV0,
}).strict()

/** Durable ResearchTask record body. */
export type ResearchTaskRecordV0 = z.infer<typeof researchTaskRecordV0>
