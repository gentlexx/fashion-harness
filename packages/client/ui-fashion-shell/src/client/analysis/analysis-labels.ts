/** Locale keys for analysis lifecycle and review enums shown in lists and detail headers. */
import type {
  AnalysisObjectStatus,
  DedupeStatus,
  MarketItemType,
  OpportunityReviewStatus,
} from '@gentlexx/dsh-fashion-analysis/types'
import type { FashionKey } from '../locales.ts'

/** MarketItem kind labels. */
export const ITEM_TYPE_LABELS: Readonly<Record<MarketItemType, FashionKey>> = {
  garment_product: 'analysis.itemTypeGarment',
  content_post: 'analysis.itemTypeContent',
  trend_topic: 'analysis.itemTypeTopic',
}

/** MarketItem dedupe workflow labels. */
export const DEDUPE_STATUS_LABELS: Readonly<Record<DedupeStatus, FashionKey>> = {
  unreviewed: 'analysis.enum.dedupe.unreviewed',
  candidate_match: 'analysis.enum.dedupe.candidateMatch',
  confirmed_same: 'analysis.enum.dedupe.confirmedSame',
  confirmed_distinct: 'analysis.enum.dedupe.confirmedDistinct',
}

/** Shared analysis object lifecycle labels. */
export const OBJECT_STATUS_LABELS: Readonly<Record<AnalysisObjectStatus, FashionKey>> = {
  active: 'analysis.enum.objectStatus.active',
  stale: 'analysis.enum.objectStatus.stale',
  invalidated: 'analysis.enum.objectStatus.invalidated',
  archived: 'analysis.enum.objectStatus.archived',
}

/** Opportunity human review labels. */
export const OPPORTUNITY_REVIEW_LABELS: Readonly<Record<OpportunityReviewStatus, FashionKey>> = {
  candidate: 'analysis.enum.review.candidate',
  selected: 'analysis.enum.review.selected',
  rejected: 'analysis.enum.review.rejected',
  needs_more_research: 'analysis.enum.review.needsMoreResearch',
}
