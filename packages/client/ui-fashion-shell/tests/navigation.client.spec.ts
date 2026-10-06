/** @vitest-environment jsdom */
/** FashionNavigation History sync tests. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createFashionNavigation } from '../src/client/navigation.ts'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fashion navigation', () => {
  it('boots / onto /projects with replaceState', () => {
    const history = {
      pushState: vi.fn(),
      replaceState: vi.fn(),
    }
    const location = { pathname: '/' }
    const nav = createFashionNavigation(history, location)
    expect(nav.route.getSnapshot()).toEqual({ kind: 'projects' })
    expect(history.replaceState).toHaveBeenCalledWith(null, '', '/projects')
    nav.dispose()
  })

  it('canonicalizes /projects/:id onto the overview path', () => {
    const history = {
      pushState: vi.fn(),
      replaceState: vi.fn(),
    }
    const location = { pathname: '/projects/r0-us-womens-khaki-utility-jacket' }
    const nav = createFashionNavigation(history, location)
    expect(nav.route.getSnapshot()).toEqual({
      kind: 'project-overview',
      projectId: 'r0-us-womens-khaki-utility-jacket',
    })
    expect(history.replaceState).toHaveBeenCalledWith(
      null,
      '',
      '/projects/r0-us-womens-khaki-utility-jacket/overview',
    )
    nav.dispose()
  })

  it('pushState on navigate and updates the route store', () => {
    const history = {
      pushState: vi.fn(),
      replaceState: vi.fn(),
    }
    const location = { pathname: '/projects' }
    const nav = createFashionNavigation(history, location)
    nav.navigate({ kind: 'project-overview', projectId: 'r0-us-womens-khaki-utility-jacket' })
    expect(history.pushState).toHaveBeenCalledWith(
      null,
      '',
      '/projects/r0-us-womens-khaki-utility-jacket/overview',
    )
    expect(nav.route.getSnapshot()).toEqual({
      kind: 'project-overview',
      projectId: 'r0-us-womens-khaki-utility-jacket',
    })
    nav.dispose()
  })

  it('syncs from popstate and stops listening after dispose', () => {
    const history = {
      pushState: vi.fn(),
      replaceState: vi.fn(),
    }
    const location = { pathname: '/projects' }
    const nav = createFashionNavigation(history, location)
    location.pathname = '/projects/r0-us-womens-khaki-utility-jacket/overview'
    window.dispatchEvent(new PopStateEvent('popstate'))
    expect(nav.route.getSnapshot()).toEqual({
      kind: 'project-overview',
      projectId: 'r0-us-womens-khaki-utility-jacket',
    })
    nav.dispose()
    location.pathname = '/projects'
    window.dispatchEvent(new PopStateEvent('popstate'))
    expect(nav.route.getSnapshot()).toEqual({
      kind: 'project-overview',
      projectId: 'r0-us-womens-khaki-utility-jacket',
    })
  })
})
