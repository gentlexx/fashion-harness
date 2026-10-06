/**
 * Fashion Design domain declaration opened by the registry.
 * @module @gentlexx/dsh-fashion-design/src/spec
 */

import { defineDomain, domainTable } from '@deepseek-ai/dsh-storage-domain'
import type {
  ApprovalInvalidationId,
  ConceptSetId,
  DeliverableSnapshotId,
  DesignArtifactId,
  DesignBriefId,
  DesignConceptId,
  DesignDeliverableId,
  ExportArtifactId,
  ReviewDecisionId,
  ReviewRoundId,
  SourceManifestId,
  VisualDraftId,
} from './types.ts'
import {
  conceptSetRecordV0,
  designArtifactRecordV0,
  designBriefRecordV0,
  designConceptRecordV0,
  visualDraftRecordV0,
  type ConceptSetRecordV0,
  type DesignArtifactRecordV0,
  type DesignBriefRecordV0,
  type DesignConceptRecordV0,
  type VisualDraftRecordV0,
} from './schema/v0/records.ts'
import {
  approvalInvalidationRecordV0,
  deliverableSnapshotRecordV0,
  designDeliverableRecordV0,
  exportArtifactRecordV0,
  reviewDecisionRecordV0,
  reviewRoundRecordV0,
  sourceManifestRecordV0,
  type ApprovalInvalidationRecordV0,
  type DeliverableSnapshotRecordV0,
  type DesignDeliverableRecordV0,
  type ExportArtifactRecordV0,
  type ReviewDecisionRecordV0,
  type ReviewRoundRecordV0,
  type SourceManifestRecordV0,
} from './schema/v0/review.ts'

/**
 * Domain `fashion_design@1`: F3-01 tables plus F3-02 review/deliverable tables.
 * Adjacent migration from @0 via compatibleVersions; row schemaVersion stays 0.
 */
export const FASHION_DESIGN_DOMAIN_VERSION = 1

/**
 * Domain `fashion_design@1`: authoritative single-file tables for design objects.
 * Opens stores written at @0 (`compatibleVersions`) without rewriting F3-01 rows.
 */
export const fashionDesignDomainSpec = defineDomain({
  name: 'fashion_design',
  version: FASHION_DESIGN_DOMAIN_VERSION,
  compatibleVersions: [0],
  tables: {
    design_briefs: domainTable<DesignBriefId, DesignBriefRecordV0>(designBriefRecordV0),
    concept_sets: domainTable<ConceptSetId, ConceptSetRecordV0>(conceptSetRecordV0),
    design_concepts: domainTable<DesignConceptId, DesignConceptRecordV0>(designConceptRecordV0),
    visual_drafts: domainTable<VisualDraftId, VisualDraftRecordV0>(visualDraftRecordV0),
    design_artifacts: domainTable<DesignArtifactId, DesignArtifactRecordV0>(designArtifactRecordV0),
    review_rounds: domainTable<ReviewRoundId, ReviewRoundRecordV0>(reviewRoundRecordV0),
    review_decisions: domainTable<ReviewDecisionId, ReviewDecisionRecordV0>(reviewDecisionRecordV0),
    approval_invalidations: domainTable<ApprovalInvalidationId, ApprovalInvalidationRecordV0>(approvalInvalidationRecordV0),
    deliverable_snapshots: domainTable<DeliverableSnapshotId, DeliverableSnapshotRecordV0>(deliverableSnapshotRecordV0),
    source_manifests: domainTable<SourceManifestId, SourceManifestRecordV0>(sourceManifestRecordV0),
    design_deliverables: domainTable<DesignDeliverableId, DesignDeliverableRecordV0>(designDeliverableRecordV0),
    export_artifacts: domainTable<ExportArtifactId, ExportArtifactRecordV0>(exportArtifactRecordV0),
  },
})

export type {
  ConceptSetRecordV0,
  DesignArtifactRecordV0,
  DesignBriefRecordV0,
  DesignConceptRecordV0,
  VisualDraftRecordV0,
  ApprovalInvalidationRecordV0,
  DeliverableSnapshotRecordV0,
  DesignDeliverableRecordV0,
  ExportArtifactRecordV0,
  ReviewDecisionRecordV0,
  ReviewRoundRecordV0,
  SourceManifestRecordV0,
}
