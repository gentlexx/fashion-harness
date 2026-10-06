/**
 * Fashion Project registry (`ctx.fashionProjectRegistry`): durable project
 * records over Storage Domain `fashion_projects@0`.
 * @module @gentlexx/dsh-fashion-project
 */

import { randomUUID } from 'node:crypto'
import { Context, Service } from '@deepseek-ai/cordis'
import type { KvTable } from '@deepseek-ai/dsh-storage-domain'
import {
  FashionProjectIdCollisionError,
  FashionProjectInvalidTitleError,
  FashionProjectSeedConflictError,
} from './errors.ts'
import { ProjectId as brandProjectId } from './ids.ts'
import { isValidR0Seed, R0_PROJECT_ID, R0_SEED_RECORD } from './seed.ts'
import { fashionProjectDomainSpec } from './spec.ts'
import type { ProjectRecordV0 } from './schema/v0.ts'
import { compareFashionProjects } from './order.ts'
import type { FashionProject, ProjectId as ProjectIdBrand } from './types.ts'

export type {
  FashionProject,
  ProjectAccessMode,
  ProjectOrigin,
  ProjectView,
} from './types.ts'
/** Branded Project identity; factory below shares this name. */
export type ProjectId = ProjectIdBrand
export { fashionProjectDomainSpec, FASHION_PROJECT_DOMAIN_VERSION } from './spec.ts'
export { projectRecordV0 } from './schema/v0.ts'
export type { ProjectRecordV0 } from './schema/v0.ts'
export {
  isValidR0Seed,
  R0_PROJECT_ID,
  R0_SEED_CREATED_AT,
  R0_SEED_RECORD,
} from './seed.ts'
export {
  FashionProjectIdCollisionError,
  FashionProjectInvalidTitleError,
  FashionProjectSeedConflictError,
} from './errors.ts'
export { compareFashionProjects } from './order.ts'

/**
 * Brand a string as a {@link ProjectId}.
 * @param id - Raw project id string.
 * @returns the same string, branded at compile time.
 */
export function ProjectId(id: string): ProjectId {
  return brandProjectId(id)
}

/** Maximum admitted project title length after trim. */
export const PROJECT_TITLE_MAX_LENGTH = 120

declare module '@deepseek-ai/cordis' {
  interface Context {
    fashionProjectRegistry: FashionProjectRegistry
  }
}

/**
 * Normalize and validate a project title at the Host create boundary.
 * @param title - Raw caller title.
 * @returns trimmed title.
 * @throws FashionProjectInvalidTitleError when empty or longer than {@link PROJECT_TITLE_MAX_LENGTH}.
 */
export function normalizeProjectTitle(title: string): string {
  const trimmed = title.trim()
  if (trimmed.length < 1 || trimmed.length > PROJECT_TITLE_MAX_LENGTH) {
    throw new FashionProjectInvalidTitleError(trimmed)
  }
  return trimmed
}

/**
 * Assemble the public {@link FashionProject} projection from a table key and record.
 * @param id - Table key.
 * @param record - Durable record body.
 */
export function toFashionProject(id: ProjectIdBrand, record: ProjectRecordV0): FashionProject {
  return {
    id,
    title: record.title,
    origin: record.origin,
    accessMode: record.accessMode,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    revision: record.revision,
  }
}

/**
 * Durable Fashion Project registry. Opens `fashion_projects@0`, ensures the R0
 * public-rebuild seed once, and exposes create/get/list over the domain table.
 */
export class FashionProjectRegistry extends Service {
  static inject = ['storageDomain']

  private table?: KvTable<ProjectIdBrand, ProjectRecordV0>

  /** @param ctx - Host context providing {@link Context.storageDomain}. */
  constructor(ctx: Context) {
    super(ctx, 'fashionProjectRegistry')
  }

  /** Open the domain, ensure R0, and register the close disposer. */
  protected async [Service.init](): Promise<void> {
    const domain = await this.ctx.storageDomain.open(fashionProjectDomainSpec)
    this.ctx.effect(() => () => domain.close(), 'fashionProject.domainClose')
    this.table = domain.table('projects')
    await this.ensureR0Seed()
  }

  /**
   * Create a user-owned editable project after Host title normalization.
   * @param input - Create request; only `title` is admitted in v0.
   * @returns the durable projection after the write commits.
   */
  async create(input: { title: string }): Promise<FashionProject> {
    const title = normalizeProjectTitle(input.title)
    const table = this.requireTable()
    const now = new Date().toISOString()
    const record: ProjectRecordV0 = {
      title,
      origin: 'user',
      accessMode: 'editable',
      createdAt: now,
      updatedAt: now,
      revision: 0,
    }

    let id = ProjectId(randomUUID())
    if (table.get(id) !== undefined) {
      id = ProjectId(randomUUID())
      if (table.get(id) !== undefined) {
        throw new FashionProjectIdCollisionError(id)
      }
    }

    await table.put(id, record)
    return toFashionProject(id, record)
  }

  /**
   * Read one project from the authoritative in-memory mirror.
   * @param id - Project identity.
   * @returns the projection, or `undefined` when absent.
   */
  get(id: ProjectIdBrand): FashionProject | undefined {
    const record = this.requireTable().get(id)
    return record === undefined ? undefined : toFashionProject(id, record)
  }

  /**
   * List every project in stable Host order.
   * @returns immutable projections ordered by {@link compareFashionProjects}.
   */
  list(): readonly FashionProject[] {
    const items: FashionProject[] = []
    for (const [id, record] of this.requireTable().entries()) {
      items.push(toFashionProject(id, record))
    }
    items.sort(compareFashionProjects)
    return items
  }

  /**
   * Idempotent R0 seed: write once when absent; refuse drifted public-rebuild rows.
   * @throws FashionProjectSeedConflictError when the reserved key violates invariants.
   */
  private async ensureR0Seed(): Promise<void> {
    const table = this.requireTable()
    const existing = table.get(R0_PROJECT_ID)
    if (existing === undefined) {
      await table.put(R0_PROJECT_ID, R0_SEED_RECORD)
      return
    }
    if (!isValidR0Seed(existing)) {
      throw new FashionProjectSeedConflictError(R0_PROJECT_ID)
    }
  }

  private requireTable(): KvTable<ProjectIdBrand, ProjectRecordV0> {
    if (this.table === undefined) {
      throw new Error('fashionProjectRegistry is not initialized')
    }
    return this.table
  }
}

export default FashionProjectRegistry
