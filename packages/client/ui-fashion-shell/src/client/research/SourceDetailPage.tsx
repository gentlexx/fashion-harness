/** Source detail: metadata plus Sample / text Evidence create forms. */
import { useEffect, useState } from 'react'
import { Button, Input } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ProjectId, ProjectView } from '@gentlexx/dsh-fashion-project/types'
import {
  ResearchTaskId,
  SourceId,
} from './ids.ts'
import type {
  AvailabilityStatus,
  ClaimType,
  Evidence,
  EvidenceGrade,
  Sample,
  Source,
} from '@gentlexx/dsh-fashion-research/types'
import type { FashionKey } from '../locales.ts'
import { FashionPageHeader } from '../components/FashionPageHeader.tsx'
import { StatePanel } from '../components/StatePanel.tsx'
import { LocalizedTime } from '../components/LocalizedTime.tsx'
import {
  availabilityLabel,
  sourceKindLabel,
  usageBoundaryLabel,
} from './labels.ts'
import {
  CLAIM_TYPE_OPTIONS,
  EVIDENCE_GRADE_OPTIONS,
  parseLimitationLines,
  type ResearchFormPhase,
} from './ResearchFormState.ts'
import css from '../FashionWorkspace.module.css'

export type SourceDetailPageProps = {
  readonly projectId: string
  readonly taskId: string
  readonly sourceId: string
  readonly locale: string
  readonly getProject: (projectId: string) => Promise<ProjectView>
  readonly getSource: (projectId: string, taskId: string, sourceId: ReturnType<typeof SourceId>) => Promise<Source>
  readonly updateSource: (input: {
    projectId: ProjectId
    taskId: ReturnType<typeof ResearchTaskId>
    sourceId: ReturnType<typeof SourceId>
    expectedRevision: number
    availabilityStatus: AvailabilityStatus
  }) => Promise<Source>
  readonly createSample: (input: {
    projectId: ProjectId
    taskId: ReturnType<typeof ResearchTaskId>
    sourceId: ReturnType<typeof SourceId>
    label: string
  }) => Promise<Sample>
  readonly createEvidence: (input: {
    projectId: ProjectId
    taskId: ReturnType<typeof ResearchTaskId>
    subjectType: 'source'
    subjectId: ReturnType<typeof SourceId>
    observation: string
    claim?: string | null
    claimType?: ClaimType | null
    evidenceGrade: EvidenceGrade
    method?: string | null
    limitations?: readonly string[]
    excerpt?: string | null
  }) => Promise<Evidence>
  readonly openTask: (projectId: string, taskId: string) => void
  readonly openSample: (projectId: string, taskId: string, sampleId: string) => void
  readonly openEvidence: (projectId: string, taskId: string, evidenceId: string) => void
  readonly t: (key: FashionKey) => string
}

type Load =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly source: Source; readonly readOnly: boolean }
  | { readonly status: 'not-found' }
  | { readonly status: 'error' }

/**
 * Render one Source and allow Sample / Evidence intake when editable.
 * @param props - ids, getters, create inject, navigation, translator.
 */
export function SourceDetailPage({
  projectId,
  taskId,
  sourceId,
  locale,
  getProject,
  getSource,
  updateSource,
  createSample,
  createEvidence,
  openTask,
  openSample,
  openEvidence,
  t,
}: SourceDetailPageProps) {
  const [load, setLoad] = useState<Load>({ status: 'loading' })
  const [samplePhase, setSamplePhase] = useState<ResearchFormPhase>('idle')
  const [sampleLabel, setSampleLabel] = useState('')
  const [sampleError, setSampleError] = useState<string | null>(null)
  const [evidencePhase, setEvidencePhase] = useState<ResearchFormPhase>('idle')
  const [observation, setObservation] = useState('')
  const [claim, setClaim] = useState('')
  const [claimType, setClaimType] = useState<ClaimType | ''>('')
  const [grade, setGrade] = useState<EvidenceGrade>('G1')
  const [method, setMethod] = useState('')
  const [limitations, setLimitations] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [evidenceError, setEvidenceError] = useState<string | null>(null)
  const [availability, setAvailability] = useState<AvailabilityStatus>('available')
  const [availabilityPhase, setAvailabilityPhase] = useState<ResearchFormPhase>('idle')
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoad({ status: 'loading' })
    void Promise.all([getProject(projectId), getSource(projectId, taskId, SourceId(sourceId))]).then(
      ([project, source]) => {
        if (cancelled) return
        setLoad({
          status: 'ready',
          source,
          readOnly: project.accessMode === 'read-only' || source.accessMode === 'read-only',
        })
        setAvailability(source.availabilityStatus)
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
  }, [projectId, taskId, sourceId, getProject, getSource, reloadToken])

  if (load.status === 'loading') {
    return (
      <div className={css.page} data-fashion-page="research-source-loading" aria-busy="true">
        <div className={css.skeletonHeader} />
      </div>
    )
  }

  if (load.status === 'not-found' || load.status === 'error') {
    return (
      <div className={css.page} data-fashion-page="research-source-missing">
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

  const { source, readOnly } = load

  const submitSample = async (): Promise<void> => {
    if (samplePhase === 'submitting') return
    if (sampleLabel.trim().length < 1) {
      setSampleError(t('research.createEmpty'))
      return
    }
    setSamplePhase('submitting')
    setSampleError(null)
    try {
      const sample = await createSample({
        projectId: projectId as ProjectId,
        taskId: ResearchTaskId(taskId),
        sourceId: SourceId(sourceId),
        label: sampleLabel.trim(),
      })
      openSample(projectId, taskId, String(sample.id))
    } catch {
      setSamplePhase('editing')
      setSampleError(t('research.createFailed'))
    }
  }

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
        subjectType: 'source',
        subjectId: SourceId(sourceId),
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

  const submitAvailability = async (): Promise<void> => {
    if (availabilityPhase === 'submitting') return
    setAvailabilityPhase('submitting')
    setAvailabilityError(null)
    try {
      await updateSource({
        projectId: projectId as ProjectId,
        taskId: ResearchTaskId(taskId),
        sourceId: SourceId(sourceId),
        expectedRevision: source.revision,
        availabilityStatus: availability,
      })
      setAvailabilityPhase('idle')
      setReloadToken(token => token + 1)
    } catch {
      setAvailabilityPhase('editing')
      setAvailabilityError(t('research.createFailed'))
    }
  }

  return (
    <div className={css.page} data-fashion-page="research-source">
      {readOnly ? <p className={css.banner} role="note">{t('research.readOnlyBanner')}</p> : null}
      <FashionPageHeader
        title={source.title}
        description={source.url ?? undefined}
        meta={(
          <span className={css.meta}>
            {sourceKindLabel(source.sourceKind, t)}
            {' · '}
            {t('research.accessedAt')}{' '}
            <LocalizedTime iso={source.accessedAt} locale={locale} />
          </span>
        )}
        actions={(
          <Button type="button" variant="outline" onClick={() => { openTask(projectId, taskId) }}>
            {t('research.backTask')}
          </Button>
        )}
      />

      <dl className={css.dl} data-fashion-research="source-meta">
        <div>
          <dt>{t('research.usageBoundary')}</dt>
          <dd>{usageBoundaryLabel(source.usageBoundary, t)}</dd>
        </div>
        <div>
          <dt>{t('research.availability')}</dt>
          <dd>{availabilityLabel(source.availabilityStatus, t)}</dd>
        </div>
        <div>
          <dt>{t('research.sourceAttribution')}</dt>
          <dd>{source.attribution}</dd>
        </div>
      </dl>
      <p className={css.disclaimer} data-fashion-research="availability-hint">{t('research.availabilityHint')}</p>

      {!readOnly ? (
        <>
          <section className={css.createForm} data-fashion-research="availability-form">
            <h2 className={css.sectionTitle}>{t('research.correctAvailability')}</h2>
            <label className={css.createLabel}>
              {t('research.availability')}
              <select
                className={css.formControl}
                value={availability}
                data-fashion-research="availability-status"
                disabled={availabilityPhase === 'submitting'}
                onChange={(event) => {
                  setAvailability(event.target.value as AvailabilityStatus)
                  if (availabilityPhase === 'idle') setAvailabilityPhase('editing')
                }}
              >
                <option value="available">{t('research.enum.availability.available')}</option>
                <option value="unavailable">{t('research.enum.availability.unavailable')}</option>
                <option value="removed">{t('research.enum.availability.removed')}</option>
              </select>
            </label>
            {availabilityError !== null ? <p className={css.disclaimer}>{availabilityError}</p> : null}
            <Button
              type="button"
              variant="outline"
              disabled={availabilityPhase === 'submitting'}
              onClick={() => { void submitAvailability() }}
              data-fashion-research="availability-submit"
            >
              {availabilityPhase === 'submitting' ? t('research.submitting') : t('research.availabilitySave')}
            </Button>
          </section>

          <section className={css.createForm} data-fashion-research="sample-form">
            <h2 className={css.sectionTitle}>{t('research.addSample')}</h2>
            <label className={css.createLabel}>
              {t('research.sampleLabel')}
              <Input
                value={sampleLabel}
                onChange={(event) => {
                  setSampleLabel(event.target.value)
                  if (samplePhase === 'idle') setSamplePhase('editing')
                }}
                data-fashion-research="sample-label"
                disabled={samplePhase === 'submitting'}
              />
            </label>
            {sampleError !== null ? <p className={css.disclaimer}>{sampleError}</p> : null}
            <Button
              type="button"
              variant="primary"
              disabled={samplePhase === 'submitting'}
              onClick={() => { void submitSample() }}
              data-fashion-research="sample-submit"
            >
              {samplePhase === 'submitting' ? t('research.submitting') : t('research.addSample')}
            </Button>
          </section>

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
        </>
      ) : null}
    </div>
  )
}

function EvidenceCreateForm({
  observation,
  setObservation,
  claim,
  setClaim,
  claimType,
  setClaimType,
  grade,
  setGrade,
  method,
  setMethod,
  limitations,
  setLimitations,
  excerpt,
  setExcerpt,
  phase,
  setPhase,
  error,
  onSubmit,
  t,
}: {
  observation: string
  setObservation: (value: string) => void
  claim: string
  setClaim: (value: string) => void
  claimType: ClaimType | ''
  setClaimType: (value: ClaimType | '') => void
  grade: EvidenceGrade
  setGrade: (value: EvidenceGrade) => void
  method: string
  setMethod: (value: string) => void
  limitations: string
  setLimitations: (value: string) => void
  excerpt: string
  setExcerpt: (value: string) => void
  phase: ResearchFormPhase
  setPhase: (value: ResearchFormPhase) => void
  error: string | null
  onSubmit: () => void
  t: (key: FashionKey) => string
}) {
  const markEditing = (): void => {
    if (phase === 'idle') setPhase('editing')
  }

  return (
    <section className={css.createForm} data-fashion-research="evidence-form">
      <h2 className={css.sectionTitle}>{t('research.addEvidence')}</h2>
      <label className={css.createLabel}>
        {t('research.observation')}
        <textarea
          className={css.formTextarea}
          value={observation}
          rows={3}
          onChange={(event) => {
            setObservation(event.target.value)
            markEditing()
          }}
          data-fashion-research="evidence-observation"
          disabled={phase === 'submitting'}
        />
      </label>
      <label className={css.createLabel}>
        {t('research.excerpt')}
        <textarea
          className={css.formTextarea}
          value={excerpt}
          rows={2}
          onChange={(event) => {
            setExcerpt(event.target.value)
            markEditing()
          }}
          data-fashion-research="evidence-excerpt"
          disabled={phase === 'submitting'}
        />
      </label>
      <label className={css.createLabel}>
        {t('research.claim')}
        <Input
          value={claim}
          onChange={(event) => {
            setClaim(event.target.value)
            markEditing()
          }}
          data-fashion-research="evidence-claim"
          disabled={phase === 'submitting'}
        />
      </label>
      <label className={css.createLabel}>
        {t('research.claimType')}
        <select
          className={css.formControl}
          value={claimType}
          onChange={(event) => {
            setClaimType(event.target.value as ClaimType | '')
            markEditing()
          }}
          data-fashion-research="evidence-claim-type"
          disabled={phase === 'submitting'}
        >
          <option value="">—</option>
          {CLAIM_TYPE_OPTIONS.map(option => (
            <option key={option} value={option}>
              {t(
                option === 'observed' ? 'claim.observed'
                  : option === 'derived' ? 'claim.derived'
                    : 'claim.needs_validation',
              )}
            </option>
          ))}
        </select>
      </label>
      <label className={css.createLabel}>
        {t('research.grade')}
        <select
          className={css.formControl}
          value={grade}
          onChange={(event) => {
            setGrade(event.target.value as EvidenceGrade)
            markEditing()
          }}
          data-fashion-research="evidence-grade"
          disabled={phase === 'submitting'}
        >
          {EVIDENCE_GRADE_OPTIONS.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </label>
      <label className={css.createLabel}>
        {t('research.method')}
        <Input
          value={method}
          onChange={(event) => {
            setMethod(event.target.value)
            markEditing()
          }}
          data-fashion-research="evidence-method"
          disabled={phase === 'submitting'}
        />
      </label>
      <label className={css.createLabel}>
        {t('research.limitations')}
        <textarea
          className={css.formTextarea}
          value={limitations}
          rows={2}
          onChange={(event) => {
            setLimitations(event.target.value)
            markEditing()
          }}
          data-fashion-research="evidence-limitations"
          disabled={phase === 'submitting'}
        />
      </label>
      {error !== null ? <p className={css.disclaimer}>{error}</p> : null}
      <Button
        type="button"
        variant="primary"
        disabled={phase === 'submitting'}
        onClick={onSubmit}
        data-fashion-research="evidence-submit"
      >
        {phase === 'submitting' ? t('research.submitting') : t('research.addEvidence')}
      </Button>
    </section>
  )
}

export { EvidenceCreateForm }
