/**
 * Fashion Agent bindings survive dispose + reopen against a shared JSON medium.
 */

import { afterEach, describe, expect, it } from 'vitest'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import AgentRegistry from '@deepseek-ai/dsh-agent'
import { SessionId } from '@deepseek-ai/dsh-session'
import Storage from '@deepseek-ai/dsh-storage'
import { DomainFacility } from '@deepseek-ai/dsh-storage-domain'
import { JsonStorageBackend } from '@deepseek-ai/dsh-storage-json'
import FashionProjectRegistry, { R0_PROJECT_ID } from '@gentlexx/dsh-fashion-project'
import FashionResearchRegistry from '@gentlexx/dsh-fashion-research'
import FashionAnalysisRegistry from '@gentlexx/dsh-fashion-analysis'
import FashionDesignRegistry from '@gentlexx/dsh-fashion-design'
import FashionFeedbackRegistry from '@gentlexx/dsh-fashion-feedback'
import FashionEvaluationRegistry from '@gentlexx/dsh-fashion-evaluation'
import FashionAgentContext from '../src/index.ts'

const roots: string[] = []

afterEach(async () => {
  await Promise.all(roots.splice(0).map(async (root) => {
    await rm(root, { recursive: true, force: true })
  }))
})

async function boot(root: string) {
  const ctx = new Context()
  await ctx.plugin(Storage)
  ctx.storage.backend.register('json', new JsonStorageBackend(root))
  const facility = new DomainFacility(ctx, { backend: 'json', routes: {} })
  ctx.storage.mount('domain', facility)
  ctx.provide('storageDomain', facility)
  await ctx.plugin(FashionProjectRegistry)
  await ctx.plugin(FashionResearchRegistry)
  await ctx.plugin(FashionAnalysisRegistry)
  await ctx.plugin(FashionDesignRegistry)
  await ctx.plugin(FashionFeedbackRegistry)
  await ctx.plugin(FashionEvaluationRegistry)
  await ctx.plugin(AgentRegistry)
  const fiber = await ctx.plugin(FashionAgentContext)
  return { ctx, fiber, agent: ctx.fashionAgentContext }
}

describe('FashionAgentContext persistence', () => {
  it('restores a Project–Session binding after reopen', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dsh-fashion-agent-'))
    roots.push(root)
    const sessionId = SessionId('persisted-session')
    const first = await boot(root)
    const bound = await first.agent.bind({
      sessionId,
      projectId: R0_PROJECT_ID,
      hasUserMessages: false,
    })
    expect(bound.kind).toBe('bound')
    await first.fiber.dispose()

    const second = await boot(root)
    const restored = second.agent.getBinding(sessionId)
    expect(restored?.projectId).toBe(R0_PROJECT_ID)
    const status = await second.agent.statusOf(sessionId)
    expect(status.kind).toBe('bound')
    if (status.kind !== 'bound') return
    expect(status.snapshot.project.title).toBe('美国女装卡其 Utility Jacket')
  })
})
