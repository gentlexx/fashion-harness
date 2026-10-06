/**
 * Bound Fashion read-only query tool.
 * @module @gentlexx/dsh-fashion-agent/src/tools
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { JsonValue } from '@deepseek-ai/dsh-util-values'
import { FASHION_AGENT_SCOPE_IDS } from './types.ts'
import { FASHION_PROJECT_QUERY_DESCRIPTION } from './prompt.ts'
import { renderFashionProjectQueryResult } from './render.ts'

/** Registered Fashion Agent tool names. Write tools are intentionally absent. */
export const FASHION_AGENT_TOOL_NAMES = ['fashion_project_query'] as const

/**
 * Register the bound read-only query tool.
 * @param ctx - Host context with `tools` and `fashionAgentContext`.
 */
export function registerFashionAgentTools(ctx: Context): void {
  const tools = ctx.get('tools')
  if (tools === undefined) return
  tools.register(defineTool({
    name: 'fashion_project_query',
    description: FASHION_PROJECT_QUERY_DESCRIPTION,
    parameters: {
      section: {
        type: 'string',
        required: true,
        enum: [...FASHION_AGENT_SCOPE_IDS],
        description: 'Compact section of the session-bound Fashion project.',
      },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          ok: { type: 'boolean', required: true },
          section: { type: 'string', required: true },
          projectId: { type: 'string', required: true },
          snapshotVersion: { type: 'string', required: true },
          body: { type: 'json', required: true },
          error: { type: 'string', required: true },
        },
      },
      render: (_args, value) => [{
        type: 'text',
        text: renderFashionProjectQueryResult(value),
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args, exec) {
      const agent = exec.agent
      if (agent === undefined) {
        return {
          ok: false,
          section: args.section,
          projectId: 'unbound',
          snapshotVersion: 'none',
          body: null,
          error: 'fashion_project_query requires a calling Agent session',
        }
      }
      const result = await ctx.fashionAgentContext.queryBoundSection(agent.session.id, args.section)
      return {
        ...result,
        body: result.body as JsonValue,
      }
    },
  }))
}
