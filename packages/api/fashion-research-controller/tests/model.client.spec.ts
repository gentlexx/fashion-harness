/**
 * Client Fashion Research model load/create race and snapshot tests.
 */

import { describe, expect, it } from 'vitest'
import { ProjectId } from '@gentlexx/dsh-fashion-project'
import {
  ResearchTaskId,
  SourceId,
  type ResearchTask,
  type Source,
} from '@gentlexx/dsh-fashion-research'
import type { RemoteFailure, RemoteResult } from '@deepseek-ai/dsh-typert-protocol'
import {
  ClientFashionResearchModel,
  type FashionResearchRemote,
} from '../src/client/index.ts'
import type {
  CreateSourceRequest,
  CreateTaskRequest,
  ListSourcesRequest,
  ListTasksRequest,
  SourceListValue,
  SourceValue,
  TaskListValue,
  TaskValue,
} from '../src/types.ts'

function task(id: string, projectId: string, updatedAt: string): ResearchTask {
  return {
    id: ResearchTaskId(id),
    projectId: ProjectId(projectId),
    title: id,
    note: null,
    status: 'draft',
    origin: 'human',
    accessMode: 'editable',
    revision: 0,
    createdAt: updatedAt,
    updatedAt,
    createdBy: 'local-human',
    updatedBy: 'local-human',
    schemaVersion: 0,
    archivedAt: null,
  }
}

function source(id: string, projectId: string, taskId: string, updatedAt: string): Source {
  return {
    id: SourceId(id),
    projectId: ProjectId(projectId),
    taskId: ResearchTaskId(taskId),
    locatorType: 'url',
    url: 'https://example.com',
    urlNormalized: 'https://example.com',
    attachmentRef: null,
    title: id,
    publisherOrPlatform: null,
    sourceKind: 'web_page',
    accessedAt: updatedAt,
    publishedAt: null,
    captureMode: 'manual_link',
    usageBoundary: 'view_only',
    externalProcessing: 'denied',
    availabilityStatus: 'available',
    attribution: 'a',
    contentFingerprint: null,
    origin: 'human',
    accessMode: 'editable',
    revision: 0,
    createdAt: updatedAt,
    updatedAt,
    createdBy: 'local-human',
    updatedBy: 'local-human',
    schemaVersion: 0,
    archivedAt: null,
  }
}

function ok<T>(value: T): RemoteResult<T> {
  return { ok: true, value }
}

function fail(code: RemoteFailure['code'], message: string): RemoteResult<never> {
  return { ok: false, error: { code, message, details: {} } as RemoteFailure }
}

class FakeRemote implements FashionResearchRemote {
  listTasksImpl: (request: ListTasksRequest) => Promise<RemoteResult<TaskListValue>> =
    () => Promise.resolve(ok({ items: [] }))
  createTaskImpl: (request: CreateTaskRequest) => Promise<RemoteResult<TaskValue>> =
    request => Promise.resolve(ok({
      task: task('new', String(request.projectId), '2026-09-24T00:00:00.000Z'),
    }))
  listSourcesImpl: (request: ListSourcesRequest) => Promise<RemoteResult<SourceListValue>> =
    () => Promise.resolve(ok({ items: [] }))
  createSourceImpl: (request: CreateSourceRequest) => Promise<RemoteResult<SourceValue>> =
    request => Promise.resolve(ok({
      source: source('s-new', String(request.projectId), String(request.taskId), '2026-09-24T00:00:00.000Z'),
    }))

  createTask(request: CreateTaskRequest) { return this.createTaskImpl(request) }
  getTask() { return Promise.resolve(ok({ task: task('t', 'p', '2026-09-24T00:00:00.000Z') })) }
  listTasks(request: ListTasksRequest) { return this.listTasksImpl(request) }
  updateTask() { return Promise.resolve(ok({ task: task('t', 'p', '2026-09-24T00:00:00.000Z') })) }
  archiveTask() { return Promise.resolve(ok({ task: task('t', 'p', '2026-09-24T00:00:00.000Z') })) }
  createSource(request: CreateSourceRequest) { return this.createSourceImpl(request) }
  getSource() { return Promise.resolve(ok({ source: source('s', 'p', 't', '2026-09-24T00:00:00.000Z') })) }
  listSources(request: ListSourcesRequest) { return this.listSourcesImpl(request) }
  updateSource() { return Promise.resolve(ok({ source: source('s', 'p', 't', '2026-09-24T00:00:00.000Z') })) }
  archiveSource() { return Promise.resolve(ok({ source: source('s', 'p', 't', '2026-09-24T00:00:00.000Z') })) }
  createSample() { return Promise.reject(new Error('unused')) }
  getSample() { return Promise.reject(new Error('unused')) }
  listSamples() { return Promise.resolve(ok({ items: [] })) }
  updateSample() { return Promise.reject(new Error('unused')) }
  archiveSample() { return Promise.reject(new Error('unused')) }
  createEvidence() { return Promise.reject(new Error('unused')) }
  getEvidence() { return Promise.reject(new Error('unused')) }
  listEvidence() { return Promise.resolve(ok({ items: [] })) }
  updateEvidence() { return Promise.reject(new Error('unused')) }
  archiveEvidence() { return Promise.reject(new Error('unused')) }
  reviewEvidence() { return Promise.reject(new Error('unused')) }
}

describe('ClientFashionResearchModel', () => {
  it('loads tasks ready and sorts by updatedAt desc', async () => {
    const remote = new FakeRemote()
    const projectId = ProjectId('p1')
    remote.listTasksImpl = () => Promise.resolve(ok({
      items: [
        task('a', 'p1', '2026-01-01T00:00:00.000Z'),
        task('b', 'p1', '2026-06-01T00:00:00.000Z'),
      ],
    }))
    const model = new ClientFashionResearchModel(remote)
    await model.loadTasks(projectId)
    const snap = model.tasks.getSnapshot()
    expect(snap.status).toBe('ready')
    expect(snap.items.map(item => item.id)).toEqual([ResearchTaskId('b'), ResearchTaskId('a')])
  })

  it('ignores stale task load responses', async () => {
    const remote = new FakeRemote()
    const projectId = ProjectId('p1')
    let resolveFirst!: (value: RemoteResult<TaskListValue>) => void
    const first = new Promise<RemoteResult<TaskListValue>>((resolve) => {
      resolveFirst = resolve
    })
    let calls = 0
    remote.listTasksImpl = () => {
      calls += 1
      if (calls === 1) return first
      return Promise.resolve(ok({ items: [task('second', 'p1', '2026-09-01T00:00:00.000Z')] }))
    }
    const model = new ClientFashionResearchModel(remote)
    const pending = model.loadTasks(projectId)
    await model.loadTasks(projectId)
    resolveFirst(ok({ items: [task('first', 'p1', '2026-01-01T00:00:00.000Z')] }))
    await pending
    expect(model.tasks.getSnapshot().items.map(item => item.title)).toEqual(['second'])
  })

  it('merges create into scoped lists and retains items on failure', async () => {
    const remote = new FakeRemote()
    const projectId = ProjectId('p1')
    const taskId = ResearchTaskId('t1')
    remote.listTasksImpl = () => Promise.resolve(ok({
      items: [task('keep', 'p1', '2026-01-01T00:00:00.000Z')],
    }))
    remote.listSourcesImpl = () => Promise.resolve(ok({
      items: [source('keep-s', 'p1', 't1', '2026-01-01T00:00:00.000Z')],
    }))
    const model = new ClientFashionResearchModel(remote)
    await model.loadTasks(projectId)
    await model.loadTaskChildren(projectId, taskId)

    const created = await model.createTask({ projectId, title: 'Fresh' })
    expect(model.tasks.getSnapshot().items.map(item => item.id)).toContain(created.id)

    remote.createTaskImpl = () => Promise.resolve(fail('fashion-research/invalid-input', 'bad'))
    await expect(model.createTask({ projectId, title: ' ' })).rejects.toMatchObject({
      code: 'fashion-research/invalid-input',
    })
    expect(model.tasks.getSnapshot().items.map(item => item.id)).toContain(ResearchTaskId('keep'))
    expect(model.tasks.getSnapshot().items.map(item => item.id)).toContain(created.id)

    const createdSource = await model.createSource({
      projectId,
      taskId,
      locatorType: 'url',
      url: 'https://example.com/x',
      title: 'X',
      sourceKind: 'web_page',
      captureMode: 'manual_link',
      usageBoundary: 'view_only',
      externalProcessing: 'denied',
      attribution: 'a',
    })
    expect(model.sources.getSnapshot().items.map(item => item.id)).toContain(createdSource.id)
    expect(model.sources.getSnapshot().items.map(item => item.id)).toContain(SourceId('keep-s'))
  })
})
