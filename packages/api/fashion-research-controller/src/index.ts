/**
 * Host Fashion Research Remote owner.
 * @module @gentlexx/dsh-api-fashion-research-controller
 */

import { Context } from '@deepseek-ai/cordis'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { FashionResearchCommands } from './commands.ts'
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
} from './types.ts'

export type * from './types.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Host Fashion Research business API and Remote namespace owner. */
    fashionResearchController: FashionResearchController
  }
}

/** Host service backing the generated `ctx.remote.fashionResearch` namespace. */
export class FashionResearchController extends TypertRemoteService {
  static inject = ['typert', 'fashionResearchRegistry']

  private readonly commands: FashionResearchCommands

  /** @param ctx - Host context containing the Fashion Research registry. */
  constructor(ctx: Context) {
    super(ctx, 'fashionResearchController', { namespace: 'fashionResearch' })
    this.commands = new FashionResearchCommands(ctx)
  }

  /** @param request - create task payload. */
  @Remote('createTask')
  createTask(request: CreateTaskRequest): Promise<TaskValue> {
    return this.commands.createTask(request)
  }

  /** @param request - get task payload. */
  @Remote('getTask')
  getTask(request: GetTaskRequest): TaskValue {
    return this.commands.getTask(request)
  }

  /** @param request - list tasks payload. */
  @Remote('listTasks')
  listTasks(request: ListTasksRequest): TaskListValue {
    return this.commands.listTasks(request)
  }

  /** @param request - update task payload. */
  @Remote('updateTask')
  updateTask(request: UpdateTaskRequest): Promise<TaskValue> {
    return this.commands.updateTask(request)
  }

  /** @param request - archive task payload. */
  @Remote('archiveTask')
  archiveTask(request: ArchiveTaskRequest): Promise<TaskValue> {
    return this.commands.archiveTask(request)
  }

  /** @param request - create source payload. */
  @Remote('createSource')
  createSource(request: CreateSourceRequest): Promise<SourceValue> {
    return this.commands.createSource(request)
  }

  /** @param request - get source payload. */
  @Remote('getSource')
  getSource(request: GetSourceRequest): SourceValue {
    return this.commands.getSource(request)
  }

  /** @param request - list sources payload. */
  @Remote('listSources')
  listSources(request: ListSourcesRequest): SourceListValue {
    return this.commands.listSources(request)
  }

  /** @param request - update source payload. */
  @Remote('updateSource')
  updateSource(request: UpdateSourceRequest): Promise<SourceValue> {
    return this.commands.updateSource(request)
  }

  /** @param request - archive source payload. */
  @Remote('archiveSource')
  archiveSource(request: ArchiveSourceRequest): Promise<SourceValue> {
    return this.commands.archiveSource(request)
  }

  /** @param request - create sample payload. */
  @Remote('createSample')
  createSample(request: CreateSampleRequest): Promise<SampleValue> {
    return this.commands.createSample(request)
  }

  /** @param request - get sample payload. */
  @Remote('getSample')
  getSample(request: GetSampleRequest): SampleValue {
    return this.commands.getSample(request)
  }

  /** @param request - list samples payload. */
  @Remote('listSamples')
  listSamples(request: ListSamplesRequest): SampleListValue {
    return this.commands.listSamples(request)
  }

  /** @param request - update sample payload. */
  @Remote('updateSample')
  updateSample(request: UpdateSampleRequest): Promise<SampleValue> {
    return this.commands.updateSample(request)
  }

  /** @param request - archive sample payload. */
  @Remote('archiveSample')
  archiveSample(request: ArchiveSampleRequest): Promise<SampleValue> {
    return this.commands.archiveSample(request)
  }

  /** @param request - create evidence payload. */
  @Remote('createEvidence')
  createEvidence(request: CreateEvidenceRequest): Promise<EvidenceValue> {
    return this.commands.createEvidence(request)
  }

  /** @param request - get evidence payload. */
  @Remote('getEvidence')
  getEvidence(request: GetEvidenceRequest): EvidenceValue {
    return this.commands.getEvidence(request)
  }

  /** @param request - list evidence payload. */
  @Remote('listEvidence')
  listEvidence(request: ListEvidenceRequest): EvidenceListValue {
    return this.commands.listEvidence(request)
  }

  /** @param request - update evidence payload. */
  @Remote('updateEvidence')
  updateEvidence(request: UpdateEvidenceRequest): Promise<EvidenceValue> {
    return this.commands.updateEvidence(request)
  }

  /** @param request - archive evidence payload. */
  @Remote('archiveEvidence')
  archiveEvidence(request: ArchiveEvidenceRequest): Promise<EvidenceValue> {
    return this.commands.archiveEvidence(request)
  }

  /** @param request - human review payload. */
  @Remote('reviewEvidence')
  reviewEvidence(request: ReviewEvidenceRequest): Promise<EvidenceValue> {
    return this.commands.reviewEvidence(request)
  }
}

export default FashionResearchController
