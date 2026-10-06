/**
 * Fashion Research Host controller projection tests.
 */

import { afterEach, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Storage from '@deepseek-ai/dsh-storage'
import { DomainFacility } from '@deepseek-ai/dsh-storage-domain'
import FashionProjectRegistry, { R0_PROJECT_ID } from '@gentlexx/dsh-fashion-project'
import FashionResearchRegistry, { R0_TASK_ID, SourceId } from '@gentlexx/dsh-fashion-research'
import { RemoteError } from '@deepseek-ai/dsh-typert-protocol'
import { MemoryStorageBackend } from '../../../storage/storage-domain/tests/helpers/memory-backend.ts'
import FashionResearchController from '../src/index.ts'

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
  const dispose = (): void => {}
  ctx.provide('typert', {
    lookups: { configure: () => dispose },
    contexts: { configureHost: () => dispose },
  } as never)
  const controller = new FashionResearchController(ctx)
  return { controller, ctx }
}

describe('FashionResearchController', () => {
  it('lists R0 research and projects user create/get/review over Remote', async () => {
    const { controller, ctx } = await harness()
    const r0Tasks = controller.listTasks({ projectId: R0_PROJECT_ID })
    expect(r0Tasks.items.some(item => item.id === R0_TASK_ID)).toBe(true)
    expect(controller.listSources({ projectId: R0_PROJECT_ID, taskId: R0_TASK_ID }).items).toHaveLength(12)

    const project = await ctx.fashionProjectRegistry.create({ title: 'Remote user project' })
    const created = await controller.createTask({ projectId: project.id, title: '  Scan  ' })
    expect(created.task.title).toBe('Scan')

    const source = await controller.createSource({
      projectId: project.id,
      taskId: created.task.id,
      locatorType: 'url',
      url: 'https://Example.com/item',
      title: 'Item',
      sourceKind: 'product_page',
      captureMode: 'manual_link',
      usageBoundary: 'view_only',
      externalProcessing: 'denied',
      attribution: 'manual',
    })
    expect(source.source.urlNormalized).toBe('https://example.com/item')

    const sample = await controller.createSample({
      projectId: project.id,
      taskId: created.task.id,
      sourceId: source.source.id,
      label: 'A',
    })
    const evidence = await controller.createEvidence({
      projectId: project.id,
      taskId: created.task.id,
      subjectType: 'sample',
      subjectId: sample.sample.id,
      observation: 'price visible',
      claim: 'full price now',
      claimType: 'observed',
      evidenceGrade: 'G1',
    })
    const reviewed = await controller.reviewEvidence({
      projectId: project.id,
      taskId: created.task.id,
      evidenceId: evidence.evidence.id,
      expectedRevision: evidence.evidence.revision,
      reviewStatus: 'confirmed',
      reviewNote: 'ok',
    })
    expect(reviewed.evidence.reviewStatus).toBe('confirmed')
    expect(controller.getTask({
      projectId: project.id,
      taskId: created.task.id,
    }).task).toEqual(created.task)
  })

  it('maps domain errors to RemoteError codes and refuses R0 writes', async () => {
    const { controller } = await harness()
    await expect(controller.createTask({
      projectId: R0_PROJECT_ID,
      title: 'nope',
    })).rejects.toMatchObject({ code: 'fashion-research/project-read-only' })

    expect(() => controller.getTask({
      projectId: R0_PROJECT_ID,
      taskId: R0_TASK_ID,
    })).not.toThrow()
    try {
      controller.getSource({
        projectId: R0_PROJECT_ID,
        taskId: R0_TASK_ID,
        sourceId: SourceId('missing'),
      })
    } catch (error) {
      expect(error).toBeInstanceOf(RemoteError)
      expect((error as RemoteError<'fashion-research/source-not-found'>).code)
        .toBe('fashion-research/source-not-found')
    }
  })

  it('rejects get/update/archive/review when parent chain does not match', async () => {
    const { controller, ctx } = await harness()
    const projectA = await ctx.fashionProjectRegistry.create({ title: 'A' })
    const projectB = await ctx.fashionProjectRegistry.create({ title: 'B' })
    const taskA = await controller.createTask({ projectId: projectA.id, title: 'Task A' })
    const taskB = await controller.createTask({ projectId: projectB.id, title: 'Task B' })
    const sourceA = await controller.createSource({
      projectId: projectA.id,
      taskId: taskA.task.id,
      locatorType: 'url',
      url: 'https://example.com/a',
      title: 'A',
      sourceKind: 'product_page',
      captureMode: 'manual_link',
      usageBoundary: 'view_only',
      externalProcessing: 'denied',
      attribution: 'manual',
    })
    const sampleA = await controller.createSample({
      projectId: projectA.id,
      taskId: taskA.task.id,
      sourceId: sourceA.source.id,
      label: 's',
    })
    const evidenceA = await controller.createEvidence({
      projectId: projectA.id,
      taskId: taskA.task.id,
      subjectType: 'sample',
      subjectId: sampleA.sample.id,
      observation: 'seen',
      evidenceGrade: 'G1',
    })

    expect(() => controller.getTask({
      projectId: projectB.id,
      taskId: taskA.task.id,
    })).toThrow(RemoteError)

    expect(() => controller.getSource({
      projectId: projectB.id,
      taskId: taskA.task.id,
      sourceId: sourceA.source.id,
    })).toThrow(RemoteError)

    expect(() => controller.getSource({
      projectId: projectA.id,
      taskId: taskB.task.id,
      sourceId: sourceA.source.id,
    })).toThrow(RemoteError)

    await expect(controller.updateTask({
      projectId: projectB.id,
      taskId: taskA.task.id,
      expectedRevision: taskA.task.revision,
      title: 'hijack',
    })).rejects.toMatchObject({ code: 'fashion-research/cross-project-reference' })

    await expect(controller.archiveSource({
      projectId: projectB.id,
      taskId: taskA.task.id,
      sourceId: sourceA.source.id,
      expectedRevision: sourceA.source.revision,
    })).rejects.toMatchObject({ code: 'fashion-research/cross-project-reference' })

    await expect(controller.reviewEvidence({
      projectId: projectB.id,
      taskId: taskA.task.id,
      evidenceId: evidenceA.evidence.id,
      expectedRevision: evidenceA.evidence.revision,
      reviewStatus: 'confirmed',
      reviewNote: 'nope',
    })).rejects.toMatchObject({ code: 'fashion-research/cross-project-reference' })
  })
})
