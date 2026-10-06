/** @vitest-environment jsdom */
/**
 * Discoverable F4 entries: the project Overview and the deliverable surfaces
 * must reach designer feedback, outcomes, fixed evaluations, and improvement
 * items without a hand-typed URL, in the Phase-1 business order, while the
 * public case stays read-only.
 */
import { describe, expect, it, vi } from 'vitest'
import { useLayoutEffect } from 'react'
import { render, fireEvent, waitFor, within } from '@testing-library/react'
import type { ProjectView } from '@gentlexx/dsh-fashion-project/types'
import type { DesignDeliverable, ExportArtifactView } from '@gentlexx/dsh-fashion-design/types'
import { ProjectOverviewPage } from '../src/client/pages/ProjectOverviewPage.tsx'
import { DeliverableDetailPage, DeliverablesHomePage } from '../src/client/review/ReviewPages.tsx'
import { R0_PROJECT_ID } from '../src/client/routes.ts'
import { zh, type FashionKey } from '../src/client/locales.ts'

const t = (key: FashionKey): string => zh[key]

function projectView(overrides: Partial<ProjectView> = {}): ProjectView {
  return {
    id: 'u1' as never,
    title: '用户项目',
    origin: 'user',
    accessMode: 'editable',
    createdAt: '2026-09-24T00:00:00.000Z',
    updatedAt: '2026-09-24T00:00:00.000Z',
    revision: 0,
    ...overrides,
  } as ProjectView
}

const DELIVERABLE = {
  id: 'd1' as never,
  projectId: 'u1' as never,
  deliverableType: 'design_decision_package',
  audienceProfile: 'internal_review',
  reviewRoundId: 'round-1' as never,
  snapshotRef: { id: 's1', revision: 0 },
  snapshotHash: 'hash',
  briefRef: { id: 'b1', revision: 0 },
  conceptSetRef: { id: 'cs1', revision: 0 },
  selectedConceptRef: { id: 'c1', revision: 3 },
  approvalDecisionRef: { id: 'ad1', revision: 0 },
  sourceManifestRef: { id: 'sm1', revision: 0 },
  artifactRefs: [],
  knownRisks: [],
  limitations: ['公开资料重建'],
  handoffTarget: null,
  status: 'ready',
  frozenBy: 'local-human',
  frozenAt: '2026-09-24T00:00:00.000Z',
  invalidatedAt: null,
  failureReason: null,
  rendererVersion: 'v0',
  origin: 'user',
  accessMode: 'editable',
  createdBy: 'local-human',
  updatedBy: 'local-human',
  schemaVersion: 0,
  archivedAt: null,
  staleReason: null,
  createdAt: '2026-09-24T00:00:00.000Z',
  updatedAt: '2026-09-24T00:00:00.000Z',
  revision: 4,
} as unknown as DesignDeliverable

const ARTIFACTS = [
  {
    id: 'a1' as never,
    deliverableId: 'd1' as never,
    kind: 'json',
    mediaType: 'application/json',
    filename: 'decision.json',
    relativePath: 'decision.json',
    byteLength: 2,
    contentSha256: 'sha',
    textContent: '{}',
    origin: 'user',
    accessMode: 'editable',
    createdBy: 'local-human',
    updatedBy: 'local-human',
    schemaVersion: 0,
    archivedAt: null,
    staleReason: null,
    createdAt: '2026-09-24T00:00:00.000Z',
    updatedAt: '2026-09-24T00:00:00.000Z',
    revision: 0,
  },
] as unknown as readonly ExportArtifactView[]

function followUpSpies() {
  return {
    openDeliverables: vi.fn(),
    openFeedback: vi.fn(),
    openOutcomes: vi.fn(),
    openEvaluations: vi.fn(),
    openImprovements: vi.fn(),
  }
}

describe('project overview follow-up entries', () => {
  it('offers every F4 entry in business order and passes the project id', async () => {
    const followUp = followUpSpies()
    const view = render(
      <ProjectOverviewPage
        projectId="u1"
        locale="zh"
        getProject={async () => projectView()}
        openProjects={vi.fn()}
        openAgent={vi.fn()}
        openResearch={vi.fn()}
        openReview={vi.fn()}
        openDirections={vi.fn()}
        readStageObservations={vi.fn(async () => ({
          researchTasks: 0,
          opportunityBriefs: 0,
          conceptSets: 0,
          reviewRounds: 0,
          deliverables: 0,
        }))}
        followUp={followUp}
        t={t}
      />,
    )
    const page = within(view.container)
    await waitFor(() => {
      expect(view.container.querySelector('[data-fashion-overview-section="follow-up"]')).toBeTruthy()
    })
    const section = view.container.querySelector('[data-fashion-overview-section="follow-up"]')!
    // Deliverables → designer feedback → development/market outcomes → fixed
    // evaluations → improvement items. Human assessment lives inside a run,
    // which the hint states rather than inventing a sixth entry.
    expect([...section.querySelectorAll('[data-fashion-overview]')].map(node => node.getAttribute('data-fashion-overview')))
      .toEqual(['open-deliverables', 'open-feedback', 'open-outcomes', 'open-evaluations', 'open-improvements'])
    expect(section.textContent).toContain(zh['overview.followUpHint'])
    expect(page.queryByText(zh['overview.followUpReadOnly'])).toBeNull()

    for (const [attribute, spy] of [
      ['open-deliverables', followUp.openDeliverables],
      ['open-feedback', followUp.openFeedback],
      ['open-outcomes', followUp.openOutcomes],
      ['open-evaluations', followUp.openEvaluations],
      ['open-improvements', followUp.openImprovements],
    ] as const) {
      fireEvent.click(section.querySelector(`[data-fashion-overview="${attribute}"]`)!)
      expect(spy, attribute).toHaveBeenCalledWith('u1')
    }
  })

  it('marks the public case read-only while keeping its recorded entries readable', async () => {
    const followUp = followUpSpies()
    const view = render(
      <ProjectOverviewPage
        projectId={R0_PROJECT_ID}
        locale="zh"
        getProject={async () => projectView({
          id: R0_PROJECT_ID as never,
          title: 'R0',
          origin: 'public-rebuild',
          accessMode: 'read-only',
        })}
        openProjects={vi.fn()}
        openAgent={vi.fn()}
        openResearch={vi.fn()}
        openReview={vi.fn()}
        openDirections={vi.fn()}
        readStageObservations={vi.fn(async () => ({
          researchTasks: 0,
          opportunityBriefs: 0,
          conceptSets: 0,
          reviewRounds: 0,
          deliverables: 0,
        }))}
        followUp={followUp}
        t={t}
      />,
    )
    await waitFor(() => {
      expect(view.container.querySelector('[data-fashion-overview="follow-up-read-only"]')).toBeTruthy()
    })
    const section = view.container.querySelector('[data-fashion-overview-section="follow-up"]')!
    fireEvent.click(section.querySelector('[data-fashion-overview="open-feedback"]')!)
    expect(followUp.openFeedback).toHaveBeenCalledWith(R0_PROJECT_ID)
  })
})

describe('project overview stage observations', () => {
  function renderOverview(readStageObservations: () => Promise<{
    researchTasks: number
    opportunityBriefs: number
    conceptSets: number
    reviewRounds: number
    deliverables: number
  }>) {
    return render(
      <ProjectOverviewPage
        projectId="u1"
        locale="zh"
        getProject={async () => projectView()}
        openProjects={vi.fn()}
        openAgent={vi.fn()}
        openResearch={vi.fn()}
        openReview={vi.fn()}
        openDirections={vi.fn()}
        readStageObservations={readStageObservations}
        followUp={followUpSpies()}
        t={t}
      />,
    )
  }

  it('shows a loading state instead of empty stages until observations settle', async () => {
    const view = renderOverview(() => new Promise(() => {}))
    await waitFor(() => {
      expect(view.container.querySelector('[data-fashion-stages="loading"]')).toBeTruthy()
    })
    expect(view.container.querySelector('[data-fashion-stages="loading"]')?.textContent).toBe(zh['overview.stagesLoading'])
  })

  it('reports an unreadable observation instead of claiming nothing was recorded', async () => {
    const view = renderOverview(async () => { throw new Error('stale store') })
    await waitFor(() => {
      expect(view.container.querySelector('[data-fashion-stages="error"]')).toBeTruthy()
    })
    expect(view.container.querySelector('[data-fashion-stages="loading"]')).toBeNull()
  })
})

describe('project overview stage observations across a project switch', () => {
  type Observations = {
    researchTasks: number
    opportunityBriefs: number
    conceptSets: number
    reviewRounds: number
    deliverables: number
  }
  const ALL_RECORDED: Observations = { researchTasks: 1, opportunityBriefs: 1, conceptSets: 1, reviewRounds: 1, deliverables: 1 }
  const RECORDED = '[data-fashion-stage-state="pipeline.recorded"]'

  function CommitProbe({ onCommit }: { onCommit: () => void }) {
    useLayoutEffect(() => { onCommit() })
    return null
  }

  function renderSwitch(readB: () => Promise<Observations>) {
    const commits: number[] = []
    const container = document.body.appendChild(document.createElement('div'))
    const read = (projectId: string) => projectId === 'a' ? Promise.resolve(ALL_RECORDED) : readB()
    const page = (projectId: string) => (
      <>
        <ProjectOverviewPage
          projectId={projectId}
          locale="zh"
          getProject={async () => projectView({ id: projectId as never })}
          openProjects={vi.fn()}
          openAgent={vi.fn()}
          openResearch={vi.fn()}
          openReview={vi.fn()}
          openDirections={vi.fn()}
          readStageObservations={read}
          followUp={followUpSpies()}
          t={t}
        />
        <CommitProbe onCommit={() => { commits.push(container.querySelectorAll(RECORDED).length) }} />
      </>
    )
    const view = render(page('a'), { container })
    return { view, commits, switchToB: () => view.rerender(page('b')) }
  }

  async function settleOnA(view: ReturnType<typeof render>) {
    await waitFor(() => {
      expect(view.container.querySelectorAll(RECORDED).length).toBe(5)
    })
  }

  it('shows no counts from the previous project while the next project loads', async () => {
    const { view, commits, switchToB } = renderSwitch(() => new Promise(() => {}))
    await settleOnA(view)
    commits.length = 0
    switchToB()
    await waitFor(() => {
      expect(view.container.querySelector('[data-fashion-stages="loading"]')).toBeTruthy()
    })
    expect(commits.length).toBeGreaterThan(0)
    expect(commits.every(count => count === 0)).toBe(true)
    expect(view.container.querySelectorAll(RECORDED).length).toBe(0)
  })

  it('shows no counts from the previous project when the next project read fails', async () => {
    const { view, commits, switchToB } = renderSwitch(async () => { throw new Error('offline') })
    await settleOnA(view)
    commits.length = 0
    switchToB()
    await waitFor(() => {
      expect(view.container.querySelector('[data-fashion-stages="error"]')).toBeTruthy()
    })
    expect(commits.every(count => count === 0)).toBe(true)
    expect(view.container.querySelectorAll(RECORDED).length).toBe(0)
  })

  it('shows the next project counts once its read succeeds', async () => {
    const { view, commits, switchToB } = renderSwitch(async () => ({
      ...ALL_RECORDED,
      opportunityBriefs: 0,
      conceptSets: 0,
      reviewRounds: 0,
      deliverables: 0,
    }))
    await settleOnA(view)
    commits.length = 0
    switchToB()
    await waitFor(() => {
      expect(view.container.querySelectorAll(RECORDED).length).toBe(1)
    })
    expect(view.container.querySelector(`${RECORDED}[data-fashion-stage="research"]`)).toBeTruthy()
    expect(commits.every(count => count <= 1)).toBe(true)
  })
})

describe('deliverable follow-up entries', () => {
  function renderDeliverables(project: ProjectView, openFollowUp: () => void) {
    return render(
      <DeliverablesHomePage
        projectId={String(project.id)}
        getProject={async () => project}
        listDeliverables={async () => [DELIVERABLE]}
        openDeliverable={vi.fn()}
        openReviewHome={vi.fn()}
        openOverview={vi.fn()}
        openFollowUp={openFollowUp}
        t={t}
      />,
    )
  }

  it('reaches feedback from one listed deliverable with its exact revisions', async () => {
    const openFollowUp = vi.fn()
    const view = renderDeliverables(projectView(), openFollowUp)
    await waitFor(() => {
      expect(view.container.querySelector('[data-fashion-deliverable-follow-up="d1"]')).toBeTruthy()
    })
    expect(view.container.querySelector('[data-fashion-deliverables="open-follow-up"]')).toBeNull()
    fireEvent.click(view.container.querySelector('[data-fashion-deliverable-follow-up="d1"]')!)
    expect(openFollowUp).toHaveBeenCalledWith('u1', {
      deliverableId: 'd1',
      deliverableRevision: 4,
      conceptId: 'c1',
      conceptRevision: 3,
    })
  })

  it('offers no per-deliverable feedback entry on a read-only project', async () => {
    const view = renderDeliverables(
      projectView({ id: R0_PROJECT_ID as never, origin: 'public-rebuild', accessMode: 'read-only' }),
      vi.fn(),
    )
    await waitFor(() => {
      expect(view.container.querySelector('[data-fashion-deliverable="d1"]')).toBeTruthy()
    })
    expect(view.container.querySelector('[data-fashion-deliverable-follow-up]')).toBeNull()
  })

  it('carries the exact deliverable and concept revisions into every follow-up page', async () => {
    const spies = { openFeedback: vi.fn(), openOutcomes: vi.fn(), openEvaluations: vi.fn() }
    const view = renderDetail({ ...spies })
    await waitFor(() => {
      expect(view.container.querySelector('[data-fashion-deliverable="open-feedback"]')).toBeTruthy()
    })
    expect(view.container.querySelector('[data-fashion-deliverable-revision="4"]')?.textContent).toBe('4')
    expect(view.container.querySelector('[data-fashion-concept-revision="3"]')?.textContent).toBe('3')
    const page = view.container.querySelector('[data-fashion-page="deliverable-detail"]')!
    expect(page.textContent).toContain(zh['deliverable.enum.audience.internalReview'])
    expect(page.textContent).toContain(zh['deliverable.enum.status.ready'])
    expect(page.textContent).not.toContain('internal_review')

    const ref = { deliverableId: 'd1', deliverableRevision: 4, conceptId: 'c1', conceptRevision: 3 }
    fireEvent.click(view.container.querySelector('[data-fashion-deliverable="open-feedback"]')!)
    expect(spies.openFeedback).toHaveBeenCalledWith('u1', ref)
    fireEvent.click(view.container.querySelector('[data-fashion-deliverable="open-outcomes"]')!)
    expect(spies.openOutcomes).toHaveBeenCalledWith('u1', ref)
    fireEvent.click(view.container.querySelector('[data-fashion-deliverable="open-evaluations"]')!)
    expect(spies.openEvaluations).toHaveBeenCalledWith('u1', ref)

    const artifact = view.container.querySelector('[data-fashion-artifact="a1"]')!
    expect(artifact.textContent).toContain('decision.json')
    expect(artifact.textContent).toContain(`${zh['deliverable.kind']}${zh['common.labelSeparator']}${zh['deliverable.kindJson']}`)
    expect(artifact.textContent).not.toContain('json' + zh['common.labelSeparator'])
  })

  it('withholds the feedback write entry on the read-only public case but keeps read pages reachable', async () => {
    const view = renderDetail({
      projectId: R0_PROJECT_ID,
      getProject: async () => projectView({
        id: R0_PROJECT_ID as never,
        origin: 'public-rebuild',
        accessMode: 'read-only',
      }),
    })
    await waitFor(() => {
      expect(view.container.querySelector('[data-fashion-page="deliverable-detail"]')).toBeTruthy()
    })
    expect(view.container.querySelector('[data-fashion-deliverable="open-feedback"]')).toBeNull()
    expect(view.container.querySelector('[data-fashion-deliverable="open-outcomes"]')).toBeTruthy()
    expect(view.container.querySelector('[data-fashion-deliverable="open-evaluations"]')).toBeTruthy()
    expect(within(view.container).getByText(zh['deliverable.r0Readonly'])).toBeTruthy()
  })
})

describe('deliverable hash verification', () => {
  it('reports success when every artifact matches', async () => {
    const view = renderDetail({ verifyDeliverable: async () => ({ ok: true, mismatches: [] }) })
    const page = within(view.container)
    fireEvent.click(await page.findByRole('button', { name: zh['deliverable.verify'] }))
    expect(await page.findByText(zh['deliverable.verifyOk'])).toBeTruthy()
    expect(page.queryByText(zh['deliverable.verifyMismatch'])).toBeNull()
    expect(page.queryByText(zh['deliverable.verifyError'])).toBeNull()
  })

  it('lists every mismatched file and failed check when verification fails', async () => {
    const view = renderDetail({
      verifyDeliverable: async () => ({
        ok: false,
        mismatches: [
          'hash:json',
          'snapshot-identity:json',
          'missing:markdown',
          'manifest-json',
          'snapshot-recompute',
          'artifact-count',
          'future-check',
        ],
      }),
    })
    const page = within(view.container)
    fireEvent.click(await page.findByRole('button', { name: zh['deliverable.verify'] }))
    const alert = await page.findByRole('alert')
    expect(alert.textContent).toContain(zh['deliverable.verifyMismatch'])
    const missing = zh['deliverable.verifyMissingArtifact'] + zh['common.labelSeparator']
    expect([...alert.querySelectorAll('li')].map(item => item.textContent)).toEqual([
      'decision.json',
      `${missing}${zh['deliverable.kindMarkdown']}`,
      `${missing}${zh['deliverable.kindManifest']}`,
      zh['deliverable.verifySnapshotMismatch'],
      zh['deliverable.verifyArtifactCount'],
      zh['deliverable.verifyOtherCheck'],
    ])
    expect(page.queryByText(zh['deliverable.verifyOk'])).toBeNull()
  })

  it('reports an execution failure, not a content mismatch, when the call rejects', async () => {
    const view = renderDetail({ verifyDeliverable: async () => { throw new Error('offline') } })
    const page = within(view.container)
    fireEvent.click(await page.findByRole('button', { name: zh['deliverable.verify'] }))
    expect(await page.findByText(zh['deliverable.verifyError'])).toBeTruthy()
    expect(page.queryByText(zh['deliverable.verifyMismatch'])).toBeNull()
    expect(page.queryByText(zh['deliverable.verifyOk'])).toBeNull()
  })
})

type DetailProps = Parameters<typeof DeliverableDetailPage>[0]

function renderDetail(overrides: Partial<DetailProps> = {}) {
  const props: DetailProps = {
    projectId: 'u1',
    deliverableId: 'd1',
    getProject: async () => projectView(),
    getDeliverable: async () => DELIVERABLE,
    listDeliverableArtifacts: async () => ARTIFACTS,
    verifyDeliverable: async () => ({ ok: true, mismatches: [] }),
    openDeliverables: vi.fn(),
    openFeedback: vi.fn(),
    openOutcomes: vi.fn(),
    openEvaluations: vi.fn(),
    t,
    ...overrides,
  }
  return render(<DeliverableDetailPage {...props} />)
}

describe('locale coverage', () => {
  it('translates every follow-up key in both locales', async () => {
    const { en } = await import('../src/client/locales.ts')
    const keys: readonly FashionKey[] = [
      'overview.openDeliverables',
      'overview.openFeedback',
      'overview.openOutcomes',
      'overview.openEvaluations',
      'overview.openImprovements',
      'overview.followUp',
      'overview.followUpHint',
      'overview.followUpReadOnly',
      'deliverable.kind',
      'deliverable.openFollowUp',
      'deliverable.revision',
      'deliverable.verifyMismatch',
      'deliverable.verifyError',
      'deliverable.verifyMissingArtifact',
      'deliverable.verifySnapshotMismatch',
      'deliverable.verifyArtifactCount',
      'deliverable.verifyOtherCheck',
      'feedback.conceptRevision',
      'feedback.targetDeliverable',
      'feedback.followUpMissing',
      'feedback.followUpStale',
      'evaluations.followUpContext',
      'evaluations.followUpProjectScope',
    ]
    for (const key of keys) {
      expect(zh[key], key).toBeTruthy()
      expect(en[key], key).toBeTruthy()
    }
  })
})
