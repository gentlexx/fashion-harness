/**
 * Unary Fashion Agent Remote calls and UI snapshot.
 * @module @gentlexx/dsh-api-fashion-agent-controller/src/client/model
 */

import { createSnapshotStore, type ObservableSnapshot } from '@deepseek-ai/dsh-client-store'
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol'
import type { SessionId } from '@deepseek-ai/dsh-session'
import type {
  FashionAgentBindRequest,
  FashionAgentBindValue,
  FashionAgentSessionRequest,
  FashionAgentStatusValue,
} from '../types.ts'

/** Generated `fashionAgent` namespace. */
export interface FashionAgentRemote {
  bindSession(request: FashionAgentBindRequest): Promise<RemoteResult<FashionAgentBindValue>>
  getStatus(request: FashionAgentSessionRequest): Promise<RemoteResult<FashionAgentStatusValue>>
}

/** Unbound UI status used before the first Host read. */
export function emptyFashionAgentStatus(sessionId: SessionId | null): FashionAgentStatusValue {
  return {
    sessionId,
    status: 'unbound',
    projectId: null,
    projectTitle: null,
    boundAt: null,
    snapshotVersion: null,
    projectUpdatedAt: null,
    dataScope: [],
    currentStage: null,
    entrySurface: null,
    readonlyAssist: true,
    message: null,
  }
}

/** @param remote - Mounted fashionAgent namespace. */
export class ClientFashionAgentModel {
  readonly view: ObservableSnapshot<FashionAgentStatusValue>

  private readonly store = createSnapshotStore<FashionAgentStatusValue>(emptyFashionAgentStatus(null))

  constructor(private readonly remote: FashionAgentRemote) {
    this.view = this.store
  }

  /**
   * Bind the current session and publish the Host status.
   * @param request - bind payload.
   */
  async bind(request: FashionAgentBindRequest): Promise<FashionAgentBindValue> {
    const value = await unwrap(this.remote.bindSession(request))
    this.store.set(value.status)
    return value
  }

  /**
   * Refresh Host status for one session.
   * @param sessionId - current session, or undefined when none is selected.
   */
  async sync(sessionId: SessionId | undefined): Promise<FashionAgentStatusValue> {
    if (sessionId === undefined) {
      const empty = emptyFashionAgentStatus(null)
      this.store.set(empty)
      return empty
    }
    const status = await unwrap(this.remote.getStatus({ sessionId }))
    this.store.set(status)
    return status
  }
}

function unwrap<T>(result: Promise<RemoteResult<T>>): Promise<T> {
  return result.then((value) => {
    if (!value.ok) throw value.error
    return value.value
  })
}
