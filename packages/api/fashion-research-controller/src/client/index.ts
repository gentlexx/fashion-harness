/**
 * Client Fashion Research adapter: mount generated Remote, then snapshot service.
 * @module @gentlexx/dsh-api-fashion-research-controller/src/client
 */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-gateway/client'
import fashionResearchRemote from '@gentlexx/dsh-api-fashion-research-controller/remote'
import { ClientFashionResearchModel, type FashionResearchRemote } from './model.ts'
import { FashionResearchService } from './service.ts'

export { ClientFashionResearchModel } from './model.ts'
export type { FashionResearchRemote, ResearchListState } from './model.ts'
export { FashionResearchService, FashionResearchCommandError } from './service.ts'
export type { FashionResearchClient } from './service.ts'
export type {
  Evidence,
  EvidenceId,
  ProjectId,
  ResearchTask,
  ResearchTaskId,
  Sample,
  SampleId,
  Source,
  SourceId,
} from '../types.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** React-free Client Fashion Research state and commands. */
    fashionResearch: import('./service.ts').FashionResearchClient
  }
}

/**
 * Required Client Remote mount point. `remote.fashionResearch` is installed in
 * {@link apply} via `$mount` of this package's generated `./remote` artifact.
 */
export const inject = ['remote']

/**
 * Install Client Fashion Research state after the generated Remote namespace is ready.
 * @param ctx - Client context that may read `remote.fashionResearch`.
 */
function installFashionResearch(ctx: Context): void {
  const remote = (ctx.remote as unknown as { fashionResearch: FashionResearchRemote }).fashionResearch
  const model = new ClientFashionResearchModel(remote)
  new FashionResearchService(ctx, model)
}

/**
 * Mount `ctx.remote.fashionResearch` and install Client state.
 * @param ctx - Client root Context.
 * @returns disposer that withdraws the nested fiber and Remote contribution.
 */
export async function apply(ctx: Context): Promise<() => Promise<void>> {
  const disposeRemote = await ctx.remote.$mount(fashionResearchRemote)
  const nested = ctx.inject(['remote.fashionResearch'], installFashionResearch)
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
