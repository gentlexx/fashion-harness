/**
 * Fashion Research registry (`ctx.fashionResearchRegistry`): ResearchTask /
 * Source / Sample / Evidence over Storage Domain `fashion_research@0`.
 * @module @gentlexx/dsh-fashion-research/src/registry
 */

import { randomUUID } from 'node:crypto'
import { Context, Service } from '@deepseek-ai/cordis'
import type { ProjectId } from '@gentlexx/dsh-fashion-project/types'
import { R0_PROJECT_ID } from '@gentlexx/dsh-fashion-project'
import type { KvTable } from '@deepseek-ai/dsh-storage-domain'
import {
  FashionResearchAttachmentInvalidError,
  FashionResearchCrossProjectReferenceError,
  FashionResearchCrossTaskReferenceError,
  FashionResearchEvidenceNotFoundError,
  FashionResearchIdCollisionError,
  FashionResearchInvalidInputError,
  FashionResearchInvalidTransitionError,
  FashionResearchProjectNotFoundError,
  FashionResearchProjectReadOnlyError,
  FashionResearchRevisionConflictError,
  FashionResearchSampleNotFoundError,
  FashionResearchSeedConflictError,
  FashionResearchSourceNotFoundError,
  FashionResearchTaskNotFoundError,
} from './errors.ts'
import {
  AttachmentRef as brandAttachmentRef,
  EvidenceId as brandEvidenceId,
  ResearchTaskId as brandResearchTaskId,
  SampleId as brandSampleId,
  SourceId as brandSourceId,
} from './ids.ts'
import { compareResearchUpdatedDesc } from './order.ts'
import type { EvidenceRecordV0 } from './schema/v0/evidence.ts'
import type { ResearchTaskRecordV0 } from './schema/v0/research-task.ts'
import type { SampleRecordV0 } from './schema/v0/sample.ts'
import type { SourceRecordV0 } from './schema/v0/source.ts'
import {
  isValidR0ChildSeed,
  isValidR0TaskSeed,
  R0_EVIDENCE_SEEDS,
  R0_SOURCE_SEEDS,
  R0_TASK_ID,
  R0_TASK_RECORD,
} from './seed/r0-utility-jacket.ts'
import { fashionResearchDomainSpec } from './spec.ts'
import type {
  ActorRef,
  AvailabilityStatus,
  CaptureMode,
  ClaimType,
  Evidence,
  EvidenceGrade,
  EvidenceId,
  EvidenceReviewStatus,
  EvidenceSubjectType,
  ExternalProcessing,
  RawField,
  ResearchTask,
  ResearchTaskId,
  ResearchTaskStatus,
  Sample,
  SampleId,
  SampleStatus,
  Source,
  SourceId,
  SourceKind,
  SourceLocatorType,
  UsageBoundary,
} from './types.ts'
import { FASHION_RESEARCH_SCHEMA_VERSION } from './types.ts'
import { normalizeSourceUrl } from './url.ts'

/** Maximum admitted ResearchTask title length after trim. */
export const RESEARCH_TASK_TITLE_MAX_LENGTH = 120

/** Maximum admitted ResearchTask note length. */
export const RESEARCH_TASK_NOTE_MAX_LENGTH = 2000

declare module '@deepseek-ai/cordis' {
  interface Context {
    fashionResearchRegistry: FashionResearchRegistry
  }
}

/**
 * Normalize and validate a research task title at the Host create/update boundary.
 * @param title - Raw caller title.
 * @returns trimmed title.
 */
export function normalizeResearchTaskTitle(title: string): string {
  const trimmed = title.trim()
  if (trimmed.length < 1 || trimmed.length > RESEARCH_TASK_TITLE_MAX_LENGTH) {
    throw new FashionResearchInvalidInputError('invalid-task-title')
  }
  return trimmed
}

/**
 * Normalize an optional note field.
 * @param note - Raw note or null/undefined.
 * @returns trimmed note or null.
 */
export function normalizeOptionalNote(note: string | null | undefined, max: number): string | null {
  if (note === undefined || note === null) return null
  const trimmed = note.trim()
  if (trimmed.length === 0) return null
  if (trimmed.length > max) throw new FashionResearchInvalidInputError('note-too-long')
  return trimmed
}

function toTask(id: ResearchTaskId, record: ResearchTaskRecordV0): ResearchTask {
  return {
    id,
    projectId: record.projectId as ProjectId,
    title: record.title,
    note: record.note,
    status: record.status,
    origin: record.origin,
    accessMode: record.accessMode,
    revision: record.revision,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    createdBy: record.createdBy,
    updatedBy: record.updatedBy,
    schemaVersion: record.schemaVersion,
    archivedAt: record.archivedAt,
  }
}

function toSource(id: SourceId, record: SourceRecordV0): Source {
  return {
    id,
    projectId: record.projectId as ProjectId,
    taskId: record.taskId as ResearchTaskId,
    locatorType: record.locatorType,
    url: record.url,
    urlNormalized: record.urlNormalized,
    attachmentRef: record.attachmentRef === null ? null : brandAttachmentRef(record.attachmentRef),
    title: record.title,
    publisherOrPlatform: record.publisherOrPlatform,
    sourceKind: record.sourceKind,
    accessedAt: record.accessedAt,
    publishedAt: record.publishedAt,
    captureMode: record.captureMode,
    usageBoundary: record.usageBoundary,
    externalProcessing: record.externalProcessing,
    availabilityStatus: record.availabilityStatus,
    attribution: record.attribution,
    contentFingerprint: record.contentFingerprint,
    origin: record.origin,
    accessMode: record.accessMode,
    revision: record.revision,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    createdBy: record.createdBy,
    updatedBy: record.updatedBy,
    schemaVersion: record.schemaVersion,
    archivedAt: record.archivedAt,
  }
}

function toSample(id: SampleId, record: SampleRecordV0): Sample {
  return {
    id,
    projectId: record.projectId as ProjectId,
    taskId: record.taskId as ResearchTaskId,
    sourceId: record.sourceId as SourceId,
    label: record.label,
    externalItemId: record.externalItemId,
    locator: record.locator,
    observedAt: record.observedAt,
    rawFields: record.rawFields.map((field): RawField => (
      field.unit === undefined
        ? { name: field.name, value: field.value }
        : { name: field.name, value: field.value, unit: field.unit }
    )),
    screenshotRefs: record.screenshotRefs.map(brandAttachmentRef),
    note: record.note,
    status: record.status,
    origin: record.origin,
    accessMode: record.accessMode,
    revision: record.revision,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    createdBy: record.createdBy,
    updatedBy: record.updatedBy,
    schemaVersion: record.schemaVersion,
    archivedAt: record.archivedAt,
  }
}

function toEvidence(id: EvidenceId, record: EvidenceRecordV0): Evidence {
  return {
    id,
    projectId: record.projectId as ProjectId,
    taskId: record.taskId as ResearchTaskId,
    subjectType: record.subjectType,
    subjectId: record.subjectId as SourceId | SampleId,
    excerpt: record.excerpt,
    observation: record.observation,
    claim: record.claim,
    claimType: record.claimType,
    evidenceGrade: record.evidenceGrade,
    method: record.method,
    limitations: record.limitations,
    reviewStatus: record.reviewStatus,
    reviewedBy: record.reviewedBy,
    reviewedAt: record.reviewedAt,
    reviewNote: record.reviewNote,
    origin: record.origin,
    accessMode: record.accessMode,
    revision: record.revision,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    createdBy: record.createdBy,
    updatedBy: record.updatedBy,
    schemaVersion: record.schemaVersion,
    archivedAt: record.archivedAt,
  }
}

function mintId<T extends string>(
  brand: (id: string) => T,
  occupied: (id: T) => boolean,
): T {
  let id = brand(randomUUID())
  if (!occupied(id)) return id
  id = brand(randomUUID())
  if (occupied(id)) throw new FashionResearchIdCollisionError(String(id))
  return id
}

function assertHumanReviewer(actor: ActorRef): void {
  if (actor !== 'local-human') {
    throw new FashionResearchInvalidTransitionError('reviewer-must-be-human')
  }
}

/**
 * Durable Fashion Research registry.
 * Opens `fashion_research@0`, seeds R0 research once, and exposes CRUD/archive/review.
 */
export class FashionResearchRegistry extends Service {
  static inject = ['storageDomain', 'fashionProjectRegistry']

  private tasks?: KvTable<ResearchTaskId, ResearchTaskRecordV0>
  private sources?: KvTable<SourceId, SourceRecordV0>
  private samples?: KvTable<SampleId, SampleRecordV0>
  private evidence?: KvTable<EvidenceId, EvidenceRecordV0>

  /** @param ctx - Host context providing storageDomain and fashionProjectRegistry. */
  constructor(ctx: Context) {
    super(ctx, 'fashionResearchRegistry')
  }

  /** Open the domain, ensure R0 research seed, and register the close disposer. */
  protected async [Service.init](): Promise<void> {
    const domain = await this.ctx.storageDomain.open(fashionResearchDomainSpec)
    this.ctx.effect(() => () => domain.close(), 'fashionResearch.domainClose')
    this.tasks = domain.table('research_tasks')
    this.sources = domain.table('sources')
    this.samples = domain.table('samples')
    this.evidence = domain.table('evidence')
    await this.ensureR0Seed()
  }

  /**
   * Create a ResearchTask under an editable Project.
   * @param input - Project identity, title, and optional note.
   * @returns the durable projection after the write commits.
   */
  async createTask(input: {
    projectId: ProjectId
    title: string
    note?: string | null
    actor?: ActorRef
  }): Promise<ResearchTask> {
    const actor = input.actor ?? 'local-human'
    this.requireEditableProject(input.projectId)
    const title = normalizeResearchTaskTitle(input.title)
    const note = normalizeOptionalNote(input.note, RESEARCH_TASK_NOTE_MAX_LENGTH)
    const now = new Date().toISOString()
    const table = this.requireTasks()
    const id = mintId(brandResearchTaskId, candidate => table.get(candidate) !== undefined)
    const record: ResearchTaskRecordV0 = {
      projectId: String(input.projectId),
      title,
      note,
      status: 'draft',
      origin: 'human',
      accessMode: 'editable',
      revision: 0,
      createdAt: now,
      updatedAt: now,
      createdBy: actor,
      updatedBy: actor,
      schemaVersion: FASHION_RESEARCH_SCHEMA_VERSION,
      archivedAt: null,
    }
    await table.put(id, record)
    return toTask(id, record)
  }

  /**
   * Read one ResearchTask.
   * @param id - Task identity.
   */
  getTask(id: ResearchTaskId): ResearchTask | undefined {
    const record = this.requireTasks().get(id)
    return record === undefined ? undefined : toTask(id, record)
  }

  /**
   * List ResearchTasks for a Project in Host-stable order.
   * @param projectId - Owning project.
   */
  listTasks(projectId: ProjectId): readonly ResearchTask[] {
    this.requireProject(projectId)
    const items: ResearchTask[] = []
    for (const [id, record] of this.requireTasks().entries()) {
      if (record.projectId !== String(projectId)) continue
      items.push(toTask(id, record))
    }
    items.sort(compareResearchUpdatedDesc)
    return items
  }

  /**
   * Update a ResearchTask with optimistic concurrency.
   * @param input - Identity, expectedRevision, and patch fields.
   */
  async updateTask(input: {
    taskId: ResearchTaskId
    expectedRevision: number
    title?: string
    note?: string | null
    status?: ResearchTaskStatus
    actor?: ActorRef
  }): Promise<ResearchTask> {
    const actor = input.actor ?? 'local-human'
    const table = this.requireTasks()
    const existing = table.get(input.taskId)
    if (existing === undefined) throw new FashionResearchTaskNotFoundError(input.taskId)
    this.requireEditableProject(existing.projectId as ProjectId)
    this.assertWritableObject(existing)
    if (existing.revision !== input.expectedRevision) {
      throw new FashionResearchRevisionConflictError(
        String(input.taskId),
        input.expectedRevision,
        existing.revision,
      )
    }
    const now = new Date().toISOString()
    const record: ResearchTaskRecordV0 = {
      ...existing,
      title: input.title !== undefined ? normalizeResearchTaskTitle(input.title) : existing.title,
      note: input.note !== undefined
        ? normalizeOptionalNote(input.note, RESEARCH_TASK_NOTE_MAX_LENGTH)
        : existing.note,
      status: input.status ?? existing.status,
      revision: existing.revision + 1,
      updatedAt: now,
      updatedBy: actor,
    }
    await table.put(input.taskId, record)
    return toTask(input.taskId, record)
  }

  /**
   * Archive a ResearchTask (soft); v0 has no hard delete.
   * @param input - Identity and expectedRevision.
   */
  async archiveTask(input: {
    taskId: ResearchTaskId
    expectedRevision: number
    actor?: ActorRef
  }): Promise<ResearchTask> {
    const actor = input.actor ?? 'local-human'
    const table = this.requireTasks()
    const existing = table.get(input.taskId)
    if (existing === undefined) throw new FashionResearchTaskNotFoundError(input.taskId)
    this.requireEditableProject(existing.projectId as ProjectId)
    this.assertWritableObject(existing)
    if (existing.revision !== input.expectedRevision) {
      throw new FashionResearchRevisionConflictError(
        String(input.taskId),
        input.expectedRevision,
        existing.revision,
      )
    }
    const now = new Date().toISOString()
    const record: ResearchTaskRecordV0 = {
      ...existing,
      status: 'archived',
      archivedAt: now,
      accessMode: 'read-only',
      revision: existing.revision + 1,
      updatedAt: now,
      updatedBy: actor,
    }
    await table.put(input.taskId, record)
    return toTask(input.taskId, record)
  }

  /**
   * Create a Source under a ResearchTask.
   * @param input - Parent chain plus locator fields.
   */
  async createSource(input: {
    projectId: ProjectId
    taskId: ResearchTaskId
    locatorType: SourceLocatorType
    url?: string
    attachmentRef?: string
    title: string
    publisherOrPlatform?: string | null
    sourceKind: SourceKind
    publishedAt?: string | null
    captureMode: CaptureMode
    usageBoundary: UsageBoundary
    externalProcessing: ExternalProcessing
    availabilityStatus?: AvailabilityStatus
    attribution: string
    contentFingerprint?: string | null
    actor?: ActorRef
  }): Promise<Source> {
    const actor = input.actor ?? 'local-human'
    const task = this.requireTaskInProject(input.taskId, input.projectId)
    this.requireEditableProject(input.projectId)
    this.assertWritableObject(task)
    const title = input.title.trim()
    if (title.length < 1 || title.length > 200) {
      throw new FashionResearchInvalidInputError('invalid-source-title')
    }
    const attribution = input.attribution.trim()
    if (attribution.length < 1 || attribution.length > 500) {
      throw new FashionResearchInvalidInputError('invalid-attribution')
    }
    let url: string | null = null
    let urlNormalized: string | null = null
    let attachmentRef: string | null = null
    if (input.locatorType === 'url') {
      if (input.url === undefined) throw new FashionResearchInvalidInputError('url-required')
      const normalized = normalizeSourceUrl(input.url)
      url = normalized.original
      urlNormalized = normalized.normalized
    } else {
      if (input.attachmentRef === undefined || input.attachmentRef.trim().length < 1) {
        throw new FashionResearchAttachmentInvalidError('attachment-ref-required')
      }
      if (input.attachmentRef.includes('/') || input.attachmentRef.includes('\\') || input.attachmentRef.includes(':')) {
        throw new FashionResearchAttachmentInvalidError('attachment-ref-must-be-opaque')
      }
      attachmentRef = input.attachmentRef.trim()
    }
    const now = new Date().toISOString()
    const table = this.requireSources()
    const id = mintId(brandSourceId, candidate => table.get(candidate) !== undefined)
    const record: SourceRecordV0 = {
      projectId: String(input.projectId),
      taskId: String(input.taskId),
      locatorType: input.locatorType,
      url,
      urlNormalized,
      attachmentRef,
      title,
      publisherOrPlatform: normalizeOptionalNote(input.publisherOrPlatform, 200),
      sourceKind: input.sourceKind,
      accessedAt: now,
      publishedAt: input.publishedAt ?? null,
      captureMode: input.captureMode,
      usageBoundary: input.usageBoundary,
      externalProcessing: input.externalProcessing,
      availabilityStatus: input.availabilityStatus ?? 'available',
      attribution,
      contentFingerprint: input.contentFingerprint ?? null,
      origin: 'human',
      accessMode: 'editable',
      revision: 0,
      createdAt: now,
      updatedAt: now,
      createdBy: actor,
      updatedBy: actor,
      schemaVersion: FASHION_RESEARCH_SCHEMA_VERSION,
      archivedAt: null,
    }
    await table.put(id, record)
    return toSource(id, record)
  }

  /** @param id - Source identity. */
  getSource(id: SourceId): Source | undefined {
    const record = this.requireSources().get(id)
    return record === undefined ? undefined : toSource(id, record)
  }

  /**
   * List Sources for a task.
   * @param projectId - Owning project.
   * @param taskId - Owning task.
   */
  listSources(projectId: ProjectId, taskId: ResearchTaskId): readonly Source[] {
    this.requireTaskInProject(taskId, projectId)
    const items: Source[] = []
    for (const [id, record] of this.requireSources().entries()) {
      if (record.projectId !== String(projectId) || record.taskId !== String(taskId)) continue
      items.push(toSource(id, record))
    }
    items.sort(compareResearchUpdatedDesc)
    return items
  }

  /**
   * Update a Source with optimistic concurrency.
   * @param input - Identity, expectedRevision, and patch fields.
   */
  async updateSource(input: {
    sourceId: SourceId
    expectedRevision: number
    title?: string
    publisherOrPlatform?: string | null
    availabilityStatus?: AvailabilityStatus
    attribution?: string
    actor?: ActorRef
  }): Promise<Source> {
    const actor = input.actor ?? 'local-human'
    const table = this.requireSources()
    const existing = table.get(input.sourceId)
    if (existing === undefined) throw new FashionResearchSourceNotFoundError(input.sourceId)
    this.requireEditableProject(existing.projectId as ProjectId)
    this.assertWritableObject(existing)
    if (existing.revision !== input.expectedRevision) {
      throw new FashionResearchRevisionConflictError(
        String(input.sourceId),
        input.expectedRevision,
        existing.revision,
      )
    }
    const title = input.title !== undefined ? input.title.trim() : existing.title
    if (title.length < 1 || title.length > 200) {
      throw new FashionResearchInvalidInputError('invalid-source-title')
    }
    const attribution = input.attribution !== undefined ? input.attribution.trim() : existing.attribution
    if (attribution.length < 1 || attribution.length > 500) {
      throw new FashionResearchInvalidInputError('invalid-attribution')
    }
    const now = new Date().toISOString()
    const record: SourceRecordV0 = {
      ...existing,
      title,
      publisherOrPlatform: input.publisherOrPlatform !== undefined
        ? normalizeOptionalNote(input.publisherOrPlatform, 200)
        : existing.publisherOrPlatform,
      availabilityStatus: input.availabilityStatus ?? existing.availabilityStatus,
      attribution,
      revision: existing.revision + 1,
      updatedAt: now,
      updatedBy: actor,
    }
    await table.put(input.sourceId, record)
    return toSource(input.sourceId, record)
  }

  /**
   * Soft-archive a Source.
   * @param input - Identity and expectedRevision.
   */
  async archiveSource(input: {
    sourceId: SourceId
    expectedRevision: number
    actor?: ActorRef
  }): Promise<Source> {
    const actor = input.actor ?? 'local-human'
    const table = this.requireSources()
    const existing = table.get(input.sourceId)
    if (existing === undefined) throw new FashionResearchSourceNotFoundError(input.sourceId)
    this.requireEditableProject(existing.projectId as ProjectId)
    this.assertWritableObject(existing)
    if (existing.revision !== input.expectedRevision) {
      throw new FashionResearchRevisionConflictError(
        String(input.sourceId),
        input.expectedRevision,
        existing.revision,
      )
    }
    const now = new Date().toISOString()
    const record: SourceRecordV0 = {
      ...existing,
      archivedAt: now,
      accessMode: 'read-only',
      availabilityStatus: existing.availabilityStatus === 'available'
        ? 'unavailable'
        : existing.availabilityStatus,
      revision: existing.revision + 1,
      updatedAt: now,
      updatedBy: actor,
    }
    await table.put(input.sourceId, record)
    return toSource(input.sourceId, record)
  }

  /**
   * Create a Sample under a Source.
   * @param input - Parent chain plus sample fields.
   */
  async createSample(input: {
    projectId: ProjectId
    taskId: ResearchTaskId
    sourceId: SourceId
    label: string
    externalItemId?: string | null
    locator?: string | null
    rawFields?: readonly RawField[]
    screenshotRefs?: readonly string[]
    note?: string | null
    status?: SampleStatus
    actor?: ActorRef
  }): Promise<Sample> {
    const actor = input.actor ?? 'local-human'
    this.requireTaskInProject(input.taskId, input.projectId)
    const source = this.requireSourceInTask(input.sourceId, input.projectId, input.taskId)
    this.requireEditableProject(input.projectId)
    this.assertWritableObject(source)
    const label = input.label.trim()
    if (label.length < 1 || label.length > 200) {
      throw new FashionResearchInvalidInputError('invalid-sample-label')
    }
    const screenshotRefs = (input.screenshotRefs ?? []).map((ref) => {
      if (ref.includes('/') || ref.includes('\\') || ref.includes(':')) {
        throw new FashionResearchAttachmentInvalidError('screenshot-ref-must-be-opaque')
      }
      return ref
    })
    const now = new Date().toISOString()
    const table = this.requireSamples()
    const id = mintId(brandSampleId, candidate => table.get(candidate) !== undefined)
    const record: SampleRecordV0 = {
      projectId: String(input.projectId),
      taskId: String(input.taskId),
      sourceId: String(input.sourceId),
      label,
      externalItemId: normalizeOptionalNote(input.externalItemId, 200),
      locator: normalizeOptionalNote(input.locator, 2000),
      observedAt: now,
      rawFields: [...(input.rawFields ?? [])],
      screenshotRefs,
      note: normalizeOptionalNote(input.note, 2000),
      status: input.status ?? 'draft',
      origin: 'human',
      accessMode: 'editable',
      revision: 0,
      createdAt: now,
      updatedAt: now,
      createdBy: actor,
      updatedBy: actor,
      schemaVersion: FASHION_RESEARCH_SCHEMA_VERSION,
      archivedAt: null,
    }
    await table.put(id, record)
    return toSample(id, record)
  }

  /** @param id - Sample identity. */
  getSample(id: SampleId): Sample | undefined {
    const record = this.requireSamples().get(id)
    return record === undefined ? undefined : toSample(id, record)
  }

  /**
   * List Samples for a task.
   * @param projectId - Owning project.
   * @param taskId - Owning task.
   */
  listSamples(projectId: ProjectId, taskId: ResearchTaskId): readonly Sample[] {
    this.requireTaskInProject(taskId, projectId)
    const items: Sample[] = []
    for (const [id, record] of this.requireSamples().entries()) {
      if (record.projectId !== String(projectId) || record.taskId !== String(taskId)) continue
      items.push(toSample(id, record))
    }
    items.sort(compareResearchUpdatedDesc)
    return items
  }

  /**
   * Update a Sample with optimistic concurrency.
   * @param input - Identity, expectedRevision, and patch fields.
   */
  async updateSample(input: {
    sampleId: SampleId
    expectedRevision: number
    label?: string
    note?: string | null
    status?: SampleStatus
    rawFields?: readonly RawField[]
    actor?: ActorRef
  }): Promise<Sample> {
    const actor = input.actor ?? 'local-human'
    const table = this.requireSamples()
    const existing = table.get(input.sampleId)
    if (existing === undefined) throw new FashionResearchSampleNotFoundError(input.sampleId)
    this.requireEditableProject(existing.projectId as ProjectId)
    this.assertWritableObject(existing)
    if (existing.revision !== input.expectedRevision) {
      throw new FashionResearchRevisionConflictError(
        String(input.sampleId),
        input.expectedRevision,
        existing.revision,
      )
    }
    const label = input.label !== undefined ? input.label.trim() : existing.label
    if (label.length < 1 || label.length > 200) {
      throw new FashionResearchInvalidInputError('invalid-sample-label')
    }
    const now = new Date().toISOString()
    const record: SampleRecordV0 = {
      ...existing,
      label,
      note: input.note !== undefined ? normalizeOptionalNote(input.note, 2000) : existing.note,
      status: input.status ?? existing.status,
      rawFields: input.rawFields !== undefined ? [...input.rawFields] : existing.rawFields,
      revision: existing.revision + 1,
      updatedAt: now,
      updatedBy: actor,
    }
    await table.put(input.sampleId, record)
    return toSample(input.sampleId, record)
  }

  /**
   * Soft-archive a Sample.
   * @param input - Identity and expectedRevision.
   */
  async archiveSample(input: {
    sampleId: SampleId
    expectedRevision: number
    actor?: ActorRef
  }): Promise<Sample> {
    const actor = input.actor ?? 'local-human'
    const table = this.requireSamples()
    const existing = table.get(input.sampleId)
    if (existing === undefined) throw new FashionResearchSampleNotFoundError(input.sampleId)
    this.requireEditableProject(existing.projectId as ProjectId)
    this.assertWritableObject(existing)
    if (existing.revision !== input.expectedRevision) {
      throw new FashionResearchRevisionConflictError(
        String(input.sampleId),
        input.expectedRevision,
        existing.revision,
      )
    }
    const now = new Date().toISOString()
    const record: SampleRecordV0 = {
      ...existing,
      status: 'archived',
      archivedAt: now,
      accessMode: 'read-only',
      revision: existing.revision + 1,
      updatedAt: now,
      updatedBy: actor,
    }
    await table.put(input.sampleId, record)
    return toSample(input.sampleId, record)
  }

  /**
   * Create Evidence under a Task, pointing at a Source or Sample in the same chain.
   * @param input - Parent chain plus evidence fields.
   */
  async createEvidence(input: {
    projectId: ProjectId
    taskId: ResearchTaskId
    subjectType: EvidenceSubjectType
    subjectId: SourceId | SampleId
    excerpt?: string | null
    observation: string
    claim?: string | null
    claimType?: ClaimType | null
    evidenceGrade: EvidenceGrade
    method?: string | null
    limitations?: readonly string[]
    actor?: ActorRef
  }): Promise<Evidence> {
    const actor = input.actor ?? 'local-human'
    this.requireTaskInProject(input.taskId, input.projectId)
    this.requireEditableProject(input.projectId)
    if (input.subjectType === 'source') {
      this.requireSourceInTask(input.subjectId as SourceId, input.projectId, input.taskId)
    } else {
      this.requireSampleInTask(input.subjectId as SampleId, input.projectId, input.taskId)
    }
    const observation = input.observation.trim()
    if (observation.length < 1 || observation.length > 2000) {
      throw new FashionResearchInvalidInputError('invalid-observation')
    }
    const claim = normalizeOptionalNote(input.claim, 2000)
    const claimType = input.claimType ?? null
    if (claim !== null && claimType === null) {
      throw new FashionResearchInvalidInputError('claim-requires-claimType')
    }
    if (claim === null && claimType !== null) {
      throw new FashionResearchInvalidInputError('claimType-requires-claim')
    }
    if (claimType === 'observed' && input.evidenceGrade === 'G0') {
      throw new FashionResearchInvalidInputError('observed-requires-g1-or-higher')
    }
    if (input.evidenceGrade === 'G4') {
      throw new FashionResearchInvalidInputError('g4-not-created-by-f2-01')
    }
    const method = normalizeOptionalNote(input.method, 2000)
    const limitations = [...(input.limitations ?? [])]
    if (claimType === 'derived') {
      if (method === null) throw new FashionResearchInvalidInputError('derived-requires-method')
      if (limitations.length < 1) throw new FashionResearchInvalidInputError('derived-requires-limitations')
    }
    const excerpt = normalizeOptionalNote(input.excerpt, 1000)
    const now = new Date().toISOString()
    const table = this.requireEvidence()
    const id = mintId(brandEvidenceId, candidate => table.get(candidate) !== undefined)
    const record: EvidenceRecordV0 = {
      projectId: String(input.projectId),
      taskId: String(input.taskId),
      subjectType: input.subjectType,
      subjectId: String(input.subjectId),
      excerpt,
      observation,
      claim,
      claimType,
      evidenceGrade: input.evidenceGrade,
      method,
      limitations,
      reviewStatus: 'draft',
      reviewedBy: null,
      reviewedAt: null,
      reviewNote: null,
      origin: 'human',
      accessMode: 'editable',
      revision: 0,
      createdAt: now,
      updatedAt: now,
      createdBy: actor,
      updatedBy: actor,
      schemaVersion: FASHION_RESEARCH_SCHEMA_VERSION,
      archivedAt: null,
    }
    await table.put(id, record)
    return toEvidence(id, record)
  }

  /** @param id - Evidence identity. */
  getEvidence(id: EvidenceId): Evidence | undefined {
    const record = this.requireEvidence().get(id)
    return record === undefined ? undefined : toEvidence(id, record)
  }

  /**
   * List Evidence for a task.
   * @param projectId - Owning project.
   * @param taskId - Owning task.
   */
  listEvidence(projectId: ProjectId, taskId: ResearchTaskId): readonly Evidence[] {
    this.requireTaskInProject(taskId, projectId)
    const items: Evidence[] = []
    for (const [id, record] of this.requireEvidence().entries()) {
      if (record.projectId !== String(projectId) || record.taskId !== String(taskId)) continue
      items.push(toEvidence(id, record))
    }
    items.sort(compareResearchUpdatedDesc)
    return items
  }

  /**
   * Update Evidence content fields with optimistic concurrency.
   * @param input - Identity, expectedRevision, and patch fields.
   */
  async updateEvidence(input: {
    evidenceId: EvidenceId
    expectedRevision: number
    excerpt?: string | null
    observation?: string
    claim?: string | null
    claimType?: ClaimType | null
    evidenceGrade?: EvidenceGrade
    method?: string | null
    limitations?: readonly string[]
    actor?: ActorRef
  }): Promise<Evidence> {
    const actor = input.actor ?? 'local-human'
    const table = this.requireEvidence()
    const existing = table.get(input.evidenceId)
    if (existing === undefined) throw new FashionResearchEvidenceNotFoundError(input.evidenceId)
    this.requireEditableProject(existing.projectId as ProjectId)
    this.assertWritableObject(existing)
    if (existing.revision !== input.expectedRevision) {
      throw new FashionResearchRevisionConflictError(
        String(input.evidenceId),
        input.expectedRevision,
        existing.revision,
      )
    }
    const observation = input.observation !== undefined ? input.observation.trim() : existing.observation
    if (observation.length < 1 || observation.length > 2000) {
      throw new FashionResearchInvalidInputError('invalid-observation')
    }
    const claim = input.claim !== undefined ? normalizeOptionalNote(input.claim, 2000) : existing.claim
    const claimType = input.claimType !== undefined ? input.claimType : existing.claimType
    if (claim !== null && claimType === null) {
      throw new FashionResearchInvalidInputError('claim-requires-claimType')
    }
    if (claim === null && claimType !== null) {
      throw new FashionResearchInvalidInputError('claimType-requires-claim')
    }
    const evidenceGrade = input.evidenceGrade ?? existing.evidenceGrade
    if (claimType === 'observed' && evidenceGrade === 'G0') {
      throw new FashionResearchInvalidInputError('observed-requires-g1-or-higher')
    }
    if (evidenceGrade === 'G4' && existing.evidenceGrade !== 'G4') {
      throw new FashionResearchInvalidInputError('g4-not-created-by-f2-01')
    }
    const method = input.method !== undefined ? normalizeOptionalNote(input.method, 2000) : existing.method
    const limitations = input.limitations !== undefined ? [...input.limitations] : existing.limitations
    if (claimType === 'derived') {
      if (method === null) throw new FashionResearchInvalidInputError('derived-requires-method')
      if (limitations.length < 1) throw new FashionResearchInvalidInputError('derived-requires-limitations')
    }
    const now = new Date().toISOString()
    const record: EvidenceRecordV0 = {
      ...existing,
      excerpt: input.excerpt !== undefined ? normalizeOptionalNote(input.excerpt, 1000) : existing.excerpt,
      observation,
      claim,
      claimType,
      evidenceGrade,
      method,
      limitations,
      revision: existing.revision + 1,
      updatedAt: now,
      updatedBy: actor,
    }
    await table.put(input.evidenceId, record)
    return toEvidence(input.evidenceId, record)
  }

  /**
   * Soft-archive Evidence.
   * @param input - Identity and expectedRevision.
   */
  async archiveEvidence(input: {
    evidenceId: EvidenceId
    expectedRevision: number
    actor?: ActorRef
  }): Promise<Evidence> {
    const actor = input.actor ?? 'local-human'
    const table = this.requireEvidence()
    const existing = table.get(input.evidenceId)
    if (existing === undefined) throw new FashionResearchEvidenceNotFoundError(input.evidenceId)
    this.requireEditableProject(existing.projectId as ProjectId)
    this.assertWritableObject(existing)
    if (existing.revision !== input.expectedRevision) {
      throw new FashionResearchRevisionConflictError(
        String(input.evidenceId),
        input.expectedRevision,
        existing.revision,
      )
    }
    const now = new Date().toISOString()
    const record: EvidenceRecordV0 = {
      ...existing,
      revision: existing.revision + 1,
      updatedAt: now,
      updatedBy: actor,
      archivedAt: now,
      accessMode: 'read-only',
      reviewStatus: existing.reviewStatus === 'draft' || existing.reviewStatus === 'pending_review'
        ? 'invalidated'
        : existing.reviewStatus,
      reviewedBy: existing.reviewedBy ?? 'local-human',
      reviewedAt: existing.reviewedAt ?? now,
      reviewNote: existing.reviewNote ?? 'archived',
    }
    await table.put(input.evidenceId, record)
    return toEvidence(input.evidenceId, record)
  }

  /**
   * Human-only Evidence review transition.
   * @param input - Identity, expectedRevision, terminal reviewStatus, and note.
   */
  async reviewEvidence(input: {
    evidenceId: EvidenceId
    expectedRevision: number
    reviewStatus: Extract<EvidenceReviewStatus, 'confirmed' | 'rejected' | 'invalidated'>
    reviewNote: string
    actor?: ActorRef
  }): Promise<Evidence> {
    const actor = input.actor ?? 'local-human'
    assertHumanReviewer(actor)
    const table = this.requireEvidence()
    const existing = table.get(input.evidenceId)
    if (existing === undefined) throw new FashionResearchEvidenceNotFoundError(input.evidenceId)
    this.requireEditableProject(existing.projectId as ProjectId)
    this.assertWritableObject(existing)
    if (existing.revision !== input.expectedRevision) {
      throw new FashionResearchRevisionConflictError(
        String(input.evidenceId),
        input.expectedRevision,
        existing.revision,
      )
    }
    const reviewNote = input.reviewNote.trim()
    if (reviewNote.length < 1 || reviewNote.length > 2000) {
      throw new FashionResearchInvalidInputError('invalid-review-note')
    }
    const now = new Date().toISOString()
    const record: EvidenceRecordV0 = {
      ...existing,
      reviewStatus: input.reviewStatus,
      reviewedBy: actor,
      reviewedAt: now,
      reviewNote,
      revision: existing.revision + 1,
      updatedAt: now,
      updatedBy: actor,
    }
    await table.put(input.evidenceId, record)
    return toEvidence(input.evidenceId, record)
  }

  private async ensureR0Seed(): Promise<void> {
    const tasks = this.requireTasks()
    const sources = this.requireSources()
    const samples = this.requireSamples()
    const evidence = this.requireEvidence()
    const existingTask = tasks.get(R0_TASK_ID)
    const sourcePresence = R0_SOURCE_SEEDS.map(seed => sources.get(seed.id) !== undefined)
    const anySource = sourcePresence.some(Boolean)
    const allSources = sourcePresence.every(Boolean)

    if (existingTask === undefined && !anySource) {
      await tasks.put(R0_TASK_ID, R0_TASK_RECORD)
      for (const seed of R0_SOURCE_SEEDS) {
        await sources.put(seed.id, seed.record)
        await samples.put(seed.sample.id, seed.sample.record)
      }
      for (const seed of R0_EVIDENCE_SEEDS) {
        await evidence.put(seed.id, seed.record)
      }
      return
    }

    if (existingTask === undefined || !allSources) {
      throw new FashionResearchSeedConflictError(R0_PROJECT_ID)
    }
    if (!isValidR0TaskSeed(existingTask, R0_PROJECT_ID)) {
      throw new FashionResearchSeedConflictError(R0_PROJECT_ID)
    }
    for (const seed of R0_SOURCE_SEEDS) {
      const source = sources.get(seed.id)
      const sample = samples.get(seed.sample.id)
      if (source === undefined || sample === undefined) {
        throw new FashionResearchSeedConflictError(R0_PROJECT_ID)
      }
      if (!isValidR0ChildSeed(source, R0_PROJECT_ID) || !isValidR0ChildSeed(sample, R0_PROJECT_ID)) {
        throw new FashionResearchSeedConflictError(R0_PROJECT_ID)
      }
    }
    for (const seed of R0_EVIDENCE_SEEDS) {
      const row = evidence.get(seed.id)
      if (row === undefined || !isValidR0ChildSeed(row, R0_PROJECT_ID)) {
        throw new FashionResearchSeedConflictError(R0_PROJECT_ID)
      }
    }
  }

  private requireProject(projectId: ProjectId): void {
    if (this.ctx.fashionProjectRegistry.get(projectId) === undefined) {
      throw new FashionResearchProjectNotFoundError(projectId)
    }
  }

  private requireEditableProject(projectId: ProjectId | string): void {
    const id = projectId as ProjectId
    const project = this.ctx.fashionProjectRegistry.get(id)
    if (project === undefined) throw new FashionResearchProjectNotFoundError(id)
    if (project.accessMode === 'read-only') {
      throw new FashionResearchProjectReadOnlyError(id)
    }
  }

  private requireTaskInProject(taskId: ResearchTaskId, projectId: ProjectId): ResearchTaskRecordV0 {
    this.requireProject(projectId)
    const task = this.requireTasks().get(taskId)
    if (task === undefined) throw new FashionResearchTaskNotFoundError(taskId)
    if (task.projectId !== String(projectId)) {
      throw new FashionResearchCrossProjectReferenceError(projectId, task.projectId as ProjectId)
    }
    return task
  }

  private requireSourceInTask(
    sourceId: SourceId,
    projectId: ProjectId,
    taskId: ResearchTaskId,
  ): SourceRecordV0 {
    const source = this.requireSources().get(sourceId)
    if (source === undefined) throw new FashionResearchSourceNotFoundError(sourceId)
    if (source.projectId !== String(projectId)) {
      throw new FashionResearchCrossProjectReferenceError(projectId, source.projectId as ProjectId)
    }
    if (source.taskId !== String(taskId)) {
      throw new FashionResearchCrossTaskReferenceError(taskId, source.taskId as ResearchTaskId)
    }
    return source
  }

  private requireSampleInTask(
    sampleId: SampleId,
    projectId: ProjectId,
    taskId: ResearchTaskId,
  ): SampleRecordV0 {
    const sample = this.requireSamples().get(sampleId)
    if (sample === undefined) throw new FashionResearchSampleNotFoundError(sampleId)
    if (sample.projectId !== String(projectId)) {
      throw new FashionResearchCrossProjectReferenceError(projectId, sample.projectId as ProjectId)
    }
    if (sample.taskId !== String(taskId)) {
      throw new FashionResearchCrossTaskReferenceError(taskId, sample.taskId as ResearchTaskId)
    }
    return sample
  }

  private assertWritableObject(record: { accessMode: string; archivedAt: string | null }): void {
    if (record.accessMode === 'read-only' || record.archivedAt !== null) {
      throw new FashionResearchInvalidTransitionError('object-read-only')
    }
  }

  private requireTasks(): KvTable<ResearchTaskId, ResearchTaskRecordV0> {
    if (this.tasks === undefined) throw new Error('fashionResearchRegistry is not initialized')
    return this.tasks
  }

  private requireSources(): KvTable<SourceId, SourceRecordV0> {
    if (this.sources === undefined) throw new Error('fashionResearchRegistry is not initialized')
    return this.sources
  }

  private requireSamples(): KvTable<SampleId, SampleRecordV0> {
    if (this.samples === undefined) throw new Error('fashionResearchRegistry is not initialized')
    return this.samples
  }

  private requireEvidence(): KvTable<EvidenceId, EvidenceRecordV0> {
    if (this.evidence === undefined) throw new Error('fashionResearchRegistry is not initialized')
    return this.evidence
  }
}

export default FashionResearchRegistry
