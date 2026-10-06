/**
 * Published closed-loop definition and case catalog for R0 seed.
 * @module @gentlexx/dsh-fashion-evaluation/src/catalog
 */

import { createHash } from 'node:crypto'
import { NEGATIVE_CASES } from './fixtures.ts'
import { CLOSED_LOOP_RULE_IDS, type EvaluationSnapshot } from './rules.ts'
import type { EvaluationCaseRecordV0, EvaluationDefinitionRecordV0 } from './schema/v0/records.ts'
import { EvaluationCaseId, EvaluationDefinitionId } from './ids.ts'
import type { EvaluationCaseId as CaseId, EvaluationDefinitionId as DefinitionId } from './types.ts'

/** Evaluator bundle version for closed-loop-integrity-v0. */
export const EVALUATOR_BUNDLE_VERSION = 'closed-loop-integrity-v0'

/** Stable R0 definition id. */
export const R0_DEFINITION_ID = EvaluationDefinitionId('closed-loop-integrity-v0')

/** Stable R0 positive case id. */
export const R0_POSITIVE_CASE_ID = EvaluationCaseId('r0-utility-jacket-positive-v0')

/** Stable recorded R0 run id. */
export const R0_RUN_ID = 'r0-closed-loop-run-v0'

/** Human rubric id referenced by the definition. */
export const HUMAN_RUBRIC_REF = 'fashion-designer-usefulness-v0'

const R0_RECORDED_AT = '2026-03-01T00:00:00.000Z'

const RULE_META: Record<string, { category: string; title: string; severity: 'blocker' | 'major' | 'minor' | 'info' }> = {
  TRACE_SOURCE_EVIDENCE: { category: 'Traceability', title: 'Observed claims cite source and evidence', severity: 'blocker' },
  TRACE_DERIVED_METHOD: { category: 'Traceability', title: 'Derived claims keep method and limitations', severity: 'major' },
  PROJECT_REF_ISOLATION: { category: 'Isolation', title: 'Exact refs stay in one project', severity: 'blocker' },
  EXACT_REVISION_RESOLVES: { category: 'Revision', title: 'Revisions and hashes resolve', severity: 'blocker' },
  STALE_INVALIDATION_PROPAGATES: { category: 'Revision', title: 'Stale or invalidated state is visible', severity: 'blocker' },
  BRIEF_CONSTRAINT_COVERAGE: { category: 'Brief', title: 'Brief constraints are addressed or unknown', severity: 'major' },
  THREE_DIRECTIONS_PRESENT: { category: 'Concept', title: 'Three comparable directions are present', severity: 'major' },
  NON_COLOR_DIFFERENTIATION: { category: 'Concept', title: 'Directions differ on a non-color dimension', severity: 'major' },
  HUMAN_ONLY_DECISION: { category: 'Human', title: 'Decision actors are human kinds', severity: 'blocker' },
  DELIVERABLE_REPRODUCIBLE: { category: 'Deliverable', title: 'Deliverable hashes are complete', severity: 'blocker' },
  PUBLIC_EXPORT_PERMISSION: { category: 'Privacy', title: 'Public export stays within permission', severity: 'blocker' },
  FEEDBACK_REALITY_ORIGIN: { category: 'Feedback', title: 'Feedback origin matches project identity', severity: 'major' },
  OUTCOME_UNKNOWN_NOT_ZERO: { category: 'Outcome', title: 'Unknown availability has no numeric zero', severity: 'blocker' },
  OUTCOME_METRIC_SEMANTICS: { category: 'Outcome', title: 'Metric keeps definition semantics', severity: 'major' },
  NO_CAUSAL_OVERCLAIM: { category: 'Outcome', title: 'No causal claim is recorded', severity: 'major' },
  R0_PUBLIC_REBUILD_LABELS: { category: 'R0', title: 'R0 stays labeled as a public rebuild', severity: 'blocker' },
}

/** R0 positive frozen snapshot. */
export const R0_POSITIVE_SNAPSHOT: EvaluationSnapshot = {
  projectId: 'r0-us-womens-khaki-utility-jacket',
  scope: 'project',
  dataReality: 'recorded_demo',
  visibility: 'public_rebuild',
  claims: [{
    claimType: 'observed',
    sourceRef: 'r0-public-page',
    evidenceRef: 'r0-evidence',
    method: null,
    limitations: ['public rebuild'],
    projectId: 'r0-us-womens-khaki-utility-jacket',
  }],
  refs: [{
    type: 'deliverable',
    id: 'r0-deliverable-public-portfolio',
    revision: 0,
    projectId: 'r0-us-womens-khaki-utility-jacket',
    contentHash: 'abc',
    resolvedHash: 'abc',
  }],
  upstreamChanged: false,
  approvalStatus: 'valid',
  deliverableStatus: 'ready',
  briefConstraints: [{ id: 'cost', response: 'unknown' }],
  concepts: [
    { id: 'urban', silhouette: 'relaxed', construction: 'patch', function: 'commute', materialStrategy: 'twill', color: 'khaki' },
    { id: 'cropped', silhouette: 'boxy', construction: 'flap', function: 'structure', materialStrategy: 'canvas', color: 'sand' },
    { id: 'light', silhouette: 'aline', construction: 'zip', function: 'weather', materialStrategy: 'nylon', color: 'stone' },
  ],
  actors: [
    { role: 'select', actorKind: 'recorded_demo_human' },
    { role: 'approve', actorKind: 'recorded_demo_human' },
    { role: 'feedback', actorKind: 'recorded_demo_human' },
  ],
  deliverable: { snapshotHash: 'aa', manifestHash: 'bb', jsonHash: 'cc', markdownHash: 'dd' },
  exportVisibility: 'public_portfolio',
  exportContainsPrivate: false,
  feedback: { origin: 'recorded_seed', dataReality: 'recorded_demo', actorKind: 'recorded_demo_human' },
  availability: 'not_available',
  metricValueKind: 'absent',
  metric: null,
  r0Labels: ['public_rebuild', 'recorded_demo', 'no_real_commercial_outcome'],
}

/**
 * Stable content hash for a snapshot body.
 * @param value - Snapshot or definition body.
 */
export function hashContent(value: unknown): string {
  return createHash('sha256').update(`${JSON.stringify(value)}\n`).digest('hex')
}

function envelope(
  origin: EvaluationDefinitionRecordV0['origin'],
  dataReality: EvaluationDefinitionRecordV0['dataReality'],
  visibility: EvaluationDefinitionRecordV0['visibility'],
  createdBy: string,
): Pick<EvaluationDefinitionRecordV0, 'projectId' | 'schemaVersion' | 'origin' | 'dataReality' | 'visibility' | 'createdBy' | 'createdAt' | 'contentVersion' | 'archivedAt'> {
  return {
    projectId: null,
    schemaVersion: 0,
    origin,
    dataReality,
    visibility,
    createdBy,
    createdAt: R0_RECORDED_AT,
    contentVersion: 0,
    archivedAt: null,
  }
}

/** Published closed-loop definition seed row. */
export function buildDefinitionSeed(): { id: DefinitionId; record: EvaluationDefinitionRecordV0 } {
  const ruleDefinitions = CLOSED_LOOP_RULE_IDS.map((ruleId) => {
    const meta = RULE_META[ruleId]
    if (meta === undefined) throw new Error(`missing rule metadata: ${ruleId}`)
    return {
      ruleId,
      ruleVersion: 'v0',
      category: meta.category,
      title: meta.title,
      severity: meta.severity,
      required: true,
    }
  })
  const body = {
    definitionVersion: 'v0',
    name: 'Closed-loop integrity',
    objective: 'Verify evidence, isolation, revision, design, human, deliverable, privacy, feedback, and outcome rules.',
    scope: 'closed_loop_integrity' as const,
    evaluatorBundleVersion: EVALUATOR_BUNDLE_VERSION,
    ruleDefinitions,
    humanRubricRef: HUMAN_RUBRIC_REF,
    passPolicy: {
      requiredErrorIsError: true as const,
      blockerOrMajorFailIsFail: true as const,
      minorFailIsPartial: true as const,
      warningNotPass: true as const,
      notApplicableNotPass: true as const,
    },
    status: 'published' as const,
  }
  const record: EvaluationDefinitionRecordV0 = {
    ...envelope('recorded_seed', 'recorded_demo', 'public_rebuild', 'recorded-demo'),
    ...body,
    contentHash: hashContent(body),
  }
  return { id: R0_DEFINITION_ID, record }
}

function caseRecord(
  caseId: string,
  title: string,
  objective: string,
  fixtureKind: EvaluationCaseRecordV0['fixtureKind'],
  snapshot: EvaluationSnapshot,
  expectedRuleOutcomes: EvaluationCaseRecordV0['expectedRuleOutcomes'],
  failureIntent: EvaluationCaseRecordV0['failureIntent'],
): { id: CaseId; record: EvaluationCaseRecordV0 } {
  const body = {
    caseVersion: 'v0',
    title,
    objective,
    caseMode: fixtureKind === 'recorded_public' ? 'project_snapshot' as const : 'isolated_fixture' as const,
    fixtureKind,
    inputHash: hashContent(snapshot),
    expectedRuleOutcomes,
    expectedVerdict: 'pass' as const,
    failureIntent,
    usageBoundary: fixtureKind === 'recorded_public' ? 'public_rebuild' : 'internal_demo',
    status: 'published' as const,
    snapshot: snapshot as unknown as Record<string, unknown>,
  }
  const record: EvaluationCaseRecordV0 = {
    ...envelope(
      'recorded_seed',
      fixtureKind === 'recorded_public' ? 'recorded_demo' : 'user_test',
      fixtureKind === 'recorded_public' ? 'public_rebuild' : 'internal_demo',
      'recorded-demo',
    ),
    ...body,
    contentHash: hashContent(body),
  }
  return { id: EvaluationCaseId(caseId), record }
}

/** Queue-exercise case: expected failure used only for improvement-queue verification. */
export const QUEUE_EXERCISE_CASE_ID = EvaluationCaseId('queue-exercise-color-only-v0')

/** All published case seeds including R0 positive, eight negatives, and queue exercise. */
export function buildCaseSeeds(): readonly { id: CaseId; record: EvaluationCaseRecordV0 }[] {
  const positive = caseRecord(
    String(R0_POSITIVE_CASE_ID),
    'R0 utility jacket positive',
    'Public rebuild positive path from source through recorded feedback.',
    'recorded_public',
    R0_POSITIVE_SNAPSHOT,
    CLOSED_LOOP_RULE_IDS.map(ruleId => ({ ruleId, status: 'pass' as const })),
    null,
  )
  const negatives = NEGATIVE_CASES.map(item => caseRecord(
    item.caseId,
    item.caseId,
    `Isolated negative: expect ${item.ruleId} to fail.`,
    'synthetic_negative',
    item.snapshot,
    [{ ruleId: item.ruleId, status: 'fail' }],
    'regression',
  ))
  const queueSource = NEGATIVE_CASES.find(row => row.caseId === 'concepts-differ-only-by-color-v0')
  if (queueSource === undefined) throw new Error('missing queue exercise source case')
  const queue = caseRecord(
    String(QUEUE_EXERCISE_CASE_ID),
    'Queue exercise color-only',
    'user_test queue exercise: intentionally fail NON_COLOR_DIFFERENTIATION to propose an improvement.',
    'queue_exercise',
    queueSource.snapshot,
    [{ ruleId: 'NON_COLOR_DIFFERENTIATION', status: 'fail' }],
    'queue_exercise',
  )
  return [positive, ...negatives, queue]
}

/** Human rubric criteria for fashion-designer-usefulness-v0. */
export const HUMAN_RUBRIC_CRITERIA = [
  'research_evidence_useful',
  'trend_interpretation_credible',
  'opportunity_brief_worth_continuing',
  'three_directions_truly_different',
  'originality_helps_thinking',
  'visual_matches_structure',
  'handoff_enough_for_next_step',
  'feedback_entry_burden_acceptable',
] as const
