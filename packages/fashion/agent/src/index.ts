/**
 * Fashion Agent Host context (`ctx.fashionAgentContext`): Project–Session
 * binding, compact snapshots, pre-step injection, and bound read-only query.
 * @module @gentlexx/dsh-fashion-agent
 */

import { Context, Service } from '@deepseek-ai/cordis'
import type { PreStepDecision } from '@deepseek-ai/dsh-agent'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import type { SessionId } from '@deepseek-ai/dsh-session'
import { SessionId as brandSessionId } from '@deepseek-ai/dsh-session'
import type { KvTable } from '@deepseek-ai/dsh-storage-domain'
import { ProjectId } from '@gentlexx/dsh-fashion-project'
import type { ProjectId as ProjectIdBrand } from '@gentlexx/dsh-fashion-project/types'
import { FashionAgentSnapshotError } from './errors.ts'
import { FASHION_AGENT_READONLY_PROMPT } from './prompt.ts'
import { renderFashionContextUnavailable, renderFashionProjectSnapshot } from './render.ts'
import { sessionHasUserMessages } from './session-messages.ts'
import { fashionAgentBindingDomainSpec } from './spec.ts'
import type { FashionSessionBindingRecordV0 } from './schema/v0.ts'
import { buildFashionProjectSnapshot, selectSnapshotSection } from './snapshot.ts'
import { registerFashionAgentTools } from './tools.ts'
import type {
  FashionAgentContextStatus,
  FashionAgentEntrySurface,
  FashionAgentQuerySection,
  FashionBindResult,
  FashionProjectSnapshot,
  FashionSessionBinding,
} from './types.ts'

export type {
  FashionAgentAnalysisSummary,
  FashionAgentBriefSummary,
  FashionAgentContextStatus,
  FashionAgentDeliverableSummary,
  FashionAgentDirectionSummary,
  FashionAgentEntrySurface,
  FashionAgentEvaluationSummary,
  FashionAgentFeedbackSummary,
  FashionAgentProjectSummary,
  FashionAgentQuerySection,
  FashionAgentResearchSummary,
  FashionAgentReviewSummary,
  FashionAgentScopeId,
  FashionBindResult,
  FashionProjectSnapshot,
  FashionSessionBinding,
} from './types.ts'
export { FASHION_AGENT_SCOPE_IDS } from './types.ts'
export { FASHION_AGENT_READONLY_PROMPT, FASHION_PROJECT_QUERY_DESCRIPTION } from './prompt.ts'
export { FASHION_AGENT_TOOL_NAMES } from './tools.ts'
export { sessionHasUserMessages } from './session-messages.ts'
export { FashionAgentSnapshotError } from './errors.ts'
export { fashionAgentBindingDomainSpec, FASHION_AGENT_BINDING_DOMAIN_VERSION } from './spec.ts'
export { renderFashionProjectSnapshot, renderFashionContextUnavailable } from './render.ts'

/** Cordis plugin / service name used by loader diagnostics and plugin-sourced messages. */
export const name = 'fashion-agent'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Host Fashion Agent binding, snapshot, and bound query. */
    fashionAgentContext: FashionAgentContext
  }
}

/** Bind a session to a project. */
export interface FashionBindRequest {
  readonly sessionId: SessionId
  readonly projectId: ProjectIdBrand
  readonly hasUserMessages: boolean
  readonly confirmUnboundWithMessages?: boolean
  readonly entrySurface?: FashionAgentEntrySurface | null
}

/**
 * Host Fashion Agent context. Bindings live in `fashion_agent_bindings@0`.
 * Snapshots are computed at read time and injected through `agent/pre-step`.
 */
export class FashionAgentContext extends Service {
  static inject = [
    'storageDomain',
    'fashionProjectRegistry',
    'fashionResearchRegistry',
    'fashionAnalysisRegistry',
    'fashionDesignRegistry',
    'fashionFeedbackRegistry',
    'fashionEvaluationRegistry',
    'agents',
  ]

  private table?: KvTable<SessionId, FashionSessionBindingRecordV0>

  /** @param ctx - Host context providing Fashion registries and the agent registry. */
  constructor(ctx: Context) {
    super(ctx, 'fashionAgentContext')
  }

  /** Open the binding domain, then register pre-step, prompt, and tools. */
  protected async [Service.init](): Promise<void> {
    const domain = await this.ctx.storageDomain.open(fashionAgentBindingDomainSpec)
    this.ctx.effect(() => () => domain.close(), 'fashionAgent.domainClose')
    this.table = domain.table('bindings')
    this.registerPreStep()
    if (this.ctx.get('tools') !== undefined) {
      registerFashionAgentTools(this.ctx)
    }
    const systemPrompt = this.ctx.get('systemPrompt')
    if (systemPrompt !== undefined) {
      systemPrompt.section({
        name: 'fashion-agent-readonly',
        order: 168,
        text: FASHION_AGENT_READONLY_PROMPT,
      })
    }
  }

  /**
   * Bind a session to a project under Host authority.
   * @param request - session, project, and message-state flags.
   */
  async bind(request: FashionBindRequest): Promise<FashionBindResult> {
    const sessionId = brandSessionId(String(request.sessionId))
    const projectId = ProjectId(String(request.projectId))
    const existing = this.getBinding(sessionId)
    if (existing !== undefined && existing.projectId !== projectId) {
      return {
        kind: 'conflict-other-project',
        binding: existing,
        requestedProjectId: projectId,
      }
    }
    if (existing === undefined && request.hasUserMessages && request.confirmUnboundWithMessages !== true) {
      return { kind: 'needs-confirm', sessionId, projectId }
    }
    const entrySurface = request.entrySurface !== undefined
      ? request.entrySurface
      : existing === undefined
        ? null
        : existing.entrySurface
    const snapshot = await this.trySnapshot(projectId, entrySurface)
    if (snapshot.kind === 'unavailable') return snapshot
    const boundAt = existing === undefined ? snapshot.snapshot.generatedAt : existing.boundAt
    const binding: FashionSessionBinding = {
      sessionId,
      projectId,
      boundAt,
      entrySurface: request.entrySurface === undefined
        ? (existing === undefined ? null : existing.entrySurface)
        : request.entrySurface,
    }
    await this.requireTable().put(sessionId, {
      projectId: String(projectId),
      boundAt,
      entrySurface: binding.entrySurface,
    })
    return {
      kind: existing === undefined ? 'bound' : 'already-bound',
      binding,
      snapshot: snapshot.snapshot,
    }
  }

  /**
   * Read the durable binding for one session.
   * @param sessionId - session identity (never a project id).
   */
  getBinding(sessionId: SessionId): FashionSessionBinding | undefined {
    const record = this.requireTable().get(brandSessionId(String(sessionId)))
    if (record === undefined) return undefined
    return {
      sessionId: brandSessionId(String(sessionId)),
      projectId: ProjectId(record.projectId),
      boundAt: record.boundAt,
      entrySurface: record.entrySurface,
    }
  }

  /**
   * Resolve live Agent context status for one session.
   * @param sessionId - session identity.
   */
  async statusOf(sessionId: SessionId): Promise<FashionAgentContextStatus> {
    const id = brandSessionId(String(sessionId))
    const binding = this.getBinding(id)
    if (binding === undefined) return { kind: 'unbound', sessionId: id }
    const snapshot = await this.trySnapshot(binding.projectId, binding.entrySurface)
    if (snapshot.kind === 'unavailable') {
      return {
        kind: 'unavailable',
        sessionId: id,
        projectId: snapshot.projectId,
        reason: snapshot.reason === 'snapshot-failed' ? 'snapshot-failed' : snapshot.reason,
        message: snapshot.message,
      }
    }
    return { kind: 'bound', binding, snapshot: snapshot.snapshot }
  }

  /**
   * Query one compact section of the session-bound project.
   * @param sessionId - calling session.
   * @param section - requested section; project id is taken from the binding.
   */
  async queryBoundSection(sessionId: SessionId, section: FashionAgentQuerySection): Promise<{
    ok: boolean
    section: string
    projectId: string
    snapshotVersion: string
    body: unknown
    error: string
  }> {
    const status = await this.statusOf(sessionId)
    if (status.kind === 'unbound') {
      return {
        ok: false,
        section,
        projectId: 'unbound',
        snapshotVersion: 'none',
        body: null,
        error: 'session is not bound to a Fashion project',
      }
    }
    if (status.kind === 'unavailable') {
      return {
        ok: false,
        section,
        projectId: status.projectId === null ? 'unavailable' : String(status.projectId),
        snapshotVersion: 'none',
        body: null,
        error: status.message,
      }
    }
    return {
      ok: true,
      section,
      projectId: String(status.binding.projectId),
      snapshotVersion: status.snapshot.snapshotVersion,
      body: selectSnapshotSection(status.snapshot, section),
      error: 'none',
    }
  }

  /**
   * Inspect a Host session when the sessions service is mounted.
   * @param sessionId - session identity.
   */
  sessionHasUserMessages(sessionId: SessionId): boolean {
    const sessions = this.ctx.get('sessions')
    if (sessions === undefined || typeof sessions.get !== 'function') return false
    const session = sessions.get(brandSessionId(String(sessionId)))
    if (session === undefined) return false
    return sessionHasUserMessages(session)
  }

  /**
   * Load the latest snapshot or map generation failure to an unavailable result.
   * @param projectId - bound project.
   * @param entrySurface - last recorded entry page.
   */
  private async trySnapshot(
    projectId: ProjectIdBrand,
    entrySurface: FashionAgentEntrySurface | null,
  ): Promise<
    | { kind: 'ok'; snapshot: FashionProjectSnapshot }
    | {
      kind: 'unavailable'
      projectId: ProjectIdBrand
      reason: 'not-found' | 'inaccessible' | 'snapshot-failed'
      message: string
    }
  > {
    try {
      const snapshot = await buildFashionProjectSnapshot(
        {
          projects: this.ctx.fashionProjectRegistry,
          research: this.ctx.fashionResearchRegistry,
          analysis: this.ctx.fashionAnalysisRegistry,
          design: this.ctx.fashionDesignRegistry,
          feedback: this.ctx.fashionFeedbackRegistry,
          evaluation: this.ctx.fashionEvaluationRegistry,
        },
        projectId,
        entrySurface,
        new Date().toISOString(),
      )
      return { kind: 'ok', snapshot }
    } catch (error) {
      if (error instanceof FashionAgentSnapshotError) {
        const reason = error.reason === 'broken-reference' ? 'snapshot-failed' : error.reason
        return {
          kind: 'unavailable',
          projectId,
          reason,
          message: error.message,
        }
      }
      const message = error instanceof Error ? error.message : 'snapshot generation failed'
      return {
        kind: 'unavailable',
        projectId,
        reason: 'snapshot-failed',
        message,
      }
    }
  }

  /** Register the per-turn compact snapshot (or unavailability notice). */
  private registerPreStep(): void {
    this.ctx.on('agent/pre-step', async (
      { agent, step, signal },
      next,
    ): Promise<PreStepDecision> => {
      const decision = await next()
      if (decision.kind === 'reject' || signal.aborted) return decision
      if (step !== 1) return decision
      const status = await this.statusOf(agent.session.id)
      if (status.kind === 'unbound') return decision
      const text = status.kind === 'bound'
        ? renderFashionProjectSnapshot(status.snapshot)
        : renderFashionContextUnavailable(status.reason)
      return {
        ...decision,
        messages: [
          ...decision.messages,
          createUserMessage({
            content: [{ type: 'text', text }],
            source: {
              kind: 'plugin',
              plugin: name,
              form: 'snapshot',
              sections: [{ name, text }],
            },
          }),
        ],
      }
    }, { prepend: true })
  }

  private requireTable(): KvTable<SessionId, FashionSessionBindingRecordV0> {
    if (this.table === undefined) {
      throw new Error('fashionAgentContext is not initialized')
    }
    return this.table
  }
}

export default FashionAgentContext
