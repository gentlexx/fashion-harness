/**
 * Fashion Design F3-02 review / deliverable durable record schemas.
 * @module @gentlexx/dsh-fashion-design/src/schema/v0/review
 */

import { z } from 'zod'
import { designEnvelopeV0 } from './envelope.ts'

/** Exact id+revision reference. */
export const exactRefV0 = z.object({
  id: z.string().min(1),
  revision: z.number().int().nonnegative(),
}).strict()

/** ReviewRound status projection source. */
export const reviewRoundStatusV0 = z.enum([
  'open',
  'changes_requested',
  'needs_research',
  'rejected',
  'approved',
  'invalidated',
  'archived',
])

/** ReviewDecision action. */
export const reviewDecisionActionV0 = z.enum([
  'select',
  'request_revision',
  'reject',
  'needs_research',
  'approve',
  'revoke_approval',
])

/** Decision subject. */
export const reviewSubjectTypeV0 = z.enum(['concept_set', 'concept'])

/** Decision actor kinds (Host-owned; clients never upload these). */
export const reviewActorKindV0 = z.enum(['local_human', 'recorded_demo_human'])

/** Frozen key-input target kinds. */
export const frozenTargetTypeV0 = z.enum([
  'brief',
  'concept_set',
  'concept',
  'visual_draft',
  'evidence',
])

/** One exact ref frozen at approve time. */
export const frozenExactEntryV0 = z.object({
  targetType: frozenTargetTypeV0,
  ref: exactRefV0,
  contentHash: z.string().min(1).max(128),
}).strict()

/** Complete frozen key-input set. */
export const frozenApprovalInputsV0 = z.object({
  entries: z.array(frozenExactEntryV0),
  inputSetHash: z.string().min(1).max(128),
}).strict()

/** Approval invalidation causes. */
export const approvalInvalidationCauseV0 = z.enum([
  'upstream_stale',
  'brief_revision_changed',
  'concept_set_revision_changed',
  'concept_revision_changed',
  'visual_reference_withdrawn',
  'approval_revoked',
  'evidence_withdrawn',
  'artifact_integrity_failed',
])

/** Deliverable audience profiles. */
export const audienceProfileV0 = z.enum([
  'internal_review',
  'designer_handoff',
  'public_portfolio',
])

/** Deliverable status. */
export const deliverableStatusV0 = z.enum([
  'generating',
  'ready',
  'failed',
  'invalidated',
  'withdrawn',
  'archived',
])

/** Source inclusion mode in a manifest entry. */
export const sourceInclusionV0 = z.enum(['embedded', 'summarized', 'link_only', 'excluded'])

/** Durable ReviewRound row. */
export const reviewRoundRecordV0 = z.object({
  ...designEnvelopeV0,
  briefRef: exactRefV0,
  conceptSetRef: exactRefV0,
  conceptRefs: z.tuple([exactRefV0, exactRefV0, exactRefV0]),
  visualDraftRefs: z.array(exactRefV0),
  comparisonSnapshotHash: z.string().min(1).max(128),
  openedBy: reviewActorKindV0,
  openedAt: z.iso.datetime(),
  closedAt: z.iso.datetime().nullable(),
  status: reviewRoundStatusV0,
  currentSelectionDecisionId: z.string().min(1).nullable(),
  currentApprovalDecisionId: z.string().min(1).nullable(),
  idempotencyKey: z.string().min(1).max(200).nullable(),
}).strict()

/** Durable ReviewDecision row (append-only). */
export const reviewDecisionRecordV0 = z.object({
  ...designEnvelopeV0,
  reviewRoundId: z.string().min(1),
  subjectType: reviewSubjectTypeV0,
  subjectRef: exactRefV0,
  action: reviewDecisionActionV0,
  selectedConceptRef: exactRefV0.nullable(),
  reasonCodes: z.array(z.string().min(1).max(80)),
  reasonText: z.string().max(4000).nullable(),
  advisoryConditions: z.array(z.string().max(500)),
  nextAction: z.string().max(500).nullable(),
  actorId: z.string().min(1).max(120),
  actorKind: reviewActorKindV0,
  frozenInputs: frozenApprovalInputsV0.nullable(),
}).strict()

/** Durable ApprovalInvalidation row (append-only). */
export const approvalInvalidationRecordV0 = z.object({
  ...designEnvelopeV0,
  reviewRoundId: z.string().min(1),
  approvalDecisionId: z.string().min(1).nullable(),
  affectedRefs: z.array(exactRefV0),
  cause: approvalInvalidationCauseV0,
  triggerRef: exactRefV0.nullable(),
  detectedBy: z.enum(['system', 'local_human']),
  detectedAt: z.iso.datetime(),
  note: z.string().max(2000).nullable(),
}).strict()

/** Durable DeliverableSnapshot payload (filtered business data + hash). */
export const deliverableSnapshotRecordV0 = z.object({
  ...designEnvelopeV0,
  snapshotSchemaVersion: z.literal(1),
  projectRef: exactRefV0,
  opportunityRef: exactRefV0.nullable(),
  opportunityDecisionRef: exactRefV0.nullable(),
  briefRef: exactRefV0,
  briefPayload: z.record(z.string(), z.unknown()),
  conceptSetRef: exactRefV0,
  comparisonPayload: z.record(z.string(), z.unknown()),
  conceptRefs: z.tuple([exactRefV0, exactRefV0, exactRefV0]),
  selectedConceptRef: exactRefV0,
  conceptPayloads: z.array(z.record(z.string(), z.unknown())),
  visualDraftRefs: z.array(exactRefV0),
  visualPayloads: z.array(z.record(z.string(), z.unknown())),
  reviewRoundRef: exactRefV0,
  relevantDecisionRefs: z.array(exactRefV0),
  reviewPayload: z.record(z.string(), z.unknown()),
  sourceManifestRef: exactRefV0,
  limitations: z.array(z.string()),
  audienceProfile: audienceProfileV0,
  rendererVersion: z.string().min(1),
  canonicalization: z.literal('rfc8785-jcs'),
  hashAlgorithm: z.literal('sha256'),
  snapshotHash: z.string().min(1).max(128),
  createdByActorKind: reviewActorKindV0,
}).strict()

/** Durable SourceManifest row. */
export const sourceManifestRecordV0 = z.object({
  ...designEnvelopeV0,
  snapshotRef: exactRefV0,
  entries: z.array(z.object({
    sourceRef: z.string().min(1),
    evidenceRef: z.string().min(1).nullable(),
    title: z.string().min(1).max(500),
    locator: z.string().max(2000).nullable(),
    accessedAt: z.iso.datetime().nullable(),
    usageBoundary: z.string().min(1).max(80),
    audienceVisibility: z.string().min(1).max(80),
    inclusion: sourceInclusionV0,
    exclusionReason: z.string().max(500).nullable(),
    artifactHash: z.string().max(128).nullable(),
  }).strict()),
  generatedAt: z.iso.datetime(),
}).strict()

/** Durable DesignDeliverable row. */
export const designDeliverableRecordV0 = z.object({
  ...designEnvelopeV0,
  deliverableType: z.literal('design_decision_package'),
  audienceProfile: audienceProfileV0,
  reviewRoundId: z.string().min(1),
  snapshotRef: exactRefV0,
  snapshotHash: z.string().min(1).max(128),
  briefRef: exactRefV0,
  conceptSetRef: exactRefV0,
  selectedConceptRef: exactRefV0,
  approvalDecisionRef: exactRefV0,
  sourceManifestRef: exactRefV0,
  artifactRefs: z.array(exactRefV0),
  knownRisks: z.array(z.string()),
  limitations: z.array(z.string()),
  handoffTarget: z.string().max(200).nullable(),
  status: deliverableStatusV0,
  frozenBy: reviewActorKindV0.nullable(),
  frozenAt: z.iso.datetime().nullable(),
  invalidatedAt: z.iso.datetime().nullable(),
  invalidationRef: exactRefV0.nullable(),
  failureReason: z.string().max(2000).nullable(),
  idempotencyKey: z.string().min(1).max(200).nullable(),
  rendererVersion: z.string().min(1),
}).strict()

/** Durable ExportArtifact metadata row (bytes held as project-relative opaque ref). */
export const exportArtifactRecordV0 = z.object({
  ...designEnvelopeV0,
  deliverableId: z.string().min(1),
  kind: z.enum(['json', 'markdown', 'manifest']),
  mediaType: z.string().min(1).max(120),
  filename: z.string().min(1).max(200),
  relativePath: z.string().min(1).max(500),
  byteLength: z.number().int().nonnegative(),
  contentSha256: z.string().min(1).max(128),
  /** UTF-8 text content for v0 (no Session/Blob). Binary Provider path deferred. */
  textContent: z.string().max(2_000_000),
}).strict()

export type ReviewRoundRecordV0 = z.infer<typeof reviewRoundRecordV0>
export type ReviewDecisionRecordV0 = z.infer<typeof reviewDecisionRecordV0>
export type ApprovalInvalidationRecordV0 = z.infer<typeof approvalInvalidationRecordV0>
export type DeliverableSnapshotRecordV0 = z.infer<typeof deliverableSnapshotRecordV0>
export type SourceManifestRecordV0 = z.infer<typeof sourceManifestRecordV0>
export type DesignDeliverableRecordV0 = z.infer<typeof designDeliverableRecordV0>
export type ExportArtifactRecordV0 = z.infer<typeof exportArtifactRecordV0>
