/** Research home: task list, R0 read-only banner, create entry. */
import { useEffect, useState } from 'react'
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ResearchListState } from '@gentlexx/dsh-api-fashion-research-controller/client'
import type { ProjectView } from '@gentlexx/dsh-fashion-project/types'
import type { ResearchTask } from '@gentlexx/dsh-fashion-research/types'
import type { FashionKey } from '../locales.ts'
import { FashionPageHeader } from '../components/FashionPageHeader.tsx'
import { StatePanel } from '../components/StatePanel.tsx'
import { LocalizedTime } from '../components/LocalizedTime.tsx'
import { taskStatusLabel } from './labels.ts'
import css from '../FashionWorkspace.module.css'

export type ResearchHomePageProps = {
  readonly projectId: string
  readonly locale: string
  readonly tasks: ResearchListState<ResearchTask>
  readonly getProject: (projectId: string) => Promise<ProjectView>
  readonly loadTasks: (projectId: string) => Promise<void>
  readonly openOverview: (projectId: string) => void
  readonly openTask: (projectId: string, taskId: string) => void
  readonly openTaskNew: (projectId: string) => void
  readonly t: (key: FashionKey) => string
}

type ProjectGate =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly project: ProjectView }
  | { readonly status: 'error' }

/**
 * List ResearchTasks for one project and open create or task detail.
 * @param props - list snapshot, project gate, navigation, translator.
 */
export function ResearchHomePage({
  projectId,
  locale,
  tasks,
  getProject,
  loadTasks,
  openOverview,
  openTask,
  openTaskNew,
  t,
}: ResearchHomePageProps) {
  const [gate, setGate] = useState<ProjectGate>({ status: 'loading' })
  const [retryToken, setRetryToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    setGate({ status: 'loading' })
    void getProject(projectId).then(
      (project) => {
        if (!cancelled) setGate({ status: 'ready', project })
      },
      () => {
        if (!cancelled) setGate({ status: 'error' })
      },
    )
    return () => { cancelled = true }
  }, [projectId, getProject, retryToken])

  useEffect(() => {
    void loadTasks(projectId)
  }, [projectId, loadTasks, retryToken])

  if (gate.status === 'loading' || (tasks.status === 'loading' && tasks.items.length === 0)) {
    return (
      <div
        className={css.page}
        data-fashion-page="research-loading"
        aria-busy="true"
        aria-label={t('research.loading')}
      >
        <div className={css.skeletonHeader} />
        <div className={css.skeletonBlock} />
      </div>
    )
  }

  if (gate.status === 'error' || (tasks.status === 'error' && tasks.items.length === 0)) {
    return (
      <div className={css.page} data-fashion-page="research-error">
        <FashionPageHeader title={t('research.loadError')} />
        <StatePanel
          tone="error"
          title={t('research.loadError')}
          data-fashion-state="research-error"
          actions={(
            <>
              <Button
                type="button"
                variant="primary"
                onClick={() => { setRetryToken(token => token + 1) }}
                data-fashion-research="retry"
              >
                {t('research.retry')}
              </Button>
              <Button type="button" variant="outline" onClick={() => { openOverview(projectId) }}>
                {t('research.backOverview')}
              </Button>
            </>
          )}
        />
      </div>
    )
  }

  const project = gate.status === 'ready' ? gate.project : null
  const isR0 = project?.origin === 'public-rebuild'
  const readOnly = project?.accessMode === 'read-only' || isR0 === true
  const showEmpty = tasks.status === 'ready' && tasks.items.length === 0

  return (
    <div
      className={css.page}
      data-fashion-page="research-home"
      data-fashion-research-readonly={readOnly ? 'true' : 'false'}
    >
      {isR0 ? <p className={css.banner} role="note">{t('research.r0Readonly')}</p> : null}
      {readOnly && !isR0 ? <p className={css.banner} role="note">{t('research.readOnlyBanner')}</p> : null}
      <FashionPageHeader
        title={t('research.homeTitle')}
        description={t('research.homeHint')}
        actions={(
          <>
            <Button type="button" variant="outline" onClick={() => { openOverview(projectId) }}>
              {t('research.backOverview')}
            </Button>
            {!readOnly ? (
              <Button
                type="button"
                variant="primary"
                onClick={() => { openTaskNew(projectId) }}
                data-fashion-research="create-task"
              >
                {t('research.createTask')}
              </Button>
            ) : null}
          </>
        )}
      />

      {showEmpty ? (
        <StatePanel
          tone="neutral"
          title={t('research.empty')}
          data-fashion-state="research-empty"
          actions={!readOnly ? (
            <Button
              type="button"
              variant="primary"
              onClick={() => { openTaskNew(projectId) }}
              data-fashion-research="create-task-empty"
            >
              {t('research.createTask')}
            </Button>
          ) : undefined}
        />
      ) : (
        <ul className={css.recordList} data-fashion-research="task-list">
          {tasks.items.map(task => (
            <li key={String(task.id)}>
              <button
                type="button"
                className={css.recordLink}
                data-fashion-research-task={String(task.id)}
                onClick={() => { openTask(projectId, String(task.id)) }}
              >
                <strong>{task.title}</strong>
                {' · '}
                {t('research.status')}{t('common.labelSeparator')}{taskStatusLabel(task.status, t)}
                {' · '}
                <LocalizedTime iso={task.updatedAt} locale={locale} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className={css.disclaimer}>{t('research.sessionUnbound')}</p>
    </div>
  )
}
