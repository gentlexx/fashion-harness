/** Client-side title search + origin filter chips (F1-03 §6.2). */
import { Input, Pill } from '@deepseek-ai/dsh-client-ui-primitives'
import type { FashionKey } from '../locales.ts'
import type { OriginFilter } from '../presentation/filter-projects.ts'
import css from './ProjectFilterBar.module.css'

export type ProjectFilterBarProps = {
  readonly query: string
  readonly originFilter: OriginFilter
  readonly onQueryChange: (query: string) => void
  readonly onOriginFilterChange: (filter: OriginFilter) => void
  readonly t: (key: FashionKey) => string
}

const ORIGIN_OPTIONS: readonly { readonly value: OriginFilter; readonly labelKey: FashionKey }[] = [
  { value: 'all', labelKey: 'filter.all' },
  { value: 'user', labelKey: 'filter.mine' },
  { value: 'public-rebuild', labelKey: 'filter.public' },
]

/**
 * Render search input and origin filter pills over the Client list snapshot.
 * @param props - controlled query/filter state and fashion translator.
 */
export function ProjectFilterBar({
  query,
  originFilter,
  onQueryChange,
  onOriginFilterChange,
  t,
}: ProjectFilterBarProps) {
  return (
    <div className={css.bar} data-fashion-filter>
      <Input
        className={css.search ?? ''}
        value={query}
        onChange={(event) => { onQueryChange(event.target.value) }}
        placeholder={t('projects.searchPlaceholder')}
        aria-label={t('projects.searchAria')}
        data-fashion-filter="search"
      />
      <div className={css.pills} role="radiogroup" aria-label={t('projects.filterAria')}>
        {ORIGIN_OPTIONS.map(option => (
          <Pill
            key={option.value}
            active={originFilter === option.value}
            aria-checked={originFilter === option.value}
            role="radio"
            data-fashion-filter-origin={option.value}
            onClick={() => { onOriginFilterChange(option.value) }}
          >
            {t(option.labelKey)}
          </Pill>
        ))}
      </div>
    </div>
  )
}
