/** Review rounds and deliverable export workspace (F3-02). */
import { useEffect, useState } from 'react'
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ProjectView } from '@gentlexx/dsh-fashion-project/types'
import type {
  ApprovalValidity,
  ConceptSet,
  DesignConcept,
  DesignDeliverable,
  ExportArtifactView,
  ReviewRound,
} from '@gentlexx/dsh-fashion-design/types'
import { R0_CONCEPT_CROPPED_ID } from './ids.ts'
import type { FashionKey } from '../locales.ts'
import { R0_PROJECT_ID, type DeliverableFollowUpRef } from '../routes.ts'
import { R0_DELIVERABLE_ID, R0_REVIEW_ROUND_ID } from './ids.ts'
import { FashionPageHeader } from '../components/FashionPageHeader.tsx'
import { LocalizedTime } from '../components/LocalizedTime.tsx'
import { StatePanel } from '../components/StatePanel.tsx'
import css from '../FashionWorkspace.module.css'

const DEFAULT_SELECT_REASON = ['originality', 'silhouette_or_proportion'] as const
const DEFAULT_APPROVE_REASON = ['evidence_sufficient'] as const

const ARTIFACT_KIND_LABELS: Readonly<Record<ExportArtifactView['kind'], FashionKey>> = {
  json: 'deliverable.kindJson',
  markdown: 'deliverable.kindMarkdown',
  manifest: 'deliverable.kindManifest',
}

function isArtifactKind(kind: string): kind is ExportArtifactView['kind'] {
  return kind === 'json' || kind === 'markdown' || kind === 'manifest'
}

type LoadGate<T> =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly project: ProjectView; readonly value: T }
  | { readonly status: 'empty' }
  | { readonly status: 'not-found' }
  | { readonly status: 'error' }

function artifactPreview(text: string, kind: string): string {
  const trimmed = text.trim()
  if (kind === 'markdown') return trimmed.slice(0, 400)
  if (kind === 'json') {
    try {
      return JSON.stringify(JSON.parse(trimmed), null, 2).slice(0, 400)
    } catch {
      return trimmed.slice(0, 400)
    }
  }
  return trimmed.slice(0, 200)
}

function reviewRoundStatusLabel(
  status: ReviewRound['status'],
  t: (key: FashionKey) => string,
): string {
  switch (status) {
    case 'open': return t('review.enum.status.open')
    case 'changes_requested': return t('review.enum.status.changesRequested')
    case 'needs_research': return t('review.enum.status.needsResearch')
    case 'rejected': return t('review.enum.status.rejected')
    case 'approved': return t('review.enum.status.approved')
    case 'invalidated': return t('review.enum.status.invalidated')
    case 'archived': return t('review.enum.status.archived')
  }
}

function audienceLabel(audience: DesignDeliverable['audienceProfile'], t: (key: FashionKey) => string): string {
  switch (audience) {
    case 'internal_review': return t('deliverable.enum.audience.internalReview')
    case 'designer_handoff': return t('deliverable.enum.audience.designerHandoff')
    case 'public_portfolio': return t('deliverable.enum.audience.publicPortfolio')
  }
}

function deliverableStatusLabel(status: DesignDeliverable['status'], t: (key: FashionKey) => string): string {
  switch (status) {
    case 'generating': return t('deliverable.enum.status.generating')
    case 'ready': return t('deliverable.enum.status.ready')
    case 'failed': return t('deliverable.enum.status.failed')
    case 'invalidated': return t('deliverable.enum.status.invalidated')
    case 'withdrawn': return t('deliverable.enum.status.withdrawn')
    case 'archived': return t('deliverable.enum.status.archived')
  }
}

function validityCauseLabel(cause: ApprovalValidity['causes'][number], t: (key: FashionKey) => string): string {
  switch (cause) {
    case 'upstream_stale': return t('review.enum.cause.upstreamStale')
    case 'brief_revision_changed': return t('review.enum.cause.briefRevisionChanged')
    case 'concept_set_revision_changed': return t('review.enum.cause.conceptSetRevisionChanged')
    case 'concept_revision_changed': return t('review.enum.cause.conceptRevisionChanged')
    case 'visual_reference_withdrawn': return t('review.enum.cause.visualReferenceWithdrawn')
    case 'approval_revoked': return t('review.enum.cause.approvalRevoked')
    case 'evidence_withdrawn': return t('review.enum.cause.evidenceWithdrawn')
    case 'artifact_integrity_failed': return t('review.enum.cause.artifactIntegrityFailed')
  }
}

function deliverableFollowUpRef(deliverable: DesignDeliverable): DeliverableFollowUpRef {
  return {
    deliverableId: String(deliverable.id),
    deliverableRevision: deliverable.revision,
    conceptId: String(deliverable.selectedConceptRef.id),
    conceptRevision: deliverable.selectedConceptRef.revision,
  }
}

/** Review home: list rounds and open review from review_ready concept set. */
export function ReviewHomePage(props: {
  readonly projectId: string
  readonly locale: string
  readonly getProject: (projectId: string) => Promise<ProjectView>
  readonly loadDesignWorkspace: (projectId: string) => Promise<void>
  readonly listReviews: (projectId: string) => Promise<readonly ReviewRound[]>
  readonly listConceptSets: () => readonly ConceptSet[]
  readonly openReview: (input: {
    projectId: string
    conceptSetId: string
    expectedConceptSetRevision: number
  }) => Promise<ReviewRound>
  readonly openRound: (projectId: string, reviewRoundId: string) => void
  readonly openOverview: (projectId: string) => void
  readonly t: (key: FashionKey) => string
}) {
  const [gate, setGate] = useState<LoadGate<readonly ReviewRound[]>>({ status: 'loading' })
  const [conceptSets, setConceptSets] = useState<readonly ConceptSet[]>([])
  const [opening, setOpening] = useState(false)
  const [openError, setOpenError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setGate({ status: 'loading' })
    void (async () => {
      try {
        const project = await props.getProject(props.projectId)
        await props.loadDesignWorkspace(props.projectId)
        const reviews = await props.listReviews(props.projectId)
        if (cancelled) return
        setConceptSets(props.listConceptSets())
        if (reviews.length === 0 && props.projectId !== R0_PROJECT_ID) {
          setGate({ status: 'empty' })
        } else {
          setGate({ status: 'ready', project, value: reviews })
        }
      } catch {
        if (!cancelled) setGate({ status: 'error' })
      }
    })()
    return () => { cancelled = true }
  }, [props.projectId])

  const readySet = conceptSets.find(set => set.status === 'review_ready' && set.staleReason === null)
  const readOnly = gate.status === 'ready' && gate.project.accessMode === 'read-only'

  const handleOpenReview = (): void => {
    if (readySet === undefined || readOnly) return
    setOpening(true)
    setOpenError(false)
    void props.openReview({
      projectId: props.projectId,
      conceptSetId: String(readySet.id),
      expectedConceptSetRevision: readySet.revision,
    }).then(
      (round) => { props.openRound(props.projectId, String(round.id)) },
      () => { setOpenError(true) },
    ).finally(() => { setOpening(false) })
  }

  if (gate.status === 'loading') {
    return <div className={css.page} data-fashion-page="review-home-loading" aria-busy="true" />
  }
  if (gate.status === 'error') {
    return (
      <div className={css.page} data-fashion-page="review-home-error">
        <StatePanel
          title={props.t('review.loadError')}
          actions={(
            <Button type="button" variant="outline" onClick={() => { props.openOverview(props.projectId) }}>
              {props.t('review.backOverview')}
            </Button>
          )}
        />
      </div>
    )
  }
  if (gate.status === 'empty') {
    return (
      <div className={css.page} data-fashion-page="review-home-empty">
        <FashionPageHeader
          title={props.t('review.homeTitle')}
          description={props.t('review.homeHint')}
          actions={(
            <Button type="button" variant="outline" onClick={() => { props.openOverview(props.projectId) }}>
              {props.t('review.backOverview')}
            </Button>
          )}
        />
        {readySet !== undefined && !readOnly
          ? (
            <div className={css.actions}>
              <Button
                type="button"
                variant="primary"
                disabled={opening}
                data-fashion-review="open"
                onClick={handleOpenReview}
              >
                {opening ? props.t('review.opening') : props.t('review.openReview')}
              </Button>
            </div>
          )
          : null}
        {openError ? <p className={css.meta} role="alert">{props.t('review.openFailed')}</p> : null}
      </div>
    )
  }
  if (gate.status !== 'ready') {
    return (
      <div className={css.page} data-fashion-page="review-home-not-found">
        <StatePanel title={props.t('review.loadError')} />
      </div>
    )
  }

  const reviews = gate.value
  return (
    <div className={css.page} data-fashion-page="review-home">
      {readOnly ? <p className={css.banner} role="status">{props.t('review.r0Readonly')}</p> : null}
      <FashionPageHeader
        title={props.t('review.homeTitle')}
        description={props.t('review.homeHint')}
        actions={(
          <Button type="button" variant="outline" onClick={() => { props.openOverview(props.projectId) }}>
            {props.t('review.backOverview')}
          </Button>
        )}
      />
      {readySet !== undefined && !readOnly
        ? (
          <div className={css.actions}>
            <Button
              type="button"
              variant="primary"
              disabled={opening}
              data-fashion-review="open"
              onClick={handleOpenReview}
            >
              {opening ? props.t('review.opening') : props.t('review.openReview')}
            </Button>
          </div>
        )
        : null}
      {openError ? <p className={css.meta} role="alert">{props.t('review.openFailed')}</p> : null}
      <ul className={css.list} data-fashion-review-rounds>
        {reviews.map(round => (
          <li key={String(round.id)}>
            <button
              type="button"
              className={css.recordLink}
              data-fashion-review-round={String(round.id)}
              onClick={() => { props.openRound(props.projectId, String(round.id)) }}
            >
              <strong>{props.t('review.roundTitle')}</strong>
              <span className={css.meta}>
                {props.t('review.roundStatus')}
                {props.t('common.labelSeparator')}
                {reviewRoundStatusLabel(round.status, props.t)}
              </span>
              <span className={css.meta}>
                {props.t('review.openedAt')}
                {props.t('common.labelSeparator')}
                <LocalizedTime iso={round.openedAt} locale={props.locale} />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Review round: three concepts, select, approve, validity. */
export function ReviewRoundPage(props: {
  readonly projectId: string
  readonly reviewRoundId: string
  readonly getProject: (projectId: string) => Promise<ProjectView>
  readonly getReview: (projectId: string, reviewRoundId: string) => Promise<ReviewRound>
  readonly getConcept: (projectId: string, conceptId: string) => Promise<DesignConcept>
  readonly getApprovalValidity: (projectId: string, reviewRoundId: string) => Promise<ApprovalValidity>
  readonly selectConcept: (input: {
    projectId: string
    reviewRoundId: string
    conceptId: string
    expectedConceptRevision: number
    reasonCodes: readonly string[]
    reasonText: string | null
  }) => Promise<unknown>
  readonly approveSelectedConcept: (input: {
    projectId: string
    reviewRoundId: string
    reasonCodes: readonly string[]
    reasonText: string
  }) => Promise<unknown>
  readonly requestConceptRevision: (input: {
    projectId: string
    reviewRoundId: string
    subjectType: 'concept_set' | 'concept'
    subjectId: string
    expectedRevision: number
    reasonCodes: readonly string[]
    reasonText: string
  }) => Promise<unknown>
  readonly rejectConceptOrSet: (input: {
    projectId: string
    reviewRoundId: string
    subjectType: 'concept_set' | 'concept'
    subjectId: string
    expectedRevision: number
    reasonCodes: readonly string[]
    reasonText: string
  }) => Promise<unknown>
  readonly requestMoreResearch: (input: {
    projectId: string
    reviewRoundId: string
    subjectType: 'concept_set' | 'concept'
    subjectId: string
    expectedRevision: number
    reasonCodes: readonly string[]
    reasonText: string
  }) => Promise<unknown>
  readonly revokeApproval: (input: {
    projectId: string
    reviewRoundId: string
    reasonText: string
  }) => Promise<unknown>
  readonly generateDeliverable: (input: {
    projectId: string
    reviewRoundId: string
    audienceProfile: 'public_portfolio'
  }) => Promise<DesignDeliverable>
  readonly openReviewHome: (projectId: string) => void
  readonly openDeliverables: (projectId: string) => void
  readonly openDeliverable: (projectId: string, deliverableId: string) => void
  readonly t: (key: FashionKey) => string
}) {
  const [gate, setGate] = useState<
    | { status: 'loading' }
    | {
      status: 'ready'
      project: ProjectView
      round: ReviewRound
      concepts: readonly DesignConcept[]
      validity: ApprovalValidity
    }
    | { status: 'not-found' }
    | { status: 'error' }
  >({ status: 'loading' })
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null)
  const [decisionReason, setDecisionReason] = useState('')
  const [reasonMissing, setReasonMissing] = useState(false)

  useEffect(() => {
    let cancelled = false
    setGate({ status: 'loading' })
    void (async () => {
      try {
        const project = await props.getProject(props.projectId)
        const round = await props.getReview(props.projectId, props.reviewRoundId)
        const concepts = await Promise.all(
          round.conceptRefs.map(ref => props.getConcept(props.projectId, ref.id)),
        )
        const validity = await props.getApprovalValidity(props.projectId, props.reviewRoundId)
        if (!cancelled) setGate({ status: 'ready', project, round, concepts, validity })
      } catch (error: unknown) {
        if (cancelled) return
        const code = error && typeof error === 'object' && 'code' in error
          ? String((error as { code: string }).code)
          : ''
        setGate({ status: code.includes('not-found') ? 'not-found' : 'error' })
      }
    })()
    return () => { cancelled = true }
  }, [props.projectId, props.reviewRoundId, reloadToken])

  const readOnly = gate.status === 'ready' && gate.project.accessMode === 'read-only'

  const reload = (): void => { setReloadToken(token => token + 1) }

  const handleSelect = (concept: DesignConcept): void => {
    if (readOnly || gate.status !== 'ready' || gate.round.status !== 'open') return
    const reasonText = decisionReason.trim()
    setBusy(true)
    setActionError(false)
    void props.selectConcept({
      projectId: props.projectId,
      reviewRoundId: props.reviewRoundId,
      conceptId: String(concept.id),
      expectedConceptRevision: concept.revision,
      reasonCodes: DEFAULT_SELECT_REASON,
      reasonText: reasonText === '' ? null : reasonText,
    }).then(
      () => {
        setSelectedConceptId(String(concept.id))
        reload()
      },
      () => { setActionError(true) },
    ).finally(() => { setBusy(false) })
  }

  const takeDecisionReason = (): string | null => {
    const reasonText = decisionReason.trim()
    setReasonMissing(reasonText === '')
    return reasonText === '' ? null : reasonText
  }

  const handleApprove = (): void => {
    if (readOnly || gate.status !== 'ready' || gate.round.status !== 'open') return
    const reasonText = takeDecisionReason()
    if (reasonText === null) return
    setBusy(true)
    setActionError(false)
    void props.approveSelectedConcept({
      projectId: props.projectId,
      reviewRoundId: props.reviewRoundId,
      reasonCodes: DEFAULT_APPROVE_REASON,
      reasonText,
    }).then(
      () => {
        setDecisionReason('')
        reload()
      },
      () => { setActionError(true) },
    ).finally(() => { setBusy(false) })
  }

  const closeWith = (
    action: 'revision' | 'reject' | 'research',
  ): void => {
    if (readOnly || gate.status !== 'ready' || gate.round.status !== 'open') return
    const reasonText = takeDecisionReason()
    if (reasonText === null) return
    const subject = gate.round.conceptSetRef
    const run = action === 'revision'
      ? props.requestConceptRevision
      : action === 'reject'
        ? props.rejectConceptOrSet
        : props.requestMoreResearch
    setBusy(true)
    setActionError(false)
    void run({
      projectId: props.projectId,
      reviewRoundId: props.reviewRoundId,
      subjectType: 'concept_set',
      subjectId: subject.id,
      expectedRevision: subject.revision,
      reasonCodes: action === 'research' ? ['needs_more_research'] : ['other'],
      reasonText,
    }).then(
      () => {
        setDecisionReason('')
        reload()
      },
      () => { setActionError(true) },
    ).finally(() => { setBusy(false) })
  }

  const handleRevoke = (): void => {
    if (readOnly || gate.status !== 'ready' || !gate.validity.valid) return
    const reasonText = takeDecisionReason()
    if (reasonText === null) return
    setBusy(true)
    setActionError(false)
    void props.revokeApproval({
      projectId: props.projectId,
      reviewRoundId: props.reviewRoundId,
      reasonText,
    }).then(
      () => {
        setDecisionReason('')
        reload()
      },
      () => { setActionError(true) },
    ).finally(() => { setBusy(false) })
  }

  const handleGenerate = (): void => {
    if (readOnly || gate.status !== 'ready' || !gate.validity.valid) return
    setBusy(true)
    setActionError(false)
    void props.generateDeliverable({
      projectId: props.projectId,
      reviewRoundId: props.reviewRoundId,
      audienceProfile: 'public_portfolio',
    }).then(
      (deliverable) => { props.openDeliverable(props.projectId, String(deliverable.id)) },
      () => { setActionError(true) },
    ).finally(() => { setBusy(false) })
  }

  if (gate.status === 'loading') {
    return <div className={css.page} data-fashion-page="review-round-loading" aria-busy="true" />
  }
  if (gate.status !== 'ready') {
    return (
      <div className={css.page} data-fashion-page="review-round-missing">
        <StatePanel
          title={gate.status === 'not-found' ? props.t('review.notFound') : props.t('review.loadError')}
          actions={(
            <Button type="button" variant="outline" onClick={() => { props.openReviewHome(props.projectId) }}>
              {props.t('review.backReviews')}
            </Button>
          )}
        />
      </div>
    )
  }

  const { round, concepts, validity, project } = gate
  const isR0Round = props.projectId === R0_PROJECT_ID && props.reviewRoundId === R0_REVIEW_ROUND_ID
  const writesDisabled = readOnly || round.status !== 'open'
  const effectiveSelectedId = isR0Round && round.status === 'approved'
    ? String(R0_CONCEPT_CROPPED_ID)
    : selectedConceptId

  return (
    <div className={css.page} data-fashion-page="review-round">
      {readOnly || isR0Round
        ? <p className={css.banner} role="status">{props.t('review.r0DemoBanner')}</p>
        : null}
      <FashionPageHeader
        title={props.t('review.roundTitle')}
        description={reviewRoundStatusLabel(round.status, props.t)}
        actions={(
          <Button type="button" variant="outline" onClick={() => { props.openReviewHome(props.projectId) }}>
            {props.t('review.backReviews')}
          </Button>
        )}
      />
      <section className={css.section} aria-labelledby="fashion-review-validity-title">
        <h2 id="fashion-review-validity-title">{props.t('review.validityTitle')}</h2>
        <p className={css.meta} data-fashion-review-validity={validity.valid ? 'valid' : 'invalid'}>
          {validity.valid ? props.t('review.validityValid') : props.t('review.validityInvalid')}
        </p>
        {validity.causes.length > 0
          ? (
            <ul>
              {validity.causes.map(cause => <li key={cause}>{validityCauseLabel(cause, props.t)}</li>)}
            </ul>
          )
          : null}
      </section>
      <section className={css.section} aria-labelledby="fashion-review-concepts-title">
        <h2 id="fashion-review-concepts-title">{props.t('review.conceptsTitle')}</h2>
        <ul className={css.list} data-fashion-review-concepts>
          {concepts.map((concept) => {
            const isSelected = effectiveSelectedId === String(concept.id)
            return (
              <li key={String(concept.id)}>
                <div className={css.recordLink} data-fashion-review-concept={String(concept.id)}>
                  <strong>{concept.conceptName}</strong>
                  <span className={css.meta}>{concept.designIntent}</span>
                  {isSelected ? <span className={css.badge}>{props.t('review.selected')}</span> : null}
                  {!writesDisabled
                    ? (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={busy}
                        data-fashion-review="select-concept"
                        data-fashion-review-select={String(concept.id)}
                        onClick={() => { handleSelect(concept) }}
                      >
                        {props.t('review.selectConcept')}
                      </Button>
                    )
                    : null}
                </div>
              </li>
            )
          })}
        </ul>
      </section>
      {!writesDisabled && round.currentSelectionDecisionId !== null
        ? (
          <div className={css.actions}>
            <Button
              type="button"
              variant="primary"
              disabled={busy}
              data-fashion-review="approve-selected"
              onClick={handleApprove}
            >
              {busy ? props.t('review.approving') : props.t('review.approveSelected')}
            </Button>
          </div>
        )
        : null}
      {!writesDisabled || (validity.valid && !readOnly)
        ? (
          <label className={css.meta}>
            {props.t('review.decisionReason')}
            <textarea
              name="decisionReason"
              data-fashion-review-reason
              value={decisionReason}
              onChange={(event) => {
                setDecisionReason(event.target.value)
                setReasonMissing(false)
              }}
            />
          </label>
        )
        : null}
      {reasonMissing ? <p className={css.meta} role="alert">{props.t('review.decisionReasonRequired')}</p> : null}
      {!writesDisabled
        ? (
          <div className={css.actions} data-fashion-review-close-actions>
            <Button type="button" variant="outline" disabled={busy} onClick={() => { closeWith('revision') }}>
              {props.t('review.requestRevision')}
            </Button>
            <Button type="button" variant="outline" disabled={busy} onClick={() => { closeWith('reject') }}>
              {props.t('review.reject')}
            </Button>
            <Button type="button" variant="outline" disabled={busy} onClick={() => { closeWith('research') }}>
              {props.t('review.needsResearch')}
            </Button>
          </div>
        )
        : null}
      {validity.valid && !readOnly
        ? (
          <div className={css.actions}>
            <Button type="button" variant="outline" disabled={busy} onClick={handleRevoke}>
              {props.t('review.revokeApproval')}
            </Button>
          </div>
        )
        : null}
      {validity.valid
        ? (
          <div className={css.actions}>
            {isR0Round
              ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => { props.openDeliverable(props.projectId, R0_DELIVERABLE_ID) }}
                >
                  {props.t('review.openDeliverable')}
                </Button>
              )
              : (
                <Button
                  type="button"
                  variant="primary"
                  disabled={busy || readOnly}
                  data-fashion-review="generate-deliverable"
                  onClick={handleGenerate}
                >
                  {busy ? props.t('review.generating') : props.t('review.generateDeliverable')}
                </Button>
              )}
            <Button type="button" variant="outline" onClick={() => { props.openDeliverables(props.projectId) }}>
              {props.t('review.openDeliverables')}
            </Button>
          </div>
        )
        : null}
      {actionError ? <p className={css.meta} role="alert">{props.t('review.actionFailed')}</p> : null}
      {project.accessMode === 'read-only' ? null : (
        <p className={css.disclaimer}>{props.t('review.notRealApproval')}</p>
      )}
    </div>
  )
}

/** Deliverables home: list frozen packages. */
export function DeliverablesHomePage(props: {
  readonly projectId: string
  readonly getProject: (projectId: string) => Promise<ProjectView>
  readonly listDeliverables: (projectId: string) => Promise<readonly DesignDeliverable[]>
  readonly openDeliverable: (projectId: string, deliverableId: string) => void
  readonly openReviewHome: (projectId: string) => void
  readonly openOverview: (projectId: string) => void
  readonly openFollowUp: (projectId: string, ref: DeliverableFollowUpRef) => void
  readonly t: (key: FashionKey) => string
}) {
  const [gate, setGate] = useState<LoadGate<readonly DesignDeliverable[]>>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    setGate({ status: 'loading' })
    void (async () => {
      try {
        const project = await props.getProject(props.projectId)
        const deliverables = await props.listDeliverables(props.projectId)
        if (cancelled) return
        if (deliverables.length === 0) setGate({ status: 'empty' })
        else setGate({ status: 'ready', project, value: deliverables })
      } catch {
        if (!cancelled) setGate({ status: 'error' })
      }
    })()
    return () => { cancelled = true }
  }, [props.projectId])

  if (gate.status === 'loading') {
    return <div className={css.page} data-fashion-page="deliverables-home-loading" aria-busy="true" />
  }
  if (gate.status === 'error') {
    return (
      <div className={css.page} data-fashion-page="deliverables-home-error">
        <StatePanel
          title={props.t('deliverable.loadError')}
          actions={(
            <Button type="button" variant="outline" onClick={() => { props.openOverview(props.projectId) }}>
              {props.t('deliverable.backOverview')}
            </Button>
          )}
        />
      </div>
    )
  }
  if (gate.status === 'empty') {
    return (
      <div className={css.page} data-fashion-page="deliverables-home-empty">
        <FashionPageHeader
          title={props.t('deliverable.homeTitle')}
          description={props.t('deliverable.homeHint')}
          actions={(
            <Button type="button" variant="outline" onClick={() => { props.openReviewHome(props.projectId) }}>
              {props.t('deliverable.backReviews')}
            </Button>
          )}
        />
      </div>
    )
  }
  if (gate.status !== 'ready') {
    return (
      <div className={css.page} data-fashion-page="deliverables-home-not-found">
        <StatePanel title={props.t('deliverable.loadError')} />
      </div>
    )
  }

  const readOnly = gate.project.accessMode === 'read-only'
  return (
    <div className={css.page} data-fashion-page="deliverables-home">
      {readOnly ? <p className={css.banner} role="status">{props.t('deliverable.r0Readonly')}</p> : null}
      <FashionPageHeader
        title={props.t('deliverable.homeTitle')}
        description={props.t('deliverable.homeHint')}
        actions={(
          <>
            <Button type="button" variant="outline" onClick={() => { props.openReviewHome(props.projectId) }}>
              {props.t('deliverable.backReviews')}
            </Button>
            <Button type="button" variant="outline" onClick={() => { props.openOverview(props.projectId) }}>
              {props.t('deliverable.backOverview')}
            </Button>
          </>
        )}
      />
      <ul className={css.list} data-fashion-deliverables>
        {gate.value.map(row => (
          <li key={String(row.id)}>
            <button
              type="button"
              className={css.recordLink}
              data-fashion-deliverable={String(row.id)}
              onClick={() => { props.openDeliverable(props.projectId, String(row.id)) }}
            >
              <strong>{props.t('deliverable.package')}</strong>
              <span className={css.meta}>
                {props.t('deliverable.revision')}
                {props.t('common.labelSeparator')}
                {row.revision}
              </span>
              <span className={css.meta}>
                {props.t('deliverable.audience')}
                {props.t('common.labelSeparator')}
                {audienceLabel(row.audienceProfile, props.t)}
              </span>
              <span className={css.meta}>
                {props.t('deliverable.status')}
                {props.t('common.labelSeparator')}
                {deliverableStatusLabel(row.status, props.t)}
              </span>
            </button>
            {readOnly
              ? null
              : (
                <Button
                  type="button"
                  variant="outline"
                  data-fashion-deliverable-follow-up={String(row.id)}
                  onClick={() => { props.openFollowUp(props.projectId, deliverableFollowUpRef(row)) }}
                >
                  {props.t('deliverable.openFollowUp')}
                </Button>
              )}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Deliverable detail: snapshot hash, artifacts, verify. */
export function DeliverableDetailPage(props: {
  readonly projectId: string
  readonly deliverableId: string
  readonly getProject: (projectId: string) => Promise<ProjectView>
  readonly getDeliverable: (projectId: string, deliverableId: string) => Promise<DesignDeliverable>
  readonly listDeliverableArtifacts: (
    projectId: string,
    deliverableId: string,
  ) => Promise<readonly ExportArtifactView[]>
  readonly verifyDeliverable: (
    projectId: string,
    deliverableId: string,
  ) => Promise<{ readonly ok: boolean; readonly mismatches: readonly string[] }>
  readonly openDeliverables: (projectId: string) => void
  readonly openFeedback: (projectId: string, ref: DeliverableFollowUpRef) => void
  readonly openOutcomes: (projectId: string, ref: DeliverableFollowUpRef) => void
  readonly openEvaluations: (projectId: string, ref: DeliverableFollowUpRef) => void
  readonly t: (key: FashionKey) => string
}) {
  const [gate, setGate] = useState<
    | { status: 'loading' }
    | {
      status: 'ready'
      project: ProjectView
      deliverable: DesignDeliverable
      artifacts: readonly ExportArtifactView[]
    }
    | { status: 'not-found' }
    | { status: 'error' }
  >({ status: 'loading' })
  const [verifyState, setVerifyState] = useState<
    | { readonly status: 'idle' }
    | { readonly status: 'ok' }
    | { readonly status: 'mismatch'; readonly reasons: readonly string[] }
    | { readonly status: 'error' }
  >({ status: 'idle' })
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    let cancelled = false
    setGate({ status: 'loading' })
    void (async () => {
      try {
        const [project, deliverable, artifacts] = await Promise.all([
          props.getProject(props.projectId),
          props.getDeliverable(props.projectId, props.deliverableId),
          props.listDeliverableArtifacts(props.projectId, props.deliverableId),
        ])
        if (!cancelled) setGate({ status: 'ready', project, deliverable, artifacts })
      } catch (error: unknown) {
        if (cancelled) return
        const code = error && typeof error === 'object' && 'code' in error
          ? String((error as { code: string }).code)
          : ''
        setGate({ status: code.includes('not-found') ? 'not-found' : 'error' })
      }
    })()
    return () => { cancelled = true }
  }, [props.projectId, props.deliverableId])

  const handleVerify = (): void => {
    setVerifying(true)
    setVerifyState({ status: 'idle' })
    void props.verifyDeliverable(props.projectId, props.deliverableId).then(
      (result) => {
        setVerifyState(result.ok
          ? { status: 'ok' }
          : { status: 'mismatch', reasons: result.mismatches })
      },
      () => { setVerifyState({ status: 'error' }) },
    ).finally(() => { setVerifying(false) })
  }

  if (gate.status === 'loading') {
    return <div className={css.page} data-fashion-page="deliverable-detail-loading" aria-busy="true" />
  }
  if (gate.status !== 'ready') {
    return (
      <div className={css.page} data-fashion-page="deliverable-detail-missing">
        <StatePanel
          title={gate.status === 'not-found' ? props.t('deliverable.notFound') : props.t('deliverable.loadError')}
          actions={(
            <Button type="button" variant="outline" onClick={() => { props.openDeliverables(props.projectId) }}>
              {props.t('deliverable.backDeliverables')}
            </Button>
          )}
        />
      </div>
    )
  }

  const { deliverable, artifacts, project } = gate
  const followUpRef = deliverableFollowUpRef(deliverable)
  return (
    <div className={css.page} data-fashion-page="deliverable-detail">
      {project.accessMode === 'read-only'
        ? <p className={css.banner} role="status">{props.t('deliverable.r0Readonly')}</p>
        : null}
      <FashionPageHeader
        title={props.t('deliverable.detailTitle')}
        description={props.t('deliverable.package')}
        actions={(
          <>
            {project.accessMode === 'read-only'
              ? null
              : (
                <Button
                  type="button"
                  variant="primary"
                  data-fashion-deliverable="open-feedback"
                  onClick={() => { props.openFeedback(props.projectId, followUpRef) }}
                >
                  {props.t('overview.openFeedback')}
                </Button>
              )}
            <Button
              type="button"
              variant="outline"
              data-fashion-deliverable="open-outcomes"
              onClick={() => { props.openOutcomes(props.projectId, followUpRef) }}
            >
              {props.t('overview.openOutcomes')}
            </Button>
            <Button
              type="button"
              variant="outline"
              data-fashion-deliverable="open-evaluations"
              onClick={() => { props.openEvaluations(props.projectId, followUpRef) }}
            >
              {props.t('overview.openEvaluations')}
            </Button>
            <Button type="button" variant="outline" onClick={() => { props.openDeliverables(props.projectId) }}>
              {props.t('deliverable.backDeliverables')}
            </Button>
          </>
        )}
      />
      <dl className={css.dl}>
        <div><dt>{props.t('deliverable.revision')}</dt><dd data-fashion-deliverable-revision={deliverable.revision}>{deliverable.revision}</dd></div>
        <div>
          <dt>{props.t('feedback.conceptRevision')}</dt>
          <dd data-fashion-concept-revision={deliverable.selectedConceptRef.revision}>{deliverable.selectedConceptRef.revision}</dd>
        </div>
        <div><dt>{props.t('deliverable.status')}</dt><dd>{deliverableStatusLabel(deliverable.status, props.t)}</dd></div>
        <div><dt>{props.t('deliverable.audience')}</dt><dd>{audienceLabel(deliverable.audienceProfile, props.t)}</dd></div>
        <div><dt>{props.t('deliverable.snapshotHash')}</dt><dd>{deliverable.snapshotHash}</dd></div>
        <div>
          <dt>{props.t('deliverable.limitations')}</dt>
          <dd>{deliverable.limitations.length === 0 ? '—' : deliverable.limitations.join(props.t('common.listSeparator'))}</dd>
        </div>
      </dl>
      <section className={css.section} aria-labelledby="fashion-deliverable-artifacts-title">
        <h2 id="fashion-deliverable-artifacts-title">{props.t('deliverable.artifactsTitle')}</h2>
        <ul className={css.list}>
          {artifacts.map(artifact => (
            <li key={String(artifact.id)}>
              <div className={css.recordLink} data-fashion-artifact={String(artifact.id)}>
                <strong>{artifact.filename}</strong>
                {/* Filename and kind are separate facts; without a separator
                    they read as one token, e.g. `decision.jsonjson`. */}
                <span className={css.meta}>{props.t('deliverable.kind')}{props.t('common.labelSeparator')}{props.t(ARTIFACT_KIND_LABELS[artifact.kind])}</span>
                {artifact.kind === 'markdown' || artifact.kind === 'json'
                  ? (
                    <pre className={css.codePreview}>
                      {artifactPreview(artifact.textContent, artifact.kind)}
                    </pre>
                  )
                  : (
                    <span className={css.meta}>{artifact.mediaType}</span>
                  )}
              </div>
            </li>
          ))}
        </ul>
      </section>
      <div className={css.actions}>
        <Button type="button" variant="primary" disabled={verifying} onClick={handleVerify}>
          {verifying ? props.t('deliverable.verifying') : props.t('deliverable.verify')}
        </Button>
        {verifyState.status === 'ok' ? <p className={css.meta} role="status">{props.t('deliverable.verifyOk')}</p> : null}
        {verifyState.status === 'mismatch' ? (
          <div className={css.meta} role="alert">
            <p>{props.t('deliverable.verifyMismatch')}</p>
            <ul>
              {verifyMismatchEntries(verifyState.reasons, artifacts, props.t).map(entry => <li key={entry}>{entry}</li>)}
            </ul>
          </div>
        ) : null}
        {verifyState.status === 'error' ? <p className={css.meta} role="alert">{props.t('deliverable.verifyError')}</p> : null}
      </div>
    </div>
  )
}

/**
 * Turn Host integrity reasons (`hash:<kind>`, `snapshot-identity:<kind>`,
 * `missing:<kind>`, `manifest-*`, `snapshot-*`, `artifact-count`) into one
 * display line per affected file or non-file check.
 */
function verifyMismatchEntries(
  reasons: readonly string[],
  artifacts: readonly ExportArtifactView[],
  t: (key: FashionKey) => string,
): readonly string[] {
  const entries = new Set<string>()
  const fileOrMissing = (kind: string): string => {
    const artifact = artifacts.find(row => row.kind === kind)
    return artifact === undefined
      ? `${t('deliverable.verifyMissingArtifact')}${t('common.labelSeparator')}${isArtifactKind(kind) ? t(ARTIFACT_KIND_LABELS[kind]) : kind}`
      : artifact.filename
  }
  for (const reason of reasons) {
    const [check, kind] = reason.split(':')
    if ((check === 'hash' || check === 'snapshot-identity' || check === 'missing') && kind !== undefined) {
      entries.add(fileOrMissing(kind))
    } else if (reason.startsWith('manifest-')) {
      entries.add(fileOrMissing('manifest'))
    } else if (reason.startsWith('snapshot-')) {
      entries.add(t('deliverable.verifySnapshotMismatch'))
    } else if (reason === 'artifact-count') {
      entries.add(t('deliverable.verifyArtifactCount'))
    } else {
      // Reasons this build does not know still mark the package as inconsistent.
      entries.add(t('deliverable.verifyOtherCheck'))
    }
  }
  return [...entries]
}
