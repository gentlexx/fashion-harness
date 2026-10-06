/** @vitest-environment jsdom */
/**
 * Evaluation page load states: a failed read is not rendered as an empty list,
 * enums and times are localized, and write controls appear only for a loaded
 * editable project.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import type { ProjectView } from '@gentlexx/dsh-fashion-project/types'
import { EvaluationPages, type EvaluationPagesProps } from '../src/client/evaluation/EvaluationPages.tsx'
import { en, type FashionKey } from '../src/client/locales.ts'

const t = (key: FashionKey): string => en[key]

function project(overrides: Partial<ProjectView> = {}): ProjectView {
  return {
    id: 'p1' as never,
    title: 'Project',
    origin: 'user',
    accessMode: 'editable',
    createdAt: '2026-09-24T00:00:00.000Z',
    updatedAt: '2026-09-24T00:00:00.000Z',
    revision: 0,
    ...overrides,
  } as ProjectView
}

function props(listRuns: EvaluationPagesProps['listRuns']): EvaluationPagesProps {
  return {
    projectId: 'p1',
    mode: 'evaluations',
    getProject: async () => project(),
    listDefinitions: async () => [],
    listCases: async () => [],
    listRuns,
    getRuleResults: async () => [],
    listAssessments: async () => [],
    listImprovements: async () => [],
    recordImprovementDecision: vi.fn(),
    runEvaluation: vi.fn(),
    recordAssessment: vi.fn(),
    exportReport: vi.fn(),
    openRun: vi.fn(),
    openImprovement: vi.fn(),
    openOverview: vi.fn(),
    locale: 'en',
    t,
  }
}

const WRITE_SELECTORS = '[data-fashion-evaluation-run], [data-fashion-assessment]'

afterEach(() => {
  cleanup()
})

describe('EvaluationPages load states', () => {
  it('shows loading, then an error with retry instead of the empty-list text', async () => {
    const listRuns = vi.fn<EvaluationPagesProps['listRuns']>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce([{
        id: 'run-1',
        verdict: 'pass',
        executionStatus: 'completed',
        startedAt: '2026-09-24T00:00:00.000Z',
      } as never])
    const view = render(<EvaluationPages {...props(listRuns)} />)
    expect(screen.getByText(en['evaluations.loading'])).toBeTruthy()
    expect(await screen.findByText(en['evaluations.loadError'])).toBeTruthy()
    expect(screen.queryByText(en['evaluations.empty'])).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: en['evaluations.retry'] }))
    await screen.findByRole('button', { name: new RegExp(en['evaluations.runLabel']) })
    const run = view.container.querySelector('[data-fashion-run="run-1"]')!
    expect(run.textContent).toContain(`${en['evaluations.runLabel']} · ${en['evaluations.enum.verdict.pass']} · ${en['evaluations.enum.execution.completed']} · `)
    expect(run.querySelector('time')?.getAttribute('dateTime')).toBe('2026-09-24T00:00:00.000Z')
    expect(run.textContent).not.toContain('2026-09-24T00:00:00.000Z')
    expect(run.textContent).not.toContain('run-1')
    expect(screen.queryByText(en['evaluations.loadError'])).toBeNull()
    expect(listRuns).toHaveBeenCalledTimes(2)
  })

  it('shows the empty-list text only after a successful read', async () => {
    render(<EvaluationPages {...props(async () => [])} />)
    expect(await screen.findByText(en['evaluations.empty'])).toBeTruthy()
    expect(screen.queryByText(en['evaluations.loadError'])).toBeNull()
  })

  it('keeps the deliverable context visible while explaining the project-scoped run', async () => {
    const view = render(
      <EvaluationPages
        {...props(async () => [])}
        followUpRef={{ deliverableId: 'd1', deliverableRevision: 4, conceptId: 'c1', conceptRevision: 3 }}
      />,
    )
    await within(view.container).findByText(en['evaluations.empty'])
    const context = view.container.querySelector('[data-fashion-evaluation-follow-up="d1"]')!
    expect(context.textContent).toContain(`${en['deliverable.revision']}: 4`)
    expect(context.textContent).toContain(`${en['feedback.conceptRevision']}: 3`)
    expect(context.textContent).toContain(en['evaluations.followUpProjectScope'])
    expect(context.textContent).not.toContain('d1')
  })

  it('offers localized human ratings on a run', async () => {
    const view = render(<EvaluationPages {...props(async () => [])} mode="run" runId="run-1" />)
    await within(view.container).findByText(en['evaluations.empty'])
    await within(view.container).findByRole('button', { name: en['evaluations.exportReport'] })
    const options = [...view.container.querySelectorAll('select[name="rating"] option')]
    expect(options.map(option => option.getAttribute('value')))
      .toEqual(['meets', 'partly_meets', 'does_not_meet', 'unable_to_assess'])
    expect(options.map(option => option.textContent)).toEqual([
      en['evaluations.enum.rating.meets'],
      en['evaluations.enum.rating.partlyMeets'],
      en['evaluations.enum.rating.doesNotMeet'],
      en['evaluations.enum.rating.unableToAssess'],
    ])
  })
})

describe('EvaluationPages labels', () => {
  const definitions = async () => [{ ruleDefinitions: [{ ruleId: 'rule-three-concepts', title: 'Three concepts' }] } as never]

  it('names a synthetic negative case by the rule it exercises instead of its case id', async () => {
    const cases = async () => [{
      id: 'case-neg-01',
      title: 'case-neg-01',
      fixtureKind: 'synthetic_negative',
      expectedRuleOutcomes: [{ ruleId: 'rule-three-concepts', status: 'fail' }],
    } as never]
    const view = render(<EvaluationPages {...props(async () => [])} listDefinitions={definitions} listCases={cases} />)
    await within(view.container).findByText(en['evaluations.empty'])
    const row = await within(view.container).findByText(`${en['evaluations.caseNegative']}${en['common.labelSeparator']}Three concepts`, { selector: '[data-fashion-case]' })
    expect(row.textContent).not.toContain('case-neg-01')
  })

  it('separates the criterion from its rating with the locale separator', async () => {
    const assessments = async () => [{ id: 'as1', criterionId: 'fit', rating: 'meets', reason: 'clear' } as never]
    const view = render(<EvaluationPages {...props(async () => [])} mode="run" runId="run-1" listAssessments={assessments} />)
    const row = await waitForAssessment(view.container)
    expect(row.textContent).toBe(`fit${en['common.labelSeparator']}${en['evaluations.enum.rating.meets']} · clear`)
  })

  async function waitForAssessment(container: HTMLElement): Promise<Element> {
    await within(container).findByText(/clear/)
    return container.querySelector('[data-fashion-assessment-id="as1"]')!
  }
})

describe('EvaluationPages report export', () => {
  const artifacts = [
    { id: 'rep-json', runId: 'run-1', format: 'canonical_json', text: '{"verdict":"pass"}' },
    { id: 'rep-md', runId: 'run-1', format: 'markdown', text: '# Evaluation report\n' },
  ] as never

  it('lists the returned report files with view and download actions', async () => {
    const exportReport = vi.fn(async () => artifacts)
    const view = render(<EvaluationPages {...props(async () => [])} mode="run" runId="run-1" exportReport={exportReport} />)
    const page = within(view.container)
    fireEvent.click(await page.findByRole('button', { name: en['evaluations.exportReport'] }))
    const list = await page.findByRole('region', { name: en['evaluations.reportArtifacts'] })
    expect(exportReport).toHaveBeenCalledWith('run-1')
    expect(page.getByText(en['evaluations.exported'])).toBeTruthy()
    const separator = en['common.labelSeparator']
    const jsonDownload = within(list).getByRole('link', { name: `${en['evaluations.downloadArtifact']}${separator}${en['evaluations.artifactJson']}` })
    expect(jsonDownload.getAttribute('download')).toBe('evaluation-report-run-1.json')
    expect(decodeURIComponent(jsonDownload.getAttribute('href')!)).toBe('data:application/json;charset=utf-8,{"verdict":"pass"}')
    const mdDownload = within(list).getByRole('link', { name: `${en['evaluations.downloadArtifact']}${separator}${en['evaluations.artifactMarkdown']}` })
    expect(mdDownload.getAttribute('download')).toBe('evaluation-report-run-1.md')
    const viewMarkdown = within(list).getByRole('button', { name: `${en['evaluations.viewArtifact']}${separator}${en['evaluations.artifactMarkdown']}` })
    expect(view.container.querySelector('[data-fashion-report-artifact-text]')).toBeNull()
    fireEvent.click(viewMarkdown)
    expect(view.container.querySelector('[data-fashion-report-artifact-text]')?.textContent).toBe('# Evaluation report\n')
    expect(viewMarkdown.getAttribute('aria-expanded')).toBe('true')
  })

  it('shows an export error instead of a file list when the export fails', async () => {
    const exportReport = vi.fn(async () => { throw new Error('render failed') })
    const view = render(<EvaluationPages {...props(async () => [])} mode="run" runId="run-1" exportReport={exportReport} />)
    const page = within(view.container)
    fireEvent.click(await page.findByRole('button', { name: en['evaluations.exportReport'] }))
    expect((await page.findByRole('alert')).textContent).toBe(en['evaluations.exportFailed'])
    expect(page.queryByRole('region', { name: en['evaluations.reportArtifacts'] })).toBeNull()
    expect(page.queryByText(en['evaluations.exported'])).toBeNull()
  })
})

describe('EvaluationPages improvement candidates', () => {
  it('shows each candidate source, project, data reality, and reason', async () => {
    const improvements = async () => [{
      status: 'proposed',
      events: [],
      item: {
        id: 'item-1',
        projectId: 'p1',
        dataReality: 'real_work',
        summary: 'Shorten the hem',
        targetRefs: [{ type: 'designer_feedback', id: 'fb-1', revision: 0, projectId: 'p1', contentHash: null }],
      },
    } as never]
    const view = render(<EvaluationPages {...props(async () => [])} mode="improvements" listImprovements={improvements} />)
    const provenance = await within(view.container).findByText('designer_feedback:fb-1@0')
    const list = provenance.closest('[data-fashion-improvement-provenance]')!
    expect(list.textContent).toContain(en['improvements.project'])
    expect(list.textContent).toContain('p1')
    expect(list.textContent).toContain(en['feedback.enum.reality.realWork'])
    expect(list.textContent).toContain('Shorten the hem')
    expect(within(view.container).getByText(en['improvements.acceptHint'])).toBeTruthy()
  })

  it('accepts a proposed candidate without starting work', async () => {
    const row = {
      status: 'proposed', events: [],
      item: { id: 'item-1', projectId: 'p1', dataReality: 'real_work', summary: 'Shorten the hem', targetRefs: [] },
    } as never
    const accepted = { ...(row as object), status: 'accepted' } as never
    const recordImprovementDecision = vi.fn().mockResolvedValue(accepted)
    const view = render(<EvaluationPages {...props(async () => [])} mode="improvement" itemId="item-1" listImprovements={async () => [row]} recordImprovementDecision={recordImprovementDecision} />)
    const page = within(view.container)
    await page.findByRole('button', { name: en['improvements.accept'] })
    fireEvent.change(page.getByRole('textbox', { name: en['improvements.decisionReason'] }), { target: { value: 'Planner accepts for later review.' } })
    fireEvent.click(page.getByRole('button', { name: en['improvements.accept'] }))
    expect(recordImprovementDecision).toHaveBeenCalledWith({ projectId: 'p1', itemId: 'item-1', action: 'accepted', reason: 'Planner accepts for later review.', confirmedPlanner: true })
    expect(await page.findByRole('button', { name: `Shorten the hem · ${en['improvements.enum.status.accepted']}` })).toBeTruthy()
  })
})

describe('EvaluationPages write entries', () => {
  it('shows no write form while the project read is still pending', () => {
    const view = render(
      <EvaluationPages {...props(async () => [])} getProject={() => new Promise<ProjectView | undefined>(() => {})} />,
    )
    expect(view.container.querySelector(WRITE_SELECTORS)).toBeNull()
  })

  it('shows no write form or export entry on a loaded read-only project', async () => {
    const readOnly = project({ origin: 'public-rebuild', accessMode: 'read-only' })
    const listRuns = async () => [{
      id: 'run-1',
      verdict: 'pass',
      executionStatus: 'completed',
      startedAt: '2026-09-24T00:00:00.000Z',
    } as never]
    const list = render(<EvaluationPages {...props(listRuns)} getProject={async () => readOnly} />)
    await within(list.container).findByText(en['evaluations.r0Banner'], { selector: '[data-fashion-evaluation-r0]' })
    expect(list.container.querySelector(WRITE_SELECTORS)).toBeNull()
    cleanup()
    const run = render(<EvaluationPages {...props(listRuns)} getProject={async () => readOnly} mode="run" runId="run-1" />)
    await within(run.container).findByText(en['evaluations.r0Banner'], { selector: '[data-fashion-evaluation-r0]' })
    expect(run.container.querySelector(WRITE_SELECTORS)).toBeNull()
    expect(within(run.container).queryByRole('button', { name: en['evaluations.exportReport'] })).toBeNull()
  })

  it('shows the run form once an editable project has loaded', async () => {
    const view = render(<EvaluationPages {...props(async () => [])} />)
    await within(view.container).findByText(en['evaluations.empty'])
    await within(view.container).findByRole('button', { name: en['evaluations.run'] })
    expect(view.container.querySelector('[data-fashion-evaluation-run]')).not.toBeNull()
  })
})
