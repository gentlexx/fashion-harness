/** Design-stage write forms: Brief draft from a selected Opportunity, Concept create and revise in a draft ConceptSet. */
import { useState } from 'react'
import { Button, Input } from '@deepseek-ai/dsh-client-ui-primitives'
import type { DesignOpportunity } from '@gentlexx/dsh-fashion-analysis/types'
import type {
  ConceptSet,
  ConstraintClaimType,
  ConstraintEntry,
  DesignConcept,
} from '@gentlexx/dsh-fashion-design/types'
import type { FashionKey } from '../locales.ts'
import {
  designWriteFailureKey,
  type DesignBriefDraftInput,
  type DesignConceptDraftInput,
  type DesignConceptRevisionInput,
  type DesignWriteResult,
} from './design-write.ts'
import css from '../FashionWorkspace.module.css'

function lines(text: string): readonly string[] {
  return text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
}

function constraints(kind: string, text: string, claimType: ConstraintClaimType): readonly ConstraintEntry[] {
  return lines(text).map((line, index) => ({
    id: `${kind}-${index + 1}`,
    text: line,
    kind,
    claimType,
    sourceRefs: [],
    note: null,
  }))
}

type BriefTextField =
  | 'market'
  | 'season'
  | 'category'
  | 'targetUser'
  | 'brandContext'
  | 'differentiationGoals'
  | 'mustKeep'
  | 'mustAvoid'
  | 'materialsConstraints'
  | 'costConstraints'
  | 'productionConstraints'
  | 'openQuestions'

const BRIEF_FIELDS: readonly {
  readonly field: BriefTextField
  readonly label: FashionKey
  readonly multiline: boolean
  readonly required: boolean
}[] = [
  { field: 'market', label: 'design.form.market', multiline: false, required: true },
  { field: 'season', label: 'design.season', multiline: false, required: true },
  { field: 'category', label: 'design.form.category', multiline: false, required: true },
  { field: 'targetUser', label: 'design.targetUser', multiline: false, required: true },
  { field: 'brandContext', label: 'design.form.brandContext', multiline: false, required: false },
  { field: 'differentiationGoals', label: 'design.form.differentiationGoals', multiline: true, required: true },
  { field: 'mustKeep', label: 'design.mustKeep', multiline: true, required: true },
  { field: 'mustAvoid', label: 'design.mustAvoid', multiline: true, required: true },
  { field: 'materialsConstraints', label: 'design.form.materialsConstraints', multiline: true, required: true },
  { field: 'costConstraints', label: 'design.form.costConstraints', multiline: true, required: true },
  { field: 'productionConstraints', label: 'design.form.productionConstraints', multiline: true, required: true },
  { field: 'openQuestions', label: 'design.unknowns', multiline: true, required: false },
]

/** Brief draft form bound to one selected Opportunity record. */
export function BriefCreateForm(props: {
  readonly projectId: string
  readonly opportunity: DesignOpportunity
  readonly createBrief: (input: DesignBriefDraftInput) => Promise<DesignWriteResult<unknown>>
  readonly onCreated: () => void
  readonly t: (key: FashionKey) => string
}) {
  const decisionId = props.opportunity.currentDecisionId
  const [values, setValues] = useState<Record<BriefTextField, string>>({
    market: props.opportunity.targetMarket,
    season: '',
    category: props.opportunity.category,
    targetUser: props.opportunity.targetUserHypothesis,
    brandContext: '',
    differentiationGoals: '',
    mustKeep: '',
    mustAvoid: '',
    materialsConstraints: '',
    costConstraints: '',
    productionConstraints: '',
    openQuestions: '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<FashionKey | null>(null)

  const submit = async (): Promise<void> => {
    if (decisionId === null) return
    if (BRIEF_FIELDS.some(row => row.required && values[row.field].trim() === '')) {
      setError('design.form.requiredMissing')
      return
    }
    setBusy(true)
    setError(null)
    const brandContext = values.brandContext.trim()
    const result = await props.createBrief({
      projectId: props.projectId,
      opportunityId: String(props.opportunity.id),
      expectedOpportunityRevision: props.opportunity.revision,
      selectionDecisionId: String(decisionId),
      market: values.market.trim(),
      season: values.season.trim(),
      category: values.category.trim(),
      targetUser: values.targetUser.trim(),
      brandContext: brandContext === '' ? null : brandContext,
      differentiationGoals: constraints('differentiation_goal', values.differentiationGoals, 'human_decision'),
      mustKeep: constraints('must_keep', values.mustKeep, 'human_decision'),
      mustAvoid: constraints('must_avoid', values.mustAvoid, 'human_decision'),
      materialsConstraints: constraints('materials', values.materialsConstraints, 'human_decision'),
      costConstraints: constraints('cost', values.costConstraints, 'human_decision'),
      productionConstraints: constraints('production', values.productionConstraints, 'human_decision'),
      openQuestions: constraints('open_question', values.openQuestions, 'needs_validation'),
    })
    setBusy(false)
    if (result.ok) props.onCreated()
    else setError(designWriteFailureKey(result.failure))
  }

  return (
    <section className={css.createForm} data-fashion-design="create-brief">
      <h2 className={css.sectionTitle}>{props.t('design.form.createBrief')}</h2>
      <p className={css.meta} data-fashion-design="brief-opportunity">
        {props.t('design.form.fromOpportunity')}
        {props.t('common.labelSeparator')}
        {props.opportunity.title}
        {' · '}
        {props.t('design.form.opportunityRevision')}
        {props.t('common.labelSeparator')}
        {props.opportunity.revision}
      </p>
      <p className={css.meta}>{props.t('design.form.constraintHint')}</p>
      {BRIEF_FIELDS.map(row => (
        <label key={row.field} className={css.createLabel}>
          {props.t(row.label)}
          {row.multiline
            ? (
              <textarea
                className={css.formTextarea}
                value={values[row.field]}
                data-fashion-design={`brief-${row.field}`}
                disabled={busy}
                onChange={(event) => { setValues({ ...values, [row.field]: event.target.value }) }}
              />
            )
            : (
              <Input
                value={values[row.field]}
                data-fashion-design={`brief-${row.field}`}
                disabled={busy}
                onChange={(event) => { setValues({ ...values, [row.field]: event.target.value }) }}
              />
            )}
        </label>
      ))}
      {error !== null ? <p className={css.meta} role="alert">{props.t(error)}</p> : null}
      <div className={css.actions}>
        <Button
          type="button"
          variant="primary"
          disabled={busy || decisionId === null}
          data-fashion-design="submit-brief"
          onClick={() => { void submit() }}
        >
          {busy ? props.t('design.form.saving') : props.t('design.form.createBrief')}
        </Button>
      </div>
    </section>
  )
}

type ConceptTextField =
  | 'conceptName'
  | 'designIntent'
  | 'silhouette'
  | 'proportionAndLength'
  | 'materialDirection'
  | 'colorDirection'
  | 'constructionAndDetails'
  | 'functionalValue'
  | 'targetUseScenarios'
  | 'originalTransformationNotes'
  | 'productionUnknowns'

const CONCEPT_FIELDS: readonly { readonly field: ConceptTextField; readonly label: FashionKey; readonly multiline: boolean }[] = [
  { field: 'conceptName', label: 'design.form.conceptName', multiline: false },
  { field: 'designIntent', label: 'design.form.designIntent', multiline: false },
  { field: 'silhouette', label: 'design.silhouette', multiline: false },
  { field: 'proportionAndLength', label: 'design.proportion', multiline: false },
  { field: 'materialDirection', label: 'design.material', multiline: false },
  { field: 'colorDirection', label: 'design.form.colorDirection', multiline: false },
  { field: 'constructionAndDetails', label: 'design.construction', multiline: true },
  { field: 'functionalValue', label: 'design.function', multiline: true },
  { field: 'targetUseScenarios', label: 'design.scenarios', multiline: true },
  { field: 'originalTransformationNotes', label: 'design.transformation', multiline: true },
  { field: 'productionUnknowns', label: 'design.productionUnknown', multiline: true },
]

const EMPTY_CONCEPT: Record<ConceptTextField, string> = {
  conceptName: '',
  designIntent: '',
  silhouette: '',
  proportionAndLength: '',
  materialDirection: '',
  colorDirection: '',
  constructionAndDetails: '',
  functionalValue: '',
  targetUseScenarios: '',
  originalTransformationNotes: '',
  productionUnknowns: '',
}

/** Form text for every Concept field as recorded; list fields become one entry per line. */
function recordedConceptValues(concept: DesignConcept): Record<ConceptTextField, string> {
  return {
    conceptName: concept.conceptName,
    designIntent: concept.designIntent,
    silhouette: concept.silhouette,
    proportionAndLength: concept.proportionAndLength,
    materialDirection: concept.materialDirection,
    colorDirection: concept.colorDirection,
    constructionAndDetails: concept.constructionAndDetails.join('\n'),
    functionalValue: concept.functionalValue.join('\n'),
    targetUseScenarios: concept.targetUseScenarios.join('\n'),
    originalTransformationNotes: concept.originalTransformationNotes.join('\n'),
    productionUnknowns: concept.productionUnknowns.join('\n'),
  }
}

/** Trimmed Concept fields submitted by both the create and the revise form. */
function conceptFields(values: Record<ConceptTextField, string>) {
  return {
    conceptName: values.conceptName.trim(),
    designIntent: values.designIntent.trim(),
    silhouette: values.silhouette.trim(),
    proportionAndLength: values.proportionAndLength.trim(),
    materialDirection: values.materialDirection.trim(),
    colorDirection: values.colorDirection.trim(),
    constructionAndDetails: lines(values.constructionAndDetails),
    functionalValue: lines(values.functionalValue),
    targetUseScenarios: lines(values.targetUseScenarios),
    originalTransformationNotes: lines(values.originalTransformationNotes),
    productionUnknowns: lines(values.productionUnknowns),
  }
}

/** Shared Concept field editor; `selectorPrefix` keeps create and revise inputs distinguishable. */
function ConceptFieldInputs(props: {
  readonly values: Record<ConceptTextField, string>
  readonly selectorPrefix: 'concept' | 'revise'
  readonly busy: boolean
  readonly onChange: (values: Record<ConceptTextField, string>) => void
  readonly t: (key: FashionKey) => string
}) {
  return (
    <>
      {CONCEPT_FIELDS.map(row => (
        <label key={row.field} className={css.createLabel}>
          {props.t(row.label)}
          {row.multiline
            ? (
              <textarea
                className={css.formTextarea}
                value={props.values[row.field]}
                data-fashion-design={`${props.selectorPrefix}-${row.field}`}
                disabled={props.busy}
                onChange={(event) => { props.onChange({ ...props.values, [row.field]: event.target.value }) }}
              />
            )
            : (
              <Input
                value={props.values[row.field]}
                data-fashion-design={`${props.selectorPrefix}-${row.field}`}
                disabled={props.busy}
                onChange={(event) => { props.onChange({ ...props.values, [row.field]: event.target.value }) }}
              />
            )}
        </label>
      ))}
    </>
  )
}

function missingConceptField(values: Record<ConceptTextField, string>): boolean {
  return CONCEPT_FIELDS.some(row => values[row.field].trim() === '')
}

/** Concept form adding one member to the current draft ConceptSet at its recorded revision. */
export function ConceptCreateForm(props: {
  readonly projectId: string
  readonly conceptSet: ConceptSet
  readonly createConcept: (input: DesignConceptDraftInput) => Promise<DesignWriteResult<unknown>>
  readonly onCreated: () => void
  readonly t: (key: FashionKey) => string
}) {
  const [values, setValues] = useState<Record<ConceptTextField, string>>(EMPTY_CONCEPT)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<FashionKey | null>(null)

  const submit = async (): Promise<void> => {
    if (missingConceptField(values)) {
      setError('design.form.requiredMissing')
      return
    }
    setBusy(true)
    setError(null)
    const result = await props.createConcept({
      projectId: props.projectId,
      conceptSetId: String(props.conceptSet.id),
      expectedConceptSetRevision: props.conceptSet.revision,
      ...conceptFields(values),
    })
    setBusy(false)
    if (result.ok) {
      setValues(EMPTY_CONCEPT)
      props.onCreated()
    } else {
      setError(designWriteFailureKey(result.failure))
    }
  }

  return (
    <section className={css.createForm} data-fashion-design="create-concept">
      <h2 className={css.sectionTitle}>{props.t('design.form.addConcept')}</h2>
      <p className={css.meta}>
        {props.t('design.form.conceptCount')}
        {props.t('common.labelSeparator')}
        {props.conceptSet.conceptRefs.length}
        {' / 3 · '}
        {props.t('design.form.conceptHint')}
      </p>
      <ConceptFieldInputs values={values} selectorPrefix="concept" busy={busy} onChange={setValues} t={props.t} />
      {error !== null ? <p className={css.meta} role="alert">{props.t(error)}</p> : null}
      <div className={css.actions}>
        <Button
          type="button"
          variant="primary"
          disabled={busy}
          data-fashion-design="submit-concept"
          onClick={() => { void submit() }}
        >
          {busy ? props.t('design.form.saving') : props.t('design.form.addConcept')}
        </Button>
      </div>
    </section>
  )
}

/**
 * Revision form for one recorded Concept: every field starts from that record,
 * and the save carries the record's own id and revision.
 */
export function ConceptReviseForm(props: {
  readonly projectId: string
  readonly concept: DesignConcept
  readonly reviseConcept: (input: DesignConceptRevisionInput) => Promise<DesignWriteResult<unknown>>
  readonly onRevised: () => void
  readonly onCancel: () => void
  readonly t: (key: FashionKey) => string
}) {
  const [values, setValues] = useState<Record<ConceptTextField, string>>(() => recordedConceptValues(props.concept))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<FashionKey | null>(null)

  const submit = async (): Promise<void> => {
    if (missingConceptField(values)) {
      setError('design.form.requiredMissing')
      return
    }
    setBusy(true)
    setError(null)
    const result = await props.reviseConcept({
      projectId: props.projectId,
      conceptId: String(props.concept.id),
      expectedRevision: props.concept.revision,
      ...conceptFields(values),
    })
    setBusy(false)
    if (result.ok) props.onRevised()
    else setError(designWriteFailureKey(result.failure))
  }

  return (
    <section className={css.createForm} data-fashion-design="revise-concept" data-fashion-design-revise-target={String(props.concept.id)}>
      <h2 className={css.sectionTitle}>{props.t('design.form.reviseConcept')}</h2>
      <p className={css.meta} data-fashion-design="revise-concept-revision">
        {props.concept.conceptName}
        {' · '}
        {props.t('design.conceptRevision')}
        {props.t('common.labelSeparator')}
        {props.concept.revision}
      </p>
      <p className={css.meta}>{props.t('design.form.reviseHint')}</p>
      <ConceptFieldInputs values={values} selectorPrefix="revise" busy={busy} onChange={setValues} t={props.t} />
      {error !== null ? <p className={css.meta} role="alert">{props.t(error)}</p> : null}
      <div className={css.actions}>
        <Button
          type="button"
          variant="primary"
          disabled={busy}
          data-fashion-design="submit-revise-concept"
          onClick={() => { void submit() }}
        >
          {busy ? props.t('design.form.saving') : props.t('design.form.saveRevision')}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          data-fashion-design="cancel-revise-concept"
          onClick={props.onCancel}
        >
          {props.t('design.form.cancelRevision')}
        </Button>
      </div>
    </section>
  )
}
