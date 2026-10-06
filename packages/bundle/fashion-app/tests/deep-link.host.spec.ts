/**
 * REAL-composition deep-link coverage for the Fashion product shell: a
 * test-only cordis.yml booted through the vendored Loader mounts the same
 * webserver, Connection, dist-server, and `ui-fashion-shell` Host rows the
 * Fashion profile mounts, and every assertion observes the served HTTP
 * surface. A Fashion route must survive a refresh or a pasted URL, while
 * assets, API paths, and non-Fashion paths keep their own answers.
 */

import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import Include from '@deepseek-ai/cordis-plugin-include'
import * as Connection from '@deepseek-ai/dsh-client-connection'
import LocalCredentials from '@deepseek-ai/dsh-credentials-local'
import HttpServer from '@deepseek-ai/dsh-host-webserver'
import * as FrontendStatic from '@deepseek-ai/dsh-host-frontend-static'
import type {} from '@deepseek-ai/dsh-host-frontend-static'

/**
 * Host-program copy of `ui-fashion-shell` `src/index.ts` apply. The real Host
 * file lives in the Client compiler face, so this spec cannot import it; the
 * Client apply spec pins the production function, and this composition pins
 * the HTTP effect of the same `/projects` prefix.
 */
const FashionShell = {
  name: 'ui-fashion-shell',
  apply(ctx: Context): void {
    ctx.inject(['frontendStatic'], (routeCtx) => {
      routeCtx.effect(
        () => routeCtx.frontendStatic.registerAppRoute('/projects'),
        'ui-fashion-shell: Fashion route deep-link fallback',
      )
    })
  },
}

let root: string | undefined
let context: Context | undefined

afterEach(async () => {
  await context?.fiber.dispose()
  context = undefined
  if (root !== undefined) await rm(root, { recursive: true, force: true })
  root = undefined
})

/** Boot the Fashion HTTP rows over a dist fixture through the real Loader. */
async function loadComposition(): Promise<Context> {
  root = await mkdtemp(join(tmpdir(), 'dsh-fashion-deeplink-'))
  const dist = join(root, 'dist')
  await mkdir(dist)
  const distIndex = join(dist, 'index.html')
  await writeFile(distIndex, '<head></head><body>fashion-shell</body>')
  await writeFile(join(dist, 'app.js'), 'export {}')
  const configPath = join(root, 'cordis.yml')
  await writeFile(configPath, [
    "- name: '@deepseek-ai/dsh-credentials-local'",
    '  config:',
    `    path: '${join(root, '.credentials.yaml')}'`,
    '    watch: false',
    "- name: '@deepseek-ai/dsh-host-webserver'",
    '  config:',
    "    host: '127.0.0.1'",
    '    port: 0',
    "- name: '@deepseek-ai/dsh-client-connection'",
    '- id: frontend',
    "  name: '@deepseek-ai/dsh-host-frontend-static'",
    '  config:',
    `    distIndex: '${distIndex}'`,
    '- id: ui-fashion-shell',
    "  name: '@gentlexx/dsh-client-ui-fashion-shell'",
    '',
  ].join('\n'))

  context = new Context()
  context.baseUrl = pathToFileURL(root).href + '/'
  await context.plugin(Loader)
  context.loader.builtins.include = Include
  const modules = new Map<string, unknown>([
    ['@deepseek-ai/dsh-credentials-local', LocalCredentials],
    ['@deepseek-ai/dsh-host-webserver', HttpServer],
    ['@deepseek-ai/dsh-client-connection', Connection],
    ['@deepseek-ai/dsh-host-frontend-static', FrontendStatic],
    ['@gentlexx/dsh-client-ui-fashion-shell', FashionShell],
  ])
  context.loader.internal = {
    version: 'v2',
    async import(specifier: string) {
      if (!modules.has(specifier)) throw new Error(`unexpected Loader import: ${specifier}`)
      return modules.get(specifier)
    },
  } as unknown as NonNullable<typeof context.loader.internal>
  await context.loader.create({
    name: 'cordis:include',
    config: { path: pathToFileURL(configPath).href },
  })
  await context.loader.await()
  return context
}

/** GET (by default) one path against the running server. */
async function request(port: number, path: string, init?: RequestInit): Promise<{ status: number; type: string | null; body: string }> {
  const response = await fetch(`http://127.0.0.1:${String(port)}${path}`, init)
  return {
    status: response.status,
    type: response.headers.get('content-type'),
    body: await response.text(),
  }
}

describe('Fashion profile deep links', () => {
  it('serves the shell for every Fashion route depth while preserving asset and API answers', { timeout: 60_000 }, async () => {
    const loaded = await loadComposition()
    const unloaded = [...loaded.loader.entries()]
      .filter(entry => entry.fiber === undefined && !entry.disabled)
      .map(entry => entry.options.name)
    expect(unloaded).toEqual([])
    const port = loaded.webServer.port
    const launchUrl = loaded.connection.authenticatedUrl(`http://127.0.0.1:${String(port)}`)
    const exchange = await fetch(launchUrl, { redirect: 'manual' })
    const setCookie = exchange.headers.get('set-cookie')
    if (setCookie === null) throw new Error('authenticated frontend did not set a cookie')
    const cookie = setCookie.split(';', 1)[0]!
    const authenticated = (init?: RequestInit): RequestInit => {
      const headers = new Headers(init?.headers)
      headers.set('cookie', cookie)
      return { ...init, headers }
    }

    // Every route kind the Fashion router owns, including the two the owner
    // manual test reached by refresh (project overview and analysis detail)
    // and the F4 routes that previously had no reachable entry.
    const routes = [
      '/projects',
      '/projects/r0-us-womens-khaki-utility-jacket',
      '/projects/r0-us-womens-khaki-utility-jacket/overview',
      '/projects/p9-user-test/overview',
      '/projects/p9-user-test/research',
      '/projects/p9-user-test/research/tasks/t1',
      '/projects/p9-user-test/research/tasks/t1/analysis',
      '/projects/r0-us-womens-khaki-utility-jacket/research/tasks/r0-task-us-womens-khaki-utility-jacket/analysis/items/r0-item-e01',
      '/projects/p9-user-test/research/tasks/t1/analysis/signals/s1',
      '/projects/p9-user-test/research/tasks/t1/analysis/clusters/c1',
      '/projects/p9-user-test/research/tasks/t1/analysis/opportunities/o1',
      '/projects/p9-user-test/directions',
      '/projects/p9-user-test/review',
      '/projects/p9-user-test/reviews/rr1',
      '/projects/p9-user-test/deliverables',
      '/projects/p9-user-test/deliverables/d1',
      '/projects/p9-user-test/feedback',
      '/projects/p9-user-test/feedback/new',
      '/projects/p9-user-test/outcomes',
      '/projects/p9-user-test/evaluations',
      '/projects/p9-user-test/evaluations/runs/run1',
      '/projects/p9-user-test/improvements',
      '/projects/p9-user-test/improvements/i1',
    ]
    for (const path of routes) {
      const got = await request(port, path, authenticated())
      expect(got.status, path).toBe(200)
      expect(got.type, path).toBe('text/html; charset=utf-8')
      expect(got.body, path).toContain('fashion-shell')
    }

    // Assets and API paths keep their own answers rather than the shell.
    expect(await request(port, '/app.js')).toMatchObject({ status: 200, type: 'text/javascript; charset=utf-8' })
    expect(await request(port, '/projects/p9-user-test/missing.js', authenticated())).toEqual({
      status: 404, type: null, body: '',
    })
    expect(await request(port, '/api/no/such/route', authenticated())).toEqual({
      status: 404, type: 'text/plain;charset=UTF-8', body: 'not found',
    })

    // A path outside the Fashion prefix is still a genuine miss.
    expect(await request(port, '/no/such/route', authenticated())).toEqual({ status: 404, type: null, body: '' })

    // HMR safety: disposing the shell row withdraws its prefix, so the dist
    // server stops answering Fashion routes with the index.
    const shellEntry = [...loaded.loader.entries()].find(entry => entry.options.id === 'ui-fashion-shell')
    expect(shellEntry).toBeDefined()
    await shellEntry!.fiber?.dispose()
    expect(await request(port, '/projects/p9-user-test/overview', authenticated())).toEqual({
      status: 404, type: null, body: '',
    })
  })
})
