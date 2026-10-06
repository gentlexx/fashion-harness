// @vitest-environment jsdom
/** ProjectsPage + ProjectOverviewPage component tests (F1-03 Batch 2). */
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { ProjectId } from '@gentlexx/dsh-fashion-project'
import type { ProjectView } from '@gentlexx/dsh-fashion-project/types'
import type { ProjectListState } from '@gentlexx/dsh-api-fashion-project-controller/client'
import { ProjectsPage } from '../src/client/pages/ProjectsPage.tsx'
import { ProjectOverviewPage } from '../src/client/pages/ProjectOverviewPage.tsx'
import { zh, type FashionKey } from '../src/client/locales.ts'
import { R0_PROJECT_ID } from '../src/client/routes.ts'
import tokens from '../src/client/FashionTokens.module.css'
import clsx from 'clsx'

const t = (key: FashionKey): string => zh[key]

function project(partial: Partial<ProjectView> & Pick<ProjectView, 'id' | 'title' | 'origin'>): ProjectView {
  return {
    accessMode: partial.origin === 'public-rebuild' ? 'read-only' : 'editable',
    createdAt: '2026-09-21T12:00:00.000Z',
    updatedAt: '2026-09-22T12:00:00.000Z',
    revision: 0,
    ...partial,
  }
}

function Theme({ children }: { children: ReactNode }) {
  return <div className={clsx(tokens.fashionTheme)}>{children}</div>
}

describe.sequential('ProjectsPage', () => {
  it('shows loading when the list is empty and loading', () => {
    const list: ProjectListState = { status: 'loading', items: [], error: null }
    render(
      <Theme>
        <ProjectsPage
          list={list}
          locale="zh"
          openProject={vi.fn()}
          openAgent={vi.fn()}
          createProject={vi.fn()}
          t={t}
        />
      </Theme>,
    )
    expect(document.querySelector('[data-fashion-list="loading"]')?.textContent).toBe(t('projects.loading'))
  })

  it('shows fatal list error with retry and keeps cards off the page', () => {
    const onRetryLoad = vi.fn()
    const openAgent = vi.fn()
    const list: ProjectListState = {
      status: 'error',
      items: [],
      error: { code: 'fashion-project/unavailable', message: 'down' } as never,
    }
    const { container } = render(
      <Theme>
        <ProjectsPage
          list={list}
          locale="zh"
          openProject={vi.fn()}
          openAgent={openAgent}
          createProject={vi.fn()}
          onRetryLoad={onRetryLoad}
          t={t}
        />
      </Theme>,
    )
    expect(container.querySelector('[data-fashion-state="list-error"]')).toBeTruthy()
    expect(container.querySelector('[data-fashion-list="items"]')).toBeNull()
    fireEvent.click(container.querySelector('[data-fashion-list="retry"]')!)
    expect(onRetryLoad).toHaveBeenCalledOnce()
  })

  it('shows stale list error banner while retaining previous cards', () => {
    const onRetryLoad = vi.fn()
    const user = project({ id: ProjectId('u1'), title: '秋冬外套', origin: 'user' })
    const list: ProjectListState = {
      status: 'error',
      items: [user],
      error: { code: 'fashion-project/unavailable', message: 'stale' } as never,
    }
    const { container } = render(
      <Theme>
        <ProjectsPage
          list={list}
          locale="zh"
          openProject={vi.fn()}
          openAgent={vi.fn()}
          createProject={vi.fn()}
          onRetryLoad={onRetryLoad}
          t={t}
        />
      </Theme>,
    )
    expect(container.querySelector('[data-fashion-state="list-stale-error"]')).toBeTruthy()
    expect(container.querySelector('[data-fashion-project="u1"]')).toBeTruthy()
    fireEvent.click(container.querySelector('[data-fashion-list="retry"]')!)
    expect(onRetryLoad).toHaveBeenCalledOnce()
  })

  it('shows list-empty when ready with no projects and opens create from empty CTA', () => {
    const list: ProjectListState = { status: 'ready', items: [], error: null }
    const { container } = render(
      <Theme>
        <ProjectsPage
          list={list}
          locale="zh"
          openProject={vi.fn()}
          openAgent={vi.fn()}
          createProject={vi.fn()}
          t={t}
        />
      </Theme>,
    )
    expect(container.querySelector('[data-fashion-state="list-empty"]')).toBeTruthy()
    fireEvent.click(container.querySelector('[data-fashion-create="open-empty"]')!)
    expect(container.querySelector('[data-fashion-create="form"]')).toBeTruthy()
  })

  it('shows user-section empty when only public rebuild projects exist', () => {
    const r0 = project({
      id: ProjectId(R0_PROJECT_ID),
      title: '美国女装卡其 Utility Jacket',
      origin: 'public-rebuild',
    })
    const list: ProjectListState = { status: 'ready', items: [r0], error: null }
    const { container } = render(
      <Theme>
        <ProjectsPage
          list={list}
          locale="zh"
          openProject={vi.fn()}
          openAgent={vi.fn()}
          createProject={vi.fn()}
          t={t}
        />
      </Theme>,
    )
    expect(container.querySelector('[data-fashion-state="recent-empty"]')).toBeTruthy()
    expect(container.querySelector(`[data-fashion-project="${R0_PROJECT_ID}"]`)).toBeTruthy()
  })

  it('partitions user and public cards without inventing market fields on user cards', () => {
    const user = project({ id: ProjectId('u1'), title: '秋冬外套', origin: 'user' })
    const r0 = project({
      id: ProjectId(R0_PROJECT_ID),
      title: '美国女装卡其 Utility Jacket',
      origin: 'public-rebuild',
    })
    const list: ProjectListState = { status: 'ready', items: [user, r0], error: null }
    render(
      <Theme>
        <ProjectsPage
          list={list}
          locale="zh"
          openProject={vi.fn()}
          openAgent={vi.fn()}
          createProject={vi.fn()}
          t={t}
        />
      </Theme>,
    )
    expect(document.querySelector('[data-fashion-capability]')?.textContent).toBe(t('capability.foundationReady'))
    expect(document.querySelector(`[data-fashion-project="${R0_PROJECT_ID}"] [data-fashion-capability]`)?.textContent)
      .toBe(t('capability.publicRebuild'))
    expect(document.body.textContent).not.toContain('开始研究')
    const userCard = document.querySelector('[data-fashion-project="u1"]')
    expect(userCard?.textContent).not.toMatch(/美国女装/)
    expect(document.querySelector(`[data-fashion-project="${R0_PROJECT_ID}"]`)?.textContent)
      .toContain('美国女装')
  })

  it('shows filter-empty distinct from list empty and clears filters', () => {
    const list: ProjectListState = {
      status: 'ready',
      items: [project({ id: ProjectId('u1'), title: '外套', origin: 'user' })],
      error: null,
    }
    const { container } = render(
      <Theme>
        <ProjectsPage
          list={list}
          locale="zh"
          openProject={vi.fn()}
          openAgent={vi.fn()}
          createProject={vi.fn()}
          t={t}
        />
      </Theme>,
    )
    const search = container.querySelector('[data-fashion-filter="search"]') as HTMLInputElement
    fireEvent.change(search, { target: { value: 'zzz-none' } })
    expect(container.querySelector('[data-fashion-state="filter-empty"]')).toBeTruthy()
    fireEvent.click(container.querySelector('[data-fashion-filter="clear"]')!)
    expect(container.querySelector('[data-fashion-state="filter-empty"]')).toBeNull()
    expect(container.textContent).toContain('外套')
  })

  it('expands the create form and focuses the title field', async () => {
    const list: ProjectListState = {
      status: 'ready',
      items: [project({ id: ProjectId('u1'), title: '已有', origin: 'user' })],
      error: null,
    }
    const { container } = render(
      <Theme>
        <ProjectsPage
          list={list}
          locale="zh"
          openProject={vi.fn()}
          openAgent={vi.fn()}
          createProject={vi.fn()}
          t={t}
        />
      </Theme>,
    )
    expect(container.querySelector('[data-fashion-create="form"]')).toBeNull()
    fireEvent.click(container.querySelector('[data-fashion-create="open"]')!)
    const title = container.querySelector('[data-fashion-create="title"]') as HTMLInputElement
    expect(container.querySelector('[data-fashion-create="form"]')).toBeTruthy()
    await waitFor(() => {
      expect(document.activeElement).toBe(title)
    })
  })

  it('validates empty and too-long titles without calling createProject', async () => {
    const createProject = vi.fn()
    const list: ProjectListState = {
      status: 'ready',
      items: [project({ id: ProjectId('u1'), title: '已有', origin: 'user' })],
      error: null,
    }
    const { container } = render(
      <Theme>
        <ProjectsPage
          list={list}
          locale="zh"
          openProject={vi.fn()}
          openAgent={vi.fn()}
          createProject={createProject}
          t={t}
        />
      </Theme>,
    )
    fireEvent.click(container.querySelector('[data-fashion-create="open"]')!)
    fireEvent.submit(container.querySelector('[data-fashion-create="form"]')!)
    await waitFor(() => {
      expect(container.querySelector('[data-fashion-create="error"]')?.textContent).toBe(t('projects.createEmpty'))
    })
    expect(createProject).not.toHaveBeenCalled()

    const input = container.querySelector('[data-fashion-create="title"]') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'x'.repeat(121) } })
    fireEvent.submit(container.querySelector('[data-fashion-create="form"]')!)
    await waitFor(() => {
      expect(container.querySelector('[data-fashion-create="error"]')?.textContent).toBe(t('projects.createTooLong'))
    })
    expect(createProject).not.toHaveBeenCalled()
    await waitFor(() => {
      expect(document.activeElement?.getAttribute('data-fashion-create')).toBe('title')
    })
  })

  it('locks title/submit/cancel while submitting and rejects duplicate submits', async () => {
    let resolveCreate!: (value: ProjectView) => void
    const createProject = vi.fn(() => new Promise<ProjectView>((resolve) => { resolveCreate = resolve }))
    const openProject = vi.fn()
    const list: ProjectListState = {
      status: 'ready',
      items: [project({ id: ProjectId('u1'), title: '已有', origin: 'user' })],
      error: null,
    }
    const { container } = render(
      <Theme>
        <ProjectsPage
          list={list}
          locale="zh"
          openProject={openProject}
          openAgent={vi.fn()}
          createProject={createProject}
          t={t}
        />
      </Theme>,
    )
    fireEvent.click(container.querySelector('[data-fashion-create="open"]')!)
    const input = container.querySelector('[data-fashion-create="title"]') as HTMLInputElement
    fireEvent.change(input, { target: { value: '新项目' } })
    fireEvent.submit(container.querySelector('[data-fashion-create="form"]')!)
    await waitFor(() => {
      expect((container.querySelector('[data-fashion-create="title"]') as HTMLInputElement).disabled).toBe(true)
    })
    expect((container.querySelector('[data-fashion-create="submit"]') as HTMLButtonElement).disabled).toBe(true)
    expect((container.querySelector('[data-fashion-create="cancel"]') as HTMLButtonElement).disabled).toBe(true)
    fireEvent.submit(container.querySelector('[data-fashion-create="form"]')!)
    fireEvent.click(container.querySelector('[data-fashion-create="submit"]')!)
    expect(createProject).toHaveBeenCalledOnce()
    resolveCreate(project({ id: ProjectId('new-1'), title: '新项目', origin: 'user' }))
    await waitFor(() => {
      expect(openProject).toHaveBeenCalledWith('new-1')
    })
  })

  it('navigates on create success and restores focus after cancel', async () => {
    const created = project({ id: ProjectId('new-2'), title: '成功项', origin: 'user' })
    const createProject = vi.fn(async () => created)
    const openProject = vi.fn()
    const list: ProjectListState = {
      status: 'ready',
      items: [project({ id: ProjectId('u1'), title: '已有', origin: 'user' })],
      error: null,
    }
    const { container } = render(
      <Theme>
        <ProjectsPage
          list={list}
          locale="zh"
          openProject={openProject}
          openAgent={vi.fn()}
          createProject={createProject}
          t={t}
        />
      </Theme>,
    )
    fireEvent.click(container.querySelector('[data-fashion-create="open"]')!)
    fireEvent.change(container.querySelector('[data-fashion-create="title"]')!, { target: { value: '成功项' } })
    fireEvent.submit(container.querySelector('[data-fashion-create="form"]')!)
    await waitFor(() => {
      expect(openProject).toHaveBeenCalledWith('new-2')
    })
    expect(container.querySelector('[data-fashion-create="form"]')).toBeNull()

    fireEvent.click(container.querySelector('[data-fashion-create="open"]')!)
    fireEvent.click(container.querySelector('[data-fashion-create="cancel"]')!)
    await waitFor(() => {
      expect(container.querySelector('[data-fashion-create="form"]')).toBeNull()
      expect(document.activeElement?.getAttribute('data-fashion-create')).toBe('open')
    })
  })

  it('keeps draft on failure, unlocks controls, and returns focus to the title', async () => {
    const createProject = vi.fn(async () => {
      throw new Error('host rejected')
    })
    const list: ProjectListState = {
      status: 'ready',
      items: [project({ id: ProjectId('u1'), title: '已有', origin: 'user' })],
      error: null,
    }
    const { container } = render(
      <Theme>
        <ProjectsPage
          list={list}
          locale="zh"
          openProject={vi.fn()}
          openAgent={vi.fn()}
          createProject={createProject}
          t={t}
        />
      </Theme>,
    )
    fireEvent.click(container.querySelector('[data-fashion-create="open"]')!)
    const input = container.querySelector('[data-fashion-create="title"]') as HTMLInputElement
    fireEvent.change(input, { target: { value: ' 新项目 ' } })
    fireEvent.submit(container.querySelector('[data-fashion-create="form"]')!)
    await waitFor(() => {
      expect(container.querySelector('[data-fashion-create="error"]')?.textContent).toBe('host rejected')
    })
    expect(createProject).toHaveBeenCalledOnce()
    expect((container.querySelector('[data-fashion-create="title"]') as HTMLInputElement).value).toBe(' 新项目 ')
    expect((container.querySelector('[data-fashion-create="title"]') as HTMLInputElement).disabled).toBe(false)
    expect((container.querySelector('[data-fashion-create="submit"]') as HTMLButtonElement).disabled).toBe(false)
    expect((container.querySelector('[data-fashion-create="cancel"]') as HTMLButtonElement).disabled).toBe(false)
    await waitFor(() => {
      expect(document.activeElement?.getAttribute('data-fashion-create')).toBe('title')
    })
  })
})

/** Follow-up navigation with every entry recorded separately. */
function followUpStub() {
  return {
    openDeliverables: vi.fn(),
    openFeedback: vi.fn(),
    openOutcomes: vi.fn(),
    openEvaluations: vi.fn(),
    openImprovements: vi.fn(),
  }
}

describe.sequential('ProjectOverviewPage', () => {
  it('shows skeleton while loading then user overview without R0 facts', async () => {
    const user = project({ id: ProjectId('u1'), title: '用户项目', origin: 'user' })
    let resolve!: (value: ProjectView) => void
    const getProject = vi.fn(() => new Promise<ProjectView>((r) => { resolve = r }))
    render(
      <Theme>
        <ProjectOverviewPage
          projectId="u1"
          locale="zh"
          getProject={getProject}
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
          followUp={followUpStub()}
          t={t}
        />
      </Theme>,
    )
    expect(document.querySelector('[data-fashion-page="overview-loading"]')).toBeTruthy()
    resolve(user)
    await waitFor(() => {
      expect(document.querySelector('[data-fashion-page="overview"]')).toBeTruthy()
    })
    expect(document.querySelector('[data-fashion-status-summary]')?.textContent)
      .toBe(t('capability.foundationReady'))
    expect(document.querySelector('[data-fashion-semantic="facts"]')).toBeNull()
    expect(document.querySelectorAll('[data-fashion-stage-state="pipeline.pending"]').length).toBe(5)
  })

  it('renders R0 overview with disclaimer and localized pipeline states', async () => {
    const r0 = project({
      id: ProjectId(R0_PROJECT_ID),
      title: '美国女装卡其 Utility Jacket',
      origin: 'public-rebuild',
    })
    const getProject = vi.fn(async () => r0)
    render(
      <Theme>
        <ProjectOverviewPage
          projectId={R0_PROJECT_ID}
          locale="zh"
          getProject={getProject}
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
          followUp={followUpStub()}
          t={t}
        />
      </Theme>,
    )
    await waitFor(() => {
      expect(document.querySelector('[data-fashion-origin="public-rebuild"]')).toBeTruthy()
    })
    expect(document.querySelector('[role="note"]')?.textContent).toBe(t('overview.disclaimer'))
    expect(document.querySelector('[data-fashion-stage-state="pipeline.recorded"]')).toBeTruthy()
    expect(document.querySelector('[data-fashion-semantic="facts"]')).toBeTruthy()
    expect(document.body.textContent).toContain(t('overview.agentNoBind'))
  })

  it('distinguishes not-found from transport error', async () => {
    const getNotFound = vi.fn(async () => {
      throw { code: 'fashion-project/not-found', message: 'missing' }
    })
    const { rerender } = render(
      <Theme>
        <ProjectOverviewPage
          projectId="missing"
          locale="zh"
          getProject={getNotFound}
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
          followUp={followUpStub()}
          t={t}
        />
      </Theme>,
    )
    await waitFor(() => {
      expect(document.querySelector('[data-fashion-state="project-not-found"]')).toBeTruthy()
    })

    const getError = vi.fn(async () => {
      throw { code: 'fashion-project/unavailable', message: 'down' }
    })
    rerender(
      <Theme>
        <ProjectOverviewPage
          projectId="broken"
          locale="zh"
          getProject={getError}
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
          followUp={followUpStub()}
          t={t}
        />
      </Theme>,
    )
    await waitFor(() => {
      expect(document.querySelector('[data-fashion-state="overview-error"]')).toBeTruthy()
    })
    expect(document.querySelector('[data-fashion-overview="retry"]')).toBeTruthy()
  })

  it('marks research recorded when the project already has research tasks', async () => {
    const user = project({ id: ProjectId('u1'), title: '用户项目', origin: 'user' })
    const getProject = vi.fn(async () => user)
    const { container } = render(
      <Theme>
        <ProjectOverviewPage
          projectId="u1"
          locale="zh"
          getProject={getProject}
          openProjects={vi.fn()}
          openAgent={vi.fn()}
          openResearch={vi.fn()}
          openReview={vi.fn()}
          openDirections={vi.fn()}
          readStageObservations={vi.fn(async () => ({
            researchTasks: 1,
            opportunityBriefs: 0,
            conceptSets: 0,
            reviewRounds: 0,
            deliverables: 0,
          }))}
          followUp={followUpStub()}
          t={t}
        />
      </Theme>,
    )
    await waitFor(() => {
      expect(container.querySelector('[data-fashion-stage="research"]')?.getAttribute('data-fashion-stage-state'))
        .toBe('pipeline.recorded')
    })
    expect(container.querySelector('[data-fashion-stage="review"]')?.getAttribute('data-fashion-stage-state'))
      .toBe('pipeline.pending')
  })
})
