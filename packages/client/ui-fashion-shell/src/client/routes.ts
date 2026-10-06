/** Pure Fashion product routes. Session ids are never project ids. */

/** Exact deliverable and selected-concept revisions carried from a deliverable into follow-up pages. */
export interface DeliverableFollowUpRef {
  readonly deliverableId: string
  readonly deliverableRevision: number
  readonly conceptId: string
  readonly conceptRevision: number
}

export type FashionRoute =
  | { kind: 'projects' }
  | { kind: 'project-overview'; projectId: string }
  | { kind: 'research-home'; projectId: string }
  | { kind: 'research-task-new'; projectId: string }
  | { kind: 'research-task'; projectId: string; taskId: string }
  | { kind: 'research-source-new'; projectId: string; taskId: string }
  | { kind: 'research-source'; projectId: string; taskId: string; sourceId: string }
  | { kind: 'research-sample'; projectId: string; taskId: string; sampleId: string }
  | { kind: 'research-evidence'; projectId: string; taskId: string; evidenceId: string }
  | { kind: 'analysis-home'; projectId: string; taskId: string }
  | { kind: 'analysis-item'; projectId: string; taskId: string; marketItemId: string }
  | { kind: 'analysis-signal'; projectId: string; taskId: string; signalId: string }
  | { kind: 'analysis-cluster'; projectId: string; taskId: string; clusterId: string }
  | { kind: 'analysis-opportunity'; projectId: string; taskId: string; opportunityId: string }
  | { kind: 'design-directions'; projectId: string }
  | { kind: 'design-brief'; projectId: string; opportunityId: string }
  | { kind: 'design-concept-set'; projectId: string; conceptSetId: string }
  | { kind: 'design-concept'; projectId: string; conceptId: string }
  | { kind: 'design-visual'; projectId: string; conceptId: string; visualDraftId: string }
  | { kind: 'review-home'; projectId: string }
  | { kind: 'review-round'; projectId: string; reviewRoundId: string }
  | { kind: 'deliverables-home'; projectId: string }
  | { kind: 'deliverable-detail'; projectId: string; deliverableId: string }
  | { kind: 'feedback-home'; projectId: string }
  | { kind: 'feedback-new'; projectId: string; followUpRef?: DeliverableFollowUpRef }
  | { kind: 'feedback-detail'; projectId: string; feedbackId: string }
  | { kind: 'outcomes-home'; projectId: string; followUpRef?: DeliverableFollowUpRef }
  | { kind: 'evaluations-home'; projectId: string; followUpRef?: DeliverableFollowUpRef }
  | { kind: 'evaluation-run'; projectId: string; runId: string }
  | { kind: 'improvements-home'; projectId: string }
  | { kind: 'improvement-detail'; projectId: string; itemId: string }
  | { kind: 'not-found'; pathname: string }

/** Stable R0 fixture project id used by F1-01 overview. */
export const R0_PROJECT_ID = 'r0-us-womens-khaki-utility-jacket'

/**
 * Parse a browser pathname into a FashionRoute.
 * @param pathname - `location.pathname` (leading slash optional for tests).
 */
export function parseFashionRoute(pathname: string): FashionRoute {
  const normalized = normalizePathname(pathname)
  if (normalized === '/projects') return { kind: 'projects' }

  const overview = /^\/projects\/([^/]+)\/overview$/.exec(normalized)
  if (overview?.[1] !== undefined) {
    return { kind: 'project-overview', projectId: decodeURIComponent(overview[1]) }
  }

  const researchHome = /^\/projects\/([^/]+)\/research$/.exec(normalized)
  if (researchHome?.[1] !== undefined) {
    return { kind: 'research-home', projectId: decodeURIComponent(researchHome[1]) }
  }

  const taskNew = /^\/projects\/([^/]+)\/research\/tasks\/new$/.exec(normalized)
  if (taskNew?.[1] !== undefined) {
    return { kind: 'research-task-new', projectId: decodeURIComponent(taskNew[1]) }
  }

  const sourceNew = /^\/projects\/([^/]+)\/research\/tasks\/([^/]+)\/sources\/new$/.exec(normalized)
  if (sourceNew?.[1] !== undefined && sourceNew[2] !== undefined) {
    return {
      kind: 'research-source-new',
      projectId: decodeURIComponent(sourceNew[1]),
      taskId: decodeURIComponent(sourceNew[2]),
    }
  }

  const source = /^\/projects\/([^/]+)\/research\/tasks\/([^/]+)\/sources\/([^/]+)$/.exec(normalized)
  if (source?.[1] !== undefined && source[2] !== undefined && source[3] !== undefined) {
    return {
      kind: 'research-source',
      projectId: decodeURIComponent(source[1]),
      taskId: decodeURIComponent(source[2]),
      sourceId: decodeURIComponent(source[3]),
    }
  }

  const sample = /^\/projects\/([^/]+)\/research\/tasks\/([^/]+)\/samples\/([^/]+)$/.exec(normalized)
  if (sample?.[1] !== undefined && sample[2] !== undefined && sample[3] !== undefined) {
    return {
      kind: 'research-sample',
      projectId: decodeURIComponent(sample[1]),
      taskId: decodeURIComponent(sample[2]),
      sampleId: decodeURIComponent(sample[3]),
    }
  }

  const evidence = /^\/projects\/([^/]+)\/research\/tasks\/([^/]+)\/evidence\/([^/]+)$/.exec(normalized)
  if (evidence?.[1] !== undefined && evidence[2] !== undefined && evidence[3] !== undefined) {
    return {
      kind: 'research-evidence',
      projectId: decodeURIComponent(evidence[1]),
      taskId: decodeURIComponent(evidence[2]),
      evidenceId: decodeURIComponent(evidence[3]),
    }
  }

  const analysisOpp = /^\/projects\/([^/]+)\/research\/tasks\/([^/]+)\/analysis\/opportunities\/([^/]+)$/.exec(normalized)
  if (analysisOpp?.[1] !== undefined && analysisOpp[2] !== undefined && analysisOpp[3] !== undefined) {
    return {
      kind: 'analysis-opportunity',
      projectId: decodeURIComponent(analysisOpp[1]),
      taskId: decodeURIComponent(analysisOpp[2]),
      opportunityId: decodeURIComponent(analysisOpp[3]),
    }
  }

  const analysisCluster = /^\/projects\/([^/]+)\/research\/tasks\/([^/]+)\/analysis\/clusters\/([^/]+)$/.exec(normalized)
  if (analysisCluster?.[1] !== undefined && analysisCluster[2] !== undefined && analysisCluster[3] !== undefined) {
    return {
      kind: 'analysis-cluster',
      projectId: decodeURIComponent(analysisCluster[1]),
      taskId: decodeURIComponent(analysisCluster[2]),
      clusterId: decodeURIComponent(analysisCluster[3]),
    }
  }

  const analysisSignal = /^\/projects\/([^/]+)\/research\/tasks\/([^/]+)\/analysis\/signals\/([^/]+)$/.exec(normalized)
  if (analysisSignal?.[1] !== undefined && analysisSignal[2] !== undefined && analysisSignal[3] !== undefined) {
    return {
      kind: 'analysis-signal',
      projectId: decodeURIComponent(analysisSignal[1]),
      taskId: decodeURIComponent(analysisSignal[2]),
      signalId: decodeURIComponent(analysisSignal[3]),
    }
  }

  const analysisItem = /^\/projects\/([^/]+)\/research\/tasks\/([^/]+)\/analysis\/items\/([^/]+)$/.exec(normalized)
  if (analysisItem?.[1] !== undefined && analysisItem[2] !== undefined && analysisItem[3] !== undefined) {
    return {
      kind: 'analysis-item',
      projectId: decodeURIComponent(analysisItem[1]),
      taskId: decodeURIComponent(analysisItem[2]),
      marketItemId: decodeURIComponent(analysisItem[3]),
    }
  }

  const analysisHome = /^\/projects\/([^/]+)\/research\/tasks\/([^/]+)\/analysis$/.exec(normalized)
  if (analysisHome?.[1] !== undefined && analysisHome[2] !== undefined) {
    return {
      kind: 'analysis-home',
      projectId: decodeURIComponent(analysisHome[1]),
      taskId: decodeURIComponent(analysisHome[2]),
    }
  }

  const designVisual = /^\/projects\/([^/]+)\/directions\/concepts\/([^/]+)\/visuals\/([^/]+)$/.exec(normalized)
  if (designVisual?.[1] !== undefined && designVisual[2] !== undefined && designVisual[3] !== undefined) {
    return {
      kind: 'design-visual',
      projectId: decodeURIComponent(designVisual[1]),
      conceptId: decodeURIComponent(designVisual[2]),
      visualDraftId: decodeURIComponent(designVisual[3]),
    }
  }

  const designConcept = /^\/projects\/([^/]+)\/directions\/concepts\/([^/]+)$/.exec(normalized)
  if (designConcept?.[1] !== undefined && designConcept[2] !== undefined) {
    return {
      kind: 'design-concept',
      projectId: decodeURIComponent(designConcept[1]),
      conceptId: decodeURIComponent(designConcept[2]),
    }
  }

  const designSet = /^\/projects\/([^/]+)\/directions\/sets\/([^/]+)$/.exec(normalized)
  if (designSet?.[1] !== undefined && designSet[2] !== undefined) {
    return {
      kind: 'design-concept-set',
      projectId: decodeURIComponent(designSet[1]),
      conceptSetId: decodeURIComponent(designSet[2]),
    }
  }

  const designBrief = /^\/projects\/([^/]+)\/opportunities\/([^/]+)\/brief$/.exec(normalized)
  if (designBrief?.[1] !== undefined && designBrief[2] !== undefined) {
    return {
      kind: 'design-brief',
      projectId: decodeURIComponent(designBrief[1]),
      opportunityId: decodeURIComponent(designBrief[2]),
    }
  }

  const designDirections = /^\/projects\/([^/]+)\/directions$/.exec(normalized)
  if (designDirections?.[1] !== undefined) {
    return {
      kind: 'design-directions',
      projectId: decodeURIComponent(designDirections[1]),
    }
  }

  const deliverableDetail = /^\/projects\/([^/]+)\/deliverables\/([^/]+)$/.exec(normalized)
  if (deliverableDetail?.[1] !== undefined && deliverableDetail[2] !== undefined) {
    return {
      kind: 'deliverable-detail',
      projectId: decodeURIComponent(deliverableDetail[1]),
      deliverableId: decodeURIComponent(deliverableDetail[2]),
    }
  }

  const deliverablesHome = /^\/projects\/([^/]+)\/deliverables$/.exec(normalized)
  if (deliverablesHome?.[1] !== undefined) {
    return {
      kind: 'deliverables-home',
      projectId: decodeURIComponent(deliverablesHome[1]),
    }
  }

  const followUp = new RegExp(
    '^/projects/([^/]+)/(feedback/new|outcomes|evaluations)'
    + '/deliverables/([^/]+)/revisions/(0|[1-9][0-9]*)'
    + '/concepts/([^/]+)/revisions/(0|[1-9][0-9]*)$',
  ).exec(normalized)
  if (followUp?.[1] !== undefined && followUp[2] !== undefined && followUp[3] !== undefined
    && followUp[4] !== undefined && followUp[5] !== undefined && followUp[6] !== undefined) {
    const followUpRef: DeliverableFollowUpRef = {
      deliverableId: decodeURIComponent(followUp[3]),
      deliverableRevision: Number(followUp[4]),
      conceptId: decodeURIComponent(followUp[5]),
      conceptRevision: Number(followUp[6]),
    }
    const projectId = decodeURIComponent(followUp[1])
    if (followUp[2] === 'feedback/new') return { kind: 'feedback-new', projectId, followUpRef }
    if (followUp[2] === 'outcomes') return { kind: 'outcomes-home', projectId, followUpRef }
    return { kind: 'evaluations-home', projectId, followUpRef }
  }

  const feedbackNew = /^\/projects\/([^/]+)\/feedback\/new$/.exec(normalized)
  if (feedbackNew?.[1] !== undefined) {
    return {
      kind: 'feedback-new',
      projectId: decodeURIComponent(feedbackNew[1]),
    }
  }

  const feedbackDetail = /^\/projects\/([^/]+)\/feedback\/([^/]+)$/.exec(normalized)
  if (feedbackDetail?.[1] !== undefined && feedbackDetail[2] !== undefined && feedbackDetail[2] !== 'new') {
    return {
      kind: 'feedback-detail',
      projectId: decodeURIComponent(feedbackDetail[1]),
      feedbackId: decodeURIComponent(feedbackDetail[2]),
    }
  }

  const feedbackHome = /^\/projects\/([^/]+)\/feedback$/.exec(normalized)
  if (feedbackHome?.[1] !== undefined) {
    return {
      kind: 'feedback-home',
      projectId: decodeURIComponent(feedbackHome[1]),
    }
  }

  const outcomesHome = /^\/projects\/([^/]+)\/outcomes$/.exec(normalized)
  if (outcomesHome?.[1] !== undefined) {
    return {
      kind: 'outcomes-home',
      projectId: decodeURIComponent(outcomesHome[1]),
    }
  }

  const evaluationRun = /^\/projects\/([^/]+)\/evaluations\/runs\/([^/]+)$/.exec(normalized)
  if (evaluationRun?.[1] !== undefined && evaluationRun[2] !== undefined) {
    return {
      kind: 'evaluation-run',
      projectId: decodeURIComponent(evaluationRun[1]),
      runId: decodeURIComponent(evaluationRun[2]),
    }
  }

  const evaluationsHome = /^\/projects\/([^/]+)\/evaluations$/.exec(normalized)
  if (evaluationsHome?.[1] !== undefined) {
    return {
      kind: 'evaluations-home',
      projectId: decodeURIComponent(evaluationsHome[1]),
    }
  }

  const improvementDetail = /^\/projects\/([^/]+)\/improvements\/([^/]+)$/.exec(normalized)
  if (improvementDetail?.[1] !== undefined && improvementDetail[2] !== undefined) {
    return {
      kind: 'improvement-detail',
      projectId: decodeURIComponent(improvementDetail[1]),
      itemId: decodeURIComponent(improvementDetail[2]),
    }
  }

  const improvementsHome = /^\/projects\/([^/]+)\/improvements$/.exec(normalized)
  if (improvementsHome?.[1] !== undefined) {
    return {
      kind: 'improvements-home',
      projectId: decodeURIComponent(improvementsHome[1]),
    }
  }

  const reviewRound = /^\/projects\/([^/]+)\/reviews\/([^/]+)$/.exec(normalized)
  if (reviewRound?.[1] !== undefined && reviewRound[2] !== undefined) {
    return {
      kind: 'review-round',
      projectId: decodeURIComponent(reviewRound[1]),
      reviewRoundId: decodeURIComponent(reviewRound[2]),
    }
  }

  const reviewHome = /^\/projects\/([^/]+)\/review$/.exec(normalized)
  if (reviewHome?.[1] !== undefined) {
    return {
      kind: 'review-home',
      projectId: decodeURIComponent(reviewHome[1]),
    }
  }

  const task = /^\/projects\/([^/]+)\/research\/tasks\/([^/]+)$/.exec(normalized)
  if (task?.[1] !== undefined && task[2] !== undefined) {
    return {
      kind: 'research-task',
      projectId: decodeURIComponent(task[1]),
      taskId: decodeURIComponent(task[2]),
    }
  }

  const projectBare = /^\/projects\/([^/]+)$/.exec(normalized)
  if (projectBare?.[1] !== undefined) {
    return {
      kind: 'project-overview',
      projectId: decodeURIComponent(projectBare[1]),
    }
  }

  return { kind: 'not-found', pathname: normalized === '' ? '/' : normalized }
}

/**
 * Format a FashionRoute as a pathname.
 * @param route - typed product route.
 */
export function formatFashionRoute(route: FashionRoute): string {
  switch (route.kind) {
    case 'projects':
      return '/projects'
    case 'project-overview':
      return `/projects/${encodeURIComponent(route.projectId)}/overview`
    case 'research-home':
      return `/projects/${encodeURIComponent(route.projectId)}/research`
    case 'research-task-new':
      return `/projects/${encodeURIComponent(route.projectId)}/research/tasks/new`
    case 'research-task':
      return `/projects/${encodeURIComponent(route.projectId)}/research/tasks/${encodeURIComponent(route.taskId)}`
    case 'research-source-new':
      return `/projects/${encodeURIComponent(route.projectId)}/research/tasks/${encodeURIComponent(route.taskId)}/sources/new`
    case 'research-source':
      return `/projects/${encodeURIComponent(route.projectId)}/research/tasks/${encodeURIComponent(route.taskId)}/sources/${encodeURIComponent(route.sourceId)}`
    case 'research-sample':
      return `/projects/${encodeURIComponent(route.projectId)}/research/tasks/${encodeURIComponent(route.taskId)}/samples/${encodeURIComponent(route.sampleId)}`
    case 'research-evidence':
      return `/projects/${encodeURIComponent(route.projectId)}/research/tasks/${encodeURIComponent(route.taskId)}/evidence/${encodeURIComponent(route.evidenceId)}`
    case 'analysis-home':
      return `/projects/${encodeURIComponent(route.projectId)}/research/tasks/${encodeURIComponent(route.taskId)}/analysis`
    case 'analysis-item':
      return `/projects/${encodeURIComponent(route.projectId)}/research/tasks/${encodeURIComponent(route.taskId)}/analysis/items/${encodeURIComponent(route.marketItemId)}`
    case 'analysis-signal':
      return `/projects/${encodeURIComponent(route.projectId)}/research/tasks/${encodeURIComponent(route.taskId)}/analysis/signals/${encodeURIComponent(route.signalId)}`
    case 'analysis-cluster':
      return `/projects/${encodeURIComponent(route.projectId)}/research/tasks/${encodeURIComponent(route.taskId)}/analysis/clusters/${encodeURIComponent(route.clusterId)}`
    case 'analysis-opportunity':
      return `/projects/${encodeURIComponent(route.projectId)}/research/tasks/${encodeURIComponent(route.taskId)}/analysis/opportunities/${encodeURIComponent(route.opportunityId)}`
    case 'design-directions':
      return `/projects/${encodeURIComponent(route.projectId)}/directions`
    case 'design-brief':
      return `/projects/${encodeURIComponent(route.projectId)}/opportunities/${encodeURIComponent(route.opportunityId)}/brief`
    case 'design-concept-set':
      return `/projects/${encodeURIComponent(route.projectId)}/directions/sets/${encodeURIComponent(route.conceptSetId)}`
    case 'design-concept':
      return `/projects/${encodeURIComponent(route.projectId)}/directions/concepts/${encodeURIComponent(route.conceptId)}`
    case 'design-visual':
      return `/projects/${encodeURIComponent(route.projectId)}/directions/concepts/${encodeURIComponent(route.conceptId)}/visuals/${encodeURIComponent(route.visualDraftId)}`
    case 'review-home':
      return `/projects/${encodeURIComponent(route.projectId)}/review`
    case 'review-round':
      return `/projects/${encodeURIComponent(route.projectId)}/reviews/${encodeURIComponent(route.reviewRoundId)}`
    case 'deliverables-home':
      return `/projects/${encodeURIComponent(route.projectId)}/deliverables`
    case 'deliverable-detail':
      return `/projects/${encodeURIComponent(route.projectId)}/deliverables/${encodeURIComponent(route.deliverableId)}`
    case 'feedback-home':
      return `/projects/${encodeURIComponent(route.projectId)}/feedback`
    case 'feedback-new':
      return `/projects/${encodeURIComponent(route.projectId)}/feedback/new${formatFollowUpSuffix(route.followUpRef)}`
    case 'feedback-detail':
      return `/projects/${encodeURIComponent(route.projectId)}/feedback/${encodeURIComponent(route.feedbackId)}`
    case 'outcomes-home':
      return `/projects/${encodeURIComponent(route.projectId)}/outcomes${formatFollowUpSuffix(route.followUpRef)}`
    case 'evaluations-home':
      return `/projects/${encodeURIComponent(route.projectId)}/evaluations${formatFollowUpSuffix(route.followUpRef)}`
    case 'evaluation-run':
      return `/projects/${encodeURIComponent(route.projectId)}/evaluations/runs/${encodeURIComponent(route.runId)}`
    case 'improvements-home':
      return `/projects/${encodeURIComponent(route.projectId)}/improvements`
    case 'improvement-detail':
      return `/projects/${encodeURIComponent(route.projectId)}/improvements/${encodeURIComponent(route.itemId)}`
    case 'not-found':
      return route.pathname.startsWith('/') ? route.pathname : `/${route.pathname}`
  }
}

function formatFollowUpSuffix(ref: DeliverableFollowUpRef | undefined): string {
  if (ref === undefined) return ''
  return `/deliverables/${encodeURIComponent(ref.deliverableId)}/revisions/${ref.deliverableRevision}`
    + `/concepts/${encodeURIComponent(ref.conceptId)}/revisions/${ref.conceptRevision}`
}

/** Collapse duplicate slashes, strip trailing slash (except root), ensure leading slash. */
function normalizePathname(pathname: string): string {
  let path = pathname.trim()
  if (path === '') return '/'
  if (!path.startsWith('/')) path = `/${path}`
  path = path.replace(/\/{2,}/g, '/')
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1)
  return path
}
