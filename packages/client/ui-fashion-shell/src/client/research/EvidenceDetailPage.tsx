/** Evidence detail: observation/claim fields and human review. */
import { useEffect, useState } from 'react'
import { Button, Input } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ProjectView } from '@gentlexx/dsh-fashion-project/types'
import { EvidenceId } from './ids.ts'
import type { Evidence } from '@gentlexx/dsh-fashion-research/types'
import type { FashionKey } from '../locales.ts'
import { FashionPageHeader } from '../components/FashionPageHeader.tsx'
import { StatePanel } from '../components/StatePanel.tsx'
import { LocalizedTime } from '../components/LocalizedTime.tsx'
import { claimTypeLabel, reviewStatusLabel } from './labels.ts'
import type { ResearchFormPhase } from './ResearchFormState.ts'
import css from '../FashionWorkspace.module.css'

export type EvidenceDetailPageProps = {
  readonly projectId: string
  readonly taskId: string
  readonly evidenceId: string
  readonly locale: string
  readonly getProject: (projectId: string) => Promise<ProjectView>
  readonly getEvidence: (projectId: string, taskId: string, evidenceId: ReturnType<typeof EvidenceId>) => Promise<Evidence>
  readonly reviewEvidence: (input: {
    projectId: import('@gentlexx/dsh-fashion-project/types').ProjectId
    taskId: import('@gentlexx/dsh-fashion-research/types').ResearchTaskId
    evidenceId: ReturnType<typeof EvidenceId>
    expectedRevision: number
    reviewStatus: 'confirmed' | 'rejected'
    reviewNote: string
  }) => Promise<Evidence>
  readonly openTask: (projectId: string, taskId: string) => void
  readonly t: (key: FashionKey) => string
}

type Load =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly evidence: Evidence; readonly readOnly: boolean }
  | { readonly status: 'not-found' }
  | { readonly status: 'error' }

/**
 * Render one Evidence record and human confirm/reject when editable.
 * @param props - ids, getters, review inject, navigation, translator.
 */
export function EvidenceDetailPage({
  projectId,
  taskId,
  evidenceId,
  locale,
  getProject,
  getEvidence,
  reviewEvidence,
  openTask,
  t,
}: EvidenceDetailPageProps) {
  const [load, setLoad] = useState<Load>({ status: 'loading' })
  const [phase, setPhase] = useState<ResearchFormPhase>('idle')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoad({ status: 'loading' })
    void Promise.all([
      getProject(projectId),
      getEvidence(projectId, taskId, EvidenceId(evidenceId)),
    ]).then(
      ([project, evidence]) => {
        if (cancelled) return
        setLoad({
          status: 'ready',
          evidence,
          readOnly: project.accessMode === 'read-only' || evidence.accessMode === 'read-only',
        })
      },
      (err: unknown) => {
        if (cancelled) return
        const code = typeof err === 'object' && err !== null && 'code' in err
          ? String((err as { code: unknown }).code)
          : ''
        if (code.includes('not-found')) setLoad({ status: 'not-found' })
        else setLoad({ status: 'error' })
      },
    )
    return () => { cancelled = true }
  }, [projectId, taskId, evidenceId, getProject, getEvidence])

  if (load.status === 'loading') {
    return (
      <div className={css.page} data-fashion-page="research-evidence-loading" aria-busy="true">
        <div className={css.skeletonHeader} />
      </div>
    )
  }

  if (load.status === 'not-found' || load.status === 'error') {
    return (
      <div className={css.page} data-fashion-page="research-evidence-missing">
        <StatePanel
          tone="error"
          title={load.status === 'not-found' ? t('research.notFound') : t('research.loadError')}
          actions={(
            <Button type="button" variant="primary" onClick={() => { openTask(projectId, taskId) }}>
              {t('research.backTask')}
            </Button>
          )}
        />
      </div>
    )
  }

  const { evidence, readOnly } = load
  const terminal = evidence.reviewStatus === 'confirmed'
    || evidence.reviewStatus === 'rejected'
    || evidence.reviewStatus === 'invalidated'
  const canReview = !readOnly && !terminal

  const submitReview = async (reviewStatus: 'confirmed' | 'rejected'): Promise<void> => {
    if (phase === 'submitting') return
    if (note.trim().length < 1) {
      setError(t('research.createEmpty'))
      return
    }
    setPhase('submitting')
    setError(null)
    try {
      const updated = await reviewEvidence({
        projectId: projectId as import('@gentlexx/dsh-fashion-project/types').ProjectId,
        taskId: taskId as import('@gentlexx/dsh-fashion-research/types').ResearchTaskId,
        evidenceId: EvidenceId(evidenceId),
        expectedRevision: evidence.revision,
        reviewStatus,
        reviewNote: note.trim(),
      })
      setLoad({ status: 'ready', evidence: updated, readOnly })
      setPhase('idle')
      setNote('')
    } catch {
      setPhase('editing')
      setError(t('research.reviewFailed'))
    }
  }

  return (
    <div className={css.page} data-fashion-page="research-evidence">
      {readOnly ? <p className={css.banner} role="note">{t('research.readOnlyBanner')}</p> : null}
      <FashionPageHeader
        title={t('research.evidence')}
        meta={(
          <span className={css.meta}>
            {evidence.evidenceGrade}
            {' · '}
            {reviewStatusLabel(evidence.reviewStatus, t)}
            {' · '}
            <LocalizedTime iso={evidence.updatedAt} locale={locale} />
          </span>
        )}
        actions={(
          <Button type="button" variant="outline" onClick={() => { openTask(projectId, taskId) }}>
            {t('research.backTask')}
          </Button>
        )}
      />

      <dl className={css.dl} data-fashion-research="evidence-meta">
        <div>
          <dt>{t('research.observation')}</dt>
          <dd>{evidence.observation}</dd>
        </div>
        {evidence.excerpt !== null ? (
          <div>
            <dt>{t('research.excerpt')}</dt>
            <dd>{evidence.excerpt}</dd>
          </div>
        ) : null}
        {evidence.claim !== null ? (
          <div>
            <dt>{t('research.claim')}</dt>
            <dd>
              {evidence.claim}
              {evidence.claimType !== null ? ` (${claimTypeLabel(evidence.claimType, t)})` : ''}
            </dd>
          </div>
        ) : null}
        {evidence.method !== null ? (
          <div>
            <dt>{t('research.method')}</dt>
            <dd>{evidence.method}</dd>
          </div>
        ) : null}
        {evidence.limitations.length > 0 ? (
          <div>
            <dt>{t('research.limitations')}</dt>
            <dd>
              <ul className={css.list}>
                {evidence.limitations.map(item => <li key={item}>{item}</li>)}
              </ul>
            </dd>
          </div>
        ) : null}
        {evidence.reviewNote !== null ? (
          <div>
            <dt>{t('research.reviewNote')}</dt>
            <dd>{evidence.reviewNote}</dd>
          </div>
        ) : null}
      </dl>

      {canReview ? (
        <section className={css.createForm} data-fashion-research="review-form">
          <label className={css.createLabel}>
            {t('research.reviewNote')}
            <Input
              value={note}
              onChange={(event) => {
                setNote(event.target.value)
                if (phase === 'idle') setPhase('editing')
              }}
              data-fashion-research="review-note"
              disabled={phase === 'submitting'}
            />
          </label>
          {error !== null ? <p className={css.disclaimer}>{error}</p> : null}
          <div className={css.actions}>
            <Button
              type="button"
              variant="primary"
              disabled={phase === 'submitting'}
              onClick={() => { void submitReview('confirmed') }}
              data-fashion-research="review-confirm"
            >
              {phase === 'submitting' ? t('research.reviewing') : t('research.reviewConfirm')}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={phase === 'submitting'}
              onClick={() => { void submitReview('rejected') }}
              data-fashion-research="review-reject"
            >
              {t('research.reviewReject')}
            </Button>
          </div>
        </section>
      ) : null}

      <p className={css.disclaimer}>{t('research.sessionUnbound')}</p>
    </div>
  )
}
