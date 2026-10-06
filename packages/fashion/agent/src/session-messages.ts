/**
 * Detect whether a Session already has human or assistant messages.
 * Plugin-injected context messages do not count as user work.
 * @module @gentlexx/dsh-fashion-agent/src/session-messages
 */

import type { Session } from '@deepseek-ai/dsh-session'

/**
 * Whether the session already contains user-authored or assistant messages.
 * @param session - Host session log.
 */
export function sessionHasUserMessages(session: Session): boolean {
  for (const event of session.snapshotEvents()) {
    if (event.type === 'assistant/message') return true
    if (event.type !== 'user/message') continue
    if (event.data.source.kind === 'user') return true
  }
  return false
}
