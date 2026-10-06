/**
 * Sample Storage Domain record schema v0.
 * @module @gentlexx/dsh-fashion-research/src/schema/v0/sample
 */

import { z } from 'zod'
import { researchEnvelopeV0 } from './envelope.ts'

/** Sample status enum. */
export const sampleStatusV0 = z.enum([
  'draft',
  'ready_for_review',
  'confirmed',
  'rejected',
  'archived',
])

/** One raw field retained with source wording. */
export const rawFieldV0 = z.object({
  name: z.string().min(1).max(200),
  value: z.string().min(1).max(2000),
  unit: z.string().min(1).max(40).optional(),
}).strict()

/**
 * Durable Sample row body.
 * Table key is the SampleId; projectId, taskId, and sourceId enforce the parent chain.
 */
export const sampleRecordV0 = z.object({
  ...researchEnvelopeV0,
  taskId: z.string().min(1),
  sourceId: z.string().min(1),
  label: z.string().min(1).max(200),
  externalItemId: z.string().min(1).max(200).nullable(),
  locator: z.string().min(1).max(2000).nullable(),
  observedAt: z.iso.datetime(),
  rawFields: z.array(rawFieldV0).max(64),
  screenshotRefs: z.array(z.string().min(1)).max(32),
  note: z.string().max(2000).nullable(),
  status: sampleStatusV0,
}).strict()

/** Durable Sample record body. */
export type SampleRecordV0 = z.infer<typeof sampleRecordV0>
