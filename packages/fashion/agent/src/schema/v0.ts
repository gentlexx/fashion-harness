/**
 * Durable Fashion Agent binding record (session id is the table key).
 * @module @gentlexx/dsh-fashion-agent/src/schema/v0
 */

import { z } from 'zod'

/** v0 binding body. Project snapshot bodies are never persisted here. */
export const fashionSessionBindingRecordV0 = z.object({
  projectId: z.string().min(1),
  boundAt: z.string().min(1),
  entrySurface: z.union([
    z.literal('overview'),
    z.literal('research'),
    z.literal('analysis'),
    z.literal('design'),
    z.literal('review'),
    z.literal('deliverable'),
    z.literal('feedback'),
    z.literal('evaluation'),
    z.literal('improvement'),
    z.literal('agent'),
    z.null(),
  ]),
})

/** Durable binding record. */
export type FashionSessionBindingRecordV0 = z.infer<typeof fashionSessionBindingRecordV0>
