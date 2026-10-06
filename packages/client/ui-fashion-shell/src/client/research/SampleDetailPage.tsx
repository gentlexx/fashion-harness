/** Sample detail: metadata plus text Evidence create form. */
import { useEffect, useState } from 'react'
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ProjectId, ProjectView } from '@gentlexx/dsh-fashion-project/types'
import {
  ResearchTaskId,
  SampleId,
} from './ids.ts'
import type {
  ClaimType,
  Evidence,
  EvidenceGrade,
  Sample,
} from '@gentlexx/dsh-fashion-research/types'
import type { FashionKey } from '../locales.ts'
import { FashionPageHeader } from '../components/FashionPageHeader.tsx'
import { StatePanel } from '../components/StatePanel.tsx'
import { LocalizedTime } from '../components/LocalizedTime.tsx'
import { sampleStatusLabel } from './labels.ts'
import { parseLimitationLines, type ResearchFormPhase } from './ResearchFormState.ts'
import { EvidenceCreateForm } from './SourceDetailPage.tsx'
import css from '../FashionWorkspace.module.css'

export type SampleDetailPageProps = {
  readonly projectId: string
  readonly taskId: string
  readonly sampleId: string
  readonly locale: string
  readonly getProject: (projectId: string) => Promise<ProjectView>
  readonly getSample: (projectId: string, taskId: string, sampleId: ReturnType<typeof SampleId>) => Promise<Sample>
  readonly createEvidence: (input: {
    projectId: ProjectId
    taskId: ReturnType<typeof ResearchTaskId>
    subjectType: 'sample'
    subjectId: ReturnType<typeof SampleId>
    observation: string
    claim?: string | null
    claimType?: ClaimType | null
    evidenceGrade: EvidenceGrade
    method?: string | null
    limitations?: readonly string[]
    excerpt?: string | null
  }) => Promise<Evidence>
  readonly openTask: (projectId: string, taskId: string) => void
  readonly openEvidence: (projectId: string, taskId: string, evidenceId: string) => void
  readonly t: (key: FashionKey) => string
}

type Load =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly sample: Sample; readonly readOnly: boolean }
  | { readonly status: 'not-found' }
  | { readonly status: 'error' }

/**
 * Render one Sample and allow Evidence intake when editable.
 * @param props - ids, getters, create inject, navigation, translator.
 */
export function SampleDetailPage({
  projectId,
  taskId,
  sampleId,
  locale,
  getProject,
  getSample,
  createEvidence,
  openTask,
  openEvidence,
  t,
}: SampleDetailPageProps) {
  const [load, setLoad] = useState<Load>({ status: 'loading' })
  const [evidencePhase, setEvidencePhase] = useState<ResearchFormPhase>('idle')
  const [observation, setObservation] = useState('')
  const [claim, setClaim] = useState('')
  const [claimType, setClaimType] = useState<ClaimType | ''>('')
  const [grade, setGrade] = useState<EvidenceGrade>('G1')
  const [method, setMethod] = useState('')
  const [limitations, setLimitations] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [evidenceError, setEvidenceError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoad({ status: 'loading' })
    void Promise.all([getProject(projectId), getSample(projectId, taskId, SampleId(sampleId))]).then(
      ([project, sample]) => {
        if (cancelled) return
        setLoad({
          status: 'ready',
          sample,
          readOnly: project.accessMode === 'read-only' || sample.accessMode === 'read-only',
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
  }, [projectId, taskId, sampleId, getProject, getSample])

  if (load.status === 'loading') {
    return (
      <div className={css.page} data-fashion-page="research-sample-loading" aria-busy="true">
        <div className={css.skeletonHeader} />
      </div>
    )
  }

  if (load.status === 'not-found' || load.status === 'error') {
    return (
      <div className={css.page} data-fashion-page="research-sample-missing">
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

  const { sample, readOnly } = load

  const submitEvidence = async (): Promise<void> => {
    if (evidencePhase === 'submitting') return
    if (observation.trim().length < 1) {
      setEvidenceError(t('research.createEmpty'))
      return
    }
    const trimmedClaim = claim.trim()
    const claimValue = trimmedClaim.length > 0 ? trimmedClaim : null
    const claimTypeValue = claimValue === null ? null : (claimType === '' ? null : claimType)
    if (claimValue !== null && claimTypeValue === null) {
      setEvidenceError(t('research.createEmpty'))
      return
    }
    setEvidencePhase('submitting')
    setEvidenceError(null)
    try {
      const item = await createEvidence({
        projectId: projectId as ProjectId,
        taskId: ResearchTaskId(taskId),
        subjectType: 'sample',
        subjectId: SampleId(sampleId),
        observation: observation.trim(),
        claim: claimValue,
        claimType: claimTypeValue,
        evidenceGrade: grade,
        method: method.trim().length > 0 ? method.trim() : null,
        limitations: parseLimitationLines(limitations),
        excerpt: excerpt.trim().length > 0 ? excerpt.trim() : null,
      })
      openEvidence(projectId, taskId, String(item.id))
    } catch {
      setEvidencePhase('editing')
      setEvidenceError(t('research.createFailed'))
    }
  }

  return (
    <div className={css.page} data-fashion-page="research-sample">
      {readOnly ? <p className={css.banner} role="note">{t('research.readOnlyBanner')}</p> : null}
      <FashionPageHeader
        title={sample.label}
        meta={(
          <span className={css.meta}>
            {t('research.status')}{t('common.labelSeparator')}{sampleStatusLabel(sample.status, t)}
            {' · '}
            <LocalizedTime iso={sample.observedAt} locale={locale} />
          </span>
        )}
        actions={(
          <Button type="button" variant="outline" onClick={() => { openTask(projectId, taskId) }}>
            {t('research.backTask')}
          </Button>
        )}
      />

      {sample.rawFields.length > 0 ? (
        <ul className={css.list} data-fashion-research="sample-raw">
          {sample.rawFields.map(field => (
            <li key={`${field.name}:${field.value}`}>
              {field.name}: {field.value}
              {field.unit !== undefined ? ` ${field.unit}` : ''}
            </li>
          ))}
        </ul>
      ) : null}

      {!readOnly ? (
        <EvidenceCreateForm
          observation={observation}
          setObservation={setObservation}
          claim={claim}
          setClaim={setClaim}
          claimType={claimType}
          setClaimType={setClaimType}
          grade={grade}
          setGrade={setGrade}
          method={method}
          setMethod={setMethod}
          limitations={limitations}
          setLimitations={setLimitations}
          excerpt={excerpt}
          setExcerpt={setExcerpt}
          phase={evidencePhase}
          setPhase={setEvidencePhase}
          error={evidenceError}
          onSubmit={() => { void submitEvidence() }}
          t={t}
        />
      ) : null}
    </div>
  )
}
