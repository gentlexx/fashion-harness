/**
 * Fashion Research Remote command projection onto the Host registry.
 * @module @gentlexx/dsh-api-fashion-research-controller/src/commands
 */

import type { Context } from '@deepseek-ai/cordis'
import { ProjectId } from '@gentlexx/dsh-fashion-project'
import {
  EvidenceId,
  FashionResearchAttachmentInvalidError,
  FashionResearchCrossProjectReferenceError,
  FashionResearchCrossTaskReferenceError,
  FashionResearchEvidenceNotFoundError,
  FashionResearchInvalidInputError,
  FashionResearchInvalidTransitionError,
  FashionResearchInvalidUrlError,
  FashionResearchProjectNotFoundError,
  FashionResearchProjectReadOnlyError,
  FashionResearchRevisionConflictError,
  FashionResearchSampleNotFoundError,
  FashionResearchSourceNotFoundError,
  FashionResearchTaskNotFoundError,
  FashionResearchUsageBoundaryDeniedError,
  ResearchTaskId,
  SampleId,
  SourceId,
  type Evidence,
  type ResearchTask,
  type Sample,
  type Source,
} from '@gentlexx/dsh-fashion-research'
import { RemoteError } from '@deepseek-ai/dsh-typert-protocol'
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

/** Maps registry operations onto serializable Remote values. */
export class FashionResearchCommands {
  /** @param ctx - Host context providing {@link Context.fashionResearchRegistry}. */
  constructor(private readonly ctx: Context) {}

  /** @param request - create task payload. */
  async createTask(request: CreateTaskRequest): Promise<TaskValue> {
    return this.runAsync(async () => ({
      task: taskView(await this.ctx.fashionResearchRegistry.createTask(definedProps({
        projectId: ProjectId(String(request.projectId)),
        title: request.title,
        note: request.note,
      }) as never)),
    }))
  }

  /** @param request - get task payload. */
  getTask(request: GetTaskRequest): TaskValue {
    return this.runSync(() => {
      const projectId = ProjectId(String(request.projectId))
      const taskId = ResearchTaskId(String(request.taskId))
      const task = this.requireTaskInProject(taskId, projectId)
      return { task: taskView(task) }
    })
  }

  /** @param request - list tasks payload. */
  listTasks(request: ListTasksRequest): TaskListValue {
    return this.runSync(() => ({
      items: this.ctx.fashionResearchRegistry
        .listTasks(ProjectId(String(request.projectId)))
        .map(taskView),
    }))
  }

  /** @param request - update task payload. */
  async updateTask(request: UpdateTaskRequest): Promise<TaskValue> {
    return this.runAsync(async () => {
      this.requireTaskInProject(
        ResearchTaskId(String(request.taskId)),
        ProjectId(String(request.projectId)),
      )
      return {
        task: taskView(await this.ctx.fashionResearchRegistry.updateTask(definedProps({
          taskId: ResearchTaskId(String(request.taskId)),
          expectedRevision: request.expectedRevision,
          title: request.title,
          note: request.note,
          status: request.status,
        }) as never)),
      }
    })
  }

  /** @param request - archive task payload. */
  async archiveTask(request: ArchiveTaskRequest): Promise<TaskValue> {
    return this.runAsync(async () => {
      this.requireTaskInProject(
        ResearchTaskId(String(request.taskId)),
        ProjectId(String(request.projectId)),
      )
      return {
        task: taskView(await this.ctx.fashionResearchRegistry.archiveTask({
          taskId: ResearchTaskId(String(request.taskId)),
          expectedRevision: request.expectedRevision,
        })),
      }
    })
  }

  /** @param request - create source payload. */
  async createSource(request: CreateSourceRequest): Promise<SourceValue> {
    return this.runAsync(async () => ({
      source: sourceView(await this.ctx.fashionResearchRegistry.createSource(definedProps({
        projectId: ProjectId(String(request.projectId)),
        taskId: ResearchTaskId(String(request.taskId)),
        locatorType: request.locatorType,
        url: request.url,
        attachmentRef: request.attachmentRef,
        title: request.title,
        publisherOrPlatform: request.publisherOrPlatform,
        sourceKind: request.sourceKind,
        publishedAt: request.publishedAt,
        captureMode: request.captureMode,
        usageBoundary: request.usageBoundary,
        externalProcessing: request.externalProcessing,
        availabilityStatus: request.availabilityStatus,
        attribution: request.attribution,
        contentFingerprint: request.contentFingerprint,
      }) as never)),
    }))
  }

  /** @param request - get source payload. */
  getSource(request: GetSourceRequest): SourceValue {
    return this.runSync(() => {
      const source = this.requireSourceInTask(
        SourceId(String(request.sourceId)),
        ProjectId(String(request.projectId)),
        ResearchTaskId(String(request.taskId)),
      )
      return { source: sourceView(source) }
    })
  }

  /** @param request - list sources payload. */
  listSources(request: ListSourcesRequest): SourceListValue {
    return this.runSync(() => ({
      items: this.ctx.fashionResearchRegistry.listSources(
        ProjectId(String(request.projectId)),
        ResearchTaskId(String(request.taskId)),
      ).map(sourceView),
    }))
  }

  /** @param request - update source payload. */
  async updateSource(request: UpdateSourceRequest): Promise<SourceValue> {
    return this.runAsync(async () => {
      this.requireSourceInTask(
        SourceId(String(request.sourceId)),
        ProjectId(String(request.projectId)),
        ResearchTaskId(String(request.taskId)),
      )
      return {
        source: sourceView(await this.ctx.fashionResearchRegistry.updateSource(definedProps({
          sourceId: SourceId(String(request.sourceId)),
          expectedRevision: request.expectedRevision,
          title: request.title,
          publisherOrPlatform: request.publisherOrPlatform,
          availabilityStatus: request.availabilityStatus,
          attribution: request.attribution,
        }) as never)),
      }
    })
  }

  /** @param request - archive source payload. */
  async archiveSource(request: ArchiveSourceRequest): Promise<SourceValue> {
    return this.runAsync(async () => {
      this.requireSourceInTask(
        SourceId(String(request.sourceId)),
        ProjectId(String(request.projectId)),
        ResearchTaskId(String(request.taskId)),
      )
      return {
        source: sourceView(await this.ctx.fashionResearchRegistry.archiveSource({
          sourceId: SourceId(String(request.sourceId)),
          expectedRevision: request.expectedRevision,
        })),
      }
    })
  }

  /** @param request - create sample payload. */
  async createSample(request: CreateSampleRequest): Promise<SampleValue> {
    return this.runAsync(async () => ({
      sample: sampleView(await this.ctx.fashionResearchRegistry.createSample(definedProps({
        projectId: ProjectId(String(request.projectId)),
        taskId: ResearchTaskId(String(request.taskId)),
        sourceId: SourceId(String(request.sourceId)),
        label: request.label,
        externalItemId: request.externalItemId,
        locator: request.locator,
        rawFields: request.rawFields,
        screenshotRefs: request.screenshotRefs,
        note: request.note,
        status: request.status,
      }) as never)),
    }))
  }

  /** @param request - get sample payload. */
  getSample(request: GetSampleRequest): SampleValue {
    return this.runSync(() => {
      const sample = this.requireSampleInTask(
        SampleId(String(request.sampleId)),
        ProjectId(String(request.projectId)),
        ResearchTaskId(String(request.taskId)),
      )
      return { sample: sampleView(sample) }
    })
  }

  /** @param request - list samples payload. */
  listSamples(request: ListSamplesRequest): SampleListValue {
    return this.runSync(() => ({
      items: this.ctx.fashionResearchRegistry.listSamples(
        ProjectId(String(request.projectId)),
        ResearchTaskId(String(request.taskId)),
      ).map(sampleView),
    }))
  }

  /** @param request - update sample payload. */
  async updateSample(request: UpdateSampleRequest): Promise<SampleValue> {
    return this.runAsync(async () => {
      this.requireSampleInTask(
        SampleId(String(request.sampleId)),
        ProjectId(String(request.projectId)),
        ResearchTaskId(String(request.taskId)),
      )
      return {
        sample: sampleView(await this.ctx.fashionResearchRegistry.updateSample(definedProps({
          sampleId: SampleId(String(request.sampleId)),
          expectedRevision: request.expectedRevision,
          label: request.label,
          note: request.note,
          status: request.status,
          rawFields: request.rawFields,
        }) as never)),
      }
    })
  }

  /** @param request - archive sample payload. */
  async archiveSample(request: ArchiveSampleRequest): Promise<SampleValue> {
    return this.runAsync(async () => {
      this.requireSampleInTask(
        SampleId(String(request.sampleId)),
        ProjectId(String(request.projectId)),
        ResearchTaskId(String(request.taskId)),
      )
      return {
        sample: sampleView(await this.ctx.fashionResearchRegistry.archiveSample({
          sampleId: SampleId(String(request.sampleId)),
          expectedRevision: request.expectedRevision,
        })),
      }
    })
  }

  /** @param request - create evidence payload. */
  async createEvidence(request: CreateEvidenceRequest): Promise<EvidenceValue> {
    return this.runAsync(async () => ({
      evidence: evidenceView(await this.ctx.fashionResearchRegistry.createEvidence(definedProps({
        projectId: ProjectId(String(request.projectId)),
        taskId: ResearchTaskId(String(request.taskId)),
        subjectType: request.subjectType,
        subjectId: request.subjectType === 'source'
          ? SourceId(String(request.subjectId))
          : SampleId(String(request.subjectId)),
        excerpt: request.excerpt,
        observation: request.observation,
        claim: request.claim,
        claimType: request.claimType,
        evidenceGrade: request.evidenceGrade,
        method: request.method,
        limitations: request.limitations,
      }) as never)),
    }))
  }

  /** @param request - get evidence payload. */
  getEvidence(request: GetEvidenceRequest): EvidenceValue {
    return this.runSync(() => {
      const evidence = this.requireEvidenceInTask(
        EvidenceId(String(request.evidenceId)),
        ProjectId(String(request.projectId)),
        ResearchTaskId(String(request.taskId)),
      )
      return { evidence: evidenceView(evidence) }
    })
  }

  /** @param request - list evidence payload. */
  listEvidence(request: ListEvidenceRequest): EvidenceListValue {
    return this.runSync(() => ({
      items: this.ctx.fashionResearchRegistry.listEvidence(
        ProjectId(String(request.projectId)),
        ResearchTaskId(String(request.taskId)),
      ).map(evidenceView),
    }))
  }

  /** @param request - update evidence payload. */
  async updateEvidence(request: UpdateEvidenceRequest): Promise<EvidenceValue> {
    return this.runAsync(async () => {
      this.requireEvidenceInTask(
        EvidenceId(String(request.evidenceId)),
        ProjectId(String(request.projectId)),
        ResearchTaskId(String(request.taskId)),
      )
      return {
        evidence: evidenceView(await this.ctx.fashionResearchRegistry.updateEvidence(definedProps({
          evidenceId: EvidenceId(String(request.evidenceId)),
          expectedRevision: request.expectedRevision,
          excerpt: request.excerpt,
          observation: request.observation,
          claim: request.claim,
          claimType: request.claimType,
          evidenceGrade: request.evidenceGrade,
          method: request.method,
          limitations: request.limitations,
        }) as never)),
      }
    })
  }

  /** @param request - archive evidence payload. */
  async archiveEvidence(request: ArchiveEvidenceRequest): Promise<EvidenceValue> {
    return this.runAsync(async () => {
      this.requireEvidenceInTask(
        EvidenceId(String(request.evidenceId)),
        ProjectId(String(request.projectId)),
        ResearchTaskId(String(request.taskId)),
      )
      return {
        evidence: evidenceView(await this.ctx.fashionResearchRegistry.archiveEvidence({
          evidenceId: EvidenceId(String(request.evidenceId)),
          expectedRevision: request.expectedRevision,
        })),
      }
    })
  }

  /** @param request - human review payload. */
  async reviewEvidence(request: ReviewEvidenceRequest): Promise<EvidenceValue> {
    return this.runAsync(async () => {
      this.requireEvidenceInTask(
        EvidenceId(String(request.evidenceId)),
        ProjectId(String(request.projectId)),
        ResearchTaskId(String(request.taskId)),
      )
      return {
        evidence: evidenceView(await this.ctx.fashionResearchRegistry.reviewEvidence({
          evidenceId: EvidenceId(String(request.evidenceId)),
          expectedRevision: request.expectedRevision,
          reviewStatus: request.reviewStatus,
          reviewNote: request.reviewNote,
        })),
      }
    })
  }

  private requireTaskInProject(taskId: ResearchTaskId, projectId: ProjectId): ResearchTask {
    const task = this.ctx.fashionResearchRegistry.getTask(taskId)
    if (task === undefined) throw new FashionResearchTaskNotFoundError(taskId)
    if (task.projectId !== projectId) {
      throw new FashionResearchCrossProjectReferenceError(projectId, task.projectId)
    }
    return task
  }

  private requireSourceInTask(sourceId: SourceId, projectId: ProjectId, taskId: ResearchTaskId): Source {
    this.requireTaskInProject(taskId, projectId)
    const source = this.ctx.fashionResearchRegistry.getSource(sourceId)
    if (source === undefined) throw new FashionResearchSourceNotFoundError(sourceId)
    if (source.projectId !== projectId) {
      throw new FashionResearchCrossProjectReferenceError(projectId, source.projectId)
    }
    if (source.taskId !== taskId) {
      throw new FashionResearchCrossTaskReferenceError(taskId, source.taskId)
    }
    return source
  }

  private requireSampleInTask(sampleId: SampleId, projectId: ProjectId, taskId: ResearchTaskId): Sample {
    this.requireTaskInProject(taskId, projectId)
    const sample = this.ctx.fashionResearchRegistry.getSample(sampleId)
    if (sample === undefined) throw new FashionResearchSampleNotFoundError(sampleId)
    if (sample.projectId !== projectId) {
      throw new FashionResearchCrossProjectReferenceError(projectId, sample.projectId)
    }
    if (sample.taskId !== taskId) {
      throw new FashionResearchCrossTaskReferenceError(taskId, sample.taskId)
    }
    return sample
  }

  private requireEvidenceInTask(evidenceId: EvidenceId, projectId: ProjectId, taskId: ResearchTaskId): Evidence {
    this.requireTaskInProject(taskId, projectId)
    const evidence = this.ctx.fashionResearchRegistry.getEvidence(evidenceId)
    if (evidence === undefined) throw new FashionResearchEvidenceNotFoundError(evidenceId)
    if (evidence.projectId !== projectId) {
      throw new FashionResearchCrossProjectReferenceError(projectId, evidence.projectId)
    }
    if (evidence.taskId !== taskId) {
      throw new FashionResearchCrossTaskReferenceError(taskId, evidence.taskId)
    }
    return evidence
  }

  private async runAsync<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      mapResearchError(error)
    }
  }

  private runSync<T>(fn: () => T): T {
    try {
      return fn()
    } catch (error) {
      mapResearchError(error)
    }
  }
}

/** Drop keys whose value is `undefined` for exactOptionalPropertyTypes call sites. */
function definedProps(input: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) out[key] = value
  }
  return out
}

function mapResearchError(error: unknown): never {
  if (error instanceof FashionResearchProjectNotFoundError) {
    throw new RemoteError('fashion-research/project-not-found', error.message, { projectId: error.projectId })
  }
  if (error instanceof FashionResearchTaskNotFoundError) {
    throw new RemoteError('fashion-research/task-not-found', error.message, { taskId: error.taskId })
  }
  if (error instanceof FashionResearchSourceNotFoundError) {
    throw new RemoteError('fashion-research/source-not-found', error.message, { sourceId: error.sourceId })
  }
  if (error instanceof FashionResearchSampleNotFoundError) {
    throw new RemoteError('fashion-research/sample-not-found', error.message, { sampleId: error.sampleId })
  }
  if (error instanceof FashionResearchEvidenceNotFoundError) {
    throw new RemoteError('fashion-research/evidence-not-found', error.message, { evidenceId: error.evidenceId })
  }
  if (error instanceof FashionResearchProjectReadOnlyError) {
    throw new RemoteError('fashion-research/project-read-only', error.message, { projectId: error.projectId })
  }
  if (error instanceof FashionResearchCrossProjectReferenceError) {
    throw new RemoteError('fashion-research/cross-project-reference', error.message, {
      projectId: error.projectId,
      otherProjectId: error.otherProjectId,
    })
  }
  if (error instanceof FashionResearchCrossTaskReferenceError) {
    throw new RemoteError('fashion-research/cross-task-reference', error.message, {
      taskId: error.taskId,
      otherTaskId: error.otherTaskId,
    })
  }
  if (error instanceof FashionResearchInvalidUrlError) {
    throw new RemoteError('fashion-research/invalid-url', error.message, { url: error.url })
  }
  if (error instanceof FashionResearchInvalidInputError) {
    throw new RemoteError('fashion-research/invalid-input', error.message, { reason: error.reason })
  }
  if (error instanceof FashionResearchInvalidTransitionError) {
    throw new RemoteError('fashion-research/invalid-transition', error.message, { reason: error.reason })
  }
  if (error instanceof FashionResearchRevisionConflictError) {
    throw new RemoteError('fashion-research/revision-conflict', error.message, {
      id: error.id,
      expectedRevision: error.expectedRevision,
      actualRevision: error.actualRevision,
    })
  }
  if (error instanceof FashionResearchAttachmentInvalidError) {
    throw new RemoteError('fashion-research/attachment-invalid', error.message, { reason: error.reason })
  }
  if (error instanceof FashionResearchUsageBoundaryDeniedError) {
    throw new RemoteError('fashion-research/usage-boundary-denied', error.message, { reason: error.reason })
  }
  throw error
}

function taskView(task: ResearchTask): ResearchTask {
  return { ...task }
}

function sourceView(source: Source): Source {
  return { ...source }
}

function sampleView(sample: Sample): Sample {
  return { ...sample }
}

function evidenceView(evidence: Evidence): Evidence {
  return { ...evidence }
}
