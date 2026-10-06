/**
 * Client Fashion Research list snapshots and Remote call model.
 * @module @gentlexx/dsh-api-fashion-research-controller/src/client/model
 */

import type { ProjectId } from '@gentlexx/dsh-fashion-project/types'
import type {
  Evidence,
  ResearchTask,
  ResearchTaskId,
  Sample,
  Source,
} from '@gentlexx/dsh-fashion-research/types'
import type { ObservableSnapshot } from '@deepseek-ai/dsh-client-store'
import { createSnapshotStore } from '@deepseek-ai/dsh-client-store'
import { compareResearchUpdatedDesc } from './order.ts'
import type { RemoteFailure, RemoteResult } from '@deepseek-ai/dsh-typert-protocol'
import type {
  ArchiveEvidenceRequest,
  ArchiveSampleRequest,
  ArchiveSourceRequest,
  ArchiveTaskRequest,
  CreateEvidenceRequest,
  CreateSampleRequest,
  CreateSourceRequest,
  CreateTaskRequest,
  EvidenceListValue,
  EvidenceValue,
  GetEvidenceRequest,
  GetSampleRequest,
  GetSourceRequest,
  GetTaskRequest,
  ListEvidenceRequest,
  ListSamplesRequest,
  ListSourcesRequest,
  ListTasksRequest,
  ReviewEvidenceRequest,
  SampleListValue,
  SampleValue,
  SourceListValue,
  SourceValue,
  TaskListValue,
  TaskValue,
  UpdateEvidenceRequest,
  UpdateSampleRequest,
  UpdateSourceRequest,
  UpdateTaskRequest,
} from '../types.ts'

/** Unary Fashion Research Remote namespace used by the Client model. */
export interface FashionResearchRemote {
  createTask(request: CreateTaskRequest): Promise<RemoteResult<TaskValue>>
  getTask(request: GetTaskRequest): Promise<RemoteResult<TaskValue>>
  listTasks(request: ListTasksRequest): Promise<RemoteResult<TaskListValue>>
  updateTask(request: UpdateTaskRequest): Promise<RemoteResult<TaskValue>>
  archiveTask(request: ArchiveTaskRequest): Promise<RemoteResult<TaskValue>>
  createSource(request: CreateSourceRequest): Promise<RemoteResult<SourceValue>>
  getSource(request: GetSourceRequest): Promise<RemoteResult<SourceValue>>
  listSources(request: ListSourcesRequest): Promise<RemoteResult<SourceListValue>>
  updateSource(request: UpdateSourceRequest): Promise<RemoteResult<SourceValue>>
  archiveSource(request: ArchiveSourceRequest): Promise<RemoteResult<SourceValue>>
  createSample(request: CreateSampleRequest): Promise<RemoteResult<SampleValue>>
  getSample(request: GetSampleRequest): Promise<RemoteResult<SampleValue>>
  listSamples(request: ListSamplesRequest): Promise<RemoteResult<SampleListValue>>
  updateSample(request: UpdateSampleRequest): Promise<RemoteResult<SampleValue>>
  archiveSample(request: ArchiveSampleRequest): Promise<RemoteResult<SampleValue>>
  createEvidence(request: CreateEvidenceRequest): Promise<RemoteResult<EvidenceValue>>
  getEvidence(request: GetEvidenceRequest): Promise<RemoteResult<EvidenceValue>>
  listEvidence(request: ListEvidenceRequest): Promise<RemoteResult<EvidenceListValue>>
  updateEvidence(request: UpdateEvidenceRequest): Promise<RemoteResult<EvidenceValue>>
  archiveEvidence(request: ArchiveEvidenceRequest): Promise<RemoteResult<EvidenceValue>>
  reviewEvidence(request: ReviewEvidenceRequest): Promise<RemoteResult<EvidenceValue>>
}

/** List snapshot phases for research object collections. */
export type ResearchListState<T> =
  | { readonly status: 'loading'; readonly items: readonly T[]; readonly error: null }
  | { readonly status: 'ready'; readonly items: readonly T[]; readonly error: null }
  | { readonly status: 'error'; readonly items: readonly T[]; readonly error: RemoteFailure }

/**
 * Owns Client Fashion Research snapshots and unary Remote calls.
 * Task list is project-scoped; Source/Sample/Evidence lists are task-scoped.
 */
export class ClientFashionResearchModel {
  private taskLoadGeneration = 0
  private childLoadGeneration = 0
  private scopedProjectId: ProjectId | null = null
  private scopedTaskId: ResearchTaskId | null = null
  private commandError: RemoteFailure | null = null

  private readonly taskStore = createSnapshotStore<ResearchListState<ResearchTask>>({
    status: 'loading',
    items: [],
    error: null,
  })
  private readonly sourceStore = createSnapshotStore<ResearchListState<Source>>({
    status: 'loading',
    items: [],
    error: null,
  })
  private readonly sampleStore = createSnapshotStore<ResearchListState<Sample>>({
    status: 'loading',
    items: [],
    error: null,
  })
  private readonly evidenceStore = createSnapshotStore<ResearchListState<Evidence>>({
    status: 'loading',
    items: [],
    error: null,
  })

  /** @param remote - Fashion Research Remote namespace. */
  constructor(private readonly remote: FashionResearchRemote) {}

  /** Observable task list for the last loaded project. */
  get tasks(): ObservableSnapshot<ResearchListState<ResearchTask>> {
    return this.taskStore
  }

  /** Observable source list for the last loaded task. */
  get sources(): ObservableSnapshot<ResearchListState<Source>> {
    return this.sourceStore
  }

  /** Observable sample list for the last loaded task. */
  get samples(): ObservableSnapshot<ResearchListState<Sample>> {
    return this.sampleStore
  }

  /** Observable evidence list for the last loaded task. */
  get evidence(): ObservableSnapshot<ResearchListState<Evidence>> {
    return this.evidenceStore
  }

  /**
   * Replace the task list from Host `listTasks`.
   * @param projectId - owning project.
   */
  async loadTasks(projectId: ProjectId): Promise<void> {
    const generation = ++this.taskLoadGeneration
    this.scopedProjectId = projectId
    this.taskStore.set({
      status: 'loading',
      items: this.taskStore.getSnapshot().items,
      error: null,
    })
    const result = await this.remote.listTasks({ projectId })
    if (generation !== this.taskLoadGeneration) return
    if (!result.ok) {
      this.taskStore.set({
        status: 'error',
        items: this.taskStore.getSnapshot().items,
        error: result.error,
      })
      return
    }
    this.commandError = null
    this.taskStore.set({
      status: 'ready',
      items: [...result.value.items].sort(compareResearchUpdatedDesc),
      error: null,
    })
  }

  /**
   * Load Source/Sample/Evidence lists for one task.
   * @param projectId - owning project.
   * @param taskId - owning task.
   */
  async loadTaskChildren(projectId: ProjectId, taskId: ResearchTaskId): Promise<void> {
    const generation = ++this.childLoadGeneration
    this.scopedProjectId = projectId
    this.scopedTaskId = taskId
    this.sourceStore.set({ status: 'loading', items: this.sourceStore.getSnapshot().items, error: null })
    this.sampleStore.set({ status: 'loading', items: this.sampleStore.getSnapshot().items, error: null })
    this.evidenceStore.set({ status: 'loading', items: this.evidenceStore.getSnapshot().items, error: null })

    const [sources, samples, evidence] = await Promise.all([
      this.remote.listSources({ projectId, taskId }),
      this.remote.listSamples({ projectId, taskId }),
      this.remote.listEvidence({ projectId, taskId }),
    ])
    if (generation !== this.childLoadGeneration) return

    applyListResult(this.sourceStore, sources)
    applyListResult(this.sampleStore, samples)
    applyListResult(this.evidenceStore, evidence)
    if (sources.ok && samples.ok && evidence.ok) this.commandError = null
  }

  /** @param request - create task request. */
  async createTask(request: CreateTaskRequest): Promise<ResearchTask> {
    const result = await this.remote.createTask(request)
    if (!result.ok) {
      this.commandError = result.error
      throw result.error
    }
    this.commandError = null
    const task = result.value.task
    if (this.scopedProjectId !== null && String(this.scopedProjectId) === String(request.projectId)) {
      mergeItem(this.taskStore, task)
    }
    return task
  }

  /** @param request - get task request with parent project. */
  async getTask(request: GetTaskRequest): Promise<ResearchTask> {
    const result = await this.remote.getTask(request)
    if (!result.ok) throw result.error
    return result.value.task
  }

  /** @param request - update task request. */
  async updateTask(request: UpdateTaskRequest): Promise<ResearchTask> {
    const result = await this.remote.updateTask(request)
    if (!result.ok) {
      this.commandError = result.error
      throw result.error
    }
    this.commandError = null
    mergeItem(this.taskStore, result.value.task)
    return result.value.task
  }

  /** @param request - archive task request. */
  async archiveTask(request: ArchiveTaskRequest): Promise<ResearchTask> {
    const result = await this.remote.archiveTask(request)
    if (!result.ok) {
      this.commandError = result.error
      throw result.error
    }
    this.commandError = null
    mergeItem(this.taskStore, result.value.task)
    return result.value.task
  }

  /** @param request - create source request. */
  async createSource(request: CreateSourceRequest): Promise<Source> {
    const result = await this.remote.createSource(request)
    if (!result.ok) {
      this.commandError = result.error
      throw result.error
    }
    this.commandError = null
    if (this.matchesTaskScope(request.projectId, request.taskId)) {
      mergeItem(this.sourceStore, result.value.source)
    }
    return result.value.source
  }

  /** @param request - get source request with parent chain. */
  async getSource(request: GetSourceRequest): Promise<Source> {
    const result = await this.remote.getSource(request)
    if (!result.ok) throw result.error
    return result.value.source
  }

  /** @param request - update source request. */
  async updateSource(request: UpdateSourceRequest): Promise<Source> {
    const result = await this.remote.updateSource(request)
    if (!result.ok) {
      this.commandError = result.error
      throw result.error
    }
    this.commandError = null
    mergeItem(this.sourceStore, result.value.source)
    return result.value.source
  }

  /** @param request - archive source request. */
  async archiveSource(request: ArchiveSourceRequest): Promise<Source> {
    const result = await this.remote.archiveSource(request)
    if (!result.ok) {
      this.commandError = result.error
      throw result.error
    }
    this.commandError = null
    mergeItem(this.sourceStore, result.value.source)
    return result.value.source
  }

  /** @param request - create sample request. */
  async createSample(request: CreateSampleRequest): Promise<Sample> {
    const result = await this.remote.createSample(request)
    if (!result.ok) {
      this.commandError = result.error
      throw result.error
    }
    this.commandError = null
    if (this.matchesTaskScope(request.projectId, request.taskId)) {
      mergeItem(this.sampleStore, result.value.sample)
    }
    return result.value.sample
  }

  /** @param request - get sample request with parent chain. */
  async getSample(request: GetSampleRequest): Promise<Sample> {
    const result = await this.remote.getSample(request)
    if (!result.ok) throw result.error
    return result.value.sample
  }

  /** @param request - update sample request. */
  async updateSample(request: UpdateSampleRequest): Promise<Sample> {
    const result = await this.remote.updateSample(request)
    if (!result.ok) {
      this.commandError = result.error
      throw result.error
    }
    this.commandError = null
    mergeItem(this.sampleStore, result.value.sample)
    return result.value.sample
  }

  /** @param request - archive sample request. */
  async archiveSample(request: ArchiveSampleRequest): Promise<Sample> {
    const result = await this.remote.archiveSample(request)
    if (!result.ok) {
      this.commandError = result.error
      throw result.error
    }
    this.commandError = null
    mergeItem(this.sampleStore, result.value.sample)
    return result.value.sample
  }

  /** @param request - create evidence request. */
  async createEvidence(request: CreateEvidenceRequest): Promise<Evidence> {
    const result = await this.remote.createEvidence(request)
    if (!result.ok) {
      this.commandError = result.error
      throw result.error
    }
    this.commandError = null
    if (this.matchesTaskScope(request.projectId, request.taskId)) {
      mergeItem(this.evidenceStore, result.value.evidence)
    }
    return result.value.evidence
  }

  /** @param request - get evidence request with parent chain. */
  async getEvidence(request: GetEvidenceRequest): Promise<Evidence> {
    const result = await this.remote.getEvidence(request)
    if (!result.ok) throw result.error
    return result.value.evidence
  }

  /** @param request - update evidence request. */
  async updateEvidence(request: UpdateEvidenceRequest): Promise<Evidence> {
    const result = await this.remote.updateEvidence(request)
    if (!result.ok) {
      this.commandError = result.error
      throw result.error
    }
    this.commandError = null
    mergeItem(this.evidenceStore, result.value.evidence)
    return result.value.evidence
  }

  /** @param request - archive evidence request. */
  async archiveEvidence(request: ArchiveEvidenceRequest): Promise<Evidence> {
    const result = await this.remote.archiveEvidence(request)
    if (!result.ok) {
      this.commandError = result.error
      throw result.error
    }
    this.commandError = null
    mergeItem(this.evidenceStore, result.value.evidence)
    return result.value.evidence
  }

  /** @param request - review evidence request. */
  async reviewEvidence(request: ReviewEvidenceRequest): Promise<Evidence> {
    const result = await this.remote.reviewEvidence(request)
    if (!result.ok) {
      this.commandError = result.error
      throw result.error
    }
    this.commandError = null
    mergeItem(this.evidenceStore, result.value.evidence)
    return result.value.evidence
  }

  /** Latest command failure retained for UI surfaces that read it separately. */
  getLastCommandError(): RemoteFailure | null {
    return this.commandError
  }

  private matchesTaskScope(projectId: ProjectId, taskId: ResearchTaskId): boolean {
    return this.scopedProjectId !== null
      && this.scopedTaskId !== null
      && String(this.scopedProjectId) === String(projectId)
      && String(this.scopedTaskId) === String(taskId)
  }
}

function applyListResult<T extends { id: string; updatedAt: string }>(
  store: ReturnType<typeof createSnapshotStore<ResearchListState<T>>>,
  result: RemoteResult<{ items: readonly T[] }>,
): void {
  if (!result.ok) {
    store.set({
      status: 'error',
      items: store.getSnapshot().items,
      error: result.error,
    })
    return
  }
  store.set({
    status: 'ready',
    items: [...result.value.items].sort(compareResearchUpdatedDesc),
    error: null,
  })
}

function mergeItem<T extends { id: string; updatedAt: string }>(
  store: ReturnType<typeof createSnapshotStore<ResearchListState<T>>>,
  item: T,
): void {
  const current = store.getSnapshot()
  const without = current.items.filter(existing => String(existing.id) !== String(item.id))
  store.set({
    status: 'ready',
    items: [...without, item].sort(compareResearchUpdatedDesc),
    error: null,
  })
}
