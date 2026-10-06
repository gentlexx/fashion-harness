/** Create ResearchTask form page. */
import { useState } from 'react'
import { Button, Input } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ProjectId } from '@gentlexx/dsh-fashion-project/types'
import type { ResearchTask } from '@gentlexx/dsh-fashion-research/types'
import type { FashionKey } from '../locales.ts'
import { FashionPageHeader } from '../components/FashionPageHeader.tsx'
import type { ResearchFormPhase } from './ResearchFormState.ts'
import css from '../FashionWorkspace.module.css'

export type ResearchTaskNewPageProps = {
  readonly projectId: string
  readonly createTask: (input: {
    projectId: ProjectId
    title: string
    note?: string | null
  }) => Promise<ResearchTask>
  readonly openHome: (projectId: string) => void
  readonly openTask: (projectId: string, taskId: string) => void
  readonly t: (key: FashionKey) => string
}

/**
 * Submit a new ResearchTask then navigate to its detail route.
 * @param props - create inject, navigation, translator.
 */
export function ResearchTaskNewPage({
  projectId,
  createTask,
  openHome,
  openTask,
  t,
}: ResearchTaskNewPageProps) {
  const [phase, setPhase] = useState<ResearchFormPhase>('editing')
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submit = async (): Promise<void> => {
    if (phase === 'submitting') return
    const trimmed = title.trim()
    if (trimmed.length < 1) {
      setError(t('research.createEmpty'))
      return
    }
    setPhase('submitting')
    setError(null)
    try {
      const task = await createTask({
        projectId: projectId as ProjectId,
        title: trimmed,
        note: note.trim().length > 0 ? note : null,
      })
      openTask(projectId, String(task.id))
    } catch {
      setPhase('editing')
      setError(t('research.createFailed'))
    }
  }

  return (
    <div className={css.page} data-fashion-page="research-task-new">
      <FashionPageHeader
        title={t('research.createTask')}
        actions={(
          <Button type="button" variant="outline" onClick={() => { openHome(projectId) }}>
            {t('research.backTasks')}
          </Button>
        )}
      />
      <form
        className={css.createForm}
        data-fashion-research="task-form"
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        <label className={css.createLabel}>
          {t('research.taskTitle')}
          <Input
            value={title}
            onChange={(event) => { setTitle(event.target.value) }}
            data-fashion-research="task-title"
            disabled={phase === 'submitting'}
          />
        </label>
        <label className={css.createLabel}>
          {t('research.taskNote')}
          <textarea
            className={css.formTextarea}
            value={note}
            rows={3}
            onChange={(event) => { setNote(event.target.value) }}
            data-fashion-research="task-note"
            disabled={phase === 'submitting'}
          />
        </label>
        {error !== null ? (
          <p className={css.disclaimer} data-fashion-research="task-error">{error}</p>
        ) : null}
        <div className={css.actions}>
          <Button type="submit" variant="primary" disabled={phase === 'submitting'}>
            {phase === 'submitting' ? t('research.creating') : t('research.createTask')}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={phase === 'submitting'}
            onClick={() => { openHome(projectId) }}
          >
            {t('projects.createCancel')}
          </Button>
        </div>
      </form>
    </div>
  )
}
