/** @vitest-environment jsdom */
/** Design-stage write entries: Brief draft/confirm, ConceptSet creation, Concept entry, review-ready transition. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ProjectView } from '@gentlexx/dsh-fashion-project/types'
import type { DesignOpportunity } from '@gentlexx/dsh-fashion-analysis/types'
import type {
  ConceptSet,
  DesignConcept,
  DesignOpportunityBrief,
  DifferentiationCheck,
  VisualDraft,
} from '@gentlexx/dsh-fashion-design/types'
import { DesignBriefPage, DesignDirectionsPage, DesignVisualPage } from '../src/client/design/DesignPages.tsx'
import {
  designWriteFailure,
  type DesignConceptRevisionInput,
  type DesignWriteResult,
} from '../src/client/design/design-write.ts'
import { zh, type FashionKey } from '../src/client/locales.ts'

const t = (key: FashionKey): string => zh[key]
const PROJECT = 'user-project'

function project(accessMode: 'editable' | 'read-only'): ProjectView {
  return {
    id: PROJECT as never,
    title: 'P',
    origin: accessMode === 'read-only' ? 'public-rebuild' : 'user',
    accessMode,
    createdAt: '2026-09-30T00:00:00.000Z',
    updatedAt: '2026-09-30T00:00:00.000Z',
    revision: 0,
  } as ProjectView
}

function opportunity(overrides: Partial<Record<string, unknown>> = {}): DesignOpportunity {
  return {
    id: 'opp-1',
    projectId: PROJECT,
    taskId: 'task-1',
    status: 'active',
    revision: 4,
    title: '城市通勤轻外套',
    targetMarket: '中国一线城市',
    targetUserHypothesis: '25-35 岁通勤女性',
    category: '外套',
    reviewStatus: 'selected',
    currentDecisionId: 'dec-1',
    ...overrides,
  } as unknown as DesignOpportunity
}

function brief(status: 'draft' | 'confirmed', revision: number): DesignOpportunityBrief {
  return {
    id: 'brief-1',
    projectId: PROJECT,
    opportunityId: 'opp-1',
    status,
    revision,
    market: '中国一线城市',
    season: '2027 春',
    category: '外套',
    targetUser: '25-35 岁通勤女性',
    differentiationGoals: [{ id: 'g-1', text: '可收纳' }],
    mustKeep: [{ id: 'k-1', text: '防泼水' }],
    mustAvoid: [{ id: 'a-1', text: '复制竞品' }],
    openQuestions: [],
  } as unknown as DesignOpportunityBrief
}

function conceptSet(status: 'draft' | 'review_ready', count: number, revision: number): ConceptSet {
  return {
    id: 'set-1',
    projectId: PROJECT,
    briefId: 'brief-1',
    briefRevision: 1,
    status,
    revision,
    isCurrent: true,
    conceptRefs: Array.from({ length: count }, (_, index) => ({ conceptId: `c${index + 1}`, revision: 0 })),
  } as unknown as ConceptSet
}

function concept(index: number): DesignConcept {
  return {
    id: `c${index}`,
    conceptName: `方向${index}`,
    designIntent: `意图${index}`,
    silhouette: 'H',
    proportionAndLength: '中长',
    materialDirection: '尼龙',
  } as unknown as DesignConcept
}

const ok: DesignWriteResult<unknown> = { ok: true, value: {} }

afterEach(() => { cleanup() })

function briefPage(options: {
  readonly accessMode?: 'editable' | 'read-only'
  readonly briefs?: () => readonly DesignOpportunityBrief[]
  readonly sets?: readonly ConceptSet[]
  readonly found?: DesignOpportunity | null
  readonly createBrief?: () => Promise<DesignWriteResult<unknown>>
  readonly confirmBrief?: () => Promise<DesignWriteResult<unknown>>
  readonly createConceptSet?: () => Promise<DesignWriteResult<unknown>>
  readonly getProject?: () => Promise<ProjectView>
}) {
  const handlers = {
    findOpportunity: vi.fn(async () => (options.found === undefined ? opportunity() : options.found)),
    createBrief: vi.fn(options.createBrief ?? (async () => ok)),
    confirmBrief: vi.fn(options.confirmBrief ?? (async () => ok)),
    createConceptSet: vi.fn(options.createConceptSet ?? (async () => ok)),
    openDirections: vi.fn(),
  }
  render(
    <DesignBriefPage
      projectId={PROJECT}
      opportunityId="opp-1"
      getProject={options.getProject ?? (async () => project(options.accessMode ?? 'editable'))}
      loadDesignWorkspace={async () => {}}
      listBriefs={options.briefs ?? (() => [])}
      listConceptSets={() => options.sets ?? []}
      findOpportunity={handlers.findOpportunity}
      createBrief={handlers.createBrief}
      confirmBrief={handlers.confirmBrief}
      createConceptSet={handlers.createConceptSet}
      openDirections={handlers.openDirections}
      t={t}
    />,
  )
  return handlers
}

function fill(field: string, value: string): void {
  const node = document.querySelector(`[data-fashion-design="${field}"]`)
  if (node === null) throw new Error(`missing field ${field}`)
  fireEvent.change(node, { target: { value } })
}

function writeEntries(): readonly Element[] {
  return [...document.querySelectorAll(
    '[data-fashion-design="create-brief"], [data-fashion-design="confirm-brief"], [data-fashion-design="create-concept-set"], [data-fashion-design="create-concept"], [data-fashion-design="mark-review-ready"]',
  )]
}

describe('DesignBriefPage', () => {
  it('prefills the Brief form from the selected Opportunity and sends its recorded revision and decision', async () => {
    let briefs: readonly DesignOpportunityBrief[] = []
    const handlers = briefPage({
      briefs: () => briefs,
      createBrief: async () => {
        briefs = [brief('draft', 0)]
        return ok
      },
    })
    await screen.findByText(zh['design.form.createBriefHint'])
    expect((document.querySelector('[data-fashion-design="brief-market"]') as HTMLInputElement).value).toBe('中国一线城市')
    expect((document.querySelector('[data-fashion-design="brief-category"]') as HTMLInputElement).value).toBe('外套')
    expect((document.querySelector('[data-fashion-design="brief-targetUser"]') as HTMLInputElement).value).toBe('25-35 岁通勤女性')
    expect(document.querySelector('[data-fashion-design="brief-opportunity"]')?.textContent).toContain('城市通勤轻外套')
    expect(document.querySelector('[data-fashion-design="brief-opportunityId"]')).toBeNull()
    expect(document.querySelector('[data-fashion-design="brief-revision"]')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: zh['design.form.createBrief'] }))
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', zh['design.form.requiredMissing'])
    expect(handlers.createBrief).not.toHaveBeenCalled()

    fill('brief-season', '2027 春')
    fill('brief-differentiationGoals', '可收纳\n可拆卸兜帽')
    fill('brief-mustKeep', '防泼水')
    fill('brief-mustAvoid', '复制竞品')
    fill('brief-materialsConstraints', '再生尼龙')
    fill('brief-costConstraints', '未知')
    fill('brief-productionConstraints', '未知')
    fireEvent.click(screen.getByRole('button', { name: zh['design.form.createBrief'] }))

    await waitFor(() => { expect(handlers.createBrief).toHaveBeenCalledTimes(1) })
    expect(handlers.createBrief).toHaveBeenCalledWith(expect.objectContaining({
      projectId: PROJECT,
      opportunityId: 'opp-1',
      expectedOpportunityRevision: 4,
      selectionDecisionId: 'dec-1',
      market: '中国一线城市',
      season: '2027 春',
      brandContext: null,
      differentiationGoals: [
        { id: 'differentiation_goal-1', text: '可收纳', kind: 'differentiation_goal', claimType: 'human_decision', sourceRefs: [], note: null },
        { id: 'differentiation_goal-2', text: '可拆卸兜帽', kind: 'differentiation_goal', claimType: 'human_decision', sourceRefs: [], note: null },
      ],
      openQuestions: [],
    }))
    expect(await screen.findByRole('button', { name: zh['design.form.confirmBrief'] })).toBeTruthy()
  })

  it('confirms the Brief at its recorded revision and shows a localized conflict', async () => {
    const handlers = briefPage({
      briefs: () => [brief('draft', 3)],
      confirmBrief: async () => ({ ok: false, failure: 'conflict' }),
    })
    fireEvent.click(await screen.findByRole('button', { name: zh['design.form.confirmBrief'] }))
    await waitFor(() => {
      expect(handlers.confirmBrief).toHaveBeenCalledWith({ projectId: PROJECT, briefId: 'brief-1', expectedRevision: 3 })
    })
    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toBe(zh['design.error.conflict'])
    expect(alert.textContent).not.toContain('fashion-design/')
  })

  it('creates a ConceptSet from a confirmed Brief revision and opens directions', async () => {
    const handlers = briefPage({ briefs: () => [brief('confirmed', 1)] })
    expect(screen.queryByText(zh['design.status.confirmed'], { exact: false })).toBeNull()
    fireEvent.click(await screen.findByRole('button', { name: zh['design.form.createConceptSet'] }))
    await waitFor(() => {
      expect(handlers.createConceptSet).toHaveBeenCalledWith({ projectId: PROJECT, briefId: 'brief-1', expectedBriefRevision: 1 })
    })
    expect(handlers.openDirections).toHaveBeenCalledWith(PROJECT)
    expect(document.body.textContent).toContain(zh['design.status.confirmed'])
  })

  it('hides ConceptSet creation when the current set already uses this Brief revision', async () => {
    briefPage({ briefs: () => [brief('confirmed', 1)], sets: [conceptSet('draft', 0, 0)] })
    await screen.findByText(zh['design.season'])
    expect(screen.queryByRole('button', { name: zh['design.form.createConceptSet'] })).toBeNull()
  })

  it('reports Host precondition and not-found failures without raw codes', async () => {
    briefPage({
      briefs: () => [brief('confirmed', 1)],
      createConceptSet: async () => ({ ok: false, failure: 'precondition' }),
    })
    fireEvent.click(await screen.findByRole('button', { name: zh['design.form.createConceptSet'] }))
    expect((await screen.findByRole('alert')).textContent).toBe(zh['design.error.precondition'])
  })

  it('refuses a Brief form for an unselected Opportunity', async () => {
    const handlers = briefPage({ found: opportunity({ reviewStatus: 'candidate', currentDecisionId: null }) })
    expect(await screen.findByText(zh['design.form.opportunityNotSelected'])).toBeTruthy()
    expect(writeEntries()).toHaveLength(0)
    expect(handlers.createBrief).not.toHaveBeenCalled()
  })

  it('renders no write entry for R0 while loading, with a Brief, or without one', async () => {
    let release: (value: ProjectView) => void = () => {}
    const handlers = briefPage({
      briefs: () => [brief('draft', 0)],
      getProject: () => new Promise<ProjectView>((resolve) => { release = resolve }),
    })
    expect(document.querySelector('[data-fashion-page="design-brief-loading"]')).not.toBeNull()
    expect(writeEntries()).toHaveLength(0)
    release(project('read-only'))
    expect(await screen.findByText(zh['design.r0Readonly'])).toBeTruthy()
    expect(writeEntries()).toHaveLength(0)
    expect(handlers.confirmBrief).not.toHaveBeenCalled()
  })

  it('shows not-found for R0 without a Brief and never looks up the Opportunity', async () => {
    const handlers = briefPage({ accessMode: 'read-only' })
    expect(await screen.findByText(zh['design.notFound'])).toBeTruthy()
    expect(handlers.findOpportunity).not.toHaveBeenCalled()
    expect(writeEntries()).toHaveLength(0)
  })
})

function directionsPage(options: {
  readonly accessMode?: 'editable' | 'read-only'
  readonly sets: () => readonly ConceptSet[]
  readonly concepts: () => readonly DesignConcept[]
  readonly differentiation?: DifferentiationCheck
  readonly createConcept?: () => Promise<DesignWriteResult<unknown>>
  readonly markReviewReady?: () => Promise<DesignWriteResult<unknown>>
}) {
  const handlers = {
    createConcept: vi.fn(options.createConcept ?? (async () => ok)),
    reviseConcept: vi.fn(async () => ok),
    markReviewReady: vi.fn(options.markReviewReady ?? (async () => ok)),
    openReviewHome: vi.fn(),
  }
  render(
    <DesignDirectionsPage
      projectId={PROJECT}
      getProject={async () => project(options.accessMode ?? 'editable')}
      loadDesignWorkspace={async () => {}}
      listBriefs={() => [brief('confirmed', 1)]}
      listConceptSets={options.sets}
      listConcepts={options.concepts}
      evaluateDifferentiation={async () => options.differentiation ?? ({
        passed: true,
        failureReasons: [],
      } as unknown as DifferentiationCheck)}
      createConcept={handlers.createConcept}
      reviseConcept={handlers.reviseConcept}
      markReviewReady={handlers.markReviewReady}
      openOverview={vi.fn()}
      openConcept={vi.fn()}
      openBrief={vi.fn()}
      openReviewHome={handlers.openReviewHome}
      t={t}
    />,
  )
  return handlers
}

const CONCEPT_FIELDS: readonly (readonly [string, string])[] = [
  ['concept-conceptName', '方向3'],
  ['concept-designIntent', '通勤'],
  ['concept-silhouette', 'A'],
  ['concept-proportionAndLength', '短款'],
  ['concept-materialDirection', '羊毛'],
  ['concept-colorDirection', '燕麦色'],
  ['concept-constructionAndDetails', '双排扣\n暗袋'],
  ['concept-functionalValue', '保暖'],
  ['concept-targetUseScenarios', '通勤'],
  ['concept-originalTransformationNotes', '改写领型'],
  ['concept-productionUnknowns', '面料供应'],
]

describe('DesignDirectionsPage', () => {
  it('adds a Concept to the current draft set at its recorded revision', async () => {
    const handlers = directionsPage({
      sets: () => [conceptSet('draft', 2, 2)],
      concepts: () => [concept(1), concept(2)],
    })
    await screen.findByText(zh['design.form.addConcept'], { selector: 'h2' })
    expect(document.querySelector('[data-fashion-design="concept-set-status"]')?.textContent).toContain(zh['design.status.draft'])
    for (const [field, value] of CONCEPT_FIELDS) fill(field, value)
    fireEvent.click(screen.getByRole('button', { name: zh['design.form.addConcept'] }))
    await waitFor(() => { expect(handlers.createConcept).toHaveBeenCalledTimes(1) })
    expect(handlers.createConcept).toHaveBeenCalledWith(expect.objectContaining({
      projectId: PROJECT,
      conceptSetId: 'set-1',
      expectedConceptSetRevision: 2,
      conceptName: '方向3',
      constructionAndDetails: ['双排扣', '暗袋'],
      originalTransformationNotes: ['改写领型'],
      productionUnknowns: ['面料供应'],
    }))
  })

  it('shows a localized precondition failure from Concept creation', async () => {
    directionsPage({
      sets: () => [conceptSet('draft', 0, 0)],
      concepts: () => [],
      createConcept: async () => ({ ok: false, failure: 'precondition' }),
    })
    await screen.findByText(zh['design.form.addConcept'], { selector: 'h2' })
    for (const [field, value] of CONCEPT_FIELDS) fill(field, value)
    fireEvent.click(screen.getByRole('button', { name: zh['design.form.addConcept'] }))
    expect((await screen.findByRole('alert')).textContent).toBe(zh['design.error.precondition'])
  })

  it('marks a three-Concept draft set review-ready at its revision and localizes differentiation reasons', async () => {
    let sets: readonly ConceptSet[] = [conceptSet('draft', 3, 5)]
    const handlers = directionsPage({
      sets: () => sets,
      concepts: () => [concept(1), concept(2), concept(3)],
      differentiation: { passed: false, failureReasons: ['pair-c1-c2:structural-hits-1', 'pair-c2-c3:color-only'] } as unknown as DifferentiationCheck,
      markReviewReady: async () => {
        sets = [conceptSet('review_ready', 3, 6)]
        return ok
      },
    })
    const reasons = await screen.findByText(/方向1 \/ 方向2/)
    expect(reasons.textContent).toContain(zh['design.diff.structuralHits'])
    expect(document.body.textContent).toContain(zh['design.diff.colorOnly'])
    expect(document.body.textContent).not.toContain('pair-c1-c2')
    expect(document.querySelector('[data-fashion-design="create-concept"]')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: zh['design.markReviewReady'] }))
    await waitFor(() => {
      expect(handlers.markReviewReady).toHaveBeenCalledWith({ projectId: PROJECT, conceptSetId: 'set-1', expectedRevision: 5 })
    })
    fireEvent.click(await screen.findByRole('button', { name: zh['design.goReview'] }))
    expect(handlers.openReviewHome).toHaveBeenCalledWith(PROJECT)
  })

  it('renders no Concept or review-ready entry for R0', async () => {
    directionsPage({
      accessMode: 'read-only',
      sets: () => [conceptSet('draft', 2, 2)],
      concepts: () => [concept(1), concept(2)],
    })
    expect(await screen.findByText(zh['design.r0Readonly'])).toBeTruthy()
    expect(writeEntries()).toHaveLength(0)
  })

  it('shows no current set instead of substituting the first non-current set', async () => {
    directionsPage({
      sets: () => [{ ...conceptSet('draft', 2, 2), isCurrent: false } as ConceptSet],
      concepts: () => [concept(1), concept(2)],
    })
    expect(await screen.findByText(zh['design.noConceptSet'])).toBeTruthy()
    expect(document.querySelector('[data-fashion-design-concept]')).toBeNull()
    expect(writeEntries()).toHaveLength(0)
  })
})

type StructuralConcept = DesignConcept & {
  readonly colorDirection: string
  readonly constructionAndDetails: readonly string[]
  readonly functionalValue: readonly string[]
  readonly targetUseScenarios: readonly string[]
  readonly originalTransformationNotes: readonly string[]
  readonly productionUnknowns: readonly string[]
}

function fullConcept(id: string, overrides: Partial<Record<string, unknown>> = {}): StructuralConcept {
  return {
    id,
    projectId: PROJECT,
    revision: 0,
    conceptName: `方向${id}`,
    designIntent: '通勤',
    silhouette: 'H',
    proportionAndLength: '中长',
    materialDirection: '尼龙',
    colorDirection: '黑色',
    constructionAndDetails: ['暗门襟'],
    functionalValue: ['防泼水'],
    targetUseScenarios: ['通勤'],
    originalTransformationNotes: ['改写领型'],
    productionUnknowns: ['面料供应'],
    ...overrides,
  } as unknown as StructuralConcept
}

const STRUCTURAL_KEYS = [
  'silhouette',
  'proportionAndLength',
  'materialDirection',
  'constructionAndDetails',
  'functionalValue',
  'targetUseScenarios',
] as const

/** In-memory Host mirroring revise, differentiation, and review-ready semantics of the design registry. */
function revisionHost(initial: readonly StructuralConcept[]) {
  let concepts = [...initial]
  let set = {
    ...conceptSet('draft', 3, 5),
    conceptRefs: initial.map(row => ({ conceptId: row.id, revision: row.revision })),
  } as unknown as ConceptSet
  const field = (row: StructuralConcept, key: typeof STRUCTURAL_KEYS[number] | 'colorDirection'): string => {
    const value = (row as unknown as Record<string, unknown>)[key]
    return Array.isArray(value) ? value.join('|') : String(value)
  }
  const evaluate = (): DifferentiationCheck => {
    const failureReasons: string[] = []
    for (let i = 0; i < concepts.length; i += 1) {
      for (let j = i + 1; j < concepts.length; j += 1) {
        const a = concepts[i]!
        const b = concepts[j]!
        const hits = STRUCTURAL_KEYS.filter(key => field(a, key) !== field(b, key)).length
        if (hits >= 2) continue
        const colorOnly = hits === 0 && field(a, 'colorDirection') !== field(b, 'colorDirection')
        failureReasons.push(`pair-${String(a.id)}-${String(b.id)}:${colorOnly ? 'color-only' : `structural-hits-${hits}`}`)
      }
    }
    return { passed: failureReasons.length === 0, failureReasons } as unknown as DifferentiationCheck
  }
  const host = {
    concepts: () => concepts,
    sets: () => [set],
    evaluate: vi.fn(async () => evaluate()),
    reviseConcept: vi.fn(async (input: DesignConceptRevisionInput): Promise<DesignWriteResult<unknown>> => {
      const index = concepts.findIndex(row => String(row.id) === input.conceptId)
      const existing = concepts[index]!
      if (existing.revision !== input.expectedRevision) return { ok: false, failure: 'conflict' }
      const { projectId: _projectId, conceptId: _conceptId, expectedRevision: _expected, ...fields } = input
      const revised = { ...existing, ...fields, revision: existing.revision + 1 } as unknown as StructuralConcept
      concepts = concepts.map((row, at) => (at === index ? revised : row))
      set = {
        ...set,
        status: 'draft',
        revision: set.revision + 1,
        conceptRefs: set.conceptRefs.map(ref =>
          String(ref.conceptId) === input.conceptId ? { ...ref, revision: revised.revision } : ref),
      } as unknown as ConceptSet
      return { ok: true, value: revised }
    }),
    markReviewReady: vi.fn(async (input: { expectedRevision: number }): Promise<DesignWriteResult<unknown>> => {
      if (input.expectedRevision !== set.revision) return { ok: false, failure: 'conflict' }
      if (!evaluate().passed) return { ok: false, failure: 'precondition' }
      set = { ...set, status: 'review_ready', revision: set.revision + 1 } as unknown as ConceptSet
      return ok
    }),
  }
  return host
}

function revisionPage(
  host: ReturnType<typeof revisionHost>,
  options: { readonly getProject?: () => Promise<ProjectView> } = {},
): void {
  render(
    <DesignDirectionsPage
      projectId={PROJECT}
      getProject={options.getProject ?? (async () => project('editable'))}
      loadDesignWorkspace={async () => {}}
      listBriefs={() => [brief('confirmed', 1)]}
      listConceptSets={host.sets}
      listConcepts={host.concepts}
      evaluateDifferentiation={host.evaluate}
      createConcept={vi.fn(async () => ok)}
      reviseConcept={host.reviseConcept}
      markReviewReady={host.markReviewReady}
      openOverview={vi.fn()}
      openConcept={vi.fn()}
      openBrief={vi.fn()}
      openReviewHome={vi.fn()}
      t={t}
    />,
  )
}

function colorOnlyConcepts(): readonly StructuralConcept[] {
  return [
    fullConcept('ca'),
    fullConcept('cb', { colorDirection: '燕麦色' }),
    fullConcept('cc', { silhouette: 'A', materialDirection: '羊毛', proportionAndLength: '短款' }),
  ]
}

function field(name: string): HTMLInputElement | HTMLTextAreaElement {
  const node = document.querySelector(`[data-fashion-design="${name}"]`)
  if (node === null) throw new Error(`missing field ${name}`)
  return node as HTMLInputElement | HTMLTextAreaElement
}

function reviseButton(id: string): Promise<Element> {
  return waitFor(() => {
    const node = document.querySelector(`[data-fashion-design-revise="${id}"]`)
    if (node === null) throw new Error(`missing revise entry ${id}`)
    return node
  })
}

describe('DesignDirectionsPage concept revision recovery', () => {
  it('reports a color-only pair as insufficient structural difference', async () => {
    const host = revisionHost(colorOnlyConcepts())
    revisionPage(host)
    const reason = await screen.findByText(/方向ca \/ 方向cb/)
    expect(reason.textContent).toContain(zh['design.diff.colorOnly'])
    expect(document.body.textContent).not.toContain('pair-ca-cb')
  })

  it('keeps revise entries after the Host rejects review-ready', async () => {
    const host = revisionHost(colorOnlyConcepts())
    revisionPage(host)
    fireEvent.click(await screen.findByRole('button', { name: zh['design.markReviewReady'] }))
    expect((await screen.findByRole('alert')).textContent).toBe(zh['design.error.precondition'])
    expect(host.markReviewReady).toHaveBeenCalledWith({ projectId: PROJECT, conceptSetId: 'set-1', expectedRevision: 5 })
    expect(document.querySelectorAll('[data-fashion-design="open-revise-concept"]')).toHaveLength(3)
  })

  it('prefills the revise form from the recorded Concept', async () => {
    const host = revisionHost(colorOnlyConcepts())
    revisionPage(host)
    fireEvent.click(await reviseButton('cb'))
    await waitFor(() => { expect(document.querySelector('[data-fashion-design="revise-concept"]')).not.toBeNull() })
    expect(document.querySelector('[data-fashion-design="revise-concept"]')?.getAttribute('data-fashion-design-revise-target')).toBe('cb')
    expect(field('revise-conceptName').value).toBe('方向cb')
    expect(field('revise-silhouette').value).toBe('H')
    expect(field('revise-colorDirection').value).toBe('燕麦色')
    expect(field('revise-constructionAndDetails').value).toBe('暗门襟')
    expect(field('revise-productionUnknowns').value).toBe('面料供应')
    expect(document.querySelector('[data-fashion-design="revise-concept-revision"]')?.textContent).toContain('0')
    expect(document.querySelector('[data-fashion-design="create-concept"]')).toBeNull()
    expect(document.querySelector('[data-fashion-design="mark-review-ready"]')).toBeNull()
  })

  it('revises the Concept at its revision, re-runs the check, and reaches review_ready', async () => {
    const host = revisionHost(colorOnlyConcepts())
    revisionPage(host)
    fireEvent.click(await screen.findByRole('button', { name: zh['design.markReviewReady'] }))
    await screen.findByRole('alert')
    fireEvent.click(await reviseButton('cb'))
    fireEvent.change(field('revise-silhouette'), { target: { value: 'O' } })
    fireEvent.change(field('revise-materialDirection'), { target: { value: '羊毛混纺' } })
    const evaluationsBefore = host.evaluate.mock.calls.length
    fireEvent.click(document.querySelector('[data-fashion-design="submit-revise-concept"]')!)

    await waitFor(() => { expect(host.reviseConcept).toHaveBeenCalledTimes(1) })
    expect(host.reviseConcept).toHaveBeenCalledWith({
      projectId: PROJECT,
      conceptId: 'cb',
      expectedRevision: 0,
      conceptName: '方向cb',
      designIntent: '通勤',
      silhouette: 'O',
      proportionAndLength: '中长',
      materialDirection: '羊毛混纺',
      colorDirection: '燕麦色',
      constructionAndDetails: ['暗门襟'],
      functionalValue: ['防泼水'],
      targetUseScenarios: ['通勤'],
      originalTransformationNotes: ['改写领型'],
      productionUnknowns: ['面料供应'],
    })

    await waitFor(() => {
      expect(document.querySelector('[data-fashion-design-concept="cb"] [data-fashion-design-concept-revision]')
        ?.getAttribute('data-fashion-design-concept-revision')).toBe('1')
    })
    expect(host.evaluate.mock.calls.length).toBeGreaterThan(evaluationsBefore)
    expect(document.querySelector('[data-fashion-design="revise-concept"]')).toBeNull()
    expect(document.body.textContent).not.toContain(zh['design.diff.colorOnly'])
    expect(screen.queryByRole('alert')).toBeNull()

    fireEvent.click(await screen.findByRole('button', { name: zh['design.markReviewReady'] }))
    await waitFor(() => {
      expect(host.markReviewReady).toHaveBeenLastCalledWith({ projectId: PROJECT, conceptSetId: 'set-1', expectedRevision: 6 })
    })
    await waitFor(() => {
      expect(document.querySelector('[data-fashion-design="concept-set-status"]')?.textContent).toContain(zh['design.status.reviewReady'])
    })
    expect(document.querySelector('[data-fashion-design="open-revise-concept"]')).toBeNull()
  })

  it('shows a localized conflict when the Concept revision moved', async () => {
    const host = revisionHost(colorOnlyConcepts())
    host.reviseConcept.mockResolvedValueOnce({ ok: false, failure: 'conflict' })
    revisionPage(host)
    fireEvent.click(await reviseButton('cb'))
    fireEvent.click(document.querySelector('[data-fashion-design="submit-revise-concept"]')!)
    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toBe(zh['design.error.conflict'])
    expect(alert.textContent).not.toContain('fashion-design/')
    expect(document.querySelector('[data-fashion-design="revise-concept"]')).not.toBeNull()
  })

  it('renders no revise entry for R0', async () => {
    const host = revisionHost(colorOnlyConcepts())
    revisionPage(host, { getProject: async () => project('read-only') })
    expect(await screen.findByText(zh['design.r0Readonly'])).toBeTruthy()
    expect(document.querySelector('[data-fashion-design="open-revise-concept"]')).toBeNull()
    expect(document.querySelector('[data-fashion-design="revise-concept"]')).toBeNull()
  })

  it('renders no revise entry or form while the project is loading', async () => {
    const host = revisionHost(colorOnlyConcepts())
    let release: (value: ProjectView) => void = () => {}
    revisionPage(host, { getProject: () => new Promise<ProjectView>((resolve) => { release = resolve }) })
    expect(document.querySelector('[data-fashion-page="design-directions-loading"]')).not.toBeNull()
    expect(document.querySelector('[data-fashion-design="open-revise-concept"]')).toBeNull()
    expect(document.querySelector('[data-fashion-design="revise-concept"]')).toBeNull()
    release(project('editable'))
    await waitFor(() => { expect(document.querySelectorAll('[data-fashion-design="open-revise-concept"]')).toHaveLength(3) })
    expect(document.querySelector('[data-fashion-design="revise-concept"]')).toBeNull()
  })
})

describe('DesignVisualPage', () => {
  function visualPage(visual: Record<string, unknown>): void {
    render(
      <DesignVisualPage
        projectId={PROJECT}
        conceptId="c1"
        visualDraftId="v1"
        getVisualDraft={async () => ({
          id: 'v1',
          generationMode: 'manual_upload',
          status: 'draft',
          aiDisclosure: 'none',
          usageBoundary: 'internal',
          ...visual,
        }) as unknown as VisualDraft}
        openConcept={vi.fn()}
        t={t}
      />,
    )
  }

  it('names a missing artifact and credential instead of rendering placeholder values', async () => {
    visualPage({ artifactRef: null, contentCredential: null })
    await screen.findByText(zh['design.visualTitle'])
    expect(document.querySelector('[data-fashion-design="visual-artifact-ref"]')?.textContent).toBe(zh['design.artifactRefNone'])
    expect(document.querySelector('[data-fashion-design="visual-content-credential"]')?.textContent).toBe(zh['design.contentCredentialNone'])
    expect(document.body.textContent).not.toContain('not_available')
  })

  it('shows the recorded artifact and credential status', async () => {
    visualPage({ artifactRef: 'artifact-7', contentCredential: { status: 'verified' } })
    await screen.findByText(zh['design.visualTitle'])
    expect(document.querySelector('[data-fashion-design="visual-artifact-ref"]')?.textContent).toBe('artifact-7')
    expect(document.querySelector('[data-fashion-design="visual-content-credential"]')?.textContent).toBe('verified')
  })
})

describe('designWriteFailure', () => {
  const rejection = (code: string): Error => Object.assign(new Error(code), { rpcError: { code, message: code } })

  it('classifies Host codes into localized categories', () => {
    expect(designWriteFailure(rejection('fashion-design/revision-conflict'))).toBe('conflict')
    expect(designWriteFailure(rejection('fashion-design/project-read-only'))).toBe('read-only')
    expect(designWriteFailure(rejection('fashion-design/brief-not-found'))).toBe('not-found')
    expect(designWriteFailure(rejection('fashion-design/differentiation-failed'))).toBe('precondition')
    expect(designWriteFailure(rejection('fashion-design/unexpected'))).toBe('failed')
    expect(designWriteFailure(new Error('network'))).toBe('failed')
  })
})
