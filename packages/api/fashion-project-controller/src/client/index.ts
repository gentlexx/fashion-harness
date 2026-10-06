/**
 * Client Fashion Projects adapter: mount generated Remote, then snapshot service.
 * @module @gentlexx/dsh-api-fashion-project-controller/src/client
 */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-gateway/client'
import fashionProjectRemote from '@gentlexx/dsh-api-fashion-project-controller/remote'
import { ClientFashionProjectModel, type FashionProjectRemote } from './model.ts'
import { FashionProjectsService } from './service.ts'

export { ClientFashionProjectModel } from './model.ts'
export type { FashionProjectRemote, ProjectListState } from './model.ts'
export { FashionProjectsService, FashionProjectCreateError } from './service.ts'
export type { FashionProjectsClient } from './service.ts'
export type { ProjectId, ProjectView } from '../types.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** React-free Client Fashion Project state and commands. */
    fashionProjects: import('./service.ts').FashionProjectsClient
  }
}

/**
 * Required Client Remote mount point. `remote.fashionProject` is installed in
 * {@link apply} via `$mount` of this package's generated `./remote` artifact —
 * product-specific namespaces stay out of the shared `dsh-api-remotes` assembly.
 */
export const inject = ['remote']

/**
 * Install Client Fashion Project state after the generated Remote namespace is ready.
 * @param ctx - Client context that may read `remote.fashionProject` (nested inject).
 */
function installFashionProjects(ctx: Context): void {
  const remote = (ctx.remote as unknown as { fashionProject: FashionProjectRemote }).fashionProject
  const model = new ClientFashionProjectModel(remote)
  new FashionProjectsService(ctx, model)
  void model.load()
}

/**
 * Mount `ctx.remote.fashionProject`, install Client state, and start the list load.
 * @param ctx - Client root Context.
 * @returns disposer that withdraws the nested fiber and Remote contribution.
 */
export async function apply(ctx: Context): Promise<() => Promise<void>> {
  const disposeRemote = await ctx.remote.$mount(fashionProjectRemote)
  const nested = ctx.inject(['remote.fashionProject'], installFashionProjects)
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
