/**
 * Versioned engineering metric catalog. Not a commercial success score.
 * @module @gentlexx/dsh-fashion-feedback/src/catalog
 */

import type { OutcomeMetricDefinitionRecordV0 } from './schema/v0/records.ts'
import { OutcomeMetricDefinitionId } from './ids.ts'
import type { OutcomeMetricDefinitionId as OutcomeMetricDefinitionIdBrand } from './types.ts'

/** Published catalog version. Changing a formula requires a new version. */
export const METRIC_CATALOG_VERSION = 'v0'

const sharedDimensions = ['marketRegion', 'channel'] as const

function catalogRow(
  key: string,
  displayName: string,
  valueType: OutcomeMetricDefinitionRecordV0['valueType'],
  unit: string,
  description: string,
): { id: OutcomeMetricDefinitionIdBrand; record: OutcomeMetricDefinitionRecordV0 } {
  return {
    id: OutcomeMetricDefinitionId(`catalog-${key}-${METRIC_CATALOG_VERSION}`),
    record: {
      projectId: null,
      metricKey: key,
      definitionVersion: METRIC_CATALOG_VERSION,
      displayName,
      valueType,
      unit,
      aggregationSemantics: valueType === 'ratio' ? 'point' : 'window_total',
      description,
      requiredDimensions: [...sharedDimensions],
      scope: 'catalog',
      limitations: ['Engineering catalog only. Channel formulas are not interchangeable.'],
      schemaVersion: 0,
    },
  }
}

/** Initial metric catalog. gross_sales, net_sales, and sales_reversals stay distinct. */
export const METRIC_CATALOG: readonly {
  id: OutcomeMetricDefinitionIdBrand
  record: OutcomeMetricDefinitionRecordV0
}[] = [
  catalogRow('impressions', 'Impressions', 'integer', 'count', 'Count of times the listing was shown in the stated window.'),
  catalogRow('clicks', 'Clicks', 'integer', 'count', 'Count of clicks on the listing in the stated window.'),
  catalogRow('saves', 'Saves', 'integer', 'count', 'Count of saves or favorites in the stated window.'),
  catalogRow('add_to_cart', 'Add to cart', 'integer', 'count', 'Count of add-to-cart events in the stated window.'),
  catalogRow('orders', 'Orders', 'integer', 'count', 'Count of orders in the stated window. Not units and not revenue.'),
  catalogRow('units_sold', 'Units sold', 'integer', 'count', 'Count of units sold in the stated window. Not order count.'),
  catalogRow('gross_sales', 'Gross sales', 'decimal_string', 'currency', 'Gross sales amount before reversals. Not net sales.'),
  catalogRow('net_sales', 'Net sales', 'decimal_string', 'currency', 'Net sales after declared reversals. Not gross sales.'),
  catalogRow('sales_reversals', 'Sales reversals', 'decimal_string', 'currency', 'Reversal amount. Not net sales and not returned units.'),
  catalogRow('returned_units', 'Returned units', 'integer', 'count', 'Count of returned units. Not a revenue amount.'),
  catalogRow('return_rate', 'Return rate', 'ratio', 'ratio', 'Returned units over the declared denominator. Not a formatted percent.'),
]
