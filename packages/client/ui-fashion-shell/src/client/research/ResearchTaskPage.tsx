/** ResearchTask detail: Source / Sample / Evidence lists and create entries. */
import { useEffect, useState } from 'react'
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ResearchListState } from '@gentlexx/dsh-api-fashion-research-controller/client'
import type { ProjectView } from '@gentlexx/dsh-fashion-project/types'
import type {
  Evidence,
  ResearchTask,
  Sample,
  Source,
} from '@gentlexx/dsh-fashion-research/types'
import { ResearchTaskId } from './ids.ts'
import type { FashionKey } from '../locales.ts'
import { FashionPageHeader } from '../components/FashionPageHeader.tsx'
import { StatePanel } from '../components/StatePanel.tsx'
import { LocalizedTime } from '../components/LocalizedTime.tsx'
import { taskStatusLabel, sampleStatusLabel, reviewStatusLabel } from './labels.ts'
import css from '../FashionWorkspace.module.css'

export type ResearchTaskPageProps = {
  readonly projectId: string
  readonly taskId: string
  readonly locale: string
  readonly sources: ResearchListState<Source>
  readonly samples: ResearchListState<Sample>
  readonly evidence: ResearchListState<Evidence>
  readonly getProject: (projectId: string) => Promise<ProjectView>
  readonly getTask: (projectId: string, taskId: ReturnType<typeof ResearchTaskId>) => Promise<ResearchTask>
  readonly loadTaskChildren: (projectId: string, taskId: string) => Promise<void>
  readonly openHome: (projectId: string) => void
  readonly openSourceNew: (projectId: string, taskId: string) => void
  readonly openSource: (projectId: string, taskId: string, sourceId: string) => void
  readonly openSample: (projectId: string, taskId: string, sampleId: string) => void
  readonly openEvidence: (projectId: string, taskId: string, evidenceId: string) => void
  readonly openAnalysis: (projectId: string, taskId: string) => void
  readonly t: (key: FashionKey) => string
}

type Load =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly task: ResearchTask; readonly readOnly: boolean; readonly isR0: boolean }
  | { readonly status: 'not-found' }
  | { readonly status: 'error' }

/**
 * Show one ResearchTask and its Source/Sample/Evidence children.
 * @param props - ids, list snapshots, getters, navigation, translator.
 */
export function ResearchTaskPage({
  projectId,
  taskId,
  locale,
  sources,
  samples,
  evidence,
  getProject,
  getTask,
  loadTaskChildren,
  openHome,
  openSourceNew,
  openSource,
  openSample,
  openEvidence,
  openAnalysis,
  t,
}: ResearchTaskPageProps) {
  const [load, setLoad] = useState<Load>({ status: 'loading' })
  const [retryToken, setRetryToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoad({ status: 'loading' })
    void Promise.all([
      getProject(projectId),
      getTask(projectId, ResearchTaskId(taskId)),
    ]).then(
      ([project, task]) => {
        if (cancelled) return
        setLoad({
          status: 'ready',
          task,
          readOnly: project.accessMode === 'read-only' || task.accessMode === 'read-only',
          isR0: project.origin === 'public-rebuild',
        })
      },
      (error: unknown) => {
        if (cancelled) return
        const code = typeof error === 'object' && error !== null && 'code' in error
          ? String((error as { code: unknown }).code)
          : ''
        if (code.includes('not-found')) setLoad({ status: 'not-found' })
        else setLoad({ status: 'error' })
      },
    )
    return () => { cancelled = true }
  }, [projectId, taskId, getProject, getTask, retryToken])

  useEffect(() => {
    void loadTaskChildren(projectId, taskId)
  }, [projectId, taskId, loadTaskChildren, retryToken])

  if (load.status === 'loading') {
    return (
      <div className={css.page} data-fashion-page="research-task-loading" aria-busy="true">
        <div className={css.skeletonHeader} />
        <div className={css.skeletonBlock} />
      </div>
    )
  }

  if (load.status === 'not-found') {
    return (
      <div className={css.page} data-fashion-page="research-task-missing">
        <StatePanel
          tone="error"
          title={t('research.notFound')}
          data-fashion-state="research-not-found"
          actions={(
            <Button type="button" variant="primary" onClick={() => { openHome(projectId) }}>
              {t('research.backTasks')}
            </Button>
          )}
        />
      </div>
    )
  }

  if (load.status === 'error') {
    return (
      <div className={css.page} data-fashion-page="research-task-error">
        <StatePanel
          tone="error"
          title={t('research.loadError')}
          data-fashion-state="research-task-error"
          actions={(
            <Button
              type="button"
              variant="primary"
              onClick={() => { setRetryToken(token => token + 1) }}
            >
              {t('research.retry')}
            </Button>
          )}
        />
      </div>
    )
  }

  const { task, readOnly, isR0 } = load

  return (
    <div className={css.page} data-fashion-page="research-task">
      {isR0 ? <p className={css.banner} role="note">{t('research.r0Readonly')}</p> : null}
      {readOnly && !isR0 ? <p className={css.banner} role="note">{t('research.readOnlyBanner')}</p> : null}
      <FashionPageHeader
        title={task.title}
        description={task.note ?? undefined}
        meta={(
          <span className={css.meta}>
            {t('research.status')}{t('common.labelSeparator')}{taskStatusLabel(task.status, t)}
            {' · '}
            <LocalizedTime iso={task.updatedAt} locale={locale} />
          </span>
        )}
        actions={(
          <>
            <Button type="button" variant="outline" onClick={() => { openHome(projectId) }}>
              {t('research.backTasks')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => { openAnalysis(projectId, taskId) }}
              data-fashion-analysis="open"
            >
              {t('analysis.openAnalysis')}
            </Button>
            {!readOnly ? (
              <Button
                type="button"
                variant="primary"
                onClick={() => { openSourceNew(projectId, taskId) }}
                data-fashion-research="add-source"
              >
                {t('research.addSource')}
              </Button>
            ) : null}
          </>
        )}
      />

      <section className={css.semanticCard} data-fashion-research="sources">
        <h2 className={css.sectionTitle}>{t('research.sources')}</h2>
        {sources.items.length === 0 ? (
          <p className={css.meta}>{t('research.emptySources')}</p>
        ) : (
          <ul className={css.list}>
            {sources.items.map(source => (
              <li key={String(source.id)}>
                <button
                  type="button"
                  className={css.recordLink}
                  data-fashion-research-source={String(source.id)}
                  onClick={() => { openSource(projectId, taskId, String(source.id)) }}
                >
                  {source.title}
                  {source.url !== null ? ` · ${source.url}` : ''}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={css.semanticCard} data-fashion-research="samples">
        <h2 className={css.sectionTitle}>{t('research.samples')}</h2>
        {samples.items.length === 0 ? (
          <p className={css.meta}>{t('research.emptySamples')}</p>
        ) : (
          <ul className={css.list}>
            {samples.items.map(sample => (
              <li key={String(sample.id)}>
                <button
                  type="button"
                  className={css.recordLink}
                  data-fashion-research-sample={String(sample.id)}
                  onClick={() => { openSample(projectId, taskId, String(sample.id)) }}
                >
                  {sample.label}
                  {' · '}
                  {sampleStatusLabel(sample.status, t)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={css.semanticCard} data-fashion-research="evidence">
        <h2 className={css.sectionTitle}>{t('research.evidence')}</h2>
        {evidence.items.length === 0 ? (
          <p className={css.meta}>{t('research.emptyEvidence')}</p>
        ) : (
          <ul className={css.list}>
            {evidence.items.map(item => (
              <li key={String(item.id)}>
                <button
                  type="button"
                  className={css.recordLink}
                  data-fashion-research-evidence={String(item.id)}
                  onClick={() => { openEvidence(projectId, taskId, String(item.id)) }}
                >
                  {item.observation.slice(0, 80)}
                  {item.observation.length > 80 ? '…' : ''}
                  {' · '}
                  {reviewStatusLabel(item.reviewStatus, t)}
                  {' · '}
                  {item.evidenceGrade}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className={css.disclaimer}>{t('research.sessionUnbound')}</p>
    </div>
  )
}
