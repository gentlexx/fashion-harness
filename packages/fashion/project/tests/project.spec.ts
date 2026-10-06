/**
 * Fashion Project registry behavior over an in-memory Storage Domain.
 */

import { afterEach, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Storage from '@deepseek-ai/dsh-storage'
import { DomainFacility } from '@deepseek-ai/dsh-storage-domain'
import { MemoryMediaPool, MemoryStorageBackend } from '../../../storage/storage-domain/tests/helpers/memory-backend.ts'
import FashionProjectRegistry, {
  FashionProjectInvalidTitleError,
  FashionProjectSeedConflictError,
  ProjectId,
  R0_PROJECT_ID,
  R0_SEED_CREATED_AT,
  R0_SEED_RECORD,
  compareFashionProjects,
  normalizeProjectTitle,
} from '../src/index.ts'
import type { ProjectRecordV0 } from '../src/index.ts'
import { fashionProjectDomainSpec } from '../src/spec.ts'

async function harness(options?: {
  seed?: ReadonlyArray<readonly [string, ProjectRecordV0]>
  skipRegistry?: boolean
}) {
  const pool = new MemoryMediaPool()
  const ctx = new Context()
  await ctx.plugin(Storage)
  ctx.storage.backend.register('memory', new MemoryStorageBackend(pool))
  const facility = new DomainFacility(ctx, { backend: 'memory', routes: {} })
  ctx.storage.mount('domain', facility)
  ctx.provide('storageDomain', facility)

  if (options?.seed !== undefined) {
    const domain = await facility.open(fashionProjectDomainSpec)
    for (const [id, record] of options.seed) {
      await domain.table('projects').put(ProjectId(id), record)
    }
    await domain.close()
  }

  if (options?.skipRegistry === true) {
    return { ctx, pool, registry: undefined as never }
  }

  const fiber = await ctx.plugin(FashionProjectRegistry)
  return { ctx, pool, fiber, registry: ctx.fashionProjectRegistry }
}

afterEach(async () => {
  // Fibers dispose with their owning contexts; each harness builds a fresh Context.
})

describe('normalizeProjectTitle', () => {
  it('trims and admits titles within 1–120 characters', () => {
    expect(normalizeProjectTitle('  hello  ')).toBe('hello')
  })

  it('rejects empty and oversized titles', () => {
    expect(() => normalizeProjectTitle('   ')).toThrow(FashionProjectInvalidTitleError)
    expect(() => normalizeProjectTitle('x'.repeat(121))).toThrow(FashionProjectInvalidTitleError)
  })
})

describe('FashionProjectRegistry', () => {
  it('seeds R0 once with public-rebuild invariants', async () => {
    const { registry } = await harness()
    const r0 = registry.get(R0_PROJECT_ID)
    expect(r0).toEqual({
      id: R0_PROJECT_ID,
      title: R0_SEED_RECORD.title,
      origin: 'public-rebuild',
      accessMode: 'read-only',
      createdAt: R0_SEED_CREATED_AT,
      updatedAt: R0_SEED_CREATED_AT,
      revision: 0,
    })
    const listed = registry.list()
    expect(listed.map(item => item.id)).toContain(R0_PROJECT_ID)
  })

  it('does not rewrite a valid existing R0 seed', async () => {
    const customTitle = '美国女装卡其 Utility Jacket'
    const { registry } = await harness({
      seed: [[
        R0_PROJECT_ID,
        {
          ...R0_SEED_RECORD,
          title: customTitle,
        },
      ]],
    })
    expect(registry.get(R0_PROJECT_ID)?.title).toBe(customTitle)
    expect(registry.get(R0_PROJECT_ID)?.createdAt).toBe(R0_SEED_CREATED_AT)
  })

  it('fails startup when R0 invariants drift', async () => {
    await expect(harness({
      seed: [[
        R0_PROJECT_ID,
        {
          ...R0_SEED_RECORD,
          origin: 'user',
          accessMode: 'editable',
        },
      ]],
    })).rejects.toThrow(FashionProjectSeedConflictError)
  })

  it('creates user projects with UUID ids and editable origin', async () => {
    const { registry } = await harness()
    const created = await registry.create({ title: '  Spring Utility  ' })
    expect(created.title).toBe('Spring Utility')
    expect(created.origin).toBe('user')
    expect(created.accessMode).toBe('editable')
    expect(created.revision).toBe(0)
    expect(created.createdAt).toBe(created.updatedAt)
    expect(created.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    )
    expect(registry.get(created.id)).toEqual(created)
  })

  it('allows duplicate titles and rejects invalid titles on create', async () => {
    const { registry } = await harness()
    const first = await registry.create({ title: 'Same' })
    const second = await registry.create({ title: 'Same' })
    expect(first.id).not.toBe(second.id)
    await expect(registry.create({ title: '  ' })).rejects.toThrow(FashionProjectInvalidTitleError)
    await expect(registry.create({ title: 'y'.repeat(121) })).rejects.toThrow(FashionProjectInvalidTitleError)
  })

  it('lists by createdAt descending then id ascending', async () => {
    const older: ProjectRecordV0 = {
      title: 'Older',
      origin: 'user',
      accessMode: 'editable',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      revision: 0,
    }
    const newer: ProjectRecordV0 = {
      title: 'Newer',
      origin: 'user',
      accessMode: 'editable',
      createdAt: '2026-06-01T00:00:00.000Z',
      updatedAt: '2026-06-01T00:00:00.000Z',
      revision: 0,
    }
    const { registry } = await harness({
      seed: [
        ['aaa', older],
        ['zzz', older],
        ['mid', newer],
        [R0_PROJECT_ID, R0_SEED_RECORD],
      ],
    })
    const ids = registry.list().map(item => item.id)
    // R0 seed date 2026-09-21 is newest among fixtures; then mid; then aaa/zzz same time.
    expect(ids[0]).toBe(R0_PROJECT_ID)
    expect(ids[1]).toBe(ProjectId('mid'))
    expect(ids.slice(2)).toEqual([ProjectId('aaa'), ProjectId('zzz')])
    const copy = [...registry.list()]
    expect([...copy].sort(compareFashionProjects).map(item => item.id)).toEqual(ids)
  })

  it('returns undefined for unknown ids', async () => {
    const { registry } = await harness()
    expect(registry.get(ProjectId('missing-project'))).toBeUndefined()
  })
})
