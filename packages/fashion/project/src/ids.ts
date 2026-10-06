/**
 * Brand factory for {@link ProjectId}.
 * @module @gentlexx/dsh-fashion-project/src/ids
 */

import { brandString } from '@deepseek-ai/dsh-brand'
import type { ProjectId } from './types.ts'

/**
 * Brand a string as a {@link ProjectId}.
 * @param id - Raw project id string.
 * @returns the same string, branded at compile time.
 */
export function ProjectId(id: string): ProjectId {
  return brandString<ProjectId>(id)
}
