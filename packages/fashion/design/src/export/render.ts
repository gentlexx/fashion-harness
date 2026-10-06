/**
 * Markdown / JSON / manifest renderers for Design Decision Packages.
 * @module @gentlexx/dsh-fashion-design/src/export/render
 */

import type { AudienceProfile } from '../types.ts'
import { DELIVERABLE_RENDERER_VERSION } from './filter.ts'
import { jcsCanonicalize, sha256Hex } from './jcs.ts'

/** Rendered export trio for one deliverable. */
export interface RenderedExportBundle {
  readonly jsonText: string
  readonly markdownText: string
  readonly manifestText: string
  readonly jsonSha256: string
  readonly markdownSha256: string
  readonly manifestSha256: string
}

/**
 * Render JSON + Markdown + manifest from one frozen snapshot payload.
 * @param snapshot - Snapshot record fields used for export (already filtered).
 * @param audienceProfile - Audience that shaped the snapshot.
 * @param deliverableId - Deliverable id for filenames.
 */
export function renderDecisionPackage(input: {
  snapshot: Record<string, unknown>
  audienceProfile: AudienceProfile
  deliverableId: string
  snapshotHash: string
}): RenderedExportBundle {
  const packageBody = {
    deliverableType: 'design_decision_package',
    audienceProfile: input.audienceProfile,
    rendererVersion: DELIVERABLE_RENDERER_VERSION,
    snapshotHash: input.snapshotHash,
    snapshot: input.snapshot,
  }
  const jsonText = jcsCanonicalize(packageBody)
  const markdownText = renderMarkdown(input.snapshot, input.audienceProfile, input.snapshotHash)
  const jsonSha256 = sha256Hex(jsonText)
  const markdownSha256 = sha256Hex(markdownText)
  const manifestBody = {
    deliverableId: input.deliverableId,
    snapshotHash: input.snapshotHash,
    rendererVersion: DELIVERABLE_RENDERER_VERSION,
    audienceProfile: input.audienceProfile,
    artifacts: [
      {
        kind: 'json',
        filename: `${safeSlug(input.deliverableId)}.json`,
        mediaType: 'application/json',
        sha256: jsonSha256,
        byteLength: Buffer.byteLength(jsonText, 'utf8'),
      },
      {
        kind: 'markdown',
        filename: `${safeSlug(input.deliverableId)}.md`,
        mediaType: 'text/markdown; charset=utf-8',
        sha256: markdownSha256,
        byteLength: Buffer.byteLength(markdownText, 'utf8'),
      },
    ],
  }
  const manifestText = jcsCanonicalize(manifestBody)
  return {
    jsonText,
    markdownText,
    manifestText,
    jsonSha256,
    markdownSha256,
    manifestSha256: sha256Hex(manifestText),
  }
}

function safeSlug(id: string): string {
  return id.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 120)
}

function renderMarkdown(
  snapshot: Record<string, unknown>,
  audience: AudienceProfile,
  snapshotHash: string,
): string {
  const brief = requireRecord(snapshot.briefPayload, 'briefPayload')
  const selected = requireRecord(snapshot.selectedConceptPayload, 'selectedConceptPayload')
  const review = requireRecord(snapshot.reviewPayload, 'reviewPayload')
  if (!Array.isArray(snapshot.limitations)) throw new Error('snapshot field limitations is not an array')
  const limitations = snapshot.limitations.map(String)
  const lines = [
    '# Design Decision Package',
    '',
    `Audience: ${audience}`,
    `Renderer: ${DELIVERABLE_RENDERER_VERSION}`,
    `Snapshot hash (sha256): ${snapshotHash}`,
    '',
    '## Brief',
    `- Market: ${requireText(brief, 'market')}`,
    `- Season: ${requireText(brief, 'season')}`,
    `- Category: ${requireText(brief, 'category')}`,
    `- Target user: ${requireText(brief, 'targetUser')}`,
    '',
    '## Selected concept',
    ...renderSelectedConcept(selected),
    '',
    '## Review',
    `- Round: ${requireText(review, 'reviewRoundId')}`,
    `- Approval decision: ${requireText(review, 'approvalDecisionId')}`,
    `- Actor: ${requireText(review, 'actorKind')}`,
    '',
    '## Limitations',
    ...limitations.map(item => `- ${item}`),
    '',
    '## Notices',
    '- Not a production Tech Pack, CAD, BOM, or legal clearance.',
    '- Similarity notes are not a legal opinion.',
    '- public_portfolio packages are not automatically published.',
    '',
  ]
  return lines.join('\n')
}

function renderSelectedConcept(selected: Record<string, unknown>): string[] {
  if (selected.redacted === true) {
    return [
      `- Concept: ${requireText(selected, 'id')}`,
      `- Withheld for this audience: ${requireText(selected, 'reason')}`,
    ]
  }
  return [
    `- Title: ${requireText(selected, 'title')}`,
    `- Design intent: ${requireText(selected, 'designIntent')}`,
    `- Silhouette: ${requireText(selected, 'silhouette')}`,
    `- Proportion: ${requireText(selected, 'proportionAndLength')}`,
  ]
}

function requireRecord(value: unknown, field: string): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`snapshot field ${field} is not an object`)
  }
  return value as Record<string, unknown>
}

function requireText(record: Record<string, unknown>, field: string): string {
  const value = record[field]
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`snapshot field ${field} is missing or empty`)
  }
  return value
}
