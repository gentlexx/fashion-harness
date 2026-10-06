/**
 * Client Fashion Design adapter: mount generated Remote, then snapshot service.
 * @module @gentlexx/dsh-api-fashion-design-controller/src/client
 */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-gateway/client'
import fashionDesignRemote from '@gentlexx/dsh-api-fashion-design-controller/remote'
import { ClientFashionDesignModel, type FashionDesignRemote } from './model.ts'
import { FashionDesignService } from './service.ts'

export { ClientFashionDesignModel } from './model.ts'
export type { FashionDesignRemote, DesignListState } from './model.ts'
export { FashionDesignService, FashionDesignCommandError } from './service.ts'
export type { FashionDesignClient } from './service.ts'
export type {
  ConceptSet,
  ConceptSetId,
  DesignBriefId,
  DesignConcept,
  DesignConceptId,
  DesignOpportunityBrief,
  VisualDraft,
  VisualDraftId,
} from '../types.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** React-free Client Fashion Design state and commands. */
    fashionDesign: import('./service.ts').FashionDesignClient
  }
}

/**
 * Required Client Remote mount point. `remote.fashionDesign` is installed in
 * {@link apply} via `$mount` of this package's generated `./remote` artifact.
 */
export const inject = ['remote']

/**
 * Install Client Fashion Design state after the generated Remote namespace is ready.
 * @param ctx - Client context that may read `remote.fashionDesign`.
 */
function installFashionDesign(ctx: Context): void {
  const remote = (ctx.remote as unknown as { fashionDesign: FashionDesignRemote }).fashionDesign
  const model = new ClientFashionDesignModel(remote)
  new FashionDesignService(ctx, model)
}

/**
 * Mount `ctx.remote.fashionDesign` and install Client state.
 * @param ctx - Client root Context.
 * @returns disposer that withdraws the nested fiber and Remote contribution.
 */
export async function apply(ctx: Context): Promise<() => Promise<void>> {
  const disposeRemote = await ctx.remote.$mount(fashionDesignRemote)
  const nested = ctx.inject(['remote.fashionDesign'], installFashionDesign)
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
