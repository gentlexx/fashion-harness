/**
 * Client Fashion Projects service face (`ctx.fashionProjects`).
 * @module @gentlexx/dsh-api-fashion-project-controller/src/client/service
 */

import { Service, type Context } from '@deepseek-ai/cordis'
import type { ProjectId, ProjectView } from '@gentlexx/dsh-fashion-project/types'
import type { ObservableSnapshot } from '@deepseek-ai/dsh-client-store'
import type { RemoteFailure } from '@deepseek-ai/dsh-typert-protocol'
import type { ClientFashionProjectModel, ProjectListState } from './model.ts'

/** Structured create failure for callers that distinguish Host business errors. */
export class FashionProjectCreateError extends Error {
  override readonly name = 'FashionProjectCreateError'

  /** @param rpcError - Host business or folded carrier failure. */
  constructor(readonly rpcError: RemoteFailure) {
    super(`fashion project create failed: ${rpcError.code}: ${rpcError.message}`)
  }
}

/** Browser Fashion Projects service. */
export interface FashionProjectsClient {
  readonly list: ObservableSnapshot<ProjectListState>
  /**
   * Refresh the list from Host.
   */
  load(): Promise<void>
  /**
   * Create a project and merge the Host projection into the list.
   * @param title - raw title.
   */
  create(title: string): Promise<ProjectView>
  /**
   * Fetch one project by id.
   * @param projectId - branded identity.
   */
  get(projectId: ProjectId): Promise<ProjectView>
}

/** Owns the bare Fashion Projects snapshot and commands. */
export class FashionProjectsService extends Service implements FashionProjectsClient {
  readonly list: ObservableSnapshot<ProjectListState>

  /**
   * @param ctx - Client root Context.
   * @param model - Remote-backed Fashion Project state model.
   */
  constructor(ctx: Context, private readonly model: ClientFashionProjectModel) {
    super(ctx, 'fashionProjects')
    this.list = model.list
  }

  load(): Promise<void> {
    return this.model.load()
  }

  async create(title: string): Promise<ProjectView> {
    try {
      return await this.model.create(title)
    } catch (error) {
      if (isRemoteFailure(error)) throw new FashionProjectCreateError(error)
      throw error
    }
  }

  get(projectId: ProjectId): Promise<ProjectView> {
    return this.model.get(projectId)
  }
}

function isRemoteFailure(error: unknown): error is RemoteFailure {
  return typeof error === 'object'
    && error !== null
    && 'code' in error
    && 'message' in error
}
