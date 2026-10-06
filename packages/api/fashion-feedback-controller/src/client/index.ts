/**
 * Client Fashion Feedback adapter. Mounts the generated Remote, then the service.
 * @module @gentlexx/dsh-api-fashion-feedback-controller/src/client
 */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-gateway/client'
import fashionFeedbackRemote from '@gentlexx/dsh-api-fashion-feedback-controller/remote'
import { ClientFashionFeedbackModel, type FashionFeedbackRemote } from './model.ts'
import { FashionFeedbackService } from './service.ts'

export { ClientFashionFeedbackModel } from './model.ts'
export type { FashionFeedbackRemote } from './model.ts'
export { FashionFeedbackService } from './service.ts'
export type { FashionFeedbackClient } from './service.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Browser Fashion Feedback commands. */
    fashionFeedback: import('./service.ts').FashionFeedbackClient
  }
}

/** @param ctx - Client context after `remote.fashionFeedback` is mounted. */
function installFashionFeedback(ctx: Context): void {
  const remote = (ctx.remote as unknown as { fashionFeedback: FashionFeedbackRemote }).fashionFeedback
  new FashionFeedbackService(ctx, new ClientFashionFeedbackModel(remote))
}

/**
 * Mount `ctx.remote.fashionFeedback` and install the Client service.
 * @param ctx - Client root Context.
 * @returns disposer for the nested fiber and Remote contribution.
 */
export async function apply(ctx: Context): Promise<() => Promise<void>> {
  const disposeRemote = await ctx.remote.$mount(fashionFeedbackRemote)
  const nested = ctx.inject(['remote.fashionFeedback'], installFashionFeedback)
  try {
    await nested
  } catch (error) {
    await nested.dispose()
    await disposeRemote()
    throw error
  }
  return async () => {
    await nested.dispose()
    await disposeRemote()
  }
}

export const inject = ['remote']
