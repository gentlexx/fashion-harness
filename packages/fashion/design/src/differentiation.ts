/**
 * Deterministic pairwise differentiation precheck for ConceptSet readiness.
 * Color alone never satisfies the structural pair requirement.
 * @module @gentlexx/dsh-fashion-design/src/differentiation
 */

import type {
  DesignConcept,
  DifferentiationCheck,
  DifferentiationDimension,
  PairwiseDifference,
} from './types.ts'

/** Rule version stamped on ConceptSet differentiationCheck. */
export const DIFFERENTIATION_RULE_VERSION = 'v0-structural-2of6'

/** Structural dimensions that count toward the pairwise minimum. */
export const STRUCTURAL_DIMENSIONS: readonly DifferentiationDimension[] = [
  'silhouette',
  'proportion_and_length',
  'material_direction',
  'construction_and_details',
  'functional_value',
  'target_use_scenarios',
]

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function listNormalize(values: readonly string[]): string {
  return values.map(normalize).filter(Boolean).sort().join('|')
}

function dimensionValue(concept: DesignConcept, dimension: DifferentiationDimension): string {
  switch (dimension) {
    case 'silhouette':
      return normalize(concept.silhouette)
    case 'proportion_and_length':
      return normalize(concept.proportionAndLength)
    case 'material_direction':
      return normalize(concept.materialDirection)
    case 'construction_and_details':
      return listNormalize(concept.constructionAndDetails)
    case 'functional_value':
      return listNormalize(concept.functionalValue)
    case 'target_use_scenarios':
      return listNormalize(concept.targetUseScenarios)
    case 'color_direction':
      return normalize(concept.colorDirection)
    default: {
      const _exhaustive: never = dimension
      return _exhaustive
    }
  }
}

/**
 * Evaluate pairwise structural differentiation for exactly three concepts.
 * @param concepts - Three DesignConcept projections in set order.
 * @param now - ISO timestamp for checkedAt / evaluatedAt.
 * @returns DifferentiationCheck with pairwise rows and failure reasons.
 */
export function evaluateDifferentiation(
  concepts: readonly DesignConcept[],
  now: string,
): DifferentiationCheck {
  const failureReasons: string[] = []
  const pairwise: PairwiseDifference[] = []

  const conceptA = concepts[0]
  const conceptB = concepts[1]
  const conceptC = concepts[2]
  if (concepts.length !== 3 || conceptA === undefined || conceptB === undefined || conceptC === undefined) {
    return {
      ruleVersion: DIFFERENTIATION_RULE_VERSION,
      passed: false,
      pairwise: [],
      failureReasons: [`concept-count-${concepts.length}`],
      evaluatedAt: now,
    }
  }

  const pairs: Array<readonly [DesignConcept, DesignConcept]> = [
    [conceptA, conceptB],
    [conceptA, conceptC],
    [conceptB, conceptC],
  ]

  for (const [a, b] of pairs) {
    const structuralHits: DifferentiationDimension[] = []
    for (const dimension of STRUCTURAL_DIMENSIONS) {
      const aVal = dimensionValue(a, dimension)
      const bVal = dimensionValue(b, dimension)
      if (aVal.length === 0 || bVal.length === 0) continue
      if (aVal === bVal) continue
      structuralHits.push(dimension)
      pairwise.push({
        conceptAId: a.id,
        conceptBId: b.id,
        dimension,
        conceptAValueRef: aVal,
        conceptBValueRef: bVal,
        differenceNote: `precheck:${dimension}`,
        checkedBy: 'system-precheck',
        checkedAt: now,
      })
    }

    const colorA = dimensionValue(a, 'color_direction')
    const colorB = dimensionValue(b, 'color_direction')
    if (colorA.length > 0 && colorB.length > 0 && colorA !== colorB) {
      pairwise.push({
        conceptAId: a.id,
        conceptBId: b.id,
        dimension: 'color_direction',
        conceptAValueRef: colorA,
        conceptBValueRef: colorB,
        differenceNote: 'precheck:color_direction-supplemental',
        checkedBy: 'system-precheck',
        checkedAt: now,
      })
    }

    if (structuralHits.length < 2) {
      failureReasons.push(
        `pair-${String(a.id)}-${String(b.id)}:structural-hits-${structuralHits.length}`,
      )
      if (
        structuralHits.length === 0
        && colorA.length > 0
        && colorB.length > 0
        && colorA !== colorB
      ) {
        failureReasons.push(`pair-${String(a.id)}-${String(b.id)}:color-only`)
      }
    }
  }

  return {
    ruleVersion: DIFFERENTIATION_RULE_VERSION,
    passed: failureReasons.length === 0,
    pairwise,
    failureReasons,
    evaluatedAt: now,
  }
}
