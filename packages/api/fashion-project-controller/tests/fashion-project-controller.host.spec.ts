/**
 * Fashion Project Host controller projection tests.
 */

import { afterEach, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Storage from '@deepseek-ai/dsh-storage'
import { DomainFacility } from '@deepseek-ai/dsh-storage-domain'
import FashionProjectRegistry, {
  ProjectId,
  R0_PROJECT_ID,
} from '@gentlexx/dsh-fashion-project'
import { RemoteError } from '@deepseek-ai/dsh-typert-protocol'
import { MemoryStorageBackend } from '../../../storage/storage-domain/tests/helpers/memory-backend.ts'
import FashionProjectController from '../src/index.ts'

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
  const dispose = (): void => {}
  ctx.provide('typert', {
    lookups: { configure: () => dispose },
    contexts: { configureHost: () => dispose },
  } as never)
  const controller = new FashionProjectController(ctx)
  return { controller, ctx }
}

describe('FashionProjectController', () => {
  it('lists R0 after boot and projects create/get', async () => {
    const { controller } = await harness()
    const listed = controller.list()
    expect(listed.items.some(item => item.id === R0_PROJECT_ID)).toBe(true)

    const created = await controller.create({ title: '  New Look  ' })
    expect(created.project.title).toBe('New Look')
    expect(created.project.origin).toBe('user')
    expect(created.project.accessMode).toBe('editable')

    const got = controller.get({ projectId: created.project.id })
    expect(got.project).toEqual(created.project)
  })

  it('maps invalid title and not-found to RemoteError codes', async () => {
    const { controller } = await harness()
    await expect(controller.create({ title: '   ' })).rejects.toMatchObject({
      code: 'fashion-project/invalid-title',
    })
    expect(() => controller.get({ projectId: ProjectId('missing') })).toThrow(RemoteError)
    try {
      controller.get({ projectId: ProjectId('missing') })
    } catch (error) {
      expect(error).toBeInstanceOf(RemoteError)
      expect((error as RemoteError<'fashion-project/not-found'>).code).toBe('fashion-project/not-found')
    }
  })
})
