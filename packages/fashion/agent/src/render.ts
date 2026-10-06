/**
 * Render a compact, auditable Fashion snapshot for one model turn.
 * @module @gentlexx/dsh-fashion-agent/src/render
 */

import type { FashionProjectSnapshot } from './types.ts'

/**
 * Render the snapshot as structured JSON text plus the authorized scope header.
 * @param snapshot - Host-authored compact snapshot.
 */
export function renderFashionProjectSnapshot(snapshot: FashionProjectSnapshot): string {
  const header = [
    'Fashion project context (read-only).',
    `projectId=${String(snapshot.project.projectId)}`,
    `title=${snapshot.project.title}`,
    `snapshotVersion=${snapshot.snapshotVersion}`,
    `projectUpdatedAt=${snapshot.projectUpdatedAt}`,
    `dataScope=${snapshot.dataScope.join(',')}`,
    'Do not infer the project from the workspace folder name.',
    'Do not modify the project.',
  ].join('\n')
  return `${header}\n${JSON.stringify(snapshot)}`
}

/** Settled `fashion_project_query` value as returned by the tool's `execute`. */
export interface FashionProjectQueryValue {
  readonly ok: boolean
  readonly section: string
  readonly projectId: string
  readonly snapshotVersion: string
  readonly body: unknown
  readonly error: string
}

/**
 * Render the model-facing text of one `fashion_project_query` result.
 * Success carries the section body as JSON; failure carries only the error and never a body.
 * @param value - settled tool value.
 * @returns compact deterministic text for the tool result.
 */
export function renderFashionProjectQueryResult(value: FashionProjectQueryValue): string {
  if (!value.ok) {
    return [
      'Fashion project query failed (read-only).',
      `section=${value.section}`,
      `error=${value.error}`,
    ].join('\n')
  }
  const lines = [
    'Fashion project query result (read-only).',
    `section=${value.section}`,
    `projectId=${value.projectId}`,
    `snapshotVersion=${value.snapshotVersion}`,
  ]
  if (value.body === null) lines.push('The bound project has no data for this section.')
  lines.push(`body=${JSON.stringify(value.body)}`)
  return lines.join('\n')
}

/**
 * Render a non-leaking unavailability notice when injection must stop.
 * @param reason - machine-stable failure class.
 */
export function renderFashionContextUnavailable(
  reason: 'not-found' | 'inaccessible' | 'snapshot-failed' | 'broken-reference',
): string {
  return [
    'Fashion project context is unavailable for this session.',
    `reason=${reason}`,
    'Do not infer a project from the workspace folder name.',
    'Do not use earlier Fashion snapshots from this transcript as current.',
  ].join('\n')
}
