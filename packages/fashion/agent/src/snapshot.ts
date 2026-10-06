/**
 * Compact Fashion project snapshot assembled from Host registries.
 * @module @gentlexx/dsh-fashion-agent/src/snapshot
 */

import { createHash } from 'node:crypto'
import type { FashionAnalysisRegistry } from '@gentlexx/dsh-fashion-analysis'
import type { FashionDesignRegistry } from '@gentlexx/dsh-fashion-design'
import type FashionEvaluationRegistry from '@gentlexx/dsh-fashion-evaluation'
import type { FashionFeedbackRegistry } from '@gentlexx/dsh-fashion-feedback'
import type { FashionProject, FashionProjectRegistry, ProjectId } from '@gentlexx/dsh-fashion-project'
import type FashionResearchRegistry from '@gentlexx/dsh-fashion-research'
import { FashionAgentSnapshotError } from './errors.ts'
import { presentText, requireText } from './text.ts'
import type {
  FashionAgentAnalysisSummary,
  FashionAgentBriefSummary,
  FashionAgentDeliverableSummary,
  FashionAgentDirectionSummary,
  FashionAgentEntrySurface,
  FashionAgentEvaluationSummary,
  FashionAgentFeedbackSummary,
  FashionAgentResearchSummary,
  FashionAgentReviewSummary,
  FashionAgentScopeId,
  FashionProjectSnapshot,
} from './types.ts'

/** Registries required to fold one compact snapshot. */
export interface FashionSnapshotRegistries {
  readonly projects: FashionProjectRegistry
  readonly research: FashionResearchRegistry
  readonly analysis: FashionAnalysisRegistry
  readonly design: FashionDesignRegistry
  readonly feedback: FashionFeedbackRegistry
  readonly evaluation: FashionEvaluationRegistry
}

/**
 * Build the latest compact snapshot for one project.
 * @param registries - Fashion Host registries.
 * @param projectId - bound project.
 * @param entrySurface - page the user entered Agent from, when known.
 * @param generatedAt - ISO timestamp for this fold.
 */
export async function buildFashionProjectSnapshot(
  registries: FashionSnapshotRegistries,
  projectId: ProjectId,
  entrySurface: FashionAgentEntrySurface | null,
  generatedAt: string,
): Promise<FashionProjectSnapshot> {
  const project = registries.projects.get(projectId)
  if (project === undefined) {
    throw new FashionAgentSnapshotError(
      'not-found',
      'Fashion project is not available for Agent context',
      projectId,
    )
  }
  try {
    return await foldSnapshot(registries, project, entrySurface, generatedAt)
  } catch (error) {
    if (error instanceof FashionAgentSnapshotError) throw error
    const message = error instanceof Error ? error.message : 'snapshot generation failed'
    throw new FashionAgentSnapshotError('snapshot-failed', message, projectId)
  }
}

/**
 * Fold every admitted Fashion domain into one compact snapshot.
 * @param registries - Fashion Host registries.
 * @param project - loaded project projection.
 * @param entrySurface - entry page, when known.
 * @param generatedAt - ISO timestamp for this fold.
 */
async function foldSnapshot(
  registries: FashionSnapshotRegistries,
  project: FashionProject,
  entrySurface: FashionAgentEntrySurface | null,
  generatedAt: string,
): Promise<FashionProjectSnapshot> {
  const projectId = project.id
  const research = foldResearch(registries.research, projectId)
  const analysis = foldAnalysis(registries.analysis, registries.research, projectId)
  const brief = foldBrief(registries.design, projectId)
  const directions = foldDirections(registries.design, projectId)
  const deliverable = foldDeliverable(registries.design, projectId, directions)
  const review = await foldReview(registries.design, projectId, directions, deliverable)
  const feedback = foldFeedback(registries.feedback, projectId, deliverable)
  const evaluation = foldEvaluation(registries.evaluation, projectId)
  const stageStatuses = [
    { stage: 'research', status: research.length > 0 ? 'recorded' : 'absent' },
    { stage: 'analysis', status: analysis.some(row => row.opportunities.length > 0) ? 'recorded' : 'absent' },
    { stage: 'brief', status: brief === null ? 'absent' : brief.status },
    { stage: 'directions', status: directions.length > 0 ? 'recorded' : 'absent' },
    { stage: 'review', status: review === null ? 'absent' : review.status },
    { stage: 'deliverable', status: deliverable === null ? 'absent' : deliverable.status },
    { stage: 'feedback', status: feedback === null ? 'absent' : 'recorded' },
    { stage: 'evaluation', status: evaluation === null ? 'absent' : 'recorded' },
  ]
  const recordedStage = [...stageStatuses].reverse().find(row => row.status !== 'absent')
  const currentStage = recordedStage === undefined ? 'project' : recordedStage.stage
  const dataScope: FashionAgentScopeId[] = ['project']
  if (research.length > 0) dataScope.push('research')
  if (analysis.length > 0) dataScope.push('analysis')
  if (brief !== null) dataScope.push('brief')
  if (directions.length > 0) dataScope.push('directions')
  if (review !== null) dataScope.push('review')
  if (deliverable !== null) dataScope.push('deliverable')
  if (feedback !== null) dataScope.push('feedback')
  if (evaluation !== null) {
    dataScope.push('evaluation')
    if (evaluation.improvementSummaries.length > 0) dataScope.push('improvement')
  }
  const body = {
    project: {
      projectId: project.id,
      title: requireText(project.title, 'project.title'),
      origin: project.origin,
      accessMode: project.accessMode,
      updatedAt: requireText(project.updatedAt, 'project.updatedAt'),
      revision: project.revision,
    },
    currentStage,
    stageStatuses,
    entrySurface,
    research,
    analysis,
    brief,
    directions,
    review,
    deliverable,
    feedback,
    evaluation,
    projectUpdatedAt: requireText(project.updatedAt, 'project.updatedAt'),
    dataScope,
  }
  return {
    ...body,
    snapshotVersion: hashSnapshot(body),
    generatedAt,
  }
}

/**
 * Fold research tasks, sources, evidence, and samples.
 * @param research - research registry.
 * @param projectId - bound project.
 */
function foldResearch(
  research: FashionResearchRegistry,
  projectId: ProjectId,
): FashionAgentResearchSummary[] {
  return research.listTasks(projectId).map((task) => {
    const sources = research.listSources(projectId, task.id)
    const evidence = research.listEvidence(projectId, task.id)
    const samples = research.listSamples(projectId, task.id)
    const evidenceClaims = evidence
      .map(item => presentText(item.claim) ?? presentText(item.observation))
      .filter((item): item is string => item !== null)
      .slice(0, 6)
    const sampleTitles = samples
      .map(item => presentText(item.label))
      .filter((item): item is string => item !== null)
      .slice(0, 6)
    return {
      taskId: String(task.id),
      title: requireText(task.title, 'research.task.title'),
      status: task.status,
      sourceCount: sources.length,
      evidenceCount: evidence.length,
      sampleCount: samples.length,
      evidenceClaims,
      sampleTitles,
    }
  })
}

/**
 * Fold analysis signals, opportunities, and decisions for each research task.
 * @param analysis - analysis registry.
 * @param research - research registry for task ids.
 * @param projectId - bound project.
 */
function foldAnalysis(
  analysis: FashionAnalysisRegistry,
  research: FashionResearchRegistry,
  projectId: ProjectId,
): FashionAgentAnalysisSummary[] {
  return research.listTasks(projectId).map((task) => {
    const decisions = analysis.listDecisions(projectId, task.id)
    const opportunities = analysis.listOpportunities(projectId, task.id).map((opportunity) => {
      const decision = opportunity.currentDecisionId === null
        ? undefined
        : decisions.find(item => String(item.id) === String(opportunity.currentDecisionId))
      return {
        id: String(opportunity.id),
        title: requireText(opportunity.title, 'analysis.opportunity.title'),
        statement: requireText(opportunity.opportunityStatement, 'analysis.opportunity.statement'),
        currentDecisionAction: decision === undefined ? null : decision.action,
      }
    })
    return {
      taskId: String(task.id),
      signals: analysis.listSignals(projectId, task.id).map(signal => ({
        id: String(signal.id),
        type: signal.signalType,
        platform: requireText(signal.platform, 'analysis.signal.platform'),
      })),
      opportunities,
    }
  }).filter(row => row.signals.length > 0 || row.opportunities.length > 0)
}

/**
 * Fold the newest non-archived Brief.
 * @param design - design registry.
 * @param projectId - bound project.
 */
function foldBrief(
  design: FashionDesignRegistry,
  projectId: ProjectId,
): FashionAgentBriefSummary | null {
  const briefs = design.listBriefs(projectId).filter(item => item.archivedAt === null)
  const brief = briefs[0]
  if (brief === undefined) return null
  const constraints = [
    ...brief.mustKeep,
    ...brief.mustAvoid,
    ...brief.materialsConstraints,
    ...brief.costConstraints,
    ...brief.productionConstraints,
  ]
    .map(entry => presentText(entry.text))
    .filter((item): item is string => item !== null)
  const unknowns = brief.openQuestions
    .map(entry => presentText(entry.text))
    .filter((item): item is string => item !== null)
  return {
    briefId: String(brief.id),
    status: brief.status,
    category: requireText(brief.category, 'brief.category'),
    market: requireText(brief.market, 'brief.market'),
    season: requireText(brief.season, 'brief.season'),
    targetUser: requireText(brief.targetUser, 'brief.targetUser'),
    constraints,
    unknowns,
  }
}

/**
 * Fold the current ConceptSet's three directions.
 * @param design - design registry.
 * @param projectId - bound project.
 */
function foldDirections(
  design: FashionDesignRegistry,
  projectId: ProjectId,
): FashionAgentDirectionSummary[] {
  const current = design.listConceptSets(projectId).find(item => item.isCurrent && item.archivedAt === null)
  if (current === undefined) return []
  return design.listConcepts(projectId, current.id).map(concept => ({
    conceptId: String(concept.id),
    revision: concept.revision,
    name: requireText(concept.conceptName, 'direction.name'),
    designIntent: requireText(concept.designIntent, 'direction.designIntent'),
    silhouette: requireText(concept.silhouette, 'direction.silhouette'),
    proportionAndLength: requireText(concept.proportionAndLength, 'direction.proportionAndLength'),
    status: concept.status,
  }))
}

/**
 * Fold the newest review and verify approved/selected concept refs.
 * @param design - design registry.
 * @param projectId - bound project.
 * @param directions - already folded directions.
 */
async function foldReview(
  design: FashionDesignRegistry,
  projectId: ProjectId,
  directions: readonly FashionAgentDirectionSummary[],
  deliverable: FashionAgentDeliverableSummary | null,
): Promise<FashionAgentReviewSummary | null> {
  const rounds = design.listReviews(projectId).filter(item => item.archivedAt === null)
  const round = rounds[0]
  if (round === undefined) return null
  const approvedConceptId = deliverable === null
    ? null
    : deliverableSelectedConcept(design, projectId, deliverable.deliverableId)
  if (approvedConceptId !== null && !directions.some(item => item.conceptId === approvedConceptId)) {
    throw new FashionAgentSnapshotError(
      'broken-reference',
      'Fashion review approval references a missing direction',
      projectId,
    )
  }
  const validity = round.currentApprovalDecisionId === null
    ? null
    : await design.getApprovalValidity(projectId, round.id)
  return {
    reviewRoundId: String(round.id),
    status: round.status,
    selectedConceptId: approvedConceptId,
    approvedConceptId,
    approvalValid: validity === null ? null : validity.valid,
    reasonText: null,
  }
}

/**
 * Read the deliverable's selected concept id.
 * @param design - design registry.
 * @param projectId - bound project.
 * @param deliverableId - deliverable id.
 */
function deliverableSelectedConcept(
  design: FashionDesignRegistry,
  projectId: ProjectId,
  deliverableId: string,
): string | null {
  const items = design.listDeliverables(projectId)
  const match = items.find(item => String(item.id) === deliverableId)
  return match === undefined ? null : match.selectedConceptRef.id
}

/**
 * Fold the newest deliverable and verify its selected concept.
 * @param design - design registry.
 * @param projectId - bound project.
 * @param directions - already folded directions.
 */
function foldDeliverable(
  design: FashionDesignRegistry,
  projectId: ProjectId,
  directions: readonly FashionAgentDirectionSummary[],
): FashionAgentDeliverableSummary | null {
  const items = design.listDeliverables(projectId).filter(item => item.archivedAt === null)
  const deliverable = items[0]
  if (deliverable === undefined) return null
  const selectedId = deliverable.selectedConceptRef.id
  if (!directions.some(item => item.conceptId === selectedId)) {
    throw new FashionAgentSnapshotError(
      'broken-reference',
      'Fashion deliverable references a missing direction',
      projectId,
    )
  }
  const artifacts = design.listDeliverableArtifacts(projectId, deliverable.id)
  return {
    deliverableId: String(deliverable.id),
    status: deliverable.status,
    rendererVersion: requireText(deliverable.rendererVersion, 'deliverable.rendererVersion'),
    snapshotHash: requireText(deliverable.snapshotHash, 'deliverable.snapshotHash'),
    artifactKinds: artifacts.map(item => item.kind),
  }
}

/**
 * Fold feedback heads plus availability / development / metric counts.
 * @param feedback - feedback registry.
 * @param projectId - bound project.
 * @param deliverable - current deliverable, when present.
 */
function foldFeedback(
  feedback: FashionFeedbackRegistry,
  projectId: ProjectId,
  deliverable: FashionAgentDeliverableSummary | null,
): FashionAgentFeedbackSummary | null {
  const summary = feedback.getFeedbackSummary(projectId)
  if (summary.current.length === 0 && summary.history.length === 0 && deliverable === null) {
    return null
  }
  const availabilityStates: string[] = []
  const developmentStages: string[] = []
  let metricCount = 0
  if (deliverable !== null) {
    const deliverableRef = { id: deliverable.deliverableId, revision: 0 }
    try {
      const availability = feedback.getCurrentOutcomeAvailability(projectId, deliverableRef)
      if (availability.current !== null) availabilityStates.push(availability.current.availability)
    } catch (error) {
      if (!isFeedbackSubjectError(error)) throw error
    }
    try {
      const stage = feedback.getCurrentDevelopmentStage(projectId, deliverableRef)
      if (stage.current !== null) developmentStages.push(stage.current.stage)
    } catch (error) {
      if (!isFeedbackSubjectError(error)) throw error
    }
    try {
      metricCount = feedback.listMetricObservations(projectId, deliverableRef).length
    } catch (error) {
      if (!isFeedbackSubjectError(error)) throw error
    }
  }
  return {
    currentCount: summary.current.length,
    historyCount: summary.history.length,
    currentActions: summary.current.map(item => item.action),
    availabilityStates,
    developmentStages,
    metricCount,
  }
}

/**
 * Fold evaluation runs, assessments, and improvement candidates.
 * @param evaluation - evaluation registry.
 * @param projectId - bound project.
 */
function foldEvaluation(
  evaluation: FashionEvaluationRegistry,
  projectId: ProjectId,
): FashionAgentEvaluationSummary | null {
  const runs = evaluation.listEvaluationRuns(projectId)
  const improvements = evaluation.listImprovementItems(projectId)
  if (runs.length === 0 && improvements.length === 0) return null
  const latest = runs[0]
  let assessmentCount = 0
  if (latest !== undefined) {
    assessmentCount = evaluation.listHumanAssessments(latest.id).length
  }
  return {
    runCount: runs.length,
    latestVerdict: latest === undefined ? null : latest.verdict,
    latestExecutionStatus: latest === undefined ? null : latest.executionStatus,
    assessmentCount,
    improvementSummaries: improvements
      .map(item => presentText(item.item.summary))
      .filter((item): item is string => item !== null)
      .slice(0, 6),
  }
}

/**
 * Whether a feedback lookup failed because the deliverable subject is absent.
 * @param error - caught registry error.
 */
function isFeedbackSubjectError(error: unknown): boolean {
  return error instanceof Error && /not-found|subject/i.test(error.message)
}

/**
 * Stable hex digest of the snapshot body excluding generatedAt.
 * @param body - snapshot fields that participate in the version.
 */
function hashSnapshot(body: unknown): string {
  return createHash('sha256').update(JSON.stringify(body)).digest('hex')
}

/**
 * Select one snapshot section for the bound query tool.
 * @param snapshot - complete compact snapshot.
 * @param section - requested section id.
 */
export function selectSnapshotSection(
  snapshot: FashionProjectSnapshot,
  section: FashionAgentScopeId,
): unknown {
  switch (section) {
    case 'project':
      return {
        project: snapshot.project,
        currentStage: snapshot.currentStage,
        stageStatuses: snapshot.stageStatuses,
        entrySurface: snapshot.entrySurface,
        snapshotVersion: snapshot.snapshotVersion,
        projectUpdatedAt: snapshot.projectUpdatedAt,
        dataScope: snapshot.dataScope,
      }
    case 'research':
      return snapshot.research
    case 'analysis':
      return snapshot.analysis
    case 'brief':
      return snapshot.brief
    case 'directions':
      return snapshot.directions
    case 'review':
      return snapshot.review
    case 'deliverable':
      return snapshot.deliverable
    case 'feedback':
      return snapshot.feedback
    case 'evaluation':
      return snapshot.evaluation
    case 'improvement':
      return snapshot.evaluation === null ? null : snapshot.evaluation.improvementSummaries
    default: {
      const exhaustive: never = section
      throw new Error(`fashion-agent: unsupported query section ${String(exhaustive)}`)
    }
  }
}
