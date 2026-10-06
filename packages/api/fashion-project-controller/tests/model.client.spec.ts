/**
 * Client Fashion Project model load/create race and snapshot tests.
 */

import { describe, expect, it } from 'vitest'
import { ProjectId, type ProjectView } from '@gentlexx/dsh-fashion-project'
import type { RemoteFailure, RemoteResult } from '@deepseek-ai/dsh-typert-protocol'
import {
  ClientFashionProjectModel,
  type FashionProjectRemote,
} from '../src/client/index.ts'
import type {
  FashionProjectCreateRequest,
  FashionProjectCreateValue,
  FashionProjectGetRequest,
  FashionProjectGetValue,
  FashionProjectListValue,
} from '../src/types.ts'

function project(id: string, title: string, createdAt: string): ProjectView {
  return {
    id: ProjectId(id),
    title,
    origin: 'user',
    accessMode: 'editable',
    createdAt,
    updatedAt: createdAt,
    revision: 0,
  }
}

function ok<T>(value: T): RemoteResult<T> {
  return { ok: true, value }
}

function fail(code: RemoteFailure['code'], message: string): RemoteResult<never> {
  return { ok: false, error: { code, message, details: {} } as RemoteFailure }
}

class FakeRemote implements FashionProjectRemote {
  listImpl: () => Promise<RemoteResult<FashionProjectListValue>> = () =>
    Promise.resolve(ok({ items: [] }))
  createImpl: (request: FashionProjectCreateRequest) => Promise<RemoteResult<FashionProjectCreateValue>> =
    request => Promise.resolve(ok({
      project: project('new', request.title, '2026-09-23T00:00:00.000Z'),
    }))
  getImpl: (request: FashionProjectGetRequest) => Promise<RemoteResult<FashionProjectGetValue>> =
    request => Promise.resolve(ok({
      project: project(String(request.projectId), 'Got', '2026-09-23T00:00:00.000Z'),
    }))

  create(request: FashionProjectCreateRequest) {
    return this.createImpl(request)
  }

  get(request: FashionProjectGetRequest) {
    return this.getImpl(request)
  }

  list() {
    return this.listImpl()
  }
}

describe('ClientFashionProjectModel', () => {
  it('moves loading → ready and sorts Host items', async () => {
    const remote = new FakeRemote()
    remote.listImpl = () => Promise.resolve(ok({
      items: [
        project('a', 'A', '2026-01-01T00:00:00.000Z'),
        project('b', 'B', '2026-06-01T00:00:00.000Z'),
      ],
    }))
    const model = new ClientFashionProjectModel(remote)
    expect(model.list.getSnapshot().status).toBe('loading')
    await model.load()
    const snap = model.list.getSnapshot()
    expect(snap.status).toBe('ready')
    expect(snap.items.map(item => item.id)).toEqual([ProjectId('b'), ProjectId('a')])
  })

  it('ignores stale load responses', async () => {
    const remote = new FakeRemote()
    let resolveFirst!: (value: RemoteResult<FashionProjectListValue>) => void
    const first = new Promise<RemoteResult<FashionProjectListValue>>((resolve) => {
      resolveFirst = resolve
    })
    let calls = 0
    remote.listImpl = () => {
      calls += 1
      if (calls === 1) return first
      return Promise.resolve(ok({ items: [project('second', 'Second', '2026-09-01T00:00:00.000Z')] }))
    }
    const model = new ClientFashionProjectModel(remote)
    const pending = model.load()
    await model.load()
    resolveFirst(ok({ items: [project('first', 'First', '2026-01-01T00:00:00.000Z')] }))
    await pending
    expect(model.list.getSnapshot().items.map(item => item.title)).toEqual(['Second'])
  })

  it('merges create into the list and retains items on create failure', async () => {
    const remote = new FakeRemote()
    remote.listImpl = () => Promise.resolve(ok({
      items: [project('keep', 'Keep', '2026-01-01T00:00:00.000Z')],
    }))
    const model = new ClientFashionProjectModel(remote)
    await model.load()
    const created = await model.create('Fresh')
    expect(model.list.getSnapshot().items.map(item => item.id)).toContain(created.id)

    remote.createImpl = () => Promise.resolve(fail('fashion-project/invalid-title', 'bad'))
    await expect(model.create(' ')).rejects.toMatchObject({ code: 'fashion-project/invalid-title' })
    expect(model.list.getSnapshot().items.map(item => item.id)).toContain(ProjectId('keep'))
    expect(model.list.getSnapshot().items.map(item => item.id)).toContain(created.id)
  })
})
