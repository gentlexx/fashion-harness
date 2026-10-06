/**
 * Wire types for the Fashion Agent Remote namespace.
 * @module @gentlexx/dsh-api-fashion-agent-controller/src/types
 */

import type {
  FashionAgentEntrySurface,
  FashionAgentScopeId,
  FashionBindResult,
  FashionProjectSnapshot,
  FashionSessionBinding,
} from '@gentlexx/dsh-fashion-agent'
import type { ProjectId } from '@gentlexx/dsh-fashion-project/types'
import type { SessionId } from '@deepseek-ai/dsh-session'

export type {
  FashionAgentEntrySurface,
  FashionAgentScopeId,
  FashionBindResult,
  FashionProjectSnapshot,
  FashionSessionBinding,
}

/** Bind the current session to a project. */
export interface FashionAgentBindRequest {
  readonly sessionId: SessionId
  readonly projectId: ProjectId
  readonly confirmUnboundWithMessages?: boolean
  readonly entrySurface?: FashionAgentEntrySurface | null
}

/** Session identity for binding / snapshot reads. */
export interface FashionAgentSessionRequest {
  readonly sessionId: SessionId
}

/** Compact UI status for the Agent lead and dock strip. */
export interface FashionAgentStatusValue {
  readonly sessionId: SessionId | null
  readonly status:
    | 'unbound'
    | 'bound'
    | 'unavailable'
    | 'conflict'
    | 'needs-confirm'
  readonly projectId: string | null
  readonly projectTitle: string | null
  readonly boundAt: string | null
  readonly snapshotVersion: string | null
  readonly projectUpdatedAt: string | null
  readonly dataScope: readonly FashionAgentScopeId[]
  readonly currentStage: string | null
  readonly entrySurface: FashionAgentEntrySurface | null
  readonly readonlyAssist: true
  readonly message: string | null
}

/** Bind Remote result. */
export interface FashionAgentBindValue {
  readonly result: FashionBindResult
  readonly status: FashionAgentStatusValue
}
