/** Fashion product sidebar: projects-first navigation over the layout sidebar seat. */
import clsx from 'clsx'
import {
  IconFolderOpenOutline16,
  IconNewChatOutline16,
  IconPanelLeftOutline16,
  Tooltip,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { InjectFace, PropsLocale, PropsRenderSlots, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap {
    /**
     * Workspace browser hole. Official ui-sidebar declares the same seat.
     * This shell compiles without that package, so the seat is declared here.
     */
    'sidebar.workspaces': {
      kind: 'single'
      scope: 'root'
      owner: { wide: boolean; expandSidebar: () => void }
    }
  }
}
import type { ProjectListState } from '@gentlexx/dsh-api-fashion-project-controller/client'
import type { FashionRoute } from './routes.ts'
import { FASHION_PANEL_ID } from './panel-id.ts'
import { CurrentProjectBlock } from './components/CurrentProjectBlock.tsx'
import css from './FashionShell.module.css'
import tokens from './FashionTokens.module.css'

export type FashionSidebarInjected = {
  openProjects: () => void
  openAgent: () => void
  toggleSidebar: () => void
  hooks: {
    route: import('@deepseek-ai/dsh-client-store').ObservableSnapshot<FashionRoute>
    projectList: import('@deepseek-ai/dsh-client-store').ObservableSnapshot<ProjectListState>
  }
}

export type FashionSidebarProps =
  PropsRuntime<'sidebar'>
  & PropsRenderSlots<'sidebar.settings' | 'sidebar.workspaces'>
  & InjectFace<FashionSidebarInjected>
  & PropsLocale<'fashion'>

/**
 * Render the Fashion left column (wide workbench or icon rail).
 * @param props - layout owner state plus Fashion navigation inject.
 */
export function FashionSidebar({
  collapsed,
  openProjects,
  openAgent,
  toggleSidebar,
  usePanelInfo,
  useRoute,
  useProjectList,
  t,
  renderSlot,
}: FashionSidebarProps) {
  const onFashionPanel = usePanelInfo(info => info.activePanelId === FASHION_PANEL_ID)
  const route = useRoute(snapshot => snapshot)
  const items = useProjectList(snapshot => snapshot.items)
  const projectsActive = onFashionPanel
  const agentActive = !onFashionPanel

  const overviewId = route.kind === 'projects' || route.kind === 'not-found'
    ? null
    : route.projectId
  const currentProject = overviewId === null
    ? null
    : items.find(item => String(item.id) === overviewId) ?? null

  if (collapsed) {
    const projectsTooltip = overviewId !== null && currentProject !== null
      ? currentProject.title
      : t('nav.projects')
    return (
      <div className={clsx(tokens.fashionTheme, css.root, css.rail)} data-fashion-sidebar="rail">
        <Tooltip label={t('sidebar.expand')} delayMs={500}>
          <button
            type="button"
            className={css.iconButton}
            aria-label={t('sidebar.expand')}
            onClick={toggleSidebar}
            data-fashion-rail="expand"
          >
            <IconPanelLeftOutline16 size={18} />
          </button>
        </Tooltip>
        <Tooltip label={projectsTooltip} delayMs={500}>
          <button
            type="button"
            className={clsx(css.iconButton, projectsActive && css.iconButtonActive)}
            aria-label={t('nav.projects')}
            aria-current={projectsActive ? 'page' : undefined}
            onClick={openProjects}
            data-fashion-rail="projects"
          >
            <IconFolderOpenOutline16 size={18} />
          </button>
        </Tooltip>
        <Tooltip label={t('nav.agent')} delayMs={500}>
          <button
            type="button"
            className={clsx(css.iconButton, agentActive && css.iconButtonActive)}
            aria-label={t('nav.agent')}
            aria-current={agentActive ? 'page' : undefined}
            onClick={openAgent}
            data-fashion-rail="agent"
          >
            <IconNewChatOutline16 size={18} />
          </button>
        </Tooltip>
        <div className={css.workspaces}>
          {renderSlot('sidebar.workspaces', {
            wide: false,
            expandSidebar: toggleSidebar,
          })}
        </div>
        <div className={css.foot}>
          {renderSlot('sidebar.settings', { wide: false })}
        </div>
      </div>
    )
  }

  return (
    <div className={clsx(tokens.fashionTheme, css.root)} data-fashion-sidebar="wide">
      <div className={css.brandBlock}>
        <p className={css.brand}>{t('brand')}</p>
        <p className={css.tagline}>{t('tagline')}</p>
      </div>
      <nav className={css.nav} aria-label={t('sidebar.workNav')}>
        <button
          type="button"
          className={clsx(css.navButton, projectsActive && css.navButtonActive)}
          aria-current={projectsActive ? 'page' : undefined}
          onClick={openProjects}
          data-fashion-nav="projects"
        >
          <IconFolderOpenOutline16 size={16} className={css.navIcon} />
          <span className={css.navLabel}>{t('nav.projects')}</span>
        </button>
        <button
          type="button"
          className={clsx(css.navButton, agentActive && css.navButtonActive)}
          aria-current={agentActive ? 'page' : undefined}
          onClick={openAgent}
          data-fashion-nav="agent"
        >
          <IconNewChatOutline16 size={16} className={css.navIcon} />
          <span className={css.navLabel}>{t('nav.agent')}</span>
        </button>
      </nav>
      {overviewId !== null ? (
        <CurrentProjectBlock
          project={currentProject}
          projectId={overviewId}
          onBack={openProjects}
          t={t}
        />
      ) : null}
      <div className={css.workspaces}>
        {renderSlot('sidebar.workspaces', {
          wide: true,
          expandSidebar: toggleSidebar,
        })}
      </div>
      <div className={css.foot}>
        <Tooltip label={t('sidebar.collapse')} delayMs={500}>
          <button
            type="button"
            className={css.navButton}
            onClick={toggleSidebar}
            aria-label={t('sidebar.collapse')}
            data-fashion-nav="collapse"
          >
            <IconPanelLeftOutline16 size={16} className={css.navIcon} />
            <span className={css.navLabel}>{t('sidebar.collapse')}</span>
          </button>
        </Tooltip>
        {renderSlot('sidebar.settings', { wide: true })}
      </div>
    </div>
  )
}
