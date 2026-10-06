/** Fashion Agent lead: Host binding status plus route-derived project identity. */
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import type { InjectFace, PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { FashionAgentStatusValue } from '@gentlexx/dsh-api-fashion-agent-controller/client'
import type { ProjectListState } from '@gentlexx/dsh-api-fashion-project-controller/client'
import type { FashionRoute } from '../routes.ts'
import { deriveFashionAgentContext, fashionAgentScopeKey } from './agent-context.ts'
import { ProjectSourceTags } from '../components/ProjectSourceTags.tsx'
import tokens from '../FashionTokens.module.css'
import css from './FashionAgentLead.module.css'
import clsx from 'clsx'

export type FashionAgentLeadInjected = {
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

export type FashionAgentLeadProps =
  InjectFace<FashionAgentLeadInjected>
  & PropsLocale<'fashion'>

/**
 * Replace the blank Conversation headline with Fashion Agent collaboration copy.
 * Host binding status is required; route + list never stand in for a bind.
 * @param props - navigation inject, binding actions, and fashion locale.
 */
export function FashionAgentLead({
  useRoute,
  useProjectList,
  useAgentStatus,
  openProjects,
  openProject,
  confirmBind,
  createBoundSession,
  t,
}: FashionAgentLeadProps) {
  const route = useRoute(snapshot => snapshot)
  const list = useProjectList(snapshot => snapshot)
  const binding = useAgentStatus(snapshot => snapshot)
  const context = deriveFashionAgentContext(route, list)
  const title = binding.projectTitle !== null
    ? binding.projectTitle
    : context.kind === 'project' ? context.project.title : null

  return (
    <div className={clsx(tokens.fashionTheme, css.lead)} data-fashion-agent-lead>
      <p className={css.title}>{t('agent.leadTitle')}</p>
      <p className={css.subtitle}>{t('agent.leadSubtitle')}</p>
      <p className={css.body}>{t('agent.collaboration')}</p>
      <p className={css.disclaimer} role="note">{t('agent.readonlyAssist')}</p>

      {binding.status === 'unbound' && context.kind === 'none' ? (
        <p className={css.meta} data-fashion-agent-context="none">{t('agent.noProject')}</p>
      ) : null}
      {binding.status === 'unbound' && context.kind === 'loading' ? (
        <p className={css.meta} data-fashion-agent-context="loading">
          {t('agent.projectLoading')} · {context.projectId}
        </p>
      ) : null}
      {binding.status === 'unbound' && context.kind === 'project' ? (
        <div className={css.project} data-fashion-agent-context="unbound">
          <p className={css.projectTitle}>{context.project.title}</p>
          <ProjectSourceTags
            origin={context.project.origin}
            accessMode={context.project.accessMode}
            t={t}
          />
          <p className={css.meta}>{t('agent.sessionUnbound')}</p>
        </div>
      ) : null}

      {binding.status === 'bound' ? (
        <div className={css.project} data-fashion-agent-context="bound" data-fashion-agent-binding="bound">
          <p className={css.projectTitle}>{title}</p>
          <p className={css.meta}>{t('agent.boundStatus')}</p>
          {binding.projectUpdatedAt !== null ? (
            <p className={css.meta}>{t('agent.projectUpdated')} · {binding.projectUpdatedAt}</p>
          ) : null}
          {binding.snapshotVersion !== null ? (
            <p className={css.meta} data-fashion-agent-version>{t('agent.snapshotVersion')} · {binding.snapshotVersion.slice(0, 12)}</p>
          ) : null}
          <p className={css.meta}>{t('agent.dataScopeLabel')}</p>
          <p className={css.meta} data-fashion-agent-scope>
            {binding.dataScope.map(scope => t(fashionAgentScopeKey(scope))).join(' · ')}
          </p>
        </div>
      ) : null}

      {binding.status === 'unavailable' ? (
        <p className={css.meta} data-fashion-agent-binding="unavailable">{t('agent.projectUnavailable')}</p>
      ) : null}
      {binding.status === 'conflict' ? (
        <p className={css.meta} data-fashion-agent-binding="conflict">{t('agent.conflictOther')}</p>
      ) : null}
      {binding.status === 'needs-confirm' ? (
        <p className={css.meta} data-fashion-agent-binding="needs-confirm">{t('agent.needsConfirm')}</p>
      ) : null}
      {binding.status === 'unavailable' && binding.message !== null ? (
        <p className={css.meta} data-fashion-agent-binding="failed">{t('agent.contextFailed')}</p>
      ) : null}

      <div className={css.actions}>
        {binding.status === 'needs-confirm' ? (
          <Button type="button" variant="primary" size="sm" onClick={confirmBind} data-fashion-agent-confirm>
            {t('agent.confirmBind')}
          </Button>
        ) : null}
        {binding.status === 'conflict' || binding.status === 'needs-confirm' ? (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={createBoundSession}
            data-fashion-agent-new-session
          >
            {t('agent.createBoundSession')}
          </Button>
        ) : null}
        {context.kind === 'project' || binding.projectId !== null ? (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => {
              const projectId = binding.projectId !== null
                ? binding.projectId
                : context.kind === 'project' ? String(context.project.id) : null
              if (projectId !== null) openProject(projectId)
            }}
            data-fashion-agent-open-overview
          >
            {t('agent.openOverview')}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={openProjects}
          data-fashion-agent-back-projects
        >
          {t('agent.backProjects')}
        </Button>
      </div>
    </div>
  )
}
