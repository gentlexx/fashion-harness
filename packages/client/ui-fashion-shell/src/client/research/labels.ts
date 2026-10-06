/**
 * Locale-owned Fashion Research enum labels (never show raw wire enums).
 * @module @gentlexx/dsh-client-ui-fashion-shell/src/client/research/labels
 */

import type { FashionKey } from '../locales.ts'

/** Translate a ResearchTask status for product UI. */
export function taskStatusLabel(
  status: string,
  t: (key: FashionKey) => string,
): string {
  switch (status) {
    case 'draft': return t('research.enum.taskStatus.draft')
    case 'active': return t('research.enum.taskStatus.active')
    case 'ready_for_review': return t('research.enum.taskStatus.readyForReview')
    case 'closed': return t('research.enum.taskStatus.closed')
    case 'archived': return t('research.enum.taskStatus.archived')
    default: return t('research.enum.unknown')
  }
}

/** Translate a Sample status for product UI. */
export function sampleStatusLabel(
  status: string,
  t: (key: FashionKey) => string,
): string {
  switch (status) {
    case 'draft': return t('research.enum.sampleStatus.draft')
    case 'ready_for_review': return t('research.enum.sampleStatus.readyForReview')
    case 'confirmed': return t('research.enum.sampleStatus.confirmed')
    case 'rejected': return t('research.enum.sampleStatus.rejected')
    case 'archived': return t('research.enum.sampleStatus.archived')
    default: return t('research.enum.unknown')
  }
}

/** Translate a SourceKind for product UI. */
export function sourceKindLabel(
  kind: string,
  t: (key: FashionKey) => string,
): string {
  switch (kind) {
    case 'web_page': return t('research.enum.sourceKind.webPage')
    case 'report': return t('research.enum.sourceKind.report')
    case 'product_page': return t('research.enum.sourceKind.productPage')
    case 'category_page': return t('research.enum.sourceKind.categoryPage')
    case 'editorial': return t('research.enum.sourceKind.editorial')
    case 'social_content': return t('research.enum.sourceKind.socialContent')
    case 'internal_file': return t('research.enum.sourceKind.internalFile')
    case 'other': return t('research.enum.sourceKind.other')
    default: return t('research.enum.unknown')
  }
}

/** Translate usageBoundary for product UI. */
export function usageBoundaryLabel(
  value: string,
  t: (key: FashionKey) => string,
): string {
  switch (value) {
    case 'public_attributed': return t('research.enum.usageBoundary.publicAttributed')
    case 'project_private': return t('research.enum.usageBoundary.projectPrivate')
    case 'view_only': return t('research.enum.usageBoundary.viewOnly')
    default: return t('research.enum.unknown')
  }
}

/** Translate availabilityStatus for product UI. */
export function availabilityLabel(
  value: string,
  t: (key: FashionKey) => string,
): string {
  switch (value) {
    case 'available': return t('research.enum.availability.available')
    case 'unavailable': return t('research.enum.availability.unavailable')
    case 'removed': return t('research.enum.availability.removed')
    default: return t('research.enum.unknown')
  }
}

/** Translate Evidence reviewStatus for product UI. */
export function reviewStatusLabel(
  value: string,
  t: (key: FashionKey) => string,
): string {
  switch (value) {
    case 'draft': return t('research.enum.reviewStatus.draft')
    case 'pending_review': return t('research.enum.reviewStatus.pendingReview')
    case 'confirmed': return t('research.enum.reviewStatus.confirmed')
    case 'rejected': return t('research.enum.reviewStatus.rejected')
    case 'invalidated': return t('research.enum.reviewStatus.invalidated')
    default: return t('research.enum.unknown')
  }
}

/** Translate ClaimType for product UI. */
export function claimTypeLabel(
  value: string | null,
  t: (key: FashionKey) => string,
): string {
  if (value === null) return t('research.enum.claimType.none')
  switch (value) {
    case 'observed': return t('claim.observed')
    case 'derived': return t('claim.derived')
    case 'needs_validation': return t('claim.needs_validation')
    default: return t('research.enum.unknown')
  }
}
