/**
 * Fashion Research schema and Host URL admission.
 */

import { describe, expect, it } from 'vitest'
import { evidenceRecordV0 } from '../src/schema/v0/evidence.ts'
import { researchTaskRecordV0 } from '../src/schema/v0/research-task.ts'
import { sampleRecordV0 } from '../src/schema/v0/sample.ts'
import { sourceRecordV0 } from '../src/schema/v0/source.ts'
import { FashionResearchInvalidUrlError, normalizeSourceUrl } from '../src/index.ts'
import { FASHION_RESEARCH_SCHEMA_VERSION } from '../src/types.ts'

const envelope = {
  projectId: 'proj-1',
  origin: 'human' as const,
  accessMode: 'editable' as const,
  revision: 0,
  createdAt: '2026-09-21T12:00:00.000Z',
  updatedAt: '2026-09-21T12:00:00.000Z',
  createdBy: 'local-human' as const,
  updatedBy: 'local-human' as const,
  schemaVersion: FASHION_RESEARCH_SCHEMA_VERSION,
  archivedAt: null,
}

describe('research schemas v0', () => {
  it('accepts a minimal ResearchTask and rejects unknown keys', () => {
    const ok = researchTaskRecordV0.parse({
      ...envelope,
      title: 'Task',
      note: null,
      status: 'draft',
    })
    expect(ok.title).toBe('Task')
    expect(() => researchTaskRecordV0.parse({
      ...envelope,
      title: 'Task',
      note: null,
      status: 'draft',
      market: 'US',
    })).toThrow()
  })

  it('requires url or attachment fields by locatorType', () => {
    expect(() => sourceRecordV0.parse({
      ...envelope,
      taskId: 'task-1',
      locatorType: 'url',
      url: null,
      urlNormalized: null,
      attachmentRef: null,
      title: 'S',
      publisherOrPlatform: null,
      sourceKind: 'web_page',
      accessedAt: envelope.createdAt,
      publishedAt: null,
      captureMode: 'manual_link',
      usageBoundary: 'view_only',
      externalProcessing: 'denied',
      availabilityStatus: 'available',
      attribution: 'a',
      contentFingerprint: null,
    })).toThrow()

    const urlOk = sourceRecordV0.parse({
      ...envelope,
      taskId: 'task-1',
      locatorType: 'url',
      url: 'https://Example.com/path?q=1#x',
      urlNormalized: 'https://example.com/path?q=1#x',
      attachmentRef: null,
      title: 'S',
      publisherOrPlatform: null,
      sourceKind: 'web_page',
      accessedAt: envelope.createdAt,
      publishedAt: null,
      captureMode: 'manual_link',
      usageBoundary: 'public_attributed',
      externalProcessing: 'denied',
      availabilityStatus: 'available',
      attribution: 'attrib',
      contentFingerprint: null,
    })
    expect(urlOk.locatorType).toBe('url')
  })

  it('rejects observed G0 and derived without method/limitations', () => {
    expect(() => evidenceRecordV0.parse({
      ...envelope,
      taskId: 'task-1',
      subjectType: 'source',
      subjectId: 'source-1',
      excerpt: null,
      observation: 'saw it',
      claim: 'fact',
      claimType: 'observed',
      evidenceGrade: 'G0',
      method: null,
      limitations: [],
      reviewStatus: 'draft',
      reviewedBy: null,
      reviewedAt: null,
      reviewNote: null,
    })).toThrow()

    expect(() => evidenceRecordV0.parse({
      ...envelope,
      taskId: 'task-1',
      subjectType: 'sample',
      subjectId: 'sample-1',
      excerpt: null,
      observation: 'compared pages',
      claim: 'maybe trend',
      claimType: 'derived',
      evidenceGrade: 'G1',
      method: null,
      limitations: [],
      reviewStatus: 'draft',
      reviewedBy: null,
      reviewedAt: null,
      reviewNote: null,
    })).toThrow()
  })

  it('accepts a sample with rawFields', () => {
    const sample = sampleRecordV0.parse({
      ...envelope,
      taskId: 'task-1',
      sourceId: 'source-1',
      label: 'E01',
      externalItemId: null,
      locator: null,
      observedAt: envelope.createdAt,
      rawFields: [{ name: 'price', value: '39.99', unit: 'USD' }],
      screenshotRefs: [],
      note: null,
      status: 'draft',
    })
    expect(sample.rawFields[0]?.name).toBe('price')
  })
})

describe('normalizeSourceUrl', () => {
  it('admits http(s) and lowercases host', () => {
    expect(normalizeSourceUrl('  https://Example.COM/a?b=1#c  ')).toEqual({
      original: 'https://Example.COM/a?b=1#c',
      normalized: 'https://example.com/a?b=1#c',
    })
  })

  it('rejects credentials and non-http schemes', () => {
    expect(() => normalizeSourceUrl('https://user:pass@example.com/')).toThrow(FashionResearchInvalidUrlError)
    expect(() => normalizeSourceUrl('file:///tmp/x')).toThrow(FashionResearchInvalidUrlError)
    expect(() => normalizeSourceUrl('javascript:alert(1)')).toThrow(FashionResearchInvalidUrlError)
    expect(() => normalizeSourceUrl('data:text/plain,hi')).toThrow(FashionResearchInvalidUrlError)
  })
})
