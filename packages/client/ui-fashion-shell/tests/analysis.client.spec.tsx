/** @vitest-environment jsdom */
/** Analysis home renders R0 lists and open-analysis CTA wiring. */
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { AnalysisHomePage } from '../src/client/analysis/AnalysisHomePage.tsx'
import {
  AnalysisClusterPage,
  AnalysisItemPage,
  AnalysisSignalPage,
} from '../src/client/analysis/AnalysisDetailPages.tsx'
import { createFashionNavigation } from '../src/client/navigation.ts'
import type { FashionKey } from '../src/client/locales.ts'
import { zh } from '../src/client/locales.ts'
import type { MarketItem } from '@gentlexx/dsh-fashion-analysis/types'
import type { ProjectView } from '@gentlexx/dsh-fashion-project/types'
import type { Evidence, Sample, Source } from '@gentlexx/dsh-fashion-research/types'

const t = (key: FashionKey): string => zh[key]

const PROJECT: ProjectView = {
  id: 'p1' as never,
  title: 'P',
  origin: 'user' as const,
  accessMode: 'editable' as const,
  createdAt: '2026-09-24T00:00:00.000Z',
  updatedAt: '2026-09-24T00:00:00.000Z',
  revision: 0,
}

const MARKET_ITEM: MarketItem = {
  id: 'r0-item-e01' as never,
  projectId: 'p1' as never,
  taskId: 't1' as never,
  itemType: 'garment_product' as const,
  displayName: 'H&M Denim Utility Jacket',
  brandOrCreator: 'H&M',
  categoryCandidate: null,
  matchingMethod: 'manual' as const,
  matchingScore: null,
  observationLinks: [],
  dedupeStatus: 'unreviewed' as const,
  humanConfirmedBy: null,
  humanConfirmedAt: null,
  status: 'active' as const,
  origin: 'human' as const,
  accessMode: 'editable' as const,
  createdBy: 'local-human' as const,
  updatedBy: 'local-human' as const,
  schemaVersion: 0,
  archivedAt: null,
  staleReason: null,
  createdAt: '2026-09-24T00:00:00.000Z',
  updatedAt: '2026-09-24T00:00:00.000Z',
  revision: 0,
}

describe('AnalysisHomePage', () => {
  it('lists market items and opens details', async () => {
    const openItem = vi.fn()
    const loadWorkspace = vi.fn(async () => {})
    render(
      <AnalysisHomePage
        projectId="p1"
        taskId="t1"
        marketItems={{
          status: 'ready',
          items: [{
            id: 'm1' as never,
            projectId: 'p1' as never,
            taskId: 't1' as never,
            itemType: 'garment_product',
            displayName: 'Utility jacket',
            brandOrCreator: null,
            categoryCandidate: null,
            matchingMethod: 'manual',
            matchingScore: null,
            observationLinks: [],
            dedupeStatus: 'unreviewed',
            humanConfirmedBy: null,
            humanConfirmedAt: null,
            status: 'active',
            origin: 'human',
            accessMode: 'editable',
            createdBy: 'local-human',
            updatedBy: 'local-human',
            schemaVersion: 0,
            archivedAt: null,
            staleReason: null,
            createdAt: '2026-09-24T00:00:00.000Z',
            updatedAt: '2026-09-24T00:00:00.000Z',
            revision: 0,
          }],
          error: null,
        }}
        signals={{ status: 'ready', items: [], error: null }}
        clusters={{ status: 'ready', items: [], error: null }}
        opportunities={{ status: 'ready', items: [], error: null }}
        sources={{ status: 'ready', items: [], error: null }}
        samples={{ status: 'ready', items: [], error: null }}
        evidence={{ status: 'ready', items: [], error: null }}
        getProject={async () => ({
          id: 'p1' as never,
          title: 'P',
          origin: 'user',
          accessMode: 'editable',
          createdAt: '2026-09-24T00:00:00.000Z',
          updatedAt: '2026-09-24T00:00:00.000Z',
          revision: 0,
        })}
        loadWorkspace={loadWorkspace}
        loadTaskChildren={vi.fn(async () => {})}
        createMarketItem={vi.fn(async () => MARKET_ITEM)}
        createPopularitySignal={vi.fn()}
        createTrendCluster={vi.fn()}
        createDesignOpportunity={vi.fn()}
        openTask={vi.fn()}
        openItem={openItem}
        openSignal={vi.fn()}
        openCluster={vi.fn()}
        openOpportunity={vi.fn()}
        t={t}
      />,
    )
    const row = await screen.findByRole('button', { name: /Utility jacket/ })
    expect(row.querySelector('span')?.textContent)
      .toBe(`${zh['analysis.enum.dedupe.unreviewed']} · ${zh['analysis.enum.objectStatus.active']}`)
    expect(row.textContent).not.toMatch(/unreviewed|active|^·| · $/)
    expect(loadWorkspace).toHaveBeenCalledWith('p1', 't1')
    fireEvent.click(screen.getByRole('button', { name: /Utility jacket/ }))
    expect(openItem).toHaveBeenCalledWith('p1', 't1', 'm1')
  })
})

describe('analysis detail pages', () => {
  it('resolves the addressed record with one fetch and survives re-renders', async () => {
    const getItem = vi.fn(async () => MARKET_ITEM)
    const view = render(
      <AnalysisItemPage
        projectId="p1"
        taskId="t1"
        marketItemId="r0-item-e01"
        getProject={async () => PROJECT}
        getItem={getItem}
        openAnalysis={vi.fn()}
        t={t}
      />,
    )
    expect(await screen.findByText('H&M Denim Utility Jacket')).toBeTruthy()
    // The loader closes over fresh props every render; identity — not the
    // closure — keys the fetch, so re-rendering must not refetch or blank out.
    view.rerender(
      <AnalysisItemPage
        projectId="p1"
        taskId="t1"
        marketItemId="r0-item-e01"
        getProject={async () => PROJECT}
        getItem={getItem}
        openAnalysis={vi.fn()}
        t={t}
      />,
    )
    expect(screen.getByText('H&M Denim Utility Jacket')).toBeTruthy()
    expect(getItem).toHaveBeenCalledTimes(1)

    // Addressing a different record within the same page does refetch.
    view.rerender(
      <AnalysisItemPage
        projectId="p1"
        taskId="t1"
        marketItemId="r0-item-e02"
        getProject={async () => PROJECT}
        getItem={getItem}
        openAnalysis={vi.fn()}
        t={t}
      />,
    )
    expect(getItem).toHaveBeenCalledTimes(2)
  })

  it('names the in-flight state instead of rendering a blank page', () => {
    const view = render(
      <AnalysisSignalPage
        projectId="p1"
        taskId="t1"
        signalId="s1"
        getProject={async () => PROJECT}
        getSignal={() => new Promise(() => {})}
        openAnalysis={vi.fn()}
        t={t}
      />,
    )
    expect(within(view.container).getByText(zh['analysis.loading'])).toBeTruthy()
  })

  it('shows an in-app not-found state with a way back when the record is absent', async () => {
    const openAnalysis = vi.fn()
    const view = render(
      <AnalysisClusterPage
        projectId="p1"
        taskId="t1"
        clusterId="missing"
        getProject={async () => PROJECT}
        getCluster={async () => { throw Object.assign(new Error('gone'), { code: 'fashion-analysis/not-found' }) }}
        openAnalysis={openAnalysis}
        t={t}
      />,
    )
    const page = within(view.container)
    expect(await page.findByText(zh['analysis.notFound'])).toBeTruthy()
    fireEvent.click(page.getByRole('button', { name: zh['analysis.backAnalysis'] }))
    expect(openAnalysis).toHaveBeenCalledWith('p1', 't1')
  })

  it('builds the same absolute detail URL from every entry point', () => {
    const entryPaths = [
      '/projects/p1/overview',
      '/projects/p1/research/tasks/t1',
      '/projects/p1/research/tasks/t1/analysis',
    ]
    for (const pathname of entryPaths) {
      const pushed: string[] = []
      const history = {
        pushState: (_data: unknown, _unused: string, url?: string | URL | null) => { pushed.push(String(url)) },
        replaceState: () => {},
      }
      const navigation = createFashionNavigation(history, { pathname })
      navigation.navigate({
        kind: 'analysis-item',
        projectId: 'p1',
        taskId: 't1',
        marketItemId: 'r0-item-e01',
      })
      navigation.dispose()
      expect(pushed, pathname).toEqual([
        '/projects/p1/research/tasks/t1/analysis/items/r0-item-e01',
      ])
    }
  })
})

describe('analysis create entry', () => {
  const emptyList = { status: 'ready' as const, items: [] as const, error: null }
  const source: Source = {
    id: 'src1' as never,
    projectId: 'p1' as never,
    taskId: 't1' as never,
    locatorType: 'url' as const,
    url: 'https://example.test',
    urlNormalized: 'https://example.test/',
    attachmentRef: null,
    title: 'HM listing',
    publisherOrPlatform: 'H&M',
    sourceKind: 'product_page' as const,
    accessedAt: '2026-09-24T00:00:00.000Z',
    publishedAt: null,
    captureMode: 'manual_link' as const,
    usageBoundary: 'public_attributed' as const,
    externalProcessing: 'denied' as const,
    availabilityStatus: 'available' as const,
    attribution: 'H&M',
    contentFingerprint: null,
    origin: 'human' as const,
    accessMode: 'editable' as const,
    createdBy: 'local-human' as const,
    updatedBy: 'local-human' as const,
    schemaVersion: 0,
    archivedAt: null,
    createdAt: '2026-09-24T00:00:00.000Z',
    updatedAt: '2026-09-24T00:00:00.000Z',
    revision: 0,
  }
  const sample: Sample = {
    id: 'smp1' as never,
    projectId: 'p1' as never,
    taskId: 't1' as never,
    sourceId: 'src1' as never,
    label: 'Utility jacket sample',
    externalItemId: null,
    locator: null,
    observedAt: '2026-09-24T00:00:00.000Z',
    rawFields: [],
    screenshotRefs: [],
    note: null,
    status: 'confirmed' as const,
    origin: 'human' as const,
    accessMode: 'editable' as const,
    createdBy: 'local-human' as const,
    updatedBy: 'local-human' as const,
    schemaVersion: 0,
    archivedAt: null,
    createdAt: '2026-09-24T00:00:00.000Z',
    updatedAt: '2026-09-24T00:00:00.000Z',
    revision: 0,
  }
  const confirmed: Evidence = {
    id: 'e-confirmed' as never,
    projectId: 'p1' as never,
    taskId: 't1' as never,
    subjectType: 'sample' as const,
    subjectId: 'smp1' as never,
    observation: 'Utility jacket listing observed',
    claim: null,
    claimType: null,
    evidenceGrade: 'G1' as const,
    method: null,
    limitations: [],
    excerpt: null,
    reviewStatus: 'confirmed' as const,
    reviewedBy: 'local-human' as const,
    reviewedAt: '2026-09-24T00:00:00.000Z',
    reviewNote: 'ok',
    origin: 'human' as const,
    accessMode: 'editable' as const,
    createdBy: 'local-human' as const,
    updatedBy: 'local-human' as const,
    schemaVersion: 0,
    archivedAt: null,
    createdAt: '2026-09-24T00:00:00.000Z',
    updatedAt: '2026-09-24T00:00:00.000Z',
    revision: 1,
  }
  const draft = { ...confirmed, id: 'e-draft' as never, reviewStatus: 'draft' as const, reviewedBy: null, reviewedAt: null, reviewNote: null }

  function homeProps(overrides: Partial<Parameters<typeof AnalysisHomePage>[0]> = {}) {
    return {
      projectId: 'p1',
      taskId: 't1',
      marketItems: emptyList,
      signals: emptyList,
      clusters: emptyList,
      opportunities: emptyList,
      sources: { status: 'ready' as const, items: [source], error: null },
      samples: { status: 'ready' as const, items: [sample], error: null },
      evidence: { status: 'ready' as const, items: [confirmed, draft], error: null },
      getProject: async () => PROJECT,
      loadWorkspace: vi.fn(async () => {}),
      loadTaskChildren: vi.fn(async () => {}),
      createMarketItem: vi.fn(async () => MARKET_ITEM),
      createPopularitySignal: vi.fn(),
      createTrendCluster: vi.fn(),
      createDesignOpportunity: vi.fn(),
      openTask: vi.fn(),
      openItem: vi.fn(),
      openSignal: vi.fn(),
      openCluster: vi.fn(),
      openOpportunity: vi.fn(),
      t,
      ...overrides,
    }
  }

  it('lets an editable project create a market item from confirmed evidence only', async () => {
    const createMarketItem = vi.fn(async () => MARKET_ITEM)
    const view = render(<AnalysisHomePage {...homeProps({ createMarketItem })} />)
    expect(await view.findByText(zh['analysis.createItem'])).toBeTruthy()
    expect(view.container.querySelector('[data-fashion-analysis="create"]')).toBeTruthy()
    fireEvent.change(view.container.querySelector('[data-fashion-analysis="item-name"]')!, {
      target: { value: 'H&M Denim Utility Jacket' },
    })
    fireEvent.change(view.container.querySelector('[data-fashion-analysis="item-sample"]')!, {
      target: { value: 'smp1' },
    })
    fireEvent.click(view.container.querySelector('[data-fashion-analysis-evidence="e-confirmed"]')!)
    expect(view.container.querySelector('[data-fashion-analysis-evidence="e-draft"]')).toBeNull()
    fireEvent.click(view.container.querySelector('[data-fashion-analysis="item-submit"]')!)
    await waitFor(() => {
      expect(createMarketItem).toHaveBeenCalledOnce()
    })
    expect(createMarketItem).toHaveBeenCalledWith(expect.objectContaining({
      projectId: 'p1',
      taskId: 't1',
      displayName: 'H&M Denim Utility Jacket',
      observationLinks: [{
        sampleId: 'smp1',
        sourceId: 'src1',
        evidenceIds: ['e-confirmed'],
      }],
    }))
  })

  it('labels signal types and stores no UI copy when limitations are left empty', async () => {
    const createPopularitySignal = vi.fn(async () => ({}) as never)
    const view = render(<AnalysisHomePage {...homeProps({ createPopularitySignal })} />)
    await waitFor(() => {
      expect(view.container.querySelector('[data-fashion-analysis="create-signal"]')).toBeTruthy()
    })
    const options = [...view.container.querySelectorAll('[data-fashion-analysis="signal-type"] option')]
    expect(options.map(option => option.textContent)).toContain(zh['analysis.enum.signalType.crossSourcePresence'])
    expect(options.some(option => option.textContent === option.getAttribute('value'))).toBe(false)
    fireEvent.change(view.container.querySelector('[data-fashion-analysis="signal-platform"]')!, { target: { value: 'H&M' } })
    fireEvent.change(view.container.querySelector('[data-fashion-analysis="signal-value"]')!, { target: { value: '3' } })
    fireEvent.change(view.container.querySelector('[data-fashion-analysis="signal-unit"]')!, { target: { value: 'sources' } })
    fireEvent.click(view.container.querySelector('[data-fashion-analysis-signal-evidence="e-confirmed"]')!)
    fireEvent.click(view.container.querySelector('[data-fashion-analysis="signal-submit"]')!)
    await waitFor(() => {
      expect(createPopularitySignal).toHaveBeenCalledWith(expect.objectContaining({ limitations: [] }))
    })
  })

  it('shows the Opportunity review status localized and the signal value without a leading separator', async () => {
    const opportunity = { id: 'o1', projectId: 'p1', taskId: 't1', title: 'Utility capsule', reviewStatus: 'candidate', publicRebuildRecorded: false } as never
    const signal = { id: 's1', projectId: 'p1', taskId: 't1', platform: 'H&M', signalType: 'cross_source_presence', rawValue: '+35%', rawUnit: 'sources' } as never
    const view = render(
      <AnalysisHomePage
        {...homeProps({
          opportunities: { status: 'ready', items: [opportunity], error: null },
          signals: { status: 'ready', items: [signal], error: null },
        })}
      />,
    )
    const opportunityRow = await within(view.container).findByRole('button', { name: /Utility capsule/ })
    expect(opportunityRow.querySelector('span')?.textContent).toBe(zh['analysis.enum.review.candidate'])
    expect(opportunityRow.textContent).not.toContain('candidate')
    const signalMeta = view.container.querySelector('[data-fashion-analysis-signal="s1"] span')!
    expect(signalMeta.textContent).toBe('+35% sources')
  })

  it('hides the create forms on the public rebuild case', async () => {
    const view = render(
      <AnalysisHomePage
        {...homeProps({
          getProject: async () => ({ ...PROJECT, origin: 'public-rebuild', accessMode: 'read-only' }),
        })}
      />,
    )
    expect(await view.findByText(zh['analysis.r0Readonly'])).toBeTruthy()
    expect(view.container.querySelector('[data-fashion-analysis="create"]')).toBeNull()
  })
})

describe('unrecorded analysis fields', () => {
  it('names an unrecorded brand instead of a placeholder glyph', async () => {
    const view = render(
      <AnalysisItemPage
        projectId="p1"
        taskId="t1"
        marketItemId="r0-item-e01"
        getProject={async () => PROJECT}
        getItem={async () => ({ ...MARKET_ITEM, brandOrCreator: null })}
        openAnalysis={vi.fn()}
        t={t}
      />,
    )
    await within(view.container).findByText('H&M Denim Utility Jacket')
    expect(view.container.querySelector('[data-fashion-analysis="item-brand"]')?.textContent).toBe(zh['analysis.brandNotRecorded'])
    expect(view.container.textContent).not.toContain('—')
  })

  it('names each unrecorded window bound and keeps a recorded one', async () => {
    const view = render(
      <AnalysisSignalPage
        projectId="p1"
        taskId="t1"
        signalId="s1"
        getProject={async () => PROJECT}
        getSignal={async () => ({
          id: 's1',
          platform: 'xhs',
          signalType: 'search_growth',
          rawValue: 35,
          rawUnit: '%',
          methodVersion: 'manual-v1',
          windowStart: '2026-09-01',
          windowEnd: null,
          limitations: ['样本少'],
        }) as never}
        openAnalysis={vi.fn()}
        t={t}
      />,
    )
    const window = await waitFor(() => {
      const node = view.container.querySelector('[data-fashion-analysis="signal-window"]')
      if (node === null) throw new Error('missing window')
      return node
    })
    expect(window.textContent).toBe(`2026-09-01 → ${zh['analysis.windowNotRecorded']}`)
  })
})
