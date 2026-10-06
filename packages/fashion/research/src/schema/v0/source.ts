/**
 * Source Storage Domain record schema v0.
 * @module @gentlexx/dsh-fashion-research/src/schema/v0/source
 */

import { z } from 'zod'
import { researchEnvelopeV0 } from './envelope.ts'

/** Source locator discriminant. */
export const sourceLocatorTypeV0 = z.enum(['url', 'attachment'])

/** Coarse source kind. */
export const sourceKindV0 = z.enum([
  'web_page',
  'report',
  'product_page',
  'category_page',
  'editorial',
  'social_content',
  'internal_file',
  'other',
])

/** Capture mode. */
export const captureModeV0 = z.enum(['manual_link', 'manual_upload', 'recorded_public_web'])

/** Usage boundary. */
export const usageBoundaryV0 = z.enum(['public_attributed', 'project_private', 'view_only'])

/** External processing permission. */
export const externalProcessingV0 = z.enum(['allowed', 'denied', 'requires_approval'])

/** Availability status. */
export const availabilityStatusV0 = z.enum(['available', 'unavailable', 'removed'])

/**
 * Durable Source row body.
 * Table key is the SourceId; projectId and taskId are retained for ownership checks.
 */
export const sourceRecordV0 = z.object({
  ...researchEnvelopeV0,
  taskId: z.string().min(1),
  locatorType: sourceLocatorTypeV0,
  url: z.string().min(1).nullable(),
  urlNormalized: z.string().min(1).nullable(),
  attachmentRef: z.string().min(1).nullable(),
  title: z.string().min(1).max(200),
  publisherOrPlatform: z.string().max(200).nullable(),
  sourceKind: sourceKindV0,
  accessedAt: z.iso.datetime(),
  publishedAt: z.iso.datetime().nullable(),
  captureMode: captureModeV0,
  usageBoundary: usageBoundaryV0,
  externalProcessing: externalProcessingV0,
  availabilityStatus: availabilityStatusV0,
  attribution: z.string().min(1).max(500),
  contentFingerprint: z.string().min(1).nullable(),
}).strict().superRefine((value, ctx) => {
  if (value.locatorType === 'url') {
    if (value.url === null || value.urlNormalized === null) {
      ctx.addIssue({ code: 'custom', message: 'url-locator-requires-url', path: ['url'] })
    }
    if (value.attachmentRef !== null) {
      ctx.addIssue({ code: 'custom', message: 'url-locator-forbids-attachment', path: ['attachmentRef'] })
    }
  } else {
    if (value.attachmentRef === null) {
      ctx.addIssue({ code: 'custom', message: 'attachment-locator-requires-ref', path: ['attachmentRef'] })
    }
    if (value.url !== null || value.urlNormalized !== null) {
      ctx.addIssue({ code: 'custom', message: 'attachment-locator-forbids-url', path: ['url'] })
    }
  }
})

/** Durable Source record body. */
export type SourceRecordV0 = z.infer<typeof sourceRecordV0>
