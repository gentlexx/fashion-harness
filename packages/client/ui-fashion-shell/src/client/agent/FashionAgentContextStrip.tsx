/** Compact dock strip: Host binding status and authorized data scope. */
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import type { InjectFace, PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { FashionAgentStatusValue } from '@gentlexx/dsh-api-fashion-agent-controller/client'
import type { ProjectListState } from '@gentlexx/dsh-api-fashion-project-controller/client'
import type { FashionRoute } from '../routes.ts'
import { deriveFashionAgentContext, fashionAgentScopeKey } from './agent-context.ts'
import { ProjectSourceTags } from '../components/ProjectSourceTags.tsx'
import tokens from '../FashionTokens.module.css'
import css from './FashionAgentContextStrip.module.css'
import clsx from 'clsx'

export type FashionAgentContextStripInjected = {
  openProjects: () => void
  openProject: (projectId: string) => void
  confirmBind: () => void
  createBoundSession: () => void
  hooks: {
    route: import('@deepseek-ai/dsh-client-store').ObservableSnapshot<FashionRoute>
    projectList: import('@deepseek-ai/dsh-client-store').ObservableSnapshot<ProjectListState>
    agentStatus: import('@deepseek-ai/dsh-client-store').ObservableSnapshot<FashionAgentStatusValue>
  }
}

export type FashionAgentContextStripProps =
  InjectFace<FashionAgentContextStripInjected>
  & PropsLocale<'fashion'>

/**
 * Render a dock strip above the composer for Fashion binding and data scope.
 * @param props - navigation inject, binding actions, and fashion locale.
 */
export function FashionAgentContextStrip({
  useRoute,
  useProjectList,
  useAgentStatus,
  openProjects,
  openProject,
  confirmBind,
  createBoundSession,
  t,
}: FashionAgentContextStripProps) {
  const route = useRoute(snapshot => snapshot)
  const list = useProjectList(snapshot => snapshot)
  const binding = useAgentStatus(snapshot => snapshot)
  const context = deriveFashionAgentContext(route, list)
  const title = binding.projectTitle !== null
    ? binding.projectTitle
    : context.kind === 'project' ? context.project.title : null

  if (binding.status === 'unbound' && context.kind === 'none') {
    return (
      <div className={clsx(tokens.fashionTheme, css.strip)} data-fashion-agent-strip="none">
        <span className={css.light}>{t('agent.stripNoProject')}</span>
        <Button type="button" variant="ghost" size="sm" onClick={openProjects}>
          {t('agent.backProjects')}
        </Button>
      </div>
    )
  }

  if (binding.status === 'unbound' && context.kind === 'loading') {
    return (
      <div className={clsx(tokens.fashionTheme, css.strip)} data-fashion-agent-strip="loading">
        <span className={css.light}>{t('agent.projectLoading')}</span>
      </div>
    )
  }

  return (
    <div
      className={clsx(tokens.fashionTheme, css.strip)}
      data-fashion-agent-strip={binding.status === 'bound' ? 'bound' : context.kind === 'project' ? 'project' : binding.status}
    >
      <div className={css.main}>
        {title !== null ? <span className={css.title}>{title}</span> : null}
        {context.kind === 'project' ? (
          <ProjectSourceTags
            origin={context.project.origin}
            accessMode={context.project.accessMode}
            t={t}
          />
        ) : null}
        {binding.status === 'bound' ? (
          <>
            <span className={css.disclaimer}>{t('agent.readonlyAssist')}</span>
            <span className={css.light} data-fashion-agent-scope>
              {t('agent.dataScopeLabel')}
              {': '}
              {binding.dataScope.map(scope => t(fashionAgentScopeKey(scope))).join(' · ')}
            </span>
          </>
        ) : null}
        {binding.status === 'unbound' ? (
          <span className={css.disclaimer}>{t('agent.stripUnbound')}</span>
        ) : null}
        {binding.status === 'conflict' ? (
          <span className={css.disclaimer}>{t('agent.conflictOther')}</span>
        ) : null}
        {binding.status === 'needs-confirm' ? (
          <span className={css.disclaimer}>{t('agent.needsConfirm')}</span>
        ) : null}
        {binding.status === 'unavailable' ? (
          <span className={css.disclaimer}>{t('agent.projectUnavailable')}</span>
        ) : null}
      </div>
      {binding.status === 'needs-confirm' ? (
        <Button type="button" variant="primary" size="sm" onClick={confirmBind}>
          {t('agent.confirmBind')}
        </Button>
      ) : null}
      {binding.status === 'conflict' || binding.status === 'needs-confirm' ? (
        <Button type="button" variant="outline" size="sm" onClick={createBoundSession}>
          {t('agent.createBoundSession')}
        </Button>
      ) : null}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          const projectId = binding.projectId !== null
            ? binding.projectId
            : context.kind === 'project' ? String(context.project.id) : null
          if (projectId !== null) openProject(projectId)
        }}
        data-fashion-strip-overview
      >
        {t('agent.openOverview')}
      </Button>
    </div>
  )
}
