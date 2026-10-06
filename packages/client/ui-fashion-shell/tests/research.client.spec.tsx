// @vitest-environment jsdom
/** Research home + overview open-research entry tests (F2-01 Batch 3). */
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { ProjectId } from '@gentlexx/dsh-fashion-project'
import type { ProjectView } from '@gentlexx/dsh-fashion-project/types'
import type { ResearchListState } from '@gentlexx/dsh-api-fashion-research-controller/client'
import type { Evidence, ResearchTask, Source } from '@gentlexx/dsh-fashion-research/types'
import { EvidenceId, ResearchTaskId, SampleId, SourceId } from '../src/client/research/ids.ts'
import { ResearchHomePage } from '../src/client/research/ResearchHomePage.tsx'
import { ResearchTaskPage } from '../src/client/research/ResearchTaskPage.tsx'
import { SourceDetailPage } from '../src/client/research/SourceDetailPage.tsx'
import { EvidenceDetailPage } from '../src/client/research/EvidenceDetailPage.tsx'
import { ProjectOverviewPage } from '../src/client/pages/ProjectOverviewPage.tsx'
import { zh, type FashionKey } from '../src/client/locales.ts'
import { R0_PROJECT_ID } from '../src/client/routes.ts'
import tokens from '../src/client/FashionTokens.module.css'
import clsx from 'clsx'

const t = (key: FashionKey): string => zh[key]

function Theme({ children }: { children: ReactNode }) {
  return <div className={clsx(tokens.fashionTheme)}>{children}</div>
}

function project(partial: Partial<ProjectView> & Pick<ProjectView, 'id' | 'title' | 'origin'>): ProjectView {
  return {
    accessMode: partial.origin === 'public-rebuild' ? 'read-only' : 'editable',
    createdAt: '2026-09-21T12:00:00.000Z',
    updatedAt: '2026-09-22T12:00:00.000Z',
    revision: 0,
    ...partial,
  }
}

describe.sequential('ResearchHomePage', () => {
  it('lists tasks and opens create for editable projects', async () => {
    const user = project({ id: ProjectId('u1'), title: '用户项目', origin: 'user' })
    const tasks: ResearchListState<ResearchTask> = {
      status: 'ready',
      items: [{
        id: ResearchTaskId('t1'),
        projectId: ProjectId('u1'),
        title: '秋冬研究',
        note: null,
        status: 'draft',
        origin: 'human',
        accessMode: 'editable',
        revision: 0,
        createdAt: '2026-09-22T12:00:00.000Z',
        updatedAt: '2026-09-22T12:00:00.000Z',
        createdBy: 'local-human',
        updatedBy: 'local-human',
        schemaVersion: 0,
        archivedAt: null,
      }],
      error: null,
    }
    const openTaskNew = vi.fn()
    const openTask = vi.fn()
    render(
      <Theme>
        <ResearchHomePage
          projectId="u1"
          locale="zh"
          tasks={tasks}
          getProject={vi.fn(async () => user)}
          loadTasks={vi.fn(async () => {})}
          openOverview={vi.fn()}
          openTask={openTask}
          openTaskNew={openTaskNew}
          t={t}
        />
      </Theme>,
    )
    await waitFor(() => {
      expect(document.querySelector('[data-fashion-page="research-home"]')).toBeTruthy()
    })
    fireEvent.click(document.querySelector('[data-fashion-research-task="t1"]')!)
    expect(openTask).toHaveBeenCalledWith('u1', 't1')
    fireEvent.click(document.querySelector('[data-fashion-research="create-task"]')!)
    expect(openTaskNew).toHaveBeenCalledWith('u1')
  })

  it('shows R0 read-only banner and hides create', async () => {
    const r0 = project({
      id: ProjectId(R0_PROJECT_ID),
      title: 'R0',
      origin: 'public-rebuild',
    })
    const tasks: ResearchListState<ResearchTask> = { status: 'ready', items: [], error: null }
    const { container } = render(
      <Theme>
        <ResearchHomePage
          projectId={R0_PROJECT_ID}
          locale="zh"
          tasks={tasks}
          getProject={vi.fn(async () => r0)}
          loadTasks={vi.fn(async () => {})}
          openOverview={vi.fn()}
          openTask={vi.fn()}
          openTaskNew={vi.fn()}
          t={t}
        />
      </Theme>,
    )
    await waitFor(() => {
      expect(container.querySelector('[data-fashion-research-readonly="true"]')).toBeTruthy()
      expect(container.querySelector('[data-fashion-page="research-home"]')).toBeTruthy()
    })
    expect(container.textContent).toContain(t('research.r0Readonly'))
    expect(container.querySelector('[data-fashion-research="create-task"]')).toBeNull()
    expect(container.querySelector('[data-fashion-research="create-task-empty"]')).toBeNull()
  })
})

describe.sequential('Overview open research', () => {
  it('navigates to research from the next-step CTA', async () => {
    const user = project({ id: ProjectId('u1'), title: '用户项目', origin: 'user' })
    const openResearch = vi.fn()
    render(
      <Theme>
        <ProjectOverviewPage
          projectId="u1"
          locale="zh"
          getProject={vi.fn(async () => user)}
          openProjects={vi.fn()}
          openAgent={vi.fn()}
          openResearch={openResearch}
          openReview={vi.fn()}
          openDirections={vi.fn()}
          readStageObservations={vi.fn(async () => ({
            researchTasks: 0,
            opportunityBriefs: 0,
            conceptSets: 0,
            reviewRounds: 0,
            deliverables: 0,
          }))}
          followUp={{
            openDeliverables: vi.fn(),
            openFeedback: vi.fn(),
            openOutcomes: vi.fn(),
            openEvaluations: vi.fn(),
            openImprovements: vi.fn(),
          }}
          t={t}
        />
      </Theme>,
    )
    await waitFor(() => {
      expect(document.querySelector('[data-fashion-overview="open-research"]')).toBeTruthy()
    })
    fireEvent.click(document.querySelector('[data-fashion-overview="open-research"]')!)
    expect(openResearch).toHaveBeenCalledWith('u1')
  })
})

describe.sequential('EvidenceDetailPage review', () => {
  it('confirms evidence with review note and shows localized status', async () => {
    const user = project({ id: ProjectId('u1'), title: '用户项目', origin: 'user' })
    const evidence: Evidence = {
      id: EvidenceId('e1'),
      projectId: ProjectId('u1'),
      taskId: ResearchTaskId('t1'),
      subjectType: 'sample',
      subjectId: SampleId('s1'),
      observation: 'price visible',
      claim: 'full price',
      claimType: 'observed',
      evidenceGrade: 'G1',
      method: null,
      limitations: [],
      excerpt: null,
      reviewStatus: 'pending_review',
      reviewedBy: null,
      reviewedAt: null,
      reviewNote: null,
      origin: 'human',
      accessMode: 'editable',
      revision: 0,
      createdAt: '2026-09-22T12:00:00.000Z',
      updatedAt: '2026-09-22T12:00:00.000Z',
      createdBy: 'local-human',
      updatedBy: 'local-human',
      schemaVersion: 0,
      archivedAt: null,
    }
    const reviewEvidence = vi.fn(async () => ({
      ...evidence,
      reviewStatus: 'confirmed' as const,
      reviewNote: 'looks good',
      revision: 1,
      reviewedBy: 'local-human' as const,
      reviewedAt: '2026-09-22T13:00:00.000Z',
    }))
    render(
      <Theme>
        <EvidenceDetailPage
          projectId="u1"
          taskId="t1"
          evidenceId="e1"
          locale="zh"
          getProject={vi.fn(async () => user)}
          getEvidence={vi.fn(async () => evidence)}
          reviewEvidence={reviewEvidence}
          openTask={vi.fn()}
          t={t}
        />
      </Theme>,
    )
    await waitFor(() => {
      expect(document.querySelector('[data-fashion-page="research-evidence"]')).toBeTruthy()
    })
    expect(document.body.textContent).toContain(t('research.enum.reviewStatus.pendingReview'))
    fireEvent.change(document.querySelector('[data-fashion-research="review-note"]')!, {
      target: { value: 'looks good' },
    })
    fireEvent.click(document.querySelector('[data-fashion-research="review-confirm"]')!)
    await waitFor(() => {
      expect(reviewEvidence).toHaveBeenCalled()
    })
    expect(reviewEvidence).toHaveBeenCalledWith(expect.objectContaining({
      projectId: 'u1',
      taskId: 't1',
      reviewStatus: 'confirmed',
      reviewNote: 'looks good',
    }))
  })

  it('shows not-found when getEvidence fails with not-found code', async () => {
    const user = project({ id: ProjectId('u1'), title: '用户项目', origin: 'user' })
    render(
      <Theme>
        <EvidenceDetailPage
          projectId="u1"
          taskId="t1"
          evidenceId="missing"
          locale="zh"
          getProject={vi.fn(async () => user)}
          getEvidence={vi.fn(async () => {
            throw Object.assign(new Error('missing'), { code: 'fashion-research/evidence-not-found' })
          })}
          reviewEvidence={vi.fn()}
          openTask={vi.fn()}
          t={t}
        />
      </Theme>,
    )
    await waitFor(() => {
      expect(document.querySelector('[data-fashion-page="research-evidence-missing"]')).toBeTruthy()
    })
    expect(document.body.textContent).toContain(t('research.notFound'))
  })
})

describe.sequential('ResearchTaskPage empty copy', () => {
  it('names the empty sources, samples, and evidence lists separately', async () => {
    const user = project({ id: ProjectId('u1'), title: '用户项目', origin: 'user' })
    const task: ResearchTask = {
      id: ResearchTaskId('t1'),
      projectId: ProjectId('u1'),
      title: '秋冬研究',
      note: null,
      status: 'draft',
      origin: 'human',
      accessMode: 'editable',
      revision: 0,
      createdAt: '2026-09-22T12:00:00.000Z',
      updatedAt: '2026-09-22T12:00:00.000Z',
      createdBy: 'local-human',
      updatedBy: 'local-human',
      schemaVersion: 0,
      archivedAt: null,
    }
    const empty = { status: 'ready' as const, items: [] as const, error: null }
    const { container } = render(
      <Theme>
        <ResearchTaskPage
          projectId="u1"
          taskId="t1"
          locale="zh"
          sources={empty}
          samples={empty}
          evidence={empty}
          getProject={vi.fn(async () => user)}
          getTask={vi.fn(async () => task)}
          loadTaskChildren={vi.fn(async () => {})}
          openHome={vi.fn()}
          openSourceNew={vi.fn()}
          openSource={vi.fn()}
          openSample={vi.fn()}
          openEvidence={vi.fn()}
          openAnalysis={vi.fn()}
          t={t}
        />
      </Theme>,
    )
    await waitFor(() => {
      expect(container.querySelector('[data-fashion-page="research-task"]')).toBeTruthy()
    })
    const page = container.querySelector('[data-fashion-page="research-task"]')!
    expect(page.textContent).toContain(t('research.emptySources'))
    expect(page.textContent).toContain(t('research.emptySamples'))
    expect(page.textContent).toContain(t('research.emptyEvidence'))
    expect(page.textContent).not.toContain(t('research.empty'))
  })
})

describe.sequential('SourceDetailPage availability', () => {
  it('labels registration status and records a human correction without a live fetch', async () => {
    const user = project({ id: ProjectId('u1'), title: '用户项目', origin: 'user' })
    const source: Source = {
      id: SourceId('src1'),
      projectId: ProjectId('u1'),
      taskId: ResearchTaskId('t1'),
      locatorType: 'url',
      url: 'https://www2.hm.com/denied',
      urlNormalized: 'https://www2.hm.com/denied',
      attachmentRef: null,
      title: 'H&M listing',
      publisherOrPlatform: 'H&M',
      sourceKind: 'product_page',
      accessedAt: '2026-09-24T00:00:00.000Z',
      publishedAt: null,
      captureMode: 'manual_link',
      usageBoundary: 'public_attributed',
      externalProcessing: 'denied',
      availabilityStatus: 'available',
      attribution: 'H&M',
      contentFingerprint: null,
      origin: 'human',
      accessMode: 'editable',
      revision: 0,
      createdAt: '2026-09-24T00:00:00.000Z',
      updatedAt: '2026-09-24T00:00:00.000Z',
      createdBy: 'local-human',
      updatedBy: 'local-human',
      schemaVersion: 0,
      archivedAt: null,
    }
    const updateSource = vi.fn(async () => ({ ...source, availabilityStatus: 'unavailable' as const, revision: 1 }))
    render(
      <Theme>
        <SourceDetailPage
          projectId="u1"
          taskId="t1"
          sourceId="src1"
          locale="zh"
          getProject={vi.fn(async () => user)}
          getSource={vi.fn(async () => source)}
          updateSource={updateSource}
          createSample={vi.fn()}
          createEvidence={vi.fn()}
          openTask={vi.fn()}
          openSample={vi.fn()}
          openEvidence={vi.fn()}
          t={t}
        />
      </Theme>,
    )
    await waitFor(() => {
      expect(document.querySelector('[data-fashion-page="research-source"]')).toBeTruthy()
    })
    expect(document.body.textContent).toContain(t('research.enum.availability.available'))
    expect(document.body.textContent).toContain(t('research.availabilityHint'))
    fireEvent.change(document.querySelector('[data-fashion-research="availability-status"]')!, {
      target: { value: 'unavailable' },
    })
    fireEvent.click(document.querySelector('[data-fashion-research="availability-submit"]')!)
    await waitFor(() => {
      expect(updateSource).toHaveBeenCalledWith(expect.objectContaining({
        availabilityStatus: 'unavailable',
        expectedRevision: 0,
      }))
    })
  })
})
