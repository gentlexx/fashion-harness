/**
 * Fashion Evaluation Host controller projection tests.
 */

import { afterEach, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Storage from '@deepseek-ai/dsh-storage'
import { DomainFacility } from '@deepseek-ai/dsh-storage-domain'
import FashionProjectRegistry, { R0_PROJECT_ID } from '@gentlexx/dsh-fashion-project'
import FashionResearchRegistry from '@gentlexx/dsh-fashion-research'
import FashionAnalysisRegistry from '@gentlexx/dsh-fashion-analysis'
import FashionDesignRegistry from '@gentlexx/dsh-fashion-design'
import FashionFeedbackRegistry from '@gentlexx/dsh-fashion-feedback'
import FashionEvaluationRegistry, { R0_DEFINITION_ID, R0_RUN_ID } from '@gentlexx/dsh-fashion-evaluation'
import { MemoryStorageBackend } from '../../../storage/storage-domain/tests/helpers/memory-backend.ts'
import FashionEvaluationController from '../src/index.ts'

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
  const dispose = (): void => {}
  ctx.provide('typert', {
    lookups: { configure: () => dispose },
    contexts: { configureHost: () => dispose },
  } as never)
  const controller = new FashionEvaluationController(ctx)
  return { controller, ctx }
}

describe('FashionEvaluationController', () => {
  it('reads R0 definition, run, and refuses R0 assessment writes', async () => {
    const { controller } = await harness()
    const definitions = controller.listDefinitions()
    expect(definitions.some(row => String(row.id) === String(R0_DEFINITION_ID))).toBe(true)
    const run = controller.getEvaluationRun({ runId: R0_RUN_ID })
    expect(run.verdict).toBe('pass')
    const results = controller.getRuleResults({ runId: R0_RUN_ID })
    expect(results.length).toBeGreaterThan(0)
    await expect(controller.recordHumanAssessment({
      projectId: R0_PROJECT_ID,
      runId: R0_RUN_ID,
      criterionId: 'research_evidence_useful',
      rating: 'meets',
      reason: 'should fail',
    })).rejects.toMatchObject({ code: 'fashion-evaluation/project-read-only' })
  })

  it('lists cases including eight synthetic negatives', async () => {
    const { controller } = await harness()
    const cases = controller.listCases()
    expect(cases.filter(row => row.fixtureKind === 'synthetic_negative')).toHaveLength(8)
  })
})
