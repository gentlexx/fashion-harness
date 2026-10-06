/** Locale keys for popularity signal types; internal to the Fashion shell. */
import type { PopularitySignalType } from '@gentlexx/dsh-fashion-analysis/types'
import type { FashionKey } from '../locales.ts'

/** Locale key for each Host signal type. */
export const SIGNAL_TYPE_LABELS: Record<PopularitySignalType, FashionKey> = {
  search_growth: 'analysis.enum.signalType.searchGrowth',
  rank_position: 'analysis.enum.signalType.rankPosition',
  view_count: 'analysis.enum.signalType.viewCount',
  engagement: 'analysis.enum.signalType.engagement',
  save_rate: 'analysis.enum.signalType.saveRate',
  sellout_claim: 'analysis.enum.signalType.selloutClaim',
  cross_source_presence: 'analysis.enum.signalType.crossSourcePresence',
}
