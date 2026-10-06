// @vitest-environment jsdom
/** FashionSidebar + header restore (F1-03 Batch 3). */
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render } from '@testing-library/react'
import { createSnapshotStore } from '@deepseek-ai/dsh-client-store'
import { ProjectId } from '@gentlexx/dsh-fashion-project'
import type { ProjectListState } from '@gentlexx/dsh-api-fashion-project-controller/client'
import type { GlobalStandardProps, TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import type { FashionRoute } from '../src/client/routes.ts'
import { R0_PROJECT_ID } from '../src/client/routes.ts'
import { FASHION_PANEL_ID } from '../src/client/panel-id.ts'
import { FashionSidebar } from '../src/client/FashionSidebar.tsx'
import { FashionHeaderLeadingControls } from '../src/client/FashionHeaderLeadingControls.tsx'
import { zh } from '../src/client/locales.ts'
import tokens from '../src/client/FashionTokens.module.css'
import clsx from 'clsx'

const t: TranslateNS<'fashion'> = key =>
  (zh as Record<string, string>)[key] ?? key

const usePanelInfoActive: GlobalStandardProps['usePanelInfo'] = selector =>
  selector({ activePanelId: FASHION_PANEL_ID })

const useResource: GlobalStandardProps['useResource'] = () => ({
  status: 'none' as const,
  value: undefined,
  failure: undefined,
  reload: () => {},
})

const neverHook = (() => {
  throw new Error('FashionSidebar must not read global session/workspace hooks')
}) as never

type AttentionSnapshot = Parameters<Parameters<GlobalStandardProps['useSessionPendingInteraction']>[0]>[0]
const noAttention: AttentionSnapshot = new Map()
const useSessionPendingInteraction: GlobalStandardProps['useSessionPendingInteraction'] =
  selector => selector(noAttention)

const globalProps = {
  useSessions: neverHook,
  useSessionPendingInteraction,
  useWorkspaces: neverHook,
  useResource,
} satisfies Pick<
  GlobalStandardProps,
  'useSessions' | 'useSessionPendingInteraction' | 'useWorkspaces' | 'useResource'
>

function Theme({ children }: { children: ReactNode }) {
  return <div className={clsx(tokens.fashionTheme)}>{children}</div>
}

function hookOf<T>(value: T) {
  const store = createSnapshotStore(value)
  return <S,>(sel: (s: T) => S) => sel(store.getSnapshot())
}

describe.sequential('FashionSidebar', () => {
  it('uses icon glyphs instead of P/A letters on the rail', () => {
    const { container } = render(
      <Theme>
        <FashionSidebar
          collapsed
          width={56}
          openProjects={vi.fn()}
          openAgent={vi.fn()}
          toggleSidebar={vi.fn()}
          usePanelInfo={usePanelInfoActive}
          useRoute={hookOf<FashionRoute>({ kind: 'projects' })}
          useProjectList={hookOf<ProjectListState>({ status: 'ready', items: [], error: null })}
          t={t}
          renderSlot={() => null}
          {...globalProps}
        />
      </Theme>,
    )
    expect(container.querySelector('[data-fashion-sidebar="rail"]')).toBeTruthy()
    expect(container.textContent).not.toMatch(/\bP\b/)
    expect(container.querySelector('[data-fashion-rail="projects"] svg')).toBeTruthy()
    expect(container.querySelector('[data-fashion-rail="agent"] svg')).toBeTruthy()
  })

  it('shows current-project block on overview route with origin tags', () => {
    const list: ProjectListState = {
      status: 'ready',
      items: [{
        id: ProjectId(R0_PROJECT_ID),
        title: '美国女装卡其 Utility Jacket',
        origin: 'public-rebuild',
        accessMode: 'read-only',
        createdAt: '2026-09-21T00:00:00.000Z',
        updatedAt: '2026-09-21T00:00:00.000Z',
        revision: 0,
      }],
      error: null,
    }
    const openProjects = vi.fn()
    const { container } = render(
      <Theme>
        <FashionSidebar
          collapsed={false}
          width={280}
          openProjects={openProjects}
          openAgent={vi.fn()}
          toggleSidebar={vi.fn()}
          usePanelInfo={usePanelInfoActive}
          useRoute={hookOf<FashionRoute>({ kind: 'project-overview', projectId: R0_PROJECT_ID })}
          useProjectList={hookOf(list)}
          t={t}
          renderSlot={() => null}
          {...globalProps}
        />
      </Theme>,
    )
    expect(container.querySelector(`[data-fashion-current-project="${R0_PROJECT_ID}"]`)).toBeTruthy()
    expect(container.textContent).toContain(t('sidebar.currentHeading'))
    expect(container.textContent).toContain(t('origin.publicRebuild'))
    expect(container.textContent).toContain(t('access.readOnly'))
    fireEvent.click(container.querySelector('[data-fashion-current-back]')!)
    expect(openProjects).toHaveBeenCalled()
  })

  it('hides current-project block on the projects list route', () => {
    const { container } = render(
      <Theme>
        <FashionSidebar
          collapsed={false}
          width={280}
          openProjects={vi.fn()}
          openAgent={vi.fn()}
          toggleSidebar={vi.fn()}
          usePanelInfo={usePanelInfoActive}
          useRoute={hookOf<FashionRoute>({ kind: 'projects' })}
          useProjectList={hookOf<ProjectListState>({ status: 'ready', items: [], error: null })}
          t={t}
          renderSlot={() => null}
          {...globalProps}
        />
      </Theme>,
    )
    expect(container.querySelector('[data-fashion-current-project]')).toBeNull()
    expect(container.querySelector('[data-fashion-nav="collapse"]')?.getAttribute('aria-label'))
      .toBe(t('sidebar.collapse'))
  })
})

describe('FashionHeaderLeadingControls', () => {
  it('renders a Button without inline style attributes', () => {
    const toggleSidebar = vi.fn()
    const { container } = render(
      <FashionHeaderLeadingControls toggleSidebar={toggleSidebar} t={t} />,
    )
    const restore = container.querySelector('[data-fashion-sidebar-restore]') as HTMLButtonElement
    expect(restore).toBeTruthy()
    expect(restore.getAttribute('style')).toBeNull()
    fireEvent.click(restore)
    expect(toggleSidebar).toHaveBeenCalled()
  })
})
