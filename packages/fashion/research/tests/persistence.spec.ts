/**
 * Fashion Research registry survives dispose + reopen against a shared JSON medium.
 */

import { afterEach, describe, expect, it } from 'vitest'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import Storage from '@deepseek-ai/dsh-storage'
import { DomainFacility } from '@deepseek-ai/dsh-storage-domain'
import { JsonStorageBackend } from '@deepseek-ai/dsh-storage-json'
import FashionProjectRegistry, { R0_PROJECT_ID } from '@gentlexx/dsh-fashion-project'
import FashionResearchRegistry, { R0_TASK_ID } from '../src/index.ts'

const roots: string[] = []

afterEach(async () => {
  await Promise.all(roots.splice(0).map(async (root) => {
    await rm(root, { recursive: true, force: true })
  }))
})

async function boot(root: string) {
  const ctx = new Context()
  await ctx.plugin(Storage)
  const backend = new JsonStorageBackend(root)
  ctx.storage.backend.register('json', backend)
  const facility = new DomainFacility(ctx, { backend: 'json', routes: {} })
  ctx.storage.mount('domain', facility)
  ctx.provide('storageDomain', facility)
  await ctx.plugin(FashionProjectRegistry)
  const fiber = await ctx.plugin(FashionResearchRegistry)
  return {
    ctx,
    fiber,
    projects: ctx.fashionProjectRegistry,
    research: ctx.fashionResearchRegistry,
  }
}

describe('FashionResearchRegistry persistence', () => {
  it('keeps user research chain and R0 across dispose and reopen', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dsh-fashion-research-'))
    roots.push(root)

    const first = await boot(root)
    const project = await first.projects.create({ title: 'Persisted Research' })
    const task = await first.research.createTask({ projectId: project.id, title: 'Persisted task' })
    const source = await first.research.createSource({
      projectId: project.id,
      taskId: task.id,
      locatorType: 'url',
      url: 'https://example.com/persist',
      title: 'Persisted source',
      sourceKind: 'web_page',
      captureMode: 'manual_link',
      usageBoundary: 'view_only',
      externalProcessing: 'denied',
      attribution: 'manual',
    })
    const firstR0 = first.research.getTask(R0_TASK_ID)
    expect(firstR0?.projectId).toBe(R0_PROJECT_ID)
    expect(first.research.listSources(R0_PROJECT_ID, R0_TASK_ID)).toHaveLength(12)
    await first.fiber.dispose()

    const second = await boot(root)
    expect(second.research.getTask(task.id)).toEqual(task)
    expect(second.research.getSource(source.id)).toEqual(source)
    expect(second.research.getTask(R0_TASK_ID)).toEqual(firstR0)
    expect(second.research.listSources(R0_PROJECT_ID, R0_TASK_ID)).toHaveLength(12)
    await second.fiber.dispose()
  })
})
