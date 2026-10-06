/**
 * Fashion Agent Host controller bind / status projection.
 */

import { afterEach, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import AgentRegistry from '@deepseek-ai/dsh-agent'
import { SessionId } from '@deepseek-ai/dsh-session'
import Storage from '@deepseek-ai/dsh-storage'
import { DomainFacility } from '@deepseek-ai/dsh-storage-domain'
import FashionProjectRegistry, { R0_PROJECT_ID, R0_SEED_RECORD } from '@gentlexx/dsh-fashion-project'
import FashionResearchRegistry from '@gentlexx/dsh-fashion-research'
import FashionAnalysisRegistry from '@gentlexx/dsh-fashion-analysis'
import FashionDesignRegistry from '@gentlexx/dsh-fashion-design'
import FashionFeedbackRegistry from '@gentlexx/dsh-fashion-feedback'
import FashionEvaluationRegistry from '@gentlexx/dsh-fashion-evaluation'
import FashionAgentContext from '@gentlexx/dsh-fashion-agent'
import { MemoryStorageBackend } from '../../../storage/storage-domain/tests/helpers/memory-backend.ts'
import FashionAgentController from '../src/index.ts'

const roots: Context[] = []

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
  const dispose = (): void => {}
  ctx.provide('typert', {
    lookups: { configure: () => dispose },
    contexts: { configureHost: () => dispose },
  } as never)
  const controller = new FashionAgentController(ctx)
  return { controller }
}

describe('FashionAgentController', () => {
  it('binds R0 and returns the formal title plus data scope', async () => {
    const { controller } = await harness()
    const value = await controller.bindSession({
      sessionId: SessionId('ui-session'),
      projectId: R0_PROJECT_ID,
    })
    expect(value.result.kind).toBe('bound')
    expect(value.status.status).toBe('bound')
    expect(value.status.projectTitle).toBe(R0_SEED_RECORD.title)
    expect(value.status.dataScope).toEqual(expect.arrayContaining(['project', 'research', 'brief']))
    expect(value.status.readonlyAssist).toBe(true)
  })

  it('reports unbound status for an unknown session', async () => {
    const { controller } = await harness()
    const status = await controller.getStatus({ sessionId: SessionId('none') })
    expect(status.status).toBe('unbound')
    expect(status.projectTitle).toBeNull()
  })
})
