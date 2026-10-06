/**
 * Fixed negative snapshots. They are not written into a real Project.
 * @module @gentlexx/dsh-fashion-evaluation/src/fixtures
 */

import type { EvaluationSnapshot } from './rules.ts'

function base(overrides: Partial<EvaluationSnapshot>): EvaluationSnapshot {
  return {
    projectId: 'fixture',
    scope: 'system_fixture',
    dataReality: 'user_test',
    visibility: 'internal_demo',
    claims: [{
      claimType: 'observed',
      sourceRef: 'source-1',
      evidenceRef: 'evidence-1',
      method: null,
      limitations: [],
      projectId: 'fixture',
    }],
    refs: [{ type: 'deliverable', id: 'd1', revision: 0, projectId: 'fixture', contentHash: null, resolvedHash: null }],
    upstreamChanged: false,
    approvalStatus: 'valid',
    deliverableStatus: 'ready',
    briefConstraints: [{ id: 'c1', response: 'unknown' }],
    concepts: [
      { id: 'a', silhouette: 'box', construction: 'flap', function: 'layer', materialStrategy: 'canvas', color: 'sand' },
      { id: 'b', silhouette: 'aline', construction: 'zip', function: 'weather', materialStrategy: 'nylon', color: 'stone' },
      { id: 'c', silhouette: 'relaxed', construction: 'pocket', function: 'commute', materialStrategy: 'twill', color: 'khaki' },
    ],
    actors: [
      { role: 'select', actorKind: 'local_human' },
      { role: 'approve', actorKind: 'local_human' },
      { role: 'feedback', actorKind: 'local_human' },
    ],
    deliverable: { snapshotHash: 'a', manifestHash: 'b', jsonHash: 'c', markdownHash: 'd' },
    exportVisibility: 'internal_review',
    exportContainsPrivate: false,
    feedback: { origin: 'manual_entry', dataReality: 'user_test', actorKind: 'local_human' },
    availability: 'available_partial',
    metricValueKind: 'absent',
    metric: null,
    r0Labels: [],
    ...overrides,
  }
}

/** Eight isolated negative fixtures and the rule that must fail. */
export const NEGATIVE_CASES: readonly { caseId: string; ruleId: string; snapshot: EvaluationSnapshot }[] = [
  {
    caseId: 'observed-claim-without-source-v0',
    ruleId: 'TRACE_SOURCE_EVIDENCE',
    snapshot: base({
      claims: [{ claimType: 'observed', sourceRef: null, evidenceRef: null, method: null, limitations: [], projectId: 'fixture' }],
    }),
  },
  {
    caseId: 'concepts-differ-only-by-color-v0',
    ruleId: 'NON_COLOR_DIFFERENTIATION',
    snapshot: base({
      concepts: [
        { id: 'a', silhouette: 'box', construction: 'flap', function: 'layer', materialStrategy: 'canvas', color: 'sand' },
        { id: 'b', silhouette: 'box', construction: 'flap', function: 'layer', materialStrategy: 'canvas', color: 'stone' },
        { id: 'c', silhouette: 'box', construction: 'flap', function: 'layer', materialStrategy: 'canvas', color: 'khaki' },
      ],
    }),
  },
  {
    caseId: 'system-actor-approves-v0',
    ruleId: 'HUMAN_ONLY_DECISION',
    snapshot: base({ actors: [{ role: 'approve', actorKind: 'system' }] }),
  },
  {
    caseId: 'stale-deliverable-treated-current-v0',
    ruleId: 'STALE_INVALIDATION_PROPAGATES',
    snapshot: base({ upstreamChanged: true, approvalStatus: 'valid', deliverableStatus: 'ready' }),
  },
  {
    caseId: 'private-evidence-public-export-v0',
    ruleId: 'PUBLIC_EXPORT_PERMISSION',
    snapshot: base({ exportVisibility: 'public_portfolio', exportContainsPrivate: true }),
  },
  {
    caseId: 'outcome-unavailable-as-zero-v0',
    ruleId: 'OUTCOME_UNKNOWN_NOT_ZERO',
    snapshot: base({ availability: 'not_available', metricValueKind: 'integer' }),
  },
  {
    caseId: 'metric-missing-semantics-v0',
    ruleId: 'OUTCOME_METRIC_SEMANTICS',
    snapshot: base({
      availability: 'available',
      metricValueKind: 'decimal_string',
      metric: { unit: null, window: false, region: null, channel: null, source: null, limitation: null, causalClaim: 'system_caused_sales' },
    }),
  },
  {
    caseId: 'cross-project-exact-ref-v0',
    ruleId: 'PROJECT_REF_ISOLATION',
    snapshot: base({
      scope: 'project',
      projectId: 'project-a',
      refs: [{ type: 'evidence', id: 'e2', revision: 0, projectId: 'project-b', contentHash: null, resolvedHash: null }],
    }),
  },
]
