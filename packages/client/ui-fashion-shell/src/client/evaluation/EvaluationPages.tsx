/** Evaluation and improvement pages. They display Host runs and do not invent verdicts. */
import { useEffect, useState } from 'react'
import type { ProjectView } from '@gentlexx/dsh-fashion-project/types'
import type {
  CurrentImprovement,
  DefinitionStatus,
  EvaluationCase,
  EvaluationDefinition,
  EvaluationReportArtifact,
  EvaluationRun,
  ExecutionStatus,
  HumanAssessment,
  HumanRating,
  ImprovementAction,
  RuleResult,
  RuleStatus,
  RunVerdict,
} from '@gentlexx/dsh-fashion-evaluation/types'
import type { FashionKey } from '../locales.ts'
import type { DeliverableFollowUpRef } from '../routes.ts'
import { FashionPageHeader } from '../components/FashionPageHeader.tsx'
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import { LocalizedTime } from '../components/LocalizedTime.tsx'
import { formText } from '../form-text.ts'

const RATINGS: readonly HumanRating[] = ['meets', 'partly_meets', 'does_not_meet', 'unable_to_assess']
const RATING_LABELS: Record<HumanRating, FashionKey> = {
  meets: 'evaluations.enum.rating.meets',
  partly_meets: 'evaluations.enum.rating.partlyMeets',
  does_not_meet: 'evaluations.enum.rating.doesNotMeet',
  unable_to_assess: 'evaluations.enum.rating.unableToAssess',
}
const VERDICT_LABELS: Record<RunVerdict, FashionKey> = {
  pass: 'evaluations.enum.verdict.pass',
  partial: 'evaluations.enum.verdict.partial',
  fail: 'evaluations.enum.verdict.fail',
  error: 'evaluations.enum.verdict.error',
}
const EXECUTION_LABELS: Record<ExecutionStatus, FashionKey> = {
  completed: 'evaluations.enum.execution.completed',
  partial: 'evaluations.enum.execution.partial',
  failed: 'evaluations.enum.execution.failed',
  cancelled: 'evaluations.enum.execution.cancelled',
}
const DEFINITION_STATUS_LABELS: Record<DefinitionStatus, FashionKey> = {
  draft: 'evaluations.enum.definition.draft',
  published: 'evaluations.enum.definition.published',
  retired: 'evaluations.enum.definition.retired',
}
const SEVERITY_LABELS: Record<RuleResult['severity'], FashionKey> = {
  blocker: 'evaluations.enum.severity.blocker',
  major: 'evaluations.enum.severity.major',
  minor: 'evaluations.enum.severity.minor',
  info: 'evaluations.enum.severity.info',
}
const ARTIFACT_LABELS: Record<EvaluationReportArtifact['format'], FashionKey> = {
  canonical_json: 'evaluations.artifactJson',
  markdown: 'evaluations.artifactMarkdown',
}

function artifactDownload(artifact: EvaluationReportArtifact): { href: string; filename: string } {
  switch (artifact.format) {
    case 'canonical_json':
      return {
        href: `data:application/json;charset=utf-8,${encodeURIComponent(artifact.text)}`,
        filename: `evaluation-report-${String(artifact.runId)}.json`,
      }
    case 'markdown':
      return {
        href: `data:text/markdown;charset=utf-8,${encodeURIComponent(artifact.text)}`,
        filename: `evaluation-report-${String(artifact.runId)}.md`,
      }
  }
}

const REALITY_LABELS: Record<CurrentImprovement['item']['dataReality'], FashionKey> = {
  user_test: 'feedback.enum.reality.userTest',
  real_work: 'feedback.enum.reality.realWork',
  recorded_demo: 'feedback.enum.reality.recordedDemo',
}

const IMPROVEMENT_STATUS_LABELS: Record<ImprovementAction, FashionKey> = {
  proposed: 'improvements.enum.status.proposed',
  accepted: 'improvements.enum.status.accepted',
  deferred: 'improvements.enum.status.deferred',
  planned: 'improvements.enum.status.planned',
  resolved: 'improvements.enum.status.resolved',
  wont_fix: 'improvements.enum.status.wontFix',
  superseded: 'improvements.enum.status.superseded',
  reopened: 'improvements.enum.status.reopened',
}

export type EvaluationPagesProps = {
  readonly projectId: string
  readonly runId?: string | undefined
  readonly itemId?: string | undefined
  /** Deliverable context from the detail page; runs stay project-scoped in the Host. */
  readonly followUpRef?: DeliverableFollowUpRef | undefined
  readonly mode: 'evaluations' | 'run' | 'improvements' | 'improvement'
  readonly getProject: (projectId: string) => Promise<ProjectView | undefined>
  readonly listDefinitions: () => Promise<readonly EvaluationDefinition[]>
  readonly listCases: () => Promise<readonly EvaluationCase[]>
  readonly listRuns: (projectId: string) => Promise<readonly EvaluationRun[]>
  readonly getRuleResults: (runId: string) => Promise<readonly RuleResult[]>
  readonly listAssessments: (runId: string) => Promise<readonly HumanAssessment[]>
  readonly listImprovements: (projectId: string) => Promise<readonly CurrentImprovement[]>
  readonly recordImprovementDecision: (input: {
    projectId: string
    itemId: string
    action: 'accepted'
    reason: string
    confirmedPlanner: true
  }) => Promise<CurrentImprovement>
  readonly runEvaluation: (input: {
    projectId: string
    definitionId: string
    caseIds: readonly string[]
  }) => Promise<EvaluationRun>
  readonly recordAssessment: (input: {
    projectId: string
    runId: string
    criterionId: string
    rating: HumanRating
    reason: string
  }) => Promise<HumanAssessment>
  readonly exportReport: (runId: string) => Promise<readonly EvaluationReportArtifact[]>
  readonly openRun: (projectId: string, runId: string) => void
  readonly openImprovement: (projectId: string, itemId: string) => void
  readonly openOverview: (projectId: string) => void
  readonly locale: string
  readonly t: (key: FashionKey) => string
}

/**
 * Show published definitions, runs, rule results, and improvement candidates.
 * @param props - project scope and Host reads.
 */
export function EvaluationPages(props: EvaluationPagesProps) {
  const {
    projectId,
    runId,
    itemId,
    followUpRef,
    mode,
    getProject,
    listDefinitions,
    listCases,
    listRuns,
    getRuleResults,
    listAssessments,
    listImprovements,
    recordImprovementDecision,
    runEvaluation,
    recordAssessment,
    exportReport,
    openRun,
    openImprovement,
    openOverview,
    locale,
    t,
  } = props
  const [project, setProject] = useState<ProjectView | undefined>()
  const [definitions, setDefinitions] = useState<readonly EvaluationDefinition[]>([])
  const [cases, setCases] = useState<readonly EvaluationCase[]>([])
  const [runs, setRuns] = useState<readonly EvaluationRun[]>([])
  const [results, setResults] = useState<readonly RuleResult[]>([])
  const [assessments, setAssessments] = useState<readonly HumanAssessment[]>([])
  const [improvements, setImprovements] = useState<readonly CurrentImprovement[]>([])
  const [load, setLoad] = useState<'loading' | 'ready' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)
  const [runState, setRunState] = useState<'idle' | 'running' | 'failed'>('idle')
  const [exportState, setExportState] = useState<'idle' | 'exporting' | 'exported' | 'failed'>('idle')
  const [reportArtifacts, setReportArtifacts] = useState<readonly EvaluationReportArtifact[]>([])
  const [openArtifactId, setOpenArtifactId] = useState<string | null>(null)
  const [selectedCases, setSelectedCases] = useState<readonly string[]>([])
  const [improvementState, setImprovementState] = useState<'idle' | 'submitting' | 'failed'>('idle')

  useEffect(() => {
    setExportState('idle')
    setReportArtifacts([])
    setOpenArtifactId(null)
  }, [runId])

  useEffect(() => {
    let cancelled = false
    setLoad('loading')
    void Promise.all([
      getProject(projectId),
      listDefinitions(),
      listCases(),
      listRuns(projectId),
      listImprovements(projectId),
      runId === undefined ? Promise.resolve([]) : getRuleResults(runId),
      runId === undefined ? Promise.resolve([]) : listAssessments(runId),
    ]).then(([nextProject, nextDefinitions, nextCases, nextRuns, nextImprovements, nextResults, nextAssessments]) => {
      if (cancelled) return
      setProject(nextProject)
      setDefinitions(nextDefinitions)
      setCases(nextCases)
      setRuns(nextRuns)
      setImprovements(nextImprovements)
      setResults(nextResults)
      setAssessments(nextAssessments)
      setLoad('ready')
    }).catch(() => {
      if (!cancelled) setLoad('error')
    })
    return () => {
      cancelled = true
    }
  }, [attempt, getProject, getRuleResults, listAssessments, listCases, listDefinitions, listImprovements, listRuns, projectId, runId])

  const recorded = project?.origin === 'public-rebuild'
  // Write controls wait for the project read so a read-only project never shows them, even before it loads.
  const writable = project !== undefined && project.accessMode !== 'read-only'
  const title = mode === 'improvements' || mode === 'improvement'
    ? t('improvements.homeTitle')
    : t('evaluations.homeTitle')

  function statusLabel(status: RuleStatus): string {
    if (status === 'pass') return t('evaluations.status.pass')
    if (status === 'fail') return t('evaluations.status.fail')
    if (status === 'warning') return t('evaluations.status.warning')
    if (status === 'not_applicable') return t('evaluations.status.notApplicable')
    return t('evaluations.status.error')
  }

  function ruleTitle(ruleId: string): string {
    for (const definition of definitions) {
      const rule = definition.ruleDefinitions.find(row => row.ruleId === ruleId)
      if (rule !== undefined) return rule.title
    }
    return ruleId
  }

  // Synthetic negative seeds carry their case id as title; name them by the rule they exercise instead.
  function caseLabel(row: EvaluationCase): string {
    if (row.fixtureKind !== 'synthetic_negative') return row.title
    const failing = row.expectedRuleOutcomes.find(outcome => outcome.status === 'fail')
    return failing === undefined
      ? t('evaluations.caseNegative')
      : `${t('evaluations.caseNegative')}${t('common.labelSeparator')}${ruleTitle(failing.ruleId)}`
  }

  return (
    <section data-fashion-page={mode === 'improvements' || mode === 'improvement' ? 'improvements' : 'evaluation'}>
      <FashionPageHeader title={title} description={recorded ? t('evaluations.r0Banner') : undefined} />
      {load === 'loading' ? <p role="status" data-fashion-evaluation-load="loading">{t('evaluations.loading')}</p> : null}
      {load === 'error' ? (
        <div role="alert" data-fashion-evaluation-load="error">
          <p>{t('evaluations.loadError')}</p>
          <Button type="button" onClick={() => setAttempt(value => value + 1)}>{t('evaluations.retry')}</Button>
        </div>
      ) : null}
      {recorded ? <p data-fashion-evaluation-r0>{t('evaluations.r0Banner')}</p> : null}
      {followUpRef !== undefined && (mode === 'evaluations' || mode === 'run') ? (
        <div data-fashion-evaluation-follow-up={followUpRef.deliverableId}>
          <p>
            {t('evaluations.followUpContext')}
            {' '}
            {t('deliverable.revision')}{t('common.labelSeparator')}{followUpRef.deliverableRevision}
            {' · '}
            {t('feedback.conceptRevision')}{t('common.labelSeparator')}{followUpRef.conceptRevision}
          </p>
          <p>{t('evaluations.followUpProjectScope')}</p>
        </div>
      ) : null}
      {mode === 'evaluations' || mode === 'run' ? (
        <div>
          <p>{t('evaluations.noScore')}</p>
          {writable ? (
            <form data-fashion-evaluation-run onSubmit={(event) => {
              event.preventDefault()
              const data = new FormData(event.currentTarget)
              const definitionId = formText(data, 'definitionId')
              if (definitionId === '' || selectedCases.length === 0) {
                setRunState('failed')
                return
              }
              setRunState('running')
              void runEvaluation({ projectId, definitionId, caseIds: selectedCases }).then((run) => {
                setRuns(rows => [run, ...rows])
                setRunState('idle')
                openRun(projectId, String(run.id))
              }).catch(() => setRunState('failed'))
            }}>
              <label>{t('evaluations.definition')}
                <select name="definitionId" defaultValue={definitions[0] === undefined ? '' : String(definitions[0].id)}>
                  {definitions.map(row => <option key={String(row.id)} value={String(row.id)}>{row.name}</option>)}
                </select>
              </label>
              <fieldset>
                <legend>{t('evaluations.cases')}</legend>
                {cases.filter(row => row.fixtureKind !== 'queue_exercise').map(row => (
                  <label key={String(row.id)}>
                    <input
                      type="checkbox"

                      checked={selectedCases.includes(String(row.id))}
                      onChange={(change) => {
                        const id = String(row.id)
                        setSelectedCases(current => change.target.checked
                          ? [...current, id]
                          : current.filter(item => item !== id))
                      }}
                    />
                    {caseLabel(row)}
                  </label>
                ))}
              </fieldset>
              <Button type="submit" disabled={runState === 'running'}>{t('evaluations.run')}</Button>
            </form>
          ) : null}
          {runState === 'running' ? <p role="status">{t('evaluations.running')}</p> : null}
          {runState === 'failed' ? <p role="alert">{t('evaluations.runFailed')}</p> : null}
          <ul data-fashion-definitions>
            {definitions.map(row => (
              <li key={String(row.id)} data-fashion-definition={String(row.id)}>
                {row.name} ({row.definitionVersion}) · {t(DEFINITION_STATUS_LABELS[row.status])}
              </li>
            ))}
          </ul>
          <ul data-fashion-cases>
            {cases.filter(row => row.fixtureKind !== 'queue_exercise').map(row => (
              <li key={String(row.id)} data-fashion-case={String(row.id)} data-fashion-case-kind={row.fixtureKind}>
                {caseLabel(row)}
              </li>
            ))}
          </ul>
          {load === 'ready' && runs.length === 0 ? <p>{t('evaluations.empty')}</p> : null}
          <ul data-fashion-runs>
            {runs.map(row => (
              <li key={String(row.id)}>
                <button type="button" data-fashion-run={String(row.id)} data-fashion-verdict={row.verdict} onClick={() => openRun(projectId, String(row.id))}>
                  {t('evaluations.runLabel')} · {t(VERDICT_LABELS[row.verdict])} · {t(EXECUTION_LABELS[row.executionStatus])} · <LocalizedTime iso={row.startedAt} locale={locale} />
                </button>
              </li>
            ))}
          </ul>
          {mode === 'run' && runId !== undefined ? (
            <div data-fashion-run-detail={runId}>
              <p>{t('evaluations.autoRules')}</p>
              <ul>
                {results.map(row => (
                  <li key={String(row.id)} data-fashion-rule-status={row.status} data-fashion-rule-id={row.ruleId}>
                    {ruleTitle(row.ruleId)}{t('common.labelSeparator')}<span data-fashion-rule-mark={row.status}>{statusLabel(row.status)}</span> · {t(SEVERITY_LABELS[row.severity])} · {row.message}
                  </li>
                ))}
              </ul>
              {load === 'ready' && assessments.length === 0 ? <p>{t('evaluations.humanNotAssessed')}</p> : (
                <ul data-fashion-assessments>
                  {assessments.map(row => (
                    <li key={String(row.id)} data-fashion-assessment-id={String(row.id)}>
                      {row.criterionId}{t('common.labelSeparator')}{t(RATING_LABELS[row.rating])} · {row.reason}
                    </li>
                  ))}
                </ul>
              )}
              {writable ? (
                <>
                  <form data-fashion-assessment onSubmit={(event) => {
                    event.preventDefault()
                    const data = new FormData(event.currentTarget)
                    const criterionId = formText(data, 'criterionId').trim()
                    const reason = formText(data, 'reason').trim()
                    if (criterionId === '' || reason === '') {
                      setRunState('failed')
                      return
                    }
                    setRunState('running')
                    void recordAssessment({
                      projectId,
                      runId,
                      criterionId,
                      rating: String(data.get('rating')) as HumanRating,
                      reason,
                    }).then((row) => {
                      setAssessments(current => [row, ...current.filter(item => String(item.id) !== String(row.id))])
                      setRunState('idle')
                    }).catch(() => setRunState('failed'))
                  }}>
                    <label>{t('evaluations.criterion')}
                      <input name="criterionId" />
                    </label>
                    <label>{t('evaluations.assessmentReason')}
                      <input name="reason" />
                    </label>
                    <select name="rating" defaultValue="unable_to_assess">
                      {RATINGS.map(value => <option key={value} value={value}>{t(RATING_LABELS[value])}</option>)}
                    </select>
                    <Button type="submit">{t('evaluations.submitAssessment')}</Button>
                  </form>
                  <Button type="button" disabled={exportState === 'exporting'} onClick={() => {
                    setExportState('exporting')
                    void exportReport(runId).then((artifacts) => {
                      setReportArtifacts(artifacts)
                      setOpenArtifactId(null)
                      setExportState('exported')
                    }).catch(() => { setExportState('failed') })
                  }}>{t('evaluations.exportReport')}</Button>
                </>
              ) : null}
              {exportState === 'exporting' ? <p role="status">{t('evaluations.exporting')}</p> : null}
              {exportState === 'exported' ? <p role="status">{t('evaluations.exported')}</p> : null}
              {exportState === 'failed' ? <p role="alert" data-fashion-report-export-error>{t('evaluations.exportFailed')}</p> : null}
              {reportArtifacts.length > 0 ? (
                <section aria-label={t('evaluations.reportArtifacts')} data-fashion-report-artifacts>
                  <p>{t('evaluations.reportArtifacts')}</p>
                  <ul>
                    {reportArtifacts.map((artifact) => {
                      const id = String(artifact.id)
                      const label = t(ARTIFACT_LABELS[artifact.format])
                      const open = openArtifactId === id
                      const download = artifactDownload(artifact)
                      const toggleText = open ? t('evaluations.hideArtifact') : t('evaluations.viewArtifact')
                      return (
                        <li key={id} data-fashion-report-artifact={artifact.format}>
                          <span>{label}</span>
                          {' '}
                          <Button
                            type="button"
                            aria-expanded={open}
                            aria-label={`${toggleText}${t('common.labelSeparator')}${label}`}
                            onClick={() => { setOpenArtifactId(open ? null : id) }}
                          >{toggleText}</Button>
                          {' '}
                          <a
                            href={download.href}
                            download={download.filename}
                            aria-label={`${t('evaluations.downloadArtifact')}${t('common.labelSeparator')}${label}`}
                          >{t('evaluations.downloadArtifact')}</a>
                          {open ? <pre data-fashion-report-artifact-text>{artifact.text}</pre> : null}
                        </li>
                      )
                    })}
                  </ul>
                </section>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
      {mode === 'improvements' || mode === 'improvement' ? (
        <div>
          <p>{t('improvements.acceptHint')}</p>
          {load === 'ready' && improvements.length === 0 ? <p>{t('improvements.empty')}</p> : null}
          <ul data-fashion-improvements>
            {improvements.map(row => (
              <li
                key={String(row.item.id)}
                data-fashion-improvement-status={row.status}
                data-fashion-improvement-reality={row.item.dataReality}
              >
                <button type="button" onClick={() => openImprovement(projectId, String(row.item.id))}>
                  {row.item.summary} · {t(IMPROVEMENT_STATUS_LABELS[row.status])}
                </button>
                {row.item.dataReality === 'user_test' ? <span>{t('improvements.userTest')}</span> : null}
                <dl data-fashion-improvement-provenance>
                  <dt>{t('improvements.source')}</dt>
                  <dd data-fashion-improvement-source>
                    {row.item.targetRefs.map(ref => `${ref.type}:${ref.id}@${String(ref.revision)}`).join(', ')}
                  </dd>
                  <dt>{t('improvements.project')}</dt>
                  <dd>{String(row.item.projectId)}</dd>
                  <dt>{t('improvements.dataReality')}</dt>
                  <dd>{t(REALITY_LABELS[row.item.dataReality])}</dd>
                  <dt>{t('improvements.reason')}</dt>
                  <dd>{row.item.summary}</dd>
                </dl>
              </li>
            ))}
          </ul>
          {mode === 'improvement' && itemId !== undefined ? (
            <div data-fashion-improvement-detail={itemId}>
              <p>{t('improvements.acceptHint')}</p>
              {writable && improvements.find(row => String(row.item.id) === itemId)?.status === 'proposed' ? (
                <form onSubmit={(event) => {
                  event.preventDefault()
                  const reason = formText(new FormData(event.currentTarget), 'reason').trim()
                  if (reason === '') {
                    setImprovementState('failed')
                    return
                  }
                  setImprovementState('submitting')
                  void recordImprovementDecision({ projectId, itemId, action: 'accepted', reason, confirmedPlanner: true }).then((row) => {
                    setImprovements(current => current.map(item => String(item.item.id) === itemId ? row : item))
                    setImprovementState('idle')
                  }).catch(() => setImprovementState('failed'))
                }}>
                  <label>{t('improvements.decisionReason')}<input name="reason" /></label>
                  <Button type="submit" disabled={improvementState === 'submitting'}>{t('improvements.accept')}</Button>
                </form>
              ) : null}
              {improvementState === 'failed' ? <p role="alert">{t('improvements.acceptFailed')}</p> : null}
            </div>
          ) : null}
        </div>
      ) : null}
      <Button type="button" onClick={() => openOverview(projectId)}>{t('overview.back')}</Button>
    </section>
  )
}
