/** History-backed Fashion navigation service. */
import { createSnapshotStore, type ObservableSnapshot } from '@deepseek-ai/dsh-client-store'
import { formatFashionRoute, parseFashionRoute, type FashionRoute } from './routes.ts'

export interface FashionNavigation {
  readonly route: ObservableSnapshot<FashionRoute>
  navigate(route: FashionRoute, options?: { replace?: boolean }): void
  dispose(): void
}

/**
 * Create FashionNavigation bound to a History-like object (browser or test fake).
 * @param history - History API surface.
 * @param location - Location-like object providing pathname.
 */
export function createFashionNavigation(
  history: Pick<History, 'pushState' | 'replaceState'>,
  location: Pick<Location, 'pathname'> = window.location,
): FashionNavigation {
  const initial = parseFashionRoute(location.pathname)
  const boot = initial.kind === 'not-found' && (initial.pathname === '/' || initial.pathname === '')
    ? ({ kind: 'projects' } as const)
    : initial
  const formatted = formatFashionRoute(boot)
  if (formatted !== location.pathname) {
    history.replaceState(null, '', formatted)
  }
  const store = createSnapshotStore<FashionRoute>(boot, { flush: 'sync' })

  const onPopState = (): void => {
    store.set(parseFashionRoute(location.pathname))
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('popstate', onPopState)
  }

  return {
    get route() {
      return store
    },
    navigate(route, options) {
      const path = formatFashionRoute(route)
      if (options?.replace === true) history.replaceState(null, '', path)
      else history.pushState(null, '', path)
      store.set(route)
    },
    dispose() {
      if (typeof window !== 'undefined') {
        window.removeEventListener('popstate', onPopState)
      }
    },
  }
}
