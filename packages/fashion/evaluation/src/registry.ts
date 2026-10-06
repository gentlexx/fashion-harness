/**
 * Fashion Evaluation registry (`ctx.fashionEvaluationRegistry`) over `fashion_evaluation@0`.
 * Reads upstream only through public registries. Does not write F2–F4-01 storage.
 * @module @gentlexx/dsh-fashion-evaluation/src/registry
 */

import { execFileSync } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import { Context, Service } from '@deepseek-ai/cordis'
import type {} from '@gentlexx/dsh-fashion-feedback'
import { R0_PROJECT_ID } from '@gentlexx/dsh-fashion-project'
import type { ProjectId } from '@gentlexx/dsh-fashion-project/types'
import type { KvTable } from '@deepseek-ai/dsh-storage-domain'
import {
  buildCaseSeeds,
  buildDefinitionSeed,
  EVALUATOR_BUNDLE_VERSION,
  hashContent,
  HUMAN_RUBRIC_CRITERIA,
  QUEUE_EXERCISE_CASE_ID,
  R0_DEFINITION_ID,
  R0_POSITIVE_CASE_ID,
  R0_RUN_ID,
} from './catalog.ts'
import {
  FashionEvaluationAssessmentHeadConflictError,
  FashionEvaluationCaseNotPublishedError,
  FashionEvaluationCrossProjectError,
  FashionEvaluationDefinitionNotPublishedError,
  FashionEvaluationHumanRequiredError,
  FashionEvaluationImprovementTransitionError,
  FashionEvaluationInvalidInputError,
  FashionEvaluationNotFoundError,
  FashionEvaluationPlannerConfirmationError,
  FashionEvaluationProjectNotFoundError,
  FashionEvaluationProjectReadOnlyError,
  FashionEvaluationSeedConflictError,
  FashionEvaluationVersionConflictError,
} from './errors.ts'
import {
  EvaluationCaseId as brandCaseId,
  EvaluationReportArtifactId as brandReportId,
  EvaluationRunId as brandRunId,
  HumanAssessmentId as brandAssessmentId,
  ImprovementEventId as brandEventId,
  ImprovementItemId as brandItemId,
  RuleResultId as brandResultId,
} from './ids.ts'
import { compareEvaluationCreatedDesc } from './order.ts'
import { renderReport } from './report.ts'
import { deriveVerdict, evaluateSnapshot, type EvaluationSnapshot, type RuleStatus } from './rules.ts'
import type {
  EvaluationCaseRecordV0,
  EvaluationDefinitionRecordV0,
  EvaluationReportArtifactRecordV0,
  EvaluationRunRecordV0,
  HumanAssessmentRecordV0,
  ImprovementEventRecordV0,
  ImprovementItemRecordV0,
  RuleResultRecordV0,
} from './schema/v0/records.ts'
import { fashionEvaluationDomainSpec } from './spec.ts'
import type {
  CurrentImprovement,
  EvaluationCase,
  EvaluationCaseId,
  EvaluationDefinition,
  EvaluationDefinitionId,
  EvaluationReportArtifact,
  EvaluationReportArtifactId,
  EvaluationRun,
  EvaluationRunId,
  HumanAssessment,
  HumanAssessmentId,
  HumanRating,
  ImprovementAction,
  ImprovementEvent,
  ImprovementEventId,
  ImprovementItem,
  ImprovementItemId,
  RuleResult,
  RuleResultId,
  RunVerdict,
} from './types.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    fashionEvaluationRegistry: FashionEvaluationRegistry
  }
}

const ALLOWED_TRANSITIONS: Record<ImprovementAction, readonly ImprovementAction[]> = {
  proposed: ['accepted', 'deferred', 'wont_fix', 'superseded'],
  accepted: ['planned', 'deferred', 'wont_fix', 'superseded'],
  deferred: ['accepted', 'planned', 'wont_fix', 'reopened'],
  planned: ['resolved', 'wont_fix', 'superseded', 'reopened'],
  resolved: ['reopened'],
  wont_fix: ['reopened'],
  superseded: [],
  reopened: ['accepted', 'deferred', 'planned', 'wont_fix'],
}

function mintId<T extends string>(brand: (id: string) => T, occupied: (id: T) => boolean): T {
  let id = brand(randomUUID())
  if (!occupied(id)) return id
  id = brand(randomUUID())
  if (occupied(id)) throw new FashionEvaluationVersionConflictError(`id-collision:${String(id)}`)
  return id
}

function tableHas<K extends string, V>(table: KvTable<K, V>, id: K): boolean {
  return table.get(id) !== undefined
}

const CANDIDATE_REASON_MAX_CHARS = 280

function boundedReason(sources: readonly (string | null)[], fallback: string): string {
  const text = sources.map(source => source === null ? '' : source.trim()).find(source => source !== '')
  const reason = text === undefined ? fallback : text
  const chars = Array.from(reason)
  return chars.length <= CANDIDATE_REASON_MAX_CHARS ? reason : `${chars.slice(0, CANDIDATE_REASON_MAX_CHARS - 1).join('')}…`
}

/**
 * Host Fashion Evaluation registry over Storage Domain `fashion_evaluation@0`.
 */
export class FashionEvaluationRegistry extends Service {
  static inject = [
    'storageDomain',
    'fashionProjectRegistry',
    'fashionDesignRegistry',
    'fashionFeedbackRegistry',
  ]

  private definitions?: KvTable<EvaluationDefinitionId, EvaluationDefinitionRecordV0>
  private cases?: KvTable<EvaluationCaseId, EvaluationCaseRecordV0>
  private runs?: KvTable<EvaluationRunId, EvaluationRunRecordV0>
  private results?: KvTable<RuleResultId, RuleResultRecordV0>
  private assessments?: KvTable<HumanAssessmentId, HumanAssessmentRecordV0>
  private items?: KvTable<ImprovementItemId, ImprovementItemRecordV0>
  private events?: KvTable<ImprovementEventId, ImprovementEventRecordV0>
  private reports?: KvTable<EvaluationReportArtifactId, EvaluationReportArtifactRecordV0>
  private reconcileTail: Promise<void> = Promise.resolve()

  /** @param ctx - Host context. */
  constructor(ctx: Context) {
    super(ctx, 'fashionEvaluationRegistry')
  }

  /** Open the domain and ensure the R0 published seed. */
  protected async [Service.init](): Promise<void> {
    const domain = await this.ctx.storageDomain.open(fashionEvaluationDomainSpec)
    this.ctx.effect(() => () => domain.close(), 'fashionEvaluation.domainClose')
    this.definitions = domain.table('evaluation_definitions')
    this.cases = domain.table('evaluation_cases')
    this.runs = domain.table('evaluation_runs')
    this.results = domain.table('rule_results')
    this.assessments = domain.table('human_assessments')
    this.items = domain.table('improvement_items')
    this.events = domain.table('improvement_events')
    this.reports = domain.table('evaluation_report_artifacts')
    await this.ensureCatalog()
    await this.ensureR0Run()
  }

  /** List published definitions. */
  listDefinitions(): readonly EvaluationDefinition[] {
    const rows: EvaluationDefinition[] = []
    for (const [id, record] of this.requireDefinitions().entries()) {
      rows.push(this.toDefinition(id, record))
    }
    return rows
  }

  /**
   * Read one definition.
   * @param definitionId - Definition identity.
   */
  getDefinition(definitionId: EvaluationDefinitionId): EvaluationDefinition {
    const record = this.requireDefinitions().get(definitionId)
    if (record === undefined) throw new FashionEvaluationNotFoundError(String(definitionId))
    return this.toDefinition(definitionId, record)
  }

  /** List published cases. */
  listCases(): readonly EvaluationCase[] {
    const rows: EvaluationCase[] = []
    for (const [id, record] of this.requireCases().entries()) {
      rows.push(this.toCase(id, record))
    }
    return rows
  }

  /**
   * Read one case.
   * @param caseId - Case identity.
   */
  getCase(caseId: EvaluationCaseId): EvaluationCase {
    const record = this.requireCases().get(caseId)
    if (record === undefined) throw new FashionEvaluationNotFoundError(String(caseId))
    return this.toCase(caseId, record)
  }

  /**
   * Run published cases under a published definition. Always mints a new run id.
   * @param input - Definition, cases, and optional project scope.
   */
  async runEvaluation(input: {
    projectId: ProjectId | null
    definitionId: EvaluationDefinitionId
    caseIds: readonly EvaluationCaseId[]
    executor?: EvaluationRun['executor']
    dataReality?: EvaluationRun['dataReality']
    visibility?: EvaluationRun['visibility']
    systemVersion?: EvaluationRun['systemVersion']
    profile?: string
    startedAt?: string
    /** Seed-only stable run identity. Ordinary callers omit this. */
    fixedRunId?: EvaluationRunId
    /**
     * Host-only fault injection. When set, that rule's evaluator throws and the
     * run records ERROR. Remote commands do not accept this field.
     */
    evaluatorFaultRuleId?: string
  }): Promise<EvaluationRun> {
    const definition = this.requirePublishedDefinition(input.definitionId)
    if (input.projectId !== null) this.requireProject(input.projectId)
    if (input.caseIds.length === 0) throw new FashionEvaluationInvalidInputError('case-ids-required')
    const startedAt = input.startedAt ?? new Date().toISOString()
    const runId = input.fixedRunId ?? mintId(brandRunId, candidate => tableHas(this.requireRuns(), candidate))
    if (input.fixedRunId !== undefined && tableHas(this.requireRuns(), input.fixedRunId)) {
      throw new FashionEvaluationVersionConflictError(`run-exists:${String(input.fixedRunId)}`)
    }
    const ruleResultRefs: string[] = []
    const inputHashes: string[] = []
    const caseVerdicts: RunVerdict[] = []

    for (const caseId of input.caseIds) {
      const caseRow = this.requirePublishedCase(caseId)
      inputHashes.push(caseRow.inputHash)
      const snapshot = caseRow.snapshot as unknown as EvaluationSnapshot
      const raw = evaluateSnapshot(snapshot, input.evaluatorFaultRuleId)
      for (const outcome of raw) {
        const expected = caseRow.expectedRuleOutcomes.find(row => row.ruleId === outcome.ruleId)
        const status = this.mapCaseStatus(outcome.status, expected?.status, caseRow.fixtureKind)
        const resultId = mintId(brandResultId, candidate => tableHas(this.requireResults(), candidate))
        const record: RuleResultRecordV0 = {
          runId: String(runId),
          ruleId: outcome.ruleId,
          caseId: String(caseId),
          status,
          severity: outcome.severity,
          required: outcome.required,
          observed: outcome.status,
          expected: expected?.status ?? 'pass',
          message: status === 'pass' && outcome.status === 'fail' && expected?.status === 'fail'
            ? `expected rejection observed: ${outcome.message}`
            : outcome.message,
          evaluatorVersion: definition.evaluatorBundleVersion,
          limitations: caseRow.fixtureKind === 'synthetic_negative' || caseRow.fixtureKind === 'queue_exercise'
            ? ['isolated_fixture']
            : [],
        }
        await this.requireResults().put(resultId, record)
        ruleResultRefs.push(String(resultId))
      }
      caseVerdicts.push(this.caseVerdict(raw, caseRow))
    }

    const verdict = this.combineVerdicts(caseVerdicts)
    const finishedAt = startedAt
    const runRecord: EvaluationRunRecordV0 = {
      projectId: input.projectId === null ? null : String(input.projectId),
      schemaVersion: 0,
      origin: input.executor === 'recorded_seed' ? 'recorded_seed' : 'system_evaluation',
      dataReality: input.dataReality ?? (input.projectId !== null && String(input.projectId) === String(R0_PROJECT_ID)
        ? 'recorded_demo'
        : 'user_test'),
      visibility: input.visibility ?? (input.projectId !== null && String(input.projectId) === String(R0_PROJECT_ID)
        ? 'public_rebuild'
        : 'project_private'),
      createdBy: input.executor === 'recorded_seed' ? 'recorded-demo' : 'local-human',
      createdAt: startedAt,
      contentVersion: 0,
      archivedAt: null,
      definitionRef: { id: String(input.definitionId), definitionVersion: definition.definitionVersion },
      caseRefs: input.caseIds.map(String),
      inputHashes,
      systemVersion: input.systemVersion ?? captureWorktreeIdentity(),
      profile: input.profile ?? 'fashion',
      evaluatorBundleVersion: definition.evaluatorBundleVersion,
      startedAt,
      finishedAt,
      executor: input.executor ?? 'local_human_trigger',
      executionStatus: 'completed',
      verdict,
      ruleResultRefs,
      humanAssessmentRefs: [],
      reportArtifactRefs: [],
      limitations: [
        'Public-case rebuild / recorded rule evaluation / no real designer assessment / no real commercial outcome.',
      ],
    }
    await this.requireRuns().put(runId, runRecord)
    return this.toRun(runId, runRecord)
  }

  /**
   * Read one run.
   * @param runId - Run identity.
   */
  getEvaluationRun(runId: EvaluationRunId): EvaluationRun {
    const record = this.requireRuns().get(runId)
    if (record === undefined) throw new FashionEvaluationNotFoundError(String(runId))
    return this.toRun(runId, record)
  }

  /**
   * List runs for a project or system-scoped runs when projectId is null.
   * @param projectId - Owning project or null for system/R0.
   */
  listEvaluationRuns(projectId: ProjectId | null): readonly EvaluationRun[] {
    if (projectId !== null) this.requireProject(projectId)
    const rows: EvaluationRun[] = []
    for (const [id, record] of this.requireRuns().entries()) {
      if (projectId === null) {
        if (record.projectId !== null && record.projectId !== String(R0_PROJECT_ID)) continue
      } else if (record.projectId !== String(projectId)) {
        continue
      }
      rows.push(this.toRun(id, record))
    }
    rows.sort(compareEvaluationCreatedDesc)
    return rows
  }

  /**
   * List rule results for one run.
   * @param runId - Run identity.
   */
  getRuleResults(runId: EvaluationRunId): readonly RuleResult[] {
    this.getEvaluationRun(runId)
    const rows: RuleResult[] = []
    for (const [id, record] of this.requireResults().entries()) {
      if (record.runId !== String(runId)) continue
      rows.push(this.toResult(id, record))
    }
    return rows
  }

  /**
   * Record a human assessment. Host stamps local_human.
   * @param input - Assessment fields.
   */
  async recordHumanAssessment(input: {
    projectId: ProjectId
    runId: EvaluationRunId
    criterionId: string
    rating: HumanRating
    reason: string
    actorKind?: string
    recordedAt?: string
  }): Promise<HumanAssessment> {
    this.requireEditableProject(input.projectId)
    this.rejectForeignActor(input.actorKind)
    if (!HUMAN_RUBRIC_CRITERIA.includes(input.criterionId as typeof HUMAN_RUBRIC_CRITERIA[number])) {
      throw new FashionEvaluationInvalidInputError('unknown-criterion')
    }
    if (input.reason.trim() === '') throw new FashionEvaluationInvalidInputError('reason-required')
    const run = this.getEvaluationRun(input.runId)
    if (run.projectId !== null && String(run.projectId) !== String(input.projectId)) {
      throw new FashionEvaluationCrossProjectError(String(input.projectId), String(run.projectId))
    }
    const now = input.recordedAt ?? new Date().toISOString()
    const id = mintId(brandAssessmentId, candidate => tableHas(this.requireAssessments(), candidate))
    const record: HumanAssessmentRecordV0 = {
      projectId: String(input.projectId),
      schemaVersion: 0,
      origin: 'manual_entry',
      dataReality: 'user_test',
      visibility: 'project_private',
      createdBy: 'local-human',
      createdAt: now,
      contentVersion: 0,
      archivedAt: null,
      runId: String(input.runId),
      criterionId: input.criterionId,
      rating: input.rating,
      reason: input.reason,
      actorKind: 'local_human',
      recordedAt: now,
      supersedesAssessmentId: null,
    }
    await this.requireAssessments().put(id, record)
    return this.toAssessment(id, record)
  }

  /**
   * Append a superseding assessment.
   * @param input - New assessment plus expected head.
   */
  async supersedeHumanAssessment(input: {
    projectId: ProjectId
    runId: EvaluationRunId
    criterionId: string
    rating: HumanRating
    reason: string
    supersedesAssessmentId: HumanAssessmentId
    expectedHeadId: HumanAssessmentId
    actorKind?: string
    recordedAt?: string
  }): Promise<HumanAssessment> {
    this.requireEditableProject(input.projectId)
    this.rejectForeignActor(input.actorKind)
    const previous = this.requireAssessmentInProject(input.supersedesAssessmentId, input.projectId)
    const head = this.assessmentHead(input.runId, input.criterionId)
    if (String(head) !== String(input.expectedHeadId)) {
      throw new FashionEvaluationAssessmentHeadConflictError(String(input.expectedHeadId), String(head))
    }
    if (previous.criterionId !== input.criterionId) {
      throw new FashionEvaluationInvalidInputError('criterion-mismatch')
    }
    const now = input.recordedAt ?? new Date().toISOString()
    const id = mintId(brandAssessmentId, candidate => tableHas(this.requireAssessments(), candidate))
    const record: HumanAssessmentRecordV0 = {
      projectId: String(input.projectId),
      schemaVersion: 0,
      origin: 'manual_entry',
      dataReality: 'user_test',
      visibility: 'project_private',
      createdBy: 'local-human',
      createdAt: now,
      contentVersion: 0,
      archivedAt: null,
      runId: String(input.runId),
      criterionId: input.criterionId,
      rating: input.rating,
      reason: input.reason,
      actorKind: 'local_human',
      recordedAt: now,
      supersedesAssessmentId: String(input.supersedesAssessmentId),
    }
    await this.requireAssessments().put(id, record)
    return this.toAssessment(id, record)
  }

  /**
   * List assessments for a run. Missing criteria project as not_assessed in the UI.
   * @param runId - Run identity.
   */
  listHumanAssessments(runId: EvaluationRunId): readonly HumanAssessment[] {
    this.getEvaluationRun(runId)
    const rows: HumanAssessment[] = []
    for (const [id, record] of this.requireAssessments().entries()) {
      if (record.runId !== String(runId)) continue
      rows.push(this.toAssessment(id, record))
    }
    rows.sort(compareEvaluationCreatedDesc)
    return rows
  }

  /**
   * Propose improvement items from unexpected failures. Expected negatives that PASS do not create items.
   * @param input - Run and optional project scope.
   */
  async proposeImprovementFromFailures(input: {
    projectId: ProjectId
    runId: EvaluationRunId
    confirmedPlanner?: boolean
  }): Promise<readonly ImprovementItem[]> {
    this.requireEditableProject(input.projectId)
    const run = this.getEvaluationRun(input.runId)
    if (run.projectId !== null && String(run.projectId) !== String(input.projectId)) {
      throw new FashionEvaluationCrossProjectError(String(input.projectId), String(run.projectId))
    }
    const results = this.getRuleResults(input.runId)
    const created: ImprovementItem[] = []
    for (const result of results) {
      const caseRow = this.getCase(brandCaseId(result.caseId))
      if (caseRow.fixtureKind === 'synthetic_negative' && result.status === 'pass' && result.observed === 'fail') {
        continue
      }
      if (result.status !== 'fail' && result.status !== 'error') continue
      if (caseRow.failureIntent === 'regression' && result.expected === 'fail' && result.observed === 'fail') continue
      const dedupeKey = `${result.ruleId}|${result.caseId}|${caseRow.inputHash}`
      const existing = this.findByDedupe(dedupeKey)
      if (existing !== undefined) {
        if (!existing.record.sourceRunRefs.includes(String(input.runId))) {
          const updated: ImprovementItemRecordV0 = {
            ...existing.record,
            sourceRunRefs: [...existing.record.sourceRunRefs, String(input.runId)],
            sourceRuleResultRefs: [...existing.record.sourceRuleResultRefs, String(result.id)],
          }
          await this.requireItems().put(existing.id, updated)
          created.push(this.toItem(existing.id, updated))
        }
        continue
      }
      const now = run.finishedAt
      const id = mintId(brandItemId, candidate => tableHas(this.requireItems(), candidate))
      const isQueue = caseRow.failureIntent === 'queue_exercise'
      const record: ImprovementItemRecordV0 = {
        projectId: String(input.projectId),
        schemaVersion: 0,
        origin: 'system_evaluation',
        dataReality: isQueue ? 'user_test' : run.dataReality,
        visibility: isQueue ? 'internal_demo' : 'project_private',
        createdBy: 'local-human',
        createdAt: now,
        contentVersion: 0,
        archivedAt: null,
        sourceRunRefs: [String(input.runId)],
        sourceRuleResultRefs: [String(result.id)],
        targetRefs: [{
          type: 'evaluation_case',
          id: result.caseId,
          revision: 0,
          projectId: String(input.projectId),
          contentHash: caseRow.inputHash,
        }],
        failureType: result.status === 'error' ? 'evaluation_infrastructure' : result.ruleId,
        summary: result.message,
        impact: result.severity,
        suggestedPriority: result.severity === 'blocker' ? 'high' : result.severity === 'major' ? 'medium' : 'low',
        suggestedOwnerRole: 'local_planner',
        dedupeKey,
      }
      await this.requireItems().put(id, record)
      const eventId = mintId(brandEventId, candidate => tableHas(this.requireEvents(), candidate))
      await this.requireEvents().put(eventId, {
        itemId: String(id),
        action: 'proposed',
        actor: 'local_planner',
        reason: 'Automatic proposal from evaluation failure. Accept does not authorize Cursor.',
        resolutionRefs: [],
        occurredAt: now,
      })
      created.push(this.toItem(id, record))
    }
    return created
  }

  /**
   * Propose improvement candidates from human signals in one editable Project: each current, unarchived designer
   * feedback head with `followUpNeeded`, and each current human assessment head rated `does_not_meet`. A source
   * record yields at most one item for its Project (dedupe key `feedback|<project>|<id>` or
   * `assessment|<project>|<id>`). Each item keeps the source exact ref, the source data reality, and a bounded reason.
   * Proposing records only a `proposed` event; it never accepts the item or starts work. Calls are serialized so
   * concurrent reconciles cannot write the same candidate twice. Read-only Projects are left unchanged.
   * @param projectId - Owning project.
   * @returns Items created by this call.
   */
  reconcileImprovementCandidates(projectId: ProjectId): Promise<readonly ImprovementItem[]> {
    const run = this.reconcileTail.then(() => this.reconcileCandidatesNow(projectId))
    this.reconcileTail = run.then(() => undefined, () => undefined)
    return run
  }

  private async reconcileCandidatesNow(projectId: ProjectId): Promise<readonly ImprovementItem[]> {
    const project = this.ctx.fashionProjectRegistry.get(projectId)
    if (project === undefined) throw new FashionEvaluationProjectNotFoundError(String(projectId))
    if (project.accessMode === 'read-only') return []
    const created: ImprovementItem[] = []
    const feedback = this.ctx.fashionFeedbackRegistry.listFeedback(projectId)
    for (const row of feedback) {
      if (!row.followUpNeeded || row.archivedAt !== null) continue
      if (feedback.some(other => other.supersedesId === String(row.id))) continue
      const item = await this.proposeCandidate({
        projectId,
        dedupeKey: `feedback|${String(projectId)}|${String(row.id)}`,
        dataReality: row.dataReality,
        visibility: row.visibility,
        createdAt: row.recordedAt,
        sourceRunRefs: [],
        targetRefs: [
          { type: 'designer_feedback', id: String(row.id), revision: row.revision, projectId: String(projectId), contentHash: null },
          {
            type: row.subjectRef.subjectType,
            id: row.subjectRef.subjectId,
            revision: row.subjectRef.subjectRevision,
            projectId: String(projectId),
            contentHash: null,
          },
        ],
        failureType: 'designer_feedback_follow_up',
        summary: boundedReason([row.followUpNote, row.reasonText], `Designer feedback (${row.action}) requests follow-up.`),
        reason: 'Proposed from designer feedback that requests follow-up. Accept does not authorize Cursor.',
      })
      if (item !== undefined) created.push(item)
    }
    const assessments = [...this.requireAssessments().entries()]
      .filter(([, record]) => record.projectId === String(projectId))
    for (const [id, record] of assessments) {
      if (record.rating !== 'does_not_meet' || record.archivedAt !== null) continue
      if (assessments.some(([, other]) => other.supersedesAssessmentId === String(id))) continue
      const item = await this.proposeCandidate({
        projectId,
        dedupeKey: `assessment|${String(projectId)}|${String(id)}`,
        dataReality: record.dataReality,
        visibility: record.visibility,
        createdAt: record.recordedAt,
        sourceRunRefs: [record.runId],
        targetRefs: [
          { type: 'human_assessment', id: String(id), revision: record.contentVersion, projectId: String(projectId), contentHash: null },
        ],
        failureType: 'human_assessment_does_not_meet',
        summary: boundedReason([record.reason], `Human assessment ${record.criterionId} does not meet.`),
        reason: 'Proposed from a human assessment rated does_not_meet. Accept does not authorize Cursor.',
      })
      if (item !== undefined) created.push(item)
    }
    return created
  }

  private async proposeCandidate(input: {
    projectId: ProjectId
    dedupeKey: string
    dataReality: ImprovementItemRecordV0['dataReality']
    visibility: ImprovementItemRecordV0['visibility']
    createdAt: string
    sourceRunRefs: readonly string[]
    targetRefs: ImprovementItemRecordV0['targetRefs']
    failureType: string
    summary: string
    reason: string
  }): Promise<ImprovementItem | undefined> {
    if (this.findByDedupe(input.dedupeKey) !== undefined) return undefined
    const id = mintId(brandItemId, candidate => tableHas(this.requireItems(), candidate))
    const record: ImprovementItemRecordV0 = {
      projectId: String(input.projectId),
      schemaVersion: 0,
      origin: 'manual_entry',
      dataReality: input.dataReality,
      visibility: input.visibility,
      createdBy: 'local-human',
      createdAt: input.createdAt,
      contentVersion: 0,
      archivedAt: null,
      sourceRunRefs: [...input.sourceRunRefs],
      sourceRuleResultRefs: [],
      targetRefs: input.targetRefs,
      failureType: input.failureType,
      summary: input.summary,
      impact: 'major',
      suggestedPriority: 'medium',
      suggestedOwnerRole: 'local_planner',
      dedupeKey: input.dedupeKey,
    }
    await this.requireItems().put(id, record)
    const eventId = mintId(brandEventId, candidate => tableHas(this.requireEvents(), candidate))
    await this.requireEvents().put(eventId, {
      itemId: String(id),
      action: 'proposed',
      actor: 'local_planner',
      reason: input.reason,
      resolutionRefs: [],
      occurredAt: input.createdAt,
    })
    return this.toItem(id, record)
  }

  /**
   * Record a planner decision on an improvement item.
   * @param input - Decision fields.
   */
  async recordImprovementDecision(input: {
    projectId: ProjectId
    itemId: ImprovementItemId
    action: ImprovementAction
    reason: string
    resolutionRefs?: readonly string[]
    confirmedPlanner: boolean
    occurredAt?: string
  }): Promise<CurrentImprovement> {
    this.requireEditableProject(input.projectId)
    if (!input.confirmedPlanner) throw new FashionEvaluationPlannerConfirmationError('confirm-planner')
    if (input.action === 'proposed') throw new FashionEvaluationImprovementTransitionError('cannot-set-proposed')
    if (input.reason.trim() === '') throw new FashionEvaluationInvalidInputError('reason-required')
    if ((input.action === 'planned' || input.action === 'resolved') && (input.resolutionRefs ?? []).length === 0) {
      throw new FashionEvaluationInvalidInputError('resolution-refs-required')
    }
    const item = this.requireItemInProject(input.itemId, input.projectId)
    const current = this.currentImprovement(input.itemId)
    const allowed = ALLOWED_TRANSITIONS[current.status]
    if (!allowed.includes(input.action)) {
      throw new FashionEvaluationImprovementTransitionError(`${current.status}->${input.action}`)
    }
    const now = input.occurredAt ?? new Date().toISOString()
    const eventId = mintId(brandEventId, candidate => tableHas(this.requireEvents(), candidate))
    await this.requireEvents().put(eventId, {
      itemId: String(input.itemId),
      action: input.action,
      actor: 'local_planner',
      reason: input.reason,
      resolutionRefs: [...(input.resolutionRefs ?? [])],
      occurredAt: now,
    })
    return this.currentImprovement(input.itemId, item)
  }

  /**
   * List improvement items for a project. Excludes user_test queue items from real/public lists when requested.
   * @param projectId - Owning project.
   * @param options - Filter options.
   */
  listImprovementItems(projectId: ProjectId, options?: { includeUserTest?: boolean }): readonly CurrentImprovement[] {
    this.requireProject(projectId)
    const includeUserTest = options?.includeUserTest ?? true
    const rows: CurrentImprovement[] = []
    for (const [id, record] of this.requireItems().entries()) {
      if (record.projectId !== String(projectId)) continue
      if (!includeUserTest && record.dataReality === 'user_test' && record.visibility === 'internal_demo') continue
      rows.push(this.currentImprovement(id, record))
    }
    return rows
  }

  /**
   * Read one improvement item with event history.
   * @param projectId - Owning project.
   * @param itemId - Item identity.
   */
  getImprovementItem(projectId: ProjectId, itemId: ImprovementItemId): CurrentImprovement {
    const record = this.requireItemInProject(itemId, projectId)
    return this.currentImprovement(itemId, record)
  }

  /**
   * Export JSON and Markdown reports from one frozen run.
   * @param runId - Run identity.
   */
  async exportEvaluationReport(runId: EvaluationRunId): Promise<readonly EvaluationReportArtifact[]> {
    const run = this.getEvaluationRun(runId)
    const results = this.getRuleResults(runId)
    const rendered = renderReport({
      runId: String(runId),
      dataReality: run.dataReality,
      visibility: run.visibility,
      results: results.map(row => ({
        ruleId: row.ruleId,
        status: row.status,
        severity: row.severity,
        required: row.required,
        message: row.message,
      })),
      labels: run.dataReality === 'recorded_demo'
        ? ['public_rebuild', 'recorded_demo', 'no_real_commercial_outcome', 'no_real_designer_assessment']
        : [],
    })
    const now = run.finishedAt
    const jsonId = mintId(brandReportId, candidate => tableHas(this.requireReports(), candidate))
    const mdId = mintId(brandReportId, candidate => tableHas(this.requireReports(), candidate))
    const jsonRecord: EvaluationReportArtifactRecordV0 = {
      runId: String(runId),
      format: 'canonical_json',
      snapshotHash: rendered.snapshotHash,
      contentHash: rendered.publicHash,
      rendererVersion: rendered.rendererVersion,
      generatedAt: now,
      visibility: run.visibility,
      redacted: [...rendered.redacted],
      text: rendered.publicText,
    }
    const mdRecord: EvaluationReportArtifactRecordV0 = {
      runId: String(runId),
      format: 'markdown',
      snapshotHash: rendered.snapshotHash,
      contentHash: rendered.publicMarkdownHash,
      rendererVersion: rendered.rendererVersion,
      generatedAt: now,
      visibility: run.visibility,
      redacted: [...rendered.redacted],
      text: rendered.publicMarkdownText,
    }
    await this.requireReports().put(jsonId, jsonRecord)
    await this.requireReports().put(mdId, mdRecord)
    return [this.toReport(jsonId, jsonRecord), this.toReport(mdId, mdRecord)]
  }

  /**
   * List report artifacts for a run.
   * @param runId - Run identity.
   */
  listEvaluationReports(runId: EvaluationRunId): readonly EvaluationReportArtifact[] {
    this.getEvaluationRun(runId)
    const rows: EvaluationReportArtifact[] = []
    for (const [id, record] of this.requireReports().entries()) {
      if (record.runId !== String(runId)) continue
      rows.push(this.toReport(id, record))
    }
    return rows
  }

  /** Rubric criterion ids for UI projection. */
  listRubricCriteria(): readonly string[] {
    return HUMAN_RUBRIC_CRITERIA
  }

  private async ensureCatalog(): Promise<void> {
    const definition = buildDefinitionSeed()
    const existingDef = this.requireDefinitions().get(definition.id)
    if (existingDef === undefined) {
      await this.requireDefinitions().put(definition.id, definition.record)
    } else if (existingDef.contentHash !== definition.record.contentHash || existingDef.status !== 'published') {
      throw new FashionEvaluationSeedConflictError('definition-drift')
    }
    for (const seed of buildCaseSeeds()) {
      const existing = this.requireCases().get(seed.id)
      if (existing === undefined) {
        await this.requireCases().put(seed.id, seed.record)
        continue
      }
      if (existing.contentHash !== seed.record.contentHash || existing.status !== 'published') {
        throw new FashionEvaluationSeedConflictError(`case-drift:${String(seed.id)}`)
      }
    }
  }

  private async ensureR0Run(): Promise<void> {
    const runId = brandRunId(R0_RUN_ID)
    const existing = this.requireRuns().get(runId)
    if (existing !== undefined) {
      if (existing.verdict !== 'pass' || existing.dataReality !== 'recorded_demo') {
        throw new FashionEvaluationSeedConflictError('r0-run-drift')
      }
      return
    }
    const caseIds = [
      R0_POSITIVE_CASE_ID,
      ...buildCaseSeeds()
        .filter(row => row.record.fixtureKind === 'synthetic_negative')
        .map(row => row.id),
    ]
    await this.runEvaluation({
      projectId: R0_PROJECT_ID,
      definitionId: R0_DEFINITION_ID,
      caseIds,
      executor: 'recorded_seed',
      dataReality: 'recorded_demo',
      visibility: 'public_rebuild',
      startedAt: '2026-03-01T00:00:00.000Z',
      fixedRunId: runId,
    })
    await this.exportEvaluationReport(runId)
  }

  private mapCaseStatus(
    observed: RuleStatus,
    expected: RuleStatus | undefined,
    fixtureKind: EvaluationCaseRecordV0['fixtureKind'],
  ): RuleStatus {
    if (fixtureKind === 'synthetic_negative' && expected === 'fail' && observed === 'fail') {
      return 'pass'
    }
    if (expected !== undefined && expected !== observed && fixtureKind === 'synthetic_negative') {
      if (expected === 'fail' && observed === 'pass') return 'fail'
    }
    return observed
  }

  private caseVerdict(
    raw: ReturnType<typeof evaluateSnapshot>,
    caseRow: EvaluationCaseRecordV0,
  ): RunVerdict {
    if (caseRow.fixtureKind === 'synthetic_negative') {
      for (const expected of caseRow.expectedRuleOutcomes) {
        const actual = raw.find(row => row.ruleId === expected.ruleId)
        if (actual === undefined) return 'error'
        if (actual.status === 'error') return 'error'
        if (actual.status !== expected.status) return 'fail'
      }
      return 'pass'
    }
    return deriveVerdict(raw)
  }

  private combineVerdicts(verdicts: readonly RunVerdict[]): RunVerdict {
    if (verdicts.some(row => row === 'error')) return 'error'
    if (verdicts.some(row => row === 'fail')) return 'fail'
    if (verdicts.some(row => row === 'partial')) return 'partial'
    return 'pass'
  }

  private rejectForeignActor(actorKind: string | undefined): void {
    if (actorKind === undefined) return
    if (actorKind !== 'local_human') throw new FashionEvaluationHumanRequiredError(actorKind)
  }

  private requireProject(projectId: ProjectId): void {
    if (this.ctx.fashionProjectRegistry.get(projectId) === undefined) {
      throw new FashionEvaluationProjectNotFoundError(String(projectId))
    }
  }

  private requireEditableProject(projectId: ProjectId): void {
    const project = this.ctx.fashionProjectRegistry.get(projectId)
    if (project === undefined) throw new FashionEvaluationProjectNotFoundError(String(projectId))
    if (project.accessMode === 'read-only') throw new FashionEvaluationProjectReadOnlyError(String(projectId))
  }

  private requirePublishedDefinition(id: EvaluationDefinitionId): EvaluationDefinitionRecordV0 {
    const record = this.requireDefinitions().get(id)
    if (record === undefined) throw new FashionEvaluationNotFoundError(String(id))
    if (record.status !== 'published') throw new FashionEvaluationDefinitionNotPublishedError(String(id))
    return record
  }

  private requirePublishedCase(id: EvaluationCaseId): EvaluationCaseRecordV0 {
    const record = this.requireCases().get(id)
    if (record === undefined) throw new FashionEvaluationNotFoundError(String(id))
    if (record.status !== 'published') throw new FashionEvaluationCaseNotPublishedError(String(id))
    return record
  }

  private requireAssessmentInProject(id: HumanAssessmentId, projectId: ProjectId): HumanAssessmentRecordV0 {
    const record = this.requireAssessments().get(id)
    if (record === undefined) throw new FashionEvaluationNotFoundError(String(id))
    if (record.projectId !== String(projectId)) {
      throw new FashionEvaluationCrossProjectError(String(projectId), String(record.projectId))
    }
    return record
  }

  private requireItemInProject(id: ImprovementItemId, projectId: ProjectId): ImprovementItemRecordV0 {
    const record = this.requireItems().get(id)
    if (record === undefined) throw new FashionEvaluationNotFoundError(String(id))
    if (record.projectId !== String(projectId)) {
      throw new FashionEvaluationCrossProjectError(String(projectId), String(record.projectId))
    }
    return record
  }

  private assessmentHead(runId: EvaluationRunId, criterionId: string): HumanAssessmentId {
    let head: HumanAssessmentId | undefined
    for (const [id, record] of this.requireAssessments().entries()) {
      if (record.runId !== String(runId) || record.criterionId !== criterionId) continue
      if (record.supersedesAssessmentId === null || head === undefined) head = id
    }
    for (const [id, record] of this.requireAssessments().entries()) {
      if (record.runId !== String(runId) || record.criterionId !== criterionId) continue
      if (record.supersedesAssessmentId !== null) head = id
    }
    if (head === undefined) throw new FashionEvaluationNotFoundError(`${String(runId)}:${criterionId}`)
    let current = head
    let moved = true
    while (moved) {
      moved = false
      for (const [id, record] of this.requireAssessments().entries()) {
        if (record.supersedesAssessmentId === String(current)) {
          current = id
          moved = true
          break
        }
      }
    }
    return current
  }

  private findByDedupe(dedupeKey: string): { id: ImprovementItemId; record: ImprovementItemRecordV0 } | undefined {
    for (const [id, record] of this.requireItems().entries()) {
      if (record.dedupeKey === dedupeKey) return { id, record }
    }
    return undefined
  }

  private currentImprovement(itemId: ImprovementItemId, record?: ImprovementItemRecordV0): CurrentImprovement {
    const itemRecord = record ?? this.requireItems().get(itemId)
    if (itemRecord === undefined) throw new FashionEvaluationNotFoundError(String(itemId))
    const events: ImprovementEvent[] = []
    for (const [id, event] of this.requireEvents().entries()) {
      if (event.itemId !== String(itemId)) continue
      events.push(this.toEvent(id, event))
    }
    events.sort((left, right) => {
      if (left.occurredAt < right.occurredAt) return -1
      if (left.occurredAt > right.occurredAt) return 1
      return String(left.id).localeCompare(String(right.id))
    })
    const latest = events.at(-1)
    const status = latest === undefined ? 'proposed' : latest.action
    return { item: this.toItem(itemId, itemRecord), status, events }
  }

  private requireDefinitions(): KvTable<EvaluationDefinitionId, EvaluationDefinitionRecordV0> {
    if (this.definitions === undefined) throw new Error('fashion evaluation definitions not open')
    return this.definitions
  }

  private requireCases(): KvTable<EvaluationCaseId, EvaluationCaseRecordV0> {
    if (this.cases === undefined) throw new Error('fashion evaluation cases not open')
    return this.cases
  }

  private requireRuns(): KvTable<EvaluationRunId, EvaluationRunRecordV0> {
    if (this.runs === undefined) throw new Error('fashion evaluation runs not open')
    return this.runs
  }

  private requireResults(): KvTable<RuleResultId, RuleResultRecordV0> {
    if (this.results === undefined) throw new Error('fashion evaluation results not open')
    return this.results
  }

  private requireAssessments(): KvTable<HumanAssessmentId, HumanAssessmentRecordV0> {
    if (this.assessments === undefined) throw new Error('fashion evaluation assessments not open')
    return this.assessments
  }

  private requireItems(): KvTable<ImprovementItemId, ImprovementItemRecordV0> {
    if (this.items === undefined) throw new Error('fashion evaluation items not open')
    return this.items
  }

  private requireEvents(): KvTable<ImprovementEventId, ImprovementEventRecordV0> {
    if (this.events === undefined) throw new Error('fashion evaluation events not open')
    return this.events
  }

  private requireReports(): KvTable<EvaluationReportArtifactId, EvaluationReportArtifactRecordV0> {
    if (this.reports === undefined) throw new Error('fashion evaluation reports not open')
    return this.reports
  }

  private toDefinition(id: EvaluationDefinitionId, record: EvaluationDefinitionRecordV0): EvaluationDefinition {
    return { id, ...record, projectId: record.projectId as ProjectId | null }
  }

  private toCase(id: EvaluationCaseId, record: EvaluationCaseRecordV0): EvaluationCase {
    return {
      id,
      ...record,
      projectId: record.projectId as ProjectId | null,
      snapshot: record.snapshot as unknown as EvaluationSnapshot,
    }
  }

  private toRun(id: EvaluationRunId, record: EvaluationRunRecordV0): EvaluationRun {
    return { id, ...record, projectId: record.projectId as ProjectId | null }
  }

  private toResult(id: RuleResultId, record: RuleResultRecordV0): RuleResult {
    return { ...record, id, runId: brandRunId(record.runId) }
  }

  private toAssessment(id: HumanAssessmentId, record: HumanAssessmentRecordV0): HumanAssessment {
    return { ...record, id, runId: brandRunId(record.runId), projectId: record.projectId as ProjectId | null }
  }

  private toItem(id: ImprovementItemId, record: ImprovementItemRecordV0): ImprovementItem {
    return { id, ...record, projectId: record.projectId as ProjectId | null }
  }

  private toEvent(id: ImprovementEventId, record: ImprovementEventRecordV0): ImprovementEvent {
    return { ...record, id, itemId: brandItemId(record.itemId) }
  }

  private toReport(id: EvaluationReportArtifactId, record: EvaluationReportArtifactRecordV0): EvaluationReportArtifact {
    return { ...record, id, runId: brandRunId(record.runId) }
  }
}

function captureWorktreeIdentity(): {
  baseTag: string
  baseSha: string
  worktreeHead: string
  dirtyStateHash: string
} {
  const baseSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
  const dirty = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' })
  let baseTag = 'untagged'
  try {
    baseTag = execFileSync('git', ['describe', '--tags', '--exact-match', 'HEAD'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim()
  } catch (caught) {
    // No exact tag on HEAD. The SHA remains the identity.
    if (!(caught instanceof Error)) throw caught
  }
  return {
    baseTag,
    baseSha,
    worktreeHead: baseSha,
    dirtyStateHash: createHash('sha256').update(dirty).digest('hex'),
  }
}

export {
  EVALUATOR_BUNDLE_VERSION,
  QUEUE_EXERCISE_CASE_ID,
  R0_DEFINITION_ID,
  R0_POSITIVE_CASE_ID,
  R0_RUN_ID,
  hashContent,
}
