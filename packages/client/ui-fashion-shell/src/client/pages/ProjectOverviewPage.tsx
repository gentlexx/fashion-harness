/** Project Overview: user foundation vs R0 fixture vs load errors (F1-03 §7). */
import { useEffect, useState } from 'react'
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ProjectView } from '@gentlexx/dsh-fashion-project/types'
import type { FashionKey } from '../locales.ts'
import { R0_UTILITY_JACKET } from '../fixtures/r0-utility-jacket.ts'
import { R0_PROJECT_ID } from '../routes.ts'
import {
  capabilityLabelKey,
  deriveProjectStages,
  isFashionProjectNotFound,
  isR0Project,
  pipelineStateKey,
  type CapabilityRailStep,
  type ProjectStageObservations,
} from '../presentation/project-presentation.ts'
import { FashionPageHeader } from '../components/FashionPageHeader.tsx'
import { LocalizedTime } from '../components/LocalizedTime.tsx'
import { ProjectSourceTags } from '../components/ProjectSourceTags.tsx'
import { StageRail, type StageRailItem } from '../components/StageRail.tsx'
import { StatePanel } from '../components/StatePanel.tsx'
import css from '../FashionWorkspace.module.css'

/** Post-delivery navigation, in the Phase-1 business order. */
export type FollowUpNavigation = {
  readonly openDeliverables: (projectId: string) => void
  readonly openFeedback: (projectId: string) => void
  readonly openOutcomes: (projectId: string) => void
  readonly openEvaluations: (projectId: string) => void
  readonly openImprovements: (projectId: string) => void
}

export type ProjectOverviewPageProps = {
  readonly projectId: string
  readonly locale: string
  readonly getProject: (projectId: string) => Promise<ProjectView>
  readonly readStageObservations: (projectId: string) => Promise<ProjectStageObservations>
  readonly openProjects: () => void
  readonly openAgent: () => void
  readonly openResearch: (projectId: string) => void
  readonly openReview: (projectId: string) => void
  readonly openDirections: (projectId: string) => void
  readonly followUp: FollowUpNavigation
  readonly t: (key: FashionKey) => string
}

type ObservationLoad =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly projectId: string; readonly value: ProjectStageObservations }
  | { readonly status: 'error'; readonly projectId: string }

type StageView = readonly CapabilityRailStep[] | 'loading' | 'error'

/**
 * Stage rail state for the routed project; a settled read for another project counts as loading,
 * so the render that follows a project switch never shows the previous project's counts.
 * @param observations - Latest settled or pending observation read.
 * @param projectId - Routed project id.
 * @returns Derived stage steps, or the pending/error marker.
 */
function stageView(observations: ObservationLoad, projectId: string): StageView {
  if (observations.status === 'loading' || observations.projectId !== projectId) return 'loading'
  return observations.status === 'ready' ? deriveProjectStages(observations.value) : 'error'
}

type OverviewLoad =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly project: ProjectView }
  | { readonly status: 'not-found' }
  | { readonly status: 'error' }

/**
 * Load and render one project Overview (user foundation or R0 fixture).
 * @param props - route project id, locale, get/navigation inject, translator.
 */
export function ProjectOverviewPage({
  projectId,
  locale,
  getProject,
  readStageObservations,
  openProjects,
  openAgent,
  openResearch,
  openReview,
  openDirections,
  followUp,
  t,
}: ProjectOverviewPageProps) {
  const [load, setLoad] = useState<OverviewLoad>({ status: 'loading' })
  const [retryToken, setRetryToken] = useState(0)
  const [observations, setObservations] = useState<ObservationLoad>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    setLoad({ status: 'loading' })
    void getProject(projectId).then(
      (project) => {
        if (!cancelled) setLoad({ status: 'ready', project })
      },
      (error: unknown) => {
        if (cancelled) return
        if (isFashionProjectNotFound(error)) setLoad({ status: 'not-found' })
        else setLoad({ status: 'error' })
      },
    )
    return () => { cancelled = true }
  }, [projectId, getProject, retryToken])

  useEffect(() => {
    let cancelled = false
    setObservations({ status: 'loading' })
    void readStageObservations(projectId).then(
      (value) => { if (!cancelled) setObservations({ status: 'ready', projectId, value }) },
      () => { if (!cancelled) setObservations({ status: 'error', projectId }) },
    )
    return () => { cancelled = true }
  }, [projectId, readStageObservations, retryToken])

  useEffect(() => {
    if (load.status !== 'ready') return
    document.getElementById('fashion-overview-title')?.focus()
  }, [load])

  if (load.status === 'loading') {
    return (
      <div
        className={css.page}
        data-fashion-page="overview-loading"
        aria-busy="true"
        aria-label={t('overview.loadingAria')}
      >
        <div className={css.skeletonHeader} />
        <div className={css.skeletonBlock} />
        <div className={css.skeletonBlock} />
      </div>
    )
  }

  if (load.status === 'not-found') {
    return (
      <div className={css.page} data-fashion-page="not-found">
        <FashionPageHeader title={t('projectNotFound.title')} description={projectId} />
        <StatePanel
          tone="error"
          title={t('projectNotFound.title')}
          body={projectId}
          data-fashion-state="project-not-found"
          actions={(
            <Button type="button" variant="primary" onClick={openProjects}>
              {t('notFound.back')}
            </Button>
          )}
        />
      </div>
    )
  }

  if (load.status === 'error') {
    return (
      <div className={css.page} data-fashion-page="overview-error">
        <FashionPageHeader title={t('overview.loadError')} />
        <StatePanel
          tone="error"
          title={t('overview.loadError')}
          data-fashion-state="overview-error"
          actions={(
            <>
              <Button
                type="button"
                variant="primary"
                onClick={() => { setRetryToken(token => token + 1) }}
                data-fashion-overview="retry"
              >
                {t('overview.retry')}
              </Button>
              <Button type="button" variant="outline" onClick={openProjects}>
                {t('overview.back')}
              </Button>
            </>
          )}
        />
      </div>
    )
  }

  const { project } = load
  const r0 = isR0Project(project, R0_PROJECT_ID) || projectId === R0_PROJECT_ID

  if (r0) {
    return (
      <R0Overview
        project={project}
        locale={locale}
        openProjects={openProjects}
        openAgent={openAgent}
        openResearch={openResearch}
        openReview={openReview}
        openDirections={openDirections}
        followUp={followUp}
        t={t}
      />
    )
  }

  return (
    <UserOverview
      project={project}
      locale={locale}
      stages={stageView(observations, projectId)}
      openProjects={openProjects}
      openAgent={openAgent}
      openResearch={openResearch}
      openReview={openReview}
      openDirections={openDirections}
      followUp={followUp}
      t={t}
    />
  )
}

/**
 * Post-delivery entries in the Phase-1 business order. Human assessment has no
 * route of its own: it is recorded inside one fixed-evaluation run, which the
 * evaluations entry reaches, and the hint says so.
 */
function FollowUpSection({
  projectId,
  accessMode,
  followUp,
  t,
}: {
  projectId: string
  accessMode: ProjectView['accessMode']
  followUp: FollowUpNavigation
  t: (key: FashionKey) => string
}) {
  const entries: readonly {
    readonly id: string
    readonly labelKey: FashionKey
    readonly open: (projectId: string) => void
  }[] = [
    { id: 'deliverables', labelKey: 'overview.openDeliverables', open: followUp.openDeliverables },
    { id: 'feedback', labelKey: 'overview.openFeedback', open: followUp.openFeedback },
    { id: 'outcomes', labelKey: 'overview.openOutcomes', open: followUp.openOutcomes },
    { id: 'evaluations', labelKey: 'overview.openEvaluations', open: followUp.openEvaluations },
    { id: 'improvements', labelKey: 'overview.openImprovements', open: followUp.openImprovements },
  ]
  return (
    <section className={css.sideCard} data-fashion-overview-section="follow-up">
      <h2 className={css.sectionTitle}>{t('overview.followUp')}</h2>
      <p className={css.meta}>{t('overview.followUpHint')}</p>
      {accessMode === 'read-only'
        ? <p className={css.disclaimer} data-fashion-overview="follow-up-read-only">{t('overview.followUpReadOnly')}</p>
        : null}
      <ol className={css.actions}>
        {entries.map(entry => (
          <li key={entry.id}>
            <Button
              type="button"
              variant="outline"
              data-fashion-overview={`open-${entry.id}`}
              onClick={() => { entry.open(projectId) }}
            >
              {t(entry.labelKey)}
            </Button>
          </li>
        ))}
      </ol>
    </section>
  )
}

function UserOverview({
  project,
  locale,
  stages,
  openProjects,
  openAgent,
  openResearch,
  openReview,
  openDirections,
  followUp,
  t,
}: {
  project: ProjectView
  locale: string
  stages: StageView
  openProjects: () => void
  openAgent: () => void
  openResearch: (projectId: string) => void
  openReview: (projectId: string) => void
  openDirections: (projectId: string) => void
  followUp: FollowUpNavigation
  t: (key: FashionKey) => string
}) {
  const projectId = String(project.id)
  const openStage: Record<string, (projectId: string) => void> = {
    research: openResearch,
    opportunity: openDirections,
    direction: openDirections,
    review: openReview,
    export: followUp.openDeliverables,
  }
  const rail: readonly StageRailItem[] = typeof stages === 'string' ? [] : stages.map((step) => {
    const open = openStage[step.id]
    const base = {
      id: step.id,
      label: t(step.labelKey),
      stateKey: step.stateKey,
    }
    return open === undefined ? base : { ...base, onClick: () => { open(projectId) } }
  })

  return (
    <div className={css.page} data-fashion-page="overview" data-fashion-origin="user">
      <FashionPageHeader
        titleId="fashion-overview-title"
        titleTabIndex={-1}
        title={project.title}
        meta={(
          <>
            <ProjectSourceTags origin={project.origin} accessMode={project.accessMode} t={t} />
            <span className={css.meta}>
              {t('overview.updated')}{' '}
              <LocalizedTime iso={project.updatedAt} locale={locale} />
            </span>
          </>
        )}
        actions={(
          <>
            <Button type="button" variant="outline" onClick={openProjects}>{t('overview.back')}</Button>
            <Button type="button" variant="primary" onClick={openAgent}>{t('nav.agent')}</Button>
          </>
        )}
      />

      <div className={css.overviewLayout}>
        <div className={css.overviewMain}>
          <p className={css.statusLine} data-fashion-status-summary>
            {t(capabilityLabelKey(project.origin))}
          </p>
          {stages === 'loading'
            ? <p className={css.meta} role="status" aria-busy="true" data-fashion-stages="loading">{t('overview.stagesLoading')}</p>
            : stages === 'error'
              ? <p className={css.meta} role="alert" data-fashion-stages="error">{t('overview.stagesError')}</p>
              : <StageRail items={rail} t={t} aria-label={t('overview.statusSummary')} />}
          <h2 className={css.sectionTitle}>{t('overview.records')}</h2>
          <ul className={css.recordList}>
            <li>
              {t('overview.created')}{' '}
              <LocalizedTime iso={project.createdAt} locale={locale} />
            </li>
            <li>
              {t('overview.updated')}{' '}
              <LocalizedTime iso={project.updatedAt} locale={locale} />
            </li>
          </ul>
        </div>
        <aside className={css.overviewSide}>
          <section className={css.sideCard}>
            <h2 className={css.sectionTitle}>{t('overview.basicInfo')}</h2>
            <p className={css.meta}>{t('overview.empty')}</p>
          </section>
          <section className={css.sideCard}>
            <h2 className={css.sectionTitle}>{t('overview.nextStep')}</h2>
            <p className={css.meta}>{t('overview.nextStepUser')}</p>
            <p className={css.disclaimer}>{t('overview.agentNoBind')}</p>
            <div className={css.actions}>
              <Button
                type="button"
                variant="primary"
                onClick={() => { openResearch(String(project.id)) }}
                data-fashion-overview="open-research"
              >
                {t('overview.openResearch')}
              </Button>
              <Button type="button" variant="outline" onClick={openAgent}>{t('nav.agent')}</Button>
            </div>
          </section>
          <FollowUpSection
            projectId={String(project.id)}
            accessMode={project.accessMode}
            followUp={followUp}
            t={t}
          />
        </aside>
      </div>
    </div>
  )
}

function R0Overview({
  project,
  locale,
  openProjects,
  openAgent,
  openResearch,
  openReview,
  openDirections,
  followUp,
  t,
}: {
  project: ProjectView
  locale: string
  openProjects: () => void
  openAgent: () => void
  openResearch: (projectId: string) => void
  openReview: (projectId: string) => void
  openDirections: (projectId: string) => void
  followUp: FollowUpNavigation
  t: (key: FashionKey) => string
}) {
  const openDeliverables = followUp.openDeliverables
  const fixture = R0_UTILITY_JACKET
  const projectId = String(project.id)
  const openStage: Record<string, (projectId: string) => void> = {
    research: openResearch,
    opportunity: openDirections,
    direction: openDirections,
    review: openReview,
    export: openDeliverables,
  }
  const rail: readonly StageRailItem[] = fixture.pipeline.map((step) => {
    const stateKey = pipelineStateKey(step.state)
    const open = stateKey === 'pipeline.comingSoon' ? undefined : openStage[step.id]
    const base = {
      id: step.id,
      label: t(
        step.id === 'research' ? 'stage.research'
          : step.id === 'opportunity' ? 'stage.opportunity'
            : step.id === 'direction' ? 'stage.direction'
              : step.id === 'review' ? 'stage.review'
                : 'stage.export',
      ),
      stateKey,
    }
    return open === undefined ? base : { ...base, onClick: () => { open(projectId) } }
  })

  return (
    <div className={css.page} data-fashion-page="overview" data-fashion-origin="public-rebuild">
      <p className={css.banner} role="note">{t('overview.disclaimer')}</p>
      <FashionPageHeader
        titleId="fashion-overview-title"
        titleTabIndex={-1}
        title={project.title}
        description={`${fixture.market} · ${fixture.category}`}
        meta={(
          <>
            <ProjectSourceTags origin={project.origin} accessMode={project.accessMode} t={t} />
            <span className={css.badge}>{t('overview.publicBadge')}</span>
            <span className={css.meta}>
              {t('overview.updated')}{' '}
              <LocalizedTime iso={project.updatedAt} locale={locale} />
            </span>
          </>
        )}
        actions={(
          <>
            <Button type="button" variant="outline" onClick={openProjects}>{t('overview.back')}</Button>
            <Button type="button" variant="primary" onClick={openAgent}>{t('nav.agent')}</Button>
          </>
        )}
      />

      <div className={css.overviewLayout}>
        <div className={css.overviewMain}>
          <p className={css.statusLine}>{t(capabilityLabelKey(project.origin))}</p>
          <p className={css.meta}>{fixture.briefSummary}</p>
          <p className={css.meta}>{fixture.evidenceGrade}</p>
          <StageRail items={rail} t={t} aria-label={t('overview.statusSummary')} />

          <section className={css.semanticCard} data-fashion-semantic="facts">
            <h2 className={css.sectionTitle}>{t('overview.facts')}</h2>
            <ul className={css.list}>{fixture.recordedFacts.map(item => <li key={item}>{item}</li>)}</ul>
          </section>
          <section className={css.semanticCard} data-fashion-semantic="inferences">
            <h2 className={css.sectionTitle}>{t('overview.inferences')}</h2>
            <ul className={css.list}>{fixture.inferences.map(item => <li key={item}>{item}</li>)}</ul>
          </section>
          <section className={css.semanticCard} data-fashion-semantic="pending">
            <h2 className={css.sectionTitle}>{t('overview.pending')}</h2>
            <ul className={css.list}>{fixture.pendingValidation.map(item => <li key={item}>{item}</li>)}</ul>
          </section>
        </div>
        <aside className={css.overviewSide}>
          <section className={css.sideCard}>
            <h2 className={css.sectionTitle}>{t('overview.basicInfo')}</h2>
            <dl className={css.dl}>
              <div>
                <dt>{t('overview.market')}</dt>
                <dd>{fixture.market}</dd>
              </div>
              <div>
                <dt>{t('overview.category')}</dt>
                <dd>{fixture.category}</dd>
              </div>
            </dl>
          </section>
          <section className={css.sideCard}>
            <h2 className={css.sectionTitle}>{t('overview.nextStep')}</h2>
            <p className={css.meta}>{t('overview.nextStepR0')}</p>
            <p className={css.disclaimer}>{t('overview.agentNoBind')}</p>
            <div className={css.actions}>
              <Button
                type="button"
                variant="primary"
                onClick={() => { openResearch(String(project.id)) }}
                data-fashion-overview="open-research"
              >
                {t('overview.openResearch')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => { openReview(String(project.id)) }}
                data-fashion-overview="open-review"
              >
                {t('overview.openReview')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => { openDeliverables(String(project.id)) }}
                data-fashion-overview="open-deliverables"
              >
                {t('overview.openDeliverables')}
              </Button>
              <Button type="button" variant="outline" onClick={openAgent}>{t('nav.agent')}</Button>
            </div>
          </section>
          <FollowUpSection
            projectId={projectId}
            accessMode={project.accessMode}
            followUp={followUp}
            t={t}
          />
        </aside>
      </div>
    </div>
  )
}
