/** @vitest-environment jsdom */
/**
 * Feedback and outcome forms opened from a deliverable select a real Host
 * record and submit that record's exact revisions; the public case exposes no
 * write entry.
 */
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, waitFor, within } from '@testing-library/react'
import type { ProjectView } from '@gentlexx/dsh-fashion-project/types'
import type { DesignDeliverable } from '@gentlexx/dsh-fashion-design/types'
import { FeedbackPages, type FeedbackPagesProps } from '../src/client/feedback/FeedbackPages.tsx'
import type { DeliverableFollowUpRef } from '../src/client/routes.ts'
import { R0_PROJECT_ID } from '../src/client/routes.ts'
import { zh, type FashionKey } from '../src/client/locales.ts'

const t = (key: FashionKey): string => zh[key]

function project(overrides: Partial<ProjectView> = {}): ProjectView {
  return {
    id: 'u1' as never,
    title: '用户项目',
    origin: 'user',
    accessMode: 'editable',
    createdAt: '2026-09-24T00:00:00.000Z',
    updatedAt: '2026-09-24T00:00:00.000Z',
    revision: 0,
    ...overrides,
  } as ProjectView
}

function deliverable(id: string, revision: number, conceptId: string, conceptRevision: number): DesignDeliverable {
  return {
    id: id as never,
    projectId: 'u1' as never,
    revision,
    audienceProfile: 'internal_review',
    status: 'ready',
    selectedConceptRef: { id: conceptId, revision: conceptRevision },
    limitations: [],
  } as unknown as DesignDeliverable
}

const FIRST = deliverable('d1', 1, 'c1', 0)
const SECOND = deliverable('d2', 7, 'c9', 3)
const REF: DeliverableFollowUpRef = { deliverableId: 'd2', deliverableRevision: 7, conceptId: 'c9', conceptRevision: 3 }

function renderPages(overrides: Partial<FeedbackPagesProps> = {}) {
  const props: FeedbackPagesProps = {
    projectId: 'u1',
    mode: 'new',
    getProject: async () => project(),
    listDeliverables: async () => [FIRST, SECOND],
    listFeedback: async () => [],
    listAvailability: async () => [],
    listDevelopment: async () => [],
    listMetrics: async () => [],
    recordFeedback: vi.fn(async () => ({
      id: 'f1',
      subjectRef: { subjectType: 'deliverable', subjectId: 'd2', subjectRevision: 7 },
      action: 'adopted',
      timeSavedEstimate: null,
      supersedesId: null,
      dataReality: 'user_test',
    }) as never),
    recordAvailability: vi.fn(async () => ({ id: 'a1', availability: 'not_yet_observed', dataReality: 'user_test' }) as never),
    recordDevelopment: vi.fn(),
    recordMetric: vi.fn(),
    openFeedbackNew: vi.fn(),
    openFeedbackDetail: vi.fn(),
    openOverview: vi.fn(),
    t,
    ...overrides,
  }
  return { props, view: render(<FeedbackPages {...props} />) }
}

describe('feedback opened from a deliverable', () => {
  it('preselects the routed deliverable and submits its exact revision', async () => {
    const { props, view } = renderPages({ followUpRef: REF })
    const page = within(view.container)
    await waitFor(() => {
      expect((view.container.querySelector('[data-fashion-feedback-target]') as HTMLSelectElement).value).toBe('d2')
    })
    const revisions = view.container.querySelector('[data-fashion-follow-up-revision]')!
    const separator = zh['common.labelSeparator']
    expect(revisions.textContent).toBe(`${zh['deliverable.revision']}${separator}7 · ${zh['feedback.conceptRevision']}${separator}3`)
    expect(view.container.querySelector('[data-fashion-follow-up-notice]')).toBeNull()

    const action = page.getByLabelText(zh['feedback.action']) as HTMLSelectElement
    expect(action.value).toBe('')
    expect(action.options[0]?.textContent).toBe(zh['feedback.chooseAction'])
    fireEvent.change(page.getByLabelText(zh['feedback.reasonText']), { target: { value: '版型可直接交接' } })
    fireEvent.click(page.getByRole('button', { name: zh['feedback.submit'] }))
    expect(await page.findByText(zh['feedback.validation'])).toBeTruthy()
    expect(props.recordFeedback).not.toHaveBeenCalled()

    fireEvent.change(action, { target: { value: 'modified' } })
    fireEvent.click(page.getByRole('button', { name: zh['feedback.submit'] }))
    await waitFor(() => {
      expect(props.recordFeedback).toHaveBeenCalledWith(expect.objectContaining({
        projectId: 'u1',
        subjectType: 'deliverable',
        subjectId: 'd2',
        subjectRevision: 7,
        action: 'modified',
        reasonText: '版型可直接交接',
      }))
    })
  })

  it('submits the current record revision and says so when the routed revision is stale', async () => {
    const { props, view } = renderPages({ followUpRef: { ...REF, deliverableRevision: 6 } })
    const page = within(view.container)
    expect(await page.findByText(zh['feedback.followUpStale'])).toBeTruthy()
    fireEvent.change(page.getByLabelText(zh['feedback.action']), { target: { value: 'adopted' } })
    fireEvent.change(page.getByLabelText(zh['feedback.reasonText']), { target: { value: '理由' } })
    fireEvent.click(page.getByRole('button', { name: zh['feedback.submit'] }))
    await waitFor(() => {
      expect(props.recordFeedback).toHaveBeenCalledWith(expect.objectContaining({ subjectId: 'd2', subjectRevision: 7 }))
    })
  })

  it('reports a missing routed deliverable instead of submitting a guessed target', async () => {
    const { view } = renderPages({ followUpRef: { ...REF, deliverableId: 'gone' } })
    expect(await within(view.container).findByText(zh['feedback.followUpMissing'])).toBeTruthy()
  })

  it('shows localized option labels instead of stored enum values', async () => {
    const { view } = renderPages({ followUpRef: REF })
    await waitFor(() => {
      expect(view.container.querySelector('[data-fashion-feedback-form]')).toBeTruthy()
    })
    const form = view.container.querySelector('[data-fashion-feedback-form]')!
    const optionText = [...form.querySelectorAll('option')].map(option => option.textContent ?? '')
    expect(optionText).toContain(zh['feedback.enum.action.needsFollowUp'])
    expect(optionText).toContain(zh['feedback.enum.time.under15m'])
    expect(optionText.some(text => /^[a-z0-9]+(_[a-z0-9]+)+$/.test(text))).toBe(false)
    expect(form.textContent).not.toContain('d2')
  })
})

describe('outcomes opened from a deliverable', () => {
  it('writes availability against the selected record deliverable and concept revisions', async () => {
    const { props, view } = renderPages({ mode: 'outcomes', followUpRef: REF })
    const page = within(view.container)
    await waitFor(() => {
      expect((view.container.querySelector('[data-fashion-outcome-target]') as HTMLSelectElement).value).toBe('d2')
    })
    const form = view.container.querySelector('[data-fashion-availability-form]') as HTMLFormElement
    fireEvent.change(within(form).getByLabelText(zh['outcomes.reason']), { target: { value: 'not_launched' } })
    fireEvent.change(within(form).getByLabelText(zh['outcomes.asOf']), { target: { value: '2026-09-30' } })
    fireEvent.submit(form)
    await waitFor(() => {
      expect(props.recordAvailability).toHaveBeenCalledWith(expect.objectContaining({
        deliverableId: 'd2',
        deliverableRevision: 7,
        conceptId: 'c9',
        conceptRevision: 3,
      }))
    })
    await waitFor(() => {
      expect(view.container.querySelector('[data-fashion-availability="not_yet_observed"]')?.textContent)
        .toBe(zh['outcomes.enum.availability.notYetObserved'] + ' · ' + zh['outcomes.notAvailable'])
    })
    expect(page.queryByText('not_yet_observed')).toBeNull()
  })
})

describe('single submit per draft', () => {
  it('writes one feedback record for a repeated submit and disables the button while writing', async () => {
    let settle: (value: unknown) => void = () => {}
    const recordFeedback = vi.fn(() => new Promise((resolve) => { settle = resolve }) as never)
    const { view } = renderPages({ followUpRef: REF, recordFeedback })
    const page = within(view.container)
    await waitFor(() => {
      expect((view.container.querySelector('[data-fashion-feedback-target]') as HTMLSelectElement).value).toBe('d2')
    })
    fireEvent.change(page.getByLabelText(zh['feedback.action']), { target: { value: 'modified' } })
    fireEvent.change(page.getByLabelText(zh['feedback.reasonText']), { target: { value: '一次提交' } })
    const submit = page.getByRole('button', { name: zh['feedback.submit'] }) as HTMLButtonElement
    const form = view.container.querySelector('[data-fashion-feedback-form]') as HTMLFormElement
    fireEvent.submit(form)
    fireEvent.submit(form)
    fireEvent.click(submit)
    expect(recordFeedback).toHaveBeenCalledTimes(1)
    await waitFor(() => { expect(submit.disabled).toBe(true) })
    const key = (recordFeedback.mock.calls[0] as unknown as [{ idempotencyKey: string }])[0].idempotencyKey
    expect(typeof key).toBe('string')
    expect(key.length).toBeGreaterThan(0)
    settle({
      id: 'f1',
      subjectRef: { subjectType: 'deliverable', subjectId: 'd2', subjectRevision: 7 },
      action: 'modified',
      timeSavedEstimate: null,
      supersedesId: null,
      dataReality: 'user_test',
    })
    expect(await page.findByText(zh['feedback.success'])).toBeTruthy()
    expect(recordFeedback).toHaveBeenCalledTimes(1)
  })

  it('writes one availability record per submit and keeps each outcome form independently labelled', async () => {
    let settle: (value: unknown) => void = () => {}
    const recordAvailability = vi.fn(() => new Promise((resolve) => { settle = resolve }) as never)
    const { view } = renderPages({ mode: 'outcomes', followUpRef: REF, recordAvailability })
    const page = within(view.container)
    await waitFor(() => {
      expect((view.container.querySelector('[data-fashion-outcome-target]') as HTMLSelectElement).value).toBe('d2')
    })
    const availability = page.getByRole('form', { name: zh['outcomes.availabilityForm'] }) as HTMLFormElement
    expect(page.getByRole('form', { name: zh['outcomes.developmentForm'] })).toBeTruthy()
    expect(page.getByRole('form', { name: zh['outcomes.metricForm'] })).toBeTruthy()
    fireEvent.change(within(availability).getByLabelText(zh['outcomes.reason']), { target: { value: 'not_launched' } })
    fireEvent.change(within(availability).getByLabelText(zh['outcomes.asOf']), { target: { value: '2026-09-30' } })
    const submit = page.getByRole('button', { name: zh['outcomes.submitAvailability'] }) as HTMLButtonElement
    fireEvent.submit(availability)
    fireEvent.submit(availability)
    fireEvent.click(submit)
    expect(recordAvailability).toHaveBeenCalledTimes(1)
    await waitFor(() => { expect(submit.disabled).toBe(true) })
    expect((page.getByRole('button', { name: zh['outcomes.submitDevelopment'] }) as HTMLButtonElement).disabled).toBe(false)
    expect((page.getByRole('button', { name: zh['outcomes.submitMetric'] }) as HTMLButtonElement).disabled).toBe(false)
    settle({ id: 'a1', availability: 'not_yet_observed', dataReality: 'user_test' })
    await waitFor(() => {
      expect(view.container.querySelectorAll('[data-fashion-availability="not_yet_observed"]').length).toBe(1)
    })
    expect(within(page.getByRole('form', { name: zh['outcomes.availabilityForm'] })).getByText(zh['outcomes.success'])).toBeTruthy()
    expect(recordAvailability).toHaveBeenCalledTimes(1)
  })
})

describe('public case', () => {
  it('exposes no feedback or outcome write entry', async () => {
    for (const mode of ['new', 'outcomes'] as const) {
      const { view } = renderPages({
        projectId: R0_PROJECT_ID,
        mode,
        followUpRef: REF,
        getProject: async () => project({ id: R0_PROJECT_ID as never, origin: 'public-rebuild', accessMode: 'read-only' }),
      })
      await waitFor(() => {
        expect(view.container.querySelector('[data-fashion-feedback-r0]')).toBeTruthy()
      })
      expect(view.container.querySelector('form')).toBeNull()
      expect(view.container.querySelector('[data-fashion-feedback-target], [data-fashion-outcome-target]')).toBeNull()
      expect(within(view.container).queryByRole('button', { name: zh['overview.openFeedback'] })).toBeNull()
      view.unmount()
    }
  })

  it('shows no write form before the project read settles', async () => {
    for (const mode of ['new', 'outcomes'] as const) {
      const { props, view } = renderPages({
        projectId: R0_PROJECT_ID,
        mode,
        followUpRef: REF,
        getProject: () => new Promise<ProjectView | undefined>(() => {}),
      })
      expect(view.container.querySelector('form')).toBeNull()
      await waitFor(() => {
        expect(view.container.querySelector('[data-fashion-feedback-target], [data-fashion-outcome-target]')).toBeNull()
      })
      expect(view.container.querySelector('form')).toBeNull()
      expect(props.recordFeedback).not.toHaveBeenCalled()
      view.unmount()
    }
  })
})

describe('feedback correction', () => {
  it('starts from the recorded action and supersedes the corrected record', async () => {
    const recorded = {
      id: 'f1',
      subjectRef: { subjectType: 'deliverable', subjectId: 'd2', subjectRevision: 7 },
      action: 'modified',
      timeSavedEstimate: null,
      supersedesId: null,
      dataReality: 'user_test',
    } as never
    const { props, view } = renderPages({ mode: 'list', feedbackId: 'f1', listFeedback: async () => [recorded] })
    const page = within(view.container)
    fireEvent.click(await page.findByRole('button', { name: zh['feedback.correct'] }))
    const action = page.getByLabelText(zh['feedback.action']) as HTMLSelectElement
    expect(action.value).toBe('modified')
    fireEvent.change(page.getByLabelText(zh['feedback.reasonText']), { target: { value: '纠正动作' } })
    fireEvent.change(page.getByLabelText(zh['feedback.correctionReason']), { target: { value: '误选' } })
    fireEvent.click(page.getByRole('button', { name: zh['feedback.submit'] }))
    await waitFor(() => {
      expect(props.recordFeedback).toHaveBeenCalledWith(expect.objectContaining({
        subjectId: 'd2',
        subjectRevision: 7,
        action: 'modified',
        supersedesId: 'f1',
        expectedHeadId: 'f1',
        correctionReason: '误选',
      }))
    })
  })
})

describe('feedback list labels', () => {
  it('names the revision after each feedback subject type', async () => {
    const row = (id: string, subjectType: string, subjectRevision: number) => ({
      id,
      subjectRef: { subjectType, subjectId: `${id}-subject`, subjectRevision },
      action: 'adopted',
      timeSavedEstimate: null,
      supersedesId: null,
      dataReality: 'user_test',
    }) as never
    const { view } = renderPages({
      mode: 'list',
      listFeedback: async () => [row('f1', 'deliverable', 7), row('f2', 'concept', 3), row('f3', 'brief', 2)],
    })
    await waitFor(() => {
      expect(view.container.querySelectorAll('[data-fashion-feedback-action]').length).toBe(3)
    })
    const separator = zh['common.labelSeparator']
    const text = [...view.container.querySelectorAll('[data-fashion-feedback-action]')].map(item => item.textContent ?? '')
    expect(text[0]).toContain(`${zh['deliverable.revision']}${separator}7`)
    expect(text[1]).toContain(`${zh['feedback.revision.concept']}${separator}3`)
    expect(text[2]).toContain(`${zh['feedback.revision.brief']}${separator}2`)
    expect(text[1]).not.toContain(zh['deliverable.revision'])
    expect(text.join('')).not.toContain('-subject')
  })
})
