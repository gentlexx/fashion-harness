/**
 * Fashion Project registry survives dispose + reopen against a shared JSON medium.
 */

import { afterEach, describe, expect, it } from 'vitest'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import Storage from '@deepseek-ai/dsh-storage'
import { DomainFacility } from '@deepseek-ai/dsh-storage-domain'
import { JsonStorageBackend } from '@deepseek-ai/dsh-storage-json'
import FashionProjectRegistry, {
  ProjectId,
  R0_PROJECT_ID,
  R0_SEED_RECORD,
} from '../src/index.ts'

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
  const fiber = await ctx.plugin(FashionProjectRegistry)
  return { ctx, fiber, registry: ctx.fashionProjectRegistry }
}

describe('FashionProjectRegistry persistence', () => {
  it('keeps create and R0 across dispose and reopen', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dsh-fashion-project-'))
    roots.push(root)

    const first = await boot(root)
    const created = await first.registry.create({ title: 'Persisted Jacket' })
    const firstR0 = first.registry.get(R0_PROJECT_ID)
    expect(firstR0?.title).toBe(R0_SEED_RECORD.title)
    await first.fiber.dispose()

    const second = await boot(root)
    expect(second.registry.get(created.id)).toEqual(created)
    expect(second.registry.get(R0_PROJECT_ID)).toEqual(firstR0)
    expect(second.registry.list().map(item => item.id)).toEqual(
      expect.arrayContaining([created.id, R0_PROJECT_ID]),
    )
    // Second open must not mint a new R0 timestamp or rewrite seed fields.
    expect(second.registry.get(R0_PROJECT_ID)?.createdAt).toBe(R0_SEED_RECORD.createdAt)
    await second.fiber.dispose()
  })

  it('preserves ProjectId branding across reopen', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dsh-fashion-project-'))
    roots.push(root)
    const first = await boot(root)
    const created = await first.registry.create({ title: 'Brand Check' })
    await first.fiber.dispose()

    const second = await boot(root)
    const again = second.registry.get(ProjectId(String(created.id)))
    expect(again?.id).toBe(created.id)
    await second.fiber.dispose()
  })
})
