/**
 * Locale-aware ISO timestamp formatting for Fashion UI (F1-03 §4.1).
 * Display strings never embed raw ISO; callers keep ISO on `dateTime`.
 * @module @gentlexx/dsh-client-ui-fashion-shell/src/client/presentation/format-date
 */

/**
 * Format an ISO-8601 instant for card/overview display.
 * @param iso - Durable UTC ISO string from Host.
 * @param locale - BCP 47 tag from LocaleSnapshot.active (e.g. `zh`, `en`).
 * @returns localized medium date + short time, or empty string when unparseable.
 */
export function formatFashionDateTime(iso: string, locale: string): string {
  const ms = Date.parse(iso)
  if (Number.isNaN(ms)) return ''
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(ms)
}

/**
 * Format an ISO-8601 instant as a date-only label (Overview secondary line).
 * @param iso - Durable UTC ISO string from Host.
 * @param locale - BCP 47 tag from LocaleSnapshot.active.
 * @returns localized medium date, or empty string when unparseable.
 */
export function formatFashionDate(iso: string, locale: string): string {
  const ms = Date.parse(iso)
  if (Number.isNaN(ms)) return ''
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
  }).format(ms)
}
