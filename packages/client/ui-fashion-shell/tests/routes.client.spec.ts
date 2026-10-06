/** Pure Fashion route parse/format tests. */
import { describe, expect, it } from 'vitest'
import { formatFashionRoute, parseFashionRoute } from '../src/client/routes.ts'

describe('fashion routes', () => {
  it('round-trips projects and overview', () => {
    expect(parseFashionRoute('/projects')).toEqual({ kind: 'projects' })
    expect(formatFashionRoute({ kind: 'projects' })).toBe('/projects')
    const overview = {
      kind: 'project-overview' as const,
      projectId: 'r0-us-womens-khaki-utility-jacket',
    }
    expect(parseFashionRoute(formatFashionRoute(overview))).toEqual(overview)
  })

  it('strips trailing slash and rejects unknown paths as not-found', () => {
    expect(parseFashionRoute('/projects/')).toEqual({ kind: 'projects' })
    expect(parseFashionRoute('/nope')).toEqual({ kind: 'not-found', pathname: '/nope' })
    expect(parseFashionRoute('projects')).toEqual({ kind: 'projects' })
  })

  it('decodes and encodes project ids', () => {
    const route = parseFashionRoute('/projects/a%2Fb/overview')
    expect(route).toEqual({ kind: 'project-overview', projectId: 'a/b' })
    expect(formatFashionRoute(route)).toBe('/projects/a%2Fb/overview')
  })

  it('round-trips research routes without embedding session ids', () => {
    const home = { kind: 'research-home' as const, projectId: 'p1' }
    expect(parseFashionRoute(formatFashionRoute(home))).toEqual(home)
    const task = { kind: 'research-task' as const, projectId: 'p1', taskId: 't1' }
    expect(parseFashionRoute(formatFashionRoute(task))).toEqual(task)
    const sourceNew = {
      kind: 'research-source-new' as const,
      projectId: 'p1',
      taskId: 't1',
    }
    expect(parseFashionRoute(formatFashionRoute(sourceNew))).toEqual(sourceNew)
    const evidence = {
      kind: 'research-evidence' as const,
      projectId: 'p1',
      taskId: 't1',
      evidenceId: 'e1',
    }
    expect(parseFashionRoute(formatFashionRoute(evidence))).toEqual(evidence)
    expect(parseFashionRoute('/projects/p1/research/tasks/new')).toEqual({
      kind: 'research-task-new',
      projectId: 'p1',
    })
  })

  it('round-trips analysis routes nested under research tasks', () => {
    const home = { kind: 'analysis-home' as const, projectId: 'p1', taskId: 't1' }
    expect(parseFashionRoute(formatFashionRoute(home))).toEqual(home)
    const item = {
      kind: 'analysis-item' as const,
      projectId: 'p1',
      taskId: 't1',
      marketItemId: 'm1',
    }
    expect(parseFashionRoute(formatFashionRoute(item))).toEqual(item)
    const signal = {
      kind: 'analysis-signal' as const,
      projectId: 'p1',
      taskId: 't1',
      signalId: 's1',
    }
    expect(parseFashionRoute(formatFashionRoute(signal))).toEqual(signal)
    const cluster = {
      kind: 'analysis-cluster' as const,
      projectId: 'p1',
      taskId: 't1',
      clusterId: 'c1',
    }
    expect(parseFashionRoute(formatFashionRoute(cluster))).toEqual(cluster)
    const opportunity = {
      kind: 'analysis-opportunity' as const,
      projectId: 'p1',
      taskId: 't1',
      opportunityId: 'o1',
    }
    expect(parseFashionRoute(formatFashionRoute(opportunity))).toEqual(opportunity)
    expect(parseFashionRoute('/projects/p1/research/tasks/t1/analysis/')).toEqual(home)
  })

  it('round-trips review and deliverable routes', () => {
    const reviewHome = { kind: 'review-home' as const, projectId: 'p1' }
    expect(parseFashionRoute(formatFashionRoute(reviewHome))).toEqual(reviewHome)
    const reviewRound = {
      kind: 'review-round' as const,
      projectId: 'p1',
      reviewRoundId: 'r0-review-round-utility-jacket',
    }
    expect(parseFashionRoute(formatFashionRoute(reviewRound))).toEqual(reviewRound)
    const deliverablesHome = { kind: 'deliverables-home' as const, projectId: 'p1' }
    expect(parseFashionRoute(formatFashionRoute(deliverablesHome))).toEqual(deliverablesHome)
    const deliverableDetail = {
      kind: 'deliverable-detail' as const,
      projectId: 'p1',
      deliverableId: 'r0-deliverable-public-portfolio',
    }
    expect(parseFashionRoute(formatFashionRoute(deliverableDetail))).toEqual(deliverableDetail)
    expect(parseFashionRoute('/projects/p1/review/')).toEqual(reviewHome)
    expect(formatFashionRoute(reviewRound)).toBe(
      '/projects/p1/reviews/r0-review-round-utility-jacket',
    )
  })

  it('treats /projects/:id as the project overview alias', () => {
    expect(parseFashionRoute('/projects/r0-us-womens-khaki-utility-jacket')).toEqual({
      kind: 'project-overview',
      projectId: 'r0-us-womens-khaki-utility-jacket',
    })
    expect(parseFashionRoute('/projects/p1/overview')).toEqual({
      kind: 'project-overview',
      projectId: 'p1',
    })
    expect(formatFashionRoute({
      kind: 'project-overview',
      projectId: 'p1',
    })).toBe('/projects/p1/overview')
  })

  it('round-trips the exact deliverable ref on feedback, outcomes, and evaluation entries', () => {
    const followUpRef = { deliverableId: 'd 1', deliverableRevision: 4, conceptId: 'c/1', conceptRevision: 0 }
    for (const route of [
      { kind: 'feedback-new', projectId: 'p1', followUpRef },
      { kind: 'outcomes-home', projectId: 'p1', followUpRef },
      { kind: 'evaluations-home', projectId: 'p1', followUpRef },
    ] as const) {
      expect(parseFashionRoute(formatFashionRoute(route))).toEqual(route)
    }
    expect(formatFashionRoute({ kind: 'feedback-new', projectId: 'p1', followUpRef })).toBe(
      '/projects/p1/feedback/new/deliverables/d%201/revisions/4/concepts/c%2F1/revisions/0',
    )
  })

  it('keeps the context-free follow-up entries', () => {
    for (const route of [
      { kind: 'feedback-new', projectId: 'p1' },
      { kind: 'outcomes-home', projectId: 'p1' },
      { kind: 'evaluations-home', projectId: 'p1' },
    ] as const) {
      const parsed = parseFashionRoute(formatFashionRoute(route))
      expect(parsed).toEqual(route)
      expect('followUpRef' in parsed).toBe(false)
    }
    expect(formatFashionRoute({ kind: 'outcomes-home', projectId: 'p1' })).toBe('/projects/p1/outcomes')
  })

  it('rejects malformed follow-up revisions instead of guessing', () => {
    expect(parseFashionRoute('/projects/p1/feedback/new/deliverables/d1/revisions/01/concepts/c1/revisions/2').kind)
      .toBe('not-found')
    expect(parseFashionRoute('/projects/p1/outcomes/deliverables/d1/revisions/-1/concepts/c1/revisions/2').kind)
      .toBe('not-found')
  })
})
