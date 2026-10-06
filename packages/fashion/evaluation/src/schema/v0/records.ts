/**
 * Fashion Evaluation Storage Domain record schemas v0.
 * @module @gentlexx/dsh-fashion-evaluation/src/schema/v0/records
 */

import { z } from 'zod'
import { evaluationActorKindV0, evaluationEnvelopeV0 } from './envelope.ts'

const ruleDefinitionV0 = z.object({
  ruleId: z.string().min(1),
  ruleVersion: z.string().min(1),
  category: z.string().min(1),
  title: z.string().min(1),
  severity: z.enum(['blocker', 'major', 'minor', 'info']),
  required: z.boolean(),
}).strict()

const passPolicyV0 = z.object({
  requiredErrorIsError: z.literal(true),
  blockerOrMajorFailIsFail: z.literal(true),
  minorFailIsPartial: z.literal(true),
  warningNotPass: z.literal(true),
  notApplicableNotPass: z.literal(true),
}).strict()

const expectedOutcomeV0 = z.object({
  ruleId: z.string().min(1),
  status: z.enum(['pass', 'fail', 'warning', 'not_applicable', 'error']),
}).strict()

const snapshotV0 = z.record(z.string(), z.unknown())

const systemVersionV0 = z.object({
  baseTag: z.string().min(1),
  baseSha: z.string().min(1),
  worktreeHead: z.string().nullable(),
  dirtyStateHash: z.string().nullable(),
}).strict()

const exactRefV0 = z.object({
  type: z.string().min(1),
  id: z.string().min(1),
  revision: z.number().int().nonnegative(),
  projectId: z.string().min(1),
  contentHash: z.string().nullable(),
}).strict()

/** Durable EvaluationDefinition row. */
export const evaluationDefinitionRecordV0 = z.object({
  ...evaluationEnvelopeV0,
  definitionVersion: z.string().min(1),
  name: z.string().min(1),
  objective: z.string().min(1),
  scope: z.enum(['closed_loop_integrity', 'project_snapshot']),
  evaluatorBundleVersion: z.string().min(1),
  ruleDefinitions: z.array(ruleDefinitionV0),
  humanRubricRef: z.string().nullable(),
  passPolicy: passPolicyV0,
  status: z.enum(['draft', 'published', 'retired']),
  contentHash: z.string().min(1),
}).strict()

/** Durable EvaluationDefinition record. */
export type EvaluationDefinitionRecordV0 = z.infer<typeof evaluationDefinitionRecordV0>

/** Durable EvaluationCase row. */
export const evaluationCaseRecordV0 = z.object({
  ...evaluationEnvelopeV0,
  caseVersion: z.string().min(1),
  title: z.string().min(1),
  objective: z.string().min(1),
  caseMode: z.enum(['project_snapshot', 'isolated_fixture']),
  fixtureKind: z.enum(['recorded_public', 'synthetic_negative', 'private_real_opt_in', 'queue_exercise']),
  inputHash: z.string().min(1),
  expectedRuleOutcomes: z.array(expectedOutcomeV0),
  expectedVerdict: z.enum(['pass', 'partial', 'fail', 'error']),
  failureIntent: z.enum(['regression', 'queue_exercise']).nullable(),
  usageBoundary: z.string().min(1),
  status: z.enum(['draft', 'published', 'archived']),
  contentHash: z.string().min(1),
  snapshot: snapshotV0,
}).strict()

/** Durable EvaluationCase record. */
export type EvaluationCaseRecordV0 = z.infer<typeof evaluationCaseRecordV0>

/** Durable EvaluationRun row. */
export const evaluationRunRecordV0 = z.object({
  ...evaluationEnvelopeV0,
  definitionRef: z.object({
    id: z.string().min(1),
    definitionVersion: z.string().min(1),
  }).strict(),
  caseRefs: z.array(z.string().min(1)),
  inputHashes: z.array(z.string().min(1)),
  systemVersion: systemVersionV0,
  profile: z.string().min(1),
  evaluatorBundleVersion: z.string().min(1),
  startedAt: z.iso.datetime(),
  finishedAt: z.iso.datetime(),
  executor: z.enum(['local_human_trigger', 'test_runner', 'recorded_seed']),
  executionStatus: z.enum(['completed', 'partial', 'failed', 'cancelled']),
  verdict: z.enum(['pass', 'partial', 'fail', 'error']),
  ruleResultRefs: z.array(z.string().min(1)),
  humanAssessmentRefs: z.array(z.string().min(1)),
  reportArtifactRefs: z.array(z.string().min(1)),
  limitations: z.array(z.string()),
}).strict()

/** Durable EvaluationRun record. */
export type EvaluationRunRecordV0 = z.infer<typeof evaluationRunRecordV0>

/** Durable RuleResult row. */
export const ruleResultRecordV0 = z.object({
  runId: z.string().min(1),
  ruleId: z.string().min(1),
  caseId: z.string().min(1),
  status: z.enum(['pass', 'fail', 'warning', 'not_applicable', 'error']),
  severity: z.enum(['blocker', 'major', 'minor', 'info']),
  required: z.boolean(),
  observed: z.string(),
  expected: z.string(),
  message: z.string(),
  evaluatorVersion: z.string().min(1),
  limitations: z.array(z.string()),
}).strict()

/** Durable RuleResult record. */
export type RuleResultRecordV0 = z.infer<typeof ruleResultRecordV0>

/** Durable HumanAssessment row. */
export const humanAssessmentRecordV0 = z.object({
  ...evaluationEnvelopeV0,
  runId: z.string().min(1),
  criterionId: z.string().min(1),
  rating: z.enum(['meets', 'partly_meets', 'does_not_meet', 'unable_to_assess']),
  reason: z.string().min(1),
  actorKind: evaluationActorKindV0,
  recordedAt: z.iso.datetime(),
  supersedesAssessmentId: z.string().nullable(),
}).strict()

/** Durable HumanAssessment record. */
export type HumanAssessmentRecordV0 = z.infer<typeof humanAssessmentRecordV0>

/** Durable ImprovementItem row. */
export const improvementItemRecordV0 = z.object({
  ...evaluationEnvelopeV0,
  sourceRunRefs: z.array(z.string().min(1)),
  sourceRuleResultRefs: z.array(z.string().min(1)),
  targetRefs: z.array(exactRefV0),
  failureType: z.string().min(1),
  summary: z.string().min(1),
  impact: z.string().min(1),
  suggestedPriority: z.enum(['low', 'medium', 'high']),
  suggestedOwnerRole: z.string().min(1),
  dedupeKey: z.string().min(1),
  createdAt: z.iso.datetime(),
}).strict()

/** Durable ImprovementItem record. */
export type ImprovementItemRecordV0 = z.infer<typeof improvementItemRecordV0>

/** Durable ImprovementEvent row. */
export const improvementEventRecordV0 = z.object({
  itemId: z.string().min(1),
  action: z.enum(['proposed', 'accepted', 'deferred', 'planned', 'resolved', 'wont_fix', 'superseded', 'reopened']),
  actor: z.literal('local_planner'),
  reason: z.string().min(1),
  resolutionRefs: z.array(z.string()),
  occurredAt: z.iso.datetime(),
}).strict()

/** Durable ImprovementEvent record. */
export type ImprovementEventRecordV0 = z.infer<typeof improvementEventRecordV0>

/** Durable EvaluationReportArtifact row. */
export const evaluationReportArtifactRecordV0 = z.object({
  runId: z.string().min(1),
  format: z.enum(['canonical_json', 'markdown']),
  snapshotHash: z.string().min(1),
  contentHash: z.string().min(1),
  rendererVersion: z.string().min(1),
  generatedAt: z.iso.datetime(),
  visibility: z.enum(['project_private', 'internal_demo', 'public_rebuild', 'view_only']),
  redacted: z.array(z.string()),
  text: z.string(),
}).strict()

/** Durable EvaluationReportArtifact record. */
export type EvaluationReportArtifactRecordV0 = z.infer<typeof evaluationReportArtifactRecordV0>
