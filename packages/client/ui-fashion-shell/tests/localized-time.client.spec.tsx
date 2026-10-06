// @vitest-environment jsdom
/** LocalizedTime renders dateTime ISO and localized visible text. */
import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { LocalizedTime } from '../src/client/components/LocalizedTime.tsx'

describe('LocalizedTime', () => {
  it('exposes ISO on dateTime and localized text in children', () => {
    const iso = '2026-09-21T00:00:00.000Z'
    const { container } = render(<LocalizedTime iso={iso} locale="en" />)
    const time = container.querySelector('time')
    expect(time).not.toBeNull()
    expect(time?.getAttribute('dateTime')).toBe(iso)
    expect(time?.textContent).not.toBe(iso)
    expect(time?.textContent?.length).toBeGreaterThan(0)
  })

  it('renders nothing for invalid ISO', () => {
    const { container } = render(<LocalizedTime iso="bad" locale="en" />)
    expect(container.querySelector('time')).toBeNull()
  })
})
