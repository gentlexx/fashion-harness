/**
 * Pure Fashion Project presentation mapping (F1-03 §4).
 * No React, no Remote, no schema inference from titles.
 * @module @gentlexx/dsh-client-ui-fashion-shell/src/client/presentation/project-presentation
 */

import type {
  ProjectAccessMode,
  ProjectOrigin,
  ProjectView,
} from '@gentlexx/dsh-fashion-project/types'

/** Locale keys for origin Tag copy. */
export type OriginLabelKey = 'origin.user' | 'origin.publicRebuild'

/** Locale keys for accessMode Tag copy. */
export type AccessLabelKey = 'access.editable' | 'access.readOnly'

/** Locale keys for card capability status (UI-derived, not a domain stage). */
export type CapabilityLabelKey = 'capability.foundationReady' | 'capability.publicRebuild'

/** Locale keys for card next-step guidance (UI-derived). */
export type NextStepLabelKey = 'nextStep.openOverview' | 'nextStep.viewPublicCase'

/** Locale keys for list section headings. */
export type SectionLabelKey = 'section.recent' | 'section.public'

/** R0 pipeline internal states mapped to locale keys (never raw English in DOM). */
export type PipelineStateKey =
  | 'pipeline.recorded'
  | 'pipeline.candidate'
  | 'pipeline.pending'
  | 'pipeline.comingSoon'

/**
 * Map durable origin to a Fashion locale key.
 * @param origin - Host `ProjectView.origin`.
 */
export function originLabelKey(origin: ProjectOrigin): OriginLabelKey {
  return origin === 'public-rebuild' ? 'origin.publicRebuild' : 'origin.user'
}

/**
 * Map durable accessMode to a Fashion locale key.
 * @param accessMode - Host `ProjectView.accessMode`.
 */
export function accessLabelKey(accessMode: ProjectAccessMode): AccessLabelKey {
  return accessMode === 'read-only' ? 'access.readOnly' : 'access.editable'
}

/**
 * Capability status shown on cards — UI availability, not a business stage.
 * @param origin - Host origin.
 */
export function capabilityLabelKey(origin: ProjectOrigin): CapabilityLabelKey {
  return origin === 'public-rebuild' ? 'capability.publicRebuild' : 'capability.foundationReady'
}

/**
 * Next-step interface guidance for a card primary CTA companion line.
 * @param origin - Host origin.
 */
export function nextStepLabelKey(origin: ProjectOrigin): NextStepLabelKey {
  return origin === 'public-rebuild' ? 'nextStep.viewPublicCase' : 'nextStep.openOverview'
}

/**
 * Whether the project uses the R0 fixture Overview (fixed id + public-rebuild).
 * @param project - Host projection or list row.
 * @param r0ProjectId - Reserved R0 id constant from routes.
 */
export function isR0Project(project: Pick<ProjectView, 'id' | 'origin'>, r0ProjectId: string): boolean {
  return project.origin === 'public-rebuild' && project.id === r0ProjectId
}

/**
 * Partition list rows by origin while preserving Host order within each group.
 * @param items - Host-stable ordered list.
 */
export function partitionByOrigin(items: readonly ProjectView[]): {
  readonly user: readonly ProjectView[]
  readonly publicRebuild: readonly ProjectView[]
} {
  const user: ProjectView[] = []
  const publicRebuild: ProjectView[] = []
  for (const item of items) {
    if (item.origin === 'public-rebuild') publicRebuild.push(item)
    else user.push(item)
  }
  return { user, publicRebuild }
}

/**
 * Map R0 fixture pipeline state tokens to locale keys.
 * Unknown tokens fall through to coming-soon (honest unavailable).
 * @param state - Fixture-internal English token.
 */
export function pipelineStateKey(state: string): PipelineStateKey {
  switch (state) {
    case 'recorded':
      return 'pipeline.recorded'
    case 'candidate':
      return 'pipeline.candidate'
    case 'pending':
      return 'pipeline.pending'
    case 'coming-soon':
      return 'pipeline.comingSoon'
    default:
      return 'pipeline.comingSoon'
  }
}

/**
 * Tag tone hint for origin (presentation only; Tag still receives localized children).
 * @param origin - Host origin.
 */
export function originTagTone(origin: ProjectOrigin): 'warning' | 'info' {
  return origin === 'public-rebuild' ? 'warning' : 'info'
}

/**
 * Tag tone hint for access mode.
 * @param accessMode - Host access mode.
 */
export function accessTagTone(accessMode: ProjectAccessMode): 'outline' | 'neutral' {
  return accessMode === 'read-only' ? 'neutral' : 'outline'
}

/** Locale keys for fixed capability-rail stage labels (UI-only; not Host fields). */
export type StageLabelKey =
  | 'stage.research'
  | 'stage.opportunity'
  | 'stage.direction'
  | 'stage.review'
  | 'stage.export'

/** One non-interactive capability-rail step for user Overview (all coming-soon). */
export type CapabilityRailStep = {
  readonly id: string
  readonly labelKey: StageLabelKey
  readonly stateKey: PipelineStateKey
}

/**
 * Counts of the durable records each Overview stage summarizes, read per
 * project from the Fashion domain services. Every count is a record count, not
 * a score: a stage is either recorded or still has nothing recorded.
 */
export type ProjectStageObservations = {
  /** Research tasks registered in this project. */
  readonly researchTasks: number
  /**
   * Design briefs in this project. A brief requires a selection Decision on a
   * design opportunity, so a brief is the durable evidence that a human
   * selected an opportunity; a candidate opportunity alone is not.
   */
  readonly opportunityBriefs: number
  /** Concept sets in this project. */
  readonly conceptSets: number
  /** Review rounds opened in this project. */
  readonly reviewRounds: number
  /** Decision packages generated in this project. */
  readonly deliverables: number
}

/**
 * Project Overview capability rail derived from durable record counts.
 *
 * A stage reads `recorded` once the project holds at least one of that stage's
 * records and `pending` while it holds none; neither state is stored on the
 * project, so the rail agrees with the domain data after a reload and after a
 * process restart.
 * @param observations - per-project record counts.
 * @returns the five Phase-1 stages in business order.
 */
export function deriveProjectStages(
  observations: ProjectStageObservations,
): readonly CapabilityRailStep[] {
  const state = (count: number): PipelineStateKey =>
    count > 0 ? 'pipeline.recorded' : 'pipeline.pending'
  return [
    { id: 'research', labelKey: 'stage.research', stateKey: state(observations.researchTasks) },
    { id: 'opportunity', labelKey: 'stage.opportunity', stateKey: state(observations.opportunityBriefs) },
    { id: 'direction', labelKey: 'stage.direction', stateKey: state(observations.conceptSets) },
    { id: 'review', labelKey: 'stage.review', stateKey: state(observations.reviewRounds) },
    { id: 'export', labelKey: 'stage.export', stateKey: state(observations.deliverables) },
  ]
}

/** Host not-found RemoteFailure code for Overview distinction (§7.4). */
export const FASHION_PROJECT_NOT_FOUND = 'fashion-project/not-found'

/**
 * Whether a thrown get() failure is object-not-found vs transport/other.
 * @param error - unknown rejection from fashionProjects.get.
 */
export function isFashionProjectNotFound(error: unknown): boolean {
  return typeof error === 'object'
    && error !== null
    && 'code' in error
    && (error as { code: unknown }).code === FASHION_PROJECT_NOT_FOUND
}
