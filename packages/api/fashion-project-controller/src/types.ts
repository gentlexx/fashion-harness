/**
 * Wire types for the Fashion Project Remote namespace.
 * @module @gentlexx/dsh-api-fashion-project-controller/src/types
 */

import type { ProjectId, ProjectView } from '@gentlexx/dsh-fashion-project/types'

export type { ProjectId, ProjectView }

/** Create request: title only in v0. */
export interface FashionProjectCreateRequest {
  readonly title: string
}

/** Create response carrying the Host-committed projection. */
export interface FashionProjectCreateValue {
  readonly project: ProjectView
}

/** Get request by branded Project id. */
export interface FashionProjectGetRequest {
  readonly projectId: ProjectId
}

/** Get response carrying one projection. */
export interface FashionProjectGetValue {
  readonly project: ProjectView
}

/** List response with Host-stable order. */
export interface FashionProjectListValue {
  readonly items: readonly ProjectView[]
}
