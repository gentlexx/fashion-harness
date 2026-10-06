/** Fashion shell browser half: sidebar, main panel, routing, header restore. */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@gentlexx/dsh-api-fashion-project-controller/client'
import type {} from '@gentlexx/dsh-api-fashion-research-controller/client'
import type {} from '@gentlexx/dsh-api-fashion-analysis-controller/client'
import type {} from '@gentlexx/dsh-api-fashion-design-controller/client'
import type {} from '@gentlexx/dsh-api-fashion-feedback-controller/client'
import type {} from '@gentlexx/dsh-api-fashion-evaluation-controller/client'
import type {} from '@gentlexx/dsh-api-fashion-agent-controller/client'
import type {} from '@deepseek-ai/dsh-api-session-controller/client'
import type { ProjectId } from '@gentlexx/dsh-fashion-project/types'
import type {
  EvidenceId,
  ResearchTaskId,
  SampleId,
  SourceId,
} from '@gentlexx/dsh-fashion-research/types'
import { ResearchTaskId as brandResearchTaskId } from './research/ids.ts'
import { FashionBrandMark } from './FashionBrandMark.tsx'
import { FashionHeaderLeadingControls } from './FashionHeaderLeadingControls.tsx'
import { FashionSidebar } from './FashionSidebar.tsx'
import { FashionWorkspace } from './FashionWorkspace.tsx'
import { FashionAgentLead } from './agent/FashionAgentLead.tsx'
import { FashionAgentContextStrip } from './agent/FashionAgentContextStrip.tsx'
import { entrySurfaceFromRoute } from './agent/agent-context.ts'
import { applyFashionDocumentBrand } from './document-brand.ts'
import { createFashionNavigation, type FashionNavigation } from './navigation.ts'
import type { DeliverableFollowUpRef } from './routes.ts'
import {
  runDesignWrite,
  type DesignBriefDraftInput,
  type DesignConceptDraftInput,
  type DesignConceptRevisionInput,
} from './design/design-write.ts'
import { FASHION_PANEL_ID } from './panel-id.ts'
import { en, NS, zh, type FashionKey } from './locales.ts'

export type { FashionRoute } from './routes.ts'
export { formatFashionRoute, parseFashionRoute, R0_PROJECT_ID } from './routes.ts'
export { createFashionNavigation } from './navigation.ts'
export type { FashionNavigation } from './navigation.ts'
export type { FashionKey } from './locales.ts'
export { FASHION_PANEL_ID } from './panel-id.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Fashion product shell copy. */
    fashion: FashionKey
  }

  interface SlotMap {
    /**
     * Settings seat at the Fashion sidebar foot. Same contract as the generic
     * sidebar so official `ui-settings-general` can inject without change.
     */
    'sidebar.settings': {
      kind: 'single'
      scope: 'root'
      owner: { wide: boolean }
    }
  }
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Fashion History navigation for the product shell. */
    fashionNavigation: FashionNavigation
  }
}

/** Services required by the Fashion shell plugin. */
export const inject = ['slots', 'layout', 'locale', 'sessions', 'fashionProjects', 'fashionResearch', 'fashionAnalysis', 'fashionDesign', 'fashionFeedback', 'fashionEvaluation', 'fashionAgent']

/**
 * Register Fashion sidebar, projects main panel, and Agent-header restore.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-fashion-shell: dictionaries')
  if (typeof document !== 'undefined') {
    ctx.effect(() => applyFashionDocumentBrand(document), 'ui-fashion-shell: Fashion document identity')
  }

  const historyApi = typeof window !== 'undefined'
    ? window.history
    : { pushState(): void {}, replaceState(): void {} }
  const locationApi = typeof window !== 'undefined'
    ? window.location
    : { pathname: '/projects' }
  const navigation = createFashionNavigation(historyApi, locationApi)
  ctx.effect(() => () => { navigation.dispose() }, 'ui-fashion-shell: navigation')
  ctx.provide('fashionNavigation', navigation)

  const selectFashionPanel = (): void => {
    try {
      ctx.layout.selectPanel(FASHION_PANEL_ID)
    } catch {
      /* panel not registered yet */
    }
  }

  const openProjects = (): void => {
    const current = navigation.route.getSnapshot()
    if (current.kind !== 'projects') {
      navigation.navigate({ kind: 'projects' }, { replace: current.kind === 'not-found' })
    }
    selectFashionPanel()
  }
  let pendingAgentProject: {
    readonly projectId: ProjectId
    readonly entrySurface: ReturnType<typeof entrySurfaceFromRoute>
  } | undefined
  const openAgent = (): void => {
    const route = navigation.route.getSnapshot()
    pendingAgentProject = 'projectId' in route
      ? {
        projectId: route.projectId as ProjectId,
        entrySurface: entrySurfaceFromRoute(route),
      }
      : undefined
    ctx.layout.selectPanel(null)
    void bindRouteProject()
  }

  const bindRouteProject = async (confirmUnboundWithMessages = false): Promise<void> => {
    const route = navigation.route.getSnapshot()
    if (!('projectId' in route)) return
    const sessionId = ctx.sessions.list.getSnapshot().current
    if (sessionId === undefined) return
    await ctx.fashionAgent.bind({
      sessionId,
      projectId: route.projectId as ProjectId,
      confirmUnboundWithMessages,
      entrySurface: entrySurfaceFromRoute(route),
    })
    if (pendingAgentProject?.projectId === route.projectId) pendingAgentProject = undefined
  }

  const confirmBind = (): void => {
    void bindRouteProject(true)
  }

  const createBoundSession = (): void => {
    void (async () => {
      const route = navigation.route.getSnapshot()
      if (!('projectId' in route)) return
      const created = await ctx.sessions.create()
      ctx.sessions.open(created)
      await ctx.fashionAgent.bind({
        sessionId: created,
        projectId: route.projectId as ProjectId,
        entrySurface: entrySurfaceFromRoute(route),
      })
    })()
  }

  const syncAgentBinding = (): void => {
    const sessionId = ctx.sessions.list.getSnapshot().current
    if (sessionId !== undefined && pendingAgentProject !== undefined) {
      const pending = pendingAgentProject
      pendingAgentProject = undefined
      void ctx.fashionAgent.bind({
        sessionId,
        projectId: pending.projectId,
        entrySurface: pending.entrySurface,
      })
      return
    }
    void ctx.fashionAgent.sync(sessionId)
  }
  ctx.effect(() => ctx.sessions.list.subscribe(syncAgentBinding), 'ui-fashion-shell: sync Fashion Agent binding')
  syncAgentBinding()
  const openProject = (projectId: string): void => {
    navigation.navigate({ kind: 'project-overview', projectId })
    selectFashionPanel()
  }
  const openResearch = (projectId: string): void => {
    navigation.navigate({ kind: 'research-home', projectId })
    selectFashionPanel()
  }
  const openResearchTaskNew = (projectId: string): void => {
    navigation.navigate({ kind: 'research-task-new', projectId })
    selectFashionPanel()
  }
  const openResearchTask = (projectId: string, taskId: string): void => {
    navigation.navigate({ kind: 'research-task', projectId, taskId })
    selectFashionPanel()
  }
  const openResearchSourceNew = (projectId: string, taskId: string): void => {
    navigation.navigate({ kind: 'research-source-new', projectId, taskId })
    selectFashionPanel()
  }
  const openResearchSource = (projectId: string, taskId: string, sourceId: string): void => {
    navigation.navigate({ kind: 'research-source', projectId, taskId, sourceId })
    selectFashionPanel()
  }
  const openResearchSample = (projectId: string, taskId: string, sampleId: string): void => {
    navigation.navigate({ kind: 'research-sample', projectId, taskId, sampleId })
    selectFashionPanel()
  }
  const openResearchEvidence = (projectId: string, taskId: string, evidenceId: string): void => {
    navigation.navigate({ kind: 'research-evidence', projectId, taskId, evidenceId })
    selectFashionPanel()
  }
  const openAnalysis = (projectId: string, taskId: string): void => {
    navigation.navigate({ kind: 'analysis-home', projectId, taskId })
    selectFashionPanel()
  }
  const openAnalysisItem = (projectId: string, taskId: string, marketItemId: string): void => {
    navigation.navigate({ kind: 'analysis-item', projectId, taskId, marketItemId })
    selectFashionPanel()
  }
  const openAnalysisSignal = (projectId: string, taskId: string, signalId: string): void => {
    navigation.navigate({ kind: 'analysis-signal', projectId, taskId, signalId })
    selectFashionPanel()
  }
  const openAnalysisCluster = (projectId: string, taskId: string, clusterId: string): void => {
    navigation.navigate({ kind: 'analysis-cluster', projectId, taskId, clusterId })
    selectFashionPanel()
  }
  const openAnalysisOpportunity = (projectId: string, taskId: string, opportunityId: string): void => {
    navigation.navigate({ kind: 'analysis-opportunity', projectId, taskId, opportunityId })
    selectFashionPanel()
  }
  const openDesignDirections = (projectId: string): void => {
    navigation.navigate({ kind: 'design-directions', projectId })
    selectFashionPanel()
  }
  const openDesignBrief = (projectId: string, opportunityId: string): void => {
    navigation.navigate({ kind: 'design-brief', projectId, opportunityId })
    selectFashionPanel()
  }
  const openDesignConcept = (projectId: string, conceptId: string): void => {
    navigation.navigate({ kind: 'design-concept', projectId, conceptId })
    selectFashionPanel()
  }
  const openDesignVisual = (projectId: string, conceptId: string, visualDraftId: string): void => {
    navigation.navigate({ kind: 'design-visual', projectId, conceptId, visualDraftId })
    selectFashionPanel()
  }
  const openReviewHome = (projectId: string): void => {
    navigation.navigate({ kind: 'review-home', projectId })
    selectFashionPanel()
  }
  const openReviewRound = (projectId: string, reviewRoundId: string): void => {
    navigation.navigate({ kind: 'review-round', projectId, reviewRoundId })
    selectFashionPanel()
  }
  const openDeliverablesHome = (projectId: string): void => {
    navigation.navigate({ kind: 'deliverables-home', projectId })
    selectFashionPanel()
  }
  const openDeliverableDetail = (projectId: string, deliverableId: string): void => {
    navigation.navigate({ kind: 'deliverable-detail', projectId, deliverableId })
    selectFashionPanel()
  }
  const openFeedbackHome = (projectId: string): void => {
    navigation.navigate({ kind: 'feedback-home', projectId })
    selectFashionPanel()
  }
  const openFeedbackNew = (projectId: string): void => {
    navigation.navigate({ kind: 'feedback-new', projectId })
    selectFashionPanel()
  }
  const openFeedbackDetail = (projectId: string, feedbackId: string): void => {
    navigation.navigate({ kind: 'feedback-detail', projectId, feedbackId })
    selectFashionPanel()
  }
  const openOutcomes = (projectId: string): void => {
    navigation.navigate({ kind: 'outcomes-home', projectId })
    selectFashionPanel()
  }
  const openEvaluations = (projectId: string): void => {
    navigation.navigate({ kind: 'evaluations-home', projectId })
    selectFashionPanel()
  }
  const openDeliverableFeedback = (projectId: string, followUpRef: DeliverableFollowUpRef): void => {
    navigation.navigate({ kind: 'feedback-new', projectId, followUpRef })
    selectFashionPanel()
  }
  const openDeliverableOutcomes = (projectId: string, followUpRef: DeliverableFollowUpRef): void => {
    navigation.navigate({ kind: 'outcomes-home', projectId, followUpRef })
    selectFashionPanel()
  }
  const openDeliverableEvaluations = (projectId: string, followUpRef: DeliverableFollowUpRef): void => {
    navigation.navigate({ kind: 'evaluations-home', projectId, followUpRef })
    selectFashionPanel()
  }
  const openEvaluationRun = (projectId: string, runId: string): void => {
    navigation.navigate({ kind: 'evaluation-run', projectId, runId })
    selectFashionPanel()
  }
  const openImprovements = (projectId: string): void => {
    navigation.navigate({ kind: 'improvements-home', projectId })
    selectFashionPanel()
  }
  const openImprovementDetail = (projectId: string, itemId: string): void => {
    navigation.navigate({ kind: 'improvement-detail', projectId, itemId })
    selectFashionPanel()
  }
  const listFeedback = (projectId: string) => ctx.fashionFeedback.listFeedback(projectId)
  const listFeedbackAvailability = async (projectId: string) => {
    const deliverables = await ctx.fashionDesign.listDeliverables(projectId as ProjectId)
    const histories = await Promise.all(deliverables.map(row => ctx.fashionFeedback.listOutcomeAvailabilityHistory({
      projectId: projectId as ProjectId,
      deliverableRef: { id: row.id, revision: row.revision },
    })))
    return histories.flat()
  }
  const scopeRows = async <T>(
    projectId: string,
    read: (deliverableRef: { id: string; revision: number }) => Promise<readonly T[]>,
  ) => {
    const deliverables = await ctx.fashionDesign.listDeliverables(projectId as ProjectId)
    const histories = await Promise.all(deliverables.map(row => read({ id: row.id, revision: row.revision })))
    return histories.flat()
  }
  const listDevelopment = (projectId: string) => scopeRows(projectId, deliverableRef =>
    ctx.fashionFeedback.listDevelopmentTimeline({ projectId: projectId as ProjectId, deliverableRef }))
  const listMetrics = (projectId: string) => scopeRows(projectId, deliverableRef =>
    ctx.fashionFeedback.listMetricObservations({ projectId: projectId as ProjectId, deliverableRef }))
  const recordFeedback = (input: import('./feedback/FeedbackPages.tsx').FeedbackWrite) => {
    const request = {
      projectId: input.projectId as ProjectId,
      subjectRef: {
        subjectType: input.subjectType,
        subjectId: input.subjectId,
        subjectRevision: input.subjectRevision,
        relatedDeliverableRef: null,
        workflowStep: null,
      },
      expectedSubjectRevision: input.subjectRevision,
      action: input.action,
      reasonCodes: [input.reasonCode],
      reasonText: input.reasonText,
      modifications: input.modificationSummary === '' ? [] : [{
        area: input.modificationArea,
        summary: input.modificationSummary,
        reasonCodes: [input.reasonCode],
        artifactRef: null,
      }],
      professionalValidity: input.professionalValidity,
      revisionEffort: input.revisionEffort,
      timeSavedEstimate: input.timeSavedEstimate,
      followUpNeeded: input.followUpNeeded,
      followUpNote: null,
      dataReality: input.dataReality,
      visibility: input.visibility,
      idempotencyKey: input.idempotencyKey,
    }
    if (input.supersedesId !== null && input.expectedHeadId !== null && input.correctionReason !== null) {
      return ctx.fashionFeedback.supersedeFeedback({
        ...request,
        supersedesId: input.supersedesId,
        expectedHeadId: input.expectedHeadId,
        correctionReason: input.correctionReason,
      })
    }
    return ctx.fashionFeedback.recordFeedback(request)
  }
  const recordAvailability = (input: import('./feedback/FeedbackPages.tsx').AvailabilityWrite) =>
    ctx.fashionFeedback.recordOutcomeAvailability({
      projectId: input.projectId as ProjectId,
      deliverableRef: { id: input.deliverableId, revision: input.deliverableRevision },
      conceptRef: { id: input.conceptId, revision: input.conceptRevision },
      availability: input.availability,
      reasonCode: input.reasonCode,
      asOf: input.asOf,
      dataReality: input.dataReality,
      visibility: 'project_private',
      idempotencyKey: input.idempotencyKey,
    })
  const sourceRef = (recordedAt: string) => ({
    sourceKind: 'human_statement' as const,
    ref: 'designer-statement',
    locator: null,
    recordedOrExportedAt: recordedAt,
    usageBoundary: 'project_private',
    contentHash: null,
    providerName: null,
    note: null,
  })
  const recordDevelopment = (input: import('./feedback/FeedbackPages.tsx').DevelopmentWrite) =>
    ctx.fashionFeedback.recordDevelopmentEvent({
      projectId: input.projectId as ProjectId,
      deliverableRef: { id: input.deliverableId, revision: input.deliverableRevision },
      conceptRef: { id: input.conceptId, revision: input.conceptRevision },
      stage: input.stage,
      occurredAt: input.occurredAt,
      businessContext: input.businessContext,
      sourceType: 'manual_entry',
      sourceRef: sourceRef(input.occurredAt),
      verificationStatus: 'self_reported',
      limitations: [input.limitations],
      dataReality: input.dataReality,
      visibility: 'project_private',
      idempotencyKey: input.idempotencyKey,
    })
  const recordMetric = (input: import('./feedback/FeedbackPages.tsx').MetricWrite) =>
    ctx.fashionFeedback.recordMetricObservation({
      projectId: input.projectId as ProjectId,
      deliverableRef: { id: input.deliverableId, revision: input.deliverableRevision },
      conceptRef: { id: input.conceptId, revision: input.conceptRevision },
      metricKey: input.metricKey,
      definitionVersion: input.definitionVersion,
      value: input.unavailable || input.integerValue === null
        ? { kind: 'unavailable', reason: 'not_yet_observed' }
        : { kind: 'integer', value: input.integerValue },
      measurementWindow: { start: input.windowStart, end: input.windowEnd, timezone: 'UTC' },
      observedAt: input.windowEnd,
      marketRegion: input.region,
      channel: input.channel,
      sourceType: 'manual_entry',
      sourceRef: sourceRef(input.windowEnd),
      verificationStatus: 'self_reported',
      dimensions: [],
      limitations: [input.limitations],
      dataReality: input.dataReality,
      visibility: 'project_private',
      causalClaim: 'none',
      idempotencyKey: input.idempotencyKey,
    })
  const listEvaluationDefinitions = () => ctx.fashionEvaluation.listDefinitions()
  const listEvaluationCases = () => ctx.fashionEvaluation.listCases()
  const listEvaluationRuns = (projectId: string) => ctx.fashionEvaluation.listRuns(projectId)
  const getEvaluationRuleResults = (runId: string) => ctx.fashionEvaluation.getRuleResults(runId)
  const listEvaluationAssessments = (runId: string) => ctx.fashionEvaluation.listAssessments({ runId })
  const listImprovements = (projectId: string) => ctx.fashionEvaluation.listImprovements(projectId)
  const recordImprovementDecision = (input: {
    projectId: string
    itemId: string
    action: 'accepted'
    reason: string
    confirmedPlanner: true
  }) => ctx.fashionEvaluation.recordImprovementDecision({
    projectId: input.projectId as ProjectId,
    itemId: input.itemId,
    action: input.action,
    reason: input.reason,
    confirmedPlanner: input.confirmedPlanner,
  })
  const runEvaluation = (input: { projectId: string; definitionId: string; caseIds: readonly string[] }) =>
    ctx.fashionEvaluation.runEvaluation({
      projectId: input.projectId as ProjectId,
      definitionId: input.definitionId,
      caseIds: input.caseIds,
    })
  const recordAssessment = (input: {
    projectId: string
    runId: string
    criterionId: string
    rating: import('@gentlexx/dsh-fashion-evaluation/types').HumanRating
    reason: string
  }) => ctx.fashionEvaluation.recordAssessment({
    projectId: input.projectId as ProjectId,
    runId: input.runId,
    criterionId: input.criterionId,
    rating: input.rating,
    reason: input.reason,
  })
  const exportEvaluationReport = (runId: string) => ctx.fashionEvaluation.exportReport(runId)
  const fashionDesignReview = ctx.fashionDesign
  const createProject = (title: string) => ctx.fashionProjects.create(title)
  const getProject = (projectId: string) => ctx.fashionProjects.get(projectId as ProjectId)
  const loadProjects = () => ctx.fashionProjects.load()
  const loadTasks = (projectId: string) => ctx.fashionResearch.loadTasks(projectId as ProjectId)
  const loadTaskChildren = (projectId: string, taskId: string) =>
    ctx.fashionResearch.loadTaskChildren(projectId as ProjectId, brandResearchTaskId(taskId))
  const createTask = ctx.fashionResearch.createTask.bind(ctx.fashionResearch)
  const getTask = (projectId: string, taskId: ResearchTaskId) =>
    ctx.fashionResearch.getTask({ projectId: projectId as ProjectId, taskId })
  const createSource = ctx.fashionResearch.createSource.bind(ctx.fashionResearch)
  const getSource = (projectId: string, taskId: string, sourceId: SourceId) =>
    ctx.fashionResearch.getSource({
      projectId: projectId as ProjectId,
      taskId: brandResearchTaskId(taskId),
      sourceId,
    })
  const createSample = ctx.fashionResearch.createSample.bind(ctx.fashionResearch)
  const getSample = (projectId: string, taskId: string, sampleId: SampleId) =>
    ctx.fashionResearch.getSample({
      projectId: projectId as ProjectId,
      taskId: brandResearchTaskId(taskId),
      sampleId,
    })
  const createEvidence = ctx.fashionResearch.createEvidence.bind(ctx.fashionResearch)
  const getEvidence = (projectId: string, taskId: string, evidenceId: EvidenceId) =>
    ctx.fashionResearch.getEvidence({
      projectId: projectId as ProjectId,
      taskId: brandResearchTaskId(taskId),
      evidenceId,
    })
  const reviewEvidence = ctx.fashionResearch.reviewEvidence.bind(ctx.fashionResearch)
  const loadAnalysisWorkspace = (projectId: string, taskId: string) =>
    ctx.fashionAnalysis.loadWorkspace(projectId as ProjectId, brandResearchTaskId(taskId))
  const getMarketItem = (projectId: string, taskId: string, marketItemId: string) =>
    ctx.fashionAnalysis.getMarketItem({
      projectId: projectId as ProjectId,
      taskId: brandResearchTaskId(taskId),
      marketItemId: marketItemId as import('@gentlexx/dsh-fashion-analysis/types').MarketItemId,
    })
  const getAnalysisSignal = (projectId: string, taskId: string, signalId: string) =>
    ctx.fashionAnalysis.getSignal({
      projectId: projectId as ProjectId,
      taskId: brandResearchTaskId(taskId),
      signalId: signalId as import('@gentlexx/dsh-fashion-analysis/types').PopularitySignalId,
    })
  const getAnalysisCluster = (projectId: string, taskId: string, clusterId: string) =>
    ctx.fashionAnalysis.getCluster({
      projectId: projectId as ProjectId,
      taskId: brandResearchTaskId(taskId),
      clusterId: clusterId as import('@gentlexx/dsh-fashion-analysis/types').TrendClusterId,
    })
  const getAnalysisOpportunity = (projectId: string, taskId: string, opportunityId: string) =>
    ctx.fashionAnalysis.getOpportunity({
      projectId: projectId as ProjectId,
      taskId: brandResearchTaskId(taskId),
      opportunityId: opportunityId as import('@gentlexx/dsh-fashion-analysis/types').DesignOpportunityId,
    })
  const createMarketItem = (input: {
    projectId: string
    taskId: string
    itemType: import('@gentlexx/dsh-fashion-analysis/types').MarketItemType
    displayName: string
    brandOrCreator: string | null
    categoryCandidate: string | null
    observationLinks: readonly {
      sampleId: string
      sourceId: string
      evidenceIds: readonly string[]
    }[]
  }) => ctx.fashionAnalysis.createMarketItem({
    projectId: input.projectId as ProjectId,
    taskId: brandResearchTaskId(input.taskId),
    itemType: input.itemType,
    displayName: input.displayName,
    brandOrCreator: input.brandOrCreator,
    categoryCandidate: input.categoryCandidate,
    observationLinks: input.observationLinks.map(link => ({
      sampleId: link.sampleId as SampleId,
      sourceId: link.sourceId as SourceId,
      evidenceIds: link.evidenceIds as EvidenceId[],
    })),
  })
  const createPopularitySignal = (input: {
    projectId: string
    taskId: string
    signalType: import('@gentlexx/dsh-fashion-analysis/types').PopularitySignalType
    subjectRefs: readonly { type: 'market_item'; id: string }[]
    platform: string
    observedAt: string
    rawValue: string
    rawUnit: string
    evidenceIds: readonly string[]
    methodVersion: string
    limitations: readonly string[]
  }) => ctx.fashionAnalysis.createPopularitySignal({
    projectId: input.projectId as ProjectId,
    taskId: brandResearchTaskId(input.taskId),
    signalType: input.signalType,
    subjectRefs: input.subjectRefs.map(ref => ({
      type: 'market_item' as const,
      id: ref.id as import('@gentlexx/dsh-fashion-analysis/types').MarketItemId,
    })),
    platform: input.platform,
    observedAt: input.observedAt,
    rawValue: input.rawValue,
    rawUnit: input.rawUnit,
    evidenceIds: input.evidenceIds as EvidenceId[],
    methodVersion: input.methodVersion,
    limitations: input.limitations,
  })
  const createTrendCluster = (input: {
    projectId: string
    taskId: string
    name: string
    definition: string
    memberRefs: readonly { type: 'market_item' | 'signal'; id: string }[]
    signalIds: readonly string[]
    clusterMethod: 'manual'
    methodVersion: string
    marketRegions: readonly string[]
    timeContext: string
    evidenceGrade: import('@gentlexx/dsh-fashion-research/types').EvidenceGrade
    counterEvidence: readonly string[]
    biasesAndGaps: readonly string[]
  }) => ctx.fashionAnalysis.createTrendCluster({
    projectId: input.projectId as ProjectId,
    taskId: brandResearchTaskId(input.taskId),
    name: input.name,
    definition: input.definition,
    memberRefs: input.memberRefs,
    signalIds: input.signalIds as import('@gentlexx/dsh-fashion-analysis/types').PopularitySignalId[],
    clusterMethod: input.clusterMethod,
    methodVersion: input.methodVersion,
    marketRegions: input.marketRegions,
    timeContext: input.timeContext,
    evidenceGrade: input.evidenceGrade,
    counterEvidence: input.counterEvidence,
    biasesAndGaps: input.biasesAndGaps,
  })
  const createDesignOpportunity = (input: {
    projectId: string
    taskId: string
    title: string
    opportunityStatement: string
    trendClusterIds: readonly string[]
    targetMarket: string
    targetUserHypothesis: string
    category: string
    timing: string
    evidenceGrade: import('@gentlexx/dsh-fashion-research/types').EvidenceGrade
  }) => ctx.fashionAnalysis.createDesignOpportunity({
    projectId: input.projectId as ProjectId,
    taskId: brandResearchTaskId(input.taskId),
    title: input.title,
    opportunityStatement: input.opportunityStatement,
    trendClusterIds: input.trendClusterIds as import('@gentlexx/dsh-fashion-analysis/types').TrendClusterId[],
    targetMarket: input.targetMarket,
    targetUserHypothesis: input.targetUserHypothesis,
    category: input.category,
    timing: input.timing,
    evidenceGrade: input.evidenceGrade,
  })
  const updateSource = (input: {
    projectId: string
    taskId: ResearchTaskId
    sourceId: SourceId
    expectedRevision: number
    availabilityStatus: import('@gentlexx/dsh-fashion-research/types').AvailabilityStatus
  }) => ctx.fashionResearch.updateSource({
    projectId: input.projectId as ProjectId,
    taskId: input.taskId,
    sourceId: input.sourceId,
    expectedRevision: input.expectedRevision,
    availabilityStatus: input.availabilityStatus,
  })
  const decideOpportunity = ctx.fashionAnalysis.decideOpportunity.bind(ctx.fashionAnalysis)
  const loadDesignWorkspace = (projectId: string) =>
    ctx.fashionDesign.loadWorkspace(projectId as ProjectId)
  const listDesignBriefs = () => ctx.fashionDesign.briefs.getSnapshot().items
  const listDesignConceptSets = () => ctx.fashionDesign.conceptSets.getSnapshot().items
  const listDesignConcepts = () => ctx.fashionDesign.concepts.getSnapshot().items
  const evaluateDesignDifferentiation = (projectId: string, conceptSetId: string) =>
    ctx.fashionDesign.evaluateDifferentiation({
      projectId: projectId as ProjectId,
      conceptSetId: conceptSetId as import('@gentlexx/dsh-fashion-design/types').ConceptSetId,
    })
  const getDesignConcept = (projectId: string, conceptId: string) =>
    ctx.fashionDesign.getConcept({
      projectId: projectId as ProjectId,
      conceptId: conceptId as import('@gentlexx/dsh-fashion-design/types').DesignConceptId,
    })
  const listDesignVisualDrafts = (projectId: string, conceptId: string) =>
    ctx.fashionDesign.listVisualDrafts({
      projectId: projectId as ProjectId,
      conceptId: conceptId as import('@gentlexx/dsh-fashion-design/types').DesignConceptId,
    })
  const getDesignVisualDraft = (projectId: string, visualDraftId: string) =>
    ctx.fashionDesign.getVisualDraft({
      projectId: projectId as ProjectId,
      visualDraftId: visualDraftId as import('@gentlexx/dsh-fashion-design/types').VisualDraftId,
    })
  const findDesignOpportunity = async (projectId: string, opportunityId: string) => {
    const id = projectId as ProjectId
    await ctx.fashionResearch.loadTasks(id)
    const tasks = ctx.fashionResearch.tasks.getSnapshot().items.filter(task => task.projectId === id)
    for (const task of tasks) {
      try {
        return await getAnalysisOpportunity(projectId, String(task.id), opportunityId)
      } catch (error: unknown) {
        // An Opportunity lives under exactly one ResearchTask; the others report it not found.
        if (!isRpcCode(error, 'fashion-analysis/opportunity-not-found')) throw error
      }
    }
    return null
  }
  const createDesignBrief = (input: DesignBriefDraftInput) => runDesignWrite(() =>
    ctx.fashionDesign.createBriefFromOpportunity({
      projectId: input.projectId as ProjectId,
      opportunityId: input.opportunityId as import('@gentlexx/dsh-fashion-analysis/types').DesignOpportunityId,
      expectedOpportunityRevision: input.expectedOpportunityRevision,
      selectionDecisionId: input.selectionDecisionId as import('@gentlexx/dsh-fashion-analysis/types').OpportunityDecisionId,
      market: input.market,
      season: input.season,
      category: input.category,
      targetUser: input.targetUser,
      brandContext: input.brandContext,
      mustKeep: input.mustKeep,
      mustAvoid: input.mustAvoid,
      materialsConstraints: input.materialsConstraints,
      costConstraints: input.costConstraints,
      productionConstraints: input.productionConstraints,
      differentiationGoals: input.differentiationGoals,
      openQuestions: input.openQuestions,
    }))
  const confirmDesignBrief = (input: { projectId: string; briefId: string; expectedRevision: number }) =>
    runDesignWrite(() => ctx.fashionDesign.confirmBrief({
      projectId: input.projectId as ProjectId,
      briefId: input.briefId as import('@gentlexx/dsh-fashion-design/types').DesignBriefId,
      expectedRevision: input.expectedRevision,
    }))
  const createDesignConceptSet = (input: { projectId: string; briefId: string; expectedBriefRevision: number }) =>
    runDesignWrite(() => ctx.fashionDesign.createConceptSet({
      projectId: input.projectId as ProjectId,
      briefId: input.briefId as import('@gentlexx/dsh-fashion-design/types').DesignBriefId,
      expectedBriefRevision: input.expectedBriefRevision,
    }))
  const createDesignConcept = (input: DesignConceptDraftInput) => runDesignWrite(() =>
    ctx.fashionDesign.createConcept({
      projectId: input.projectId as ProjectId,
      conceptSetId: input.conceptSetId as import('@gentlexx/dsh-fashion-design/types').ConceptSetId,
      expectedConceptSetRevision: input.expectedConceptSetRevision,
      conceptName: input.conceptName,
      designIntent: input.designIntent,
      silhouette: input.silhouette,
      proportionAndLength: input.proportionAndLength,
      materialDirection: input.materialDirection,
      colorDirection: input.colorDirection,
      constructionAndDetails: input.constructionAndDetails,
      functionalValue: input.functionalValue,
      targetUseScenarios: input.targetUseScenarios,
      originalTransformationNotes: input.originalTransformationNotes,
      productionUnknowns: input.productionUnknowns,
    }))
  const reviseDesignConcept = (input: DesignConceptRevisionInput) => runDesignWrite(() =>
    ctx.fashionDesign.reviseConcept({
      projectId: input.projectId as ProjectId,
      conceptId: input.conceptId as import('@gentlexx/dsh-fashion-design/types').DesignConceptId,
      expectedRevision: input.expectedRevision,
      conceptName: input.conceptName,
      designIntent: input.designIntent,
      silhouette: input.silhouette,
      proportionAndLength: input.proportionAndLength,
      materialDirection: input.materialDirection,
      colorDirection: input.colorDirection,
      constructionAndDetails: input.constructionAndDetails,
      functionalValue: input.functionalValue,
      targetUseScenarios: input.targetUseScenarios,
      originalTransformationNotes: input.originalTransformationNotes,
      productionUnknowns: input.productionUnknowns,
    }))
  const markDesignConceptSetReviewReady = (input: { projectId: string; conceptSetId: string; expectedRevision: number }) =>
    runDesignWrite(() => ctx.fashionDesign.markConceptSetReviewReady({
      projectId: input.projectId as ProjectId,
      conceptSetId: input.conceptSetId as import('@gentlexx/dsh-fashion-design/types').ConceptSetId,
      expectedRevision: input.expectedRevision,
    }))
  const openDesignReview = (input: {
    projectId: string
    conceptSetId: string
    expectedConceptSetRevision: number
  }) => fashionDesignReview.openReview({
    projectId: input.projectId as ProjectId,
    conceptSetId: input.conceptSetId as import('@gentlexx/dsh-fashion-design/types').ConceptSetId,
    expectedConceptSetRevision: input.expectedConceptSetRevision,
  })
  const listDesignReviews = (projectId: string) =>
    fashionDesignReview.listReviews(projectId as ProjectId)
  const getDesignReview = (projectId: string, reviewRoundId: string) =>
    fashionDesignReview.getReview(
      projectId as ProjectId,
      reviewRoundId as import('@gentlexx/dsh-fashion-design/types').ReviewRoundId,
    )
  const selectReviewConcept = (input: {
    projectId: string
    reviewRoundId: string
    conceptId: string
    expectedConceptRevision: number
    reasonCodes: readonly string[]
    reasonText: string | null
  }) => fashionDesignReview.selectConcept({
    projectId: input.projectId as ProjectId,
    reviewRoundId: input.reviewRoundId as import('@gentlexx/dsh-fashion-design/types').ReviewRoundId,
    conceptId: input.conceptId as import('@gentlexx/dsh-fashion-design/types').DesignConceptId,
    expectedConceptRevision: input.expectedConceptRevision,
    reasonCodes: input.reasonCodes,
    reasonText: input.reasonText,
  })
  const approveSelectedReviewConcept = (input: {
    projectId: string
    reviewRoundId: string
    reasonCodes: readonly string[]
    reasonText: string
  }) => fashionDesignReview.approveSelectedConcept({
    projectId: input.projectId as ProjectId,
    reviewRoundId: input.reviewRoundId as import('@gentlexx/dsh-fashion-design/types').ReviewRoundId,
    reasonCodes: input.reasonCodes,
    reasonText: input.reasonText,
  })
  const requestReviewConceptRevision = (input: {
    projectId: string
    reviewRoundId: string
    subjectType: 'concept_set' | 'concept'
    subjectId: string
    expectedRevision: number
    reasonCodes: readonly string[]
    reasonText: string
  }) => fashionDesignReview.requestConceptRevision({
    projectId: input.projectId as ProjectId,
    reviewRoundId: input.reviewRoundId as import('@gentlexx/dsh-fashion-design/types').ReviewRoundId,
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    expectedRevision: input.expectedRevision,
    reasonCodes: input.reasonCodes,
    reasonText: input.reasonText,
  })
  const rejectReviewConceptOrSet = (input: {
    projectId: string
    reviewRoundId: string
    subjectType: 'concept_set' | 'concept'
    subjectId: string
    expectedRevision: number
    reasonCodes: readonly string[]
    reasonText: string
  }) => fashionDesignReview.rejectConceptOrSet({
    projectId: input.projectId as ProjectId,
    reviewRoundId: input.reviewRoundId as import('@gentlexx/dsh-fashion-design/types').ReviewRoundId,
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    expectedRevision: input.expectedRevision,
    reasonCodes: input.reasonCodes,
    reasonText: input.reasonText,
  })
  const requestReviewMoreResearch = (input: {
    projectId: string
    reviewRoundId: string
    subjectType: 'concept_set' | 'concept'
    subjectId: string
    expectedRevision: number
    reasonCodes: readonly string[]
    reasonText: string
  }) => fashionDesignReview.requestMoreResearch({
    projectId: input.projectId as ProjectId,
    reviewRoundId: input.reviewRoundId as import('@gentlexx/dsh-fashion-design/types').ReviewRoundId,
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    expectedRevision: input.expectedRevision,
    reasonCodes: input.reasonCodes,
    reasonText: input.reasonText,
  })
  const revokeReviewApproval = (input: {
    projectId: string
    reviewRoundId: string
    reasonText: string
  }) => fashionDesignReview.revokeApproval({
    projectId: input.projectId as ProjectId,
    reviewRoundId: input.reviewRoundId as import('@gentlexx/dsh-fashion-design/types').ReviewRoundId,
    reasonText: input.reasonText,
  })
  const getReviewApprovalValidity = (projectId: string, reviewRoundId: string) =>
    fashionDesignReview.getApprovalValidity(
      projectId as ProjectId,
      reviewRoundId as import('@gentlexx/dsh-fashion-design/types').ReviewRoundId,
    )
  const generateDesignDeliverable = (input: {
    projectId: string
    reviewRoundId: string
    audienceProfile: 'public_portfolio'
  }) => fashionDesignReview.generateDeliverable({
    projectId: input.projectId as ProjectId,
    reviewRoundId: input.reviewRoundId as import('@gentlexx/dsh-fashion-design/types').ReviewRoundId,
    audienceProfile: input.audienceProfile,
  })
  const listDesignDeliverables = (projectId: string) =>
    fashionDesignReview.listDeliverables(projectId as ProjectId)
  const readStageObservations = async (projectId: string) => {
    const id = projectId as ProjectId
    await Promise.all([
      ctx.fashionResearch.loadTasks(id),
      ctx.fashionDesign.loadWorkspace(id),
    ])
    const [reviews, deliverables] = await Promise.all([
      fashionDesignReview.listReviews(id),
      fashionDesignReview.listDeliverables(id),
    ])
    // The shared list stores keep their previous items after a failed or
    // superseded load; counting them would report another project's progress.
    const scopedCount = (
      state: { readonly status: string; readonly items: readonly { readonly projectId: ProjectId }[] },
    ): number => {
      if (state.status !== 'ready') throw new Error('fashion stage observation is not ready')
      return state.items.filter(item => item.projectId === id).length
    }
    return {
      researchTasks: scopedCount(ctx.fashionResearch.tasks.getSnapshot()),
      opportunityBriefs: scopedCount(ctx.fashionDesign.briefs.getSnapshot()),
      conceptSets: scopedCount(ctx.fashionDesign.conceptSets.getSnapshot()),
      reviewRounds: reviews.length,
      deliverables: deliverables.length,
    }
  }
  const getDesignDeliverable = (projectId: string, deliverableId: string) =>
    fashionDesignReview.getDeliverable(
      projectId as ProjectId,
      deliverableId as import('@gentlexx/dsh-fashion-design/types').DesignDeliverableId,
    )
  const listDesignDeliverableArtifacts = (projectId: string, deliverableId: string) =>
    fashionDesignReview.listDeliverableArtifacts(
      projectId as ProjectId,
      deliverableId as import('@gentlexx/dsh-fashion-design/types').DesignDeliverableId,
    )
  const verifyDesignDeliverable = async (projectId: string, deliverableId: string) => {
    try {
      return await fashionDesignReview.verifyDeliverable(
        projectId as ProjectId,
        deliverableId as import('@gentlexx/dsh-fashion-design/types').DesignDeliverableId,
      )
    } catch (error: unknown) {
      const reasons = integrityMismatchReasons(error)
      if (reasons === null) throw error
      return { ok: false, mismatches: reasons }
    }
  }
  const toggleSidebar = (): void => {
    ctx.layout.toggleSidebar()
  }

  const sidebarInject = () => ({
    openProjects,
    openAgent,
    openProject,
    toggleSidebar,
    hooks: {
      route: navigation.route,
      projectList: ctx.fashionProjects.list,
    },
  })

  const workspaceInject = () => ({
    openProjects,
    openAgent,
    openProject,
    openResearch,
    openResearchTaskNew,
    openResearchTask,
    openResearchSourceNew,
    openResearchSource,
    openResearchSample,
    openResearchEvidence,
    openAnalysis,
    openAnalysisItem,
    openAnalysisSignal,
    openAnalysisCluster,
    openAnalysisOpportunity,
    openDesignDirections,
    openDesignBrief,
    openDesignConcept,
    openDesignVisual,
    openReviewHome,
    openReviewRound,
    openDeliverablesHome,
    openDeliverableDetail,
    createProject,
    getProject,
    loadProjects,
    loadTasks,
    loadTaskChildren,
    createTask,
    getTask,
    createSource,
    getSource,
    createSample,
    getSample,
    createEvidence,
    getEvidence,
    reviewEvidence,
    loadAnalysisWorkspace,
    getMarketItem,
    getAnalysisSignal,
    getAnalysisCluster,
    getAnalysisOpportunity,
    createMarketItem,
    createPopularitySignal,
    createTrendCluster,
    createDesignOpportunity,
    updateSource,
    readStageObservations,
    decideOpportunity,
    loadDesignWorkspace,
    listDesignBriefs,
    listDesignConceptSets,
    listDesignConcepts,
    evaluateDesignDifferentiation,
    getDesignConcept,
    listDesignVisualDrafts,
    getDesignVisualDraft,
    findDesignOpportunity,
    createDesignBrief,
    confirmDesignBrief,
    createDesignConceptSet,
    createDesignConcept,
    reviseDesignConcept,
    markDesignConceptSetReviewReady,
    openDesignReview,
    listDesignReviews,
    getDesignReview,
    selectReviewConcept,
    approveSelectedReviewConcept,
    requestReviewConceptRevision,
    rejectReviewConceptOrSet,
    requestReviewMoreResearch,
    revokeReviewApproval,
    getReviewApprovalValidity,
    generateDesignDeliverable,
    listDesignDeliverables,
    getDesignDeliverable,
    listDesignDeliverableArtifacts,
    verifyDesignDeliverable,
    listFeedback,
    listFeedbackAvailability,
    listDevelopment,
    listMetrics,
    recordFeedback,
    recordAvailability,
    recordDevelopment,
    recordMetric,
    openFeedbackDetail,
    listEvaluationDefinitions,
    listEvaluationCases,
    listEvaluationRuns,
    getEvaluationRuleResults,
    listEvaluationAssessments,
    listImprovements,
    recordImprovementDecision,
    runEvaluation,
    recordAssessment,
    exportEvaluationReport,
    openFeedbackHome,
    openFeedbackNew,
    openOutcomes,
    openEvaluations,
    openDeliverableFeedback,
    openDeliverableOutcomes,
    openDeliverableEvaluations,
    openEvaluationRun,
    openImprovements,
    openImprovementDetail,
    hooks: {
      route: navigation.route,
      projectList: ctx.fashionProjects.list,
      researchTasks: ctx.fashionResearch.tasks,
      researchSources: ctx.fashionResearch.sources,
      researchSamples: ctx.fashionResearch.samples,
      researchEvidence: ctx.fashionResearch.evidence,
      analysisItems: ctx.fashionAnalysis.marketItems,
      analysisSignals: ctx.fashionAnalysis.signals,
      analysisClusters: ctx.fashionAnalysis.clusters,
      analysisOpportunities: ctx.fashionAnalysis.opportunities,
      locale: ctx.locale,
    },
  })

  ctx.slots.inject('sidebar', () => ctx.slots.register({
    name: 'sidebar',
    locale: NS,
    children: {
      'sidebar.workspaces': { kind: 'single', scope: 'root' },
      'sidebar.settings': { kind: 'single', scope: 'root' },
    },
    inject: sidebarInject,
  }, FashionSidebar))

  ctx.slots.inject('main', function* () {
    yield ctx.slots.register({
      name: 'main',
      key: FASHION_PANEL_ID,
      locale: NS,
      inject: workspaceInject,
    }, FashionWorkspace)
  })

  // Every FashionRoute owns the Fashion main panel; select it on boot and on
  // History changes. Registration may still be settling on the first tick.
  ctx.effect(() => {
    selectFashionPanel()
    const stop = navigation.route.subscribe(() => { selectFashionPanel() })
    queueMicrotask(selectFashionPanel)
    return stop
  }, 'ui-fashion-shell: select fashion panel')

  ctx.slots.inject(
    'conversation.session.header.utilities',
    () => ctx.slots.register({
      name: 'conversation.session.header.utilities',
      id: 'fashion-sidebar-restore',
      order: 5,
      locale: NS,
      inject: () => ({ toggleSidebar }),
    }, FashionHeaderLeadingControls),
  )

  const agentContextInject = () => ({
    openProjects,
    openProject,
    confirmBind,
    createBoundSession,
    hooks: {
      route: navigation.route,
      projectList: ctx.fashionProjects.list,
      agentStatus: ctx.fashionAgent.view,
    },
  })

  ctx.slots.inject(
    'conversation.hero.brand.mark',
    () => ctx.slots.register({
      name: 'conversation.hero.brand.mark',
      locale: NS,
    }, FashionBrandMark),
  )

  ctx.slots.inject(
    'conversation.hero.lead',
    () => ctx.slots.register({
      name: 'conversation.hero.lead',
      locale: NS,
      inject: agentContextInject,
    }, FashionAgentLead),
  )

  ctx.slots.inject(
    'conversation.input.dock',
    () => ctx.slots.register({
      name: 'conversation.input.dock',
      id: 'fashion-agent-context',
      order: 5,
      locale: NS,
      inject: agentContextInject,
    }, FashionAgentContextStrip),
  )
}

/** Whether a client-service rejection carries this Host `rpcError.code`. */
function isRpcCode(error: unknown, code: string): boolean {
  if (!(error instanceof Error) || !('rpcError' in error)) return false
  const rpcError: unknown = error.rpcError
  return typeof rpcError === 'object' && rpcError !== null && 'code' in rpcError && rpcError.code === code
}

/**
 * The Host reports a failed hash verification by rejecting with
 * `fashion-design/integrity-mismatch` and a comma-separated `details.reason`;
 * every other rejection means verification did not run.
 */
function integrityMismatchReasons(error: unknown): readonly string[] | null {
  if (!(error instanceof Error) || !('rpcError' in error)) return null
  const rpcError: unknown = error.rpcError
  if (typeof rpcError !== 'object' || rpcError === null) return null
  if (!('code' in rpcError) || rpcError.code !== 'fashion-design/integrity-mismatch') return null
  if (!('details' in rpcError) || typeof rpcError.details !== 'object' || rpcError.details === null) return null
  const details: object = rpcError.details
  if (!('reason' in details) || typeof details.reason !== 'string') return null
  return details.reason.split(',').filter(reason => reason.length > 0)
}
