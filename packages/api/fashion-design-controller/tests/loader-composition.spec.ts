/**
 * REAL Loader composition: Fashion Project + Research + Analysis + Design registries.
 */

import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import Include from '@deepseek-ai/cordis-plugin-include'
import Storage from '@deepseek-ai/dsh-storage'
import { DomainFacility } from '@deepseek-ai/dsh-storage-domain'
import FashionProjectRegistry, { R0_PROJECT_ID } from '@gentlexx/dsh-fashion-project'
import FashionResearchRegistry from '@gentlexx/dsh-fashion-research'
import FashionAnalysisRegistry from '@gentlexx/dsh-fashion-analysis'
import FashionDesignRegistry, { R0_BRIEF_ID, R0_CONCEPT_SET_ID } from '@gentlexx/dsh-fashion-design'
import { MemoryStorageBackend } from '../../../storage/storage-domain/tests/helpers/memory-backend.ts'

let root: string | undefined
let context: Context | undefined

afterEach(async () => {
  await context?.fiber.dispose()
  context = undefined
  if (root !== undefined) {
    await rm(root, { recursive: true, force: true, maxRetries: 3, retryDelay: 50 })
  }
  root = undefined
})

describe('Fashion design real Loader composition', () => {
  it('boots project + research + analysis + design and serves R0 design seed', async () => {
    root = await mkdtemp(join(tmpdir(), 'dsh-fashion-design-loader-'))
    const configPath = join(root, 'cordis.yml')
    await writeFile(configPath, [
      '- id: fashion-project',
      "  name: '@gentlexx/dsh-fashion-project'",
      '- id: fashion-research',
      "  name: '@gentlexx/dsh-fashion-research'",
      '- id: fashion-analysis',
      "  name: '@gentlexx/dsh-fashion-analysis'",
      '- id: fashion-design',
      "  name: '@gentlexx/dsh-fashion-design'",
      '',
    ].join('\n'), 'utf8')

    const ctx = new Context()
    context = ctx
    ctx.baseUrl = `${pathToFileURL(root).href}/`
    await ctx.plugin(Storage)
    ctx.storage.backend.register('memory', new MemoryStorageBackend())
    const storageDomain = new DomainFacility(ctx, { backend: 'memory', routes: {} })
    ctx.storage.mount('domain', storageDomain)
    ctx.provide('storageDomain', storageDomain)

    await ctx.plugin(Loader)
    ctx.loader.builtins.include = Include
    const modules = new Map<string, unknown>([
      ['@gentlexx/dsh-fashion-project', FashionProjectRegistry],
      ['@gentlexx/dsh-fashion-research', FashionResearchRegistry],
      ['@gentlexx/dsh-fashion-analysis', FashionAnalysisRegistry],
      ['@gentlexx/dsh-fashion-design', FashionDesignRegistry],
    ])
    ctx.loader.internal = {
      version: 'v2',
      async import(specifier: string) {
        if (!modules.has(specifier)) throw new Error(`unexpected Loader import: ${specifier}`)
        return modules.get(specifier)
      },
    } as unknown as NonNullable<typeof ctx.loader.internal>

    await ctx.loader.create({
      name: 'cordis:include',
      config: { path: pathToFileURL(configPath).href },
    })
    await ctx.loader.await()

    expect(ctx.fashionDesignRegistry).toBeDefined()
    expect(ctx.fashionDesignRegistry.getBrief(R0_PROJECT_ID, R0_BRIEF_ID).status).toBe('confirmed')
    expect(ctx.fashionDesignRegistry.getConceptSet(R0_PROJECT_ID, R0_CONCEPT_SET_ID).conceptRefs).toHaveLength(3)
  })
})
