/** Fashion main panel: Projects / Overview / Research / Analysis / 404. */
import type { InjectFace, PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { ProjectId, ProjectView } from '@gentlexx/dsh-fashion-project/types'
import type { ProjectListState } from '@gentlexx/dsh-api-fashion-project-controller/client'
import type { ResearchListState } from '@gentlexx/dsh-api-fashion-research-controller/client'
import type { AnalysisListState } from '@gentlexx/dsh-api-fashion-analysis-controller/client'
import type {
  ConceptSet,
  DesignConcept,
  DesignOpportunityBrief,
  DifferentiationCheck,
  VisualDraft,
} from '@gentlexx/dsh-fashion-design/types'
import type {
  ClaimType,
  Evidence,
  EvidenceGrade,
  EvidenceId,
  ResearchTask,
  ResearchTaskId,
  Sample,
  SampleId,
  Source,
  SourceId,
  SourceKind,
} from '@gentlexx/dsh-fashion-research/types'
import type {
  DesignOpportunity,
  DesignOpportunityId,
  MarketItem,
  PopularitySignal,
  TrendCluster,
} from '@gentlexx/dsh-fashion-analysis/types'
import type { LocaleSnapshot } from '@deepseek-ai/dsh-client-locale/client'
import type { DeliverableFollowUpRef, FashionRoute } from './routes.ts'
import { ProjectsPage } from './pages/ProjectsPage.tsx'
import { ProjectOverviewPage } from './pages/ProjectOverviewPage.tsx'
import { ResearchHomePage } from './research/ResearchHomePage.tsx'
import { ResearchTaskNewPage } from './research/ResearchTaskNewPage.tsx'
import { ResearchTaskPage } from './research/ResearchTaskPage.tsx'
import { ResearchSourceNewPage } from './research/ResearchSourceNewPage.tsx'
import { SourceDetailPage } from './research/SourceDetailPage.tsx'
import { SampleDetailPage } from './research/SampleDetailPage.tsx'
import { EvidenceDetailPage } from './research/EvidenceDetailPage.tsx'
import { AnalysisHomePage } from './analysis/AnalysisHomePage.tsx'
import {
  AnalysisClusterPage,
  AnalysisItemPage,
  AnalysisOpportunityPage,
  AnalysisSignalPage,
} from './analysis/AnalysisDetailPages.tsx'
import type { AnalysisCreateFormsProps } from './analysis/AnalysisCreateForms.tsx'
import type { ProjectStageObservations } from './presentation/project-presentation.ts'
import {
  DesignBriefPage,
  DesignConceptPage,
  DesignDirectionsPage,
  DesignVisualPage,
} from './design/DesignPages.tsx'
import {
  DeliverableDetailPage,
  DeliverablesHomePage,
  ReviewHomePage,
  ReviewRoundPage,
} from './review/ReviewPages.tsx'
import type {
  DesignBriefDraftInput,
  DesignConceptDraftInput,
  DesignConceptRevisionInput,
  DesignWriteResult,
} from './design/design-write.ts'
import { FeedbackPages } from './feedback/FeedbackPages.tsx'
import { EvaluationPages } from './evaluation/EvaluationPages.tsx'
import type {
  ApprovalValidity,
  DesignDeliverable,
  ExportArtifactView,
  ReviewRound,
} from '@gentlexx/dsh-fashion-design/types'
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import { FashionPageHeader } from './components/FashionPageHeader.tsx'
import { DEFAULT_URL_SOURCE_FIELDS } from './research/ResearchFormState.ts'
import css from './FashionWorkspace.module.css'
import tokens from './FashionTokens.module.css'
import clsx from 'clsx'

export type FashionWorkspaceInjected = {
  openProjects: () => void
  openAgent: () => void
  openProject: (projectId: string) => void
  openResearch: (projectId: string) => void
  openResearchTaskNew: (projectId: string) => void
  openResearchTask: (projectId: string, taskId: string) => void
  openResearchSourceNew: (projectId: string, taskId: string) => void
  openResearchSource: (projectId: string, taskId: string, sourceId: string) => void
  openResearchSample: (projectId: string, taskId: string, sampleId: string) => void
  openResearchEvidence: (projectId: string, taskId: string, evidenceId: string) => void
  openAnalysis: (projectId: string, taskId: string) => void
  openAnalysisItem: (projectId: string, taskId: string, marketItemId: string) => void
  openAnalysisSignal: (projectId: string, taskId: string, signalId: string) => void
  openAnalysisCluster: (projectId: string, taskId: string, clusterId: string) => void
  openAnalysisOpportunity: (projectId: string, taskId: string, opportunityId: string) => void
  openDesignDirections: (projectId: string) => void
  openDesignBrief: (projectId: string, opportunityId: string) => void
  openDesignConcept: (projectId: string, conceptId: string) => void
  openDesignVisual: (projectId: string, conceptId: string, visualDraftId: string) => void
  openReviewHome: (projectId: string) => void
  openReviewRound: (projectId: string, reviewRoundId: string) => void
  openDeliverablesHome: (projectId: string) => void
  openDeliverableDetail: (projectId: string, deliverableId: string) => void
  createProject: (title: string) => Promise<ProjectView>
  getProject: (projectId: string) => Promise<ProjectView>
  loadProjects: () => Promise<void>
  loadTasks: (projectId: string) => Promise<void>
  loadTaskChildren: (projectId: string, taskId: string) => Promise<void>
  createTask: (input: {
    projectId: ProjectId
    title: string
    note?: string | null
  }) => Promise<ResearchTask>
  getTask: (projectId: string, taskId: ResearchTaskId) => Promise<ResearchTask>
  createSource: (input: {
    projectId: ProjectId
    taskId: ResearchTaskId
    locatorType: 'url'
    url: string
    title: string
    sourceKind: SourceKind
    captureMode: typeof DEFAULT_URL_SOURCE_FIELDS.captureMode
    usageBoundary: typeof DEFAULT_URL_SOURCE_FIELDS.usageBoundary
    externalProcessing: typeof DEFAULT_URL_SOURCE_FIELDS.externalProcessing
    attribution: string
  }) => Promise<Source>
  getSource: (projectId: string, taskId: string, sourceId: SourceId) => Promise<Source>
  createSample: (input: {
    projectId: ProjectId
    taskId: ResearchTaskId
    sourceId: SourceId
    label: string
  }) => Promise<Sample>
  getSample: (projectId: string, taskId: string, sampleId: SampleId) => Promise<Sample>
  createEvidence: (input: {
    projectId: ProjectId
    taskId: ResearchTaskId
    subjectType: 'source' | 'sample'
    subjectId: SourceId | SampleId
    observation: string
    claim?: string | null
    claimType?: ClaimType | null
    evidenceGrade: EvidenceGrade
    method?: string | null
    limitations?: readonly string[]
    excerpt?: string | null
  }) => Promise<Evidence>
  getEvidence: (projectId: string, taskId: string, evidenceId: EvidenceId) => Promise<Evidence>
  reviewEvidence: (input: {
    projectId: ProjectId
    taskId: ResearchTaskId
    evidenceId: EvidenceId
    expectedRevision: number
    reviewStatus: 'confirmed' | 'rejected'
    reviewNote: string
  }) => Promise<Evidence>
  loadAnalysisWorkspace: (projectId: string, taskId: string) => Promise<void>
  getMarketItem: (projectId: string, taskId: string, marketItemId: string) => Promise<MarketItem>
  getAnalysisSignal: (projectId: string, taskId: string, signalId: string) => Promise<PopularitySignal>
  getAnalysisCluster: (projectId: string, taskId: string, clusterId: string) => Promise<TrendCluster>
  getAnalysisOpportunity: (projectId: string, taskId: string, opportunityId: string) => Promise<DesignOpportunity>
  createMarketItem: AnalysisCreateFormsProps['createMarketItem']
  createPopularitySignal: AnalysisCreateFormsProps['createPopularitySignal']
  createTrendCluster: AnalysisCreateFormsProps['createTrendCluster']
  createDesignOpportunity: AnalysisCreateFormsProps['createDesignOpportunity']
  updateSource: (input: {
    projectId: ProjectId
    taskId: ResearchTaskId
    sourceId: SourceId
    expectedRevision: number
    availabilityStatus: import('@gentlexx/dsh-fashion-research/types').AvailabilityStatus
  }) => Promise<Source>
  readStageObservations: (projectId: string) => Promise<ProjectStageObservations>
  decideOpportunity: (input: {
    projectId: ProjectId
    taskId: ResearchTaskId
    opportunityId: DesignOpportunityId
    expectedRevision: number
    action: 'selected' | 'rejected' | 'needs_more_research'
    reasonCodes: readonly ['needs_designer_validation' | 'evidence_sufficient' | 'other']
    note: string
  }) => Promise<{ opportunity: DesignOpportunity }>
  loadDesignWorkspace: (projectId: string) => Promise<void>
  listDesignBriefs: () => readonly DesignOpportunityBrief[]
  listDesignConceptSets: () => readonly ConceptSet[]
  listDesignConcepts: () => readonly DesignConcept[]
  evaluateDesignDifferentiation: (projectId: string, conceptSetId: string) => Promise<DifferentiationCheck>
  getDesignConcept: (projectId: string, conceptId: string) => Promise<DesignConcept>
  listDesignVisualDrafts: (projectId: string, conceptId: string) => Promise<readonly VisualDraft[]>
  getDesignVisualDraft: (projectId: string, visualDraftId: string) => Promise<VisualDraft>
  findDesignOpportunity: (projectId: string, opportunityId: string) => Promise<DesignOpportunity | null>
  createDesignBrief: (input: DesignBriefDraftInput) => Promise<DesignWriteResult<unknown>>
  confirmDesignBrief: (input: {
    projectId: string
    briefId: string
    expectedRevision: number
  }) => Promise<DesignWriteResult<unknown>>
  createDesignConceptSet: (input: {
    projectId: string
    briefId: string
    expectedBriefRevision: number
  }) => Promise<DesignWriteResult<unknown>>
  createDesignConcept: (input: DesignConceptDraftInput) => Promise<DesignWriteResult<unknown>>
  reviseDesignConcept: (input: DesignConceptRevisionInput) => Promise<DesignWriteResult<unknown>>
  markDesignConceptSetReviewReady: (input: {
    projectId: string
    conceptSetId: string
    expectedRevision: number
  }) => Promise<DesignWriteResult<unknown>>
  openDesignReview: (input: {
    projectId: string
    conceptSetId: string
    expectedConceptSetRevision: number
  }) => Promise<ReviewRound>
  listDesignReviews: (projectId: string) => Promise<readonly ReviewRound[]>
  getDesignReview: (projectId: string, reviewRoundId: string) => Promise<ReviewRound>
  selectReviewConcept: (input: {
    projectId: string
    reviewRoundId: string
    conceptId: string
    expectedConceptRevision: number
    reasonCodes: readonly string[]
    reasonText: string | null
  }) => Promise<unknown>
  approveSelectedReviewConcept: (input: {
    projectId: string
    reviewRoundId: string
    reasonCodes: readonly string[]
    reasonText: string
  }) => Promise<unknown>
  requestReviewConceptRevision: (input: {
    projectId: string
    reviewRoundId: string
    subjectType: 'concept_set' | 'concept'
    subjectId: string
    expectedRevision: number
    reasonCodes: readonly string[]
    reasonText: string
  }) => Promise<unknown>
  rejectReviewConceptOrSet: (input: {
    projectId: string
    reviewRoundId: string
    subjectType: 'concept_set' | 'concept'
    subjectId: string
    expectedRevision: number
    reasonCodes: readonly string[]
    reasonText: string
  }) => Promise<unknown>
  requestReviewMoreResearch: (input: {
    projectId: string
    reviewRoundId: string
    subjectType: 'concept_set' | 'concept'
    subjectId: string
    expectedRevision: number
    reasonCodes: readonly string[]
    reasonText: string
  }) => Promise<unknown>
  revokeReviewApproval: (input: {
    projectId: string
    reviewRoundId: string
    reasonText: string
  }) => Promise<unknown>
  getReviewApprovalValidity: (projectId: string, reviewRoundId: string) => Promise<ApprovalValidity>
  generateDesignDeliverable: (input: {
    projectId: string
    reviewRoundId: string
    audienceProfile: 'public_portfolio'
  }) => Promise<DesignDeliverable>
  listDesignDeliverables: (projectId: string) => Promise<readonly DesignDeliverable[]>
  getDesignDeliverable: (projectId: string, deliverableId: string) => Promise<DesignDeliverable>
  listDesignDeliverableArtifacts: (
    projectId: string,
    deliverableId: string,
  ) => Promise<readonly ExportArtifactView[]>
  verifyDesignDeliverable: (
    projectId: string,
    deliverableId: string,
  ) => Promise<{ readonly ok: boolean; readonly mismatches: readonly string[] }>
  listFeedback: (projectId: string) => Promise<readonly import('@gentlexx/dsh-fashion-feedback/types').DesignerFeedback[]>
  listFeedbackAvailability: (projectId: string) => Promise<readonly import('@gentlexx/dsh-fashion-feedback/types').OutcomeAvailability[]>
  listDevelopment: (projectId: string) => Promise<readonly import('@gentlexx/dsh-fashion-feedback/types').DevelopmentEvent[]>
  listMetrics: (projectId: string) => Promise<readonly import('@gentlexx/dsh-fashion-feedback/types').OutcomeMetricObservation[]>
  recordFeedback: (input: import('./feedback/FeedbackPages.tsx').FeedbackWrite) => Promise<import('@gentlexx/dsh-fashion-feedback/types').DesignerFeedback>
  recordAvailability: (input: import('./feedback/FeedbackPages.tsx').AvailabilityWrite) => Promise<import('@gentlexx/dsh-fashion-feedback/types').OutcomeAvailability>
  recordDevelopment: (input: import('./feedback/FeedbackPages.tsx').DevelopmentWrite) => Promise<import('@gentlexx/dsh-fashion-feedback/types').DevelopmentEvent>
  recordMetric: (input: import('./feedback/FeedbackPages.tsx').MetricWrite) => Promise<import('@gentlexx/dsh-fashion-feedback/types').OutcomeMetricObservation>
  openFeedbackDetail: (projectId: string, feedbackId: string) => void
  listEvaluationDefinitions: () => Promise<readonly import('@gentlexx/dsh-fashion-evaluation/types').EvaluationDefinition[]>
  listEvaluationCases: () => Promise<readonly import('@gentlexx/dsh-fashion-evaluation/types').EvaluationCase[]>
  listEvaluationRuns: (projectId: string) => Promise<readonly import('@gentlexx/dsh-fashion-evaluation/types').EvaluationRun[]>
  getEvaluationRuleResults: (runId: string) => Promise<readonly import('@gentlexx/dsh-fashion-evaluation/types').RuleResult[]>
  listEvaluationAssessments: (runId: string) => Promise<readonly import('@gentlexx/dsh-fashion-evaluation/types').HumanAssessment[]>
  listImprovements: (projectId: string) => Promise<readonly import('@gentlexx/dsh-fashion-evaluation/types').CurrentImprovement[]>
  recordImprovementDecision: import('./evaluation/EvaluationPages.tsx').EvaluationPagesProps['recordImprovementDecision']
  runEvaluation: (input: { projectId: string; definitionId: string; caseIds: readonly string[] }) => Promise<import('@gentlexx/dsh-fashion-evaluation/types').EvaluationRun>
  recordAssessment: (input: {
    projectId: string
    runId: string
    criterionId: string
    rating: import('@gentlexx/dsh-fashion-evaluation/types').HumanRating
    reason: string
  }) => Promise<import('@gentlexx/dsh-fashion-evaluation/types').HumanAssessment>
  exportEvaluationReport: (runId: string) => Promise<readonly import('@gentlexx/dsh-fashion-evaluation/types').EvaluationReportArtifact[]>
  openFeedbackHome: (projectId: string) => void
  openFeedbackNew: (projectId: string) => void
  openOutcomes: (projectId: string) => void
  openEvaluations: (projectId: string) => void
  openDeliverableFeedback: (projectId: string, followUpRef: DeliverableFollowUpRef) => void
  openDeliverableOutcomes: (projectId: string, followUpRef: DeliverableFollowUpRef) => void
  openDeliverableEvaluations: (projectId: string, followUpRef: DeliverableFollowUpRef) => void
  openEvaluationRun: (projectId: string, runId: string) => void
  openImprovements: (projectId: string) => void
  openImprovementDetail: (projectId: string, itemId: string) => void
  hooks: {
    route: import('@deepseek-ai/dsh-client-store').ObservableSnapshot<FashionRoute>
    projectList: import('@deepseek-ai/dsh-client-store').ObservableSnapshot<ProjectListState>
    researchTasks: import('@deepseek-ai/dsh-client-store').ObservableSnapshot<ResearchListState<ResearchTask>>
    researchSources: import('@deepseek-ai/dsh-client-store').ObservableSnapshot<ResearchListState<Source>>
    researchSamples: import('@deepseek-ai/dsh-client-store').ObservableSnapshot<ResearchListState<Sample>>
    researchEvidence: import('@deepseek-ai/dsh-client-store').ObservableSnapshot<ResearchListState<Evidence>>
    analysisItems: import('@deepseek-ai/dsh-client-store').ObservableSnapshot<AnalysisListState<MarketItem>>
    analysisSignals: import('@deepseek-ai/dsh-client-store').ObservableSnapshot<AnalysisListState<PopularitySignal>>
    analysisClusters: import('@deepseek-ai/dsh-client-store').ObservableSnapshot<AnalysisListState<TrendCluster>>
    analysisOpportunities: import('@deepseek-ai/dsh-client-store').ObservableSnapshot<AnalysisListState<DesignOpportunity>>
    locale: import('@deepseek-ai/dsh-client-store').ObservableSnapshot<LocaleSnapshot>
  }
}

export type FashionWorkspaceProps =
  InjectFace<FashionWorkspaceInjected>
  & PropsLocale<'fashion'>

/**
 * Render the Fashion projects workspace for the keyed main panel.
 * @param props - route/list/locale subscriptions and navigation inject.
 */
export function FashionWorkspace({
  useRoute,
  useProjectList,
  useResearchTasks,
  useResearchSources,
  useResearchSamples,
  useResearchEvidence,
  useAnalysisItems,
  useAnalysisSignals,
  useAnalysisClusters,
  useAnalysisOpportunities,
  useLocale,
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
  t,
}: FashionWorkspaceProps) {
  const route = useRoute(snapshot => snapshot)
  const list = useProjectList(snapshot => snapshot)
  const tasks = useResearchTasks(snapshot => snapshot)
  const sources = useResearchSources(snapshot => snapshot)
  const samples = useResearchSamples(snapshot => snapshot)
  const evidence = useResearchEvidence(snapshot => snapshot)
  const marketItems = useAnalysisItems(snapshot => snapshot)
  const signals = useAnalysisSignals(snapshot => snapshot)
  const clusters = useAnalysisClusters(snapshot => snapshot)
  const opportunities = useAnalysisOpportunities(snapshot => snapshot)
  const locale = useLocale(snapshot => snapshot.active)

  return (
    <div className={clsx(tokens.fashionTheme, css.workspace)}>
      {route.kind === 'project-overview' ? (
        <ProjectOverviewPage
          projectId={route.projectId}
          locale={locale}
          getProject={getProject}
          readStageObservations={readStageObservations}
          openProjects={openProjects}
          openAgent={openAgent}
          openResearch={openResearch}
          openReview={openReviewHome}
          openDirections={openDesignDirections}
          followUp={{
            openDeliverables: openDeliverablesHome,
            openFeedback: openFeedbackHome,
            openOutcomes,
            openEvaluations,
            openImprovements,
          }}
          t={t}
        />
      ) : route.kind === 'research-home' ? (
        <ResearchHomePage
          projectId={route.projectId}
          locale={locale}
          tasks={tasks}
          getProject={getProject}
          loadTasks={loadTasks}
          openOverview={openProject}
          openTask={openResearchTask}
          openTaskNew={openResearchTaskNew}
          t={t}
        />
      ) : route.kind === 'research-task-new' ? (
        <ResearchTaskNewPage
          projectId={route.projectId}
          createTask={createTask}
          openHome={openResearch}
          openTask={openResearchTask}
          t={t}
        />
      ) : route.kind === 'research-task' ? (
        <ResearchTaskPage
          projectId={route.projectId}
          taskId={route.taskId}
          locale={locale}
          sources={sources}
          samples={samples}
          evidence={evidence}
          getProject={getProject}
          getTask={getTask}
          loadTaskChildren={loadTaskChildren}
          openHome={openResearch}
          openSourceNew={openResearchSourceNew}
          openSource={openResearchSource}
          openSample={openResearchSample}
          openEvidence={openResearchEvidence}
          openAnalysis={openAnalysis}
          t={t}
        />
      ) : route.kind === 'research-source-new' ? (
        <ResearchSourceNewPage
          projectId={route.projectId}
          taskId={route.taskId}
          createSource={createSource}
          openTask={openResearchTask}
          openSource={openResearchSource}
          t={t}
        />
      ) : route.kind === 'research-source' ? (
        <SourceDetailPage
          projectId={route.projectId}
          taskId={route.taskId}
          sourceId={route.sourceId}
          locale={locale}
          getProject={getProject}
          getSource={getSource}
          updateSource={updateSource}
          createSample={createSample}
          createEvidence={createEvidence}
          openTask={openResearchTask}
          openSample={openResearchSample}
          openEvidence={openResearchEvidence}
          t={t}
        />
      ) : route.kind === 'research-sample' ? (
        <SampleDetailPage
          projectId={route.projectId}
          taskId={route.taskId}
          sampleId={route.sampleId}
          locale={locale}
          getProject={getProject}
          getSample={getSample}
          createEvidence={createEvidence}
          openTask={openResearchTask}
          openEvidence={openResearchEvidence}
          t={t}
        />
      ) : route.kind === 'research-evidence' ? (
        <EvidenceDetailPage
          projectId={route.projectId}
          taskId={route.taskId}
          evidenceId={route.evidenceId}
          locale={locale}
          getProject={getProject}
          getEvidence={getEvidence}
          reviewEvidence={reviewEvidence}
          openTask={openResearchTask}
          t={t}
        />
      ) : route.kind === 'analysis-home' ? (
        <AnalysisHomePage
          projectId={route.projectId}
          taskId={route.taskId}
          marketItems={marketItems}
          signals={signals}
          clusters={clusters}
          opportunities={opportunities}
          sources={sources}
          samples={samples}
          evidence={evidence}
          getProject={getProject}
          loadWorkspace={loadAnalysisWorkspace}
          loadTaskChildren={loadTaskChildren}
          createMarketItem={createMarketItem}
          createPopularitySignal={createPopularitySignal}
          createTrendCluster={createTrendCluster}
          createDesignOpportunity={createDesignOpportunity}
          openTask={openResearchTask}
          openItem={openAnalysisItem}
          openSignal={openAnalysisSignal}
          openCluster={openAnalysisCluster}
          openOpportunity={openAnalysisOpportunity}
          t={t}
        />
      ) : route.kind === 'analysis-item' ? (
        <AnalysisItemPage
          projectId={route.projectId}
          taskId={route.taskId}
          marketItemId={route.marketItemId}
          getProject={getProject}
          getItem={getMarketItem}
          openAnalysis={openAnalysis}
          t={t}
        />
      ) : route.kind === 'analysis-signal' ? (
        <AnalysisSignalPage
          projectId={route.projectId}
          taskId={route.taskId}
          signalId={route.signalId}
          getProject={getProject}
          getSignal={getAnalysisSignal}
          openAnalysis={openAnalysis}
          t={t}
        />
      ) : route.kind === 'analysis-cluster' ? (
        <AnalysisClusterPage
          projectId={route.projectId}
          taskId={route.taskId}
          clusterId={route.clusterId}
          getProject={getProject}
          getCluster={getAnalysisCluster}
          openAnalysis={openAnalysis}
          t={t}
        />
      ) : route.kind === 'analysis-opportunity' ? (
        <AnalysisOpportunityPage
          projectId={route.projectId}
          taskId={route.taskId}
          opportunityId={route.opportunityId}
          getProject={getProject}
          getOpportunity={getAnalysisOpportunity}
          decideOpportunity={decideOpportunity}
          openAnalysis={openAnalysis}
          openDesignBrief={openDesignBrief}
          t={t}
        />
      ) : route.kind === 'design-directions' ? (
        <DesignDirectionsPage
          projectId={route.projectId}
          getProject={getProject}
          loadDesignWorkspace={loadDesignWorkspace}
          listBriefs={listDesignBriefs}
          listConceptSets={listDesignConceptSets}
          listConcepts={listDesignConcepts}
          evaluateDifferentiation={evaluateDesignDifferentiation}
          createConcept={createDesignConcept}
          reviseConcept={reviseDesignConcept}
          markReviewReady={markDesignConceptSetReviewReady}
          openOverview={openProject}
          openConcept={openDesignConcept}
          openBrief={openDesignBrief}
          openReviewHome={openReviewHome}
          t={t}
        />
      ) : route.kind === 'design-brief' ? (
        <DesignBriefPage
          projectId={route.projectId}
          opportunityId={route.opportunityId}
          getProject={getProject}
          loadDesignWorkspace={loadDesignWorkspace}
          listBriefs={listDesignBriefs}
          listConceptSets={listDesignConceptSets}
          findOpportunity={findDesignOpportunity}
          createBrief={createDesignBrief}
          confirmBrief={confirmDesignBrief}
          createConceptSet={createDesignConceptSet}
          openDirections={openDesignDirections}
          t={t}
        />
      ) : route.kind === 'design-concept-set' ? (
        <DesignDirectionsPage
          projectId={route.projectId}
          getProject={getProject}
          loadDesignWorkspace={loadDesignWorkspace}
          listBriefs={listDesignBriefs}
          listConceptSets={listDesignConceptSets}
          listConcepts={listDesignConcepts}
          evaluateDifferentiation={evaluateDesignDifferentiation}
          createConcept={createDesignConcept}
          reviseConcept={reviseDesignConcept}
          markReviewReady={markDesignConceptSetReviewReady}
          openOverview={openProject}
          openConcept={openDesignConcept}
          openBrief={openDesignBrief}
          openReviewHome={openReviewHome}
          t={t}
        />
      ) : route.kind === 'design-concept' ? (
        <DesignConceptPage
          projectId={route.projectId}
          conceptId={route.conceptId}
          getProject={getProject}
          getConcept={getDesignConcept}
          listVisualDrafts={listDesignVisualDrafts}
          openDirections={openDesignDirections}
          openVisual={openDesignVisual}
          t={t}
        />
      ) : route.kind === 'design-visual' ? (
        <DesignVisualPage
          projectId={route.projectId}
          conceptId={route.conceptId}
          visualDraftId={route.visualDraftId}
          getVisualDraft={getDesignVisualDraft}
          openConcept={openDesignConcept}
          t={t}
        />
      ) : route.kind === 'review-home' ? (
        <ReviewHomePage
          projectId={route.projectId}
          locale={locale}
          getProject={getProject}
          loadDesignWorkspace={loadDesignWorkspace}
          listReviews={listDesignReviews}
          listConceptSets={listDesignConceptSets}
          openReview={openDesignReview}
          openRound={openReviewRound}
          openOverview={openProject}
          t={t}
        />
      ) : route.kind === 'review-round' ? (
        <ReviewRoundPage
          projectId={route.projectId}
          reviewRoundId={route.reviewRoundId}
          getProject={getProject}
          getReview={getDesignReview}
          getConcept={getDesignConcept}
          getApprovalValidity={getReviewApprovalValidity}
          selectConcept={selectReviewConcept}
          approveSelectedConcept={approveSelectedReviewConcept}
          requestConceptRevision={requestReviewConceptRevision}
          rejectConceptOrSet={rejectReviewConceptOrSet}
          requestMoreResearch={requestReviewMoreResearch}
          revokeApproval={revokeReviewApproval}
          generateDeliverable={generateDesignDeliverable}
          openReviewHome={openReviewHome}
          openDeliverables={openDeliverablesHome}
          openDeliverable={openDeliverableDetail}
          t={t}
        />
      ) : route.kind === 'deliverables-home' ? (
        <DeliverablesHomePage
          projectId={route.projectId}
          getProject={getProject}
          listDeliverables={listDesignDeliverables}
          openDeliverable={openDeliverableDetail}
          openReviewHome={openReviewHome}
          openOverview={openProject}
          openFollowUp={openDeliverableFeedback}
          t={t}
        />
      ) : route.kind === 'deliverable-detail' ? (
        <DeliverableDetailPage
          projectId={route.projectId}
          deliverableId={route.deliverableId}
          getProject={getProject}
          getDeliverable={getDesignDeliverable}
          listDeliverableArtifacts={listDesignDeliverableArtifacts}
          verifyDeliverable={verifyDesignDeliverable}
          openDeliverables={openDeliverablesHome}
          openFeedback={openDeliverableFeedback}
          openOutcomes={openDeliverableOutcomes}
          openEvaluations={openDeliverableEvaluations}
          t={t}
        />
      ) : route.kind === 'evaluations-home' || route.kind === 'evaluation-run' || route.kind === 'improvements-home' || route.kind === 'improvement-detail' ? (
        <EvaluationPages
          projectId={route.projectId}
          runId={route.kind === 'evaluation-run' ? route.runId : undefined}
          itemId={route.kind === 'improvement-detail' ? route.itemId : undefined}
          followUpRef={route.kind === 'evaluations-home' ? route.followUpRef : undefined}
          mode={
            route.kind === 'improvement-detail' ? 'improvement'
              : route.kind === 'improvements-home' ? 'improvements'
                : route.kind === 'evaluation-run' ? 'run'
                  : 'evaluations'
          }
          getProject={getProject}
          listDefinitions={listEvaluationDefinitions}
          listCases={listEvaluationCases}
          listRuns={listEvaluationRuns}
          getRuleResults={getEvaluationRuleResults}
          listAssessments={listEvaluationAssessments}
          listImprovements={listImprovements}
          recordImprovementDecision={recordImprovementDecision}
          runEvaluation={runEvaluation}
          recordAssessment={recordAssessment}
          exportReport={exportEvaluationReport}
          openRun={openEvaluationRun}
          openImprovement={openImprovementDetail}
          openOverview={openProject}
          locale={locale}
          t={t}
        />
      ) : route.kind === 'feedback-home' || route.kind === 'feedback-new' || route.kind === 'feedback-detail' || route.kind === 'outcomes-home' ? (
        <FeedbackPages
          projectId={route.projectId}
          feedbackId={route.kind === 'feedback-detail' ? route.feedbackId : undefined}
          followUpRef={route.kind === 'feedback-new' || route.kind === 'outcomes-home' ? route.followUpRef : undefined}
          mode={route.kind === 'outcomes-home' ? 'outcomes' : route.kind === 'feedback-new' ? 'new' : 'list'}
          getProject={getProject}
          listDeliverables={listDesignDeliverables}
          listFeedback={listFeedback}
          listAvailability={listFeedbackAvailability}
          listDevelopment={listDevelopment}
          listMetrics={listMetrics}
          recordFeedback={recordFeedback}
          recordAvailability={recordAvailability}
          recordDevelopment={recordDevelopment}
          recordMetric={recordMetric}
          openFeedbackNew={openFeedbackNew}
          openFeedbackDetail={openFeedbackDetail}
          openOverview={openProject}
          t={t}
        />
      ) : route.kind === 'not-found' ? (
        <div className={css.page} data-fashion-page="not-found">
          <FashionPageHeader title={t('notFound.title')} description={route.pathname} />
          <Button type="button" variant="primary" onClick={openProjects}>
            {t('notFound.back')}
          </Button>
        </div>
      ) : (
        <ProjectsPage
          list={list}
          locale={locale}
          openProject={openProject}
          openAgent={openAgent}
          createProject={createProject}
          onRetryLoad={() => { void loadProjects() }}
          t={t}
        />
      )}
    </div>
  )
}
