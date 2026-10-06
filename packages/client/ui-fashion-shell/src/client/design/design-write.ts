/** Design-stage write inputs and results shared by the apply closure and design components. */
import type { ConstraintEntry } from '@gentlexx/dsh-fashion-design/types'
import type { FashionKey } from '../locales.ts'

/**
 * Brief draft built from one selected Opportunity record; the revision and
 * selection decision come from that record, never from user input.
 */
export interface DesignBriefDraftInput {
  readonly projectId: string
  readonly opportunityId: string
  readonly expectedOpportunityRevision: number
  readonly selectionDecisionId: string
  readonly market: string
  readonly season: string
  readonly category: string
  readonly targetUser: string
  readonly brandContext: string | null
  readonly mustKeep: readonly ConstraintEntry[]
  readonly mustAvoid: readonly ConstraintEntry[]
  readonly materialsConstraints: readonly ConstraintEntry[]
  readonly costConstraints: readonly ConstraintEntry[]
  readonly productionConstraints: readonly ConstraintEntry[]
  readonly differentiationGoals: readonly ConstraintEntry[]
  readonly openQuestions: readonly ConstraintEntry[]
}

/** Concept draft added to the current draft ConceptSet at its recorded revision. */
export interface DesignConceptDraftInput {
  readonly projectId: string
  readonly conceptSetId: string
  readonly expectedConceptSetRevision: number
  readonly conceptName: string
  readonly designIntent: string
  readonly silhouette: string
  readonly proportionAndLength: string
  readonly materialDirection: string
  readonly colorDirection: string
  readonly constructionAndDetails: readonly string[]
  readonly functionalValue: readonly string[]
  readonly targetUseScenarios: readonly string[]
  readonly originalTransformationNotes: readonly string[]
  readonly productionUnknowns: readonly string[]
}

/**
 * Full replacement of one current-set Concept's fields; `expectedRevision` is
 * the loaded Concept record's revision, never user input.
 */
export interface DesignConceptRevisionInput {
  readonly projectId: string
  readonly conceptId: string
  readonly expectedRevision: number
  readonly conceptName: string
  readonly designIntent: string
  readonly silhouette: string
  readonly proportionAndLength: string
  readonly materialDirection: string
  readonly colorDirection: string
  readonly constructionAndDetails: readonly string[]
  readonly functionalValue: readonly string[]
  readonly targetUseScenarios: readonly string[]
  readonly originalTransformationNotes: readonly string[]
  readonly productionUnknowns: readonly string[]
}

/** Localizable category of a rejected design write. */
export type DesignWriteFailure = 'conflict' | 'not-found' | 'precondition' | 'read-only' | 'failed'

/** Outcome of one design write; failures carry only a category, never the Host code. */
export type DesignWriteResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly failure: DesignWriteFailure }

const PRECONDITION_CODES: ReadonlySet<string> = new Set([
  'fashion-design/upstream-not-selected',
  'fashion-design/upstream-stale',
  'fashion-design/brief-not-confirmed',
  'fashion-design/invalid-transition',
  'fashion-design/invalid-input',
  'fashion-design/concept-count-invalid',
  'fashion-design/differentiation-failed',
  'fashion-design/human-required',
  'fashion-design/cross-project-reference',
])

/**
 * Classify a rejected design command by its Host `rpcError.code`.
 * @param error - Rejection from the Fashion Design client service.
 * @returns The failure category; transport and unknown failures are `failed`.
 */
export function designWriteFailure(error: unknown): DesignWriteFailure {
  if (!(error instanceof Error) || !('rpcError' in error)) return 'failed'
  const rpcError: unknown = error.rpcError
  if (typeof rpcError !== 'object' || rpcError === null || !('code' in rpcError)) return 'failed'
  const code = rpcError.code
  if (typeof code !== 'string') return 'failed'
  if (code === 'fashion-design/revision-conflict') return 'conflict'
  if (code === 'fashion-design/project-read-only') return 'read-only'
  if (code.startsWith('fashion-design/') && code.endsWith('-not-found')) return 'not-found'
  if (PRECONDITION_CODES.has(code)) return 'precondition'
  return 'failed'
}

/**
 * Run one design write and fold its rejection into a failure category.
 * @param run - The Host command call.
 * @returns The command value or its failure category.
 */
export async function runDesignWrite<T>(run: () => Promise<T>): Promise<DesignWriteResult<T>> {
  try {
    return { ok: true, value: await run() }
  } catch (error: unknown) {
    return { ok: false, failure: designWriteFailure(error) }
  }
}

/**
 * Locale key for a design write failure.
 * @param failure - Failure category.
 * @returns The message key shown to the user.
 */
export function designWriteFailureKey(failure: DesignWriteFailure): FashionKey {
  switch (failure) {
    case 'conflict': return 'design.error.conflict'
    case 'not-found': return 'design.error.notFound'
    case 'precondition': return 'design.error.precondition'
    case 'read-only': return 'design.error.readOnly'
    case 'failed': return 'design.error.failed'
  }
}
