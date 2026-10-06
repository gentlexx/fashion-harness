/**
 * Fashion Project Remote command projection onto the Host registry.
 * @module @gentlexx/dsh-api-fashion-project-controller/src/commands
 */

import type { Context } from '@deepseek-ai/cordis'
import {
  FashionProjectInvalidTitleError,
  ProjectId,
  type FashionProject,
} from '@gentlexx/dsh-fashion-project'
import { RemoteError } from '@deepseek-ai/dsh-typert-protocol'
import type {
  FashionProjectCreateRequest,
  FashionProjectCreateValue,
  FashionProjectGetRequest,
  FashionProjectGetValue,
  FashionProjectListValue,
} from './types.ts'

/** Maps registry operations onto serializable Remote values. */
export class FashionProjectCommands {
  /** @param ctx - Host context providing {@link Context.fashionProjectRegistry}. */
  constructor(private readonly ctx: Context) {}

  /**
   * Create a user project after Host title validation.
   * @param request - create payload.
   */
  async create(request: FashionProjectCreateRequest): Promise<FashionProjectCreateValue> {
    try {
      const project = await this.ctx.fashionProjectRegistry.create({ title: request.title })
      return { project: projectView(project) }
    } catch (error) {
      if (error instanceof FashionProjectInvalidTitleError) {
        throw new RemoteError(
          'fashion-project/invalid-title',
          error.message,
          { title: error.title },
        )
      }
      throw error
    }
  }

  /**
   * Read one project or throw not-found.
   * @param request - get payload.
   */
  get(request: FashionProjectGetRequest): FashionProjectGetValue {
    const projectId = ProjectId(String(request.projectId))
    const project = this.ctx.fashionProjectRegistry.get(projectId)
    if (project === undefined) {
      throw new RemoteError(
        'fashion-project/not-found',
        `fashion project '${projectId}' was not found`,
        { projectId },
      )
    }
    return { project: projectView(project) }
  }

  /** List every project in Host-stable order. */
  list(): FashionProjectListValue {
    return {
      items: this.ctx.fashionProjectRegistry.list().map(projectView),
    }
  }
}

/**
 * Project one registry entity onto the Remote view.
 * @param project - Host projection.
 */
function projectView(project: FashionProject): FashionProject {
  return {
    id: project.id,
    title: project.title,
    origin: project.origin,
    accessMode: project.accessMode,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    revision: project.revision,
  }
}
