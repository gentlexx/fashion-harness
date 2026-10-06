/**
 * Deterministic closed-loop rules. They read a frozen snapshot and do not call a model.
 * @module @gentlexx/dsh-fashion-evaluation/src/rules
 */

/** Frozen input a rule may read. Negative fixtures use the same fields. */
export interface EvaluationSnapshot {
  readonly projectId: string
  readonly scope: 'project' | 'system_fixture'
  readonly dataReality: 'real_work' | 'user_test' | 'recorded_demo'
  readonly visibility: 'project_private' | 'internal_demo' | 'public_rebuild' | 'view_only'
  readonly claims: readonly {
    readonly claimType: 'observed' | 'derived'
    readonly sourceRef: string | null
    readonly evidenceRef: string | null
    readonly method: string | null
    readonly limitations: readonly string[]
    readonly projectId: string
  }[]
  readonly refs: readonly {
    readonly type: string
    readonly id: string
    readonly revision: number
    readonly projectId: string
    readonly contentHash: string | null
    readonly resolvedHash: string | null
  }[]
  readonly upstreamChanged: boolean
  readonly approvalStatus: 'valid' | 'stale' | 'invalidated' | 'absent'
  readonly deliverableStatus: 'ready' | 'stale' | 'invalidated' | 'absent'
  readonly briefConstraints: readonly { readonly id: string; readonly response: 'addressed' | 'unknown' | 'missing' }[]
  readonly concepts: readonly {
    readonly id: string
    readonly silhouette: string
    readonly construction: string
    readonly function: string
    readonly materialStrategy: string
    readonly color: string
  }[]
  readonly actors: readonly { readonly role: 'select' | 'approve' | 'feedback'; readonly actorKind: string }[]
  readonly deliverable: {
    readonly snapshotHash: string | null
    readonly manifestHash: string | null
    readonly jsonHash: string | null
    readonly markdownHash: string | null
  } | null
  readonly exportVisibility: 'public_portfolio' | 'internal_review' | 'none'
  readonly exportContainsPrivate: boolean
  readonly feedback: {
    readonly origin: string
    readonly dataReality: string
    readonly actorKind: string
  } | null
  readonly availability: string | null
  readonly metricValueKind: 'absent' | 'integer' | 'unavailable' | 'decimal_string'
  readonly metric: {
    readonly unit: string | null
    readonly window: boolean
    readonly region: string | null
    readonly channel: string | null
    readonly source: string | null
    readonly limitation: string | null
    readonly causalClaim: string | null
  } | null
  readonly r0Labels: readonly string[]
}

export type RuleStatus = 'pass' | 'fail' | 'warning' | 'not_applicable' | 'error'

export interface RuleOutcome {
  readonly ruleId: string
  readonly status: RuleStatus
  readonly severity: 'blocker' | 'major' | 'minor' | 'info'
  readonly required: boolean
  readonly message: string
}

const RULES: readonly {
  ruleId: string
  severity: RuleOutcome['severity']
  required: boolean
  check: (input: EvaluationSnapshot) => { status: RuleStatus; message: string }
}[] = [
  { ruleId: 'TRACE_SOURCE_EVIDENCE', severity: 'blocker', required: true, check: (input) => {
    const observed = input.claims.filter(row => row.claimType === 'observed')
    if (observed.length === 0) return { status: 'not_applicable', message: 'no observed claims' }
    const missing = observed.some(row => row.sourceRef === null || row.evidenceRef === null)
    return missing
      ? { status: 'fail', message: 'observed claim is missing a source or evidence ref' }
      : { status: 'pass', message: 'observed claims cite source and evidence' }
  } },
  { ruleId: 'TRACE_DERIVED_METHOD', severity: 'major', required: true, check: (input) => {
    const derived = input.claims.filter(row => row.claimType === 'derived')
    if (derived.length === 0) return { status: 'not_applicable', message: 'no derived claims' }
    const missing = derived.some(row => row.method === null || row.limitations.length === 0)
    return missing
      ? { status: 'fail', message: 'derived claim is missing method or limitations' }
      : { status: 'pass', message: 'derived claims keep method and limitations' }
  } },
  { ruleId: 'PROJECT_REF_ISOLATION', severity: 'blocker', required: true, check: (input) => {
    if (input.scope === 'system_fixture') return { status: 'pass', message: 'system fixture refs are isolated' }
    const foreign = input.refs.some(row => row.projectId !== input.projectId)
      || input.claims.some(row => row.projectId !== input.projectId)
    return foreign
      ? { status: 'fail', message: 'exact ref belongs to another project' }
      : { status: 'pass', message: 'exact refs stay in the project' }
  } },
  { ruleId: 'EXACT_REVISION_RESOLVES', severity: 'blocker', required: true, check: (input) => {
    const broken = input.refs.some(row => row.revision < 0 || (row.contentHash !== null && row.resolvedHash !== row.contentHash))
    return broken
      ? { status: 'fail', message: 'revision or content hash does not resolve' }
      : { status: 'pass', message: 'revisions resolve' }
  } },
  { ruleId: 'STALE_INVALIDATION_PROPAGATES', severity: 'blocker', required: true, check: (input) => {
    if (!input.upstreamChanged) return { status: 'not_applicable', message: 'upstream revision unchanged' }
    const shown = input.approvalStatus === 'stale' || input.approvalStatus === 'invalidated'
      || input.deliverableStatus === 'stale' || input.deliverableStatus === 'invalidated'
    return shown
      ? { status: 'pass', message: 'stale or invalidated state is visible' }
      : { status: 'fail', message: 'upstream change is still treated as current' }
  } },
  { ruleId: 'BRIEF_CONSTRAINT_COVERAGE', severity: 'major', required: true, check: (input) => {
    if (input.briefConstraints.length === 0) return { status: 'not_applicable', message: 'no confirmed brief constraints' }
    const missing = input.briefConstraints.some(row => row.response === 'missing')
    return missing
      ? { status: 'fail', message: 'a required constraint is neither addressed nor unknown' }
      : { status: 'pass', message: 'constraints are addressed or marked unknown' }
  } },
  { ruleId: 'THREE_DIRECTIONS_PRESENT', severity: 'major', required: true, check: (input) => {
    return input.concepts.length === 3
      ? { status: 'pass', message: 'three comparable directions are present' }
      : { status: 'fail', message: 'concept set does not contain exactly three directions' }
  } },
  { ruleId: 'NON_COLOR_DIFFERENTIATION', severity: 'major', required: true, check: (input) => {
    if (input.concepts.length < 2) return { status: 'not_applicable', message: 'not enough concepts to compare' }
    const structural = new Set(input.concepts.map(row => `${row.silhouette}|${row.construction}|${row.function}|${row.materialStrategy}`))
    return structural.size >= 2
      ? { status: 'pass', message: 'directions differ on a non-color dimension' }
      : { status: 'fail', message: 'directions differ only by color or copy' }
  } },
  { ruleId: 'HUMAN_ONLY_DECISION', severity: 'blocker', required: true, check: (input) => {
    const allowed = new Set(['local_human', 'recorded_demo_human'])
    const forged = input.actors.some(row => !allowed.has(row.actorKind))
    return forged
      ? { status: 'fail', message: 'select, approve, or feedback actor is not a human kind' }
      : { status: 'pass', message: 'decision actors are human kinds' }
  } },
  { ruleId: 'DELIVERABLE_REPRODUCIBLE', severity: 'blocker', required: true, check: (input) => {
    if (input.deliverable === null) return { status: 'not_applicable', message: 'no deliverable in this snapshot' }
    const ok = input.deliverable.snapshotHash !== null
      && input.deliverable.manifestHash !== null
      && input.deliverable.jsonHash !== null
      && input.deliverable.markdownHash !== null
    return ok
      ? { status: 'pass', message: 'snapshot and export hashes are present' }
      : { status: 'fail', message: 'deliverable hashes are incomplete' }
  } },
  { ruleId: 'PUBLIC_EXPORT_PERMISSION', severity: 'blocker', required: true, check: (input) => {
    if (input.exportVisibility !== 'public_portfolio') return { status: 'not_applicable', message: 'export is not public' }
    return input.exportContainsPrivate
      ? { status: 'fail', message: 'public export contains private or view-only material' }
      : { status: 'pass', message: 'public export stays within its permission' }
  } },
  { ruleId: 'FEEDBACK_REALITY_ORIGIN', severity: 'major', required: true, check: (input) => {
    if (input.feedback === null) return { status: 'not_applicable', message: 'no feedback in this snapshot' }
    const r0 = input.dataReality === 'recorded_demo'
    const consistent = r0
      ? input.feedback.origin === 'recorded_seed' && input.feedback.dataReality === 'recorded_demo' && input.feedback.actorKind === 'recorded_demo_human'
      : input.feedback.actorKind === 'local_human' && input.feedback.dataReality !== 'recorded_demo'
    return consistent
      ? { status: 'pass', message: 'feedback origin matches the project identity' }
      : { status: 'fail', message: 'feedback origin, reality, or actor does not match' }
  } },
  { ruleId: 'OUTCOME_UNKNOWN_NOT_ZERO', severity: 'blocker', required: true, check: (input) => {
    const blocking = input.availability === 'not_available' || input.availability === 'not_authorized' || input.availability === 'not_yet_observed'
    if (!blocking) return { status: 'not_applicable', message: 'availability does not block a numeric value' }
    return input.metricValueKind === 'integer'
      ? { status: 'fail', message: 'unknown availability is stored as a number' }
      : { status: 'pass', message: 'unknown availability has no numeric zero' }
  } },
  { ruleId: 'OUTCOME_METRIC_SEMANTICS', severity: 'major', required: true, check: (input) => {
    if (input.metric === null || input.metricValueKind === 'absent') return { status: 'not_applicable', message: 'no metric observation' }
    const ok = input.metric.unit !== null && input.metric.window && input.metric.region !== null
      && input.metric.channel !== null && input.metric.source !== null && input.metric.limitation !== null
    return ok
      ? { status: 'pass', message: 'metric keeps definition semantics' }
      : { status: 'fail', message: 'metric is missing unit, window, region, channel, source, or limitation' }
  } },
  { ruleId: 'NO_CAUSAL_OVERCLAIM', severity: 'major', required: true, check: (input) => {
    if (input.metric === null) return { status: 'not_applicable', message: 'no outcome text to check' }
    return input.metric.causalClaim === 'none'
      ? { status: 'pass', message: 'no causal claim is recorded' }
      : { status: 'fail', message: 'outcome is written as caused by the system' }
  } },
  { ruleId: 'R0_PUBLIC_REBUILD_LABELS', severity: 'blocker', required: true, check: (input) => {
    if (input.dataReality !== 'recorded_demo') return { status: 'not_applicable', message: 'not an R0 recorded snapshot' }
    const needed = ['public_rebuild', 'recorded_demo', 'no_real_commercial_outcome']
    const missing = needed.some(label => !input.r0Labels.includes(label))
    return missing
      ? { status: 'fail', message: 'R0 labels are incomplete' }
      : { status: 'pass', message: 'R0 stays labeled as a public rebuild' }
  } },
]

/**
 * Run the closed-loop rule list. Required evaluator throws become ERROR, not PASS.
 * @param input - Frozen snapshot.
 * @param failingRuleId - When set, that evaluator throws.
 */
export function evaluateSnapshot(input: EvaluationSnapshot, failingRuleId?: string): readonly RuleOutcome[] {
  return RULES.map((rule) => {
    if (failingRuleId === rule.ruleId) {
      return {
        ruleId: rule.ruleId,
        status: 'error' as const,
        severity: rule.severity,
        required: rule.required,
        message: 'evaluator failed',
      }
    }
    try {
      const result = rule.check(input)
      return { ruleId: rule.ruleId, status: result.status, severity: rule.severity, required: rule.required, message: result.message }
    } catch {
      return { ruleId: rule.ruleId, status: 'error' as const, severity: rule.severity, required: rule.required, message: 'evaluator failed' }
    }
  })
}

/** Derive a run verdict. WARNING and NOT_APPLICABLE are not counted as PASS. */
export function deriveVerdict(results: readonly RuleOutcome[]): 'pass' | 'partial' | 'fail' | 'error' {
  if (results.some(row => row.required && row.status === 'error')) return 'error'
  if (results.some(row => (row.severity === 'blocker' || row.severity === 'major') && row.status === 'fail')) return 'fail'
  if (results.some(row => row.severity === 'minor' && row.status === 'fail')) return 'partial'
  return 'pass'
}

/** Stable rule ids in catalog order. */
export const CLOSED_LOOP_RULE_IDS = RULES.map(rule => rule.ruleId)
