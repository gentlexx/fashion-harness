/**
 * Canonical JSON and Markdown from one frozen run snapshot.
 * @module @gentlexx/dsh-fashion-evaluation/src/report
 */

import { createHash } from 'node:crypto'
import type { RuleOutcome } from './rules.ts'

/** Report renderer version. Same inputs and this version stay byte-stable. */
export const REPORT_RENDERER_VERSION = 'v0-evaluation-report-1'

export interface ReportInput {
  readonly runId: string
  readonly dataReality: string
  readonly visibility: string
  readonly results: readonly RuleOutcome[]
  readonly labels: readonly string[]
  readonly privateNote?: string
}

export interface RenderedReport {
  /** Full frozen body; `snapshotHash` is its SHA-256. Never stored as an export artifact. */
  readonly jsonText: string
  /** Full body as Markdown. Never stored as an export artifact. */
  readonly markdownText: string
  /** Filtered canonical JSON, or the refusal body when `publicError` is set. */
  readonly publicText: string
  /** Filtered Markdown, or the refusal body when `publicError` is set. */
  readonly publicMarkdownText: string
  readonly jsonHash: string
  readonly markdownHash: string
  readonly publicHash: string
  readonly publicMarkdownHash: string
  readonly snapshotHash: string
  readonly rendererVersion: typeof REPORT_RENDERER_VERSION
  readonly redacted: readonly string[]
  readonly publicError: string | null
}

function hash(text: string): string {
  return createHash('sha256').update(text).digest('hex')
}

const RESTRICTED_LOCATOR = /[A-Za-z]:\\[^\s"]+|\\\\[^\s"]+|file:[^\s"]+|\/(?:Users|home|tmp|var|private)\/[^\s"]+/g

function scrub(text: string): { readonly text: string; readonly hit: boolean } {
  const next = text.replace(RESTRICTED_LOCATOR, '[redacted-locator]')
  return { text: next, hit: next !== text }
}

/** Visibilities whose run may emit a filtered report body. Any other value is refused. */
const REPORTABLE_VISIBILITY: ReadonlySet<string> = new Set(['public_rebuild', 'internal_demo'])

function markdownLines(
  runId: string,
  dataReality: string,
  results: readonly {
    readonly ruleId: string
    readonly status: string
    readonly severity: string
    readonly message: string
  }[],
): string {
  return [
    '# Evaluation report',
    '',
    'Public-case rebuild / recorded rule evaluation / no real designer assessment / no real commercial outcome.',
    '',
    `Run: ${runId}`,
    `Reality: ${dataReality}`,
    '',
    ...results.map(row => `- ${row.ruleId}: ${row.status} (${row.severity}) ${row.message}`),
    '',
  ].join('\n')
}

/**
 * Render one run. Public text drops a private note, scrubs local locators, and records the redaction.
 * A project-private, view-only, or unknown-visibility run emits only a refusal body.
 * @param input - Frozen rule results.
 * @returns Full snapshot texts plus the filtered texts that export artifacts store.
 */
export function renderReport(input: ReportInput): RenderedReport {
  const body = {
    runId: input.runId,
    dataReality: input.dataReality,
    visibility: input.visibility,
    rendererVersion: REPORT_RENDERER_VERSION,
    labels: [...input.labels],
    counts: {
      pass: input.results.filter(row => row.status === 'pass').length,
      fail: input.results.filter(row => row.status === 'fail').length,
      warning: input.results.filter(row => row.status === 'warning').length,
      not_applicable: input.results.filter(row => row.status === 'not_applicable').length,
      error: input.results.filter(row => row.status === 'error').length,
    },
    results: input.results.map(row => ({
      ruleId: row.ruleId,
      status: row.status,
      severity: row.severity,
      message: row.message,
    })),
    privateNote: input.privateNote ?? null,
  }
  const jsonText = `${JSON.stringify(body)}\n`
  const markdownText = markdownLines(input.runId, input.dataReality, body.results)
  const snapshotHash = hash(jsonText)
  if (!REPORTABLE_VISIBILITY.has(input.visibility)) {
    const refusal = `${JSON.stringify({
      runId: input.runId,
      publicError: 'visibility_blocked',
      redacted: ['body'],
    })}\n`
    const refusalHash = hash(refusal)
    return {
      jsonText,
      markdownText,
      publicText: refusal,
      publicMarkdownText: refusal,
      jsonHash: snapshotHash,
      markdownHash: hash(markdownText),
      snapshotHash,
      rendererVersion: REPORT_RENDERER_VERSION,
      redacted: ['body'],
      publicHash: refusalHash,
      publicMarkdownHash: refusalHash,
      publicError: 'visibility_blocked',
    }
  }
  const redacted = input.privateNote === undefined ? [] : ['privateNote']
  const scrubbedResults = body.results.map((row) => {
    const message = scrub(row.message)
    if (message.hit && !redacted.includes('locator')) redacted.push('locator')
    return { ...row, message: message.text }
  })
  const publicBody = { ...body, results: scrubbedResults, privateNote: null, redacted }
  const publicText = `${JSON.stringify(publicBody)}\n`
  const publicMarkdownText = markdownLines(input.runId, input.dataReality, scrubbedResults)
  return {
    jsonText,
    markdownText,
    publicText,
    publicMarkdownText,
    jsonHash: snapshotHash,
    markdownHash: hash(markdownText),
    snapshotHash,
    publicHash: hash(publicText),
    publicMarkdownHash: hash(publicMarkdownText),
    rendererVersion: REPORT_RENDERER_VERSION,
    redacted,
    publicError: null,
  }
}
