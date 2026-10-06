/** Localized `<time>` for Fashion cards and Overview (F1-03 §4.1). */
import {
  formatFashionDate,
  formatFashionDateTime,
} from '../presentation/format-date.ts'

export type LocalizedTimeProps = {
  /** Durable ISO instant from Host. */
  readonly iso: string
  /** LocaleSnapshot.active BCP 47 tag. */
  readonly locale: string
  /** When true, date-only; otherwise medium date + short time. */
  readonly dateOnly?: boolean
  readonly className?: string | undefined
}

/**
 * Render a localized time label with machine-readable `dateTime`.
 * @param props - ISO source, locale, and optional date-only mode.
 */
export function LocalizedTime({
  iso,
  locale,
  dateOnly = false,
  className,
}: LocalizedTimeProps) {
  const label = dateOnly
    ? formatFashionDate(iso, locale)
    : formatFashionDateTime(iso, locale)
  if (label.length === 0) return null
  return (
    <time className={className} dateTime={iso}>
      {label}
    </time>
  )
}
