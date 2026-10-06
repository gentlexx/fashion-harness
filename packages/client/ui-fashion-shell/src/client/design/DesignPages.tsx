/** Design directions workspace: Brief / ConceptSet comparison / Concept detail. */
import { useEffect, useState } from 'react'
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ProjectView } from '@gentlexx/dsh-fashion-project/types'
import type { DesignOpportunity } from '@gentlexx/dsh-fashion-analysis/types'
import type {
  BriefStatus,
  ConceptLifecycleStatus,
  ConceptSet,
  DesignConcept,
  DesignOpportunityBrief,
  DifferentiationCheck,
  VisualDraft,
} from '@gentlexx/dsh-fashion-design/types'
import type { FashionKey } from '../locales.ts'
import { FashionPageHeader } from '../components/FashionPageHeader.tsx'
import { StatePanel } from '../components/StatePanel.tsx'
import { BriefCreateForm, ConceptCreateForm, ConceptReviseForm } from './DesignForms.tsx'
import {
  designWriteFailureKey,
  type DesignBriefDraftInput,
  type DesignConceptDraftInput,
  type DesignConceptRevisionInput,
  type DesignWriteResult,
} from './design-write.ts'
import css from '../FashionWorkspace.module.css'

const BRIEF_STATUS_LABELS: Readonly<Record<BriefStatus, FashionKey>> = {
  draft: 'design.status.draft',
  confirmed: 'design.status.confirmed',
  stale: 'design.status.stale',
  archived: 'design.status.archived',
}

const CONCEPT_STATUS_LABELS: Readonly<Record<ConceptLifecycleStatus, FashionKey>> = {
  draft: 'design.status.draft',
  review_ready: 'design.status.reviewReady',
  stale: 'design.status.stale',
  archived: 'design.status.archived',
}

const PAIR_REASON = /^(?:diff:)?pair-(.+):(?:structural-hits-(\d+)|(color-only))$/

/** Localized text for one Host differentiation failure reason, naming the concepts it compares. */
function differentiationReason(
  reason: string,
  members: readonly DesignConcept[],
  t: (key: FashionKey) => string,
): string {
  const match = PAIR_REASON.exec(reason)
  if (match === null) return t('design.diff.other')
  const pairKey = match[1]
  for (const a of members) {
    for (const b of members) {
      if (`${String(a.id)}-${String(b.id)}` !== pairKey) continue
      const pair = `${a.conceptName} / ${b.conceptName}`
      const hits = match[2]
      return hits === undefined
        ? `${pair}${t('common.labelSeparator')}${t('design.diff.colorOnly')}`
        : `${pair}${t('common.labelSeparator')}${t('design.diff.structuralHits')} ${hits} / 2`
    }
  }
  return t('design.diff.other')
}

/**
 * The ConceptSet the Host marks current. A project with sets but none current
 * has no current set; no other set is substituted.
 */
function currentConceptSet(conceptSets: readonly ConceptSet[]): ConceptSet | undefined {
  return conceptSets.find(set => set.isCurrent)
}

/** The current set's Brief; without a current set, the most recently updated non-archived Brief. */
function directionsBrief(
  briefs: readonly DesignOpportunityBrief[],
  current: ConceptSet | undefined,
): DesignOpportunityBrief | undefined {
  if (current !== undefined) return briefs.find(row => String(row.id) === String(current.briefId))
  // The design model lists Briefs by updatedAt, newest first.
  return briefs.find(row => row.status !== 'archived')
}

type LoadGate =
  | { readonly status: 'loading' }
  | {
    readonly status: 'ready'
    readonly project: ProjectView
    readonly briefs: readonly DesignOpportunityBrief[]
    readonly conceptSets: readonly ConceptSet[]
    readonly concepts: readonly DesignConcept[]
    readonly differentiation: DifferentiationCheck | null
  }
  | { readonly status: 'empty' }
  | { readonly status: 'error' }

/** Directions home: current ConceptSet three-column view, Concept entry, review-ready transition. */
export function DesignDirectionsPage(props: {
  readonly projectId: string
  readonly getProject: (projectId: string) => Promise<ProjectView>
  readonly loadDesignWorkspace: (projectId: string) => Promise<void>
  readonly listBriefs: () => readonly DesignOpportunityBrief[]
  readonly listConceptSets: () => readonly ConceptSet[]
  readonly listConcepts: () => readonly DesignConcept[]
  readonly evaluateDifferentiation: (projectId: string, conceptSetId: string) => Promise<DifferentiationCheck>
  readonly createConcept: (input: DesignConceptDraftInput) => Promise<DesignWriteResult<unknown>>
  readonly reviseConcept: (input: DesignConceptRevisionInput) => Promise<DesignWriteResult<unknown>>
  readonly markReviewReady: (input: {
    projectId: string
    conceptSetId: string
    expectedRevision: number
  }) => Promise<DesignWriteResult<unknown>>
  readonly openOverview: (projectId: string) => void
  readonly openConcept: (projectId: string, conceptId: string) => void
  readonly openBrief: (projectId: string, opportunityId: string) => void
  readonly openReviewHome: (projectId: string) => void
  readonly t: (key: FashionKey) => string
}) {
  const [gate, setGate] = useState<LoadGate>({ status: 'loading' })
  const [reload, setReload] = useState(0)
  const [busy, setBusy] = useState(false)
  const [writeError, setWriteError] = useState<FashionKey | null>(null)
  const [revising, setRevising] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    setGate({ status: 'loading' })
    void (async () => {
      try {
        const project = await props.getProject(props.projectId)
        await props.loadDesignWorkspace(props.projectId)
        if (cancelled) return
        const briefs = props.listBriefs()
        const conceptSets = props.listConceptSets()
        const concepts = props.listConcepts()
        const current = currentConceptSet(conceptSets)
        let differentiation: DifferentiationCheck | null = null
        if (current !== undefined && current.conceptRefs.length === 3) {
          differentiation = await props.evaluateDifferentiation(props.projectId, String(current.id))
        }
        if (cancelled) return
        if (briefs.length === 0 && conceptSets.length === 0) {
          setGate({ status: 'empty' })
          return
        }
        setGate({ status: 'ready', project, briefs, conceptSets, concepts, differentiation })
      } catch {
        if (!cancelled) setGate({ status: 'error' })
      }
    })()
    return () => { cancelled = true }
  }, [props.projectId, reload])

  if (gate.status === 'loading') {
    return <div className={css.page} data-fashion-page="design-directions-loading" aria-busy="true" />
  }
  if (gate.status === 'error') {
    return (
      <div className={css.page} data-fashion-page="design-directions-error">
        <StatePanel
          title={props.t('design.loadError')}
          actions={(
            <Button type="button" variant="outline" onClick={() => { props.openOverview(props.projectId) }}>
              {props.t('design.backOverview')}
            </Button>
          )}
        />
      </div>
    )
  }
  if (gate.status === 'empty') {
    return (
      <div className={css.page} data-fashion-page="design-directions-empty">
        <FashionPageHeader
          title={props.t('design.directionsTitle')}
          description={props.t('design.empty')}
          actions={(
            <Button type="button" variant="outline" onClick={() => { props.openOverview(props.projectId) }}>
              {props.t('design.backOverview')}
            </Button>
          )}
        />
      </div>
    )
  }

  const current = currentConceptSet(gate.conceptSets)
  const brief = directionsBrief(gate.briefs, current)
  const members = current === undefined
    ? []
    : current.conceptRefs
      .map(ref => gate.concepts.find(concept => String(concept.id) === String(ref.conceptId)))
      .filter((row): row is DesignConcept => row !== undefined)
  const editable = gate.project.accessMode !== 'read-only'
  const draftEditable = editable && current !== undefined && current.status === 'draft'
  const revisingConcept = revising === null
    ? undefined
    : members.find(concept => String(concept.id) === revising)

  const markReady = async (set: ConceptSet): Promise<void> => {
    setBusy(true)
    setWriteError(null)
    const result = await props.markReviewReady({
      projectId: props.projectId,
      conceptSetId: String(set.id),
      expectedRevision: set.revision,
    })
    setBusy(false)
    if (result.ok) setReload(value => value + 1)
    else setWriteError(designWriteFailureKey(result.failure))
  }

  return (
    <div className={css.page} data-fashion-page="design-directions">
      {editable ? null : <p className={css.banner} role="status">{props.t('design.r0Readonly')}</p>}
      <FashionPageHeader
        title={props.t('design.directionsTitle')}
        description={props.t('design.directionsHint')}
        actions={(
          <>
            {brief !== undefined
              ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { props.openBrief(props.projectId, String(brief.opportunityId)) }}
                >
                  {props.t('design.openBrief')}
                </Button>
              )
              : null}
            <Button type="button" variant="outline" onClick={() => { props.openOverview(props.projectId) }}>
              {props.t('design.backOverview')}
            </Button>
          </>
        )}
      />
      {current !== undefined
        ? (
          <p className={css.meta} data-fashion-design="concept-set-status">
            {props.t('design.conceptSetStatus')}
            {props.t('common.labelSeparator')}
            {props.t(CONCEPT_STATUS_LABELS[current.status])}
          </p>
        )
        : <p className={css.meta}>{props.t('design.noConceptSet')}</p>}
      <ul className={css.list} data-fashion-design-concepts>
        {members.map(concept => (
          <li key={String(concept.id)}>
            <button
              type="button"
              className={css.recordLink}
              data-fashion-design-concept={String(concept.id)}
              onClick={() => { props.openConcept(props.projectId, String(concept.id)) }}
            >
              <strong>{concept.conceptName}</strong>
              <span className={css.meta}>{concept.designIntent}</span>
              <span className={css.meta}>
                {concept.silhouette}
                {' · '}
                {concept.proportionAndLength}
                {' · '}
                {concept.materialDirection}
              </span>
              <span className={css.meta} data-fashion-design-concept-revision={concept.revision}>
                {props.t('design.conceptRevision')}
                {props.t('common.labelSeparator')}
                {concept.revision}
              </span>
            </button>
            {draftEditable && revising === null
              ? (
                <Button
                  type="button"
                  variant="outline"
                  data-fashion-design="open-revise-concept"
                  data-fashion-design-revise={String(concept.id)}
                  onClick={() => {
                    setWriteError(null)
                    setRevising(String(concept.id))
                  }}
                >
                  {props.t('design.form.reviseConcept')}
                </Button>
              )
              : null}
          </li>
        ))}
      </ul>
      {draftEditable && revisingConcept !== undefined
        ? (
          <ConceptReviseForm
            key={`${String(revisingConcept.id)}:${revisingConcept.revision}`}
            projectId={props.projectId}
            concept={revisingConcept}
            reviseConcept={props.reviseConcept}
            onRevised={() => {
              setRevising(null)
              setReload(value => value + 1)
            }}
            onCancel={() => { setRevising(null) }}
            t={props.t}
          />
        )
        : null}
      {draftEditable && revisingConcept === undefined && current.conceptRefs.length < 3
        ? (
          <ConceptCreateForm
            key={`${String(current.id)}:${current.revision}`}
            projectId={props.projectId}
            conceptSet={current}
            createConcept={props.createConcept}
            onCreated={() => { setReload(value => value + 1) }}
            t={props.t}
          />
        )
        : null}
      {draftEditable && revisingConcept === undefined && current.conceptRefs.length === 3
        ? (
          <div className={css.actions}>
            <Button
              type="button"
              variant="primary"
              disabled={busy}
              data-fashion-design="mark-review-ready"
              onClick={() => { void markReady(current) }}
            >
              {props.t('design.markReviewReady')}
            </Button>
          </div>
        )
        : null}
      {writeError !== null ? <p className={css.meta} role="alert">{props.t(writeError)}</p> : null}
      {current !== undefined && current.status === 'review_ready'
        ? (
          <div className={css.actions}>
            <Button
              type="button"
              variant="outline"
              data-fashion-design="open-review-home"
              onClick={() => { props.openReviewHome(props.projectId) }}
            >
              {props.t('design.goReview')}
            </Button>
          </div>
        )
        : null}
      {gate.differentiation !== null
        ? (
          <section className={css.section} aria-labelledby="fashion-design-diff-title">
            <h2 id="fashion-design-diff-title">{props.t('design.comparisonTitle')}</h2>
            <p className={css.meta}>
              {gate.differentiation.passed
                ? props.t('design.comparisonPass')
                : props.t('design.comparisonFail')}
            </p>
            {gate.differentiation.failureReasons.length > 0
              ? (
                <ul data-fashion-design="differentiation-reasons">
                  {gate.differentiation.failureReasons.map(reason => (
                    <li key={reason}>{differentiationReason(reason, members, props.t)}</li>
                  ))}
                </ul>
              )
              : null}
          </section>
        )
        : null}
      <p className={css.meta}>{props.t('design.noApprove')}</p>
    </div>
  )
}

type BriefGate =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly brief: DesignOpportunityBrief; readonly project: ProjectView; readonly hasCurrentSet: boolean }
  | { readonly status: 'create'; readonly opportunity: DesignOpportunity }
  | { readonly status: 'not-selected' }
  | { readonly status: 'not-found' }
  | { readonly status: 'error' }

/** Brief detail (R0 read-only or user draft/confirmed); an editable project without a Brief offers the draft form. */
export function DesignBriefPage(props: {
  readonly projectId: string
  readonly opportunityId: string
  readonly getProject: (projectId: string) => Promise<ProjectView>
  readonly loadDesignWorkspace: (projectId: string) => Promise<void>
  readonly listBriefs: () => readonly DesignOpportunityBrief[]
  readonly listConceptSets: () => readonly ConceptSet[]
  readonly findOpportunity: (projectId: string, opportunityId: string) => Promise<DesignOpportunity | null>
  readonly createBrief: (input: DesignBriefDraftInput) => Promise<DesignWriteResult<unknown>>
  readonly confirmBrief: (input: {
    projectId: string
    briefId: string
    expectedRevision: number
  }) => Promise<DesignWriteResult<unknown>>
  readonly createConceptSet: (input: {
    projectId: string
    briefId: string
    expectedBriefRevision: number
  }) => Promise<DesignWriteResult<unknown>>
  readonly openDirections: (projectId: string) => void
  readonly t: (key: FashionKey) => string
}) {
  const [gate, setGate] = useState<BriefGate>({ status: 'loading' })
  const [reload, setReload] = useState(0)
  const [busy, setBusy] = useState(false)
  const [writeError, setWriteError] = useState<FashionKey | null>(null)

  useEffect(() => {
    let cancelled = false
    setGate({ status: 'loading' })
    void (async () => {
      try {
        const project = await props.getProject(props.projectId)
        await props.loadDesignWorkspace(props.projectId)
        if (cancelled) return
        const brief = props.listBriefs().find(row =>
          String(row.opportunityId) === props.opportunityId && row.status !== 'archived')
        if (brief !== undefined) {
          const hasCurrentSet = props.listConceptSets().some(set =>
            set.isCurrent && String(set.briefId) === String(brief.id) && set.briefRevision === brief.revision)
          setGate({ status: 'ready', brief, project, hasCurrentSet })
          return
        }
        if (project.accessMode === 'read-only') {
          setGate({ status: 'not-found' })
          return
        }
        const opportunity = await props.findOpportunity(props.projectId, props.opportunityId)
        if (cancelled) return
        if (opportunity === null) setGate({ status: 'not-found' })
        else if (opportunity.reviewStatus !== 'selected' || opportunity.status !== 'active' || opportunity.currentDecisionId === null) {
          setGate({ status: 'not-selected' })
        } else {
          setGate({ status: 'create', opportunity })
        }
      } catch {
        if (!cancelled) setGate({ status: 'error' })
      }
    })()
    return () => { cancelled = true }
  }, [props.projectId, props.opportunityId, reload])

  if (gate.status === 'loading') {
    return <div className={css.page} data-fashion-page="design-brief-loading" aria-busy="true" />
  }
  if (gate.status === 'create') {
    return (
      <div className={css.page} data-fashion-page="design-brief-create">
        <FashionPageHeader
          title={props.t('design.briefTitle')}
          description={props.t('design.form.createBriefHint')}
          actions={(
            <Button type="button" variant="outline" onClick={() => { props.openDirections(props.projectId) }}>
              {props.t('design.backDirections')}
            </Button>
          )}
        />
        <BriefCreateForm
          projectId={props.projectId}
          opportunity={gate.opportunity}
          createBrief={props.createBrief}
          onCreated={() => { setReload(value => value + 1) }}
          t={props.t}
        />
      </div>
    )
  }
  if (gate.status !== 'ready') {
    const title: FashionKey = gate.status === 'not-found'
      ? 'design.notFound'
      : gate.status === 'not-selected' ? 'design.form.opportunityNotSelected' : 'design.loadError'
    return (
      <div className={css.page} data-fashion-page="design-brief-missing">
        <StatePanel
          title={props.t(title)}
          actions={(
            <Button type="button" variant="outline" onClick={() => { props.openDirections(props.projectId) }}>
              {props.t('design.backDirections')}
            </Button>
          )}
        />
      </div>
    )
  }

  const brief = gate.brief
  const editable = gate.project.accessMode !== 'read-only'

  const confirm = async (): Promise<void> => {
    setBusy(true)
    setWriteError(null)
    const result = await props.confirmBrief({
      projectId: props.projectId,
      briefId: String(brief.id),
      expectedRevision: brief.revision,
    })
    setBusy(false)
    if (result.ok) setReload(value => value + 1)
    else setWriteError(designWriteFailureKey(result.failure))
  }
  const createSet = async (): Promise<void> => {
    setBusy(true)
    setWriteError(null)
    const result = await props.createConceptSet({
      projectId: props.projectId,
      briefId: String(brief.id),
      expectedBriefRevision: brief.revision,
    })
    setBusy(false)
    if (result.ok) props.openDirections(props.projectId)
    else setWriteError(designWriteFailureKey(result.failure))
  }

  const joined = (rows: readonly { readonly text: string }[]): string =>
    rows.length === 0 ? '—' : rows.map(row => row.text).join(props.t('common.listSeparator'))

  return (
    <div className={css.page} data-fashion-page="design-brief">
      {editable ? null : <p className={css.banner} role="status">{props.t('design.r0Readonly')}</p>}
      <FashionPageHeader
        title={props.t('design.briefTitle')}
        description={`${props.t(BRIEF_STATUS_LABELS[brief.status])} · ${brief.market} · ${brief.category}`}
        actions={(
          <Button type="button" variant="outline" onClick={() => { props.openDirections(props.projectId) }}>
            {props.t('design.backDirections')}
          </Button>
        )}
      />
      <dl className={css.dl}>
        <div><dt>{props.t('design.season')}</dt><dd>{brief.season}</dd></div>
        <div><dt>{props.t('design.targetUser')}</dt><dd>{brief.targetUser}</dd></div>
        <div><dt>{props.t('design.form.differentiationGoals')}</dt><dd>{joined(brief.differentiationGoals)}</dd></div>
        <div><dt>{props.t('design.mustKeep')}</dt><dd>{joined(brief.mustKeep)}</dd></div>
        <div><dt>{props.t('design.mustAvoid')}</dt><dd>{joined(brief.mustAvoid)}</dd></div>
        <div><dt>{props.t('design.unknowns')}</dt><dd>{joined(brief.openQuestions)}</dd></div>
      </dl>
      {editable && brief.status === 'draft'
        ? (
          <div className={css.actions}>
            <Button
              type="button"
              variant="primary"
              disabled={busy}
              data-fashion-design="confirm-brief"
              onClick={() => { void confirm() }}
            >
              {props.t('design.form.confirmBrief')}
            </Button>
          </div>
        )
        : null}
      {editable && brief.status === 'confirmed' && !gate.hasCurrentSet
        ? (
          <div className={css.actions}>
            <Button
              type="button"
              variant="primary"
              disabled={busy}
              data-fashion-design="create-concept-set"
              onClick={() => { void createSet() }}
            >
              {props.t('design.form.createConceptSet')}
            </Button>
          </div>
        )
        : null}
      {writeError !== null ? <p className={css.meta} role="alert">{props.t(writeError)}</p> : null}
    </div>
  )
}

/** Concept detail with visual drafts. */
export function DesignConceptPage(props: {
  readonly projectId: string
  readonly conceptId: string
  readonly getProject: (projectId: string) => Promise<ProjectView>
  readonly getConcept: (projectId: string, conceptId: string) => Promise<DesignConcept>
  readonly listVisualDrafts: (projectId: string, conceptId: string) => Promise<readonly VisualDraft[]>
  readonly openDirections: (projectId: string) => void
  readonly openVisual: (projectId: string, conceptId: string, visualDraftId: string) => void
  readonly t: (key: FashionKey) => string
}) {
  const [gate, setGate] = useState<
    | { status: 'loading' }
    | { status: 'ready'; concept: DesignConcept; visuals: readonly VisualDraft[]; project: ProjectView }
    | { status: 'not-found' }
    | { status: 'error' }
  >({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    setGate({ status: 'loading' })
    void (async () => {
      try {
        const [project, concept, visuals] = await Promise.all([
          props.getProject(props.projectId),
          props.getConcept(props.projectId, props.conceptId),
          props.listVisualDrafts(props.projectId, props.conceptId),
        ])
        if (!cancelled) setGate({ status: 'ready', concept, visuals, project })
      } catch (error: unknown) {
        if (cancelled) return
        const code = error && typeof error === 'object' && 'code' in error
          ? String((error as { code: string }).code)
          : ''
        setGate({ status: code.includes('not-found') ? 'not-found' : 'error' })
      }
    })()
    return () => { cancelled = true }
  }, [props.projectId, props.conceptId])

  if (gate.status === 'loading') {
    return <div className={css.page} data-fashion-page="design-concept-loading" aria-busy="true" />
  }
  if (gate.status !== 'ready') {
    return (
      <div className={css.page} data-fashion-page="design-concept-missing">
        <StatePanel
          title={gate.status === 'not-found' ? props.t('design.notFound') : props.t('design.loadError')}
          actions={(
            <Button type="button" variant="outline" onClick={() => { props.openDirections(props.projectId) }}>
              {props.t('design.backDirections')}
            </Button>
          )}
        />
      </div>
    )
  }

  const concept = gate.concept
  return (
    <div className={css.page} data-fashion-page="design-concept">
      {gate.project.accessMode === 'read-only'
        ? <p className={css.banner} role="status">{props.t('design.r0Readonly')}</p>
        : null}
      <FashionPageHeader
        title={concept.conceptName}
        description={concept.designIntent}
        actions={(
          <Button type="button" variant="outline" onClick={() => { props.openDirections(props.projectId) }}>
            {props.t('design.backDirections')}
          </Button>
        )}
      />
      <dl className={css.dl}>
        <div><dt>{props.t('design.silhouette')}</dt><dd>{concept.silhouette}</dd></div>
        <div><dt>{props.t('design.proportion')}</dt><dd>{concept.proportionAndLength}</dd></div>
        <div><dt>{props.t('design.material')}</dt><dd>{concept.materialDirection}</dd></div>
        <div><dt>{props.t('design.construction')}</dt><dd>{concept.constructionAndDetails.join('；')}</dd></div>
        <div><dt>{props.t('design.function')}</dt><dd>{concept.functionalValue.join('；')}</dd></div>
        <div><dt>{props.t('design.scenarios')}</dt><dd>{concept.targetUseScenarios.join('；')}</dd></div>
        <div><dt>{props.t('design.transformation')}</dt><dd>{concept.originalTransformationNotes.join('；')}</dd></div>
        <div><dt>{props.t('design.similarityRisk')}</dt><dd>{concept.competitorSimilarityRisks.map(row => row.difference).join('；') || '—'}</dd></div>
        <div><dt>{props.t('design.productionUnknown')}</dt><dd>{concept.productionUnknowns.join('；')}</dd></div>
      </dl>
      <section className={css.section} aria-labelledby="fashion-design-visuals-title">
        <h2 id="fashion-design-visuals-title">{props.t('design.visualsTitle')}</h2>
        <ul className={css.list}>
          {gate.visuals.map(visual => (
            <li key={String(visual.id)}>
              <button
                type="button"
                className={css.recordLink}
                data-fashion-design-visual={String(visual.id)}
                onClick={() => { props.openVisual(props.projectId, props.conceptId, String(visual.id)) }}
              >
                <strong>{visual.generationMode}</strong>
                <span className={css.meta}>{visual.aiDisclosure}</span>
                <span className={css.meta}>{visual.status}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

/** Visual draft detail with disclosure. */
export function DesignVisualPage(props: {
  readonly projectId: string
  readonly conceptId: string
  readonly visualDraftId: string
  readonly getVisualDraft: (projectId: string, visualDraftId: string) => Promise<VisualDraft>
  readonly openConcept: (projectId: string, conceptId: string) => void
  readonly t: (key: FashionKey) => string
}) {
  const [gate, setGate] = useState<
    | { status: 'loading' }
    | { status: 'ready'; visual: VisualDraft }
    | { status: 'not-found' }
    | { status: 'error' }
  >({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    setGate({ status: 'loading' })
    void props.getVisualDraft(props.projectId, props.visualDraftId).then(
      (visual) => { if (!cancelled) setGate({ status: 'ready', visual }) },
      (error: unknown) => {
        if (cancelled) return
        const code = error && typeof error === 'object' && 'code' in error
          ? String((error as { code: string }).code)
          : ''
        setGate({ status: code.includes('not-found') ? 'not-found' : 'error' })
      },
    )
    return () => { cancelled = true }
  }, [props.projectId, props.visualDraftId])

  if (gate.status === 'loading') {
    return <div className={css.page} data-fashion-page="design-visual-loading" aria-busy="true" />
  }
  if (gate.status !== 'ready') {
    return (
      <div className={css.page} data-fashion-page="design-visual-missing">
        <StatePanel
          title={gate.status === 'not-found' ? props.t('design.notFound') : props.t('design.loadError')}
          actions={(
            <Button type="button" variant="outline" onClick={() => { props.openConcept(props.projectId, props.conceptId) }}>
              {props.t('design.backConcept')}
            </Button>
          )}
        />
      </div>
    )
  }

  const visual = gate.visual
  return (
    <div className={css.page} data-fashion-page="design-visual">
      <p className={css.banner} role="status">{props.t('design.visualNotProduction')}</p>
      <FashionPageHeader
        title={props.t('design.visualTitle')}
        description={`${visual.generationMode} · ${visual.status}`}
        actions={(
          <Button type="button" variant="outline" onClick={() => { props.openConcept(props.projectId, props.conceptId) }}>
            {props.t('design.backConcept')}
          </Button>
        )}
      />
      <dl className={css.dl}>
        <div><dt>{props.t('design.aiDisclosure')}</dt><dd>{visual.aiDisclosure}</dd></div>
        <div><dt>{props.t('design.usageBoundary')}</dt><dd>{visual.usageBoundary}</dd></div>
        <div>
          <dt>{props.t('design.artifactRef')}</dt>
          <dd data-fashion-design="visual-artifact-ref">
            {visual.artifactRef === null ? props.t('design.artifactRefNone') : visual.artifactRef}
          </dd>
        </div>
        <div>
          <dt>{props.t('design.contentCredential')}</dt>
          <dd data-fashion-design="visual-content-credential">
            {visual.contentCredential === null
              ? props.t('design.contentCredentialNone')
              : visual.contentCredential.status}
          </dd>
        </div>
      </dl>
    </div>
  )
}
