/**
 * Client Fashion Analysis adapter: mount generated Remote, then snapshot service.
 * @module @gentlexx/dsh-api-fashion-analysis-controller/src/client
 */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-gateway/client'
import fashionAnalysisRemote from '@gentlexx/dsh-api-fashion-analysis-controller/remote'
import { ClientFashionAnalysisModel, type FashionAnalysisRemote } from './model.ts'
import { FashionAnalysisService } from './service.ts'

export { ClientFashionAnalysisModel } from './model.ts'
export type { FashionAnalysisRemote, AnalysisListState } from './model.ts'
export { FashionAnalysisService, FashionAnalysisCommandError } from './service.ts'
export type { FashionAnalysisClient } from './service.ts'
export type {
  DesignOpportunity,
  DesignOpportunityId,
  MarketItem,
  MarketItemId,
  PopularitySignal,
  PopularitySignalId,
  TrendCluster,
  TrendClusterId,
} from '../types.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** React-free Client Fashion Analysis state and commands. */
    fashionAnalysis: import('./service.ts').FashionAnalysisClient
  }
}

/**
 * Required Client Remote mount point. `remote.fashionAnalysis` is installed in
 * {@link apply} via `$mount` of this package's generated `./remote` artifact.
 */
export const inject = ['remote']

/**
 * Install Client Fashion Analysis state after the generated Remote namespace is ready.
 * @param ctx - Client context that may read `remote.fashionAnalysis`.
 */
function installFashionAnalysis(ctx: Context): void {
  const remote = (ctx.remote as unknown as { fashionAnalysis: FashionAnalysisRemote }).fashionAnalysis
  const model = new ClientFashionAnalysisModel(remote)
  new FashionAnalysisService(ctx, model)
}

/**
 * Mount `ctx.remote.fashionAnalysis` and install Client state.
 * @param ctx - Client root Context.
 * @returns disposer that withdraws the nested fiber and Remote contribution.
 */
export async function apply(ctx: Context): Promise<() => Promise<void>> {
  const disposeRemote = await ctx.remote.$mount(fashionAnalysisRemote)
  const nested = ctx.inject(['remote.fashionAnalysis'], installFashionAnalysis)
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
