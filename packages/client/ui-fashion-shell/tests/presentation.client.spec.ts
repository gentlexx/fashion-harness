/** Pure presentation / filter / date tests for F1-03 Batch 1. */
import { describe, expect, it } from 'vitest'
import { ProjectId } from '@gentlexx/dsh-fashion-project'
import type { ProjectView } from '@gentlexx/dsh-fashion-project/types'
import {
  formatFashionDate,
  formatFashionDateTime,
} from '../src/client/presentation/format-date.ts'
import {
  filterProjects,
  isFilterActive,
} from '../src/client/presentation/filter-projects.ts'
import {
  accessLabelKey,
  capabilityLabelKey,
  deriveProjectStages,
  isFashionProjectNotFound,
  isR0Project,
  nextStepLabelKey,
  originLabelKey,
  partitionByOrigin,
  pipelineStateKey,
} from '../src/client/presentation/project-presentation.ts'

const R0 = 'r0-us-womens-khaki-utility-jacket'

function project(partial: Partial<ProjectView> & Pick<ProjectView, 'id' | 'title' | 'origin'>): ProjectView {
  return {
    accessMode: partial.origin === 'public-rebuild' ? 'read-only' : 'editable',
    createdAt: '2026-09-21T00:00:00.000Z',
    updatedAt: '2026-09-21T00:00:00.000Z',
    revision: 0,
    ...partial,
  }
}

describe('project presentation', () => {
  it('maps origin, access, capability, and next-step keys without inventing stages', () => {
    expect(originLabelKey('user')).toBe('origin.user')
    expect(originLabelKey('public-rebuild')).toBe('origin.publicRebuild')
    expect(accessLabelKey('editable')).toBe('access.editable')
    expect(accessLabelKey('read-only')).toBe('access.readOnly')
    expect(capabilityLabelKey('user')).toBe('capability.foundationReady')
    expect(capabilityLabelKey('public-rebuild')).toBe('capability.publicRebuild')
    expect(nextStepLabelKey('user')).toBe('nextStep.openOverview')
    expect(nextStepLabelKey('public-rebuild')).toBe('nextStep.viewPublicCase')
  })

  it('detects R0 only when id and public-rebuild align', () => {
    expect(isR0Project({ id: ProjectId(R0), origin: 'public-rebuild' }, R0)).toBe(true)
    expect(isR0Project({ id: ProjectId(R0), origin: 'user' }, R0)).toBe(false)
    expect(isR0Project({ id: ProjectId('other'), origin: 'public-rebuild' }, R0)).toBe(false)
  })

  it('partitions by origin while preserving Host order', () => {
    const items = [
      project({ id: ProjectId('u1'), title: 'A', origin: 'user' }),
      project({ id: ProjectId(R0), title: 'R0', origin: 'public-rebuild' }),
      project({ id: ProjectId('u2'), title: 'B', origin: 'user' }),
    ]
    const parts = partitionByOrigin(items)
    expect(parts.user.map(item => item.id)).toEqual([ProjectId('u1'), ProjectId('u2')])
    expect(parts.publicRebuild.map(item => item.id)).toEqual([ProjectId(R0)])
  })

  it('maps pipeline states and falls unknown to coming-soon', () => {
    expect(pipelineStateKey('recorded')).toBe('pipeline.recorded')
    expect(pipelineStateKey('candidate')).toBe('pipeline.candidate')
    expect(pipelineStateKey('pending')).toBe('pipeline.pending')
    expect(pipelineStateKey('coming-soon')).toBe('pipeline.comingSoon')
    expect(pipelineStateKey('weird')).toBe('pipeline.comingSoon')
  })

  it('derives recorded vs pending stages from durable record counts', () => {
    const empty = deriveProjectStages({
      researchTasks: 0,
      opportunityBriefs: 0,
      conceptSets: 0,
      reviewRounds: 0,
      deliverables: 0,
    })
    expect(empty).toHaveLength(5)
    expect(empty.every(step => step.stateKey === 'pipeline.pending')).toBe(true)
    const recorded = deriveProjectStages({
      researchTasks: 2,
      opportunityBriefs: 0,
      conceptSets: 0,
      reviewRounds: 0,
      deliverables: 0,
    })
    expect(recorded[0]?.stateKey).toBe('pipeline.recorded')
    expect(recorded.slice(1).every(step => step.stateKey === 'pipeline.pending')).toBe(true)
  })

  it('detects Host not-found RemoteFailure codes only', () => {
    expect(isFashionProjectNotFound({ code: 'fashion-project/not-found', message: 'x' })).toBe(true)
    expect(isFashionProjectNotFound({ code: 'fashion-project/unavailable', message: 'x' })).toBe(false)
    expect(isFashionProjectNotFound(new Error('x'))).toBe(false)
  })
})

describe('formatFashionDate*', () => {
  it('formats ISO without returning the raw ISO string', () => {
    const iso = '2026-09-21T00:00:00.000Z'
    const labeled = formatFashionDateTime(iso, 'en')
    expect(labeled.length).toBeGreaterThan(0)
    expect(labeled).not.toBe(iso)
    expect(formatFashionDate(iso, 'en')).not.toBe(iso)
  })

  it('returns empty string for invalid ISO', () => {
    expect(formatFashionDateTime('not-a-date', 'en')).toBe('')
    expect(formatFashionDate('not-a-date', 'zh')).toBe('')
  })
})

describe('filterProjects', () => {
  const items = [
    project({ id: ProjectId('u1'), title: 'Khaki Coat', origin: 'user' }),
    project({ id: ProjectId(R0), title: '美国女装卡其 Utility Jacket', origin: 'public-rebuild' }),
  ]

  it('filters by origin chip without reordering', () => {
    expect(filterProjects(items, '', 'user', 'en').map(item => item.id)).toEqual([ProjectId('u1')])
    expect(filterProjects(items, '', 'public-rebuild', 'en').map(item => item.id)).toEqual([ProjectId(R0)])
    expect(filterProjects(items, '', 'all', 'en')).toHaveLength(2)
  })

  it('matches title case-insensitively in the active locale', () => {
    expect(filterProjects(items, 'KHAKI', 'all', 'en').map(item => item.id)).toEqual([ProjectId('u1')])
    expect(filterProjects(items, 'utility', 'all', 'en')).toHaveLength(1)
    expect(filterProjects(items, '女装', 'all', 'zh')).toHaveLength(1)
  })

  it('reports when a filter is active', () => {
    expect(isFilterActive('', 'all')).toBe(false)
    expect(isFilterActive('x', 'all')).toBe(true)
    expect(isFilterActive('', 'user')).toBe(true)
  })
})
