/**
 * Fashion Evaluation registry: R0 seed, negative PASS, queue exercise, improvement events.
 */

import { afterEach, describe, expect, it } from 'vitest'
import { createHash } from 'node:crypto'
import { Context } from '@deepseek-ai/cordis'
import Storage from '@deepseek-ai/dsh-storage'
import { DomainFacility } from '@deepseek-ai/dsh-storage-domain'
import { MemoryStorageBackend } from '../../../storage/storage-domain/tests/helpers/memory-backend.ts'
import FashionProjectRegistry, { R0_PROJECT_ID } from '@gentlexx/dsh-fashion-project'
import FashionResearchRegistry from '@gentlexx/dsh-fashion-research'
import FashionAnalysisRegistry from '@gentlexx/dsh-fashion-analysis'
import FashionDesignRegistry from '@gentlexx/dsh-fashion-design'
import FashionFeedbackRegistry from '@gentlexx/dsh-fashion-feedback'
import FashionEvaluationRegistry, {
  EvaluationRunId,
  FashionEvaluationHumanRequiredError,
  FashionEvaluationPlannerConfirmationError,
  FashionEvaluationProjectReadOnlyError,
  QUEUE_EXERCISE_CASE_ID,
  R0_DEFINITION_ID,
  R0_POSITIVE_CASE_ID,
  R0_POSITIVE_SNAPSHOT,
  R0_RUN_ID,
} from '../src/index.ts'
import { NEGATIVE_CASES } from '../src/fixtures.ts'
import { CLOSED_LOOP_RULE_IDS, deriveVerdict, evaluateSnapshot } from '../src/rules.ts'
import { renderReport } from '../src/report.ts'

const contexts: Context[] = []

afterEach(async () => {
  while (contexts.length > 0) {
    const ctx = contexts.pop()!
    await ctx.fiber.dispose()
  }
})

async function boot() {
  const ctx = new Context()
  contexts.push(ctx)
  await ctx.plugin(Storage)
  ctx.storage.backend.register('memory', new MemoryStorageBackend())
  const facility = new DomainFacility(ctx, { backend: 'memory', routes: {} })
  ctx.storage.mount('domain', facility)
  ctx.provide('storageDomain', facility)
  await ctx.plugin(FashionProjectRegistry)
  await ctx.plugin(FashionResearchRegistry)
  await ctx.plugin(FashionAnalysisRegistry)
  await ctx.plugin(FashionDesignRegistry)
  await ctx.plugin(FashionFeedbackRegistry)
  await ctx.plugin(FashionEvaluationRegistry)
  return ctx
}

describe('fashion evaluation rules', () => {
  it('publishes 16 rule ids and passes the R0 positive snapshot twice', () => {
    expect(CLOSED_LOOP_RULE_IDS).toHaveLength(16)
    const first = evaluateSnapshot(R0_POSITIVE_SNAPSHOT)
    const second = evaluateSnapshot(R0_POSITIVE_SNAPSHOT)
    expect(first.map(row => `${row.ruleId}:${row.status}`)).toEqual(second.map(row => `${row.ruleId}:${row.status}`))
    expect(deriveVerdict(first)).toBe('pass')
  })

  it('treats each isolated negative as a case pass when the target rule fails', () => {
    for (const item of NEGATIVE_CASES) {
      const results = evaluateSnapshot(item.snapshot)
      expect(results.find(row => row.ruleId === item.ruleId)?.status, item.caseId).toBe('fail')
    }
  })

  it('does not swallow a required evaluator error as pass', () => {
    const results = evaluateSnapshot(R0_POSITIVE_SNAPSHOT, 'HUMAN_ONLY_DECISION')
    expect(deriveVerdict(results)).toBe('error')
  })

  it('persists an evaluator fault as an error run without rewriting a later read', async () => {
    const ctx = await boot()
    const project = await ctx.fashionProjectRegistry.create({ title: 'Evaluator fault' })
    const run = await ctx.fashionEvaluationRegistry.runEvaluation({
      projectId: project.id,
      definitionId: R0_DEFINITION_ID,
      caseIds: [R0_POSITIVE_CASE_ID],
      evaluatorFaultRuleId: 'HUMAN_ONLY_DECISION',
    })
    expect(run.verdict).toBe('error')
    expect(run.humanAssessmentRefs).toEqual([])
    const again = ctx.fashionEvaluationRegistry.getEvaluationRun(run.id)
    expect(again.startedAt).toBe(run.startedAt)
    expect(again.humanAssessmentRefs).toEqual([])
    expect(ctx.fashionEvaluationRegistry.getRuleResults(run.id).some(row => row.status === 'error' && row.ruleId === 'HUMAN_ONLY_DECISION')).toBe(true)
  })

  it('renders JSON and Markdown from the same snapshot hash', () => {
    const results = evaluateSnapshot(R0_POSITIVE_SNAPSHOT)
    const report = renderReport({
      runId: 'r0-run',
      dataReality: 'recorded_demo',
      visibility: 'public_rebuild',
      results,
      labels: R0_POSITIVE_SNAPSHOT.r0Labels,
    })
    expect(report.snapshotHash).toBe(createHash('sha256').update(report.jsonText).digest('hex'))
    expect(report.markdownText).toContain('no real designer assessment')
    expect(report.publicError).toBeNull()
  })

  it('refuses a public body for project-private visibility and scrubs local paths', () => {
    const results = evaluateSnapshot(R0_POSITIVE_SNAPSHOT)
    const blocked = renderReport({
      runId: 'private-run',
      dataReality: 'real_work',
      visibility: 'project_private',
      results,
      labels: [],
    })
    expect(blocked.publicError).toBe('visibility_blocked')
    expect(blocked.publicText).not.toContain(results[0]?.message ?? 'pass')
    const located = renderReport({
      runId: 'public-run',
      dataReality: 'user_test',
      visibility: 'public_rebuild',
      results: [{ ...results[0]!, message: 'see C:\\secret\\brief.md' }],
      labels: ['user_test'],
    })
    expect(located.publicText).not.toContain('C:\\secret')
    expect(located.publicText).toContain('[redacted-locator]')
    expect(located.redacted).toContain('locator')
    expect(located.publicMarkdownText).not.toContain('C:\\secret')
    expect(located.publicMarkdownText).toContain('[redacted-locator]')
    expect(located.publicMarkdownHash).toBe(createHash('sha256').update(located.publicMarkdownText).digest('hex'))
  })

  it('refuses a report body for a visibility outside the reportable set', () => {
    const results = evaluateSnapshot(R0_POSITIVE_SNAPSHOT)
    const unknown = renderReport({
      runId: 'unknown-run',
      dataReality: 'user_test',
      visibility: 'restricted',
      results,
      labels: [],
    })
    expect(unknown.publicError).toBe('visibility_blocked')
    expect(unknown.publicText).not.toContain(results[0]!.message)
    expect(unknown.publicMarkdownText).not.toContain(results[0]!.message)
  })

  it('stores only filtered text in project-private export artifacts', async () => {
    const ctx = await boot()
    const project = await ctx.fashionProjectRegistry.create({ title: 'Private export' })
    const run = await ctx.fashionEvaluationRegistry.runEvaluation({
      projectId: project.id,
      definitionId: R0_DEFINITION_ID,
      caseIds: [R0_POSITIVE_CASE_ID],
    })
    const messages = ctx.fashionEvaluationRegistry.getRuleResults(run.id).map(row => row.message)
    const artifacts = await ctx.fashionEvaluationRegistry.exportEvaluationReport(run.id)
    expect(artifacts.map(row => row.format).sort()).toEqual(['canonical_json', 'markdown'])
    for (const artifact of artifacts) {
      expect(artifact.redacted).toEqual(['body'])
      expect(artifact.text).toContain('visibility_blocked')
      for (const message of messages) expect(artifact.text).not.toContain(message)
      expect(artifact.contentHash).toBe(createHash('sha256').update(artifact.text).digest('hex'))
    }
    expect(ctx.fashionEvaluationRegistry.getEvaluationRun(run.id).reportArtifactRefs).toEqual([])
  })

  it('stores content hashes that match the stored R0 public artifact text', async () => {
    const ctx = await boot()
    for (const artifact of ctx.fashionEvaluationRegistry.listEvaluationReports(EvaluationRunId(R0_RUN_ID))) {
      expect(artifact.contentHash).toBe(createHash('sha256').update(artifact.text).digest('hex'))
    }
  })
})

describe('FashionEvaluationRegistry', () => {
  it('seeds published definition, cases, R0 pass run, and reports', async () => {
    const ctx = await boot()
    const registry = ctx.fashionEvaluationRegistry
    const definition = registry.getDefinition(R0_DEFINITION_ID)
    expect(definition.status).toBe('published')
    expect(definition.ruleDefinitions).toHaveLength(16)
    expect(registry.listCases().some(row => String(row.id) === String(R0_POSITIVE_CASE_ID))).toBe(true)
    expect(registry.listCases().filter(row => row.fixtureKind === 'synthetic_negative')).toHaveLength(8)
    const run = registry.getEvaluationRun(EvaluationRunId(R0_RUN_ID))
    expect(run.verdict).toBe('pass')
    expect(run.dataReality).toBe('recorded_demo')
    expect(run.humanAssessmentRefs).toEqual([])
    const results = registry.getRuleResults(EvaluationRunId(R0_RUN_ID))
    expect(results.length).toBeGreaterThan(0)
    expect(results.every(row => row.status !== 'error')).toBe(true)
    const reports = registry.listEvaluationReports(EvaluationRunId(R0_RUN_ID))
    expect(reports.some(row => row.format === 'canonical_json')).toBe(true)
    expect(reports.some(row => row.format === 'markdown')).toBe(true)
    expect(reports.every(row => !row.text.includes('87'))).toBe(true)
  })

  it('runs queue exercise, proposes user_test improvement, and records planner events', async () => {
    const ctx = await boot()
    const project = await ctx.fashionProjectRegistry.create({ title: 'Eval project' })
    const run = await ctx.fashionEvaluationRegistry.runEvaluation({
      projectId: project.id,
      definitionId: R0_DEFINITION_ID,
      caseIds: [QUEUE_EXERCISE_CASE_ID],
      dataReality: 'user_test',
      visibility: 'internal_demo',
      startedAt: '2026-03-01T00:00:00.000Z',
    })
    expect(run.verdict).toBe('fail')
    const items = await ctx.fashionEvaluationRegistry.proposeImprovementFromFailures({
      projectId: project.id,
      runId: run.id,
    })
    expect(items.length).toBeGreaterThan(0)
    expect(items.every(row => row.dataReality === 'user_test')).toBe(true)
    expect(items.every(row => row.visibility === 'internal_demo')).toBe(true)
    const again = await ctx.fashionEvaluationRegistry.proposeImprovementFromFailures({
      projectId: project.id,
      runId: run.id,
    })
    expect(again).toHaveLength(0)
    const current = ctx.fashionEvaluationRegistry.listImprovementItems(project.id)
    expect(current[0]!.status).toBe('proposed')
    await expect(ctx.fashionEvaluationRegistry.recordImprovementDecision({
      projectId: project.id,
      itemId: current[0]!.item.id,
      action: 'accepted',
      reason: 'Worth planning.',
      confirmedPlanner: false,
    })).rejects.toBeInstanceOf(FashionEvaluationPlannerConfirmationError)
    const accepted = await ctx.fashionEvaluationRegistry.recordImprovementDecision({
      projectId: project.id,
      itemId: current[0]!.item.id,
      action: 'accepted',
      reason: 'Worth planning. Accept does not authorize Cursor.',
      confirmedPlanner: true,
      occurredAt: '2026-04-01T00:00:00.000Z',
    })
    expect(accepted.status).toBe('accepted')
    const planned = await ctx.fashionEvaluationRegistry.recordImprovementDecision({
      projectId: project.id,
      itemId: current[0]!.item.id,
      action: 'planned',
      reason: 'Linked to a future P2 spec.',
      resolutionRefs: ['spec:future-f4-fix'],
      confirmedPlanner: true,
      occurredAt: '2026-04-01T00:00:01.000Z',
    })
    expect(planned.status).toBe('planned')
  })

  it('records local-human assessment and rejects agent actor and R0 writes', async () => {
    const ctx = await boot()
    const project = await ctx.fashionProjectRegistry.create({ title: 'Assessment project' })
    const run = await ctx.fashionEvaluationRegistry.runEvaluation({
      projectId: project.id,
      definitionId: R0_DEFINITION_ID,
      caseIds: [R0_POSITIVE_CASE_ID],
    })
    const assessment = await ctx.fashionEvaluationRegistry.recordHumanAssessment({
      projectId: project.id,
      runId: run.id,
      criterionId: 'research_evidence_useful',
      rating: 'partly_meets',
      reason: 'Useful but still recorded demo evidence.',
    })
    expect(assessment.actorKind).toBe('local_human')
    await expect(ctx.fashionEvaluationRegistry.recordHumanAssessment({
      projectId: project.id,
      runId: run.id,
      criterionId: 'trend_interpretation_credible',
      rating: 'meets',
      reason: 'ok',
      actorKind: 'system',
    })).rejects.toBeInstanceOf(FashionEvaluationHumanRequiredError)
    await expect(ctx.fashionEvaluationRegistry.recordHumanAssessment({
      projectId: R0_PROJECT_ID,
      runId: EvaluationRunId(R0_RUN_ID),
      criterionId: 'research_evidence_useful',
      rating: 'meets',
      reason: 'should fail',
    })).rejects.toBeInstanceOf(FashionEvaluationProjectReadOnlyError)
  })

  it('proposes one candidate per follow-up feedback and does_not_meet assessment, and accepting starts no work', async () => {
    const ctx = await boot()
    const evaluation = ctx.fashionEvaluationRegistry
    const project = await ctx.fashionProjectRegistry.create({ title: 'Candidate project' })
    const deliverable = ctx.fashionDesignRegistry.listDeliverables(R0_PROJECT_ID)[0]!
    const subject = {
      subjectType: 'workflow_step' as const,
      subjectId: 'step-export',
      subjectRevision: 0,
      relatedDeliverableRef: { id: String(deliverable.id), revision: deliverable.revision },
      workflowStep: {
        stepKey: 'export',
        moduleId: 'fashion-design',
        moduleSchemaVersion: 0,
        relatedRefs: [{ id: String(deliverable.id), revision: deliverable.revision }],
      },
    }
    const feedbackBase = {
      projectId: project.id,
      subjectRef: subject,
      expectedSubjectRevision: 0,
      action: 'modified' as const,
      reasonCodes: [],
      modifications: [],
      professionalValidity: 'partly_valid' as const,
      revisionEffort: 'light' as const,
      dataReality: 'user_test' as const,
    }
    const followUp = await ctx.fashionFeedbackRegistry.recordFeedback({
      ...feedbackBase,
      reasonText: 'Hem too long.',
      followUpNeeded: true,
      followUpNote: 'Rework the hem length.',
    })
    await ctx.fashionFeedbackRegistry.recordFeedback({ ...feedbackBase, reasonText: 'Fine as is.', followUpNeeded: false })
    const run = await evaluation.runEvaluation({
      projectId: project.id,
      definitionId: R0_DEFINITION_ID,
      caseIds: [R0_POSITIVE_CASE_ID],
    })
    const failing = await evaluation.recordHumanAssessment({
      projectId: project.id,
      runId: run.id,
      criterionId: 'research_evidence_useful',
      rating: 'does_not_meet',
      reason: 'Evidence does not support the direction.',
    })
    await evaluation.recordHumanAssessment({
      projectId: project.id,
      runId: run.id,
      criterionId: 'trend_interpretation_credible',
      rating: 'partly_meets',
      reason: 'Mostly credible.',
    })

    const [first, concurrent] = await Promise.all([
      evaluation.reconcileImprovementCandidates(project.id),
      evaluation.reconcileImprovementCandidates(project.id),
    ])
    expect(first).toHaveLength(2)
    expect(concurrent).toEqual([])
    expect(await evaluation.reconcileImprovementCandidates(project.id)).toEqual([])

    const items = evaluation.listImprovementItems(project.id)
    expect(items).toHaveLength(2)
    const fromFeedback = items.find(row => row.item.failureType === 'designer_feedback_follow_up')!
    expect(fromFeedback.item.dedupeKey).toBe(`feedback|${String(project.id)}|${String(followUp.id)}`)
    expect(fromFeedback.item.targetRefs[0]).toEqual({
      type: 'designer_feedback',
      id: String(followUp.id),
      revision: followUp.revision,
      projectId: String(project.id),
      contentHash: null,
    })
    expect(fromFeedback.item.projectId).toBe(project.id)
    expect(fromFeedback.item.dataReality).toBe('user_test')
    expect(fromFeedback.item.summary).toBe('Rework the hem length.')
    expect(fromFeedback.status).toBe('proposed')

    const fromAssessment = items.find(row => row.item.failureType === 'human_assessment_does_not_meet')!
    expect(fromAssessment.item.dedupeKey).toBe(`assessment|${String(project.id)}|${String(failing.id)}`)
    expect(fromAssessment.item.targetRefs[0]!.type).toBe('human_assessment')
    expect(fromAssessment.item.targetRefs[0]!.id).toBe(String(failing.id))
    expect(fromAssessment.item.sourceRunRefs).toEqual([String(run.id)])
    expect(fromAssessment.item.dataReality).toBe('user_test')
    expect(fromAssessment.item.summary).toBe('Evidence does not support the direction.')

    const accepted = await evaluation.recordImprovementDecision({
      projectId: project.id,
      itemId: fromFeedback.item.id,
      action: 'accepted',
      reason: 'Worth planning.',
      confirmedPlanner: true,
    })
    expect(accepted.status).toBe('accepted')
    expect(accepted.events.map(event => event.action)).toEqual(['proposed', 'accepted'])
    expect(accepted.events.every(event => event.resolutionRefs.length === 0)).toBe(true)
    expect(await evaluation.reconcileImprovementCandidates(project.id)).toEqual([])
    expect(evaluation.listImprovementItems(project.id)).toHaveLength(2)
    expect(await evaluation.reconcileImprovementCandidates(R0_PROJECT_ID)).toEqual([])
  })

  it('keeps R0 rerun deterministic and does not create improvements for expected negatives', async () => {
    const ctx = await boot()
    const negativeIds = ctx.fashionEvaluationRegistry.listCases()
      .filter(row => row.fixtureKind === 'synthetic_negative')
      .map(row => row.id)
    const first = await ctx.fashionEvaluationRegistry.runEvaluation({
      projectId: R0_PROJECT_ID,
      definitionId: R0_DEFINITION_ID,
      caseIds: [R0_POSITIVE_CASE_ID, ...negativeIds],
      executor: 'test_runner',
      dataReality: 'recorded_demo',
      visibility: 'public_rebuild',
    })
    const second = await ctx.fashionEvaluationRegistry.runEvaluation({
      projectId: R0_PROJECT_ID,
      definitionId: R0_DEFINITION_ID,
      caseIds: [R0_POSITIVE_CASE_ID, ...negativeIds],
      executor: 'test_runner',
      dataReality: 'recorded_demo',
      visibility: 'public_rebuild',
    })
    expect(first.verdict).toBe('pass')
    expect(second.verdict).toBe('pass')
    expect(String(first.id)).not.toBe(String(second.id))
    const firstStatuses = ctx.fashionEvaluationRegistry.getRuleResults(first.id).map(row => `${row.caseId}:${row.ruleId}:${row.status}`)
    const secondStatuses = ctx.fashionEvaluationRegistry.getRuleResults(second.id).map(row => `${row.caseId}:${row.ruleId}:${row.status}`)
    expect(firstStatuses).toEqual(secondStatuses)
  })
})
