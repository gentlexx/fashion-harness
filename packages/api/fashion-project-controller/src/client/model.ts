/**
 * Client Fashion Project list snapshot and Remote call model.
 * @module @gentlexx/dsh-api-fashion-project-controller/src/client/model
 */

import type { ProjectId, ProjectView } from '@gentlexx/dsh-fashion-project/types'
import type { ObservableSnapshot } from '@deepseek-ai/dsh-client-store'
import { createSnapshotStore } from '@deepseek-ai/dsh-client-store'
import type { RemoteFailure, RemoteResult } from '@deepseek-ai/dsh-typert-protocol'
import type {
  FashionProjectCreateRequest,
  FashionProjectCreateValue,
  FashionProjectGetRequest,
  FashionProjectGetValue,
  FashionProjectListValue,
} from '../types.ts'

/** Host-stable list order mirrored on the Client after unary echoes. */
function compareFashionProjects(left: ProjectView, right: ProjectView): number {
  const byCreated = right.createdAt.localeCompare(left.createdAt)
  if (byCreated !== 0) return byCreated
  return String(left.id).localeCompare(String(right.id))
}

/** Unary Fashion Project Remote namespace used by the Client model. */
export interface FashionProjectRemote {
  create(request: FashionProjectCreateRequest): Promise<RemoteResult<FashionProjectCreateValue>>
  get(request: FashionProjectGetRequest): Promise<RemoteResult<FashionProjectGetValue>>
  list(): Promise<RemoteResult<FashionProjectListValue>>
}

/** List snapshot phases for the Fashion projects page. */
export type ProjectListState =
  | { readonly status: 'loading'; readonly items: readonly ProjectView[]; readonly error: null }
  | { readonly status: 'ready'; readonly items: readonly ProjectView[]; readonly error: null }
  | { readonly status: 'error'; readonly items: readonly ProjectView[]; readonly error: RemoteFailure }

/**
 * Owns the Client Fashion Project list snapshot and unary load/create/get calls.
 */
export class ClientFashionProjectModel {
  private loadGeneration = 0
  private commandError: RemoteFailure | null = null
  private readonly store = createSnapshotStore<ProjectListState>({
    status: 'loading',
    items: [],
    error: null,
  })

  /** @param remote - Fashion Project Remote namespace. */
  constructor(private readonly remote: FashionProjectRemote) {}

  /** Observable list snapshot for UI subscriptions. */
  get list(): ObservableSnapshot<ProjectListState> {
    return this.store
  }

  /**
   * Replace the list from Host `list()`. Older responses cannot overwrite newer ones.
   */
  async load(): Promise<void> {
    const generation = ++this.loadGeneration
    this.store.set({
      status: 'loading',
      items: this.store.getSnapshot().items,
      error: null,
    })
    const result = await this.remote.list()
    if (generation !== this.loadGeneration) return
    if (!result.ok) {
      this.store.set({
        status: 'error',
        items: this.store.getSnapshot().items,
        error: result.error,
      })
      return
    }
    this.commandError = null
    this.store.set({
      status: 'ready',
      items: [...result.value.items].sort(compareFashionProjects),
      error: null,
    })
  }

  /**
   * Create a project and merge the Host-returned projection into the snapshot.
   * @param title - raw title; Host validates.
   * @returns the committed projection.
   */
  async create(title: string): Promise<ProjectView> {
    const result = await this.remote.create({ title })
    if (!result.ok) {
      this.commandError = result.error
      throw result.error
    }
    this.commandError = null
    const project = result.value.project
    const current = this.store.getSnapshot()
    const without = current.items.filter(item => item.id !== project.id)
    this.store.set({
      status: 'ready',
      items: [...without, project].sort(compareFashionProjects),
      error: null,
    })
    return project
  }

  /**
   * Fetch one project by id without mutating the list snapshot on miss.
   * @param projectId - branded identity.
   */
  async get(projectId: ProjectId): Promise<ProjectView> {
    const result = await this.remote.get({ projectId })
    if (!result.ok) throw result.error
    return result.value.project
  }

  /** Latest create/command failure retained for UI surfaces that read it separately. */
  getLastCommandError(): RemoteFailure | null {
    return this.commandError
  }
}
