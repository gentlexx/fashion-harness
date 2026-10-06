/** Shared page header for Fashion Projects / Overview (F1-03 §6.1 / §7.1). */
import type { ReactNode } from 'react'
import css from './FashionPageHeader.module.css'

export type FashionPageHeaderProps = {
  readonly eyebrow?: string | undefined
  readonly title: string
  readonly titleId?: string | undefined
  /** When set (e.g. `-1`), allows programmatic focus after navigation. */
  readonly titleTabIndex?: number | undefined
  readonly description?: string | undefined
  readonly actions?: ReactNode
  readonly meta?: ReactNode
}

/**
 * Render a Fashion page title row with optional eyebrow, actions, and meta.
 * @param props - localized copy and optional action/meta slots.
 */
export function FashionPageHeader({
  eyebrow,
  title,
  titleId,
  titleTabIndex,
  description,
  actions,
  meta,
}: FashionPageHeaderProps) {
  return (
    <header className={css.header}>
      <div className={css.lead}>
        {eyebrow !== undefined && eyebrow.length > 0 ? (
          <p className={css.eyebrow}>{eyebrow}</p>
        ) : null}
        <h1 className={css.title} id={titleId} tabIndex={titleTabIndex}>{title}</h1>
        {description !== undefined && description.length > 0 ? (
          <p className={css.description}>{description}</p>
        ) : null}
        {meta !== undefined ? <div className={css.meta}>{meta}</div> : null}
      </div>
      {actions !== undefined ? <div className={css.actions}>{actions}</div> : null}
    </header>
  )
}
