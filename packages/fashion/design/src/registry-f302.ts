/**
 * F3-02 review / validity / deliverable commands on FashionDesignRegistry.
 * @module @gentlexx/dsh-fashion-design/src/registry-f302
 */

import { randomUUID } from 'node:crypto'
import type { ProjectId } from '@gentlexx/dsh-fashion-project/types'
import { R0_PROJECT_ID } from '@gentlexx/dsh-fashion-project'
import {
  FashionDesignApprovalInvalidError,
  FashionDesignConceptNotInRoundError,
  FashionDesignConceptSetNotReadyError,
  FashionDesignDeliverableNotFoundError,
  FashionDesignHumanRequiredError,
  FashionDesignIdCollisionError,
  FashionDesignIdempotencyConflictError,
  FashionDesignIntegrityMismatchError,
  FashionDesignInvalidInputError,
  FashionDesignInvalidTransitionError,
  FashionDesignRenderFailedError,
  FashionDesignReviewAlreadyOpenError,
  FashionDesignReviewClosedError,
  FashionDesignReviewNotFoundError,
  FashionDesignRevisionConflictError,
  FashionDesignSeedConflictError,
  FashionDesignSelectionRequiredError,
} from './errors.ts'
import {
  diffFrozenEntry,
  sealFrozenInputs,
} from './export/exact-inputs.ts'
import type { FrozenApprovalInputs, FrozenExactEntry } from './export/exact-inputs.ts'
import {
  AUDIENCE_FILTER_RULE_VERSION,
  DELIVERABLE_RENDERER_VERSION,
  filterManifestEntries,
  projectConceptForAudience,
} from './export/filter.ts'
import { hashSnapshotPayload, sha256Hex } from './export/jcs.ts'
import { renderDecisionPackage } from './export/render.ts'
import {
  ApprovalInvalidationId as brandInvalidationId,
  DeliverableSnapshotId as brandSnapshotId,
  DesignBriefId,
  ConceptSetId as brandConceptSetId,
  DesignConceptId as brandConceptId,
  DesignDeliverableId as brandDeliverableId,
  ExportArtifactId as brandExportArtifactId,
  ReviewDecisionId as brandDecisionId,
  ReviewRoundId as brandRoundId,
  SourceManifestId as brandManifestId,
} from './ids.ts'
import { FashionDesignRegistryBase } from './registry.ts'
import {
  R0_BRIEF_ID,
  R0_CONCEPT_CROPPED_ID,
  R0_CONCEPT_LIGHT_ID,
  R0_CONCEPT_SET_ID,
  R0_CONCEPT_URBAN_ID,
  R0_VISUAL_CROPPED_ID,
  R0_VISUAL_LIGHT_ID,
  R0_VISUAL_URBAN_ID,
} from './seed/r0-design.ts'
import { R0_RESEARCH_ACCESSED_AT } from '@gentlexx/dsh-fashion-research'
import type {
  ApprovalInvalidationRecordV0,
  DeliverableSnapshotRecordV0,
  DesignDeliverableRecordV0,
  ExportArtifactRecordV0,
  ReviewDecisionRecordV0,
  ReviewRoundRecordV0,
  SourceManifestRecordV0,
} from './schema/v0/review.ts'
import { FASHION_DESIGN_SCHEMA_VERSION } from './types.ts'
import type {
  ApprovalInvalidation,
  ApprovalInvalidationId,
  ApprovalValidity,
  AudienceProfile,
  DeliverablePreview,
  DesignConceptId,
  DesignDeliverable,
  DesignDeliverableId,
  ExactRef,
  ExportArtifactId,
  ExportArtifactView,
  ReviewActorKind,
  ReviewDecision,
  ReviewDecisionAction,
  ReviewDecisionId,
  ReviewRound,
  ReviewRoundId,
} from './types.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Fashion Design registry with F3-02 review and deliverable commands. */
    fashionDesignRegistry: FashionDesignRegistry
  }
}

const R0_REVIEW_ROUND_ID = brandRoundId('r0-review-round-utility-jacket')
const R0_SELECT_DECISION_ID = brandDecisionId('r0-review-decision-select-cropped')
const R0_APPROVE_DECISION_ID = brandDecisionId('r0-review-decision-approve-cropped')
const R0_SNAPSHOT_ID = brandSnapshotId('r0-deliverable-snapshot-public')
const R0_MANIFEST_ID = brandManifestId('r0-source-manifest-public')
const R0_DELIVERABLE_ID = brandDeliverableId('r0-deliverable-public-portfolio')
const R0_EXPORT_JSON_ID = brandExportArtifactId('r0-export-json-public')
const R0_EXPORT_MD_ID = brandExportArtifactId('r0-export-md-public')
const R0_EXPORT_MANIFEST_ID = brandExportArtifactId('r0-export-manifest-public')

/**
 * Fashion Design registry with F3-02 review and deliverable commands.
 */
export class FashionDesignRegistry extends FashionDesignRegistryBase {
  /** Test-only export step that should fail before its write becomes visible. */
  private exportFailureStep: 'render' | 'manifest' | 'snapshot' | 'artifact' | 'deliverable' | null = null

  /**
   * Fail one generateDeliverable step. Pass null to clear.
   * @param step - Step that throws before a visible package remains.
   */
  setExportFailureForTest(step: 'render' | 'manifest' | 'snapshot' | 'artifact' | 'deliverable' | null): void {
    this.exportFailureStep = step
  }

  /**
   * After Concept revision, reconcile any approved rounds that referenced the old exact ref.
   * @param input - Same as base reviseConcept.
   */
  override async reviseConcept(input: Parameters<FashionDesignRegistryBase['reviseConcept']>[0]): Promise<
    Awaited<ReturnType<FashionDesignRegistryBase['reviseConcept']>>
  > {
    const concept = await super.reviseConcept(input)
    for (const [roundId, round] of this.requireReviewRounds().entries()) {
      if (round.projectId !== String(input.projectId)) continue
      if (round.currentApprovalDecisionId === null) continue
      await this.reconcileApprovalValidity(input.projectId, roundId)
    }
    return concept
  }

  /** Seed R0 recorded review round, approve Cropped, and public deliverable. */
  protected override async ensureR0ReviewSeed(): Promise<void> {
    const rounds = this.requireReviewRounds()
    const existing = rounds.get(R0_REVIEW_ROUND_ID)
    if (existing !== undefined) {
      if (existing.projectId !== String(R0_PROJECT_ID) || existing.origin !== 'recorded_seed') {
        throw new FashionDesignSeedConflictError('r0-review-drift')
      }
      return
    }

    const brief = this.requireBriefInProject(R0_BRIEF_ID, R0_PROJECT_ID)
    const set = this.requireConceptSetInProject(R0_CONCEPT_SET_ID, R0_PROJECT_ID)
    if (set.status !== 'review_ready') {
      throw new FashionDesignSeedConflictError('r0-concept-set-not-ready')
    }
    const urban = this.requireConceptInProject(R0_CONCEPT_URBAN_ID, R0_PROJECT_ID)
    const cropped = this.requireConceptInProject(R0_CONCEPT_CROPPED_ID, R0_PROJECT_ID)
    const light = this.requireConceptInProject(R0_CONCEPT_LIGHT_ID, R0_PROJECT_ID)
    const conceptRefs = [
      { id: String(R0_CONCEPT_URBAN_ID), revision: urban.revision },
      { id: String(R0_CONCEPT_CROPPED_ID), revision: cropped.revision },
      { id: String(R0_CONCEPT_LIGHT_ID), revision: light.revision },
    ] as [{ id: string; revision: number }, { id: string; revision: number }, { id: string; revision: number }]
    const visualDraftRefs = [
      { id: String(R0_VISUAL_URBAN_ID), revision: 0 },
      { id: String(R0_VISUAL_CROPPED_ID), revision: 0 },
      { id: String(R0_VISUAL_LIGHT_ID), revision: 0 },
    ]
    const comparisonSnapshotHash = sha256Hex(`${String(R0_CONCEPT_SET_ID)}:${set.revision}`)
    const envelope = seedEnvelope(R0_PROJECT_ID)

    const round: ReviewRoundRecordV0 = {
      ...envelope,
      briefRef: { id: String(R0_BRIEF_ID), revision: brief.revision },
      conceptSetRef: { id: String(R0_CONCEPT_SET_ID), revision: set.revision },
      conceptRefs,
      visualDraftRefs,
      comparisonSnapshotHash,
      openedBy: 'recorded_demo_human',
      openedAt: R0_RESEARCH_ACCESSED_AT,
      closedAt: R0_RESEARCH_ACCESSED_AT,
      status: 'approved',
      currentSelectionDecisionId: String(R0_SELECT_DECISION_ID),
      currentApprovalDecisionId: String(R0_APPROVE_DECISION_ID),
      idempotencyKey: 'r0-open-review',
    }
    await rounds.put(R0_REVIEW_ROUND_ID, round)

    const select: ReviewDecisionRecordV0 = {
      ...envelope,
      reviewRoundId: String(R0_REVIEW_ROUND_ID),
      subjectType: 'concept',
      subjectRef: { id: String(R0_CONCEPT_CROPPED_ID), revision: cropped.revision },
      action: 'select',
      selectedConceptRef: { id: String(R0_CONCEPT_CROPPED_ID), revision: cropped.revision },
      reasonCodes: ['originality', 'silhouette_or_proportion'],
      reasonText: 'Recorded demo: cropped structure and feminine proportion read clearest among three candidates. Not a real designer or customer approval.',
      advisoryConditions: ['materials-unverified', 'cost-unverified', 'market-unverified'],
      nextAction: null,
      actorId: 'recorded-demo',
      actorKind: 'recorded_demo_human',
      frozenInputs: null,
    }
    const approve: ReviewDecisionRecordV0 = {
      ...select,
      action: 'approve',
      frozenInputs: this.captureFrozenInputs(R0_PROJECT_ID, round, {
        id: String(R0_CONCEPT_CROPPED_ID),
        revision: cropped.revision,
      }),
      reasonText: 'Recorded demo approve of the selected Cropped Structured Utility exact revision. Not a real designer or customer approval.',
    }
    await this.requireReviewDecisions().put(R0_SELECT_DECISION_ID, select)
    await this.requireReviewDecisions().put(R0_APPROVE_DECISION_ID, approve)

    const selectedPayload = projectConceptForAudience('public_portfolio', {
      id: String(R0_CONCEPT_CROPPED_ID),
      title: cropped.conceptName,
      designIntent: cropped.designIntent,
      silhouette: cropped.silhouette,
      proportionAndLength: cropped.proportionAndLength,
      status: cropped.status,
    }, 'public')

    const hashBody = {
      briefRef: round.briefRef,
      conceptSetRef: round.conceptSetRef,
      selectedConceptRef: select.selectedConceptRef,
      audienceProfile: 'public_portfolio',
      rendererVersion: DELIVERABLE_RENDERER_VERSION,
      selectedPayload,
      limitations: [
        'Recorded demo decision - not a real fashion designer or customer acceptance.',
        'Materials, cost, process, brand fit, and market performance remain unverified.',
      ],
      filterRuleVersion: AUDIENCE_FILTER_RULE_VERSION,
    }
    const snapshotHash = hashSnapshotPayload(hashBody)

    const manifestEntries = filterManifestEntries('public_portfolio', [{
      sourceRef: 'r0-public-page',
      evidenceRef: null,
      title: 'R0 public rebuild sources',
      locator: null,
      accessedAt: R0_RESEARCH_ACCESSED_AT,
      usageBoundary: 'public_reuse',
      audienceVisibility: 'public',
      artifactHash: null,
    }])
    const manifestRecord: SourceManifestRecordV0 = {
      ...envelope,
      snapshotRef: { id: String(R0_SNAPSHOT_ID), revision: 0 },
      entries: manifestEntries,
      generatedAt: R0_RESEARCH_ACCESSED_AT,
    }
    await this.requireSourceManifests().put(R0_MANIFEST_ID, manifestRecord)

    const snapshotRecord: DeliverableSnapshotRecordV0 = {
      ...envelope,
      snapshotSchemaVersion: 1,
      projectRef: { id: String(R0_PROJECT_ID), revision: 0 },
      opportunityRef: null,
      opportunityDecisionRef: null,
      briefRef: round.briefRef,
      briefPayload: {
        market: brief.market,
        season: brief.season,
        category: brief.category,
        targetUser: brief.targetUser,
      },
      conceptSetRef: round.conceptSetRef,
      comparisonPayload: { hash: comparisonSnapshotHash },
      conceptRefs,
      selectedConceptRef: { id: String(R0_CONCEPT_CROPPED_ID), revision: cropped.revision },
      conceptPayloads: [selectedPayload],
      visualDraftRefs,
      visualPayloads: [{ id: String(R0_VISUAL_CROPPED_ID), status: 'succeeded', disclosure: 'recorded_fixture' }],
      reviewRoundRef: { id: String(R0_REVIEW_ROUND_ID), revision: 0 },
      relevantDecisionRefs: [
        { id: String(R0_SELECT_DECISION_ID), revision: 0 },
        { id: String(R0_APPROVE_DECISION_ID), revision: 0 },
      ],
      reviewPayload: {
        reviewRoundId: String(R0_REVIEW_ROUND_ID),
        approvalDecisionId: String(R0_APPROVE_DECISION_ID),
        actorKind: 'recorded_demo_human',
      },
      sourceManifestRef: { id: String(R0_MANIFEST_ID), revision: 0 },
      limitations: hashBody.limitations,
      audienceProfile: 'public_portfolio',
      rendererVersion: DELIVERABLE_RENDERER_VERSION,
      canonicalization: 'rfc8785-jcs',
      hashAlgorithm: 'sha256',
      snapshotHash,
      createdByActorKind: 'recorded_demo_human',
    }
    await this.requireDeliverableSnapshots().put(R0_SNAPSHOT_ID, snapshotRecord)

    const rendered = renderDecisionPackage({
      snapshot: {
        briefPayload: snapshotRecord.briefPayload,
        selectedConceptRef: snapshotRecord.selectedConceptRef,
        selectedConceptPayload: selectedPayload,
        conceptPayloads: snapshotRecord.conceptPayloads,
        reviewPayload: snapshotRecord.reviewPayload,
        limitations: snapshotRecord.limitations,
      },
      audienceProfile: 'public_portfolio',
      deliverableId: String(R0_DELIVERABLE_ID),
      snapshotHash,
    })

    const artifacts: Array<{ id: ExportArtifactId; kind: 'json' | 'markdown' | 'manifest'; text: string; sha: string; mediaType: string; filename: string }> = [
      { id: R0_EXPORT_JSON_ID, kind: 'json', text: rendered.jsonText, sha: rendered.jsonSha256, mediaType: 'application/json', filename: 'r0-deliverable-public-portfolio.json' },
      { id: R0_EXPORT_MD_ID, kind: 'markdown', text: rendered.markdownText, sha: rendered.markdownSha256, mediaType: 'text/markdown; charset=utf-8', filename: 'r0-deliverable-public-portfolio.md' },
      { id: R0_EXPORT_MANIFEST_ID, kind: 'manifest', text: rendered.manifestText, sha: rendered.manifestSha256, mediaType: 'application/json', filename: 'r0-deliverable-public-portfolio.manifest.json' },
    ]
    for (const artifact of artifacts) {
      const row: ExportArtifactRecordV0 = {
        ...envelope,
        deliverableId: String(R0_DELIVERABLE_ID),
        kind: artifact.kind,
        mediaType: artifact.mediaType,
        filename: artifact.filename,
        relativePath: `design/r0/exports/${artifact.filename}`,
        byteLength: Buffer.byteLength(artifact.text, 'utf8'),
        contentSha256: artifact.sha,
        textContent: artifact.text,
      }
      await this.requireExportArtifacts().put(artifact.id, row)
    }

    const deliverable: DesignDeliverableRecordV0 = {
      ...envelope,
      deliverableType: 'design_decision_package',
      audienceProfile: 'public_portfolio',
      reviewRoundId: String(R0_REVIEW_ROUND_ID),
      snapshotRef: { id: String(R0_SNAPSHOT_ID), revision: 0 },
      snapshotHash,
      briefRef: round.briefRef,
      conceptSetRef: round.conceptSetRef,
      selectedConceptRef: { id: String(R0_CONCEPT_CROPPED_ID), revision: cropped.revision },
      approvalDecisionRef: { id: String(R0_APPROVE_DECISION_ID), revision: 0 },
      sourceManifestRef: { id: String(R0_MANIFEST_ID), revision: 0 },
      artifactRefs: artifacts.map(row => ({ id: String(row.id), revision: 0 })),
      knownRisks: ['similarity-unverified', 'production-unverified'],
      limitations: hashBody.limitations,
      handoffTarget: 'public_portfolio_demo',
      status: 'ready',
      frozenBy: 'recorded_demo_human',
      frozenAt: R0_RESEARCH_ACCESSED_AT,
      invalidatedAt: null,
      invalidationRef: null,
      failureReason: null,
      idempotencyKey: 'r0-generate-public',
      rendererVersion: DELIVERABLE_RENDERER_VERSION,
    }
    await this.requireDesignDeliverables().put(R0_DELIVERABLE_ID, deliverable)
  }

  /**
   * Open a ReviewRound for a review_ready ConceptSet exact revision.
   */
  async openReview(input: {
    projectId: ProjectId
    conceptSetId: import('./types.ts').ConceptSetId
    expectedConceptSetRevision: number
    idempotencyKey?: string | null
  }): Promise<ReviewRound> {
    this.requireEditableProject(input.projectId)
    const set = this.requireConceptSetInProject(input.conceptSetId, input.projectId)
    if (set.revision !== input.expectedConceptSetRevision) {
      throw new FashionDesignRevisionConflictError(input.expectedConceptSetRevision, set.revision)
    }
    if (set.status !== 'review_ready' || set.staleReason !== null) {
      throw new FashionDesignConceptSetNotReadyError(set.status === 'review_ready' ? 'stale' : set.status)
    }
    if (input.idempotencyKey) {
      for (const [id, row] of this.requireReviewRounds().entries()) {
        if (row.projectId === String(input.projectId)
          && row.conceptSetRef.id === String(input.conceptSetId)
          && row.conceptSetRef.revision === set.revision
          && row.idempotencyKey === input.idempotencyKey) {
          return toRound(id, row)
        }
      }
    }
    for (const [id, row] of this.requireReviewRounds().entries()) {
      if (row.projectId === String(input.projectId)
        && row.conceptSetRef.id === String(input.conceptSetId)
        && row.conceptSetRef.revision === set.revision
        && row.status === 'open') {
        throw new FashionDesignReviewAlreadyOpenError(String(id))
      }
    }
    const brief = this.requireBriefInProject(DesignBriefId(set.briefId), input.projectId)
    const concepts = this.listConcepts(input.projectId, input.conceptSetId)
    if (concepts.length !== 3) {
      throw new FashionDesignConceptSetNotReadyError('concept-count')
    }
    const readiness = this.evaluateReadiness(input.projectId, input.conceptSetId)
    if (!readiness.passed) {
      throw new FashionDesignConceptSetNotReadyError(readiness.failureReasons.join(',') || 'not-ready')
    }
    const now = new Date().toISOString()
    const id = mintReviewId(brandRoundId, candidate => this.requireReviewRounds().get(candidate) !== undefined)
    const conceptRefs = concepts.map(row => ({ id: String(row.id), revision: row.revision })) as [
      ExactRef, ExactRef, ExactRef,
    ]
    const visualDraftRefs: ExactRef[] = []
    for (const concept of concepts) {
      for (const visual of this.listVisualDrafts(input.projectId, concept.id)) {
        visualDraftRefs.push({ id: String(visual.id), revision: visual.revision })
      }
    }
    const record: ReviewRoundRecordV0 = {
      ...liveEnvelope(input.projectId, now),
      briefRef: { id: set.briefId, revision: brief.revision },
      conceptSetRef: { id: String(input.conceptSetId), revision: set.revision },
      conceptRefs,
      visualDraftRefs,
      comparisonSnapshotHash: sha256Hex(`${String(input.conceptSetId)}:${set.revision}:${now}`),
      openedBy: 'local_human',
      openedAt: now,
      closedAt: null,
      status: 'open',
      currentSelectionDecisionId: null,
      currentApprovalDecisionId: null,
      idempotencyKey: input.idempotencyKey ?? null,
    }
    await this.requireReviewRounds().put(id, record)
    return toRound(id, record)
  }

  /** @param projectId - Project. @param reviewRoundId - Round. */
  getReview(projectId: ProjectId, reviewRoundId: ReviewRoundId): ReviewRound {
    return toRound(reviewRoundId, this.requireRoundInProject(reviewRoundId, projectId))
  }

  /** @param projectId - Project. */
  listReviews(projectId: ProjectId): readonly ReviewRound[] {
    this.requireProject(projectId)
    const rows: ReviewRound[] = []
    for (const [id, record] of this.requireReviewRounds().entries()) {
      if (record.projectId !== String(projectId)) continue
      rows.push(toRound(id, record))
    }
    return rows.sort((a, b) => b.openedAt.localeCompare(a.openedAt))
  }

  /** Select one Concept exact revision in an open round. */
  async selectConcept(input: {
    projectId: ProjectId
    reviewRoundId: ReviewRoundId
    conceptId: DesignConceptId
    expectedConceptRevision: number
    reasonCodes: readonly string[]
    reasonText?: string | null
  }): Promise<ReviewDecision> {
    this.requireEditableProject(input.projectId)
    const round = this.requireOpenRound(input.reviewRoundId, input.projectId)
    const ref = round.conceptRefs.find(row => row.id === String(input.conceptId))
    if (ref === undefined) throw new FashionDesignConceptNotInRoundError(String(input.conceptId))
    if (ref.revision !== input.expectedConceptRevision) {
      throw new FashionDesignRevisionConflictError(input.expectedConceptRevision, ref.revision)
    }
    if (input.reasonCodes.length === 0) {
      throw new FashionDesignInvalidInputError('select-requires-reason-code')
    }
    const decision = await this.appendDecision({
      projectId: input.projectId,
      reviewRoundId: input.reviewRoundId,
      subjectType: 'concept',
      subjectRef: ref,
      action: 'select',
      selectedConceptRef: ref,
      reasonCodes: input.reasonCodes,
      reasonText: input.reasonText ?? null,
      actorKind: 'local_human',
      frozenInputs: null,
    })
    await this.requireReviewRounds().put(input.reviewRoundId, {
      ...round,
      currentSelectionDecisionId: String(decision.id),
      updatedAt: decision.createdAt,
      updatedBy: 'local-human',
    })
    return decision
  }

  /** Approve the currently selected Concept exact revision. */
  async approveSelectedConcept(input: {
    projectId: ProjectId
    reviewRoundId: ReviewRoundId
    reasonCodes: readonly string[]
    reasonText?: string | null
  }): Promise<ReviewDecision> {
    this.requireEditableProject(input.projectId)
    const round = this.requireOpenRound(input.reviewRoundId, input.projectId)
    if (round.currentSelectionDecisionId === null) {
      throw new FashionDesignSelectionRequiredError('no-current-select')
    }
    const select = this.requireDecisionInProject(
      brandDecisionId(round.currentSelectionDecisionId),
      input.projectId,
    )
    if (select.action !== 'select' || select.selectedConceptRef === null) {
      throw new FashionDesignSelectionRequiredError('select-missing')
    }
    if (input.reasonCodes.length === 0) {
      throw new FashionDesignInvalidInputError('approve-requires-reason-code')
    }
    const validity = await this.reconcileApprovalValidity(input.projectId, input.reviewRoundId)
    if (round.currentApprovalDecisionId !== null && !validity.valid) {
      throw new FashionDesignApprovalInvalidError('approve-blocked-by-invalidation')
    }
    const decision = await this.appendDecision({
      projectId: input.projectId,
      reviewRoundId: input.reviewRoundId,
      subjectType: 'concept',
      subjectRef: select.selectedConceptRef,
      action: 'approve',
      selectedConceptRef: select.selectedConceptRef,
      reasonCodes: input.reasonCodes,
      reasonText: input.reasonText ?? null,
      actorKind: 'local_human',
      frozenInputs: this.captureFrozenInputs(input.projectId, round, select.selectedConceptRef),
    })
    const now = decision.createdAt
    await this.requireReviewRounds().put(input.reviewRoundId, {
      ...round,
      status: 'approved',
      closedAt: now,
      currentApprovalDecisionId: String(decision.id),
      updatedAt: now,
      updatedBy: 'local-human',
    })
    return decision
  }

  /** Request revision 鈥?closes the round as changes_requested. */
  async requestConceptRevision(input: {
    projectId: ProjectId
    reviewRoundId: ReviewRoundId
    subjectType: 'concept_set' | 'concept'
    subjectId: string
    expectedRevision: number
    reasonCodes: readonly string[]
    reasonText: string
  }): Promise<ReviewDecision> {
    return this.closeWithDecision(input, 'request_revision', 'changes_requested')
  }

  /** Reject concept or set 鈥?closes round as rejected. */
  async rejectConceptOrSet(input: {
    projectId: ProjectId
    reviewRoundId: ReviewRoundId
    subjectType: 'concept_set' | 'concept'
    subjectId: string
    expectedRevision: number
    reasonCodes: readonly string[]
    reasonText: string
  }): Promise<ReviewDecision> {
    return this.closeWithDecision(input, 'reject', 'rejected')
  }

  /** Needs more research 鈥?closes round as needs_research. */
  async requestMoreResearch(input: {
    projectId: ProjectId
    reviewRoundId: ReviewRoundId
    subjectType: 'concept_set' | 'concept'
    subjectId: string
    expectedRevision: number
    reasonCodes: readonly string[]
    reasonText: string
  }): Promise<ReviewDecision> {
    return this.closeWithDecision(input, 'needs_research', 'needs_research')
  }

  /** Revoke a currently valid approval. */
  async revokeApproval(input: {
    projectId: ProjectId
    reviewRoundId: ReviewRoundId
    reasonText: string
    reasonCodes?: readonly string[]
  }): Promise<ReviewDecision> {
    this.requireEditableProject(input.projectId)
    const round = this.requireRoundInProject(input.reviewRoundId, input.projectId)
    if (round.currentApprovalDecisionId === null) {
      throw new FashionDesignApprovalInvalidError('no-approval')
    }
    const validity = await this.getApprovalValidity(input.projectId, input.reviewRoundId)
    if (!validity.valid) throw new FashionDesignApprovalInvalidError('already-invalid')
    if (!input.reasonText.trim()) throw new FashionDesignInvalidInputError('revoke-requires-reason')
    const approval = this.requireDecisionInProject(
      brandDecisionId(round.currentApprovalDecisionId),
      input.projectId,
    )
    const decision = await this.appendDecision({
      projectId: input.projectId,
      reviewRoundId: input.reviewRoundId,
      subjectType: 'concept',
      subjectRef: approval.selectedConceptRef ?? approval.subjectRef,
      action: 'revoke_approval',
      selectedConceptRef: approval.selectedConceptRef,
      reasonCodes: input.reasonCodes ?? ['other'],
      reasonText: input.reasonText,
      actorKind: 'local_human',
      frozenInputs: null,
    })
    await this.appendInvalidation({
      projectId: input.projectId,
      reviewRoundId: input.reviewRoundId,
      approvalDecisionId: brandDecisionId(round.currentApprovalDecisionId),
      cause: 'approval_revoked',
      detectedBy: 'local_human',
      note: input.reasonText,
      affectedRefs: [approval.selectedConceptRef ?? approval.subjectRef],
    })
    await this.invalidateDeliverablesForRound(input.projectId, input.reviewRoundId, decision.createdAt)
    return decision
  }

  /** Host-computed approval validity (reconciles exact refs first). */
  async getApprovalValidity(projectId: ProjectId, reviewRoundId: ReviewRoundId): Promise<ApprovalValidity> {
    return this.reconcileApprovalValidity(projectId, reviewRoundId)
  }

  /** Reconcile approval validity against current exact refs (idempotent). */
  async reconcileApprovalValidity(projectId: ProjectId, reviewRoundId: ReviewRoundId): Promise<ApprovalValidity> {
    const round = this.requireRoundInProject(reviewRoundId, projectId)
    if (round.currentApprovalDecisionId === null) {
      return this.readApprovalValidity(projectId, reviewRoundId)
    }
    const approvalId = brandDecisionId(round.currentApprovalDecisionId)
    const approval = this.requireDecisionInProject(approvalId, projectId)
    const frozen = approval.frozenInputs
    const selected = approval.selectedConceptRef
    const live = frozen === null || selected === null
      ? null
      : this.captureFrozenInputs(projectId, round, selected)
    const drifts = frozen === null || live === null
      ? []
      : frozen.entries.flatMap((entry) => {
        const match = live.entries.find(row => row.targetType === entry.targetType && row.ref.id === entry.ref.id)
        const drift = diffFrozenEntry(entry, match === undefined
          ? { available: false, revision: null, contentHash: null, stale: false, unavailableReason: 'missing' }
          : { available: true, revision: match.ref.revision, contentHash: match.contentHash, stale: false, unavailableReason: null })
        return drift === null ? [] : [drift]
      })
    if (drifts.length > 0) {
      let latestId: string | null = null
      for (const drift of drifts) {
        const row = await this.appendInvalidation({
          projectId,
          reviewRoundId,
          approvalDecisionId: approvalId,
          cause: drift.cause,
          detectedBy: 'system',
          note: drift.note,
          affectedRefs: [drift.affectedRef],
          triggerRef: drift.triggerRef,
        })
        latestId = String(row.id)
      }
      const at = new Date().toISOString()
      await this.invalidateDeliverablesForRound(projectId, reviewRoundId, at, latestId)
      if (round.status === 'approved') {
        await this.requireReviewRounds().put(reviewRoundId, {
          ...round,
          status: 'invalidated',
          closedAt: round.closedAt ?? at,
          updatedAt: at,
          updatedBy: 'system-rule',
        })
      }
    }
    return this.readApprovalValidity(projectId, reviewRoundId)
  }

  /** Sync projection after reconcile writes. */
  private readApprovalValidity(projectId: ProjectId, reviewRoundId: ReviewRoundId): ApprovalValidity {
    const round = this.requireRoundInProject(reviewRoundId, projectId)
    const invalidations = this.listInvalidations(projectId, reviewRoundId)
    const approvalId = round.currentApprovalDecisionId === null
      ? null
      : brandDecisionId(round.currentApprovalDecisionId)
    if (approvalId === null) {
      return {
        valid: false,
        reviewRoundId,
        approvalDecisionId: null,
        invalidationIds: invalidations.map(row => row.id),
        causes: invalidations.map(row => row.cause),
      }
    }
    const relevant = invalidations.filter(row =>
      row.approvalDecisionId === null || row.approvalDecisionId === approvalId,
    )
    return {
      valid: relevant.length === 0 && round.status === 'approved',
      reviewRoundId,
      approvalDecisionId: approvalId,
      invalidationIds: relevant.map(row => row.id),
      causes: relevant.map(row => row.cause),
    }
  }

  /** List invalidations for a round. */
  listInvalidations(projectId: ProjectId, reviewRoundId: ReviewRoundId): readonly ApprovalInvalidation[] {
    this.requireRoundInProject(reviewRoundId, projectId)
    const rows: ApprovalInvalidation[] = []
    for (const [id, record] of this.requireApprovalInvalidations().entries()) {
      if (record.projectId !== String(projectId)) continue
      if (record.reviewRoundId !== String(reviewRoundId)) continue
      rows.push(toInvalidation(id, record))
    }
    return rows.sort((a, b) => a.detectedAt.localeCompare(b.detectedAt))
  }

  /** Preview audience filtering without generating. */
  async previewDeliverable(input: {
    projectId: ProjectId
    reviewRoundId: ReviewRoundId
    audienceProfile: AudienceProfile
  }): Promise<DeliverablePreview> {
    this.requireProject(input.projectId)
    const validity = await this.getApprovalValidity(input.projectId, input.reviewRoundId)
    if (!validity.valid) throw new FashionDesignApprovalInvalidError('preview-requires-valid-approval')
    const entries = filterManifestEntries(input.audienceProfile, [{
      sourceRef: 'project-sources',
      evidenceRef: null,
      title: 'Project evidence package',
      locator: null,
      accessedAt: null,
      usageBoundary: 'public_reuse',
      audienceVisibility: input.audienceProfile === 'public_portfolio' ? 'public' : 'project_private',
      artifactHash: null,
    }, {
      sourceRef: 'competitor-image',
      evidenceRef: null,
      title: 'Competitor image',
      locator: null,
      accessedAt: null,
      usageBoundary: 'view_only',
      audienceVisibility: 'view_only',
      artifactHash: null,
    }])
    return {
      audienceProfile: input.audienceProfile,
      ruleVersion: AUDIENCE_FILTER_RULE_VERSION,
      included: entries.filter(row => row.inclusion === 'embedded').length,
      summarized: entries.filter(row => row.inclusion === 'summarized').length,
      linkOnly: entries.filter(row => row.inclusion === 'link_only').length,
      excluded: entries.filter(row => row.inclusion === 'excluded').length,
      entries,
      limitations: [
        'Not a production Tech Pack or legal clearance.',
        'public_portfolio is not an automatic publish.',
      ],
    }
  }

  /** Generate a frozen DesignDeliverable from the current valid approval. */
  async generateDeliverable(input: {
    projectId: ProjectId
    reviewRoundId: ReviewRoundId
    audienceProfile: AudienceProfile
    idempotencyKey?: string | null
  }): Promise<DesignDeliverable> {
    this.requireEditableProject(input.projectId)
    const validity = await this.getApprovalValidity(input.projectId, input.reviewRoundId)
    if (!validity.valid || validity.approvalDecisionId === null) {
      throw new FashionDesignApprovalInvalidError('generate-requires-valid-approval')
    }
    const round = this.requireRoundInProject(input.reviewRoundId, input.projectId)
    const approval = this.requireDecisionInProject(validity.approvalDecisionId, input.projectId)
    const selected = approval.selectedConceptRef
    if (selected === null) throw new FashionDesignSelectionRequiredError('approve-without-select')
    const prepared = this.prepareDeliverableExport(
      input.projectId,
      input.reviewRoundId,
      round,
      selected,
      input.audienceProfile,
      validity.approvalDecisionId,
    )
    if (input.idempotencyKey) {
      for (const [id, row] of this.requireDesignDeliverables().entries()) {
        if (row.idempotencyKey !== input.idempotencyKey) continue
        const sameIdentity = row.projectId === String(input.projectId)
          && row.reviewRoundId === String(input.reviewRoundId)
          && row.audienceProfile === input.audienceProfile
          && row.snapshotHash === prepared.snapshotHash
          && row.rendererVersion === DELIVERABLE_RENDERER_VERSION
        if (!sameIdentity) {
          throw new FashionDesignIdempotencyConflictError('idempotency-identity-conflict')
        }
        if (row.status === 'ready' || row.status === 'invalidated') {
          return toDeliverable(id, row)
        }
      }
    }
    this.throwExportFailure('render')
    const written: Array<{ table: 'manifest' | 'snapshot' | 'artifact'; id: string }> = []
    try {
      this.throwExportFailure('manifest')
      await this.requireSourceManifests().put(prepared.manifestId, prepared.manifestRecord)
      written.push({ table: 'manifest', id: String(prepared.manifestId) })
      this.throwExportFailure('snapshot')
      await this.requireDeliverableSnapshots().put(prepared.snapshotId, prepared.snapshotRecord)
      written.push({ table: 'snapshot', id: String(prepared.snapshotId) })
      const artifactRefs: ExactRef[] = []
      for (const spec of prepared.artifactSpecs) {
        this.throwExportFailure('artifact')
        const artifactId = mintReviewId(brandExportArtifactId, candidate => this.requireExportArtifacts().get(candidate) !== undefined)
        await this.requireExportArtifacts().put(artifactId, {
          ...liveEnvelope(input.projectId, prepared.now),
          deliverableId: String(prepared.deliverableId),
          kind: spec.kind,
          mediaType: spec.mediaType,
          filename: spec.filename,
          relativePath: `design/exports/${String(input.projectId)}/${spec.filename}`,
          byteLength: Buffer.byteLength(spec.text, 'utf8'),
          contentSha256: spec.sha,
          textContent: spec.text,
        })
        written.push({ table: 'artifact', id: String(artifactId) })
        artifactRefs.push({ id: String(artifactId), revision: 0 })
      }
      this.throwExportFailure('deliverable')
      const deliverable: DesignDeliverableRecordV0 = {
        ...liveEnvelope(input.projectId, prepared.now),
        deliverableType: 'design_decision_package',
        audienceProfile: input.audienceProfile,
        reviewRoundId: String(input.reviewRoundId),
        snapshotRef: { id: String(prepared.snapshotId), revision: 0 },
        snapshotHash: prepared.snapshotHash,
        briefRef: round.briefRef,
        conceptSetRef: round.conceptSetRef,
        selectedConceptRef: selected,
        approvalDecisionRef: { id: String(validity.approvalDecisionId), revision: 0 },
        sourceManifestRef: { id: String(prepared.manifestId), revision: 0 },
        artifactRefs,
        knownRisks: ['production-unverified', 'similarity-unverified'],
        limitations: prepared.limitations,
        handoffTarget: input.audienceProfile,
        status: 'ready',
        frozenBy: 'local_human',
        frozenAt: prepared.now,
        invalidatedAt: null,
        invalidationRef: null,
        failureReason: null,
        idempotencyKey: input.idempotencyKey ?? null,
        rendererVersion: DELIVERABLE_RENDERER_VERSION,
      }
      await this.requireDesignDeliverables().put(prepared.deliverableId, deliverable)
      return toDeliverable(prepared.deliverableId, deliverable)
    } catch (caught) {
      await this.compensateExportWrites(written)
      if (caught instanceof FashionDesignRenderFailedError) throw caught
      throw new FashionDesignRenderFailedError(caught instanceof Error ? caught.message : 'render-failed')
    }
  }
  /** @param projectId - Project. @param deliverableId - Deliverable. */
  getDeliverable(projectId: ProjectId, deliverableId: DesignDeliverableId): DesignDeliverable {
    return toDeliverable(deliverableId, this.requireDeliverableInProject(deliverableId, projectId))
  }

  /** @param projectId - Project. */
  listDeliverables(projectId: ProjectId): readonly DesignDeliverable[] {
    this.requireProject(projectId)
    const rows: DesignDeliverable[] = []
    for (const [id, record] of this.requireDesignDeliverables().entries()) {
      if (record.projectId !== String(projectId)) continue
      rows.push(toDeliverable(id, record))
    }
    return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  /** Verify artifact hashes for a deliverable. */
  verifyDeliverable(projectId: ProjectId, deliverableId: DesignDeliverableId): {
    readonly ok: boolean
    readonly mismatches: readonly string[]
  } {
    const deliverable = this.requireDeliverableInProject(deliverableId, projectId)
    const snapshot = this.requireDeliverableSnapshots().get(brandSnapshotId(deliverable.snapshotRef.id))
    const mismatches: string[] = []
    if (snapshot === undefined || snapshot.snapshotHash !== deliverable.snapshotHash) {
      mismatches.push('snapshot-hash')
    } else {
      const selectedPayload = snapshot.conceptPayloads[0] ?? {}
      const recomputed = hashSnapshotPayload({
        briefRef: snapshot.briefRef,
        conceptSetRef: snapshot.conceptSetRef,
        selectedConceptRef: snapshot.selectedConceptRef,
        audienceProfile: snapshot.audienceProfile,
        rendererVersion: snapshot.rendererVersion,
        selectedPayload,
        limitations: snapshot.limitations,
        filterRuleVersion: AUDIENCE_FILTER_RULE_VERSION,
      })
      if (recomputed !== snapshot.snapshotHash) mismatches.push('snapshot-recompute')
    }
    const artifacts = this.listDeliverableArtifacts(projectId, deliverableId)
    if (artifacts.length !== 3) mismatches.push('artifact-count')
    const byKind = new Map(artifacts.map(row => [row.kind, row]))
    for (const kind of ['json', 'markdown', 'manifest'] as const) {
      const artifact = byKind.get(kind)
      if (artifact === undefined) {
        mismatches.push(`missing:${kind}`)
        continue
      }
      if (sha256Hex(artifact.textContent) !== artifact.contentSha256) mismatches.push(`hash:${kind}`)
      if (!artifact.textContent.includes(deliverable.snapshotHash)) mismatches.push(`snapshot-identity:${kind}`)
    }
    const manifest = byKind.get('manifest')
    if (manifest !== undefined) {
      const parsed = JSON.parse(manifest.textContent) as {
        snapshotHash?: string
        artifacts?: readonly { sha256?: string }[]
      }
      if (parsed.snapshotHash !== deliverable.snapshotHash) mismatches.push('manifest-snapshot')
      const listed = new Set((parsed.artifacts ?? []).map(row => row.sha256))
      if (!listed.has(byKind.get('json')?.contentSha256)) mismatches.push('manifest-json')
      if (!listed.has(byKind.get('markdown')?.contentSha256)) mismatches.push('manifest-markdown')
    }
    if (mismatches.length > 0) {
      throw new FashionDesignIntegrityMismatchError(mismatches.join(','))
    }
    return { ok: true, mismatches: [] }
  }

  /** List export artifacts for a deliverable. */
  listDeliverableArtifacts(projectId: ProjectId, deliverableId: DesignDeliverableId): readonly ExportArtifactView[] {
    this.requireDeliverableInProject(deliverableId, projectId)
    const rows: ExportArtifactView[] = []
    for (const [id, record] of this.requireExportArtifacts().entries()) {
      if (record.projectId !== String(projectId)) continue
      if (record.deliverableId !== String(deliverableId)) continue
      rows.push(toExportArtifact(id, record))
    }
    return rows
  }

  /** Archive a closed review round. */
  async archiveReview(projectId: ProjectId, reviewRoundId: ReviewRoundId): Promise<ReviewRound> {
    this.requireEditableProject(projectId)
    const round = this.requireRoundInProject(reviewRoundId, projectId)
    if (round.status === 'open') {
      throw new FashionDesignInvalidTransitionError('archive-open-round')
    }
    const now = new Date().toISOString()
    const next = { ...round, status: 'archived' as const, archivedAt: now, updatedAt: now, updatedBy: 'local-human' as const }
    await this.requireReviewRounds().put(reviewRoundId, next)
    return toRound(reviewRoundId, next)
  }

  /** Withdraw a ready deliverable (does not rewrite bytes). */
  async withdrawDeliverable(projectId: ProjectId, deliverableId: DesignDeliverableId): Promise<DesignDeliverable> {
    this.requireEditableProject(projectId)
    const row = this.requireDeliverableInProject(deliverableId, projectId)
    if (row.status !== 'ready' && row.status !== 'invalidated') {
      throw new FashionDesignInvalidTransitionError(`withdraw-${row.status}`)
    }
    const now = new Date().toISOString()
    const next = { ...row, status: 'withdrawn' as const, updatedAt: now, updatedBy: 'local-human' as const }
    await this.requireDesignDeliverables().put(deliverableId, next)
    return toDeliverable(deliverableId, next)
  }

  /** Archive a deliverable. */
  async archiveDeliverable(projectId: ProjectId, deliverableId: DesignDeliverableId): Promise<DesignDeliverable> {
    this.requireEditableProject(projectId)
    const row = this.requireDeliverableInProject(deliverableId, projectId)
    const now = new Date().toISOString()
    const next = { ...row, status: 'archived' as const, archivedAt: now, updatedAt: now, updatedBy: 'local-human' as const }
    await this.requireDesignDeliverables().put(deliverableId, next)
    return toDeliverable(deliverableId, next)
  }

  private async closeWithDecision(
    input: {
      projectId: ProjectId
      reviewRoundId: ReviewRoundId
      subjectType: 'concept_set' | 'concept'
      subjectId: string
      expectedRevision: number
      reasonCodes: readonly string[]
      reasonText: string
    },
    action: Extract<ReviewDecisionAction, 'request_revision' | 'reject' | 'needs_research'>,
    status: 'changes_requested' | 'rejected' | 'needs_research',
  ): Promise<ReviewDecision> {
    this.requireEditableProject(input.projectId)
    const round = this.requireOpenRound(input.reviewRoundId, input.projectId)
    if (!input.reasonText.trim()) throw new FashionDesignInvalidInputError(`${action}-requires-reason`)
    const subjectRef = input.subjectType === 'concept_set'
      ? round.conceptSetRef
      : round.conceptRefs.find(row => row.id === input.subjectId)
    if (subjectRef === undefined) throw new FashionDesignConceptNotInRoundError(input.subjectId)
    if (subjectRef.revision !== input.expectedRevision) {
      throw new FashionDesignRevisionConflictError(input.expectedRevision, subjectRef.revision)
    }
    const decision = await this.appendDecision({
      projectId: input.projectId,
      reviewRoundId: input.reviewRoundId,
      subjectType: input.subjectType,
      subjectRef,
      action,
      selectedConceptRef: null,
      reasonCodes: input.reasonCodes.length > 0 ? input.reasonCodes : ['other'],
      reasonText: input.reasonText,
      actorKind: 'local_human',
      frozenInputs: null,
    })
    await this.requireReviewRounds().put(input.reviewRoundId, {
      ...round,
      status,
      closedAt: decision.createdAt,
      updatedAt: decision.createdAt,
      updatedBy: 'local-human',
    })
    return decision
  }

  private async appendDecision(input: {
    projectId: ProjectId
    reviewRoundId: ReviewRoundId
    subjectType: 'concept_set' | 'concept'
    subjectRef: ExactRef
    action: ReviewDecisionAction
    selectedConceptRef: ExactRef | null
    reasonCodes: readonly string[]
    reasonText: string | null
    actorKind: ReviewActorKind
    frozenInputs: FrozenApprovalInputs | null
  }): Promise<ReviewDecision> {
    if (input.actorKind === 'recorded_demo_human') {
      throw new FashionDesignHumanRequiredError('recorded-demo-not-allowed')
    }
    const now = new Date().toISOString()
    const id = mintReviewId(brandDecisionId, candidate => this.requireReviewDecisions().get(candidate) !== undefined)
    const record: ReviewDecisionRecordV0 = {
      ...liveEnvelope(input.projectId, now),
      reviewRoundId: String(input.reviewRoundId),
      subjectType: input.subjectType,
      subjectRef: input.subjectRef,
      action: input.action,
      selectedConceptRef: input.selectedConceptRef,
      reasonCodes: [...input.reasonCodes],
      reasonText: input.reasonText,
      advisoryConditions: [],
      nextAction: null,
      actorId: 'local-human',
      actorKind: input.actorKind,
      frozenInputs: input.frozenInputs,
    }
    await this.requireReviewDecisions().put(id, record)
    return toDecision(id, record)
  }

  private async appendInvalidation(input: {
    projectId: ProjectId
    reviewRoundId: ReviewRoundId
    approvalDecisionId: ReviewDecisionId | null
    cause: ApprovalInvalidation['cause']
    detectedBy: 'system' | 'local_human'
    note: string | null
    affectedRefs: readonly ExactRef[]
    triggerRef?: ExactRef | null
  }): Promise<ApprovalInvalidation> {
    const approvalKey = input.approvalDecisionId === null ? null : String(input.approvalDecisionId)
    const targetId = input.affectedRefs[0]?.id ?? ''
    for (const [id, row] of this.requireApprovalInvalidations().entries()) {
      if (row.projectId === String(input.projectId)
        && row.reviewRoundId === String(input.reviewRoundId)
        && row.cause === input.cause
        && row.approvalDecisionId === approvalKey
        && (row.affectedRefs[0]?.id ?? '') === targetId) {
        return toInvalidation(id, row)
      }
    }
    const now = new Date().toISOString()
    const id = mintReviewId(brandInvalidationId, candidate => this.requireApprovalInvalidations().get(candidate) !== undefined)
    const record: ApprovalInvalidationRecordV0 = {
      ...liveEnvelope(input.projectId, now),
      reviewRoundId: String(input.reviewRoundId),
      approvalDecisionId: input.approvalDecisionId === null ? null : String(input.approvalDecisionId),
      affectedRefs: [...input.affectedRefs],
      cause: input.cause,
      triggerRef: input.triggerRef ?? null,
      detectedBy: input.detectedBy,
      detectedAt: now,
      note: input.note,
    }
    await this.requireApprovalInvalidations().put(id, record)
    return toInvalidation(id, record)
  }

  private async invalidateDeliverablesForRound(
    projectId: ProjectId,
    reviewRoundId: ReviewRoundId,
    at: string,
    invalidationId: string | null = null,
  ): Promise<void> {
    for (const [id, row] of this.requireDesignDeliverables().entries()) {
      if (row.projectId !== String(projectId)) continue
      if (row.status !== 'ready') continue
      // Match by approval on this round via approvalDecisionRef belonging to round
      const round = this.requireRoundInProject(reviewRoundId, projectId)
      if (round.currentApprovalDecisionId === null) continue
      if (row.approvalDecisionRef.id !== round.currentApprovalDecisionId) continue
      await this.requireDesignDeliverables().put(id, {
        ...row,
        status: 'invalidated',
        invalidatedAt: row.invalidatedAt ?? at,
        invalidationRef: invalidationId === null
          ? row.invalidationRef
          : { id: invalidationId, revision: 0 },
        updatedAt: at,
        updatedBy: 'system-rule',
      })
    }
  }

  private captureFrozenInputs(
    projectId: ProjectId,
    round: ReviewRoundRecordV0,
    selected: ExactRef,
  ): FrozenApprovalInputs {
    const entries: FrozenExactEntry[] = []
    const brief = this.requireBriefInProject(DesignBriefId(round.briefRef.id), projectId)
    entries.push({
      targetType: 'brief',
      ref: { id: round.briefRef.id, revision: brief.revision },
      contentHash: sha256Hex(JSON.stringify({
        market: brief.market,
        season: brief.season,
        category: brief.category,
        targetUser: brief.targetUser,
        status: brief.status,
        staleReason: brief.staleReason,
      })),
    })
    const set = this.requireConceptSetInProject(brandConceptSetId(round.conceptSetRef.id), projectId)
    entries.push({
      targetType: 'concept_set',
      ref: { id: round.conceptSetRef.id, revision: set.revision },
      contentHash: sha256Hex(`${set.status}:${set.staleReason ?? ''}:${set.briefRevision}`),
    })
    const concept = this.requireConceptInProject(brandConceptId(selected.id), projectId)
    const evidence = concept.marketEvidenceLinks.map(link => ({
      type: link.type,
      id: link.id,
      usedFor: link.usedFor,
    }))
    entries.push({
      targetType: 'concept',
      ref: { id: selected.id, revision: concept.revision },
      contentHash: sha256Hex(JSON.stringify({
        name: concept.conceptName,
        intent: concept.designIntent,
        silhouette: concept.silhouette,
        proportion: concept.proportionAndLength,
        status: concept.status,
        staleReason: concept.staleReason,
        evidence,
      })),
    })
    for (const link of evidence) {
      entries.push({
        targetType: 'evidence',
        ref: { id: link.id, revision: 0 },
        contentHash: sha256Hex(JSON.stringify(link)),
      })
    }
    for (const visual of this.listVisualDrafts(projectId, brandConceptId(selected.id))) {
      entries.push({
        targetType: 'visual_draft',
        ref: { id: String(visual.id), revision: visual.revision },
        contentHash: sha256Hex(JSON.stringify({
          status: visual.status,
          staleReason: visual.staleReason,
          usageBoundary: visual.usageBoundary,
          artifactHash: visual.artifactHash,
          inputSnapshotHash: visual.inputSnapshotHash,
        })),
      })
    }
    return sealFrozenInputs(entries)
  }

  private prepareDeliverableExport(
    projectId: ProjectId,
    reviewRoundId: ReviewRoundId,
    round: ReviewRoundRecordV0,
    selected: ExactRef,
    audienceProfile: AudienceProfile,
    approvalDecisionId: ReviewDecisionId,
  ) {
    const concept = this.requireConceptInProject(brandConceptId(selected.id), projectId)
    if (concept.revision !== selected.revision) {
      throw new FashionDesignApprovalInvalidError('selected-concept-revision-drift')
    }
    const brief = this.requireBriefInProject(DesignBriefId(round.briefRef.id), projectId)
    const now = new Date().toISOString()
    const visibility = audienceProfile === 'public_portfolio' ? 'public' : 'project_private'
    const selectedPayload = projectConceptForAudience(audienceProfile, {
      id: selected.id,
      title: concept.conceptName,
      designIntent: concept.designIntent,
      silhouette: concept.silhouette,
      proportionAndLength: concept.proportionAndLength,
      status: concept.status,
    }, visibility)
    const limitations = [
      'Not a production Tech Pack or legal clearance.',
      'public_portfolio is not an automatic publish.',
    ]
    const hashBody = {
      briefRef: round.briefRef,
      conceptSetRef: round.conceptSetRef,
      selectedConceptRef: selected,
      audienceProfile,
      rendererVersion: DELIVERABLE_RENDERER_VERSION,
      selectedPayload,
      limitations,
      filterRuleVersion: AUDIENCE_FILTER_RULE_VERSION,
    }
    const snapshotHash = hashSnapshotPayload(hashBody)
    const candidates = [{
      sourceRef: 'project-sources',
      evidenceRef: null,
      title: 'Project evidence package',
      locator: null as string | null,
      accessedAt: null as string | null,
      usageBoundary: 'public_reuse',
      audienceVisibility: visibility,
      artifactHash: null as string | null,
    }]
    for (const visual of this.listVisualDrafts(projectId, brandConceptId(selected.id))) {
      candidates.push({
        sourceRef: String(visual.id),
        evidenceRef: null,
        title: 'Visual draft',
        locator: visual.artifactRef,
        accessedAt: visual.generatedAt,
        usageBoundary: visual.usageBoundary,
        audienceVisibility: visual.usageBoundary,
        artifactHash: visual.artifactHash,
      })
    }
    const entries = filterManifestEntries(audienceProfile, candidates)
    const snapshotId = mintReviewId(brandSnapshotId, candidate => this.requireDeliverableSnapshots().get(candidate) !== undefined)
    const manifestId = mintReviewId(brandManifestId, candidate => this.requireSourceManifests().get(candidate) !== undefined)
    const deliverableId = mintReviewId(brandDeliverableId, candidate => this.requireDesignDeliverables().get(candidate) !== undefined)
    const manifestRecord: SourceManifestRecordV0 = {
      ...liveEnvelope(projectId, now),
      snapshotRef: { id: String(snapshotId), revision: 0 },
      entries,
      generatedAt: now,
    }
    const snapshotRecord: DeliverableSnapshotRecordV0 = {
      ...liveEnvelope(projectId, now),
      snapshotSchemaVersion: 1,
      projectRef: { id: String(projectId), revision: 0 },
      opportunityRef: null,
      opportunityDecisionRef: null,
      briefRef: round.briefRef,
      briefPayload: {
        market: brief.market,
        season: brief.season,
        category: brief.category,
        targetUser: brief.targetUser,
      },
      conceptSetRef: round.conceptSetRef,
      comparisonPayload: { hash: round.comparisonSnapshotHash },
      conceptRefs: round.conceptRefs,
      selectedConceptRef: selected,
      conceptPayloads: [selectedPayload],
      visualDraftRefs: [...round.visualDraftRefs],
      visualPayloads: [],
      reviewRoundRef: { id: String(reviewRoundId), revision: round.revision },
      relevantDecisionRefs: [{ id: String(approvalDecisionId), revision: 0 }],
      reviewPayload: {
        reviewRoundId: String(reviewRoundId),
        approvalDecisionId: String(approvalDecisionId),
        actorKind: 'local_human',
      },
      sourceManifestRef: { id: String(manifestId), revision: 0 },
      limitations,
      audienceProfile,
      rendererVersion: DELIVERABLE_RENDERER_VERSION,
      canonicalization: 'rfc8785-jcs',
      hashAlgorithm: 'sha256',
      snapshotHash,
      createdByActorKind: 'local_human',
    }
    let rendered: ReturnType<typeof renderDecisionPackage>
    try {
      rendered = renderDecisionPackage({
        snapshot: {
          briefPayload: snapshotRecord.briefPayload,
          selectedConceptRef: selected,
          selectedConceptPayload: selectedPayload,
          conceptPayloads: snapshotRecord.conceptPayloads,
          reviewPayload: snapshotRecord.reviewPayload,
          limitations,
        },
        audienceProfile,
        deliverableId: String(deliverableId),
        snapshotHash,
      })
    } catch (caught) {
      throw new FashionDesignRenderFailedError(caught instanceof Error ? caught.message : 'render-failed')
    }
    return {
      now,
      snapshotHash,
      limitations,
      snapshotId,
      manifestId,
      deliverableId,
      manifestRecord,
      snapshotRecord,
      artifactSpecs: [
        { kind: 'json' as const, text: rendered.jsonText, sha: rendered.jsonSha256, mediaType: 'application/json', filename: `${String(deliverableId)}.json` },
        { kind: 'markdown' as const, text: rendered.markdownText, sha: rendered.markdownSha256, mediaType: 'text/markdown; charset=utf-8', filename: `${String(deliverableId)}.md` },
        { kind: 'manifest' as const, text: rendered.manifestText, sha: rendered.manifestSha256, mediaType: 'application/json', filename: `${String(deliverableId)}.manifest.json` },
      ],
    }
  }

  private throwExportFailure(step: 'render' | 'manifest' | 'snapshot' | 'artifact' | 'deliverable'): void {
    if (this.exportFailureStep === step) {
      throw new FashionDesignRenderFailedError(`injected-${step}`)
    }
  }

  private async compensateExportWrites(written: readonly { table: 'manifest' | 'snapshot' | 'artifact'; id: string }[]): Promise<void> {
    for (const row of [...written].reverse()) {
      if (row.table === 'manifest') await this.requireSourceManifests().delete(brandManifestId(row.id))
      if (row.table === 'snapshot') await this.requireDeliverableSnapshots().delete(brandSnapshotId(row.id))
      if (row.table === 'artifact') await this.requireExportArtifacts().delete(brandExportArtifactId(row.id))
    }
  }

  private requireOpenRound(reviewRoundId: ReviewRoundId, projectId: ProjectId): ReviewRoundRecordV0 {
    const round = this.requireRoundInProject(reviewRoundId, projectId)
    if (round.status !== 'open') throw new FashionDesignReviewClosedError(String(reviewRoundId))
    return round
  }

  private requireRoundInProject(reviewRoundId: ReviewRoundId, projectId: ProjectId): ReviewRoundRecordV0 {
    const row = this.requireReviewRounds().get(reviewRoundId)
    if (row === undefined) throw new FashionDesignReviewNotFoundError(String(reviewRoundId))
    if (row.projectId !== String(projectId)) {
      throw new FashionDesignReviewNotFoundError(String(reviewRoundId))
    }
    return row
  }

  private requireDecisionInProject(decisionId: ReviewDecisionId, projectId: ProjectId): ReviewDecisionRecordV0 {
    const row = this.requireReviewDecisions().get(decisionId)
    if (row === undefined || row.projectId !== String(projectId)) {
      throw new FashionDesignInvalidInputError('decision-not-found')
    }
    return row
  }

  private requireDeliverableInProject(deliverableId: DesignDeliverableId, projectId: ProjectId): DesignDeliverableRecordV0 {
    const row = this.requireDesignDeliverables().get(deliverableId)
    if (row === undefined || row.projectId !== String(projectId)) {
      throw new FashionDesignDeliverableNotFoundError(String(deliverableId))
    }
    return row
  }

  private requireReviewRounds() {
    if (this.reviewRounds === undefined) throw new Error('fashion design review_rounds not open')
    return this.reviewRounds
  }

  private requireReviewDecisions() {
    if (this.reviewDecisions === undefined) throw new Error('fashion design review_decisions not open')
    return this.reviewDecisions
  }

  private requireApprovalInvalidations() {
    if (this.approvalInvalidations === undefined) throw new Error('fashion design approval_invalidations not open')
    return this.approvalInvalidations
  }

  private requireDeliverableSnapshots() {
    if (this.deliverableSnapshots === undefined) throw new Error('fashion design deliverable_snapshots not open')
    return this.deliverableSnapshots
  }

  private requireSourceManifests() {
    if (this.sourceManifests === undefined) throw new Error('fashion design source_manifests not open')
    return this.sourceManifests
  }

  private requireDesignDeliverables() {
    if (this.designDeliverables === undefined) throw new Error('fashion design design_deliverables not open')
    return this.designDeliverables
  }

  private requireExportArtifacts() {
    if (this.exportArtifacts === undefined) throw new Error('fashion design export_artifacts not open')
    return this.exportArtifacts
  }
}

function seedEnvelope(projectId: ProjectId) {
  return {
    projectId: String(projectId),
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
}

function liveEnvelope(projectId: ProjectId, now: string) {
  return {
    projectId: String(projectId),
    origin: 'user' as const,
    accessMode: 'editable' as const,
    revision: 0,
    createdAt: now,
    updatedAt: now,
    createdBy: 'local-human' as const,
    updatedBy: 'local-human' as const,
    schemaVersion: FASHION_DESIGN_SCHEMA_VERSION as 0,
    archivedAt: null,
    staleReason: null,
  }
}

function mintReviewId<T extends string>(
  brand: (id: string) => T,
  taken: (id: T) => boolean,
): T {
  for (let i = 0; i < 8; i += 1) {
    const id = brand(randomUUID())
    if (!taken(id)) return id
  }
  throw new FashionDesignIdCollisionError('review-id')
}

function toRound(id: ReviewRoundId, record: ReviewRoundRecordV0): ReviewRound {
  return {
    id,
    projectId: record.projectId as ProjectId,
    origin: record.origin,
    accessMode: record.accessMode,
    revision: record.revision,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    createdBy: record.createdBy,
    updatedBy: record.updatedBy,
    schemaVersion: record.schemaVersion,
    archivedAt: record.archivedAt,
    staleReason: record.staleReason,
    briefRef: record.briefRef,
    conceptSetRef: record.conceptSetRef,
    conceptRefs: record.conceptRefs,
    visualDraftRefs: record.visualDraftRefs,
    comparisonSnapshotHash: record.comparisonSnapshotHash,
    openedBy: record.openedBy,
    openedAt: record.openedAt,
    closedAt: record.closedAt,
    status: record.status,
    currentSelectionDecisionId: record.currentSelectionDecisionId === null
      ? null
      : brandDecisionId(record.currentSelectionDecisionId),
    currentApprovalDecisionId: record.currentApprovalDecisionId === null
      ? null
      : brandDecisionId(record.currentApprovalDecisionId),
  }
}

function toDecision(id: ReviewDecisionId, record: ReviewDecisionRecordV0): ReviewDecision {
  return {
    id,
    projectId: record.projectId as ProjectId,
    origin: record.origin,
    accessMode: record.accessMode,
    revision: record.revision,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    createdBy: record.createdBy,
    updatedBy: record.updatedBy,
    schemaVersion: record.schemaVersion,
    archivedAt: record.archivedAt,
    staleReason: record.staleReason,
    reviewRoundId: brandRoundId(record.reviewRoundId),
    subjectType: record.subjectType,
    subjectRef: record.subjectRef,
    action: record.action,
    selectedConceptRef: record.selectedConceptRef,
    reasonCodes: record.reasonCodes,
    reasonText: record.reasonText,
    advisoryConditions: record.advisoryConditions,
    nextAction: record.nextAction,
    actorId: record.actorId,
    actorKind: record.actorKind,
    frozenInputs: record.frozenInputs,
  }
}

function toInvalidation(id: ApprovalInvalidationId, record: ApprovalInvalidationRecordV0): ApprovalInvalidation {
  return {
    id,
    projectId: record.projectId as ProjectId,
    origin: record.origin,
    accessMode: record.accessMode,
    revision: record.revision,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    createdBy: record.createdBy,
    updatedBy: record.updatedBy,
    schemaVersion: record.schemaVersion,
    archivedAt: record.archivedAt,
    staleReason: record.staleReason,
    reviewRoundId: brandRoundId(record.reviewRoundId),
    approvalDecisionId: record.approvalDecisionId === null
      ? null
      : brandDecisionId(record.approvalDecisionId),
    affectedRefs: record.affectedRefs,
    cause: record.cause,
    triggerRef: record.triggerRef,
    detectedBy: record.detectedBy,
    detectedAt: record.detectedAt,
    note: record.note,
  }
}

function toDeliverable(id: DesignDeliverableId, record: DesignDeliverableRecordV0): DesignDeliverable {
  return {
    id,
    projectId: record.projectId as ProjectId,
    origin: record.origin,
    accessMode: record.accessMode,
    revision: record.revision,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    createdBy: record.createdBy,
    updatedBy: record.updatedBy,
    schemaVersion: record.schemaVersion,
    archivedAt: record.archivedAt,
    staleReason: record.staleReason,
    deliverableType: record.deliverableType,
    audienceProfile: record.audienceProfile,
    reviewRoundId: brandRoundId(record.reviewRoundId),
    snapshotRef: record.snapshotRef,
    snapshotHash: record.snapshotHash,
    briefRef: record.briefRef,
    conceptSetRef: record.conceptSetRef,
    selectedConceptRef: record.selectedConceptRef,
    approvalDecisionRef: record.approvalDecisionRef,
    sourceManifestRef: record.sourceManifestRef,
    artifactRefs: record.artifactRefs,
    knownRisks: record.knownRisks,
    limitations: record.limitations,
    handoffTarget: record.handoffTarget,
    status: record.status,
    frozenBy: record.frozenBy,
    frozenAt: record.frozenAt,
    invalidatedAt: record.invalidatedAt,
    failureReason: record.failureReason,
    rendererVersion: record.rendererVersion,
  }
}

function toExportArtifact(id: ExportArtifactId, record: ExportArtifactRecordV0): ExportArtifactView {
  return {
    id,
    projectId: record.projectId as ProjectId,
    origin: record.origin,
    accessMode: record.accessMode,
    revision: record.revision,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    createdBy: record.createdBy,
    updatedBy: record.updatedBy,
    schemaVersion: record.schemaVersion,
    archivedAt: record.archivedAt,
    staleReason: record.staleReason,
    deliverableId: brandDeliverableId(record.deliverableId),
    kind: record.kind,
    mediaType: record.mediaType,
    filename: record.filename,
    relativePath: record.relativePath,
    byteLength: record.byteLength,
    contentSha256: record.contentSha256,
    textContent: record.textContent,
  }
}

export default FashionDesignRegistry
