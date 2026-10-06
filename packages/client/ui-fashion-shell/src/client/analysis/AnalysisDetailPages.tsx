/** Analysis detail pages for item / signal / cluster / opportunity. */
import { useEffect, useRef, useState } from 'react'
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ProjectView } from '@gentlexx/dsh-fashion-project/types'
import type {
  DesignOpportunity,
  MarketItem,
  PopularitySignal,
  TrendCluster,
} from '@gentlexx/dsh-fashion-analysis/types'
import type { FashionKey } from '../locales.ts'
import { FashionPageHeader } from '../components/FashionPageHeader.tsx'
import { StatePanel } from '../components/StatePanel.tsx'
import css from '../FashionWorkspace.module.css'
import { SIGNAL_TYPE_LABELS } from './signal-type.ts'
import { DEDUPE_STATUS_LABELS, ITEM_TYPE_LABELS, OBJECT_STATUS_LABELS, OPPORTUNITY_REVIEW_LABELS } from './analysis-labels.ts'

type LoadGate<T> =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly value: T; readonly project: ProjectView }
  | { readonly status: 'not-found' }
  | { readonly status: 'error' }

/**
 * Load one analysis record, refetching when the addressed record changes.
 *
 * `recordKey` — not the loader — decides when a fetch is due: the loader closes
 * over this render's props and is therefore a new function on every render, so
 * depending on it would reset the gate to `loading` after each fetch and leave
 * the page permanently loading.
 * @param recordKey - identity of the addressed record, project id included.
 * @param load - fetches the project and the record together.
 * @returns the current load state for the addressed record.
 */
function useAnalysisEntity<T>(
  recordKey: string,
  load: () => Promise<{ project: ProjectView; value: T }>,
): LoadGate<T> {
  const [gate, setGate] = useState<LoadGate<T>>({ status: 'loading' })
  const latestLoad = useRef(load)
  latestLoad.current = load
  useEffect(() => {
    let cancelled = false
    setGate({ status: 'loading' })
    void latestLoad.current().then(
      (result) => { if (!cancelled) setGate({ status: 'ready', ...result }) },
      (error: unknown) => {
        if (cancelled) return
        const code = error && typeof error === 'object' && 'code' in error
          ? String((error as { code: string }).code)
          : ''
        setGate({
          status: code.includes('not-found') ? 'not-found' : 'error',
        })
      },
    )
    return () => { cancelled = true }
  }, [recordKey])
  return gate
}

/** In-flight state for an analysis detail page; never renders an empty page. */
function AnalysisDetailLoading(props: {
  readonly page: string
  readonly t: (key: FashionKey) => string
}) {
  return (
    <div className={css.page} data-fashion-page={props.page} aria-busy="true">
      <FashionPageHeader title={props.t('analysis.loading')} />
    </div>
  )
}

/** MarketItem detail. */
export function AnalysisItemPage(props: {
  readonly projectId: string
  readonly taskId: string
  readonly marketItemId: string
  readonly getProject: (projectId: string) => Promise<ProjectView>
  readonly getItem: (projectId: string, taskId: string, marketItemId: string) => Promise<MarketItem>
  readonly openAnalysis: (projectId: string, taskId: string) => void
  readonly t: (key: FashionKey) => string
}) {
  const gate = useAnalysisEntity(`${props.projectId}/${props.taskId}/${props.marketItemId}`, async () => {
    const [project, value] = await Promise.all([
      props.getProject(props.projectId),
      props.getItem(props.projectId, props.taskId, props.marketItemId),
    ])
    return { project, value }
  })
  if (gate.status === 'loading') {
    return <AnalysisDetailLoading page="analysis-item-loading" t={props.t} />
  }
  if (gate.status !== 'ready') {
    return (
      <div className={css.page} data-fashion-page="analysis-item-missing">
        <StatePanel
          title={gate.status === 'not-found' ? props.t('analysis.notFound') : props.t('analysis.loadError')}
          actions={(
            <Button type="button" variant="outline" onClick={() => { props.openAnalysis(props.projectId, props.taskId) }}>
              {props.t('analysis.backAnalysis')}
            </Button>
          )}
        />
      </div>
    )
  }
  const item = gate.value
  return (
    <div className={css.page} data-fashion-page="analysis-item">
      <FashionPageHeader
        title={item.displayName}
        description={`${props.t(ITEM_TYPE_LABELS[item.itemType])} · ${props.t(DEDUPE_STATUS_LABELS[item.dedupeStatus])} · ${props.t(OBJECT_STATUS_LABELS[item.status])}`}
        actions={(
          <Button type="button" variant="outline" onClick={() => { props.openAnalysis(props.projectId, props.taskId) }}>
            {props.t('analysis.backAnalysis')}
          </Button>
        )}
      />
      <dl className={css.dl}>
        <div>
          <dt>{props.t('analysis.brand')}</dt>
          <dd data-fashion-analysis="item-brand">
            {item.brandOrCreator === null ? props.t('analysis.brandNotRecorded') : item.brandOrCreator}
          </dd>
        </div>
        <div>
          <dt>{props.t('analysis.observations')}</dt>
          <dd>{item.observationLinks.map(link => String(link.sampleId)).join(', ')}</dd>
        </div>
      </dl>
    </div>
  )
}

/** PopularitySignal detail. */
export function AnalysisSignalPage(props: {
  readonly projectId: string
  readonly taskId: string
  readonly signalId: string
  readonly getProject: (projectId: string) => Promise<ProjectView>
  readonly getSignal: (projectId: string, taskId: string, signalId: string) => Promise<PopularitySignal>
  readonly openAnalysis: (projectId: string, taskId: string) => void
  readonly t: (key: FashionKey) => string
}) {
  const gate = useAnalysisEntity(`${props.projectId}/${props.taskId}/${props.signalId}`, async () => {
    const [project, value] = await Promise.all([
      props.getProject(props.projectId),
      props.getSignal(props.projectId, props.taskId, props.signalId),
    ])
    return { project, value }
  })
  if (gate.status === 'loading') {
    return <AnalysisDetailLoading page="analysis-signal-loading" t={props.t} />
  }
  if (gate.status !== 'ready') {
    return (
      <div className={css.page} data-fashion-page="analysis-signal-missing">
        <StatePanel
          title={gate.status === 'not-found' ? props.t('analysis.notFound') : props.t('analysis.loadError')}
          actions={(
            <Button type="button" variant="outline" onClick={() => { props.openAnalysis(props.projectId, props.taskId) }}>
              {props.t('analysis.backAnalysis')}
            </Button>
          )}
        />
      </div>
    )
  }
  const signal = gate.value
  return (
    <div className={css.page} data-fashion-page="analysis-signal">
      <FashionPageHeader
        title={`${signal.platform} · ${props.t(SIGNAL_TYPE_LABELS[signal.signalType])}`}
        description={`${signal.rawValue} ${signal.rawUnit}`}
        actions={(
          <Button type="button" variant="outline" onClick={() => { props.openAnalysis(props.projectId, props.taskId) }}>
            {props.t('analysis.backAnalysis')}
          </Button>
        )}
      />
      <dl className={css.dl}>
        <div><dt>{props.t('analysis.method')}</dt><dd>{signal.methodVersion}</dd></div>
        <div>
          <dt>{props.t('analysis.window')}</dt>
          <dd data-fashion-analysis="signal-window">
            {signal.windowStart === null ? props.t('analysis.windowNotRecorded') : signal.windowStart}
            {' → '}
            {signal.windowEnd === null ? props.t('analysis.windowNotRecorded') : signal.windowEnd}
          </dd>
        </div>
        <div><dt>{props.t('analysis.limitations')}</dt><dd>{signal.limitations.join('；')}</dd></div>
      </dl>
      <p className={css.disclaimer}>{props.t('analysis.noHotScore')}</p>
    </div>
  )
}

/** TrendCluster detail. */
export function AnalysisClusterPage(props: {
  readonly projectId: string
  readonly taskId: string
  readonly clusterId: string
  readonly getProject: (projectId: string) => Promise<ProjectView>
  readonly getCluster: (projectId: string, taskId: string, clusterId: string) => Promise<TrendCluster>
  readonly openAnalysis: (projectId: string, taskId: string) => void
  readonly t: (key: FashionKey) => string
}) {
  const gate = useAnalysisEntity(`${props.projectId}/${props.taskId}/${props.clusterId}`, async () => {
    const [project, value] = await Promise.all([
      props.getProject(props.projectId),
      props.getCluster(props.projectId, props.taskId, props.clusterId),
    ])
    return { project, value }
  })
  if (gate.status === 'loading') {
    return <AnalysisDetailLoading page="analysis-cluster-loading" t={props.t} />
  }
  if (gate.status !== 'ready') {
    return (
      <div className={css.page} data-fashion-page="analysis-cluster-missing">
        <StatePanel
          title={gate.status === 'not-found' ? props.t('analysis.notFound') : props.t('analysis.loadError')}
          actions={(
            <Button type="button" variant="outline" onClick={() => { props.openAnalysis(props.projectId, props.taskId) }}>
              {props.t('analysis.backAnalysis')}
            </Button>
          )}
        />
      </div>
    )
  }
  const cluster = gate.value
  return (
    <div className={css.page} data-fashion-page="analysis-cluster">
      <FashionPageHeader
        title={cluster.name}
        description={`${cluster.evidenceGrade} · ${props.t(OBJECT_STATUS_LABELS[cluster.status])}`}
        actions={(
          <Button type="button" variant="outline" onClick={() => { props.openAnalysis(props.projectId, props.taskId) }}>
            {props.t('analysis.backAnalysis')}
          </Button>
        )}
      />
      <p className={css.meta}>{cluster.definition}</p>
      <dl className={css.dl}>
        <div><dt>{props.t('analysis.members')}</dt><dd>{cluster.memberRefs.map(ref => `${ref.type}:${ref.id}`).join(', ')}</dd></div>
        <div><dt>{props.t('analysis.counterEvidence')}</dt><dd>{cluster.counterEvidence.join('；')}</dd></div>
        <div><dt>{props.t('analysis.gaps')}</dt><dd>{cluster.biasesAndGaps.join('；')}</dd></div>
      </dl>
    </div>
  )
}

/** DesignOpportunity detail with human decision controls. */
export function AnalysisOpportunityPage(props: {
  readonly projectId: string
  readonly taskId: string
  readonly opportunityId: string
  readonly getProject: (projectId: string) => Promise<ProjectView>
  readonly getOpportunity: (projectId: string, taskId: string, opportunityId: string) => Promise<DesignOpportunity>
  readonly decideOpportunity: (input: {
    projectId: import('@gentlexx/dsh-fashion-project/types').ProjectId
    taskId: import('@gentlexx/dsh-fashion-research/types').ResearchTaskId
    opportunityId: import('@gentlexx/dsh-fashion-analysis/types').DesignOpportunityId
    expectedRevision: number
    action: 'selected' | 'rejected' | 'needs_more_research'
    reasonCodes: readonly ['needs_designer_validation' | 'evidence_sufficient' | 'other']
    note: string
  }) => Promise<{ opportunity: DesignOpportunity }>
  readonly openAnalysis: (projectId: string, taskId: string) => void
  readonly openDesignBrief: (projectId: string, opportunityId: string) => void
  readonly t: (key: FashionKey) => string
}) {
  const [gate, setGate] = useState<LoadGate<DesignOpportunity>>({ status: 'loading' })
  const [note, setNote] = useState('')
  const [phase, setPhase] = useState<'idle' | 'submitting'>('idle')
  const [error, setError] = useState<string | null>(null)

  const reload = async (): Promise<void> => {
    setGate({ status: 'loading' })
    try {
      const [project, value] = await Promise.all([
        props.getProject(props.projectId),
        props.getOpportunity(props.projectId, props.taskId, props.opportunityId),
      ])
      setGate({ status: 'ready', project, value })
    } catch (caught: unknown) {
      const code = caught && typeof caught === 'object' && 'code' in caught
        ? String((caught as { code: string }).code)
        : ''
      setGate({ status: code.includes('not-found') ? 'not-found' : 'error' })
    }
  }

  useEffect(() => {
    void reload()
  }, [props.projectId, props.taskId, props.opportunityId])

  if (gate.status === 'loading') {
    return <AnalysisDetailLoading page="analysis-opportunity-loading" t={props.t} />
  }
  if (gate.status !== 'ready') {
    return (
      <div className={css.page} data-fashion-page="analysis-opportunity-missing">
        <StatePanel
          title={gate.status === 'not-found' ? props.t('analysis.notFound') : props.t('analysis.loadError')}
          actions={(
            <Button type="button" variant="outline" onClick={() => { props.openAnalysis(props.projectId, props.taskId) }}>
              {props.t('analysis.backAnalysis')}
            </Button>
          )}
        />
      </div>
    )
  }

  const opportunity = gate.value
  const readOnly = gate.project.accessMode === 'read-only' || opportunity.status === 'stale'
  const terminal = opportunity.reviewStatus !== 'candidate'

  const submit = async (action: 'selected' | 'rejected' | 'needs_more_research'): Promise<void> => {
    const trimmed = note.trim()
    if (trimmed.length < 1) {
      setError(props.t('analysis.decisionNoteRequired'))
      return
    }
    setPhase('submitting')
    setError(null)
    try {
      await props.decideOpportunity({
        projectId: props.projectId as import('@gentlexx/dsh-fashion-project/types').ProjectId,
        taskId: props.taskId as import('@gentlexx/dsh-fashion-research/types').ResearchTaskId,
        opportunityId: props.opportunityId as import('@gentlexx/dsh-fashion-analysis/types').DesignOpportunityId,
        expectedRevision: opportunity.revision,
        action,
        reasonCodes: action === 'selected'
          ? ['evidence_sufficient']
          : ['needs_designer_validation'],
        note: trimmed,
      })
      await reload()
      setPhase('idle')
    } catch {
      setError(props.t('analysis.decisionFailed'))
      setPhase('idle')
    }
  }

  return (
    <div className={css.page} data-fashion-page="analysis-opportunity">
      {opportunity.publicRebuildRecorded
        ? <p className={css.banner} role="note">{props.t('analysis.publicRebuildBanner')}</p>
        : null}
      {opportunity.status === 'stale'
        ? <p className={css.banner} role="note">{props.t('analysis.staleBanner')}</p>
        : null}
      <FashionPageHeader
        title={opportunity.title}
        description={`${props.t(OPPORTUNITY_REVIEW_LABELS[opportunity.reviewStatus])} · ${opportunity.evidenceGrade}`}
        actions={(
          <>
            {opportunity.reviewStatus === 'selected' && opportunity.status !== 'stale'
              ? (
                <Button
                  type="button"
                  variant="primary"
                  data-fashion-design="open-brief"
                  onClick={() => { props.openDesignBrief(props.projectId, props.opportunityId) }}
                >
                  {props.t('design.openBrief')}
                </Button>
              )
              : null}
            <Button type="button" variant="outline" onClick={() => { props.openAnalysis(props.projectId, props.taskId) }}>
              {props.t('analysis.backAnalysis')}
            </Button>
          </>
        )}
      />
      <p className={css.meta}>{opportunity.opportunityStatement}</p>
      <dl className={css.dl}>
        <div><dt>{props.t('analysis.targetMarket')}</dt><dd>{opportunity.targetMarket}</dd></div>
        <div><dt>{props.t('analysis.unknowns')}</dt><dd>{opportunity.unknowns.join('；') || '—'}</dd></div>
        <div><dt>{props.t('analysis.risks')}</dt><dd>{opportunity.copyingOrIpRisks.join('；') || '—'}</dd></div>
      </dl>
      {!readOnly && !terminal ? (
        <section className={css.createForm} data-fashion-analysis="decision-form">
          <label className={css.createLabel}>
            {props.t('analysis.decisionNote')}
            <textarea
              className={css.formTextarea}
              value={note}
              data-fashion-analysis="decision-note"
              onChange={(event) => { setNote(event.target.value) }}
            />
          </label>
          {error !== null ? <p className={css.disclaimer} role="alert">{error}</p> : null}
          <div className={css.actions}>
            <Button
              type="button"
              variant="primary"
              disabled={phase === 'submitting'}
              data-fashion-analysis="decision-select"
              onClick={() => { void submit('selected') }}
            >
              {props.t('analysis.decideSelect')}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={phase === 'submitting'}
              data-fashion-analysis="decision-reject"
              onClick={() => { void submit('rejected') }}
            >
              {props.t('analysis.decideReject')}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={phase === 'submitting'}
              data-fashion-analysis="decision-more"
              onClick={() => { void submit('needs_more_research') }}
            >
              {props.t('analysis.decideMore')}
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  )
}
