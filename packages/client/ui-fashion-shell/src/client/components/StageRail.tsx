/** Capability / R0 pipeline rail (F1-03 §7.2 / §10.4). */
import type { FashionKey } from '../locales.ts'
import type { PipelineStateKey } from '../presentation/project-presentation.ts'
import css from './StageRail.module.css'

export type StageRailItem = {
  readonly id: string
  readonly label: string
  readonly stateKey: PipelineStateKey
  /** When set and state is not coming-soon, the stage is navigable. */
  readonly onClick?: () => void
}

export type StageRailProps = {
  readonly items: readonly StageRailItem[]
  readonly t: (key: FashionKey) => string
  readonly 'aria-label'?: string | undefined
}

/**
 * Render a wrap-friendly stage rail.
 *
 * A stage is a button only when its owner supplied navigation and the stage is
 * not coming-soon. Every other stage is a read-only status display: it carries
 * `data-fashion-stage-interactive="false"`, takes no pointer events, and uses
 * the read-only style, so it does not present itself as a control.
 * @param props - localized items and translator for state labels.
 */
export function StageRail({ items, t, 'aria-label': ariaLabel }: StageRailProps) {
  return (
    <ul className={css.rail} data-fashion-stage-rail aria-label={ariaLabel}>
      {items.map((item) => {
        const interactive = item.onClick !== undefined && item.stateKey !== 'pipeline.comingSoon'
        const body = (
          <>
            <span className={css.label}>{item.label}</span>
            <span className={css.state}>{t(item.stateKey)}</span>
          </>
        )
        return (
          <li
            key={item.id}
            className={interactive ? css.itemInteractive : css.itemReadOnly}
            data-fashion-stage={item.id}
            data-fashion-stage-state={item.stateKey}
            data-fashion-stage-interactive={interactive ? 'true' : 'false'}
          >
            {interactive
              ? (
                <button type="button" className={css.stageButton} onClick={item.onClick}>
                  {body}
                </button>
              )
              : body}
          </li>
        )
      })}
    </ul>
  )
}
