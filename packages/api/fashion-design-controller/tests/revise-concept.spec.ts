/**
 * Concept revision Remote command: request forwarding and Host error projection.
 */

import { describe, expect, it, vi } from 'vitest'
import type { Context } from '@deepseek-ai/cordis'
import { FashionDesignRevisionConflictError } from '@gentlexx/dsh-fashion-design'
import { FashionDesignCommands } from '../src/commands.ts'
import type { ReviseConceptRequest } from '../src/types.ts'

const REQUEST = {
  projectId: 'project-1',
  conceptId: 'concept-b',
  expectedRevision: 2,
  conceptName: 'B',
  designIntent: 'Commute',
  silhouette: 'Boxy',
  proportionAndLength: 'Cropped',
  materialDirection: 'Canvas',
  colorDirection: 'Oat',
  constructionAndDetails: ['Flap pockets'],
  functionalValue: ['Structured layer'],
  targetUseScenarios: ['Editorial daywear'],
  originalTransformationNotes: ['Reworked collar'],
  productionUnknowns: ['Fabric supply'],
} as unknown as ReviseConceptRequest

function commands(reviseConcept: (input: unknown) => Promise<unknown>): FashionDesignCommands {
  return new FashionDesignCommands({ fashionDesignRegistry: { reviseConcept } } as unknown as Context)
}

describe('FashionDesignCommands.reviseConcept', () => {
  it('forwards the exact Concept revision and every revised field to the Host registry', async () => {
    const revised = { id: 'concept-b', revision: 3 }
    const reviseConcept = vi.fn(async () => revised)
    await expect(commands(reviseConcept).reviseConcept(REQUEST)).resolves.toBe(revised)
    expect(reviseConcept).toHaveBeenCalledWith({
      projectId: 'project-1',
      conceptId: 'concept-b',
      expectedRevision: 2,
      conceptName: 'B',
      designIntent: 'Commute',
      silhouette: 'Boxy',
      proportionAndLength: 'Cropped',
      materialDirection: 'Canvas',
      colorDirection: 'Oat',
      constructionAndDetails: ['Flap pockets'],
      functionalValue: ['Structured layer'],
      targetUseScenarios: ['Editorial daywear'],
      originalTransformationNotes: ['Reworked collar'],
      productionUnknowns: ['Fabric supply'],
    })
  })

  it('projects a stale Concept revision as the revision-conflict Remote code', async () => {
    const reviseConcept = vi.fn(async () => { throw new FashionDesignRevisionConflictError(2, 3) })
    await expect(commands(reviseConcept).reviseConcept(REQUEST)).rejects.toMatchObject({
      code: 'fashion-design/revision-conflict',
    })
  })
})
