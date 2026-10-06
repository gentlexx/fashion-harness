/**
 * R0 research seed conflict and completeness checks.
 */

import { describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Storage from '@deepseek-ai/dsh-storage'
import { DomainFacility } from '@deepseek-ai/dsh-storage-domain'
import { MemoryMediaPool, MemoryStorageBackend } from '../../../storage/storage-domain/tests/helpers/memory-backend.ts'
import FashionProjectRegistry from '@gentlexx/dsh-fashion-project'
import FashionResearchRegistry, {
  FashionResearchSeedConflictError,
  R0_SOURCE_SEEDS,
  R0_TASK_ID,
  R0_TASK_RECORD,
} from '../src/index.ts'
import { fashionResearchDomainSpec } from '../src/spec.ts'

describe('R0 research seed', () => {
  it('fails closed when only the task exists without sources', async () => {
    const pool = new MemoryMediaPool()
    const ctx = new Context()
    await ctx.plugin(Storage)
    ctx.storage.backend.register('memory', new MemoryStorageBackend(pool))
    const facility = new DomainFacility(ctx, { backend: 'memory', routes: {} })
    ctx.storage.mount('domain', facility)
    ctx.provide('storageDomain', facility)

    const domain = await facility.open(fashionResearchDomainSpec)
    await domain.table('research_tasks').put(R0_TASK_ID, R0_TASK_RECORD)
    await domain.close()

    await ctx.plugin(FashionProjectRegistry)
    await expect(ctx.plugin(FashionResearchRegistry)).rejects.toThrow(FashionResearchSeedConflictError)
  })

  it('keeps unverified or drifted commercial facts out of confirmed samples', () => {
    const pendingIds = new Set([
      'r0-source-s02', 'r0-source-e02', 'r0-source-e03', 'r0-source-e04',
      'r0-source-e05', 'r0-source-e06', 'r0-source-e07',
    ])
    for (const seed of R0_SOURCE_SEEDS) {
      if (pendingIds.has(String(seed.id))) {
        expect(seed.sample.record.status).toBe('ready_for_review')
        expect(seed.sample.record.note).toBeTruthy()
      }
    }
    const serialized = JSON.stringify(R0_SOURCE_SEEDS.filter(seed => pendingIds.has(String(seed.id))))
    expect(serialized).not.toContain('price_was')
    expect(serialized).not.toContain('price_now')
    expect(serialized).not.toContain('discount_range')
    expect(serialized).not.toContain('stock_note')
  })

  it('publishes twelve reserved source ids', () => {
    expect(R0_SOURCE_SEEDS.map(seed => String(seed.id))).toEqual([
      'r0-source-s01',
      'r0-source-s02',
      'r0-source-s03',
      'r0-source-s04',
      'r0-source-e01',
      'r0-source-e02',
      'r0-source-e03',
      'r0-source-e04',
      'r0-source-e05',
      'r0-source-e06',
      'r0-source-e07',
      'r0-source-e08',
    ])
  })
})
