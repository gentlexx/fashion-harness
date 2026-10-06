/** Fashion Projects list page: filter, sections, create, cards (F1-03 §6). */
import { useLayoutEffect, useState } from 'react'
import { Button, Input } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ProjectView } from '@gentlexx/dsh-fashion-project/types'
import type { ProjectListState } from '@gentlexx/dsh-api-fashion-project-controller/client'
import type { FashionKey } from '../locales.ts'
import {
  filterProjects,
  isFilterActive,
  type OriginFilter,
} from '../presentation/filter-projects.ts'
import { partitionByOrigin } from '../presentation/project-presentation.ts'
import { FashionPageHeader } from '../components/FashionPageHeader.tsx'
import { ProjectCard } from '../components/ProjectCard.tsx'
import { ProjectFilterBar } from '../components/ProjectFilterBar.tsx'
import { StatePanel } from '../components/StatePanel.tsx'
import css from '../FashionWorkspace.module.css'

export type ProjectsPageProps = {
  readonly list: ProjectListState
  readonly locale: string
  readonly openProject: (projectId: string) => void
  readonly openAgent: () => void
  readonly createProject: (title: string) => Promise<ProjectView>
  readonly onRetryLoad?: (() => void) | undefined
  readonly t: (key: FashionKey) => string
}

type CreatePhase = 'closed' | 'editing' | 'submitting'
type FocusTarget = 'open' | 'title' | null

/**
 * Render the Projects list with Client-only search/filter and inline create.
 * @param props - list snapshot, locale, navigation/create inject, translator.
 */
export function ProjectsPage({
  list,
  locale,
  openProject,
  openAgent,
  createProject,
  onRetryLoad,
  t,
}: ProjectsPageProps) {
  const [query, setQuery] = useState('')
  const [originFilter, setOriginFilter] = useState<OriginFilter>('all')
  const [createPhase, setCreatePhase] = useState<CreatePhase>('closed')
  const [draft, setDraft] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [focusTarget, setFocusTarget] = useState<FocusTarget>(null)

  useLayoutEffect(() => {
    if (focusTarget === null) return
    const selector = focusTarget === 'open'
      ? '[data-fashion-create="open"]'
      : '[data-fashion-create="title"]'
    document.querySelector<HTMLElement>(selector)?.focus()
    setFocusTarget(null)
  }, [focusTarget])

  const filtered = filterProjects(list.items, query, originFilter, locale)
  const parts = partitionByOrigin(filtered)
  const filterOn = isFilterActive(query, originFilter)
  const showLoading = list.status === 'loading' && list.items.length === 0
  const showFatalError = list.status === 'error' && list.items.length === 0
  const showStaleError = list.status === 'error' && list.items.length > 0
  const showEmpty = list.status === 'ready' && list.items.length === 0
  const showFilterEmpty = !showLoading && !showFatalError && !showEmpty
    && filterOn
    && filtered.length === 0

  const startCreate = (): void => {
    setCreatePhase('editing')
    setLocalError(null)
  }

  const cancelCreate = (): void => {
    setCreatePhase('closed')
    setLocalError(null)
    setFocusTarget('open')
  }

  const submitCreate = async (): Promise<void> => {
    if (createPhase === 'submitting') return
    const trimmed = draft.trim()
    if (trimmed.length < 1) {
      setLocalError(t('projects.createEmpty'))
      setFocusTarget('title')
      return
    }
    if (trimmed.length > 120) {
      setLocalError(t('projects.createTooLong'))
      setFocusTarget('title')
      return
    }
    setCreatePhase('submitting')
    setLocalError(null)
    try {
      const project = await createProject(draft)
      setCreatePhase('closed')
      setDraft('')
      openProject(String(project.id))
    } catch (error) {
      const message = error instanceof Error ? error.message : t('projects.createFailed')
      setLocalError(message)
      setCreatePhase('editing')
      setFocusTarget('title')
    }
  }

  const clearFilters = (): void => {
    setQuery('')
    setOriginFilter('all')
  }

  return (
    <div className={css.page} data-fashion-page="projects">
      <FashionPageHeader
        eyebrow={t('projects.eyebrow')}
        title={t('projects.heading')}
        description={t('projects.value')}
        actions={(
          createPhase === 'closed' ? (
            <Button
              type="button"
              variant="primary"
              onClick={startCreate}
              data-fashion-create="open"
            >
              {t('projects.new')}
            </Button>
          ) : null
        )}
      />

      <ProjectFilterBar
        query={query}
        originFilter={originFilter}
        onQueryChange={setQuery}
        onOriginFilterChange={setOriginFilter}
        t={t}
      />

      {showLoading ? (
        <p className={css.meta} data-fashion-list="loading">{t('projects.loading')}</p>
      ) : null}

      {showFatalError ? (
        <StatePanel
          tone="error"
          title={t('projects.loadError')}
          data-fashion-state="list-error"
          actions={(
            <>
              {onRetryLoad !== undefined ? (
                <Button type="button" variant="primary" onClick={onRetryLoad} data-fashion-list="retry">
                  {t('projects.retry')}
                </Button>
              ) : null}
              <Button type="button" variant="outline" onClick={openAgent}>
                {t('nav.agent')}
              </Button>
            </>
          )}
        />
      ) : null}

      {showStaleError ? (
        <StatePanel
          tone="error"
          title={t('projects.loadError')}
          data-fashion-state="list-stale-error"
          actions={(
            onRetryLoad !== undefined ? (
              <Button type="button" variant="primary" onClick={onRetryLoad} data-fashion-list="retry">
                {t('projects.retry')}
              </Button>
            ) : null
          )}
        />
      ) : null}

      {showEmpty ? (
        <StatePanel
          title={t('projects.empty')}
          data-fashion-state="list-empty"
          actions={(
            <Button type="button" variant="primary" onClick={startCreate} data-fashion-create="open-empty">
              {t('projects.new')}
            </Button>
          )}
        />
      ) : null}

      {showFilterEmpty ? (
        <StatePanel
          title={t('filter.empty')}
          data-fashion-state="filter-empty"
          actions={(
            <Button type="button" variant="outline" onClick={clearFilters} data-fashion-filter="clear">
              {t('filter.clear')}
            </Button>
          )}
        />
      ) : null}

      {!showLoading && !showFatalError && !showEmpty && !showFilterEmpty ? (
        <div className={css.sections} data-fashion-list="items">
          {(originFilter === 'all' || originFilter === 'user')
            && (parts.user.length > 0 || !filterOn) ? (
              <section className={css.section} aria-labelledby="fashion-section-recent">
                <h2 className={css.sectionTitle} id="fashion-section-recent">{t('section.recent')}</h2>
                {parts.user.length === 0 ? (
                  <StatePanel
                    title={t('section.recentEmpty')}
                    data-fashion-state="recent-empty"
                    actions={(
                      <Button type="button" variant="primary" onClick={startCreate}>
                        {t('projects.new')}
                      </Button>
                    )}
                  />
                ) : (
                  <div className={css.cardGrid}>
                    {parts.user.map(item => (
                      <ProjectCard
                        key={String(item.id)}
                        project={item}
                        locale={locale}
                        onOpen={openProject}
                        t={t}
                      />
                    ))}
                  </div>
                )}
              </section>
            ) : null}

          {(originFilter === 'all' || originFilter === 'public-rebuild')
            && parts.publicRebuild.length > 0 ? (
              <section className={css.section} aria-labelledby="fashion-section-public">
                <h2 className={css.sectionTitle} id="fashion-section-public">{t('section.public')}</h2>
                <div className={css.cardGrid}>
                  {parts.publicRebuild.map(item => (
                    <ProjectCard
                      key={String(item.id)}
                      project={item}
                      locale={locale}
                      onOpen={openProject}
                      t={t}
                    />
                  ))}
                </div>
              </section>
            ) : null}
        </div>
      ) : null}

      {createPhase !== 'closed' ? (
        <form
          className={css.createForm}
          data-fashion-create="form"
          onSubmit={(event) => {
            event.preventDefault()
            void submitCreate()
          }}
        >
          <label className={css.createLabel}>
            {t('projects.createLabel')}
            <Input
              value={draft}
              maxLength={120}
              disabled={createPhase === 'submitting'}
              autoFocus
              onChange={(event) => { setDraft(event.target.value) }}
              data-fashion-create="title"
            />
          </label>
          {localError !== null ? (
            <p className={css.meta} role="alert" data-fashion-create="error">{localError}</p>
          ) : null}
          <div className={css.actions}>
            <Button
              type="submit"
              variant="primary"
              disabled={createPhase === 'submitting'}
              data-fashion-create="submit"
            >
              {createPhase === 'submitting' ? t('projects.creating') : t('projects.createSubmit')}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={createPhase === 'submitting'}
              onClick={cancelCreate}
              data-fashion-create="cancel"
            >
              {t('projects.createCancel')}
            </Button>
          </div>
        </form>
      ) : null}

      <div className={css.footerActions}>
        <Button type="button" variant="ghost" onClick={openAgent}>{t('nav.agent')}</Button>
      </div>
    </div>
  )
}
