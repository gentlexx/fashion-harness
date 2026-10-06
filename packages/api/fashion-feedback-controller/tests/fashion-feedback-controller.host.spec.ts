/**
 * Fashion Feedback Host controller projection tests.
 */

import { afterEach, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Storage from '@deepseek-ai/dsh-storage'
import { DomainFacility } from '@deepseek-ai/dsh-storage-domain'
import FashionProjectRegistry, { R0_PROJECT_ID } from '@gentlexx/dsh-fashion-project'
import FashionResearchRegistry from '@gentlexx/dsh-fashion-research'
import FashionAnalysisRegistry from '@gentlexx/dsh-fashion-analysis'
import FashionDesignRegistry from '@gentlexx/dsh-fashion-design'
import FashionFeedbackRegistry, { R0_FEEDBACK_ID } from '@gentlexx/dsh-fashion-feedback'
import { RemoteError } from '@deepseek-ai/dsh-typert-protocol'
import { MemoryStorageBackend } from '../../../storage/storage-domain/tests/helpers/memory-backend.ts'
import FashionFeedbackController from '../src/index.ts'

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
  const dispose = (): void => {}
  ctx.provide('typert', {
    lookups: { configure: () => dispose },
    contexts: { configureHost: () => dispose },
  } as never)
  const controller = new FashionFeedbackController(ctx)
  return { controller, ctx }
}

describe('FashionFeedbackController', () => {
  it('reads R0 recorded feedback and refuses R0 writes', async () => {
    const { controller } = await harness()
    const rows = controller.listFeedback({ projectId: R0_PROJECT_ID })
    expect(rows.some(row => row.id === R0_FEEDBACK_ID)).toBe(true)
    expect(rows.every(row => row.dataReality === 'recorded_demo')).toBe(true)
    const subject = rows[0]!.subjectRef
    await expect(controller.recordFeedback({
      projectId: R0_PROJECT_ID,
      subjectRef: subject,
      expectedSubjectRevision: subject.subjectRevision,
      action: 'adopted',
      reasonCodes: [],
      modifications: [],
      professionalValidity: 'unknown',
      revisionEffort: 'none',
      dataReality: 'user_test',
    })).rejects.toMatchObject({ code: 'fashion-feedback/project-read-only' })
    expect(() => controller.getFeedback({
      projectId: R0_PROJECT_ID,
      feedbackId: 'missing-feedback',
    })).toThrow(RemoteError)
  })

  it('rejects a non-human actor on an ordinary project', async () => {
    const { controller, ctx } = await harness()
    const project = await ctx.fashionProjectRegistry.create({ title: 'Remote feedback' })
    await expect(controller.recordFeedback({
      projectId: project.id,
      subjectRef: {
        subjectType: 'workflow_step',
        subjectId: 'step-export',
        subjectRevision: 0,
        relatedDeliverableRef: null,
        workflowStep: {
          stepKey: 'export',
          moduleId: 'fashion-design',
          moduleSchemaVersion: 0,
          relatedRefs: [{ id: 'local', revision: 0 }],
        },
      },
      expectedSubjectRevision: 0,
      action: 'needs_follow_up',
      reasonCodes: [],
      modifications: [],
      professionalValidity: 'unknown',
      revisionEffort: 'unknown',
      dataReality: 'recorded_demo',
    })).rejects.toMatchObject({ code: 'fashion-feedback/human-required' })
  })
})
