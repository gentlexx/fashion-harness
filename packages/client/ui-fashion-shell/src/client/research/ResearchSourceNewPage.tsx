/** Register a URL Source under a ResearchTask (no live fetch). */
import { useState } from 'react'
import { Button, Input } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ProjectId } from '@gentlexx/dsh-fashion-project/types'
import { ResearchTaskId } from './ids.ts'
import type { Source, SourceKind } from '@gentlexx/dsh-fashion-research/types'
import type { FashionKey } from '../locales.ts'
import { FashionPageHeader } from '../components/FashionPageHeader.tsx'
import {
  DEFAULT_URL_SOURCE_FIELDS,
  isValidHttpUrl,
  SOURCE_KIND_OPTIONS,
  type ResearchFormPhase,
} from './ResearchFormState.ts'
import { sourceKindLabel } from './labels.ts'
import css from '../FashionWorkspace.module.css'

export type ResearchSourceNewPageProps = {
  readonly projectId: string
  readonly taskId: string
  readonly createSource: (input: {
    projectId: ProjectId
    taskId: ReturnType<typeof ResearchTaskId>
    locatorType: 'url'
    url: string
    title: string
    sourceKind: SourceKind
    captureMode: typeof DEFAULT_URL_SOURCE_FIELDS.captureMode
    usageBoundary: typeof DEFAULT_URL_SOURCE_FIELDS.usageBoundary
    externalProcessing: typeof DEFAULT_URL_SOURCE_FIELDS.externalProcessing
    attribution: string
  }) => Promise<Source>
  readonly openTask: (projectId: string, taskId: string) => void
  readonly openSource: (projectId: string, taskId: string, sourceId: string) => void
  readonly t: (key: FashionKey) => string
}

/**
 * Form for manual URL Source registration.
 * @param props - create inject, navigation, translator.
 */
export function ResearchSourceNewPage({
  projectId,
  taskId,
  createSource,
  openTask,
  openSource,
  t,
}: ResearchSourceNewPageProps) {
  const [phase, setPhase] = useState<ResearchFormPhase>('editing')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [attribution, setAttribution] = useState('')
  const [sourceKind, setSourceKind] = useState<SourceKind>('web_page')
  const [error, setError] = useState<string | null>(null)

  const submit = async (): Promise<void> => {
    if (phase === 'submitting') return
    if (title.trim().length < 1 || attribution.trim().length < 1) {
      setError(t('research.createEmpty'))
      return
    }
    if (!isValidHttpUrl(url)) {
      setError(t('research.invalidUrl'))
      return
    }
    setPhase('submitting')
    setError(null)
    try {
      const source = await createSource({
        projectId: projectId as ProjectId,
        taskId: ResearchTaskId(taskId),
        ...DEFAULT_URL_SOURCE_FIELDS,
        url: url.trim(),
        title: title.trim(),
        sourceKind,
        attribution: attribution.trim(),
      })
      openSource(projectId, taskId, String(source.id))
    } catch {
      setPhase('editing')
      setError(t('research.createFailed'))
    }
  }

  return (
    <div className={css.page} data-fashion-page="research-source-new">
      <FashionPageHeader
        title={t('research.addSource')}
        actions={(
          <Button type="button" variant="outline" onClick={() => { openTask(projectId, taskId) }}>
            {t('research.backTask')}
          </Button>
        )}
      />
      <form
        className={css.createForm}
        data-fashion-research="source-form"
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        <label className={css.createLabel}>
          {t('research.sourceTitle')}
          <Input
            value={title}
            onChange={(event) => { setTitle(event.target.value) }}
            data-fashion-research="source-title"
            disabled={phase === 'submitting'}
          />
        </label>
        <label className={css.createLabel}>
          {t('research.sourceUrl')}
          <Input
            value={url}
            onChange={(event) => { setUrl(event.target.value) }}
            data-fashion-research="source-url"
            disabled={phase === 'submitting'}
          />
        </label>
        <label className={css.createLabel}>
          {t('research.sourceAttribution')}
          <Input
            value={attribution}
            onChange={(event) => { setAttribution(event.target.value) }}
            data-fashion-research="source-attribution"
            disabled={phase === 'submitting'}
          />
        </label>
        <label className={css.createLabel}>
          {t('research.sourceKind')}
          <select
            className={css.formControl}
            value={sourceKind}
            onChange={(event) => { setSourceKind(event.target.value as SourceKind) }}
            data-fashion-research="source-kind"
            disabled={phase === 'submitting'}
          >
            {SOURCE_KIND_OPTIONS.map(kind => (
              <option key={kind} value={kind}>{sourceKindLabel(kind, t)}</option>
            ))}
          </select>
        </label>
        {error !== null ? (
          <p className={css.disclaimer} data-fashion-research="source-error">{error}</p>
        ) : null}
        <div className={css.actions}>
          <Button type="submit" variant="primary" disabled={phase === 'submitting'}>
            {phase === 'submitting' ? t('research.submitting') : t('research.addSource')}
          </Button>
        </div>
      </form>
    </div>
  )
}
