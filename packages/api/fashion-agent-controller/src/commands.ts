/**
 * Fashion Agent Remote commands over the Host context service.
 * @module @gentlexx/dsh-api-fashion-agent-controller/src/commands
 */

import type { Context } from '@deepseek-ai/cordis'
import type { FashionAgentContextStatus, FashionBindResult } from '@gentlexx/dsh-fashion-agent'
import { ProjectId } from '@gentlexx/dsh-fashion-project'
import { SessionId } from '@deepseek-ai/dsh-session'
import type {
  FashionAgentBindRequest,
  FashionAgentBindValue,
  FashionAgentSessionRequest,
  FashionAgentStatusValue,
} from './types.ts'

/** Maps Host Fashion Agent operations onto serializable Remote values. */
export class FashionAgentCommands {
  /** @param ctx - Host context providing {@link Context.fashionAgentContext}. */
  constructor(private readonly ctx: Context) {}

  /**
   * Bind a session to a project using Host-inspected message state when available.
   * @param request - session, project, and optional confirm / entry surface.
   */
  async bindSession(request: FashionAgentBindRequest): Promise<FashionAgentBindValue> {
    const sessionId = SessionId(String(request.sessionId))
    const projectId = ProjectId(String(request.projectId))
    const result = await this.ctx.fashionAgentContext.bind({
      sessionId,
      projectId,
      hasUserMessages: this.ctx.fashionAgentContext.sessionHasUserMessages(sessionId),
      ...request.confirmUnboundWithMessages === undefined
        ? {}
        : { confirmUnboundWithMessages: request.confirmUnboundWithMessages },
      ...request.entrySurface === undefined
        ? {}
        : { entrySurface: request.entrySurface },
    })
    return {
      result,
      status: await this.statusFromResult(sessionId, result),
    }
  }

  /**
   * Read live binding + snapshot status for the Agent UI.
   * @param request - session identity.
   */
  async getStatus(request: FashionAgentSessionRequest): Promise<FashionAgentStatusValue> {
    const sessionId = SessionId(String(request.sessionId))
    const status = await this.ctx.fashionAgentContext.statusOf(sessionId)
    return toStatusValue(sessionId, status)
  }

  /**
   * Derive UI status after a bind attempt, including conflict / confirm.
   * @param sessionId - session identity.
   * @param result - bind result.
   */
  private async statusFromResult(
    sessionId: ReturnType<typeof SessionId>,
    result: FashionBindResult,
  ): Promise<FashionAgentStatusValue> {
    if (result.kind === 'conflict-other-project') {
      return {
        sessionId,
        status: 'conflict',
        projectId: String(result.requestedProjectId),
        projectTitle: null,
        boundAt: result.binding.boundAt,
        snapshotVersion: null,
        projectUpdatedAt: null,
        dataScope: [],
        currentStage: null,
        entrySurface: result.binding.entrySurface,
        readonlyAssist: true,
        message: 'session-bound-to-other-project',
      }
    }
    if (result.kind === 'needs-confirm') {
      return {
        sessionId,
        status: 'needs-confirm',
        projectId: String(result.projectId),
        projectTitle: null,
        boundAt: null,
        snapshotVersion: null,
        projectUpdatedAt: null,
        dataScope: [],
        currentStage: null,
        entrySurface: null,
        readonlyAssist: true,
        message: 'unbound-session-has-messages',
      }
    }
    if (result.kind === 'unavailable') {
      return {
        sessionId,
        status: 'unavailable',
        projectId: String(result.projectId),
        projectTitle: null,
        boundAt: null,
        snapshotVersion: null,
        projectUpdatedAt: null,
        dataScope: [],
        currentStage: null,
        entrySurface: null,
        readonlyAssist: true,
        message: result.message,
      }
    }
    return toStatusValue(sessionId, {
      kind: 'bound',
      binding: result.binding,
      snapshot: result.snapshot,
    })
  }
}

/**
 * Project a live Host status onto the UI value.
 * @param sessionId - session identity.
 * @param status - Host status.
 */
function toStatusValue(
  sessionId: ReturnType<typeof SessionId>,
  status: FashionAgentContextStatus,
): FashionAgentStatusValue {
  if (status.kind === 'unbound') {
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
  if (status.kind === 'unavailable') {
    return {
      sessionId,
      status: 'unavailable',
      projectId: status.projectId === null ? null : String(status.projectId),
      projectTitle: null,
      boundAt: null,
      snapshotVersion: null,
      projectUpdatedAt: null,
      dataScope: [],
      currentStage: null,
      entrySurface: null,
      readonlyAssist: true,
      message: status.message,
    }
  }
  return {
    sessionId,
    status: 'bound',
    projectId: String(status.binding.projectId),
    projectTitle: status.snapshot.project.title,
    boundAt: status.binding.boundAt,
    snapshotVersion: status.snapshot.snapshotVersion,
    projectUpdatedAt: status.snapshot.projectUpdatedAt,
    dataScope: status.snapshot.dataScope,
    currentStage: status.snapshot.currentStage,
    entrySurface: status.binding.entrySurface,
    readonlyAssist: true,
    message: null,
  }
}
