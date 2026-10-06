/**
 * Host Fashion Agent Remote owner.
 * @module @gentlexx/dsh-api-fashion-agent-controller
 */

import { Context } from '@deepseek-ai/cordis'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { FashionAgentCommands } from './commands.ts'
import type {
  FashionAgentBindRequest,
  FashionAgentBindValue,
  FashionAgentSessionRequest,
  FashionAgentStatusValue,
} from './types.ts'

export type * from './types.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Host Fashion Agent business API and Remote namespace owner. */
    fashionAgentController: FashionAgentController
  }
}

/** Host service backing the `fashionAgent` Remote namespace. */
export class FashionAgentController extends TypertRemoteService {
  static inject = ['typert', 'fashionAgentContext']

  private readonly commands: FashionAgentCommands

  /** @param ctx - Host context containing the Fashion Agent context service. */
  constructor(ctx: Context) {
    super(ctx, 'fashionAgentController', { namespace: 'fashionAgent' })
    this.commands = new FashionAgentCommands(ctx)
  }

  /**
   * Bind the session to a Fashion project.
   * @param request - session, project, and optional confirm flag.
   */
  @Remote('bindSession')
  bindSession(request: FashionAgentBindRequest): Promise<FashionAgentBindValue> {
    return this.commands.bindSession(request)
  }

  /**
   * Read live binding and snapshot status for the Agent UI.
   * @param request - session identity.
   */
  @Remote('getStatus')
  getStatus(request: FashionAgentSessionRequest): Promise<FashionAgentStatusValue> {
    return this.commands.getStatus(request)
  }
}

export default FashionAgentController
