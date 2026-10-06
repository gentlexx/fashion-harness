/**
 * Host loader entry for the browser-only Fashion shell plugin. The shell's UI
 * is entirely a Client half; this entry only tells the dist server which URL
 * prefix the Fashion history router owns, so a deep product route survives a
 * refresh or a pasted URL instead of returning 404.
 * @module @gentlexx/dsh-client-ui-fashion-shell
 */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-host-frontend-static'

/** Stable Cordis plugin name. */
export const name = 'ui-fashion-shell'

/**
 * The single prefix covering every route in the Client `routes.ts` table:
 * projects, research, analysis, design, review, deliverables, and the F4
 * feedback, outcome, evaluation, and improvement routes all nest under it.
 */
const FASHION_ROUTE_PREFIX = '/projects'

/**
 * Declare the Fashion route prefix to the dist server when one is composed.
 *
 * The declaration is optional by composition, not by accident: a Fashion
 * composition without an HTTP dist server (a worker preview) serves no URLs
 * for a browser to refresh, so there is nothing to fall back to.
 * @param ctx - plugin context for this shell row.
 */
export function apply(ctx: Context): void {
  ctx.inject(['frontendStatic'], (routeCtx) => {
    routeCtx.effect(
      () => routeCtx.frontendStatic.registerAppRoute(FASHION_ROUTE_PREFIX),
      'ui-fashion-shell: Fashion route deep-link fallback',
    )
  })
}
