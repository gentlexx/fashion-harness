/**
 * Pure Client Fashion Agent helpers: route-derived UI context plus entry surface.
 * Session ids are never treated as project ids.
 * @module @gentlexx/dsh-client-ui-fashion-shell/src/client/agent/agent-context
 */

import type { FashionAgentEntrySurface, FashionAgentScopeId } from '@gentlexx/dsh-fashion-agent'
import type { ProjectView } from '@gentlexx/dsh-fashion-project/types'
import type { ProjectListState } from '@gentlexx/dsh-api-fashion-project-controller/client'
import type { FashionKey } from '../locales.ts'
import type { FashionRoute } from '../routes.ts'

/** Disposable UI context for Agent lead / context strip. */
export type FashionAgentContext =
  | { readonly kind: 'none' }
  | { readonly kind: 'loading'; readonly projectId: string }
  | { readonly kind: 'project'; readonly project: ProjectView }

/**
 * Derive Agent UI context from Fashion History route and the Client list snapshot.
 * @param route - current Fashion route (never a Session id).
 * @param list - Client project list snapshot.
 */
export function deriveFashionAgentContext(
  route: FashionRoute,
  list: ProjectListState,
): FashionAgentContext {
  if (!('projectId' in route)) return { kind: 'none' }
  const project = list.items.find(item => String(item.id) === route.projectId)
  if (project !== undefined) return { kind: 'project', project }
  return { kind: 'loading', projectId: route.projectId }
}

/**
 * Map a Fashion History route to the Host entry-surface token.
 * @param route - current Fashion route.
 */
export function entrySurfaceFromRoute(route: FashionRoute): FashionAgentEntrySurface {
  switch (route.kind) {
    case 'project-overview':
      return 'overview'
    case 'research-home':
    case 'research-task-new':
    case 'research-task':
    case 'research-source-new':
    case 'research-source':
    case 'research-sample':
    case 'research-evidence':
      return 'research'
    case 'analysis-home':
    case 'analysis-item':
    case 'analysis-signal':
    case 'analysis-cluster':
    case 'analysis-opportunity':
      return 'analysis'
    case 'design-directions':
    case 'design-brief':
    case 'design-concept-set':
    case 'design-concept':
    case 'design-visual':
      return 'design'
    case 'review-home':
    case 'review-round':
      return 'review'
    case 'deliverables-home':
    case 'deliverable-detail':
      return 'deliverable'
    case 'feedback-home':
    case 'feedback-new':
    case 'feedback-detail':
    case 'outcomes-home':
      return 'feedback'
    case 'evaluations-home':
    case 'evaluation-run':
      return 'evaluation'
    case 'improvements-home':
    case 'improvement-detail':
      return 'improvement'
    case 'projects':
    case 'not-found':
      return 'agent'
    default: {
      const exhaustive: never = route
      return exhaustive
    }
  }
}

/**
 * Locale key for one authorized snapshot section.
 * @param scope - Host scope id.
 */
export function fashionAgentScopeKey(scope: FashionAgentScopeId): FashionKey {
  switch (scope) {
    case 'project':
      return 'agent.scope.project'
    case 'research':
      return 'agent.scope.research'
    case 'analysis':
      return 'agent.scope.analysis'
    case 'brief':
      return 'agent.scope.brief'
    case 'directions':
      return 'agent.scope.directions'
    case 'review':
      return 'agent.scope.review'
    case 'deliverable':
      return 'agent.scope.deliverable'
    case 'feedback':
      return 'agent.scope.feedback'
    case 'evaluation':
      return 'agent.scope.evaluation'
    case 'improvement':
      return 'agent.scope.improvement'
    default: {
      const exhaustive: never = scope
      return exhaustive
    }
  }
}
