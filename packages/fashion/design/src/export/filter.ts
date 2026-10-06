/**
 * Audience-profile filtering for deliverable snapshots (Host-owned rules).
 * @module @gentlexx/dsh-fashion-design/src/export/filter
 */

import type { AudienceProfile, SourceInclusion, SourceManifestEntry } from '../types.ts'

/** Fixed Host rule version for preview/generate parity. */
export const AUDIENCE_FILTER_RULE_VERSION = 'v0-audience-filter-1'

/**
 * Renderer version stamped on snapshots and deliverables. Verification
 * recomputes a snapshot hash with the version stored on that snapshot, so
 * packages frozen under an earlier version keep verifying.
 */
export const DELIVERABLE_RENDERER_VERSION = 'v0-design-decision-package-2'

/**
 * Decide inclusion for one source/visual entry under an audience profile.
 * @param profile - Selected audience.
 * @param usageBoundary - Evidence/source usage boundary token.
 * @param audienceVisibility - Asset visibility token (public | project_private | view_only | unknown).
 */
/**
 * Classify a locator that must not appear in a public export.
 * @param locator - Source locator, or null.
 * @returns A stable exclusion reason, or null when the locator is portable.
 */
export function restrictedLocatorKind(locator: string | null | undefined): string | null {
  if (locator === null || locator === undefined) return null
  const value = locator.trim()
  if (value === '') return null
  if (/^[a-zA-Z]:[\\/]/.test(value)) return 'windows-drive-path'
  if (value.startsWith('\\\\') || value.startsWith('//')) return 'unc-path'
  if (value.toLowerCase().startsWith('file:')) return 'file-uri'
  if (value.startsWith('/')) return 'posix-absolute-path'
  return null
}

export function decideInclusion(
  profile: AudienceProfile,
  usageBoundary: string,
  audienceVisibility: string,
): { inclusion: SourceInclusion; exclusionReason: string | null } {
  const visibility = audienceVisibility.trim().toLowerCase()
  const boundary = usageBoundary.trim().toLowerCase()

  if (boundary.includes('secret') || visibility === 'secret') {
    return { inclusion: 'excluded', exclusionReason: 'secret-or-credential' }
  }
  if (visibility === 'unknown' || visibility === '') {
    return { inclusion: 'excluded', exclusionReason: 'license-unknown' }
  }
  if (visibility === 'view_only') {
    if (profile === 'public_portfolio') {
      return { inclusion: 'excluded', exclusionReason: 'view-only-not-public' }
    }
    return { inclusion: 'link_only', exclusionReason: null }
  }
  if (visibility === 'project_private') {
    if (profile === 'public_portfolio') {
      return { inclusion: 'excluded', exclusionReason: 'project-private-not-public' }
    }
    if (profile === 'designer_handoff') {
      return { inclusion: 'summarized', exclusionReason: null }
    }
    return { inclusion: 'embedded', exclusionReason: null }
  }
  // public
  if (profile === 'public_portfolio') {
    return { inclusion: 'summarized', exclusionReason: null }
  }
  return { inclusion: 'embedded', exclusionReason: null }
}

/**
 * Build filtered manifest entries for a deliverable preview/generate.
 * @param profile - Audience profile.
 * @param candidates - Raw candidate sources.
 */
export function filterManifestEntries(
  profile: AudienceProfile,
  candidates: readonly Omit<SourceManifestEntry, 'inclusion' | 'exclusionReason'>[],
): SourceManifestEntry[] {
  return candidates.map((candidate) => {
    const locatorKind = profile === 'public_portfolio' ? restrictedLocatorKind(candidate.locator) : null
    const decided = locatorKind === null
      ? decideInclusion(profile, candidate.usageBoundary, candidate.audienceVisibility)
      : { inclusion: 'excluded' as const, exclusionReason: locatorKind }
    return {
      ...candidate,
      locator: decided.inclusion === 'excluded' && profile === 'public_portfolio' ? null : candidate.locator,
      inclusion: decided.inclusion,
      exclusionReason: decided.exclusionReason,
    }
  })
}

/** Design fields of the approved Concept revision frozen into a decision package. */
export interface DecisionConceptFields {
  readonly id: string
  readonly title: string
  readonly designIntent: string
  readonly silhouette: string
  readonly proportionAndLength: string
  readonly status: string
}

/**
 * Project the approved Concept for an audience. A Concept is the project's own
 * design decision rather than third-party source material, so `summarized`
 * and `embedded` audiences both keep every design field; only excluded and
 * link-only visibility redact it.
 * @param profile - Audience.
 * @param concept - Fields read from the exact approved Concept revision.
 * @param visibility - Asset visibility.
 * @returns The payload frozen into the snapshot and rendered by every artifact.
 */
export function projectConceptForAudience(
  profile: AudienceProfile,
  concept: DecisionConceptFields,
  visibility: string,
): Record<string, unknown> {
  const decided = decideInclusion(profile, 'public_reuse', visibility)
  if (decided.inclusion === 'excluded') {
    return { id: concept.id, redacted: true, reason: decided.exclusionReason }
  }
  if (decided.inclusion === 'link_only') {
    return { id: concept.id, redacted: true, reason: 'link-only', title: concept.title }
  }
  return { ...concept }
}
