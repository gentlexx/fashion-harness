/**
 * R0 public-rebuild design seed for the Utility Jacket case (F3-01).
 * Fixed identities; recorded_seed + read-only; requires human-selected F2-02 Opportunity.
 * @module @gentlexx/dsh-fashion-design/src/seed/r0-design
 */

import {
  R0_DECISION_ID,
  R0_OPPORTUNITY_ID,
} from '@gentlexx/dsh-fashion-analysis'
import { R0_PROJECT_ID } from '@gentlexx/dsh-fashion-project'
import type { ProjectId } from '@gentlexx/dsh-fashion-project/types'
import { R0_TASK_ID, R0_RESEARCH_ACCESSED_AT } from '@gentlexx/dsh-fashion-research'
import {
  ConceptSetId,
  DesignArtifactId,
  DesignBriefId,
  DesignConceptId,
  VisualDraftId,
} from '../ids.ts'
import type {
  ConceptSetRecordV0,
  DesignArtifactRecordV0,
  DesignBriefRecordV0,
  DesignConceptRecordV0,
  VisualDraftRecordV0,
} from '../schema/v0/records.ts'
import { DIFFERENTIATION_RULE_VERSION } from '../differentiation.ts'
import { FASHION_DESIGN_SCHEMA_VERSION } from '../types.ts'

/** Reserved Brief id for R0. */
export const R0_BRIEF_ID = DesignBriefId('r0-design-brief-utility-jacket')

/** Reserved ConceptSet id for R0. */
export const R0_CONCEPT_SET_ID = ConceptSetId('r0-concept-set-utility-three')

/** Urban Field Everyday concept. */
export const R0_CONCEPT_URBAN_ID = DesignConceptId('r0-concept-urban-field-everyday')

/** Cropped Structured Utility concept. */
export const R0_CONCEPT_CROPPED_ID = DesignConceptId('r0-concept-cropped-structured-utility')

/** Light Technical Transition concept. */
export const R0_CONCEPT_LIGHT_ID = DesignConceptId('r0-concept-light-technical-transition')

/** Visual draft ids. */
export const R0_VISUAL_URBAN_ID = VisualDraftId('r0-visual-urban-field-everyday')
export const R0_VISUAL_CROPPED_ID = VisualDraftId('r0-visual-cropped-structured-utility')
export const R0_VISUAL_LIGHT_ID = VisualDraftId('r0-visual-light-technical-transition')

/** Artifact ids for offline schematic placeholders. */
export const R0_ARTIFACT_URBAN_ID = DesignArtifactId('r0-artifact-urban-field-schematic')
export const R0_ARTIFACT_CROPPED_ID = DesignArtifactId('r0-artifact-cropped-structured-schematic')
export const R0_ARTIFACT_LIGHT_ID = DesignArtifactId('r0-artifact-light-technical-schematic')

const envelope = {
  projectId: R0_PROJECT_ID as string,
  origin: 'recorded_seed' as const,
  accessMode: 'read-only' as const,
  revision: 0,
  createdAt: R0_RESEARCH_ACCESSED_AT,
  updatedAt: R0_RESEARCH_ACCESSED_AT,
  createdBy: 'system-seed' as const,
  updatedBy: 'system-seed' as const,
  schemaVersion: FASHION_DESIGN_SCHEMA_VERSION as 0,
  archivedAt: null,
  staleReason: null,
}

function constraint(
  id: string,
  text: string,
  kind: string,
  claimType: 'observed' | 'human_decision' | 'hypothesis' | 'needs_validation',
  sourceRefs: readonly string[] = [],
): DesignBriefRecordV0['mustKeep'][number] {
  return { id, text, kind, claimType, sourceRefs: [...sourceRefs], note: null }
}

/** R0 confirmed Brief seed. */
export const R0_BRIEF_SEED: { id: ReturnType<typeof DesignBriefId>; record: DesignBriefRecordV0 } = {
  id: R0_BRIEF_ID,
  record: {
    ...envelope,
    opportunityId: R0_OPPORTUNITY_ID as string,
    opportunityRevision: 0,
    selectionDecisionId: R0_DECISION_ID as string,
    taskId: R0_TASK_ID as string,
    market: 'United States',
    season: 'Fall transition (hypothesis window)',
    category: 'Utility Jacket — womenswear',
    targetUser: 'Shoppers responding to khaki/utility cues in public editorial and ecommerce listings (hypothesis).',
    brandContext: 'Public-rebuild case; not a brand commercial brief.',
    priceTarget: {
      amount: null,
      currency: null,
      rangeText: 'Unknown — no public evidence for a project price band',
      status: 'unknown',
    },
    mustKeep: [
      constraint('mk-utility-cues', 'Retain readable utility cues without copying a single recorded SKU.', 'design', 'human_decision', [
        String(R0_OPPORTUNITY_ID),
      ]),
    ],
    mustAvoid: [
      constraint('ma-copy-sku', 'Do not reproduce branded product images or protected silhouettes from recorded pages.', 'ip', 'observed', [
        String(R0_OPPORTUNITY_ID),
      ]),
    ],
    materialsConstraints: [
      constraint('mat-unknown', 'No verified fabric performance; materials remain unknown pending sampling.', 'materials', 'needs_validation'),
    ],
    costConstraints: [
      constraint('cost-unknown', 'Development cost and MOQ unknown for this public rebuild.', 'cost', 'needs_validation'),
    ],
    productionConstraints: [
      constraint('prod-unknown', 'Production capacity and lead time are unknown.', 'production', 'needs_validation'),
    ],
    differentiationGoals: [
      constraint('diff-silhouette', 'Differentiate silhouette and proportion across three directions.', 'differentiation', 'human_decision'),
    ],
    openQuestions: [
      constraint('oq-brand-fit', 'Brand fit and exact price band remain needs_validation.', 'open', 'needs_validation'),
    ],
    constraintSources: [String(R0_OPPORTUNITY_ID), String(R0_DECISION_ID)],
    confirmation: {
      actorId: 'local-human',
      actorKind: 'human',
      confirmedAt: R0_RESEARCH_ACCESSED_AT,
    },
    status: 'confirmed',
  },
}

type ConceptSeed = {
  readonly id: ReturnType<typeof DesignConceptId>
  readonly name: string
  readonly intent: string
  readonly silhouette: string
  readonly proportion: string
  readonly material: string
  readonly color: string
  readonly construction: readonly string[]
  readonly functional: readonly string[]
  readonly scenarios: readonly string[]
  readonly transform: string
  readonly riskFeature: string
  readonly riskDiff: string
  readonly unknown: string
}

const CONCEPTS: readonly ConceptSeed[] = [
  {
    id: R0_CONCEPT_URBAN_ID,
    name: 'Urban Field Everyday',
    intent: 'Everyday urban wear with relaxed utility cues for commuting and casual layers.',
    silhouette: 'Relaxed straight body with soft shoulder',
    proportion: 'Hip-length; ease through torso',
    material: 'Midweight cotton-twill direction (unverified)',
    color: 'Khaki / stone',
    construction: ['Patch pockets', 'Simple front zip', 'Soft collar'],
    functional: ['Light weather layering', 'Pocket storage for commute'],
    scenarios: ['City commute', 'Weekend casual'],
    transform: 'Inherit khaki/utility cue; drop brand-specific funnel neck; relax proportion for everyday.',
    riskFeature: 'Public khaki utility listings',
    riskDiff: 'Softer shoulder and hip length vs cropped structured peers',
    unknown: 'Fabric hand-feel and wash durability unknown',
  },
  {
    id: R0_CONCEPT_CROPPED_ID,
    name: 'Cropped Structured Utility',
    intent: 'Shorter, structured utility with clearer proportion contrast.',
    silhouette: 'Boxy cropped body with defined shoulder',
    proportion: 'Cropped above hip; higher waist emphasis',
    material: 'Structured canvas-like direction (unverified)',
    color: 'Olive khaki',
    construction: ['Flap pockets', 'Storm flap', 'Contrasting collar stand'],
    functional: ['Visual structure', 'Layer over light knits'],
    scenarios: ['Urban daywear', 'Photo/editorial layering'],
    transform: 'Recombine pocket/flap cues; invert length vs everyday direction; keep non-copy silhouette.',
    riskFeature: 'Structured utility jackets with flap pockets',
    riskDiff: 'Cropped boxy proportion and storm flap vs relaxed everyday',
    unknown: 'Interlining and collar construction feasibility unknown',
  },
  {
    id: R0_CONCEPT_LIGHT_ID,
    name: 'Light Technical Transition',
    intent: 'Lightweight transitional shell exploring function over mass utility styling.',
    silhouette: 'Slimmer A-line shell with articulated sleeve',
    proportion: 'Mid-thigh adaptable hem; closer through chest',
    material: 'Lightweight technical shell direction (unverified)',
    color: 'Sand with tonal hardware',
    construction: ['Hidden zip pockets', 'Adjustable hem', 'Articulated elbow'],
    functional: ['Packable travel layer', 'Light rain resistance hypothesis'],
    scenarios: ['Travel transition', 'Shoulder-season outdoor'],
    transform: 'Reverse heavy khaki massing; emphasize light shell and adjustable hem as original transformation.',
    riskFeature: 'Technical light jackets in public listings',
    riskDiff: 'A-line mid-thigh + articulated sleeve vs boxy cropped and relaxed everyday',
    unknown: 'Waterproof rating and seam tape capability unknown',
  },
]

/** R0 DesignConcept seeds. */
export const R0_CONCEPT_SEEDS: readonly {
  id: ReturnType<typeof DesignConceptId>
  record: DesignConceptRecordV0
}[] = CONCEPTS.map(concept => ({
  id: concept.id,
  record: {
    ...envelope,
    conceptSetId: R0_CONCEPT_SET_ID as string,
    briefId: R0_BRIEF_ID as string,
    briefRevision: 0,
    conceptName: concept.name,
    designIntent: concept.intent,
    silhouette: concept.silhouette,
    proportionAndLength: concept.proportion,
    materialDirection: concept.material,
    colorDirection: concept.color,
    constructionAndDetails: [...concept.construction],
    functionalValue: [...concept.functional],
    targetUseScenarios: [...concept.scenarios],
    marketEvidenceLinks: [{
      type: 'trend_cluster',
      id: 'r0-cluster-tc-khaki-urban-utility',
      usedFor: 'market_context',
    }],
    originalTransformationNotes: [concept.transform],
    competitorSimilarityRisks: [{
      reference: concept.riskFeature,
      similarFeature: concept.riskFeature,
      difference: concept.riskDiff,
      riskLevel: 'medium',
      needsExpertReview: true,
      note: 'Not a legal clearance; public-rebuild similarity note only.',
    }],
    productionUnknowns: [concept.unknown],
    constraintCoverage: [
      { constraintId: 'mk-utility-cues', covered: true, note: null },
      { constraintId: 'ma-copy-sku', covered: true, note: null },
    ],
    status: 'review_ready',
  },
}))

/** R0 ConceptSet seed (review_ready with three members). */
export const R0_CONCEPT_SET_SEED: {
  id: ReturnType<typeof ConceptSetId>
  record: ConceptSetRecordV0
} = {
  id: R0_CONCEPT_SET_ID,
  record: {
    ...envelope,
    briefId: R0_BRIEF_ID as string,
    briefRevision: 0,
    conceptRefs: [
      { conceptId: R0_CONCEPT_URBAN_ID as string, conceptRevision: 0 },
      { conceptId: R0_CONCEPT_CROPPED_ID as string, conceptRevision: 0 },
      { conceptId: R0_CONCEPT_LIGHT_ID as string, conceptRevision: 0 },
    ],
    differentiationRuleVersion: DIFFERENTIATION_RULE_VERSION,
    differentiationCheck: {
      ruleVersion: DIFFERENTIATION_RULE_VERSION,
      passed: true,
      pairwise: [],
      failureReasons: [],
      evaluatedAt: R0_RESEARCH_ACCESSED_AT,
    },
    readinessCheck: {
      passed: true,
      failureReasons: [],
      evaluatedAt: R0_RESEARCH_ACCESSED_AT,
    },
    status: 'review_ready',
    isCurrent: true,
  },
}

const AI_DISCLOSURE =
  'Public case rebuild / offline schematic draft / not real customer deliverable. Not a production specification.'

function visualSeed(
  id: ReturnType<typeof VisualDraftId>,
  conceptId: ReturnType<typeof DesignConceptId>,
  artifactId: ReturnType<typeof DesignArtifactId>,
  label: string,
): { id: ReturnType<typeof VisualDraftId>; record: VisualDraftRecordV0 } {
  return {
    id,
    record: {
      ...envelope,
      conceptId: conceptId as string,
      conceptRevision: 0,
      generationMode: 'recorded_fixture',
      providerRef: null,
      modelRef: null,
      providerJobRef: null,
      inputSnapshotRef: `r0-input/${String(conceptId)}`,
      inputSnapshotHash: `sha256:r0-${String(conceptId)}`,
      promptOrContextRef: null,
      referenceAssetRefs: [],
      artifactRef: String(artifactId),
      artifactHash: `sha256:artifact-${String(artifactId)}`,
      mediaType: 'image/svg+xml',
      width: 800,
      height: 1000,
      requestedAt: R0_RESEARCH_ACCESSED_AT,
      generatedAt: R0_RESEARCH_ACCESSED_AT,
      failedAt: null,
      status: 'succeeded',
      failureCode: null,
      failureMessage: null,
      attributeConsistencyChecks: [{
        checkId: 'silhouette-match',
        status: 'pass',
        message: `${label}: schematic aligned to concept silhouette text (recorded).`,
      }],
      humanReviewStatus: 'not_reviewed',
      usageBoundary: 'project_private_view_only',
      aiDisclosure: AI_DISCLOSURE,
      contentCredential: { status: 'not_available', manifestRef: null },
    },
  }
}

/** R0 VisualDraft seeds. */
export const R0_VISUAL_SEEDS = [
  visualSeed(R0_VISUAL_URBAN_ID, R0_CONCEPT_URBAN_ID, R0_ARTIFACT_URBAN_ID, 'Urban Field'),
  visualSeed(R0_VISUAL_CROPPED_ID, R0_CONCEPT_CROPPED_ID, R0_ARTIFACT_CROPPED_ID, 'Cropped Structured'),
  visualSeed(R0_VISUAL_LIGHT_ID, R0_CONCEPT_LIGHT_ID, R0_ARTIFACT_LIGHT_ID, 'Light Technical'),
] as const

function artifactSeed(
  id: ReturnType<typeof DesignArtifactId>,
  rel: string,
): { id: ReturnType<typeof DesignArtifactId>; record: DesignArtifactRecordV0 } {
  return {
    id,
    record: {
      ...envelope,
      mediaType: 'image/svg+xml',
      contentHash: `sha256:artifact-${String(id)}`,
      width: 800,
      height: 1000,
      projectRelativeRef: rel,
      tombstone: false,
      tombstoneReason: null,
      deletedAt: null,
    },
  }
}

/** R0 DesignArtifact seeds (project-relative schematic refs only). */
export const R0_ARTIFACT_SEEDS = [
  artifactSeed(R0_ARTIFACT_URBAN_ID, 'design/r0/urban-field-everyday.svg'),
  artifactSeed(R0_ARTIFACT_CROPPED_ID, 'design/r0/cropped-structured-utility.svg'),
  artifactSeed(R0_ARTIFACT_LIGHT_ID, 'design/r0/light-technical-transition.svg'),
] as const

/**
 * Whether a stored R0 design envelope satisfies public-rebuild invariants.
 * @param record - Candidate row.
 * @param projectId - Expected owning project.
 */
export function isValidR0DesignSeed(
  record: { projectId: string; origin: string; accessMode: string },
  projectId: ProjectId = R0_PROJECT_ID,
): boolean {
  return record.projectId === String(projectId)
    && record.origin === 'recorded_seed'
    && record.accessMode === 'read-only'
}
