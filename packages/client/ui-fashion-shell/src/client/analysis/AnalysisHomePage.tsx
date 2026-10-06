/** Analysis home: MarketItems, Signals, Clusters, Opportunities for one ResearchTask. */
import { useEffect, useState } from 'react'
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import type { AnalysisListState } from '@gentlexx/dsh-api-fashion-analysis-controller/client'
import type { ResearchListState } from '@gentlexx/dsh-api-fashion-research-controller/client'
import type { ProjectView } from '@gentlexx/dsh-fashion-project/types'
import type {
  Evidence,
  Sample,
  Source,
} from '@gentlexx/dsh-fashion-research/types'
import type {
  DesignOpportunity,
  MarketItem,
  PopularitySignal,
  TrendCluster,
} from '@gentlexx/dsh-fashion-analysis/types'
import type { FashionKey } from '../locales.ts'
import { FashionPageHeader } from '../components/FashionPageHeader.tsx'
import { StatePanel } from '../components/StatePanel.tsx'
import { AnalysisCreateForms, type AnalysisCreateFormsProps } from './AnalysisCreateForms.tsx'
import css from '../FashionWorkspace.module.css'
import { SIGNAL_TYPE_LABELS } from './signal-type.ts'
import { DEDUPE_STATUS_LABELS, OBJECT_STATUS_LABELS, OPPORTUNITY_REVIEW_LABELS } from './analysis-labels.ts'

export type AnalysisHomePageProps = {
  readonly projectId: string
  readonly taskId: string
  readonly marketItems: AnalysisListState<MarketItem>
  readonly signals: AnalysisListState<PopularitySignal>
  readonly clusters: AnalysisListState<TrendCluster>
  readonly opportunities: AnalysisListState<DesignOpportunity>
  readonly sources: ResearchListState<Source>
  readonly samples: ResearchListState<Sample>
  readonly evidence: ResearchListState<Evidence>
  readonly getProject: (projectId: string) => Promise<ProjectView>
  readonly loadWorkspace: (projectId: string, taskId: string) => Promise<void>
  readonly loadTaskChildren: (projectId: string, taskId: string) => Promise<void>
  readonly createMarketItem: AnalysisCreateFormsProps['createMarketItem']
  readonly createPopularitySignal: AnalysisCreateFormsProps['createPopularitySignal']
  readonly createTrendCluster: AnalysisCreateFormsProps['createTrendCluster']
  readonly createDesignOpportunity: AnalysisCreateFormsProps['createDesignOpportunity']
  readonly openTask: (projectId: string, taskId: string) => void
  readonly openItem: (projectId: string, taskId: string, marketItemId: string) => void
  readonly openSignal: (projectId: string, taskId: string, signalId: string) => void
  readonly openCluster: (projectId: string, taskId: string, clusterId: string) => void
  readonly openOpportunity: (projectId: string, taskId: string, opportunityId: string) => void
  readonly t: (key: FashionKey) => string
}

type ProjectGate =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly project: ProjectView }
  | { readonly status: 'error' }

/**
 * Render the analysis workspace for one ResearchTask.
 * @param props - lists, loaders, and navigation.
 */
export function AnalysisHomePage({
  projectId,
  taskId,
  marketItems,
  signals,
  clusters,
  opportunities,
  sources,
  samples,
  evidence,
  getProject,
  loadWorkspace,
  loadTaskChildren,
  createMarketItem,
  createPopularitySignal,
  createTrendCluster,
  createDesignOpportunity,
  openTask,
  openItem,
  openSignal,
  openCluster,
  openOpportunity,
  t,
}: AnalysisHomePageProps) {
  const [projectGate, setProjectGate] = useState<ProjectGate>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    setProjectGate({ status: 'loading' })
    void getProject(projectId).then(
      (project) => { if (!cancelled) setProjectGate({ status: 'ready', project }) },
      () => { if (!cancelled) setProjectGate({ status: 'error' }) },
    )
    return () => { cancelled = true }
  }, [getProject, projectId])

  useEffect(() => {
    void loadWorkspace(projectId, taskId)
    void loadTaskChildren(projectId, taskId)
  }, [loadWorkspace, loadTaskChildren, projectId, taskId])

  if (projectGate.status === 'loading' || marketItems.status === 'loading') {
    return (
      <div className={css.page} data-fashion-page="analysis-loading" aria-busy="true">
        <FashionPageHeader title={t('analysis.loading')} />
      </div>
    )
  }

  if (projectGate.status === 'error' || marketItems.status === 'error') {
    return (
      <div className={css.page} data-fashion-page="analysis-error">
        <FashionPageHeader title={t('analysis.loadError')} />
        <StatePanel
          title={t('analysis.loadError')}
          actions={(
            <>
              <Button type="button" variant="primary" onClick={() => { void loadWorkspace(projectId, taskId) }}>
                {t('analysis.retry')}
              </Button>
              <Button type="button" variant="outline" onClick={() => { openTask(projectId, taskId) }}>
                {t('analysis.backTask')}
              </Button>
            </>
          )}
        />
      </div>
    )
  }

  if (projectGate.status !== 'ready') {
    return (
      <div className={css.page} data-fashion-page="analysis-loading" aria-busy="true">
        <FashionPageHeader title={t('analysis.loading')} />
      </div>
    )
  }

  const isR0 = projectGate.project.accessMode === 'read-only'

  return (
    <div className={css.page} data-fashion-page="analysis-home">
      {isR0 ? <p className={css.banner} role="note">{t('analysis.r0Readonly')}</p> : null}
      <FashionPageHeader
        title={t('analysis.homeTitle')}
        description={t('analysis.homeHint')}
        actions={(
          <Button type="button" variant="outline" onClick={() => { openTask(projectId, taskId) }}>
            {t('analysis.backTask')}
          </Button>
        )}
      />

      <h2 className={css.sectionTitle}>{t('analysis.items')}</h2>
      {marketItems.items.length === 0 ? (
        <p className={css.meta} data-fashion-analysis="items-empty">{t('analysis.empty')}</p>
      ) : (
        <ul className={css.recordList} data-fashion-analysis="items">
          {marketItems.items.map(item => (
            <li key={String(item.id)}>
              <button
                type="button"
                className={css.recordLink}
                data-fashion-analysis-item={String(item.id)}
                onClick={() => { openItem(projectId, taskId, String(item.id)) }}
              >
                <strong>{item.displayName}</strong>
                <span className={css.meta}>{t(DEDUPE_STATUS_LABELS[item.dedupeStatus])} · {t(OBJECT_STATUS_LABELS[item.status])}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <h2 className={css.sectionTitle}>{t('analysis.signals')}</h2>
      {signals.items.length === 0 ? (
        <p className={css.meta} data-fashion-analysis="signals-empty">{t('analysis.empty')}</p>
      ) : (
        <ul className={css.recordList} data-fashion-analysis="signals">
          {signals.items.map(signal => (
            <li key={String(signal.id)}>
              <button
                type="button"
                className={css.recordLink}
                data-fashion-analysis-signal={String(signal.id)}
                onClick={() => { openSignal(projectId, taskId, String(signal.id)) }}
              >
                <strong>{signal.platform} · {t(SIGNAL_TYPE_LABELS[signal.signalType])}</strong>
                <span className={css.meta}>{signal.rawValue} {signal.rawUnit}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <h2 className={css.sectionTitle}>{t('analysis.clusters')}</h2>
      {clusters.items.length === 0 ? (
        <p className={css.meta} data-fashion-analysis="clusters-empty">{t('analysis.empty')}</p>
      ) : (
        <ul className={css.recordList} data-fashion-analysis="clusters">
          {clusters.items.map(cluster => (
            <li key={String(cluster.id)}>
              <button
                type="button"
                className={css.recordLink}
                data-fashion-analysis-cluster={String(cluster.id)}
                onClick={() => { openCluster(projectId, taskId, String(cluster.id)) }}
              >
                <strong>{cluster.name}</strong>
                <span className={css.meta}>{cluster.evidenceGrade} · {t(OBJECT_STATUS_LABELS[cluster.status])}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <h2 className={css.sectionTitle}>{t('analysis.opportunities')}</h2>
      {opportunities.items.length === 0 ? (
        <p className={css.meta} data-fashion-analysis="opportunities-empty">{t('analysis.empty')}</p>
      ) : (
        <ul className={css.recordList} data-fashion-analysis="opportunities">
          {opportunities.items.map(opportunity => (
            <li key={String(opportunity.id)}>
              <button
                type="button"
                className={css.recordLink}
                data-fashion-analysis-opportunity={String(opportunity.id)}
                onClick={() => { openOpportunity(projectId, taskId, String(opportunity.id)) }}
              >
                <strong>{opportunity.title}</strong>
                <span className={css.meta}>
                  {t(OPPORTUNITY_REVIEW_LABELS[opportunity.reviewStatus])}
                  {opportunity.publicRebuildRecorded ? ` · ${t('analysis.publicRebuild')}` : null}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className={css.disclaimer}>{t('analysis.noHotScore')}</p>

      {isR0 ? null : (
        <AnalysisCreateForms
          projectId={projectId}
          taskId={taskId}
          sources={sources}
          samples={samples}
          evidence={evidence}
          marketItems={marketItems.items}
          signals={signals.items}
          clusters={clusters.items}
          createMarketItem={createMarketItem}
          createPopularitySignal={createPopularitySignal}
          createTrendCluster={createTrendCluster}
          createDesignOpportunity={createDesignOpportunity}
          t={t}
        />
      )}
    </div>
  )
}
