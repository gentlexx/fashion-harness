/**
 * Client Fashion Agent service face (`ctx.fashionAgent`).
 * @module @gentlexx/dsh-api-fashion-agent-controller/src/client/service
 */

import { Service, type Context } from '@deepseek-ai/cordis'
import type { ObservableSnapshot } from '@deepseek-ai/dsh-client-store'
import type { SessionId } from '@deepseek-ai/dsh-session'
import type { FashionAgentBindRequest, FashionAgentBindValue, FashionAgentStatusValue } from '../types.ts'
import type { ClientFashionAgentModel } from './model.ts'

/** Browser Fashion Agent binding commands. */
export interface FashionAgentClient {
  readonly view: ObservableSnapshot<FashionAgentStatusValue>
  bind(request: FashionAgentBindRequest): Promise<FashionAgentBindValue>
  sync(sessionId: SessionId | undefined): Promise<FashionAgentStatusValue>
}

/** Owns the Agent binding snapshot and commands. */
export class FashionAgentService extends Service implements FashionAgentClient {
  readonly view: ObservableSnapshot<FashionAgentStatusValue>

  /**
   * @param ctx - Client root Context.
   * @param model - Remote-backed Fashion Agent state model.
   */
  constructor(ctx: Context, private readonly model: ClientFashionAgentModel) {
    super(ctx, 'fashionAgent')
    this.view = model.view
  }

  bind(request: FashionAgentBindRequest): Promise<FashionAgentBindValue> {
    return this.model.bind(request)
  }

  sync(sessionId: SessionId | undefined): Promise<FashionAgentStatusValue> {
    return this.model.sync(sessionId)
  }
}
