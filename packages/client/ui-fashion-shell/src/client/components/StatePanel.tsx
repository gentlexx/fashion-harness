/** Empty / error / filter-empty panel for Fashion list and Overview (F1-03 §10). */
import type { ReactNode } from 'react'
import css from './StatePanel.module.css'

export type StatePanelProps = {
  readonly tone?: 'neutral' | 'error' | undefined
  readonly title: string
  readonly body?: string | undefined
  readonly actions?: ReactNode
  readonly 'data-fashion-state'?: string | undefined
}

/**
 * Render a structured empty or error panel with optional actions.
 * @param props - localized title/body and optional action row.
 */
export function StatePanel({
  tone = 'neutral',
  title,
  body,
  actions,
  'data-fashion-state': dataState,
}: StatePanelProps) {
  return (
    <div
      className={tone === 'error' ? css.error : css.panel}
      role={tone === 'error' ? 'alert' : undefined}
      data-fashion-state={dataState}
    >
      <p className={css.title}>{title}</p>
      {body !== undefined && body.length > 0 ? <p className={css.body}>{body}</p> : null}
      {actions !== undefined ? <div className={css.actions}>{actions}</div> : null}
    </div>
  )
}
