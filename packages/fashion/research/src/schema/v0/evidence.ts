/**
 * Evidence Storage Domain record schema v0.
 * @module @gentlexx/dsh-fashion-research/src/schema/v0/evidence
 */

import { z } from 'zod'
import { actorRefV0, researchEnvelopeV0 } from './envelope.ts'

/** Evidence subject discriminant. */
export const evidenceSubjectTypeV0 = z.enum(['source', 'sample'])

/** Claim epistemology. */
export const claimTypeV0 = z.enum(['observed', 'derived', 'needs_validation'])

/** Evidence grade from domain contract 28. */
export const evidenceGradeV0 = z.enum(['G0', 'G1', 'G2', 'G3', 'G4'])

/** Review workflow status. */
export const evidenceReviewStatusV0 = z.enum([
  'draft',
  'pending_review',
  'confirmed',
  'rejected',
  'invalidated',
])

/**
 * Durable Evidence row body.
 * Table key is the EvidenceId; subject must share projectId and taskId.
 */
export const evidenceRecordV0 = z.object({
  ...researchEnvelopeV0,
  taskId: z.string().min(1),
  subjectType: evidenceSubjectTypeV0,
  subjectId: z.string().min(1),
  excerpt: z.string().max(1000).nullable(),
  observation: z.string().min(1).max(2000),
  claim: z.string().min(1).max(2000).nullable(),
  claimType: claimTypeV0.nullable(),
  evidenceGrade: evidenceGradeV0,
  method: z.string().min(1).max(2000).nullable(),
  limitations: z.array(z.string().min(1).max(500)).max(32),
  reviewStatus: evidenceReviewStatusV0,
  reviewedBy: actorRefV0.nullable(),
  reviewedAt: z.iso.datetime().nullable(),
  reviewNote: z.string().max(2000).nullable(),
}).strict().superRefine((value, ctx) => {
  if (value.claim !== null && value.claimType === null) {
    ctx.addIssue({ code: 'custom', message: 'claim-requires-claimType', path: ['claimType'] })
  }
  if (value.claim === null && value.claimType !== null) {
    ctx.addIssue({ code: 'custom', message: 'claimType-requires-claim', path: ['claim'] })
  }
  if (value.claimType === 'observed' && (value.evidenceGrade === 'G0')) {
    ctx.addIssue({ code: 'custom', message: 'observed-requires-g1-or-higher', path: ['evidenceGrade'] })
  }
  if (value.claimType === 'derived' && (value.method === null || value.method.length < 1)) {
    ctx.addIssue({ code: 'custom', message: 'derived-requires-method', path: ['method'] })
  }
  if (value.claimType === 'derived' && value.limitations.length < 1) {
    ctx.addIssue({ code: 'custom', message: 'derived-requires-limitations', path: ['limitations'] })
  }
  const terminal = value.reviewStatus === 'confirmed'
    || value.reviewStatus === 'rejected'
    || value.reviewStatus === 'invalidated'
  if (terminal) {
    if (value.reviewedBy === null || value.reviewedBy === 'system-seed') {
      ctx.addIssue({ code: 'custom', message: 'terminal-review-requires-human', path: ['reviewedBy'] })
    }
    if (value.reviewedAt === null) {
      ctx.addIssue({ code: 'custom', message: 'terminal-review-requires-reviewedAt', path: ['reviewedAt'] })
    }
    if (value.reviewNote === null || value.reviewNote.trim().length < 1) {
      ctx.addIssue({ code: 'custom', message: 'terminal-review-requires-note', path: ['reviewNote'] })
    }
  }
})

/** Durable Evidence record body. */
export type EvidenceRecordV0 = z.infer<typeof evidenceRecordV0>
