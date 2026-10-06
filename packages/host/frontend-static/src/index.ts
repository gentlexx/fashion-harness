/**
 * @deepseek-ai/dsh-host-frontend-static — SPA dist server over the webserver
 * fallback seat: serves the built frontend directory with explicit index
 * entry points. A readable index renders at the dist root and configured index
 * path; missing paths return 404, traversal outside the dist root is 403,
 * unknown extensions ship as octet-stream, and non-GET/HEAD is 405. Every
 * index response first passes Connection's browser authentication, then the
 * webserver's index render (structured injection rows, then raw taps).
 * Non-index assets stay public. The dist location is workspace knowledge of
 * the composing application, so `distIndex` is typically supplied through a
 * `!!js` expression, never hardcoded by a deployment.
 *
 * A client plugin that owns history-API routes declares their path prefixes
 * through the {@link FrontendStaticRoutes} service, which extends index
 * rendering to dist misses under those prefixes so a deep route survives a
 * refresh or a pasted URL. No prefix is assumed: a composition that declares
 * none keeps exactly the two explicit index entry points.
 * @module @deepseek-ai/dsh-host-frontend-static
 */

import type { ServerResponse } from 'node:http'
import { readFile } from 'node:fs/promises'
import { dirname, extname, join, normalize, resolve, sep } from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import type {} from '@deepseek-ai/dsh-client-connection'
import type {} from '@deepseek-ai/dsh-host-webserver'

/** Stable Cordis plugin name. */
export const name = 'frontend-static'

/** Services required before the authenticated fallback seat can be claimed. */
export const inject = ['webServer', 'connection']

/** Registry of the browser application's history-API route prefixes. */
export interface FrontendStaticRoutes {
  /**
   * Declare one absolute URL path prefix owned by the browser application's
   * history router. A GET/HEAD request at or under the prefix that matches no
   * dist file then renders the index instead of 404, so the router resolves
   * the route in the browser. Paths whose extension names a served static type
   * keep the 404, so a missing asset never arrives as HTML.
   * @param prefix - absolute path below the site root, such as `/projects`.
   * @returns the disposer that withdraws this prefix.
   * @throws when the prefix is not an absolute path below the site root.
   */
  registerAppRoute: (prefix: string) => () => void
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    frontendStatic: FrontendStaticRoutes
  }
}

/** Service name carrying the {@link FrontendStaticRoutes} registry. */
const ROUTES_SERVICE = 'frontendStatic'

/** Plugin config: the dist anchor. */
export interface Config {
  /** Absolute path of index.html inside the dist root. */
  distIndex: string
}

export const Config: z<Config> = z.object({
  distIndex: z.string().required(),
})

const HTML_MIME = 'text/html; charset=utf-8'

const MIME: Record<string, string> = {
  '.html': HTML_MIME,
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.map': 'application/json',
  '.webmanifest': 'application/manifest+json',
  // The packed VFS image. Served as its own bytes, never as a Content-Encoding:
  // the worker inflates the body itself, and a transport-level encoding would
  // leave it inflating an already-decoded archive.
  '.gz': 'application/gzip',
}

const STATIC_MISS_CODES: ReadonlySet<string | undefined> = new Set([
  'ENOENT',
  'EISDIR',
  'ENOTDIR',
])

/**
 * Reject a prefix that cannot name a browser route below the site root.
 * The site root already has its two explicit index entry points, so `/` as a
 * prefix would turn every miss into HTML and erase the 404 contract.
 * @param prefix - the caller's declared prefix.
 * @returns the prefix without a trailing slash.
 */
function normalizeAppRoute(prefix: string): string {
  const trimmed = prefix.trim()
  const collapsed = trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed
  if (!collapsed.startsWith('/') || collapsed === '' || collapsed.includes('//')) {
    throw new Error(
      `frontend-static: app route prefix ${JSON.stringify(prefix)} must be an absolute path below the site root, such as "/projects"`,
    )
  }
  return collapsed
}

/**
 * Whether a dist miss is a deep browser-application route rather than an absent file.
 * @param pathname - decoded request pathname.
 * @param prefixes - currently declared route prefixes.
 */
function ownsAppRoute(pathname: string, prefixes: ReadonlySet<string>): boolean {
  // An extension naming a served static type is an asset request: a missing
  // bundle, stylesheet, or source map stays 404 rather than arriving as HTML.
  if (Object.hasOwn(MIME, extname(pathname))) return false
  for (const prefix of prefixes) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return true
  }
  return false
}

/**
 * Serve one GET/HEAD static request from the dist root.
 * @param pathname - decoded URL pathname of the request.
 * @param res - the node:http response to write.
 * @param distRoot - absolute dist root directory (resolved by the caller).
 * @param distIndex - absolute path of index.html inside distRoot.
 * @param authorizeIndex - authenticates an index response before its bytes are read.
 * @param renderIndex - produces the index.html body (structured injection
 * rendering) for the dist root, the configured index path, and declared
 * browser-application routes.
 * @param appRoutes - declared history-router prefixes whose dist misses render the index.
 */
export async function serveStatic(
  pathname: string, res: ServerResponse, distRoot: string, distIndex: string,
  authorizeIndex: () => boolean,
  renderIndex: () => Promise<string>,
  appRoutes: ReadonlySet<string> = new Set(),
): Promise<void> {
  const target = resolve(normalize(join(distRoot, pathname)))
  // Traversal rejection: the target must be distRoot itself (`/`) or stay under
  // it. `sep`, not '/': resolve() emits backslash paths on Windows, where a '/'
  // suffix would reject every legitimate subpath as traversal.
  if (target !== distRoot && !target.startsWith(distRoot + sep)) {
    res.writeHead(403)
    res.end()
    return
  }
  let body: string | Buffer
  let type: string
  try {
    if (target === distRoot || target === distIndex) {
      if (!authorizeIndex()) return
      body = await renderIndex()
      type = HTML_MIME
    } else {
      body = await readFile(target)
      type = MIME[extname(target)] ?? 'application/octet-stream'
    }
  } catch (error) {
    // Only absent or non-file targets are 404; other filesystem failures reach
    // the webserver's request-failure handling.
    if (!STATIC_MISS_CODES.has((error as NodeJS.ErrnoException).code)) throw error
    if (!ownsAppRoute(pathname, appRoutes)) {
      res.writeHead(404)
      res.end()
      return
    }
    // A declared browser route resolves in the router, so the shell answers
    // here on the same authenticated terms as the explicit index entry points.
    if (!authorizeIndex()) return
    body = await renderIndex()
    type = HTML_MIME
  }
  res.writeHead(200, { 'content-type': type })
  res.end(body)
}

/**
 * Claim the webserver fallback seat and serve the dist.
 * @param ctx - plugin context carrying the webServer service.
 * @param config - validated {@link Config}.
 */
export function apply(ctx: Context, config: Config): void {
  const distIndex = config.distIndex
  const distRoot = dirname(distIndex)
  // The dist is built with a relative base so the same files mount under any
  // static directory; served pages also answer deep SPA-fallback paths, where
  // relative asset URLs would resolve under the request directory, so the
  // served form anchors them at the site root ahead of every URL-bearing tag.
  const renderIndex = async (): Promise<string> => {
    const body = ctx.webServer.renderIndex(await readFile(distIndex, 'utf8'))
    return body.replace(/<head(?:\s[^>]*)?>/i, open => `${open}<base href="/">`)
  }
  // Read at request time, so a route owner mounting after this seat is claimed
  // still reaches the router, and a disposed owner stops answering at once.
  const appRoutes = new Set<string>()
  ctx.provide(ROUTES_SERVICE, {
    registerAppRoute: (prefix: string) => {
      const normalized = normalizeAppRoute(prefix)
      appRoutes.add(normalized)
      return () => { appRoutes.delete(normalized) }
    },
  } satisfies FrontendStaticRoutes)
  ctx.effect(() => ctx.webServer.registerFallback(async (req, res) => {
    // Non-GET/HEAD without a matching named route is 405 (fallback-only
    // semantics: named routes own their method handling).
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405)
      res.end()
      return
    }
    /* v8 ignore next -- node:http always sets url on server requests */
    const rawPath = new URL(req.url ?? '/', 'http://x').pathname
    await serveStatic(
      decodeURIComponent(rawPath),
      res,
      distRoot,
      distIndex,
      () => ctx.connection.authorizeIndex(req, res),
      renderIndex,
      appRoutes,
    )
  }), 'frontend-static: fallback seat')
}
