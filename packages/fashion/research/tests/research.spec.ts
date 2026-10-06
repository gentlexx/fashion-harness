/**
 * Fashion Research registry behavior over an in-memory Storage Domain.
 */

import { describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Storage from '@deepseek-ai/dsh-storage'
import { DomainFacility } from '@deepseek-ai/dsh-storage-domain'
import { MemoryMediaPool, MemoryStorageBackend } from '../../../storage/storage-domain/tests/helpers/memory-backend.ts'
import FashionProjectRegistry, {
  R0_PROJECT_ID,
} from '@gentlexx/dsh-fashion-project'
import FashionResearchRegistry, {
  FashionResearchCrossProjectReferenceError,
  FashionResearchCrossTaskReferenceError,
  FashionResearchInvalidInputError,
  FashionResearchInvalidUrlError,
  FashionResearchProjectReadOnlyError,
  FashionResearchRevisionConflictError,
  FashionResearchSeedConflictError,
  ResearchTaskId,
  R0_SOURCE_SEEDS,
  R0_TASK_ID,
  SourceId,
} from '../src/index.ts'
import type { ResearchTaskRecordV0 } from '../src/index.ts'
import { fashionResearchDomainSpec } from '../src/spec.ts'
import { R0_TASK_RECORD } from '../src/seed/r0-utility-jacket.ts'

async function harness(options?: {
  researchSeed?: ReadonlyArray<readonly [string, ResearchTaskRecordV0]>
}) {
  const pool = new MemoryMediaPool()
  const ctx = new Context()
  await ctx.plugin(Storage)
  ctx.storage.backend.register('memory', new MemoryStorageBackend(pool))
  const facility = new DomainFacility(ctx, { backend: 'memory', routes: {} })
  ctx.storage.mount('domain', facility)
  ctx.provide('storageDomain', facility)

  if (options?.researchSeed !== undefined) {
    const domain = await facility.open(fashionResearchDomainSpec)
    for (const [id, record] of options.researchSeed) {
      await domain.table('research_tasks').put(ResearchTaskId(id), record)
    }
    await domain.close()
  }

  await ctx.plugin(FashionProjectRegistry)
  const fiber = await ctx.plugin(FashionResearchRegistry)
  return {
    ctx,
    pool,
    fiber,
    projects: ctx.fashionProjectRegistry,
    research: ctx.fashionResearchRegistry,
  }
}

describe('FashionResearchRegistry', () => {
  it('seeds R0 task, twelve sources, samples, and evidence once', async () => {
    const { research } = await harness()
    const task = research.getTask(R0_TASK_ID)
    expect(task?.projectId).toBe(R0_PROJECT_ID)
    expect(task?.accessMode).toBe('read-only')
    expect(task?.origin).toBe('system_seed')
    expect(research.listSources(R0_PROJECT_ID, R0_TASK_ID)).toHaveLength(12)
    expect(research.listSamples(R0_PROJECT_ID, R0_TASK_ID)).toHaveLength(12)
    const evidence = research.listEvidence(R0_PROJECT_ID, R0_TASK_ID)
    expect(evidence.length).toBeGreaterThanOrEqual(6)
    expect(evidence.some(item => item.claimType === 'observed')).toBe(true)
    expect(evidence.some(item => item.claimType === 'derived')).toBe(true)
    expect(evidence.some(item => item.claimType === 'needs_validation')).toBe(true)
  })

  it('does not rewrite a complete valid R0 seed on reopen of the same medium', async () => {
    const pool = new MemoryMediaPool()
    async function boot() {
      const ctx = new Context()
      await ctx.plugin(Storage)
      ctx.storage.backend.register('memory', new MemoryStorageBackend(pool))
      const facility = new DomainFacility(ctx, { backend: 'memory', routes: {} })
      ctx.storage.mount('domain', facility)
      ctx.provide('storageDomain', facility)
      await ctx.plugin(FashionProjectRegistry)
      const fiber = await ctx.plugin(FashionResearchRegistry)
      return { fiber, research: ctx.fashionResearchRegistry }
    }

    const first = await boot()
    const before = first.research.getTask(R0_TASK_ID)
    const sourceCount = first.research.listSources(R0_PROJECT_ID, R0_TASK_ID).length
    await first.fiber.dispose()

    const second = await boot()
    expect(second.research.getTask(R0_TASK_ID)).toEqual(before)
    expect(second.research.listSources(R0_PROJECT_ID, R0_TASK_ID)).toHaveLength(sourceCount)
    await second.fiber.dispose()
  })

  it('fails startup when R0 task invariants drift', async () => {
    await expect(harness({
      researchSeed: [[
        R0_TASK_ID,
        {
          ...R0_TASK_RECORD,
          origin: 'human',
          accessMode: 'editable',
        },
      ]],
    })).rejects.toThrow(FashionResearchSeedConflictError)
  })

  it('creates the full Task→Source→Sample→Evidence chain on a user project', async () => {
    const { projects, research } = await harness()
    const project = await projects.create({ title: 'User research project' })
    const task = await research.createTask({ projectId: project.id, title: '  Spring scan  ' })
    expect(task.title).toBe('Spring scan')
    expect(task.status).toBe('draft')

    const source = await research.createSource({
      projectId: project.id,
      taskId: task.id,
      locatorType: 'url',
      url: 'https://Example.com/item?id=1',
      title: 'Example product',
      sourceKind: 'product_page',
      captureMode: 'manual_link',
      usageBoundary: 'view_only',
      externalProcessing: 'denied',
      attribution: 'Manual link registration',
    })
    expect(source.urlNormalized).toBe('https://example.com/item?id=1')

    const sample = await research.createSample({
      projectId: project.id,
      taskId: task.id,
      sourceId: source.id,
      label: 'Listing A',
      rawFields: [{ name: 'price', value: '59.99', unit: 'USD' }],
    })

    const evidence = await research.createEvidence({
      projectId: project.id,
      taskId: task.id,
      subjectType: 'sample',
      subjectId: sample.id,
      observation: 'Page shows US$59.99 without a discount badge.',
      claim: 'Listing presents a full-price state at observation time.',
      claimType: 'observed',
      evidenceGrade: 'G1',
      limitations: ['Price state is not sales volume.'],
    })
    expect(evidence.reviewStatus).toBe('draft')

    const reviewed = await research.reviewEvidence({
      evidenceId: evidence.id,
      expectedRevision: evidence.revision,
      reviewStatus: 'confirmed',
      reviewNote: 'Human confirms the page observation.',
    })
    expect(reviewed.reviewStatus).toBe('confirmed')
    expect(reviewed.reviewedBy).toBe('local-human')
    expect(reviewed.revision).toBe(evidence.revision + 1)
  })

  it('rejects R0 writes, bad URLs, revision conflicts, and cross references', async () => {
    const { projects, research } = await harness()
    await expect(research.createTask({
      projectId: R0_PROJECT_ID,
      title: 'Should fail',
    })).rejects.toThrow(FashionResearchProjectReadOnlyError)

    const project = await projects.create({ title: 'User A' })
    const other = await projects.create({ title: 'User B' })
    const task = await research.createTask({ projectId: project.id, title: 'A task' })
    const otherTaskSameProject = await research.createTask({ projectId: project.id, title: 'A task 2' })
    const otherTask = await research.createTask({ projectId: other.id, title: 'B task' })

    await expect(research.createSource({
      projectId: project.id,
      taskId: task.id,
      locatorType: 'url',
      url: 'https://user:secret@example.com/',
      title: 'Bad',
      sourceKind: 'web_page',
      captureMode: 'manual_link',
      usageBoundary: 'view_only',
      externalProcessing: 'denied',
      attribution: 'x',
    })).rejects.toThrow(FashionResearchInvalidUrlError)

    await expect(research.createSource({
      projectId: project.id,
      taskId: otherTask.id,
      locatorType: 'url',
      url: 'https://example.com/',
      title: 'Cross',
      sourceKind: 'web_page',
      captureMode: 'manual_link',
      usageBoundary: 'view_only',
      externalProcessing: 'denied',
      attribution: 'x',
    })).rejects.toThrow(FashionResearchCrossProjectReferenceError)

    const source = await research.createSource({
      projectId: project.id,
      taskId: task.id,
      locatorType: 'url',
      url: 'https://example.com/ok',
      title: 'OK',
      sourceKind: 'web_page',
      captureMode: 'manual_link',
      usageBoundary: 'view_only',
      externalProcessing: 'denied',
      attribution: 'x',
    })

    await expect(research.createSample({
      projectId: project.id,
      taskId: otherTaskSameProject.id,
      sourceId: source.id,
      label: 'cross task',
    })).rejects.toThrow(FashionResearchCrossTaskReferenceError)

    await expect(research.updateTask({
      taskId: task.id,
      expectedRevision: 99,
      title: 'stale',
    })).rejects.toThrow(FashionResearchRevisionConflictError)

    await expect(research.createEvidence({
      projectId: project.id,
      taskId: task.id,
      subjectType: 'source',
      subjectId: source.id,
      observation: 'x',
      claim: 'y',
      claimType: 'observed',
      evidenceGrade: 'G0',
    })).rejects.toThrow(FashionResearchInvalidInputError)

    expect(research.getSource(SourceId('missing'))).toBeUndefined()
    expect(R0_SOURCE_SEEDS).toHaveLength(12)
  })

  it('archives objects without hard delete and keeps parent ProjectId distinct from SessionId concepts', async () => {
    const { projects, research } = await harness()
    const project = await projects.create({ title: 'Archiveable' })
    const task = await research.createTask({ projectId: project.id, title: 'T' })
    expect(String(project.id)).not.toContain('session')
    const archived = await research.archiveTask({
      taskId: task.id,
      expectedRevision: task.revision,
    })
    expect(archived.status).toBe('archived')
    expect(archived.accessMode).toBe('read-only')
    expect(archived.archivedAt).not.toBeNull()
    expect(research.getTask(task.id)?.id).toBe(task.id)
  })

  it('rejects system-seed as Evidence reviewer', async () => {
    const { projects, research } = await harness()
    const project = await projects.create({ title: 'Review gate' })
    const task = await research.createTask({ projectId: project.id, title: 'T' })
    const source = await research.createSource({
      projectId: project.id,
      taskId: task.id,
      locatorType: 'url',
      url: 'https://example.com/r',
      title: 'S',
      sourceKind: 'web_page',
      captureMode: 'manual_link',
      usageBoundary: 'view_only',
      externalProcessing: 'denied',
      attribution: 'a',
    })
    const evidence = await research.createEvidence({
      projectId: project.id,
      taskId: task.id,
      subjectType: 'source',
      subjectId: source.id,
      observation: 'visible text',
      claim: 'needs_validation claim',
      claimType: 'needs_validation',
      evidenceGrade: 'G0',
    })
    await expect(research.reviewEvidence({
      evidenceId: evidence.id,
      expectedRevision: evidence.revision,
      reviewStatus: 'confirmed',
      reviewNote: 'nope',
      actor: 'system-seed',
    })).rejects.toThrow(/reviewer-must-be-human/)
  })
})
