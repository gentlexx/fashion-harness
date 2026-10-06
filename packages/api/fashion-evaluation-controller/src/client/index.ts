/**
 * Client Fashion Evaluation adapter. Mounts the generated Remote, then the service.
 * @module @gentlexx/dsh-api-fashion-evaluation-controller/src/client
 */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-gateway/client'
import fashionEvaluationRemote from '@gentlexx/dsh-api-fashion-evaluation-controller/remote'
import { ClientFashionEvaluationModel, type FashionEvaluationRemote } from './model.ts'
import { FashionEvaluationService } from './service.ts'

export { ClientFashionEvaluationModel } from './model.ts'
export type { FashionEvaluationRemote } from './model.ts'
export { FashionEvaluationService } from './service.ts'
export type { FashionEvaluationClient } from './service.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Browser Fashion Evaluation commands. */
    fashionEvaluation: import('./service.ts').FashionEvaluationClient
  }
}

export const inject = ['remote']

/** @param ctx - Client context after `remote.fashionEvaluation` is mounted. */
function installFashionEvaluation(ctx: Context): void {
  const remote = (ctx.remote as unknown as { fashionEvaluation: FashionEvaluationRemote }).fashionEvaluation
  new FashionEvaluationService(ctx, new ClientFashionEvaluationModel(remote))
}

/**
 * Mount `ctx.remote.fashionEvaluation` and install the Client service.
 * @param ctx - Client root Context.
 * @returns disposer for the nested fiber and Remote contribution.
 */
export async function apply(ctx: Context): Promise<() => Promise<void>> {
  const disposeRemote = await ctx.remote.$mount(fashionEvaluationRemote)
  const nested = ctx.inject(['remote.fashionEvaluation'], installFashionEvaluation)
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
