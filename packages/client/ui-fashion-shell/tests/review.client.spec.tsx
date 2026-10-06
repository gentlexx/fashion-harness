/** @vitest-environment jsdom */
/** Review home smoke render with stub inject. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, fireEvent } from '@testing-library/react'
import { ReviewHomePage, ReviewRoundPage } from '../src/client/review/ReviewPages.tsx'
import { R0_REVIEW_ROUND_ID } from '../src/client/review/ids.ts'
import { R0_PROJECT_ID } from '../src/client/routes.ts'
import { zh, type FashionKey } from '../src/client/locales.ts'

const t = (key: FashionKey): string => zh[key]

afterEach(() => { cleanup() })

describe('ReviewHomePage', () => {
  it('lists R0 review round and opens round detail', async () => {
    const openRound = vi.fn()
    render(
      <ReviewHomePage
        projectId={R0_PROJECT_ID}
        locale="zh"
        getProject={async () => ({
          id: R0_PROJECT_ID as never,
          title: 'R0',
          origin: 'public-rebuild',
          accessMode: 'read-only',
          createdAt: '2026-09-24T00:00:00.000Z',
          updatedAt: '2026-09-24T00:00:00.000Z',
          revision: 0,
        })}
        loadDesignWorkspace={vi.fn(async () => {})}
        listReviews={async () => [{
          id: R0_REVIEW_ROUND_ID as never,
          projectId: R0_PROJECT_ID as never,
          origin: 'recorded_seed',
          accessMode: 'read-only',
          revision: 0,
          createdAt: '2026-09-24T00:00:00.000Z',
          updatedAt: '2026-09-24T00:00:00.000Z',
          createdBy: 'system-seed',
          updatedBy: 'system-seed',
          schemaVersion: 0,
          archivedAt: null,
          staleReason: null,
          briefRef: { id: 'b1', revision: 0 },
          conceptSetRef: { id: 's1', revision: 0 },
          conceptRefs: [
            { id: 'c1', revision: 0 },
            { id: 'c2', revision: 0 },
            { id: 'c3', revision: 0 },
          ],
          visualDraftRefs: [],
          comparisonSnapshotHash: 'hash',
          openedBy: 'recorded_demo_human',
          openedAt: '2026-09-24T00:00:00.000Z',
          closedAt: '2026-09-24T00:00:00.000Z',
          status: 'approved',
          currentSelectionDecisionId: 'd1' as never,
          currentApprovalDecisionId: 'd2' as never,
        }]}
        listConceptSets={() => []}
        openReview={vi.fn()}
        openRound={openRound}
        openOverview={vi.fn()}
        t={t}
      />,
    )
    expect(await screen.findByText(zh['review.roundTitle'])).toBeTruthy()
    const round = screen.getByRole('button', { name: new RegExp(zh['review.roundTitle']) })
    expect(round.textContent).toContain(zh['review.enum.status.approved'])
    expect(round.textContent).not.toContain(R0_REVIEW_ROUND_ID)
    fireEvent.click(round)
    expect(openRound).toHaveBeenCalledWith(R0_PROJECT_ID, R0_REVIEW_ROUND_ID)
  })
})

describe('ReviewRoundPage close actions', () => {
  it('exposes revision, reject, and research actions on an open ordinary round', async () => {
    const requestConceptRevision = vi.fn(async () => ({}))
    const rejectConceptOrSet = vi.fn(async () => ({}))
    const requestMoreResearch = vi.fn(async () => ({}))
    render(
      <ReviewRoundPage
        projectId="ordinary-project"
        reviewRoundId="round-1"
        getProject={async () => ({
          id: 'ordinary-project' as never,
          title: 'Ordinary',
          origin: 'user',
          accessMode: 'editable',
          createdAt: '2026-09-24T00:00:00.000Z',
          updatedAt: '2026-09-24T00:00:00.000Z',
          revision: 0,
        })}
        getReview={async () => ({
          id: 'round-1' as never,
          projectId: 'ordinary-project' as never,
          origin: 'user',
          accessMode: 'editable',
          revision: 0,
          createdAt: '2026-09-24T00:00:00.000Z',
          updatedAt: '2026-09-24T00:00:00.000Z',
          createdBy: 'local-human',
          updatedBy: 'local-human',
          schemaVersion: 0,
          archivedAt: null,
          staleReason: null,
          briefRef: { id: 'b1', revision: 0 },
          conceptSetRef: { id: 's1', revision: 0 },
          conceptRefs: [
            { id: 'c1', revision: 0 },
            { id: 'c2', revision: 0 },
            { id: 'c3', revision: 0 },
          ],
          visualDraftRefs: [],
          comparisonSnapshotHash: 'hash',
          openedBy: 'local_human',
          openedAt: '2026-09-24T00:00:00.000Z',
          closedAt: null,
          status: 'open',
          currentSelectionDecisionId: null,
          currentApprovalDecisionId: null,
        })}
        getConcept={async (_projectId, conceptId) => ({
          id: conceptId as never,
          projectId: 'ordinary-project' as never,
          conceptSetId: 's1' as never,
          origin: 'user',
          accessMode: 'editable',
          revision: 0,
          createdAt: '2026-09-24T00:00:00.000Z',
          updatedAt: '2026-09-24T00:00:00.000Z',
          createdBy: 'local-human',
          updatedBy: 'local-human',
          schemaVersion: 0,
          archivedAt: null,
          staleReason: null,
          conceptName: `Concept ${conceptId}`,
          designIntent: 'Intent',
          silhouette: 'Silhouette',
          proportionAndLength: 'Length',
          materialDirection: 'Material',
          colorDirection: 'Color',
          constructionAndDetails: ['Detail'],
          functionalValue: ['Value'],
          targetUseScenarios: ['Scenario'],
          originalTransformationNotes: ['Note'],
          productionUnknowns: ['Unknown'],
          briefId: 'b1' as never,
          briefRevision: 0,
          marketEvidenceLinks: [],
          competitorSimilarityRisks: [],
          constraintCoverage: [],
          status: 'draft',
        })}
        getApprovalValidity={async () => ({
          valid: false,
          reviewRoundId: 'round-1' as never,
          approvalDecisionId: null,
          invalidationIds: [],
          causes: [],
        })}
        selectConcept={vi.fn()}
        approveSelectedConcept={vi.fn()}
        requestConceptRevision={requestConceptRevision}
        rejectConceptOrSet={rejectConceptOrSet}
        requestMoreResearch={requestMoreResearch}
        revokeApproval={vi.fn()}
        generateDeliverable={vi.fn()}
        openReviewHome={vi.fn()}
        openDeliverables={vi.fn()}
        openDeliverable={vi.fn()}
        t={t}
      />,
    )
    expect(await screen.findByText(t('review.requestRevision'))).toBeTruthy()
    expect(screen.getByRole('button', { name: t('review.reject') })).toBeTruthy()
    expect(screen.getByRole('button', { name: t('review.needsResearch') })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: t('review.requestRevision') }))
    expect(screen.getByText(t('review.decisionReasonRequired'))).toBeTruthy()
    expect(requestConceptRevision).not.toHaveBeenCalled()

    const enterReason = (text: string): void => {
      fireEvent.change(screen.getByLabelText(t('review.decisionReason')), { target: { value: text } })
    }
    enterReason('袖口比例需要重做')
    fireEvent.click(screen.getByRole('button', { name: t('review.requestRevision') }))
    await vi.waitFor(() => {
      expect(requestConceptRevision).toHaveBeenCalledWith(expect.objectContaining({ reasonText: '袖口比例需要重做' }))
    })
    expect(await screen.findByRole('button', { name: t('review.reject') })).toBeTruthy()
    enterReason('整组方向偏离简报')
    fireEvent.click(screen.getByRole('button', { name: t('review.reject') }))
    await vi.waitFor(() => {
      expect(rejectConceptOrSet).toHaveBeenCalledWith(expect.objectContaining({ reasonText: '整组方向偏离简报' }))
    })
    expect(await screen.findByRole('button', { name: t('review.needsResearch') })).toBeTruthy()
    enterReason('缺少面料证据')
    fireEvent.click(screen.getByRole('button', { name: t('review.needsResearch') }))
    await vi.waitFor(() => {
      expect(requestMoreResearch).toHaveBeenCalledWith(expect.objectContaining({ reasonText: '缺少面料证据' }))
    })
  })
})

describe('ReviewRoundPage selection, approval, and deliverable', () => {
  const PROJECT_ID = 'ordinary-project'
  const REVISIONS: Readonly<Record<string, number>> = { c1: 0, c2: 2, c3: 1 }

  function roundHost() {
    let status: 'open' | 'approved' = 'open'
    let selectionId: string | null = null
    const host = {
      selectConcept: vi.fn(async () => {
        selectionId = 'sel-1'
        return {}
      }),
      approveSelectedConcept: vi.fn(async () => {
        status = 'approved'
        return {}
      }),
      generateDeliverable: vi.fn(async () => ({ id: 'deliverable-1' }) as never),
      openDeliverable: vi.fn(),
      getReview: async () => ({
        id: 'round-1',
        projectId: PROJECT_ID,
        accessMode: 'editable',
        revision: 0,
        conceptSetRef: { id: 's1', revision: 4 },
        conceptRefs: [{ id: 'c1', revision: 0 }, { id: 'c2', revision: 2 }, { id: 'c3', revision: 1 }],
        status,
        currentSelectionDecisionId: selectionId,
        currentApprovalDecisionId: status === 'approved' ? 'appr-1' : null,
      }) as never,
      getApprovalValidity: async () => ({
        valid: status === 'approved',
        reviewRoundId: 'round-1',
        approvalDecisionId: status === 'approved' ? 'appr-1' : null,
        invalidationIds: [],
        causes: [],
      }) as never,
    }
    return host
  }

  function renderRound(host: ReturnType<typeof roundHost>): void {
    render(
      <ReviewRoundPage
        projectId={PROJECT_ID}
        reviewRoundId="round-1"
        getProject={async () => ({
          id: PROJECT_ID as never,
          title: 'Ordinary',
          origin: 'user',
          accessMode: 'editable',
          createdAt: '2026-09-24T00:00:00.000Z',
          updatedAt: '2026-09-24T00:00:00.000Z',
          revision: 0,
        })}
        getReview={host.getReview}
        getConcept={async (_projectId, conceptId) => ({
          id: conceptId,
          revision: REVISIONS[conceptId],
          conceptName: `Concept ${conceptId}`,
          designIntent: 'Intent',
        }) as never}
        getApprovalValidity={host.getApprovalValidity}
        selectConcept={host.selectConcept}
        approveSelectedConcept={host.approveSelectedConcept}
        requestConceptRevision={vi.fn()}
        rejectConceptOrSet={vi.fn()}
        requestMoreResearch={vi.fn()}
        revokeApproval={vi.fn()}
        generateDeliverable={host.generateDeliverable}
        openReviewHome={vi.fn()}
        openDeliverables={vi.fn()}
        openDeliverable={host.openDeliverable}
        t={t}
      />,
    )
  }

  async function selector(query: string): Promise<HTMLElement> {
    return vi.waitFor(() => {
      const node = document.querySelector<HTMLElement>(query)
      if (node === null) throw new Error(`missing ${query}`)
      return node
    })
  }

  it('selects the chosen Concept at its revision, approves with the user reason, and generates the deliverable', async () => {
    const host = roundHost()
    renderRound(host)
    fireEvent.change(await selector('[data-fashion-review-reason]'), { target: { value: '结构差异最清晰' } })
    fireEvent.click(await selector('[data-fashion-review="select-concept"][data-fashion-review-select="c2"]'))
    await vi.waitFor(() => {
      expect(host.selectConcept).toHaveBeenCalledWith({
        projectId: PROJECT_ID,
        reviewRoundId: 'round-1',
        conceptId: 'c2',
        expectedConceptRevision: 2,
        reasonCodes: ['originality', 'silhouette_or_proportion'],
        reasonText: '结构差异最清晰',
      })
    })

    fireEvent.click(await selector('[data-fashion-review="approve-selected"]'))
    await vi.waitFor(() => {
      expect(host.approveSelectedConcept).toHaveBeenCalledWith({
        projectId: PROJECT_ID,
        reviewRoundId: 'round-1',
        reasonCodes: ['evidence_sufficient'],
        reasonText: '结构差异最清晰',
      })
    })

    fireEvent.click(await selector('[data-fashion-review="generate-deliverable"]'))
    await vi.waitFor(() => {
      expect(host.generateDeliverable).toHaveBeenCalledWith({
        projectId: PROJECT_ID,
        reviewRoundId: 'round-1',
        audienceProfile: 'public_portfolio',
      })
    })
    expect(host.openDeliverable).toHaveBeenCalledWith(PROJECT_ID, 'deliverable-1')
  })

  it('refuses approval without a user reason', async () => {
    const host = roundHost()
    renderRound(host)
    fireEvent.click(await selector('[data-fashion-review-select="c1"]'))
    await vi.waitFor(() => {
      expect(host.selectConcept).toHaveBeenCalledWith(expect.objectContaining({ conceptId: 'c1', expectedConceptRevision: 0, reasonText: null }))
    })
    fireEvent.click(await selector('[data-fashion-review="approve-selected"]'))
    expect(await screen.findByText(t('review.decisionReasonRequired'))).toBeTruthy()
    expect(host.approveSelectedConcept).not.toHaveBeenCalled()
  })
})
