/**
 * Public type vocabulary of Fashion Agent binding and read-only snapshots.
 * @module @gentlexx/dsh-fashion-agent/src/types
 */

import type { ProjectAccessMode, ProjectId, ProjectOrigin } from '@gentlexx/dsh-fashion-project/types'
import type { SessionId } from '@deepseek-ai/dsh-session'
import type {} from '@deepseek-ai/dsh-typert-protocol'

/** Named compact snapshot sections authorized for one bound turn. */
export const FASHION_AGENT_SCOPE_IDS = [
  'project',
  'research',
  'analysis',
  'brief',
  'directions',
  'review',
  'deliverable',
  'feedback',
  'evaluation',
  'improvement',
] as const

/** One compact snapshot section id. */
export type FashionAgentScopeId = (typeof FASHION_AGENT_SCOPE_IDS)[number]

/** On-demand query sections; identical to snapshot scope ids. */
export type FashionAgentQuerySection = FashionAgentScopeId

/** Client-supplied entry page when binding from a Fashion route. */
export type FashionAgentEntrySurface =
  | 'overview'
  | 'research'
  | 'analysis'
  | 'design'
  | 'review'
  | 'deliverable'
  | 'feedback'
  | 'evaluation'
  | 'improvement'
  | 'agent'

/** Durable Project–Session binding. Snapshot bodies are never stored here. */
export interface FashionSessionBinding {
  readonly sessionId: SessionId
  readonly projectId: ProjectId
  readonly boundAt: string
  readonly entrySurface: FashionAgentEntrySurface | null
}

/** Compact project identity block. Missing text is `null`, never `''`. */
export interface FashionAgentProjectSummary {
  readonly projectId: ProjectId
  readonly title: string
  readonly origin: ProjectOrigin
  readonly accessMode: ProjectAccessMode
  readonly updatedAt: string
  readonly revision: number
}

/** Compact research row. */
export interface FashionAgentResearchSummary {
  readonly taskId: string
  readonly title: string
  readonly status: string
  readonly sourceCount: number
  readonly evidenceCount: number
  readonly sampleCount: number
  readonly evidenceClaims: readonly string[]
  readonly sampleTitles: readonly string[]
}

/** Compact analysis row. */
export interface FashionAgentAnalysisSummary {
  readonly taskId: string
  readonly signals: readonly { readonly id: string; readonly type: string; readonly platform: string }[]
  readonly opportunities: readonly {
    readonly id: string
    readonly title: string
    readonly statement: string
    readonly currentDecisionAction: string | null
  }[]
}

/** Compact Brief block. */
export interface FashionAgentBriefSummary {
  readonly briefId: string
  readonly status: string
  readonly category: string
  readonly market: string
  readonly season: string
  readonly targetUser: string
  readonly constraints: readonly string[]
  readonly unknowns: readonly string[]
}

/** Compact direction / exact revision. */
export interface FashionAgentDirectionSummary {
  readonly conceptId: string
  readonly revision: number
  readonly name: string
  readonly designIntent: string
  readonly silhouette: string
  readonly proportionAndLength: string
  readonly status: string
}

/** Compact review / approval block. */
export interface FashionAgentReviewSummary {
  readonly reviewRoundId: string
  readonly status: string
  readonly selectedConceptId: string | null
  readonly approvedConceptId: string | null
  readonly approvalValid: boolean | null
  readonly reasonText: string | null
}

/** Compact deliverable block. */
export interface FashionAgentDeliverableSummary {
  readonly deliverableId: string
  readonly status: string
  readonly rendererVersion: string
  readonly snapshotHash: string
  readonly artifactKinds: readonly string[]
}

/** Compact feedback / outcome block. */
export interface FashionAgentFeedbackSummary {
  readonly currentCount: number
  readonly historyCount: number
  readonly currentActions: readonly string[]
  readonly availabilityStates: readonly string[]
  readonly developmentStages: readonly string[]
  readonly metricCount: number
}

/** Compact evaluation / improvement block. */
export interface FashionAgentEvaluationSummary {
  readonly runCount: number
  readonly latestVerdict: string | null
  readonly latestExecutionStatus: string | null
  readonly assessmentCount: number
  readonly improvementSummaries: readonly string[]
}

/** Host-authored compact project snapshot injected each eligible turn. */
export interface FashionProjectSnapshot {
  readonly project: FashionAgentProjectSummary
  readonly currentStage: string
  readonly stageStatuses: readonly { readonly stage: string; readonly status: string }[]
  readonly entrySurface: FashionAgentEntrySurface | null
  readonly research: readonly FashionAgentResearchSummary[]
  readonly analysis: readonly FashionAgentAnalysisSummary[]
  readonly brief: FashionAgentBriefSummary | null
  readonly directions: readonly FashionAgentDirectionSummary[]
  readonly review: FashionAgentReviewSummary | null
  readonly deliverable: FashionAgentDeliverableSummary | null
  readonly feedback: FashionAgentFeedbackSummary | null
  readonly evaluation: FashionAgentEvaluationSummary | null
  readonly snapshotVersion: string
  readonly projectUpdatedAt: string
  readonly generatedAt: string
  readonly dataScope: readonly FashionAgentScopeId[]
}

/** Result of attempting to bind a session to a project. */
export type FashionBindResult =
  | {
    readonly kind: 'bound'
    readonly binding: FashionSessionBinding
    readonly snapshot: FashionProjectSnapshot
  }
  | {
    readonly kind: 'already-bound'
    readonly binding: FashionSessionBinding
    readonly snapshot: FashionProjectSnapshot
  }
  | {
    readonly kind: 'conflict-other-project'
    readonly binding: FashionSessionBinding
    readonly requestedProjectId: ProjectId
  }
  | {
    readonly kind: 'needs-confirm'
    readonly sessionId: SessionId
    readonly projectId: ProjectId
  }
  | {
    readonly kind: 'unavailable'
    readonly projectId: ProjectId
    readonly reason: 'not-found' | 'inaccessible' | 'snapshot-failed'
    readonly message: string
  }

/** Live injection / UI status derived from binding + latest snapshot. */
export type FashionAgentContextStatus =
  | { readonly kind: 'unbound'; readonly sessionId: SessionId }
  | {
    readonly kind: 'bound'
    readonly binding: FashionSessionBinding
    readonly snapshot: FashionProjectSnapshot
  }
  | {
    readonly kind: 'unavailable'
    readonly sessionId: SessionId
    readonly projectId: ProjectId | null
    readonly reason: 'not-found' | 'inaccessible' | 'snapshot-failed' | 'broken-reference'
    readonly message: string
  }

declare module '@deepseek-ai/dsh-typert-protocol' {
  interface RemoteErrorDetailsMap {
    /** Requested project cannot be used for Agent context. */
    'fashion-agent/project-unavailable': {
      readonly projectId: ProjectId
      readonly reason: 'not-found' | 'inaccessible' | 'snapshot-failed'
    }
    /** Session already bound to a different project. */
    'fashion-agent/binding-conflict': {
      readonly sessionId: SessionId
      readonly boundProjectId: ProjectId
      readonly requestedProjectId: ProjectId
    }
    /** Unbound session already has user/assistant messages. */
    'fashion-agent/needs-confirm': {
      readonly sessionId: SessionId
      readonly projectId: ProjectId
    }
    /** Session has no Fashion project binding. */
    'fashion-agent/unbound': { readonly sessionId: SessionId }
  }
}
