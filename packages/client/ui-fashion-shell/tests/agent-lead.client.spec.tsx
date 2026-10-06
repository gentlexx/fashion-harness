// @vitest-environment jsdom
/** FashionAgentLead + ContextStrip — Host binding status and authorized scope. */
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render } from '@testing-library/react'
import { createSnapshotStore } from '@deepseek-ai/dsh-client-store'
import { ProjectId } from '@gentlexx/dsh-fashion-project'
import type { ProjectListState } from '@gentlexx/dsh-api-fashion-project-controller/client'
import { emptyFashionAgentStatus } from '@gentlexx/dsh-api-fashion-agent-controller/src/client/model.ts'
import type { FashionAgentStatusValue } from '@gentlexx/dsh-api-fashion-agent-controller/src/types.ts'
import type { FashionRoute } from '../src/client/routes.ts'
import { R0_PROJECT_ID } from '../src/client/routes.ts'
import { FashionAgentLead } from '../src/client/agent/FashionAgentLead.tsx'
import { FashionAgentContextStrip } from '../src/client/agent/FashionAgentContextStrip.tsx'
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import { zh } from '../src/client/locales.ts'
import tokens from '../src/client/FashionTokens.module.css'
import clsx from 'clsx'

const t: TranslateNS<'fashion'> = key =>
  (zh as Record<string, string>)[key] ?? key

function Theme({ children }: { children: ReactNode }) {
  return <div className={clsx(tokens.fashionTheme)}>{children}</div>
}

function hookOf<T>(value: T) {
  const store = createSnapshotStore(value)
  return <S,>(sel: (s: T) => S) => sel(store.getSnapshot())
}

const listWithR0: ProjectListState = {
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

const unbound = emptyFashionAgentStatus(null)

const bound: FashionAgentStatusValue = {
  sessionId: 'session-r0' as FashionAgentStatusValue['sessionId'],
  status: 'bound',
  projectId: R0_PROJECT_ID,
  projectTitle: '美国女装卡其 Utility Jacket',
  boundAt: '2026-10-04T00:00:00.000Z',
  snapshotVersion: 'abc123def4567890',
  projectUpdatedAt: '2026-09-21T00:00:00.000Z',
  dataScope: ['project', 'research', 'brief', 'directions', 'review', 'deliverable'],
  currentStage: 'deliverable',
  entrySurface: 'overview',
  readonlyAssist: true,
  message: null,
}

function leadProps(overrides: {
  route?: FashionRoute
  list?: ProjectListState
  status?: FashionAgentStatusValue
  openProjects?: () => void
  openProject?: (id: string) => void
  confirmBind?: () => void
  createBoundSession?: () => void
}) {
  return {
    openProjects: overrides.openProjects ?? vi.fn(),
    openProject: overrides.openProject ?? vi.fn(),
    confirmBind: overrides.confirmBind ?? vi.fn(),
    createBoundSession: overrides.createBoundSession ?? vi.fn(),
    useRoute: hookOf<FashionRoute>(overrides.route ?? { kind: 'projects' }),
    useProjectList: hookOf(overrides.list ?? listWithR0),
    useAgentStatus: hookOf(overrides.status ?? unbound),
    t,
  }
}

describe.sequential('FashionAgentLead', () => {
  it('shows no-project copy and never invents Session binding', () => {
    const openProjects = vi.fn()
    const { container } = render(
      <Theme>
        <FashionAgentLead {...leadProps({ openProjects })} />
      </Theme>,
    )
    expect(container.querySelector('[data-fashion-agent-context="none"]')).toBeTruthy()
    expect(container.textContent).toContain(t('agent.noProject'))
    expect(container.textContent).toContain(t('agent.readonlyAssist'))
    expect(container.textContent).not.toMatch(/SessionId|sessionId/i)
    fireEvent.click(container.querySelector('[data-fashion-agent-back-projects]')!)
    expect(openProjects).toHaveBeenCalled()
  })

  it('shows unbound project tags and overview action from list + route', () => {
    const openProject = vi.fn()
    const { container } = render(
      <Theme>
        <FashionAgentLead {...leadProps({
          route: { kind: 'project-overview', projectId: R0_PROJECT_ID },
          openProject,
        })} />
      </Theme>,
    )
    expect(container.querySelector('[data-fashion-agent-context="unbound"]')).toBeTruthy()
    expect(container.textContent).toContain(t('access.readOnly'))
    expect(container.textContent).toContain(t('agent.sessionUnbound'))
    fireEvent.click(container.querySelector('[data-fashion-agent-open-overview]')!)
    expect(openProject).toHaveBeenCalledWith(R0_PROJECT_ID)
  })

  it('shows Host binding, snapshot version, and authorized data scope', () => {
    const { container } = render(
      <Theme>
        <FashionAgentLead {...leadProps({
          route: { kind: 'project-overview', projectId: R0_PROJECT_ID },
          status: bound,
        })} />
      </Theme>,
    )
    expect(container.querySelector('[data-fashion-agent-binding="bound"]')).toBeTruthy()
    expect(container.querySelector('[data-fashion-agent-version]')?.textContent).toContain('abc123def456')
    expect(container.querySelector('[data-fashion-agent-scope]')?.textContent).toContain(t('agent.scope.brief'))
    expect(container.textContent).toContain(t('agent.boundStatus'))
    expect(container.textContent).toContain('美国女装卡其 Utility Jacket')
  })

  it('shows conflict copy and create-session action without silent switch', () => {
    const createBoundSession = vi.fn()
    const { container } = render(
      <Theme>
        <FashionAgentLead {...leadProps({
          route: { kind: 'project-overview', projectId: R0_PROJECT_ID },
          status: {
            ...bound,
            status: 'conflict',
            snapshotVersion: null,
            dataScope: [],
            message: 'session-bound-to-other-project',
          },
          createBoundSession,
        })} />
      </Theme>,
    )
    expect(container.querySelector('[data-fashion-agent-binding="conflict"]')).toBeTruthy()
    expect(container.textContent).toContain(t('agent.conflictOther'))
    fireEvent.click(container.querySelector('[data-fashion-agent-new-session]')!)
    expect(createBoundSession).toHaveBeenCalled()
  })

  it('shows confirm action for an unbound session that already has messages', () => {
    const confirmBind = vi.fn()
    const { container } = render(
      <Theme>
        <FashionAgentLead {...leadProps({
          route: { kind: 'project-overview', projectId: R0_PROJECT_ID },
          status: {
            ...unbound,
            status: 'needs-confirm',
            projectId: R0_PROJECT_ID,
            message: 'unbound-session-has-messages',
          },
          confirmBind,
        })} />
      </Theme>,
    )
    expect(container.querySelector('[data-fashion-agent-binding="needs-confirm"]')).toBeTruthy()
    fireEvent.click(container.querySelector('[data-fashion-agent-confirm]')!)
    expect(confirmBind).toHaveBeenCalled()
  })

  it('shows unavailable and context-failed copy when the project is missing', () => {
    const { container } = render(
      <Theme>
        <FashionAgentLead {...leadProps({
          route: { kind: 'project-overview', projectId: 'missing' },
          status: {
            ...unbound,
            status: 'unavailable',
            projectId: 'missing',
            message: 'Fashion project is not available for Agent context',
          },
        })} />
      </Theme>,
    )
    expect(container.querySelector('[data-fashion-agent-binding="unavailable"]')).toBeTruthy()
    expect(container.querySelector('[data-fashion-agent-binding="failed"]')).toBeTruthy()
    expect(container.textContent).toContain(t('agent.projectUnavailable'))
    expect(container.textContent).toContain(t('agent.contextFailed'))
  })
})

describe.sequential('FashionAgentContextStrip', () => {
  it('renders unbound disclaimer with project and keeps composer-agnostic actions only', () => {
    const { container } = render(
      <Theme>
        <FashionAgentContextStrip {...leadProps({
          route: { kind: 'project-overview', projectId: R0_PROJECT_ID },
        })} />
      </Theme>,
    )
    expect(container.querySelector('[data-fashion-agent-strip="project"]')).toBeTruthy()
    expect(container.textContent).toContain(t('agent.stripUnbound'))
  })

  it('shows a light no-project strip without blocking copy', () => {
    const { container } = render(
      <Theme>
        <FashionAgentContextStrip {...leadProps({})} />
      </Theme>,
    )
    expect(container.querySelector('[data-fashion-agent-strip="none"]')?.textContent)
      .toContain(t('agent.stripNoProject'))
  })

  it('shows authorized data scope when the session is bound', () => {
    const { container } = render(
      <Theme>
        <FashionAgentContextStrip {...leadProps({
          route: { kind: 'project-overview', projectId: R0_PROJECT_ID },
          status: bound,
        })} />
      </Theme>,
    )
    expect(container.querySelector('[data-fashion-agent-strip="bound"]')).toBeTruthy()
    expect(container.querySelector('[data-fashion-agent-scope]')?.textContent).toContain(t('agent.scope.research'))
    expect(container.textContent).toContain(t('agent.readonlyAssist'))
  })
})
