/**
 * Client Fashion Research service face (`ctx.fashionResearch`).
 * @module @gentlexx/dsh-api-fashion-research-controller/src/client/service
 */

import { Service, type Context } from '@deepseek-ai/cordis'
import type { ProjectId } from '@gentlexx/dsh-fashion-project/types'
import type {
  Evidence,
  ResearchTask,
  ResearchTaskId,
  Sample,
  Source,
} from '@gentlexx/dsh-fashion-research/types'
import type { ObservableSnapshot } from '@deepseek-ai/dsh-client-store'
import type { RemoteFailure } from '@deepseek-ai/dsh-typert-protocol'
import type {
  ArchiveEvidenceRequest,
  ArchiveSampleRequest,
  ArchiveSourceRequest,
  ArchiveTaskRequest,
  CreateEvidenceRequest,
  CreateSampleRequest,
  CreateSourceRequest,
  CreateTaskRequest,
  GetEvidenceRequest,
  GetSampleRequest,
  GetSourceRequest,
  GetTaskRequest,
  ReviewEvidenceRequest,
  UpdateEvidenceRequest,
  UpdateSampleRequest,
  UpdateSourceRequest,
  UpdateTaskRequest,
} from '../types.ts'
import type { ClientFashionResearchModel, ResearchListState } from './model.ts'

/** Structured command failure for callers that distinguish Host business errors. */
export class FashionResearchCommandError extends Error {
  override readonly name = 'FashionResearchCommandError'

  /** @param rpcError - Host business or folded carrier failure. */
  constructor(readonly rpcError: RemoteFailure) {
    super(`fashion research command failed: ${rpcError.code}: ${rpcError.message}`)
  }
}

/** Browser Fashion Research service. */
export interface FashionResearchClient {
  readonly tasks: ObservableSnapshot<ResearchListState<ResearchTask>>
  readonly sources: ObservableSnapshot<ResearchListState<Source>>
  readonly samples: ObservableSnapshot<ResearchListState<Sample>>
  readonly evidence: ObservableSnapshot<ResearchListState<Evidence>>
  loadTasks(projectId: ProjectId): Promise<void>
  loadTaskChildren(projectId: ProjectId, taskId: ResearchTaskId): Promise<void>
  createTask(request: CreateTaskRequest): Promise<ResearchTask>
  getTask(request: GetTaskRequest): Promise<ResearchTask>
  updateTask(request: UpdateTaskRequest): Promise<ResearchTask>
  archiveTask(request: ArchiveTaskRequest): Promise<ResearchTask>
  createSource(request: CreateSourceRequest): Promise<Source>
  getSource(request: GetSourceRequest): Promise<Source>
  updateSource(request: UpdateSourceRequest): Promise<Source>
  archiveSource(request: ArchiveSourceRequest): Promise<Source>
  createSample(request: CreateSampleRequest): Promise<Sample>
  getSample(request: GetSampleRequest): Promise<Sample>
  updateSample(request: UpdateSampleRequest): Promise<Sample>
  archiveSample(request: ArchiveSampleRequest): Promise<Sample>
  createEvidence(request: CreateEvidenceRequest): Promise<Evidence>
  getEvidence(request: GetEvidenceRequest): Promise<Evidence>
  updateEvidence(request: UpdateEvidenceRequest): Promise<Evidence>
  archiveEvidence(request: ArchiveEvidenceRequest): Promise<Evidence>
  reviewEvidence(request: ReviewEvidenceRequest): Promise<Evidence>
}

/** Owns the bare Fashion Research snapshots and commands. */
export class FashionResearchService extends Service implements FashionResearchClient {
  readonly tasks: ObservableSnapshot<ResearchListState<ResearchTask>>
  readonly sources: ObservableSnapshot<ResearchListState<Source>>
  readonly samples: ObservableSnapshot<ResearchListState<Sample>>
  readonly evidence: ObservableSnapshot<ResearchListState<Evidence>>

  /**
   * @param ctx - Client root Context.
   * @param model - Remote-backed Fashion Research state model.
   */
  constructor(ctx: Context, private readonly model: ClientFashionResearchModel) {
    super(ctx, 'fashionResearch')
    this.tasks = model.tasks
    this.sources = model.sources
    this.samples = model.samples
    this.evidence = model.evidence
  }

  loadTasks(projectId: ProjectId): Promise<void> {
    return this.model.loadTasks(projectId)
  }

  loadTaskChildren(projectId: ProjectId, taskId: ResearchTaskId): Promise<void> {
    return this.model.loadTaskChildren(projectId, taskId)
  }

  createTask(request: CreateTaskRequest): Promise<ResearchTask> {
    return this.wrap(() => this.model.createTask(request))
  }

  getTask(request: GetTaskRequest): Promise<ResearchTask> {
    return this.model.getTask(request)
  }

  updateTask(request: UpdateTaskRequest): Promise<ResearchTask> {
    return this.wrap(() => this.model.updateTask(request))
  }

  archiveTask(request: ArchiveTaskRequest): Promise<ResearchTask> {
    return this.wrap(() => this.model.archiveTask(request))
  }

  createSource(request: CreateSourceRequest): Promise<Source> {
    return this.wrap(() => this.model.createSource(request))
  }

  getSource(request: GetSourceRequest): Promise<Source> {
    return this.model.getSource(request)
  }

  updateSource(request: UpdateSourceRequest): Promise<Source> {
    return this.wrap(() => this.model.updateSource(request))
  }

  archiveSource(request: ArchiveSourceRequest): Promise<Source> {
    return this.wrap(() => this.model.archiveSource(request))
  }

  createSample(request: CreateSampleRequest): Promise<Sample> {
    return this.wrap(() => this.model.createSample(request))
  }

  getSample(request: GetSampleRequest): Promise<Sample> {
    return this.model.getSample(request)
  }

  updateSample(request: UpdateSampleRequest): Promise<Sample> {
    return this.wrap(() => this.model.updateSample(request))
  }

  archiveSample(request: ArchiveSampleRequest): Promise<Sample> {
    return this.wrap(() => this.model.archiveSample(request))
  }

  createEvidence(request: CreateEvidenceRequest): Promise<Evidence> {
    return this.wrap(() => this.model.createEvidence(request))
  }

  getEvidence(request: GetEvidenceRequest): Promise<Evidence> {
    return this.model.getEvidence(request)
  }

  updateEvidence(request: UpdateEvidenceRequest): Promise<Evidence> {
    return this.wrap(() => this.model.updateEvidence(request))
  }

  archiveEvidence(request: ArchiveEvidenceRequest): Promise<Evidence> {
    return this.wrap(() => this.model.archiveEvidence(request))
  }

  reviewEvidence(request: ReviewEvidenceRequest): Promise<Evidence> {
    return this.wrap(() => this.model.reviewEvidence(request))
  }

  private async wrap<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      if (isRemoteFailure(error)) throw new FashionResearchCommandError(error)
      throw error
    }
  }
}

function isRemoteFailure(error: unknown): error is RemoteFailure {
  return typeof error === 'object'
    && error !== null
    && 'code' in error
    && 'message' in error
}
