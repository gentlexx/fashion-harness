/** Feedback and outcome pages. Writes go through Host Remote. Actor kind is not a field. */
import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { ProjectView } from '@gentlexx/dsh-fashion-project/types'
import type { DesignDeliverable } from '@gentlexx/dsh-fashion-design/types'
import type {
  DesignerFeedback,
  DevelopmentEvent,
  FeedbackAction,
  FeedbackDataReality,
  FeedbackReasonCode,
  FeedbackVisibility,
  DevelopmentStage,
  OutcomeAvailability,
  OutcomeAvailabilityState,
  OutcomeMetricObservation,
  ProfessionalValidity,
  RevisionEffort,
  TimeSavedEstimate,
} from '@gentlexx/dsh-fashion-feedback/types'
import type { FashionKey } from '../locales.ts'
import type { DeliverableFollowUpRef } from '../routes.ts'
import { FashionPageHeader } from '../components/FashionPageHeader.tsx'
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import { formText } from '../form-text.ts'
import { randomUUID } from '@deepseek-ai/dsh-util-crypto'

/** Selection value while the project has no deliverable to attach feedback to; submission rejects it. */
const NO_DELIVERABLE = ''

const ACTIONS: readonly FeedbackAction[] = ['adopted', 'modified', 'rejected', 'ignored', 'needs_follow_up', 'unable_to_assess']
const REASONS = ['evidence_useful', 'evidence_missing', 'other'] as const satisfies readonly FeedbackReasonCode[]
const VALIDITY: readonly ProfessionalValidity[] = ['valid', 'partly_valid', 'invalid', 'unknown']
const EFFORT: readonly RevisionEffort[] = ['none', 'light', 'moderate', 'heavy', 'unknown']
const TIME: readonly TimeSavedEstimate[] = ['not_estimated', 'none', 'under_15m', 'm15_to_30', 'm30_to_60', 'over_60m']
const REALITY = ['user_test', 'real_work', 'recorded_demo'] as const satisfies readonly FeedbackDataReality[]
const VISIBILITY = ['project_private', 'internal_demo', 'view_only'] as const satisfies readonly FeedbackVisibility[]
const AVAILABILITY: readonly OutcomeAvailabilityState[] = ['not_yet_observed', 'not_available', 'not_authorized', 'available_partial', 'available']
const STAGES: readonly DevelopmentStage[] = ['handed_off', 'sampled', 'revised_after_sample', 'produced', 'listed', 'selling', 'closed', 'stopped']

const SUBJECT_LABELS: Record<DesignerFeedback['subjectRef']['subjectType'], FashionKey> = {
  deliverable: 'feedback.enum.subject.deliverable',
  concept: 'feedback.enum.subject.concept',
  brief: 'feedback.enum.subject.brief',
  opportunity: 'feedback.enum.subject.opportunity',
  evidence: 'feedback.enum.subject.evidence',
  workflow_step: 'feedback.enum.subject.workflowStep',
}
const SUBJECT_REVISION_LABELS: Record<DesignerFeedback['subjectRef']['subjectType'], FashionKey> = {
  deliverable: 'deliverable.revision',
  concept: 'feedback.revision.concept',
  brief: 'feedback.revision.brief',
  opportunity: 'feedback.revision.opportunity',
  evidence: 'feedback.revision.evidence',
  workflow_step: 'feedback.revision.workflowStep',
}
const ACTION_LABELS: Record<FeedbackAction, FashionKey> = {
  adopted: 'feedback.enum.action.adopted',
  modified: 'feedback.enum.action.modified',
  rejected: 'feedback.enum.action.rejected',
  ignored: 'feedback.enum.action.ignored',
  needs_follow_up: 'feedback.enum.action.needsFollowUp',
  unable_to_assess: 'feedback.enum.action.unableToAssess',
}
const REASON_LABELS: Record<(typeof REASONS)[number], FashionKey> = {
  evidence_useful: 'feedback.enum.reason.evidenceUseful',
  evidence_missing: 'feedback.enum.reason.evidenceMissing',
  other: 'feedback.enum.reason.other',
}
const VALIDITY_LABELS: Record<ProfessionalValidity, FashionKey> = {
  valid: 'feedback.enum.validity.valid',
  partly_valid: 'feedback.enum.validity.partlyValid',
  invalid: 'feedback.enum.validity.invalid',
  unknown: 'feedback.enum.validity.unknown',
}
const EFFORT_LABELS: Record<RevisionEffort, FashionKey> = {
  none: 'feedback.enum.effort.none',
  light: 'feedback.enum.effort.light',
  moderate: 'feedback.enum.effort.moderate',
  heavy: 'feedback.enum.effort.heavy',
  unknown: 'feedback.enum.effort.unknown',
}
const TIME_LABELS: Record<TimeSavedEstimate, FashionKey> = {
  not_estimated: 'feedback.enum.time.notEstimated',
  none: 'feedback.enum.time.none',
  under_15m: 'feedback.enum.time.under15m',
  m15_to_30: 'feedback.enum.time.m15to30',
  m30_to_60: 'feedback.enum.time.m30to60',
  over_60m: 'feedback.enum.time.over60m',
}
const REALITY_LABELS: Record<(typeof REALITY)[number], FashionKey> = {
  user_test: 'feedback.enum.reality.userTest',
  real_work: 'feedback.enum.reality.realWork',
  recorded_demo: 'feedback.enum.reality.recordedDemo',
}
const VISIBILITY_LABELS: Record<(typeof VISIBILITY)[number], FashionKey> = {
  project_private: 'feedback.enum.visibility.projectPrivate',
  internal_demo: 'feedback.enum.visibility.internalDemo',
  view_only: 'feedback.enum.visibility.viewOnly',
}
const AVAILABILITY_LABELS: Record<OutcomeAvailabilityState, FashionKey> = {
  not_yet_observed: 'outcomes.enum.availability.notYetObserved',
  not_available: 'outcomes.enum.availability.notAvailable',
  not_authorized: 'outcomes.enum.availability.notAuthorized',
  available_partial: 'outcomes.enum.availability.availablePartial',
  available: 'outcomes.enum.availability.available',
}
const STAGE_LABELS: Record<DevelopmentStage, FashionKey> = {
  handed_off: 'outcomes.enum.stage.handedOff',
  sampled: 'outcomes.enum.stage.sampled',
  revised_after_sample: 'outcomes.enum.stage.revisedAfterSample',
  produced: 'outcomes.enum.stage.produced',
  listed: 'outcomes.enum.stage.listed',
  selling: 'outcomes.enum.stage.selling',
  closed: 'outcomes.enum.stage.closed',
  stopped: 'outcomes.enum.stage.stopped',
}

function metricValueText(value: OutcomeMetricObservation['value'], t: (key: FashionKey) => string): string {
  switch (value.kind) {
    case 'integer': return String(value.value)
    case 'decimal_string': return value.value
    case 'ratio': return `${value.numerator} / ${value.denominator}`
    case 'unavailable': return t('outcomes.unavailable')
  }
}

function prependUnique<T extends { readonly id: unknown }>(written: T, rows: readonly T[]): readonly T[] {
  return [written, ...rows.filter(row => String(row.id) !== String(written.id))]
}

function deliverableOptionLabel(row: DesignDeliverable, t: (key: FashionKey) => string): string {
  return `${t('deliverable.package')} · ${t('deliverable.revision')} ${row.revision}`
}

function writableSubject(
  ref: DesignerFeedback['subjectRef'],
): Pick<FeedbackWrite, 'subjectType' | 'subjectId' | 'subjectRevision'> | undefined {
  switch (ref.subjectType) {
    case 'deliverable':
    case 'concept':
    case 'brief':
      return { subjectType: ref.subjectType, subjectId: ref.subjectId, subjectRevision: ref.subjectRevision }
    case 'opportunity':
    case 'evidence':
    case 'workflow_step':
      return undefined
  }
}

type FollowUpNotice = 'none' | 'missing' | 'stale'

function followUpNotice(
  ref: DeliverableFollowUpRef | undefined,
  loaded: boolean,
  deliverables: readonly DesignDeliverable[],
): FollowUpNotice {
  if (ref === undefined || !loaded) return 'none'
  const record = deliverables.find(row => String(row.id) === ref.deliverableId)
  if (record === undefined) return 'missing'
  return record.revision === ref.deliverableRevision
    && String(record.selectedConceptRef.id) === ref.conceptId
    && record.selectedConceptRef.revision === ref.conceptRevision
    ? 'none'
    : 'stale'
}

export type FeedbackWrite = {
  projectId: string
  subjectType: 'brief' | 'concept' | 'deliverable'
  subjectId: string
  subjectRevision: number
  action: FeedbackAction
  reasonCode: FeedbackReasonCode
  reasonText: string
  modificationArea: string
  modificationSummary: string
  professionalValidity: ProfessionalValidity
  revisionEffort: RevisionEffort
  timeSavedEstimate: TimeSavedEstimate
  followUpNeeded: boolean
  dataReality: FeedbackDataReality
  visibility: FeedbackVisibility
  supersedesId: string | null
  expectedHeadId: string | null
  correctionReason: string | null
  /** One key per form draft; the Host returns the existing record when the same draft is submitted again. */
  idempotencyKey: string
}

export type DevelopmentWrite = {
  projectId: string
  deliverableId: string
  deliverableRevision: number
  conceptId: string
  conceptRevision: number
  stage: DevelopmentStage
  occurredAt: string
  businessContext: string
  limitations: string
  dataReality: FeedbackDataReality
  idempotencyKey: string
}

export type MetricWrite = {
  projectId: string
  deliverableId: string
  deliverableRevision: number
  conceptId: string
  conceptRevision: number
  metricKey: string
  definitionVersion: string
  unavailable: boolean
  integerValue: number | null
  windowStart: string
  windowEnd: string
  region: string
  channel: string
  limitations: string
  dataReality: FeedbackDataReality
  idempotencyKey: string
}

export type AvailabilityWrite = {
  projectId: string
  deliverableId: string
  deliverableRevision: number
  conceptId: string
  conceptRevision: number
  availability: OutcomeAvailabilityState
  reasonCode: string
  asOf: string
  dataReality: FeedbackDataReality
  idempotencyKey: string
}

export type FeedbackPagesProps = {
  readonly projectId: string
  readonly feedbackId?: string | undefined
  readonly followUpRef?: DeliverableFollowUpRef | undefined
  readonly mode: 'list' | 'new' | 'outcomes'
  readonly getProject: (projectId: string) => Promise<ProjectView | undefined>
  readonly listDeliverables: (projectId: string) => Promise<readonly DesignDeliverable[]>
  readonly listFeedback: (projectId: string) => Promise<readonly DesignerFeedback[]>
  readonly listAvailability: (projectId: string) => Promise<readonly OutcomeAvailability[]>
  readonly listDevelopment: (projectId: string) => Promise<readonly DevelopmentEvent[]>
  readonly listMetrics: (projectId: string) => Promise<readonly OutcomeMetricObservation[]>
  readonly recordFeedback: (input: FeedbackWrite) => Promise<DesignerFeedback>
  readonly recordAvailability: (input: AvailabilityWrite) => Promise<OutcomeAvailability>
  readonly recordDevelopment: (input: DevelopmentWrite) => Promise<DevelopmentEvent>
  readonly recordMetric: (input: MetricWrite) => Promise<OutcomeMetricObservation>
  readonly openFeedbackNew: (projectId: string) => void
  readonly openFeedbackDetail: (projectId: string, feedbackId: string) => void
  readonly openOverview: (projectId: string) => void
  readonly t: (key: FashionKey) => string
}

type SubmitState = 'idle' | 'invalid' | 'submitting' | 'success' | 'conflict' | 'error'
type FormKind = 'feedback' | 'availability' | 'development' | 'metric'
type SubmitStates = Readonly<Record<FormKind, SubmitState>>
type DraftKeys = Readonly<Record<FormKind, string>>

const IDLE_STATES: SubmitStates = { feedback: 'idle', availability: 'idle', development: 'idle', metric: 'idle' }

function mintDraftKeys(): DraftKeys {
  return {
    feedback: randomUUID(),
    availability: randomUUID(),
    development: randomUUID(),
    metric: randomUUID(),
  }
}

function FormStatus(props: { state: SubmitState; successKey: FashionKey; t: (key: FashionKey) => string }) {
  const { state, successKey, t } = props
  switch (state) {
    case 'idle': return null
    case 'invalid': return <p role="alert">{t('feedback.validation')}</p>
    case 'submitting': return <p role="status">{t('feedback.submitting')}</p>
    case 'success': return <p role="status">{t(successKey)}</p>
    case 'conflict': return <p role="alert">{t('feedback.conflict')}</p>
    case 'error': return <p role="alert">{t('feedback.error')}</p>
  }
}

/**
 * Show and record feedback or outcome availability. R0 stays read-only.
 * @param props - project scope and Host commands.
 */
export function FeedbackPages(props: FeedbackPagesProps) {
  const {
    projectId, feedbackId, followUpRef, mode, getProject, listDeliverables, listFeedback, listAvailability, listDevelopment, listMetrics,
    recordFeedback, recordAvailability, recordDevelopment, recordMetric, openFeedbackNew, openFeedbackDetail, openOverview, t,
  } = props
  const [project, setProject] = useState<ProjectView | undefined>()
  const [deliverables, setDeliverables] = useState<readonly DesignDeliverable[]>([])
  const [selectedDeliverableId, setSelectedDeliverableId] = useState(followUpRef === undefined ? NO_DELIVERABLE : followUpRef.deliverableId)
  const [feedback, setFeedback] = useState<readonly DesignerFeedback[]>([])
  const [availability, setAvailability] = useState<readonly OutcomeAvailability[]>([])
  const [events, setEvents] = useState<readonly DevelopmentEvent[]>([])
  const [metrics, setMetrics] = useState<readonly OutcomeMetricObservation[]>([])
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [submitStates, setSubmitStates] = useState<SubmitStates>(IDLE_STATES)
  const [draftKeys, setDraftKeys] = useState<DraftKeys>(mintDraftKeys)
  // React state lags a second click by one render; this set closes that window synchronously.
  const inFlight = useRef(new Set<FormKind>())
  const [correcting, setCorrecting] = useState(false)

  useEffect(() => {
    let cancelled = false
    void Promise.all([
      getProject(projectId),
      listDeliverables(projectId),
      listFeedback(projectId),
      listAvailability(projectId),
      listDevelopment(projectId),
      listMetrics(projectId),
    ]).then(([nextProject, nextDeliverables, nextFeedback, nextAvailability, nextEvents, nextMetrics]) => {
      if (cancelled) return
      setProject(nextProject)
      setDeliverables(nextDeliverables)
      setSelectedDeliverableId((current) => {
        const preferred = followUpRef === undefined ? current : followUpRef.deliverableId
        if (nextDeliverables.some(row => String(row.id) === preferred)) return preferred
        const first = nextDeliverables[0]
        return first === undefined ? NO_DELIVERABLE : String(first.id)
      })
      setFeedback(nextFeedback)
      setAvailability(nextAvailability)
      setEvents(nextEvents)
      setMetrics(nextMetrics)
      setLoaded(true)
    }).catch(() => {
      if (!cancelled) setError(true)
    })
    return () => {
      cancelled = true
    }
  }, [followUpRef?.deliverableId, getProject, listAvailability, listDeliverables, listDevelopment, listFeedback, listMetrics, projectId])

  const recorded = project?.origin === 'public-rebuild'
  // Write forms wait for the project read so a read-only project never shows them, even before it loads.
  const writable = project !== undefined && project.accessMode !== 'read-only'
  const current = feedbackId === undefined ? undefined : feedback.find(row => String(row.id) === feedbackId)
  const selectedDeliverable = deliverables.find(row => String(row.id) === selectedDeliverableId)
  const notice = followUpNotice(followUpRef, loaded, deliverables)
  const history = current === undefined ? [] : feedback.filter(row =>
    row.subjectRef.subjectId === current.subjectRef.subjectId && String(row.id) !== String(current.id))

  function setFormState(kind: FormKind, state: SubmitState) {
    setSubmitStates(states => ({ ...states, [kind]: state }))
  }

  function acceptsSubmit(kind: FormKind): boolean {
    return writable && !inFlight.current.has(kind)
  }

  /** Sends one draft once; a failed draft keeps its key so a retry cannot add a second record. */
  async function submitOnce<T>(kind: FormKind, write: (idempotencyKey: string) => Promise<T>, onWritten: (row: T) => void) {
    inFlight.current.add(kind)
    setFormState(kind, 'submitting')
    try {
      onWritten(await write(draftKeys[kind]))
      setFormState(kind, 'success')
      setDraftKeys(keys => ({ ...keys, [kind]: randomUUID() }))
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : ''
      setFormState(kind, /conflict/i.test(message) ? 'conflict' : 'error')
    } finally {
      inFlight.current.delete(kind)
    }
  }

  function onFeedbackSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!acceptsSubmit('feedback')) return
    const data = new FormData(event.currentTarget)
    const subject = correcting && current !== undefined
      ? writableSubject(current.subjectRef)
      : selectedDeliverable === undefined
        ? undefined
        : {
          subjectType: 'deliverable' as const,
          subjectId: String(selectedDeliverable.id),
          subjectRevision: selectedDeliverable.revision,
        }
    const reasonText = formText(data, 'reasonText').trim()
    const correctionReason = formText(data, 'correctionReason').trim()
    const actionText = formText(data, 'action')
    const action = ACTIONS.find(value => value === actionText)
    if (subject === undefined || action === undefined || reasonText === '') {
      setFormState('feedback', 'invalid')
      return
    }
    if (correcting && correctionReason === '') {
      setFormState('feedback', 'invalid')
      return
    }
    void submitOnce(
      'feedback',
      idempotencyKey => recordFeedback({
        projectId,
        subjectType: subject.subjectType,
        subjectId: subject.subjectId,
        subjectRevision: subject.subjectRevision,
        action,
        reasonCode: String(data.get('reasonCode')) as FeedbackReasonCode,
        reasonText,
        modificationArea: formText(data, 'modificationArea'),
        modificationSummary: formText(data, 'modificationSummary'),
        professionalValidity: String(data.get('professionalValidity')) as ProfessionalValidity,
        revisionEffort: String(data.get('revisionEffort')) as RevisionEffort,
        timeSavedEstimate: String(data.get('timeSaved')) as TimeSavedEstimate,
        followUpNeeded: data.get('followUp') === 'on',
        dataReality: String(data.get('dataReality')) as FeedbackDataReality,
        visibility: String(data.get('visibility')) as FeedbackVisibility,
        supersedesId: correcting && current !== undefined ? String(current.id) : null,
        expectedHeadId: correcting && current !== undefined ? String(current.id) : null,
        correctionReason: correcting ? correctionReason : null,
        idempotencyKey,
      }),
      (written) => {
        setFeedback(rows => prependUnique(written, rows))
        setCorrecting(false)
      },
    )
  }

  function onAvailabilitySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!acceptsSubmit('availability')) return
    const data = new FormData(event.currentTarget)
    const refs = readRefs()
    const reasonCode = formText(data, 'reasonCode').trim()
    const asOf = formText(data, 'asOf').trim()
    if (refs === null || reasonCode === '' || asOf === '') {
      setFormState('availability', 'invalid')
      return
    }
    void submitOnce(
      'availability',
      idempotencyKey => recordAvailability({
        projectId,
        ...refs,
        availability: String(data.get('availability')) as OutcomeAvailabilityState,
        reasonCode,
        asOf,
        dataReality: String(data.get('dataReality')) as FeedbackDataReality,
        idempotencyKey,
      }),
      (written) => { setAvailability(rows => prependUnique(written, rows)) },
    )
  }

  function readRefs() {
    if (selectedDeliverable === undefined) return null
    return {
      deliverableId: String(selectedDeliverable.id),
      deliverableRevision: selectedDeliverable.revision,
      conceptId: selectedDeliverable.selectedConceptRef.id,
      conceptRevision: selectedDeliverable.selectedConceptRef.revision,
    }
  }

  function onDevelopmentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!acceptsSubmit('development')) return
    const data = new FormData(event.currentTarget)
    const refs = readRefs()
    const occurredAt = formText(data, 'occurredAt').trim()
    const businessContext = formText(data, 'businessContext').trim()
    const limitations = formText(data, 'limitations').trim()
    if (refs === null || occurredAt === '' || businessContext === '' || limitations === '') {
      setFormState('development', 'invalid')
      return
    }
    void submitOnce(
      'development',
      idempotencyKey => recordDevelopment({
        projectId,
        ...refs,
        stage: String(data.get('stage')) as DevelopmentStage,
        occurredAt,
        businessContext,
        limitations,
        dataReality: String(data.get('dataReality')) as FeedbackDataReality,
        idempotencyKey,
      }),
      (written) => { setEvents(rows => prependUnique(written, rows)) },
    )
  }

  function onMetricSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!acceptsSubmit('metric')) return
    const data = new FormData(event.currentTarget)
    const refs = readRefs()
    const metricKey = formText(data, 'metricKey').trim()
    const definitionVersion = formText(data, 'definitionVersion').trim()
    const windowStart = formText(data, 'windowStart').trim()
    const windowEnd = formText(data, 'windowEnd').trim()
    const region = formText(data, 'region').trim()
    const channel = formText(data, 'channel').trim()
    const limitations = formText(data, 'limitations').trim()
    const unavailable = data.get('unavailable') === 'on'
    const rawValue = formText(data, 'integerValue').trim()
    const integerValue = rawValue === '' ? null : Number(rawValue)
    if (refs === null || metricKey === '' || definitionVersion === '' || windowStart === '' || windowEnd === ''
      || region === '' || channel === '' || limitations === '' || windowStart >= windowEnd) {
      setFormState('metric', 'invalid')
      return
    }
    if (!unavailable && (integerValue === null || !Number.isInteger(integerValue) || integerValue === 0)) {
      setFormState('metric', 'invalid')
      return
    }
    void submitOnce(
      'metric',
      idempotencyKey => recordMetric({
        projectId,
        ...refs,
        metricKey,
        definitionVersion,
        unavailable,
        integerValue: unavailable ? null : integerValue,
        windowStart,
        windowEnd,
        region,
        channel,
        limitations,
        dataReality: String(data.get('dataReality')) as FeedbackDataReality,
        idempotencyKey,
      }),
      (written) => { setMetrics(rows => prependUnique(written, rows)) },
    )
  }

  return (
    <section data-fashion-page={mode === 'outcomes' ? 'outcomes' : 'feedback'}>
      <FashionPageHeader
        title={mode === 'outcomes' ? t('outcomes.homeTitle') : t('feedback.homeTitle')}
        description={recorded ? t('feedback.r0Banner') : undefined}
      />
      {error ? <p role="alert">{t('research.loadError')}</p> : null}
      {recorded ? <p data-fashion-feedback-r0 role="status">{t('feedback.readOnly')}</p> : null}
      {notice === 'missing' ? <p data-fashion-follow-up-notice="missing" role="alert">{t('feedback.followUpMissing')}</p> : null}
      {notice === 'stale' ? <p data-fashion-follow-up-notice="stale" role="alert">{t('feedback.followUpStale')}</p> : null}
      {mode !== 'outcomes' ? <FormStatus state={submitStates.feedback} successKey="feedback.success" t={t} /> : null}
      {mode !== 'outcomes' && feedback.length === 0 ? <p>{t('feedback.empty')}</p> : null}
      {mode !== 'outcomes' ? (
        <ul>
          {feedback.map(row => (
            <li key={String(row.id)} data-fashion-feedback-action={row.action} data-fashion-feedback-reality={row.dataReality}>
              <button type="button" onClick={() => openFeedbackDetail(projectId, String(row.id))}>
                {t(SUBJECT_LABELS[row.subjectRef.subjectType])}
                {' · '}
                {t(SUBJECT_REVISION_LABELS[row.subjectRef.subjectType])}{t('common.labelSeparator')}{row.subjectRef.subjectRevision}
                {' · '}
                {t(ACTION_LABELS[row.action])}
              </button>
              {row.timeSavedEstimate !== null ? <span>{t('feedback.subjective')}</span> : null}
              {row.supersedesId !== null ? <span data-fashion-supersedes={row.supersedesId}>{t('feedback.supersedes')}</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
      {current !== undefined ? (
        <div data-fashion-feedback-detail={String(current.id)}>
          <p>
            {t('feedback.exactTarget')}{t('common.labelSeparator')}{t(SUBJECT_LABELS[current.subjectRef.subjectType])}
            {' · '}
            {t(SUBJECT_REVISION_LABELS[current.subjectRef.subjectType])}{t('common.labelSeparator')}{current.subjectRef.subjectRevision}
          </p>
          {history.length > 0 ? (
            <ul data-fashion-feedback-history>
              {history.map(row => (
                <li key={String(row.id)}>
                  {t(ACTION_LABELS[row.action])} · {t(SUBJECT_REVISION_LABELS[row.subjectRef.subjectType])}{t('common.labelSeparator')}{row.subjectRef.subjectRevision}
                </li>
              ))}
            </ul>
          ) : null}
          <Button type="button" onClick={() => setCorrecting(true)} disabled={!writable}>{t('feedback.correct')}</Button>
        </div>
      ) : null}
      {writable && (mode === 'new' || correcting) ? (
        <form key={draftKeys.feedback} data-fashion-feedback-form onSubmit={onFeedbackSubmit}>
          <p>{t('feedback.formTitle')}</p>
          {correcting && current !== undefined ? (
            <p>
              {t('feedback.exactTarget')}{t('common.labelSeparator')}{t(SUBJECT_LABELS[current.subjectRef.subjectType])}
              {' · '}
              {t(SUBJECT_REVISION_LABELS[current.subjectRef.subjectType])}{t('common.labelSeparator')}{current.subjectRef.subjectRevision}
            </p>
          ) : (
            <label>{t('feedback.targetDeliverable')}
              <select
                name="subjectId"
                value={selectedDeliverableId}
                data-fashion-feedback-target
                onChange={(event) => { setSelectedDeliverableId(event.target.value) }}
              >
                {deliverables.map(row => (
                  <option key={String(row.id)} value={String(row.id)}>{deliverableOptionLabel(row, t)}</option>
                ))}
              </select>
            </label>
          )}
          {selectedDeliverable !== undefined && !correcting ? (
            <p data-fashion-follow-up-revision={selectedDeliverable.revision}>
              {t('deliverable.revision')}{t('common.labelSeparator')}{selectedDeliverable.revision}
              {' · '}
              {t('feedback.conceptRevision')}{t('common.labelSeparator')}{selectedDeliverable.selectedConceptRef.revision}
            </p>
          ) : null}
          <label>{t('feedback.action')}
            <select
              name="action"
              data-fashion-feedback-action-select
              defaultValue={correcting && current !== undefined ? current.action : ''}
            >
              <option value="" disabled>{t('feedback.chooseAction')}</option>
              {ACTIONS.map(value => <option key={value} value={value}>{t(ACTION_LABELS[value])}</option>)}
            </select>
          </label>
          <label>{t('feedback.reasonCode')}
            <select name="reasonCode" defaultValue="other">
              {REASONS.map(value => <option key={value} value={value}>{t(REASON_LABELS[value])}</option>)}
            </select>
          </label>
          <label>{t('feedback.reasonText')}<input name="reasonText" /></label>
          <label>{t('feedback.modificationArea')}<input name="modificationArea" /></label>
          <label>{t('feedback.modificationSummary')}<input name="modificationSummary" /></label>
          <label>{t('feedback.professionalValidity')}
            <select name="professionalValidity" defaultValue="unknown">
              {VALIDITY.map(value => <option key={value} value={value}>{t(VALIDITY_LABELS[value])}</option>)}
            </select>
          </label>
          <label>{t('feedback.revisionEffort')}
            <select name="revisionEffort" defaultValue="unknown">
              {EFFORT.map(value => <option key={value} value={value}>{t(EFFORT_LABELS[value])}</option>)}
            </select>
          </label>
          <label>{t('feedback.timeSaved')}
            <select name="timeSaved" defaultValue="not_estimated">
              {TIME.map(value => <option key={value} value={value}>{t(TIME_LABELS[value])}</option>)}
            </select>
          </label>
          <label>{t('feedback.followUp')}<input name="followUp" type="checkbox" /></label>
          <label>{t('feedback.dataReality')}
            <select name="dataReality" defaultValue="user_test">
              {REALITY.map(value => <option key={value} value={value}>{t(REALITY_LABELS[value])}</option>)}
            </select>
          </label>
          <label>{t('feedback.visibility')}
            <select name="visibility" defaultValue="project_private">
              {VISIBILITY.map(value => <option key={value} value={value}>{t(VISIBILITY_LABELS[value])}</option>)}
            </select>
          </label>
          {correcting ? <label>{t('feedback.correctionReason')}<input name="correctionReason" /></label> : null}
          <Button type="submit" disabled={submitStates.feedback === 'submitting'}>{t('feedback.submit')}</Button>
        </form>
      ) : null}
      {mode === 'outcomes' ? (
        <div>
          <p>{t('outcomes.noZero')}</p>
          {availability.length === 0 ? <p>{t('outcomes.notAvailable')}</p> : null}
          <ul>
            {availability.map(row => (
              <li key={String(row.id)} data-fashion-availability={row.availability} data-fashion-availability-reality={row.dataReality}>
                {t(AVAILABILITY_LABELS[row.availability])}
                {row.availability === 'not_available' || row.availability === 'not_yet_observed' || row.availability === 'not_authorized'
                  ? <span>{' · '}{t('outcomes.notAvailable')}</span> : null}
              </li>
            ))}
          </ul>
          <ul data-fashion-development>
            {events.map(row => <li key={String(row.id)} data-fashion-stage={row.stage}>{t(STAGE_LABELS[row.stage])}</li>)}
          </ul>
          <ul data-fashion-metrics>
            {metrics.map(row => (
              <li key={String(row.id)} data-fashion-metric-kind={row.value.kind}>
                {row.metricDefinitionRef.metricKey}{t('common.labelSeparator')}{metricValueText(row.value, t)}
              </li>
            ))}
          </ul>
          {writable ? (
            <>
              <label>{t('feedback.targetDeliverable')}
                <select
                  value={selectedDeliverableId}
                  data-fashion-outcome-target
                  onChange={(event) => { setSelectedDeliverableId(event.target.value) }}
                >
                  {deliverables.map(row => (
                    <option key={String(row.id)} value={String(row.id)}>{deliverableOptionLabel(row, t)}</option>
                  ))}
                </select>
              </label>
              {selectedDeliverable !== undefined ? (
                <p data-fashion-follow-up-revision={selectedDeliverable.revision}>
                  {t('deliverable.revision')}{t('common.labelSeparator')}{selectedDeliverable.revision}
                  {' · '}
                  {t('feedback.conceptRevision')}{t('common.labelSeparator')}{selectedDeliverable.selectedConceptRef.revision}
                </p>
              ) : null}
              <form
                key={draftKeys.availability}
                data-fashion-availability-form
                aria-label={t('outcomes.availabilityForm')}
                onSubmit={onAvailabilitySubmit}
              >
                <label>{t('outcomes.availability')}
                  <select name="availability" defaultValue="not_yet_observed">
                    {AVAILABILITY.map(value => <option key={value} value={value}>{t(AVAILABILITY_LABELS[value])}</option>)}
                  </select>
                </label>
                <label>{t('outcomes.reason')}<input name="reasonCode" /></label>
                <label>{t('outcomes.asOf')}<input name="asOf" /></label>
                <label>{t('feedback.dataReality')}
                  <select name="dataReality" defaultValue="user_test">
                    {REALITY.map(value => <option key={value} value={value}>{t(REALITY_LABELS[value])}</option>)}
                  </select>
                </label>
                <FormStatus state={submitStates.availability} successKey="outcomes.success" t={t} />
                <Button type="submit" disabled={submitStates.availability === 'submitting'}>{t('outcomes.submitAvailability')}</Button>
              </form>
              <form
                key={draftKeys.development}
                data-fashion-development-form
                aria-label={t('outcomes.developmentForm')}
                onSubmit={onDevelopmentSubmit}
              >
                <label>{t('outcomes.stage')}
                  <select name="stage" defaultValue="handed_off">
                    {STAGES.map(value => <option key={value} value={value}>{t(STAGE_LABELS[value])}</option>)}
                  </select>
                </label>
                <label>{t('outcomes.asOf')}<input name="occurredAt" /></label>
                <label>{t('outcomes.context')}<input name="businessContext" /></label>
                <label>{t('outcomes.limitations')}<input name="limitations" /></label>
                <label>{t('feedback.dataReality')}
                  <select name="dataReality" defaultValue="user_test">
                    {REALITY.map(value => <option key={value} value={value}>{t(REALITY_LABELS[value])}</option>)}
                  </select>
                </label>
                <FormStatus state={submitStates.development} successKey="outcomes.success" t={t} />
                <Button type="submit" disabled={submitStates.development === 'submitting'}>{t('outcomes.submitDevelopment')}</Button>
              </form>
              <form
                key={draftKeys.metric}
                data-fashion-metric-form
                aria-label={t('outcomes.metricForm')}
                onSubmit={onMetricSubmit}
              >
                <label>{t('outcomes.metricKey')}<input name="metricKey" /></label>
                <label>{t('outcomes.revision')}<input name="definitionVersion" /></label>
                <label>{t('outcomes.unavailable')}<input name="unavailable" type="checkbox" defaultChecked /></label>
                <label>{t('outcomes.metricValue')}<input name="integerValue" /></label>
                <label>{t('outcomes.windowStart')}<input name="windowStart" /></label>
                <label>{t('outcomes.windowEnd')}<input name="windowEnd" /></label>
                <label>{t('outcomes.region')}<input name="region" /></label>
                <label>{t('outcomes.channel')}<input name="channel" /></label>
                <label>{t('outcomes.limitations')}<input name="limitations" /></label>
                <label>{t('feedback.dataReality')}
                  <select name="dataReality" defaultValue="user_test">
                    {REALITY.map(value => <option key={value} value={value}>{t(REALITY_LABELS[value])}</option>)}
                  </select>
                </label>
                <FormStatus state={submitStates.metric} successKey="outcomes.success" t={t} />
                <Button type="submit" disabled={submitStates.metric === 'submitting'}>{t('outcomes.submitMetric')}</Button>
              </form>
            </>
          ) : null}
        </div>
      ) : null}
      {writable ? <Button type="button" onClick={() => openFeedbackNew(projectId)}>{t('overview.openFeedback')}</Button> : null}
      <Button type="button" onClick={() => openOverview(projectId)}>{t('overview.back')}</Button>
    </section>
  )
}
