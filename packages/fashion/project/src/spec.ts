/**
 * Fashion Project domain declaration opened by the registry.
 * @module @gentlexx/dsh-fashion-project/src/spec
 */

import { defineDomain, domainTable } from '@deepseek-ai/dsh-storage-domain'
import type { ProjectId } from './types.ts'
import { projectRecordV0 } from './schema/v0.ts'
import type { ProjectRecordV0 } from './schema/v0.ts'

/** Current Storage Domain version for fashion_projects. */
export const FASHION_PROJECT_DOMAIN_VERSION = 0

/**
 * Domain `fashion_projects@0`: single-file authoritative `projects` table.
 * Name uses underscore because Storage Domain unit names match `/^[a-z][a-z0-9_]*$/`.
 * Invalid records reject open; no compatibleVersions in v0.
 */
export const fashionProjectDomainSpec = defineDomain({
  name: 'fashion_projects',
  version: FASHION_PROJECT_DOMAIN_VERSION,
  tables: {
    projects: domainTable<ProjectId, ProjectRecordV0>(projectRecordV0),
  },
})

export type { ProjectRecordV0 }
