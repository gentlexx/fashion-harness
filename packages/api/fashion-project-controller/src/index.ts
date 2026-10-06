/**
 * Host Fashion Project Remote owner.
 * @module @gentlexx/dsh-api-fashion-project-controller
 */

import { Context } from '@deepseek-ai/cordis'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { FashionProjectCommands } from './commands.ts'
import type {
  FashionProjectCreateRequest,
  FashionProjectCreateValue,
  FashionProjectGetRequest,
  FashionProjectGetValue,
  FashionProjectListValue,
} from './types.ts'

export type * from './types.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Host Fashion Project business API and Remote namespace owner. */
    fashionProjectController: FashionProjectController
  }
}

/** Host service backing the generated `ctx.remote.fashionProject` namespace. */
export class FashionProjectController extends TypertRemoteService {
  static inject = ['typert', 'fashionProjectRegistry']

  private readonly commands: FashionProjectCommands

  /** @param ctx - Host context containing the Fashion Project registry. */
  constructor(ctx: Context) {
    super(ctx, 'fashionProjectController', { namespace: 'fashionProject' })
    this.commands = new FashionProjectCommands(ctx)
  }

  /**
   * Create a user-owned Fashion Project.
   * @param request - title to persist.
   * @returns the Host-committed project projection.
   */
  @Remote('create')
  create(request: FashionProjectCreateRequest): Promise<FashionProjectCreateValue> {
    return this.commands.create(request)
  }

  /**
   * Read one Fashion Project by id.
   * @param request - branded project identity.
   * @returns the project projection.
   */
  @Remote('get')
  get(request: FashionProjectGetRequest): FashionProjectGetValue {
    return this.commands.get(request)
  }

  /**
   * List every Fashion Project in Host-stable order.
   * @returns ordered project projections.
   */
  @Remote('list')
  list(): FashionProjectListValue {
    return this.commands.list()
  }
}

export default FashionProjectController
