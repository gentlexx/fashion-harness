/**
 * Fashion Research domain declaration opened by the registry.
 * @module @gentlexx/dsh-fashion-research/src/spec
 */

import { defineDomain, domainTable } from '@deepseek-ai/dsh-storage-domain'
import type {
  EvidenceId,
  ResearchTaskId,
  SampleId,
  SourceId,
} from './types.ts'
import { evidenceRecordV0 } from './schema/v0/evidence.ts'
import type { EvidenceRecordV0 } from './schema/v0/evidence.ts'
import { researchTaskRecordV0 } from './schema/v0/research-task.ts'
import type { ResearchTaskRecordV0 } from './schema/v0/research-task.ts'
import { sampleRecordV0 } from './schema/v0/sample.ts'
import type { SampleRecordV0 } from './schema/v0/sample.ts'
import { sourceRecordV0 } from './schema/v0/source.ts'
import type { SourceRecordV0 } from './schema/v0/source.ts'

/** Current Storage Domain version for fashion_research. */
export const FASHION_RESEARCH_DOMAIN_VERSION = 0

/**
 * Domain `fashion_research@0`: authoritative single-file tables for task/source/sample/evidence.
 * Invalid records reject open; no compatibleVersions in v0.
 */
export const fashionResearchDomainSpec = defineDomain({
  name: 'fashion_research',
  version: FASHION_RESEARCH_DOMAIN_VERSION,
  tables: {
    research_tasks: domainTable<ResearchTaskId, ResearchTaskRecordV0>(researchTaskRecordV0),
    sources: domainTable<SourceId, SourceRecordV0>(sourceRecordV0),
    samples: domainTable<SampleId, SampleRecordV0>(sampleRecordV0),
    evidence: domainTable<EvidenceId, EvidenceRecordV0>(evidenceRecordV0),
  },
})

export type {
  EvidenceRecordV0,
  ResearchTaskRecordV0,
  SampleRecordV0,
  SourceRecordV0,
}
