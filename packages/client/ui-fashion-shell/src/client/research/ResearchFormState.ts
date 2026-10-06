/**
 * Shared Research form helpers for URL + text Evidence intake (F2-01 minimal).
 * Client prechecks only; Host remains the authority for admission.
 */

import type {
  CaptureMode,
  ClaimType,
  EvidenceGrade,
  ExternalProcessing,
  SourceKind,
  UsageBoundary,
} from '@gentlexx/dsh-fashion-research/types'

/** Local create/edit phase for Research forms. */
export type ResearchFormPhase = 'idle' | 'editing' | 'submitting'

/** Defaults for a manual URL Source registration (no live fetch). */
export const DEFAULT_URL_SOURCE_FIELDS = {
  locatorType: 'url' as const,
  sourceKind: 'web_page' as SourceKind,
  captureMode: 'manual_link' as CaptureMode,
  usageBoundary: 'public_attributed' as UsageBoundary,
  externalProcessing: 'requires_approval' as ExternalProcessing,
}

/**
 * Client-side http(s) URL admission without credentials.
 * Mirrors Host `normalizeSourceUrl` reject rules for early UX feedback.
 * @param raw - Caller-supplied URL string.
 * @returns true when the URL is eligible for Host registration.
 */
export function isValidHttpUrl(raw: string): boolean {
  const trimmed = raw.trim()
  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return false
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false
  if (parsed.username !== '' || parsed.password !== '') return false
  return true
}

/**
 * Split a multiline limitations textarea into trimmed non-empty lines.
 * @param text - Raw textarea value.
 */
export function parseLimitationLines(text: string): readonly string[] {
  return text
    .split(/\r?\n/u)
    .map(line => line.trim())
    .filter(line => line.length > 0)
}

/** Claim type options shown in Evidence forms. */
export const CLAIM_TYPE_OPTIONS: readonly ClaimType[] = [
  'observed',
  'derived',
  'needs_validation',
]

/** Evidence grades admitted by F2-01 create (G4 excluded). */
export const EVIDENCE_GRADE_OPTIONS: readonly EvidenceGrade[] = [
  'G0',
  'G1',
  'G2',
  'G3',
]

/** Common SourceKind options for the URL registration form. */
export const SOURCE_KIND_OPTIONS: readonly SourceKind[] = [
  'web_page',
  'report',
  'product_page',
  'category_page',
  'editorial',
  'social_content',
  'other',
]
