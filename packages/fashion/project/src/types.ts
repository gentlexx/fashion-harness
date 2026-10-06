/**
 * Public type vocabulary of the Fashion Project domain.
 * Types only — factories and errors live in runtime modules.
 * @module @gentlexx/dsh-fashion-project/src/types
 */

import type { Branded } from '@deepseek-ai/dsh-brand'
import type {} from '@deepseek-ai/dsh-typert-protocol'

/** Stable Fashion Project identity; never a SessionId, WorkspaceId, or path. */
export type ProjectId = Branded<'FashionProjectId'>

/** How the project entered the registry. */
export type ProjectOrigin = 'user' | 'public-rebuild'

/** Whether the project may be mutated by F1-02 create-only policies beyond seed. */
export type ProjectAccessMode = 'editable' | 'read-only'

/**
 * Authoritative Fashion Project projection returned to Host consumers and Remotes.
 */
export interface FashionProject {
  readonly id: ProjectId
  readonly title: string
  readonly origin: ProjectOrigin
  readonly accessMode: ProjectAccessMode
  readonly createdAt: string
  readonly updatedAt: string
  readonly revision: number
}

/** Wire/read alias identical to {@link FashionProject}. */
export type ProjectView = FashionProject

declare module '@deepseek-ai/dsh-typert-protocol' {
  interface RemoteErrorDetailsMap {
    /** Title failed Host validation after trim. */
    'fashion-project/invalid-title': { readonly title: string }
    /** Requested Project id is absent from the registry. */
    'fashion-project/not-found': { readonly projectId: ProjectId }
    /** Reserved R0 key exists with drifted public-rebuild invariants. */
    'fashion-project/seed-conflict': { readonly projectId: ProjectId }
  }
}
