/** Fashion Agent context derivation — route + list only, never SessionId. */
import { describe, expect, it } from 'vitest'
import { ProjectId } from '@gentlexx/dsh-fashion-project'
import type { ProjectListState } from '@gentlexx/dsh-api-fashion-project-controller/client'
import { deriveFashionAgentContext } from '../src/client/agent/agent-context.ts'
import { R0_PROJECT_ID } from '../src/client/routes.ts'

describe('deriveFashionAgentContext', () => {
  const readyList: ProjectListState = {
    status: 'ready',
    items: [{
      id: ProjectId(R0_PROJECT_ID),
      title: 'R0',
      origin: 'public-rebuild',
      accessMode: 'read-only',
      createdAt: '2026-09-21T00:00:00.000Z',
      updatedAt: '2026-09-21T00:00:00.000Z',
      revision: 0,
    }],
    error: null,
  }

  it('returns none outside project-overview routes', () => {
    expect(deriveFashionAgentContext({ kind: 'projects' }, readyList)).toEqual({ kind: 'none' })
    expect(deriveFashionAgentContext({ kind: 'not-found', pathname: '/x' }, readyList))
      .toEqual({ kind: 'none' })
  })

  it('returns project when the overview id is in the Client list', () => {
    const ctx = deriveFashionAgentContext(
      { kind: 'project-overview', projectId: R0_PROJECT_ID },
      readyList,
    )
    expect(ctx.kind).toBe('project')
    if (ctx.kind === 'project') expect(ctx.project.id).toBe(ProjectId(R0_PROJECT_ID))
  })

  it('returns loading when overview id is absent from the list', () => {
    expect(deriveFashionAgentContext(
      { kind: 'project-overview', projectId: 'missing' },
      readyList,
    )).toEqual({ kind: 'loading', projectId: 'missing' })
  })

  it('accepts only FashionRoute + ProjectListState parameters (no SessionId surface)', () => {
    expect(deriveFashionAgentContext.length).toBe(2)
  })
})
