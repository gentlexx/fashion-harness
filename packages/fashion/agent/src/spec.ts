/**
 * Fashion Agent binding domain declaration.
 * @module @gentlexx/dsh-fashion-agent/src/spec
 */

import { defineDomain, domainTable } from '@deepseek-ai/dsh-storage-domain'
import type { SessionId } from '@deepseek-ai/dsh-session'
import { fashionSessionBindingRecordV0 } from './schema/v0.ts'
import type { FashionSessionBindingRecordV0 } from './schema/v0.ts'

/** Current Storage Domain version for fashion_agent_bindings. */
export const FASHION_AGENT_BINDING_DOMAIN_VERSION = 0

/**
 * Domain `fashion_agent_bindings@0`: one row per SessionId.
 * Name uses underscore because Storage Domain unit names match `/^[a-z][a-z0-9_]*$/`.
 */
export const fashionAgentBindingDomainSpec = defineDomain({
  name: 'fashion_agent_bindings',
  version: FASHION_AGENT_BINDING_DOMAIN_VERSION,
  tables: {
    bindings: domainTable<SessionId, FashionSessionBindingRecordV0>(fashionSessionBindingRecordV0),
  },
})

export type { FashionSessionBindingRecordV0 }
