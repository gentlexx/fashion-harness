/**
 * Client Fashion Agent adapter: mount generated Remote, then snapshot service.
 * @module @gentlexx/dsh-api-fashion-agent-controller/src/client
 */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-gateway/client'
import fashionAgentRemote from '@gentlexx/dsh-api-fashion-agent-controller/remote'
import { ClientFashionAgentModel, type FashionAgentRemote } from './model.ts'
import { FashionAgentService } from './service.ts'

export { ClientFashionAgentModel, emptyFashionAgentStatus } from './model.ts'
export type { FashionAgentRemote } from './model.ts'
export { FashionAgentService } from './service.ts'
export type { FashionAgentClient } from './service.ts'
export type {
  FashionAgentBindRequest,
  FashionAgentBindValue,
  FashionAgentStatusValue,
} from '../types.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Browser Fashion Agent binding state and commands. */
    fashionAgent: import('./service.ts').FashionAgentClient
  }
}

export const inject = ['remote']

/** @param ctx - Client context after `remote.fashionAgent` is mounted. */
function installFashionAgent(ctx: Context): void {
  const remote = (ctx.remote as unknown as { fashionAgent: FashionAgentRemote }).fashionAgent
  new FashionAgentService(ctx, new ClientFashionAgentModel(remote))
}

/**
 * Mount `ctx.remote.fashionAgent` and install the Client service.
 * @param ctx - Client root Context.
 * @returns disposer for the nested fiber and Remote contribution.
 */
export async function apply(ctx: Context): Promise<() => Promise<void>> {
  const disposeRemote = await ctx.remote.$mount(fashionAgentRemote)
  const nested = ctx.inject(['remote.fashionAgent'], installFashionAgent)
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
