/**
 * R0 public-rebuild research seed for the Utility Jacket case (docs 27 / 41).
 * Fixed identities and 2026-09-21 recorded semantics; url_only, no product images.
 * @module @gentlexx/dsh-fashion-research/src/seed/r0-utility-jacket
 */

import { R0_PROJECT_ID } from '@gentlexx/dsh-fashion-project'
import type { ProjectId } from '@gentlexx/dsh-fashion-project/types'
import { EvidenceId, ResearchTaskId, SampleId, SourceId } from '../ids.ts'
import type { EvidenceRecordV0 } from '../schema/v0/evidence.ts'
import type { ResearchTaskRecordV0 } from '../schema/v0/research-task.ts'
import type { SampleRecordV0 } from '../schema/v0/sample.ts'
import type { SourceRecordV0 } from '../schema/v0/source.ts'
import { FASHION_RESEARCH_SCHEMA_VERSION } from '../types.ts'

/** Fixed R0 research access timestamp (recorded public web snapshot date). */
export const R0_RESEARCH_ACCESSED_AT = '2026-09-21T12:00:00.000Z'

/** Reserved R0 ResearchTask id. */
export const R0_TASK_ID = ResearchTaskId('r0-task-us-womens-khaki-utility-jacket')

const envelope = {
  projectId: R0_PROJECT_ID as string,
  origin: 'system_seed' as const,
  accessMode: 'read-only' as const,
  revision: 0,
  createdAt: R0_RESEARCH_ACCESSED_AT,
  updatedAt: R0_RESEARCH_ACCESSED_AT,
  createdBy: 'system-seed' as const,
  updatedBy: 'system-seed' as const,
  schemaVersion: FASHION_RESEARCH_SCHEMA_VERSION as 0,
  archivedAt: null,
}

/** Canonical R0 ResearchTask body. */
export const R0_TASK_RECORD: ResearchTaskRecordV0 = {
  ...envelope,
  title: '美国女装卡其 Utility Jacket｜公开重建研究',
  note: 'Recorded public-web rebuild (2026-09-21). Not a live scrape and not a client case.',
  status: 'ready_for_review',
}

type SourceSeed = {
  readonly id: ReturnType<typeof SourceId>
  readonly record: SourceRecordV0
  readonly sample: { readonly id: ReturnType<typeof SampleId>; readonly record: SampleRecordV0 }
}

function urlSource(input: {
  id: string
  title: string
  url: string
  publisherOrPlatform: string
  sourceKind: SourceRecordV0['sourceKind']
  attribution: string
  sampleLabel: string
  rawFields: SampleRecordV0['rawFields']
  sampleStatus?: SampleRecordV0['status']
  sampleNote?: string
}): SourceSeed {
  const id = SourceId(input.id)
  const sampleId = SampleId(`${input.id}-sample`)
  return {
    id,
    record: {
      ...envelope,
      taskId: R0_TASK_ID as string,
      locatorType: 'url',
      url: input.url,
      urlNormalized: input.url,
      attachmentRef: null,
      title: input.title,
      publisherOrPlatform: input.publisherOrPlatform,
      sourceKind: input.sourceKind,
      accessedAt: R0_RESEARCH_ACCESSED_AT,
      publishedAt: null,
      captureMode: 'recorded_public_web',
      usageBoundary: 'public_attributed',
      externalProcessing: 'denied',
      availabilityStatus: 'available',
      attribution: input.attribution,
      contentFingerprint: null,
    },
    sample: {
      id: sampleId,
      record: {
        ...envelope,
        taskId: R0_TASK_ID as string,
        sourceId: id as string,
        label: input.sampleLabel,
        externalItemId: null,
        locator: input.url,
        observedAt: R0_RESEARCH_ACCESSED_AT,
        rawFields: input.rawFields,
        screenshotRefs: [],
        note: input.sampleNote ?? null,
        status: input.sampleStatus ?? 'confirmed',
      },
    },
  }
}

/** Twelve R0 Sources (S01–S04, E01–E08) each with one Sample. */
export const R0_SOURCE_SEEDS: readonly SourceSeed[] = [
  urlSource({
    id: 'r0-source-s01',
    title: 'Pinterest Predicts 2026：Khaki Coded',
    url: 'https://business.pinterest.com/nb/pdf/pinterest-predicts/2026-trend-report/',
    publisherOrPlatform: 'Pinterest',
    sourceKind: 'report',
    attribution: 'Pinterest Predicts 2026 Fashion Trend report (public PDF).',
    sampleLabel: 'S01 trend-report observation',
    rawFields: [
      { name: 'utility shirt search change', value: '+45%' },
      { name: 'field jacket outfit men search change', value: '+65%' },
      { name: 'window', value: '2024-09 to 2025-08 vs prior year' },
    ],
  }),
  urlSource({
    id: 'r0-source-s02',
    title: 'Vogue Spring 2026：Club Khaki／Uniform Dressing',
    url: 'https://www.vogue.com/article/the-spring-2026-trend-report-a-season-of-uniform-dressing-rococo-flourishes-and-much-more',
    publisherOrPlatform: 'Vogue',
    sourceKind: 'editorial',
    attribution: 'Vogue Spring 2026 Trend Report (public article).',
    sampleLabel: 'S02 editorial observation',
    rawFields: [
      { name: 'verification_status', value: 'editorial claim not reverified for the public candidate' },
    ],
    sampleStatus: 'ready_for_review',
    sampleNote: 'The page identity is retained for traceability; the thematic summary requires re-verification before public use.',
  }),
  urlSource({
    id: 'r0-source-s03',
    title: 'Vogue 2026：Military Jacket Styling',
    url: 'https://www.vogue.com/article/military-jacket-trend',
    publisherOrPlatform: 'Vogue',
    sourceKind: 'editorial',
    attribution: 'Vogue military jacket trend article (public).',
    sampleLabel: 'S03 styling observation',
    rawFields: [
      { name: 'theme', value: 'khaki military jacket linked to 2026 styling' },
    ],
  }),
  urlSource({
    id: 'r0-source-s04',
    title: 'Vogue FW2026 预测：Khaki 色彩延续',
    url: 'https://www.vogue.com/article/5-womenswear-trend-predictions-for-fall-winter-2026',
    publisherOrPlatform: 'Vogue',
    sourceKind: 'editorial',
    attribution: 'Vogue FW2026 womenswear predictions (public).',
    sampleLabel: 'S04 color prediction observation',
    rawFields: [
      { name: 'color', value: 'khaki listed among FW2026 colors' },
    ],
  }),
  urlSource({
    id: 'r0-source-e01',
    title: 'H&M US Denim Utility Jacket',
    url: 'https://www2.hm.com/en_us/productpage.1210844004.html',
    publisherOrPlatform: 'H&M US',
    sourceKind: 'product_page',
    attribution: 'H&M US product page observed 2026-09-21.',
    sampleLabel: 'E01 product sample',
    rawFields: [
      { name: 'price', value: '39.99', unit: 'USD' },
      { name: 'discount_visible', value: 'none' },
      { name: 'color', value: 'light khaki' },
      { name: 'material', value: '100% cotton denim' },
    ],
    sampleNote: 'Price and availability are volatile page states; this record is a dated observation, not live market data.',
  }),
  urlSource({
    id: 'r0-source-e02',
    title: "H&M US Women's Cargo & Utility Jackets",
    url: 'https://www2.hm.com/en_us/ladies/shop-by-product/jackets-and-coats/cargo.html',
    publisherOrPlatform: 'H&M US',
    sourceKind: 'category_page',
    attribution: 'H&M US category page observed 2026-09-21.',
    sampleLabel: 'E02 category sample',
    rawFields: [
      { name: 'verification_status', value: 'current item count and discount state not reverified' },
    ],
    sampleStatus: 'ready_for_review',
    sampleNote: 'Volatile count and discount values were removed from the public candidate pending a fresh review.',
  }),
  urlSource({
    id: 'r0-source-e03',
    title: "ZARA US Women's Khaki Jackets",
    url: 'https://www.zara.com/us/en/woman-khaki-jackets-l17953.html',
    publisherOrPlatform: 'ZARA US',
    sourceKind: 'category_page',
    attribution: 'ZARA US khaki jackets category observed 2026-09-21.',
    sampleLabel: 'E03 category sample',
    rawFields: [
      { name: 'source_scope', value: 'khaki-jacket category URL' },
      { name: 'verification_status', value: 'dynamic listing and discount facts not reverified' },
    ],
    sampleStatus: 'ready_for_review',
    sampleNote: 'Dynamic listing facts were removed from the public candidate pending a fresh review.',
  }),
  urlSource({
    id: 'r0-source-e04',
    title: 'MANGO US Funnel Neck Parka with Pockets',
    url: 'https://shop.mango.com/us/en/p/women/jackets/cropped/funnel-neck-parka-with-pockets/27094776/37/00',
    publisherOrPlatform: 'MANGO US',
    sourceKind: 'product_page',
    attribution: 'MANGO US product page observed 2026-09-21.',
    sampleLabel: 'E04 product sample',
    rawFields: [
      { name: 'verification_status', value: 'price, discount, and stock state not reverified' },
    ],
    sampleStatus: 'ready_for_review',
    sampleNote: 'Volatile price, discount, and stock values were removed from the public candidate pending a fresh review.',
  }),
  urlSource({
    id: 'r0-source-e05',
    title: 'MANGO US Cotton Jacket with Contrasting Collar',
    url: 'https://shop.mango.com/us/en/p/women/trench-coats-and-parkas/parkas/cotton-jacket-with-contrasting-collar_87075944',
    publisherOrPlatform: 'MANGO US',
    sourceKind: 'product_page',
    attribution: 'MANGO US product page observed 2026-09-21.',
    sampleLabel: 'E05 product sample',
    rawFields: [
      { name: 'verification_status', value: 'page state drifted; historical commercial facts not retained as confirmed' },
    ],
    sampleStatus: 'ready_for_review',
    sampleNote: 'The recorded page state drifted. Exact historical price, discount, and stock values require separate evidence.',
  }),
  urlSource({
    id: 'r0-source-e06',
    title: 'MANGO US Oversized Denim Parka',
    url: 'https://shop.mango.com/us/en/p/women/jackets/oversized-denim-parka/27045973/37/00',
    publisherOrPlatform: 'MANGO US',
    sourceKind: 'product_page',
    attribution: 'MANGO US product page observed 2026-09-21.',
    sampleLabel: 'E06 product sample',
    rawFields: [
      { name: 'verification_status', value: 'page state drifted; historical commercial facts not retained as confirmed' },
    ],
    sampleStatus: 'ready_for_review',
    sampleNote: 'The recorded page state drifted. Exact historical price and discount values require separate evidence.',
  }),
  urlSource({
    id: 'r0-source-e07',
    title: 'Nordstrom Princess Polly Livya Cotton Utility Jacket',
    url: 'https://www.nordstrom.com/s/princess-polly-livya-cotton-utility-jacket/8777350',
    publisherOrPlatform: 'Nordstrom',
    sourceKind: 'product_page',
    attribution: 'Nordstrom product page observed 2026-09-21.',
    sampleLabel: 'E07 product sample',
    rawFields: [
      { name: 'verification_status', value: 'current price and stock state not reverified' },
    ],
    sampleStatus: 'ready_for_review',
    sampleNote: 'Volatile price and stock values were removed from the public candidate pending a fresh review.',
  }),
  urlSource({
    id: 'r0-source-e08',
    title: 'Nordstrom Baukjen Drake Utility Jacket',
    url: 'https://www.nordstrom.com/s/baukjen-drake-utility-jacket/9099440',
    publisherOrPlatform: 'Nordstrom',
    sourceKind: 'product_page',
    attribution: 'Nordstrom product page observed 2026-09-21.',
    sampleLabel: 'E08 product sample',
    rawFields: [
      { name: 'price', value: '345', unit: 'USD' },
      { name: 'color', value: 'deep khaki' },
      { name: 'material', value: 'organic cotton' },
    ],
    sampleNote: 'Price is a volatile page state and the material summary is incomplete; this is not live market data.',
  }),
]

type EvidenceSeed = {
  readonly id: ReturnType<typeof EvidenceId>
  readonly record: EvidenceRecordV0
}

function evidenceSeed(input: {
  id: string
  subjectType: 'source' | 'sample'
  subjectId: string
  observation: string
  claim: string
  claimType: EvidenceRecordV0['claimType']
  evidenceGrade: EvidenceRecordV0['evidenceGrade']
  method: string | null
  limitations: readonly string[]
  excerpt?: string | null
  reviewStatus?: EvidenceRecordV0['reviewStatus']
  reviewNote?: string
}): EvidenceSeed {
  return {
    id: EvidenceId(input.id),
    record: {
      ...envelope,
      taskId: R0_TASK_ID as string,
      subjectType: input.subjectType,
      subjectId: input.subjectId,
      excerpt: input.excerpt ?? null,
      observation: input.observation,
      claim: input.claim,
      claimType: input.claimType,
      evidenceGrade: input.evidenceGrade,
      method: input.method,
      limitations: [...input.limitations],
      reviewStatus: input.reviewStatus ?? 'confirmed',
      reviewedBy: input.reviewStatus === 'pending_review' ? null : 'local-human',
      reviewedAt: input.reviewStatus === 'pending_review' ? null : R0_RESEARCH_ACCESSED_AT,
      reviewNote: input.reviewNote ?? (input.reviewStatus === 'pending_review'
        ? 'Requires source re-verification before public use.'
        : 'R0 recorded rebuild human confirmation of public-page observation boundaries.'),
    },
  }
}

function sourceSeedAt(index: number): SourceSeed {
  const seed = R0_SOURCE_SEEDS[index]
  if (seed === undefined) {
    throw new Error(`R0_SOURCE_SEEDS missing index ${String(index)}`)
  }
  return seed
}

const s01 = sourceSeedAt(0)
const s02 = sourceSeedAt(1)
const e01 = sourceSeedAt(4)
const e04 = sourceSeedAt(7)

/**
 * R0 Evidence covering observed / derived / needs_validation with support boundaries.
 * Does not create creative or G4 rows.
 */
export const R0_EVIDENCE_SEEDS: readonly EvidenceSeed[] = [
  evidenceSeed({
    id: 'r0-evidence-observed-pinterest-search',
    subjectType: 'sample',
    subjectId: s01.sample.id as string,
    observation: 'Pinterest Predicts report lists utility shirt +45% and field jacket outfit men +65% in the stated window.',
    claim: 'Public Pinterest search metrics show growth signals related to utility/field jacket aesthetics.',
    claimType: 'observed',
    evidenceGrade: 'G1',
    method: null,
    limitations: ['Supports search interest only; cannot support US womenswear sales outcomes.'],
    excerpt: 'utility shirt +45%; field jacket outfit men +65%',
  }),
  evidenceSeed({
    id: 'r0-evidence-observed-vogue-khaki',
    subjectType: 'sample',
    subjectId: s02.sample.id as string,
    observation: 'The recorded draft attributes khaki and uniform/military dressing to this Vogue page; the claim was not reverified for the public candidate.',
    claim: 'Whether this page supports the recorded khaki/uniform interpretation still needs source review.',
    claimType: 'needs_validation',
    evidenceGrade: 'G0',
    method: null,
    limitations: ['Cannot support the thematic claim until the source is reverified; cannot support scale, duration, or sell-through.'],
    reviewStatus: 'pending_review',
  }),
  evidenceSeed({
    id: 'r0-evidence-observed-hm-price',
    subjectType: 'sample',
    subjectId: e01.sample.id as string,
    observation: 'H&M US product page shows US$39.99 with no discount badge at observation time; light khaki cotton denim utility details are visible in page text.',
    claim: 'At least one US ecommerce listing presents a full-price khaki utility jacket near US$40.',
    claimType: 'observed',
    evidenceGrade: 'G1',
    method: null,
    limitations: ['Price is a page state, not sales volume.'],
  }),
  evidenceSeed({
    id: 'r0-evidence-observed-discount-vs-stock',
    subjectType: 'sample',
    subjectId: e04.sample.id as string,
    observation: 'The recorded draft contained a discount and scarce-size observation for this page, but the volatile values were not reverified for the public candidate.',
    claim: 'Whether discount and scarce-size states co-existed at the recorded time still needs source review.',
    claimType: 'needs_validation',
    evidenceGrade: 'G0',
    method: null,
    limitations: [
      'The page state is volatile and was not reverified; neither discount nor availability would establish sales volume.',
    ],
    reviewStatus: 'pending_review',
  }),
  evidenceSeed({
    id: 'r0-evidence-derived-price-tiers',
    subjectType: 'sample',
    subjectId: e01.sample.id as string,
    observation: 'Two rechecked pages in the fixed R0 set recorded US$39.99 and US$345 at capture time; the remaining price entries were not reverified.',
    claim: 'A wider price-tier interpretation remains a hypothesis until the rest of the fixed sample is reverified.',
    claimType: 'derived',
    evidenceGrade: 'G0',
    method: 'Compared only the two rechecked dated observations; no live pricing, market-share, or representative-sample model.',
    limitations: [
      'Eight pages are not a representative market sample.',
      'Cannot infer willingness-to-pay or brand fit without designer validation.',
      'The six remaining commercial samples require fresh source review.',
    ],
    reviewStatus: 'pending_review',
  }),
  evidenceSeed({
    id: 'r0-evidence-needs-validation-target',
    subjectType: 'source',
    subjectId: s01.id as string,
    observation: 'Public materials mention Gen Z/Millennial adoption cues and Fall 2026 timing, but do not fix brand price band or development lead time.',
    claim: 'US target age band, Fall 2026 lead time, and brand DNA fit still require designer confirmation.',
    claimType: 'needs_validation',
    evidenceGrade: 'G0',
    method: null,
    limitations: ['Must not be displayed as established fact in product conclusions.'],
  }),
]

/**
 * Whether a stored R0 research task row satisfies public-rebuild invariants.
 * @param record - Candidate task row under {@link R0_TASK_ID}.
 * @param projectId - Expected owning project.
 */
export function isValidR0TaskSeed(record: ResearchTaskRecordV0, projectId: ProjectId = R0_PROJECT_ID): boolean {
  return record.projectId === String(projectId)
    && record.origin === 'system_seed'
    && record.accessMode === 'read-only'
    && record.schemaVersion === FASHION_RESEARCH_SCHEMA_VERSION
    && record.title.length > 0
}

/**
 * Whether a stored R0 source row matches seed invariants for its reserved id.
 * @param record - Candidate source row.
 * @param projectId - Expected owning project.
 */
export function isValidR0ChildSeed(
  record: { projectId: string; origin: string; accessMode: string; taskId: string },
  projectId: ProjectId = R0_PROJECT_ID,
): boolean {
  return record.projectId === String(projectId)
    && record.origin === 'system_seed'
    && record.accessMode === 'read-only'
    && record.taskId === String(R0_TASK_ID)
}
