/**
 * Fashion Agent binding, snapshot, isolation, and pre-step injection.
 */

import { afterEach, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import AgentRegistry, { agentEvents, type Agent } from '@deepseek-ai/dsh-agent'
import { ToolCallId, createUserMessage } from '@deepseek-ai/dsh-llm'
import { Session, SessionId } from '@deepseek-ai/dsh-session'
import Storage from '@deepseek-ai/dsh-storage'
import { DomainFacility } from '@deepseek-ai/dsh-storage-domain'
import FashionProjectRegistry, { ProjectId, R0_PROJECT_ID, R0_SEED_RECORD } from '@gentlexx/dsh-fashion-project'
import FashionResearchRegistry from '@gentlexx/dsh-fashion-research'
import FashionAnalysisRegistry from '@gentlexx/dsh-fashion-analysis'
import FashionDesignRegistry from '@gentlexx/dsh-fashion-design'
import FashionFeedbackRegistry from '@gentlexx/dsh-fashion-feedback'
import FashionEvaluationRegistry from '@gentlexx/dsh-fashion-evaluation'
import { unsupportedInbox } from '@deepseek-ai/dsh-agent-loop-testkit'
import { MemoryStorageBackend } from '../../../storage/storage-domain/tests/helpers/memory-backend.ts'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import FashionAgentContext, {
  FASHION_AGENT_TOOL_NAMES,
  name as fashionAgentPlugin,
} from '../src/index.ts'

const roots: Context[] = []
const SIGNAL = new AbortController().signal

afterEach(async () => {
  await Promise.all(roots.splice(0).map(ctx => ctx.fiber.dispose()))
})

async function harness() {
  const ctx = new Context()
  roots.push(ctx)
  await ctx.plugin(Storage)
  ctx.storage.backend.register('memory', new MemoryStorageBackend())
  const storageDomain = new DomainFacility(ctx, { backend: 'memory', routes: {} })
  ctx.storage.mount('domain', storageDomain)
  ctx.provide('storageDomain', storageDomain)
  await ctx.plugin(FashionProjectRegistry)
  await ctx.plugin(FashionResearchRegistry)
  await ctx.plugin(FashionAnalysisRegistry)
  await ctx.plugin(FashionDesignRegistry)
  await ctx.plugin(FashionFeedbackRegistry)
  await ctx.plugin(FashionEvaluationRegistry)
  await ctx.plugin(AgentRegistry)
  await ctx.plugin(FashionAgentContext)
  return { ctx, agent: ctx.fashionAgentContext }
}

function sessionAgent(session: Session, id = 'agent-a'): Agent {
  return {
    id: SessionId(id),
    options: {},
    session,
    inbox: unsupportedInbox(),
    status: 'running',
    ctx: new Context(),
    send: () => {},
    followup: () => {},
    steer: () => {},
    inject: () => {
      throw new Error('fashion-agent tests append through pre-step')
    },
    cancel() {},
    runMaintenance: task => task(new AbortController().signal),
    whenIdle: () => Promise.resolve(),
  }
}

async function firePreStep(ctx: Context, agent: Agent, step = 1): Promise<string[]> {
  const proposed = createUserMessage({
    content: [{ type: 'text', text: 'user turn' }],
    source: { kind: 'user' },
  })
  const decision = await agentEvents(ctx, agent).waterfall(
    'agent/pre-step',
    { messages: [proposed], turn: 1, step, signal: SIGNAL },
    () => Promise.resolve({ kind: 'enter' as const, messages: [proposed] }),
  )
  if (decision.kind !== 'enter') return []
  return decision.messages
    .filter(message => message !== proposed)
    .flatMap(message => message.content)
    .filter(block => block.type === 'text')
    .map(block => block.text)
}

describe('FashionAgentContext binding', () => {
  it('binds a blank session to a project and keeps the formal title', async () => {
    const { agent } = await harness()
    const sessionId = SessionId('session-r0')
    const result = await agent.bind({
      sessionId,
      projectId: R0_PROJECT_ID,
      hasUserMessages: false,
    })
    expect(result.kind).toBe('bound')
    if (result.kind !== 'bound') return
    expect(result.binding.projectId).toBe(R0_PROJECT_ID)
    expect(result.snapshot.project.title).toBe(R0_SEED_RECORD.title)
    expect(result.snapshot.project.title).not.toBe('session-r0')
    expect(result.snapshot.dataScope).toEqual(expect.arrayContaining([
      'project',
      'research',
      'analysis',
      'brief',
      'directions',
      'review',
      'deliverable',
    ]))
  })

  it('records current stage and the approved R0 direction', async () => {
    const { agent } = await harness()
    const result = await agent.bind({
      sessionId: SessionId('session-stage'),
      projectId: R0_PROJECT_ID,
      hasUserMessages: false,
    })
    expect(result.kind).toBe('bound')
    if (result.kind !== 'bound') return
    expect(result.snapshot.currentStage).toBeTruthy()
    expect(result.snapshot.directions).toHaveLength(3)
    expect(result.snapshot.review?.approvedConceptId).toBe('r0-concept-cropped-structured-utility')
    expect(result.snapshot.brief?.category.length).toBeGreaterThan(0)
  })

  it('refuses a silent switch onto another project', async () => {
    const { ctx, agent } = await harness()
    const sessionId = SessionId('session-conflict')
    const created = await ctx.fashionProjectRegistry.create({ title: 'Other Jacket' })
    await agent.bind({ sessionId, projectId: R0_PROJECT_ID, hasUserMessages: false })
    const second = await agent.bind({
      sessionId,
      projectId: created.id,
      hasUserMessages: false,
    })
    expect(second.kind).toBe('conflict-other-project')
    if (second.kind !== 'conflict-other-project') return
    expect(second.binding.projectId).toBe(R0_PROJECT_ID)
    expect(second.requestedProjectId).toBe(created.id)
  })

  it('requires confirm when an unbound session already has messages', async () => {
    const { agent } = await harness()
    const sessionId = SessionId('session-confirm')
    const blocked = await agent.bind({
      sessionId,
      projectId: R0_PROJECT_ID,
      hasUserMessages: true,
    })
    expect(blocked.kind).toBe('needs-confirm')
    const confirmed = await agent.bind({
      sessionId,
      projectId: R0_PROJECT_ID,
      hasUserMessages: true,
      confirmUnboundWithMessages: true,
    })
    expect(confirmed.kind).toBe('bound')
  })

  it('continues a session already bound to the same project', async () => {
    const { agent } = await harness()
    const sessionId = SessionId('session-continue')
    await agent.bind({ sessionId, projectId: R0_PROJECT_ID, hasUserMessages: false })
    const again = await agent.bind({
      sessionId,
      projectId: R0_PROJECT_ID,
      hasUserMessages: false,
    })
    expect(again.kind).toBe('already-bound')
  })
})

describe('FashionAgentContext snapshot and query isolation', () => {
  it('stops injection when the project is missing', async () => {
    const { agent } = await harness()
    const missing = ProjectId('missing-project')
    const result = await agent.bind({
      sessionId: SessionId('session-missing'),
      projectId: missing,
      hasUserMessages: false,
    })
    expect(result.kind).toBe('unavailable')
    expect(agent.getBinding(SessionId('session-missing'))).toBeUndefined()
  })

  it('changes snapshotVersion after the project gains research', async () => {
    const { ctx, agent } = await harness()
    const project = await ctx.fashionProjectRegistry.create({ title: 'Versioned Parka' })
    const sessionId = SessionId('session-version')
    const first = await agent.bind({ sessionId, projectId: project.id, hasUserMessages: false })
    expect(first.kind).toBe('bound')
    if (first.kind !== 'bound') return
    await ctx.fashionResearchRegistry.createTask({
      projectId: project.id,
      title: 'Parka research',
    })
    const second = await agent.statusOf(sessionId)
    expect(second.kind).toBe('bound')
    if (second.kind !== 'bound') return
    expect(second.snapshot.snapshotVersion).not.toBe(first.snapshot.snapshotVersion)
    expect(second.snapshot.research[0]?.title).toBe('Parka research')
  })

  it('keeps project A query results off a session bound to project B', async () => {
    const { ctx, agent } = await harness()
    const other = await ctx.fashionProjectRegistry.create({ title: 'Project B Parka' })
    const sessionA = SessionId('session-a')
    const sessionB = SessionId('session-b')
    await agent.bind({ sessionId: sessionA, projectId: R0_PROJECT_ID, hasUserMessages: false })
    await agent.bind({ sessionId: sessionB, projectId: other.id, hasUserMessages: false })
    const queryA = await agent.queryBoundSection(sessionA, 'project')
    const queryB = await agent.queryBoundSection(sessionB, 'project')
    expect(queryA.ok).toBe(true)
    expect(queryB.ok).toBe(true)
    expect(queryA.projectId).toBe(String(R0_PROJECT_ID))
    expect(queryB.projectId).toBe(String(other.id))
    expect(JSON.stringify(queryA.body)).toContain(R0_SEED_RECORD.title)
    expect(JSON.stringify(queryB.body)).toContain('Project B Parka')
    expect(JSON.stringify(queryA.body)).not.toContain('Project B Parka')
  })

  it('refuses query when the session is unbound', async () => {
    const { agent } = await harness()
    const query = await agent.queryBoundSection(SessionId('session-unbound'), 'research')
    expect(query.ok).toBe(false)
    expect(query.projectId).toBe('unbound')
  })

  it('exposes only the read-only Fashion tool name', () => {
    expect(FASHION_AGENT_TOOL_NAMES).toEqual(['fashion_project_query'])
  })

  it('registers fashion_project_query without a model-supplied projectId and no write tools', async () => {
    const ctx = new Context()
    roots.push(ctx)
    await ctx.plugin(Storage)
    ctx.storage.backend.register('memory', new MemoryStorageBackend())
    const storageDomain = new DomainFacility(ctx, { backend: 'memory', routes: {} })
    ctx.storage.mount('domain', storageDomain)
    ctx.provide('storageDomain', storageDomain)
    await ctx.plugin(FashionProjectRegistry)
    await ctx.plugin(FashionResearchRegistry)
    await ctx.plugin(FashionAnalysisRegistry)
    await ctx.plugin(FashionDesignRegistry)
    await ctx.plugin(FashionFeedbackRegistry)
    await ctx.plugin(FashionEvaluationRegistry)
    await ctx.plugin(AgentRegistry)
    await ctx.plugin(SystemPrompt)
    await ctx.plugin(ToolRuntime)
    await ctx.plugin(FashionAgentContext)
    const query = ctx.tools.get('fashion_project_query')
    expect(query).toBeDefined()
    expect(JSON.stringify(query?.parameters)).not.toContain('projectId')
    expect(ctx.tools.get('fashion_project_create')).toBeUndefined()
    expect(ctx.tools.get('fashion_brief_update')).toBeUndefined()
    expect(ctx.tools.get('fashion_review_approve')).toBeUndefined()
    expect(ctx.tools.get('fashion_deliverable_generate')).toBeUndefined()
    expect(ctx.tools.get('fashion_feedback_record')).toBeUndefined()
  })
})

async function toolHarness() {
  const ctx = new Context()
  roots.push(ctx)
  await ctx.plugin(Storage)
  ctx.storage.backend.register('memory', new MemoryStorageBackend())
  const storageDomain = new DomainFacility(ctx, { backend: 'memory', routes: {} })
  ctx.storage.mount('domain', storageDomain)
  ctx.provide('storageDomain', storageDomain)
  await ctx.plugin(FashionProjectRegistry)
  await ctx.plugin(FashionResearchRegistry)
  await ctx.plugin(FashionAnalysisRegistry)
  await ctx.plugin(FashionDesignRegistry)
  await ctx.plugin(FashionFeedbackRegistry)
  await ctx.plugin(FashionEvaluationRegistry)
  await ctx.plugin(AgentRegistry)
  await ctx.plugin(SystemPrompt)
  await ctx.plugin(ToolRuntime)
  await ctx.plugin(FashionAgentContext)
  return ctx
}

async function runQuery(ctx: Context, agent: Agent, section: string): Promise<{ text: string; isError: boolean }> {
  const result = await ctx.tools.execute({
    signal: SIGNAL,
    callId: ToolCallId('fashion-query'),
    name: 'fashion_project_query',
    arguments: { section },
    agent,
  })
  const text = result.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('\n')
  return { text, isError: result.isError === true }
}

const IMPROVEMENT_SUMMARIES = [
  'Improvement one: tighten cropped hem proportion evidence.',
  'Improvement two: cite the khaki availability sample.',
  'Improvement three: restate the pocket constraint.',
  'Improvement four: refresh the deliverable snapshot hash.',
]

async function seedImprovements(ctx: Context, projectId: ProjectId): Promise<void> {
  const items = (ctx.fashionEvaluationRegistry as unknown as { requireItems: () => {
    put: (id: string, record: Record<string, unknown>) => Promise<void>
  } }).requireItems()
  for (const [index, summary] of IMPROVEMENT_SUMMARIES.entries()) {
    await items.put(`improvement-${index}`, {
      projectId: String(projectId),
      schemaVersion: 0,
      origin: 'system_evaluation',
      dataReality: 'user_test',
      visibility: 'project_private',
      createdBy: 'local-human',
      createdAt: '2026-10-04T00:00:00.000Z',
      contentVersion: 0,
      archivedAt: null,
      sourceRunRefs: ['run-seed'],
      sourceRuleResultRefs: [`rule-result-${index}`],
      targetRefs: [],
      failureType: 'seeded-rule',
      summary,
      impact: 'minor',
      suggestedPriority: 'low',
      suggestedOwnerRole: 'local_planner',
      dedupeKey: `seed|${index}`,
    })
  }
}

describe('fashion_project_query model-facing result', () => {
  it('renders the bound section body, section, projectId, and snapshotVersion on success', async () => {
    const ctx = await toolHarness()
    const live = sessionAgent(Session.create(SessionId('query-success')), 'query-success')
    const bound = await ctx.fashionAgentContext.bind({
      sessionId: live.session.id,
      projectId: R0_PROJECT_ID,
      hasUserMessages: false,
    })
    expect(bound.kind).toBe('bound')
    if (bound.kind !== 'bound') return
    const { text, isError } = await runQuery(ctx, live, 'brief')
    expect(isError).toBe(false)
    expect(text).toContain('section=brief')
    expect(text).toContain(`projectId=${String(R0_PROJECT_ID)}`)
    expect(text).toContain(`snapshotVersion=${bound.snapshot.snapshotVersion}`)
    expect(text).toContain(`body=${JSON.stringify(bound.snapshot.brief)}`)
    expect(bound.snapshot.brief).not.toBeNull()
  })

  it('renders a non-empty improvement array verbatim instead of an empty section', async () => {
    const ctx = await toolHarness()
    const project = await ctx.fashionProjectRegistry.create({ title: 'Improvement Parka' })
    await seedImprovements(ctx, project.id)
    const live = sessionAgent(Session.create(SessionId('query-improvement')), 'query-improvement')
    await ctx.fashionAgentContext.bind({ sessionId: live.session.id, projectId: project.id, hasUserMessages: false })
    const { text, isError } = await runQuery(ctx, live, 'improvement')
    expect(isError).toBe(false)
    expect(text).toContain('section=improvement')
    for (const summary of IMPROVEMENT_SUMMARIES) expect(text).toContain(summary)
    expect(text).not.toContain('body=[]')
    expect(text).not.toContain('no data for this section')
  })

  it('marks a null section explicitly as having no data', async () => {
    const ctx = await toolHarness()
    const project = await ctx.fashionProjectRegistry.create({ title: 'Empty Parka' })
    const live = sessionAgent(Session.create(SessionId('query-null')), 'query-null')
    await ctx.fashionAgentContext.bind({ sessionId: live.session.id, projectId: project.id, hasUserMessages: false })
    const { text } = await runQuery(ctx, live, 'improvement')
    expect(text).toContain('The bound project has no data for this section.')
    expect(text).toContain('body=null')
  })

  it('renders failures with the error and no project body', async () => {
    const ctx = await toolHarness()
    const unbound = sessionAgent(Session.create(SessionId('query-unbound')), 'query-unbound')
    const unboundResult = await runQuery(ctx, unbound, 'project')
    expect(unboundResult.text).toContain('Fashion project query failed (read-only).')
    expect(unboundResult.text).toContain('error=session is not bound to a Fashion project')
    expect(unboundResult.text).not.toContain('body=')
    expect(unboundResult.text).not.toContain(R0_SEED_RECORD.title)

    const dangling = sessionAgent(Session.create(SessionId('query-dangling')), 'query-dangling')
    await ctx.fashionAgentContext.bind({ sessionId: dangling.session.id, projectId: R0_PROJECT_ID, hasUserMessages: false })
    const table = (ctx.fashionAgentContext as unknown as { requireTable: () => {
      put: (id: SessionId, record: { projectId: string; boundAt: string; entrySurface: null }) => Promise<void>
    } }).requireTable()
    await table.put(dangling.session.id, {
      projectId: 'deleted-project',
      boundAt: '2026-10-04T00:00:00.000Z',
      entrySurface: null,
    })
    const danglingResult = await runQuery(ctx, dangling, 'project')
    expect(danglingResult.text).toContain('Fashion project query failed (read-only).')
    expect(danglingResult.text).not.toContain('body=')
    expect(danglingResult.text).not.toContain(R0_SEED_RECORD.title)
  })

  it('takes projectId from the session binding, so a project B session never renders project A', async () => {
    const ctx = await toolHarness()
    const other = await ctx.fashionProjectRegistry.create({ title: 'Project B Parka' })
    const sessionA = sessionAgent(Session.create(SessionId('query-a')), 'query-a')
    const sessionB = sessionAgent(Session.create(SessionId('query-b')), 'query-b')
    await ctx.fashionAgentContext.bind({ sessionId: sessionA.session.id, projectId: R0_PROJECT_ID, hasUserMessages: false })
    await ctx.fashionAgentContext.bind({ sessionId: sessionB.session.id, projectId: other.id, hasUserMessages: false })
    const a = await runQuery(ctx, sessionA, 'project')
    const b = await runQuery(ctx, sessionB, 'project')
    expect(a.text).toContain(`projectId=${String(R0_PROJECT_ID)}`)
    expect(a.text).toContain(R0_SEED_RECORD.title)
    expect(b.text).toContain(`projectId=${String(other.id)}`)
    expect(b.text).toContain('Project B Parka')
    expect(b.text).not.toContain(R0_SEED_RECORD.title)
    expect(a.text).not.toContain('Project B Parka')
  })
})

describe('FashionAgentContext pre-step injection', () => {
  it('injects the formal project title and no folder-name guess', async () => {
    const { ctx, agent } = await harness()
    const session = Session.create(SessionId('workspace-folder-guess'))
    const live = sessionAgent(session, 'workspace-folder-guess')
    await agent.bind({
      sessionId: live.session.id,
      projectId: R0_PROJECT_ID,
      hasUserMessages: false,
    })
    const texts = await firePreStep(ctx, live)
    expect(texts.join('\n')).toContain(R0_SEED_RECORD.title)
    expect(texts.join('\n')).toContain(`projectId=${String(R0_PROJECT_ID)}`)
    expect(texts.join('\n')).not.toContain('workspace-folder-guess')
    expect(texts.join('\n')).toContain('dataScope=')
  })

  it('injects nothing when the session is unbound', async () => {
    const { ctx } = await harness()
    const session = Session.create(SessionId('generic-session'))
    const texts = await firePreStep(ctx, sessionAgent(session, 'generic-session'))
    expect(texts).toEqual([])
  })

  it('injects an unavailability notice after a dangling binding', async () => {
    const { ctx, agent } = await harness()
    const session = Session.create(SessionId('dangling'))
    const live = sessionAgent(session, 'dangling')
    await agent.bind({
      sessionId: live.session.id,
      projectId: R0_PROJECT_ID,
      hasUserMessages: false,
    })
    const table = (agent as unknown as { requireTable: () => {
      put: (id: SessionId, record: {
        projectId: string
        boundAt: string
        entrySurface: null
      }) => Promise<void>
    } }).requireTable()
    await table.put(live.session.id, {
      projectId: 'deleted-project',
      boundAt: '2026-10-04T00:00:00.000Z',
      entrySurface: null,
    })
    const texts = await firePreStep(ctx, live)
    expect(texts.join('\n')).toContain('Fashion project context is unavailable')
    expect(texts.join('\n')).not.toContain(R0_SEED_RECORD.title)
  })

  it('does not inject on later steps of the same turn', async () => {
    const { ctx, agent } = await harness()
    const session = Session.create(SessionId('step-two'))
    const live = sessionAgent(session, 'step-two')
    await agent.bind({
      sessionId: live.session.id,
      projectId: R0_PROJECT_ID,
      hasUserMessages: false,
    })
    const texts = await firePreStep(ctx, live, 2)
    expect(texts).toEqual([])
  })
})

describe('Fashion Agent plugin identity', () => {
  it('keeps the plugin name fashion-agent for logged injections', () => {
    expect(fashionAgentPlugin).toBe('fashion-agent')
  })
})
