/**
 * Fashion Design F3-02 review / validity / deliverable registry behavior.
 */

import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Storage from '@deepseek-ai/dsh-storage'
import { DomainFacility } from '@deepseek-ai/dsh-storage-domain'
import { MemoryStorageBackend } from '../../../storage/storage-domain/tests/helpers/memory-backend.ts'
import { JsonStorageBackend } from '@deepseek-ai/dsh-storage-json'
import FashionProjectRegistry, { R0_PROJECT_ID } from '@gentlexx/dsh-fashion-project'
import FashionResearchRegistry from '@gentlexx/dsh-fashion-research'
import FashionAnalysisRegistry from '@gentlexx/dsh-fashion-analysis'
import   FashionDesignRegistry, {
  DesignDeliverableId,
  FASHION_DESIGN_DOMAIN_VERSION,
  FashionDesignIdempotencyConflictError,
  FashionDesignRenderFailedError,
  hashSnapshotPayload,
  R0_BRIEF_ID,
  R0_CONCEPT_CROPPED_ID,
  R0_CONCEPT_SET_ID,
  restrictedLocatorKind,
  ReviewRoundId,
  sha256Hex,
} from '../src/index.ts'

const contexts: Context[] = []

afterEach(async () => {
  while (contexts.length > 0) {
    const ctx = contexts.pop()!
    await ctx.fiber.dispose()
  }
})

async function boot() {
  const ctx = new Context()
  contexts.push(ctx)
  await ctx.plugin(Storage)
  ctx.storage.backend.register('memory', new MemoryStorageBackend())
  const facility = new DomainFacility(ctx, { backend: 'memory', routes: {} })
  ctx.storage.mount('domain', facility)
  ctx.provide('storageDomain', facility)
  await ctx.plugin(FashionProjectRegistry)
  await ctx.plugin(FashionResearchRegistry)
  await ctx.plugin(FashionAnalysisRegistry)
  await ctx.plugin(FashionDesignRegistry)
  return ctx
}

function unknownConstraint(id: string, text: string) {
  return {
    id,
    text,
    kind: 'unknown',
    claimType: 'needs_validation' as const,
    sourceRefs: [] as string[],
    note: null,
  }
}

async function readyThreeDirectionSet(ctx: Context) {
  const project = await ctx.fashionProjectRegistry.create({ title: 'Ordinary review flow' })
  const task = await ctx.fashionResearchRegistry.createTask({
    projectId: project.id,
    title: 'Ordinary research',
  })
  const source = await ctx.fashionResearchRegistry.createSource({
    projectId: project.id,
    taskId: task.id,
    locatorType: 'url',
    url: 'https://example.com/review-item',
    title: 'Review source',
    sourceKind: 'product_page',
    captureMode: 'manual_link',
    usageBoundary: 'view_only',
    externalProcessing: 'denied',
    attribution: 'manual',
  })
  const sample = await ctx.fashionResearchRegistry.createSample({
    projectId: project.id,
    taskId: task.id,
    sourceId: source.id,
    label: 'Review sample',
  })
  const evidence = await ctx.fashionResearchRegistry.createEvidence({
    projectId: project.id,
    taskId: task.id,
    subjectType: 'sample',
    subjectId: sample.id,
    observation: 'Observed listing text',
    evidenceGrade: 'G1',
  })
  await ctx.fashionResearchRegistry.reviewEvidence({
    evidenceId: evidence.id,
    expectedRevision: evidence.revision,
    reviewStatus: 'confirmed',
    reviewNote: 'confirmed',
  })
  const item = await ctx.fashionAnalysisRegistry.createMarketItem({
    projectId: project.id,
    taskId: task.id,
    itemType: 'garment_product',
    displayName: 'Review market item',
    observationLinks: [{
      sampleId: sample.id,
      sourceId: source.id,
      evidenceIds: [evidence.id],
    }],
  })
  const signal = await ctx.fashionAnalysisRegistry.createPopularitySignal({
    projectId: project.id,
    taskId: task.id,
    signalType: 'view_count',
    subjectRefs: [{ type: 'market_item', id: String(item.id) }],
    platform: 'example',
    observedAt: new Date().toISOString(),
    rawValue: '10',
    rawUnit: 'views',
    evidenceIds: [evidence.id],
    methodVersion: 'v0',
    limitations: ['synthetic'],
  })
  const cluster = await ctx.fashionAnalysisRegistry.createTrendCluster({
    projectId: project.id,
    taskId: task.id,
    name: 'Review cluster',
    definition: 'Test cluster',
    memberRefs: [{ type: 'market_item', id: String(item.id) }],
    signalIds: [signal.id],
    clusterMethod: 'manual',
    methodVersion: 'v0',
    marketRegions: ['US'],
    timeContext: 'test',
    evidenceGrade: 'G1',
    counterEvidence: [],
    biasesAndGaps: ['synthetic'],
  })
  const opportunity = await ctx.fashionAnalysisRegistry.createDesignOpportunity({
    projectId: project.id,
    taskId: task.id,
    title: 'Ordinary opportunity',
    opportunityStatement: 'Explore a utility direction for review',
    trendClusterIds: [cluster.id],
    targetMarket: 'US',
    targetUserHypothesis: 'Testers',
    category: 'Jacket',
    timing: 'Now',
    commercialHypotheses: ['h1'],
    creativeSpaces: ['c1'],
    saturationRisks: ['s1'],
    copyingOrIpRisks: ['r1'],
    unknowns: ['u1'],
    evidenceGrade: 'G1',
  })
  const decided = await ctx.fashionAnalysisRegistry.decideOpportunity({
    projectId: project.id,
    taskId: task.id,
    opportunityId: opportunity.id,
    expectedRevision: opportunity.revision,
    action: 'selected',
    reasonCodes: ['evidence_sufficient'],
    note: 'selected for review flow',
  })
  const briefDraft = await ctx.fashionDesignRegistry.createBriefFromOpportunity({
    projectId: project.id,
    opportunityId: opportunity.id,
    expectedOpportunityRevision: decided.opportunity.revision,
    selectionDecisionId: decided.decision.id,
    market: 'United States',
    season: 'Fall',
    category: 'Utility Jacket',
    targetUser: 'Test users',
    mustKeep: [unknownConstraint('mk1', 'Keep utility cues')],
    mustAvoid: [unknownConstraint('ma1', 'Avoid SKU copy')],
    materialsConstraints: [unknownConstraint('mat1', 'Materials unknown')],
    costConstraints: [unknownConstraint('cost1', 'Cost unknown')],
    productionConstraints: [unknownConstraint('prod1', 'Production unknown')],
    differentiationGoals: [unknownConstraint('diff1', 'Differentiate silhouette')],
    openQuestions: [unknownConstraint('oq1', 'Brand fit open')],
  })
  const brief = await ctx.fashionDesignRegistry.confirmBrief({
    projectId: project.id,
    briefId: briefDraft.id,
    expectedRevision: briefDraft.revision,
  })
  const set = await ctx.fashionDesignRegistry.createConceptSet({
    projectId: project.id,
    briefId: brief.id,
    expectedBriefRevision: brief.revision,
  })
  let setRevision = set.revision
  const urban = await ctx.fashionDesignRegistry.createConcept({
    projectId: project.id,
    conceptSetId: set.id,
    expectedConceptSetRevision: setRevision,
    conceptName: 'Urban',
    designIntent: 'Commute layer',
    silhouette: 'Relaxed body',
    proportionAndLength: 'Hip length',
    materialDirection: 'Cotton twill',
    colorDirection: 'Khaki',
    constructionAndDetails: ['Patch pockets'],
    functionalValue: ['Commute layer'],
    targetUseScenarios: ['City commute'],
    originalTransformationNotes: ['Transformed'],
    productionUnknowns: ['Unknown finish'],
  })
  setRevision += 1
  const cropped = await ctx.fashionDesignRegistry.createConcept({
    projectId: project.id,
    conceptSetId: set.id,
    expectedConceptSetRevision: setRevision,
    conceptName: 'Cropped',
    designIntent: 'Editorial crop',
    silhouette: 'Boxy cropped',
    proportionAndLength: 'Cropped',
    materialDirection: 'Canvas',
    colorDirection: 'Sand',
    constructionAndDetails: ['Flap pockets', 'Storm flap'],
    functionalValue: ['Structured layer'],
    targetUseScenarios: ['Editorial daywear'],
    originalTransformationNotes: ['Cropped read'],
    productionUnknowns: ['Unknown trim'],
  })
  setRevision += 1
  await ctx.fashionDesignRegistry.createConcept({
    projectId: project.id,
    conceptSetId: set.id,
    expectedConceptSetRevision: setRevision,
    conceptName: 'Light',
    designIntent: 'Soft shell',
    silhouette: 'Soft A-line',
    proportionAndLength: 'Mid thigh',
    materialDirection: 'Nylon shell',
    colorDirection: 'Stone',
    constructionAndDetails: ['Hidden zip'],
    functionalValue: ['Light weather'],
    targetUseScenarios: ['Travel'],
    originalTransformationNotes: ['Softened'],
    productionUnknowns: ['Unknown coating'],
  })
  setRevision += 1
  expect(ctx.fashionDesignRegistry.evaluateDifferentiation(project.id, set.id).passed).toBe(true)
  const ready = await ctx.fashionDesignRegistry.markConceptSetReviewReady({
    projectId: project.id,
    conceptSetId: set.id,
    expectedRevision: setRevision,
  })
  return { project, set: ready, cropped, urban }
}

describe('FashionDesignRegistry F3-02', () => {
  it('opens fashion_design@1 and seeds R0 recorded approve + public deliverable', async () => {
    expect(FASHION_DESIGN_DOMAIN_VERSION).toBe(1)
    const ctx = await boot()
    const design = ctx.fashionDesignRegistry
    const reviews = design.listReviews(R0_PROJECT_ID)
    expect(reviews).toHaveLength(1)
    const round = reviews[0]!
    expect(String(round.id)).toBe('r0-review-round-utility-jacket')
    expect(round.status).toBe('approved')
    expect(round.origin).toBe('recorded_seed')
    expect(round.accessMode).toBe('read-only')
    expect(round.openedBy).toBe('recorded_demo_human')

    const validity = await design.getApprovalValidity(R0_PROJECT_ID, round.id)
    expect(validity.valid).toBe(true)

    const deliverables = design.listDeliverables(R0_PROJECT_ID)
    expect(deliverables).toHaveLength(1)
    const deliverable = deliverables[0]!
    expect(String(deliverable.id)).toBe('r0-deliverable-public-portfolio')
    expect(deliverable.audienceProfile).toBe('public_portfolio')
    expect(deliverable.status).toBe('ready')
    expect(deliverable.limitations.some(row => /recorded demo/i.test(row))).toBe(true)

    const artifacts = design.listDeliverableArtifacts(R0_PROJECT_ID, deliverable.id)
    expect(artifacts).toHaveLength(3)
    expect(artifacts.map(row => row.kind).sort()).toEqual(['json', 'manifest', 'markdown'])
    const md = artifacts.find(row => row.kind === 'markdown')!
    expect(md.textContent).toContain('# Design Decision Package')
    expect(md.textContent).toContain(deliverable.snapshotHash)
    expect(design.verifyDeliverable(R0_PROJECT_ID, deliverable.id)).toEqual({ ok: true, mismatches: [] })

    await expect(design.openReview({
      projectId: R0_PROJECT_ID,
      conceptSetId: R0_CONCEPT_SET_ID,
      expectedConceptSetRevision: design.getConceptSet(R0_PROJECT_ID, R0_CONCEPT_SET_ID).revision,
    })).rejects.toMatchObject({ name: 'FashionDesignProjectReadOnlyError' })
  })

  it('completes ordinary open → select → approve → generate and invalidates on revise', async () => {
    const ctx = await boot()
    const { project, set, cropped } = await readyThreeDirectionSet(ctx)
    const design = ctx.fashionDesignRegistry

    const round = await design.openReview({
      projectId: project.id,
      conceptSetId: set.id,
      expectedConceptSetRevision: set.revision,
      idempotencyKey: 'ordinary-open-1',
    })
    expect(round.status).toBe('open')
    expect(await design.openReview({
      projectId: project.id,
      conceptSetId: set.id,
      expectedConceptSetRevision: set.revision,
      idempotencyKey: 'ordinary-open-1',
    })).toMatchObject({ id: round.id })

    const liveCropped = design.getConcept(project.id, cropped.id)
    await design.selectConcept({
      projectId: project.id,
      reviewRoundId: round.id,
      conceptId: liveCropped.id,
      expectedConceptRevision: liveCropped.revision,
      reasonCodes: ['originality'],
      reasonText: 'Cropped read is clearest',
    })
    await design.approveSelectedConcept({
      projectId: project.id,
      reviewRoundId: round.id,
      reasonCodes: ['evidence_sufficient'],
      reasonText: 'Approve cropped for handoff',
    })
    expect((await design.getApprovalValidity(project.id, round.id)).valid).toBe(true)

    const deliverable = await design.generateDeliverable({
      projectId: project.id,
      reviewRoundId: round.id,
      audienceProfile: 'public_portfolio',
      idempotencyKey: 'ordinary-gen-1',
    })
    expect(deliverable.status).toBe('ready')
    expect(deliverable.snapshotHash.length).toBe(64)
    const artifacts = design.listDeliverableArtifacts(project.id, deliverable.id)
    expect(artifacts).toHaveLength(3)
    expect(design.verifyDeliverable(project.id, deliverable.id).ok).toBe(true)

    await design.reviseConcept({
      projectId: project.id,
      conceptId: liveCropped.id,
      expectedRevision: liveCropped.revision,
      silhouette: 'Changed silhouette after approval',
    })
    const after = await design.getApprovalValidity(project.id, round.id)
    expect(after.valid).toBe(false)
    expect(after.causes).toContain('concept_revision_changed')
    expect(design.getDeliverable(project.id, deliverable.id).status).toBe('invalidated')
  })

  it('renders the approved exact Concept revision into Markdown and JSON from one snapshot', async () => {
    const ctx = await boot()
    const { project, set, cropped } = await readyThreeDirectionSet(ctx)
    const design = ctx.fashionDesignRegistry
    const round = await design.openReview({
      projectId: project.id,
      conceptSetId: set.id,
      expectedConceptSetRevision: set.revision,
    })
    const approved = design.getConcept(project.id, cropped.id)
    await design.selectConcept({
      projectId: project.id,
      reviewRoundId: round.id,
      conceptId: approved.id,
      expectedConceptRevision: approved.revision,
      reasonCodes: ['originality'],
      reasonText: 'Direction B',
    })
    await design.approveSelectedConcept({
      projectId: project.id,
      reviewRoundId: round.id,
      reasonCodes: ['evidence_sufficient'],
      reasonText: 'Approve direction B',
    })
    expect(approved.designIntent.trim()).not.toBe('')
    expect(approved.silhouette.trim()).not.toBe('')
    expect(approved.proportionAndLength.trim()).not.toBe('')

    for (const audienceProfile of ['public_portfolio', 'designer_handoff'] as const) {
      const deliverable = await design.generateDeliverable({ projectId: project.id, reviewRoundId: round.id, audienceProfile })
      const artifacts = design.listDeliverableArtifacts(project.id, deliverable.id)
      const markdown = artifacts.find(row => row.kind === 'markdown')!.textContent
      expect(markdown).toContain(`- Title: ${approved.conceptName}\n`)
      expect(markdown).toContain(`- Design intent: ${approved.designIntent}\n`)
      expect(markdown).toContain(`- Silhouette: ${approved.silhouette}\n`)
      expect(markdown).toContain(`- Proportion: ${approved.proportionAndLength}\n`)
      const json = JSON.parse(artifacts.find(row => row.kind === 'json')!.textContent) as {
        snapshotHash: string
        snapshot: { selectedConceptPayload: Record<string, unknown>; selectedConceptRef: { id: string; revision: number } }
      }
      expect(json.snapshotHash).toBe(deliverable.snapshotHash)
      expect(json.snapshot.selectedConceptRef).toEqual({ id: String(approved.id), revision: approved.revision })
      expect(json.snapshot.selectedConceptPayload).toMatchObject({
        title: approved.conceptName,
        designIntent: approved.designIntent,
        silhouette: approved.silhouette,
        proportionAndLength: approved.proportionAndLength,
      })
      expect(design.verifyDeliverable(project.id, deliverable.id)).toEqual({ ok: true, mismatches: [] })
    }
  })

  it('request_revision closes the round and refuses further approve', async () => {
    const ctx = await boot()
    const { project, set, cropped } = await readyThreeDirectionSet(ctx)
    const design = ctx.fashionDesignRegistry
    const round = await design.openReview({
      projectId: project.id,
      conceptSetId: set.id,
      expectedConceptSetRevision: set.revision,
    })
    const liveCropped = design.getConcept(project.id, cropped.id)
    await design.requestConceptRevision({
      projectId: project.id,
      reviewRoundId: round.id,
      subjectType: 'concept',
      subjectId: String(liveCropped.id),
      expectedRevision: liveCropped.revision,
      reasonCodes: ['silhouette_or_proportion'],
      reasonText: 'Need a cleaner crop',
    })
    expect(design.getReview(project.id, round.id).status).toBe('changes_requested')
    await expect(design.approveSelectedConcept({
      projectId: project.id,
      reviewRoundId: round.id,
      reasonCodes: ['other'],
    })).rejects.toMatchObject({ name: 'FashionDesignReviewClosedError' })
  })

  it('canonicalizes snapshot payloads stably', () => {
    const a = hashSnapshotPayload({ b: 1, a: 2 })
    const b = hashSnapshotPayload({ a: 2, b: 1 })
    expect(a).toBe(b)
    expect(a).toBe(sha256Hex('{"a":2,"b":1}'))
  })

  it('excludes private and view-only entries from public_portfolio manifests', async () => {
    const { decideInclusion, filterManifestEntries } = await import('../src/export/filter.ts')
    expect(decideInclusion('public_portfolio', 'public_reuse', 'project_private').inclusion).toBe('excluded')
    expect(decideInclusion('public_portfolio', 'view_only', 'view_only').inclusion).toBe('excluded')
    expect(decideInclusion('public_portfolio', 'public_reuse', 'unknown').inclusion).toBe('excluded')
    const entries = filterManifestEntries('public_portfolio', [{
      sourceRef: 'v1',
      evidenceRef: null,
      title: 'Private visual',
      locator: 'local://x',
      accessedAt: null,
      usageBoundary: 'project_private',
      audienceVisibility: 'project_private',
      artifactHash: null,
    }])
    expect(entries[0]!.inclusion).toBe('excluded')
    expect(entries[0]!.exclusionReason).toBe('project-private-not-public')
  })

  it('rejects restricted public locators and keeps them out of artifacts', () => {
    expect(restrictedLocatorKind('C:\\Users\\secret\\draft.png')).toBe('windows-drive-path')
    expect(restrictedLocatorKind('\\\\server\\share\\draft.png')).toBe('unc-path')
    expect(restrictedLocatorKind('/home/secret/draft.png')).toBe('posix-absolute-path')
    expect(restrictedLocatorKind('file:///C:/secret/draft.png')).toBe('file-uri')
  })

  it('rejects, requests research, revokes, and refuses a round without a selection', async () => {
    const ctx = await boot()
    const { project, set, cropped } = await readyThreeDirectionSet(ctx)
    const design = ctx.fashionDesignRegistry
    const rejected = await design.openReview({
      projectId: project.id,
      conceptSetId: set.id,
      expectedConceptSetRevision: set.revision,
    })
    await design.rejectConceptOrSet({
      projectId: project.id,
      reviewRoundId: rejected.id,
      subjectType: 'concept_set',
      subjectId: String(set.id),
      expectedRevision: set.revision,
      reasonCodes: ['market_fit'],
      reasonText: 'Direction does not fit the brief',
    })
    expect(design.getReview(project.id, rejected.id).status).toBe('rejected')

    const researched = await design.openReview({
      projectId: project.id,
      conceptSetId: set.id,
      expectedConceptSetRevision: set.revision,
    })
    const liveCropped = design.getConcept(project.id, cropped.id)
    await design.requestMoreResearch({
      projectId: project.id,
      reviewRoundId: researched.id,
      subjectType: 'concept',
      subjectId: String(liveCropped.id),
      expectedRevision: design.getReview(project.id, researched.id).conceptRefs.find(row => row.id === String(liveCropped.id))!.revision,
      reasonCodes: ['needs_more_research'],
      reasonText: 'Need a source for the price band',
    })
    expect(design.getReview(project.id, researched.id).status).toBe('needs_research')

    const approved = await design.openReview({
      projectId: project.id,
      conceptSetId: set.id,
      expectedConceptSetRevision: set.revision,
    })
    await expect(design.approveSelectedConcept({
      projectId: project.id,
      reviewRoundId: approved.id,
      reasonCodes: ['other'],
    })).rejects.toMatchObject({ name: 'FashionDesignSelectionRequiredError' })
    const approvedConcept = design.getConcept(project.id, cropped.id)
    const decision = await design.selectConcept({
      projectId: project.id,
      reviewRoundId: approved.id,
      conceptId: approvedConcept.id,
      expectedConceptRevision: design
        .getReview(project.id, approved.id)
        .conceptRefs.find(row => row.id === String(approvedConcept.id))!.revision,
      reasonCodes: ['originality'],
    })
    expect(decision.actorKind).toBe('local_human')
    expect(decision.frozenInputs).toBeNull()
    const approval = await design.approveSelectedConcept({
      projectId: project.id,
      reviewRoundId: approved.id,
      reasonCodes: ['originality'],
      reasonText: 'Host stamps the actor',
    })
    expect(approval.actorKind).toBe('local_human')
    expect(approval.frozenInputs?.entries.map(row => row.targetType)).toEqual(
      expect.arrayContaining(['brief', 'concept_set', 'concept']),
    )
    await design.revokeApproval({
      projectId: project.id,
      reviewRoundId: approved.id,
      reasonText: 'Withdraw the handoff',
    })
    const after = await design.getApprovalValidity(project.id, approved.id)
    expect(after.valid).toBe(false)
    expect(after.causes).toContain('approval_revoked')
  })

  it('refuses old revisions, cross-project reads, and inherited approval on a new round', async () => {
    const ctx = await boot()
    const { project, set, cropped } = await readyThreeDirectionSet(ctx)
    const other = await ctx.fashionProjectRegistry.create({ title: 'Other project' })
    const design = ctx.fashionDesignRegistry
    const round = await design.openReview({
      projectId: project.id,
      conceptSetId: set.id,
      expectedConceptSetRevision: set.revision,
    })
    const staleConcept = design.getConcept(project.id, cropped.id)
    await expect(design.selectConcept({
      projectId: project.id,
      reviewRoundId: round.id,
      conceptId: staleConcept.id,
      expectedConceptRevision: staleConcept.revision + 9,
      reasonCodes: ['other'],
    })).rejects.toMatchObject({ name: 'FashionDesignRevisionConflictError' })
    expect(() => design.getReview(other.id, round.id)).toThrow(/cross-project|not found/i)
    const live = design.getConcept(project.id, cropped.id)
    const roundRevision = design.getReview(project.id, round.id).conceptRefs.find(row => row.id === String(live.id))!.revision
    await design.selectConcept({
      projectId: project.id,
      reviewRoundId: round.id,
      conceptId: live.id,
      expectedConceptRevision: roundRevision,
      reasonCodes: ['originality'],
    })
    await design.approveSelectedConcept({
      projectId: project.id,
      reviewRoundId: round.id,
      reasonCodes: ['originality'],
    })
    await design.revokeApproval({
      projectId: project.id,
      reviewRoundId: round.id,
      reasonText: 'Close before the next round',
    })
    const next = await design.openReview({
      projectId: project.id,
      conceptSetId: set.id,
      expectedConceptSetRevision: set.revision,
    })
    expect(next.id).not.toBe(round.id)
    expect(next.currentSelectionDecisionId).toBeNull()
    expect(next.currentApprovalDecisionId).toBeNull()
    expect((await design.getApprovalValidity(project.id, next.id)).valid).toBe(false)
  })

  it('invalidates every frozen input once and keeps artifact bytes', async () => {
    const ctx = await boot()
    const { project, set, cropped } = await readyThreeDirectionSet(ctx)
    const design = ctx.fashionDesignRegistry
    const round = await design.openReview({
      projectId: project.id,
      conceptSetId: set.id,
      expectedConceptSetRevision: set.revision,
    })
    const frozenConcept = design.getConcept(project.id, cropped.id)
    const frozenRevision = design.getReview(project.id, round.id).conceptRefs.find(row => row.id === String(frozenConcept.id))!.revision
    await design.selectConcept({
      projectId: project.id,
      reviewRoundId: round.id,
      conceptId: frozenConcept.id,
      expectedConceptRevision: frozenRevision,
      reasonCodes: ['originality'],
    })
    await design.approveSelectedConcept({
      projectId: project.id,
      reviewRoundId: round.id,
      reasonCodes: ['originality'],
    })
    const deliverable = await design.generateDeliverable({
      projectId: project.id,
      reviewRoundId: round.id,
      audienceProfile: 'internal_review',
      idempotencyKey: 'bytes-stay',
    })
    const before = design.listDeliverableArtifacts(project.id, deliverable.id).map(row => row.textContent)
    const brief = design.getBrief(project.id, design.getConceptSet(project.id, set.id).briefId)
    await design.reviseBrief({
      projectId: project.id,
      briefId: brief.id,
      expectedRevision: brief.revision,
      targetUser: 'Revised target user after approval',
    })
    const once = await design.getApprovalValidity(project.id, round.id)
    const twice = await design.getApprovalValidity(project.id, round.id)
    expect(once.valid).toBe(false)
    expect(once.causes).toContain('brief_revision_changed')
    expect(design.listInvalidations(project.id, round.id).filter(row => row.cause === 'brief_revision_changed')).toHaveLength(1)
    expect(twice.invalidationIds).toEqual(once.invalidationIds)
    const note = design.listInvalidations(project.id, round.id).find(row => row.cause === 'brief_revision_changed')
    expect(note?.note).toContain('brief revision changed')
    expect(note?.note).toContain('oldRevision=')
    expect(note?.note).toContain('newRevision=')
    expect(design.getDeliverable(project.id, deliverable.id).status).toBe('invalidated')
    expect(design.listDeliverableArtifacts(project.id, deliverable.id).map(row => row.textContent)).toEqual(before)
  })

  it('conflicts on a reused key and leaves no visible package after an injected failure', async () => {
    const ctx = await boot()
    const { project, set, cropped } = await readyThreeDirectionSet(ctx)
    const design = ctx.fashionDesignRegistry
    const round = await design.openReview({
      projectId: project.id,
      conceptSetId: set.id,
      expectedConceptSetRevision: set.revision,
    })
    const exportConcept = design.getConcept(project.id, cropped.id)
    const exportRevision = design.getReview(project.id, round.id).conceptRefs.find(row => row.id === String(exportConcept.id))!.revision
    await design.selectConcept({
      projectId: project.id,
      reviewRoundId: round.id,
      conceptId: exportConcept.id,
      expectedConceptRevision: exportRevision,
      reasonCodes: ['originality'],
    })
    await design.approveSelectedConcept({
      projectId: project.id,
      reviewRoundId: round.id,
      reasonCodes: ['originality'],
    })
    const first = await design.generateDeliverable({
      projectId: project.id,
      reviewRoundId: round.id,
      audienceProfile: 'public_portfolio',
      idempotencyKey: 'same-key',
    })
    await expect(design.generateDeliverable({
      projectId: project.id,
      reviewRoundId: round.id,
      audienceProfile: 'designer_handoff',
      idempotencyKey: 'same-key',
    })).rejects.toBeInstanceOf(FashionDesignIdempotencyConflictError)
    design.setExportFailureForTest('snapshot')
    await expect(design.generateDeliverable({
      projectId: project.id,
      reviewRoundId: round.id,
      audienceProfile: 'internal_review',
      idempotencyKey: 'will-fail',
    })).rejects.toBeInstanceOf(FashionDesignRenderFailedError)
    design.setExportFailureForTest(null)
    expect(design.listDeliverables(project.id).map(row => String(row.id))).toEqual([String(first.id)])
    expect(design.verifyDeliverable(project.id, first.id).ok).toBe(true)
  })

  it('keeps review decisions and deliverables after a JSON backend reopen', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dsh-f302-repair-'))
    const ctx = new Context()
    contexts.push(ctx)
    await ctx.plugin(Storage)
    ctx.storage.backend.register('json', new JsonStorageBackend(root))
    const facility = new DomainFacility(ctx, { backend: 'json', routes: {} })
    ctx.storage.mount('domain', facility)
    ctx.provide('storageDomain', facility)
    await ctx.plugin(FashionProjectRegistry)
    await ctx.plugin(FashionResearchRegistry)
    await ctx.plugin(FashionAnalysisRegistry)
    await ctx.plugin(FashionDesignRegistry)
    const { project, set, cropped } = await readyThreeDirectionSet(ctx)
    const round = await ctx.fashionDesignRegistry.openReview({
      projectId: project.id,
      conceptSetId: set.id,
      expectedConceptSetRevision: set.revision,
    })
    const persisted = ctx.fashionDesignRegistry.getConcept(project.id, cropped.id)
    const persistedRevision = ctx.fashionDesignRegistry
      .getReview(project.id, round.id)
      .conceptRefs.find(row => row.id === String(persisted.id))!.revision
    await ctx.fashionDesignRegistry.selectConcept({
      projectId: project.id,
      reviewRoundId: round.id,
      conceptId: persisted.id,
      expectedConceptRevision: persistedRevision,
      reasonCodes: ['originality'],
    })
    await ctx.fashionDesignRegistry.approveSelectedConcept({
      projectId: project.id,
      reviewRoundId: round.id,
      reasonCodes: ['originality'],
    })
    const deliverable = await ctx.fashionDesignRegistry.generateDeliverable({
      projectId: project.id,
      reviewRoundId: round.id,
      audienceProfile: 'internal_review',
      idempotencyKey: 'persist-1',
    })
    await ctx.fiber.dispose()
    contexts.pop()
    const reopened = new Context()
    contexts.push(reopened)
    await reopened.plugin(Storage)
    reopened.storage.backend.register('json', new JsonStorageBackend(root))
    const nextFacility = new DomainFacility(reopened, { backend: 'json', routes: {} })
    reopened.storage.mount('domain', nextFacility)
    reopened.provide('storageDomain', nextFacility)
    await reopened.plugin(FashionProjectRegistry)
    await reopened.plugin(FashionResearchRegistry)
    await reopened.plugin(FashionAnalysisRegistry)
    await reopened.plugin(FashionDesignRegistry)
    expect(reopened.fashionDesignRegistry.getDeliverable(project.id, deliverable.id).snapshotHash).toBe(deliverable.snapshotHash)
    expect((await reopened.fashionDesignRegistry.getApprovalValidity(project.id, round.id)).valid).toBe(true)
    await rm(root, { recursive: true, force: true })
  })

  it('exposes branded R0 review and deliverable ids', () => {
    expect(String(ReviewRoundId('r0-review-round-utility-jacket'))).toBe('r0-review-round-utility-jacket')
    expect(String(DesignDeliverableId('r0-deliverable-public-portfolio'))).toBe('r0-deliverable-public-portfolio')
    expect(String(R0_BRIEF_ID)).toContain('brief')
    expect(String(R0_CONCEPT_CROPPED_ID)).toContain('cropped')
  })
})
