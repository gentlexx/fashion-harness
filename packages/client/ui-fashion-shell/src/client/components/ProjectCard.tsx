/** Project list card — Host fields + UI-derived capability/next-step only (F1-03 §6.4). */
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ProjectView } from '@gentlexx/dsh-fashion-project/types'
import type { FashionKey } from '../locales.ts'
import { R0_UTILITY_JACKET } from '../fixtures/r0-utility-jacket.ts'
import { R0_PROJECT_ID } from '../routes.ts'
import {
  capabilityLabelKey,
  isR0Project,
  nextStepLabelKey,
} from '../presentation/project-presentation.ts'
import { LocalizedTime } from './LocalizedTime.tsx'
import { ProjectSourceTags } from './ProjectSourceTags.tsx'
import css from './ProjectCard.module.css'

export type ProjectCardProps = {
  readonly project: ProjectView
  readonly locale: string
  readonly onOpen: (projectId: string) => void
  readonly t: (key: FashionKey) => string
}

/**
 * Render one project card from a Host list row.
 * @param props - Host projection, active locale, open handler, translator.
 */
export function ProjectCard({ project, locale, onOpen, t }: ProjectCardProps) {
  const r0 = isR0Project(project, R0_PROJECT_ID)
  const projectId = String(project.id)
  const cta = r0 ? t('projects.cta') : t('projects.open')

  return (
    <article
      className={css.card}
      data-fashion-project={projectId}
      data-fashion-origin={project.origin}
    >
      <ProjectSourceTags origin={project.origin} accessMode={project.accessMode} t={t} />
      <h3 className={css.title}>{project.title}</h3>
      {r0 ? (
        <>
          <p className={css.r0Meta}>
            {R0_UTILITY_JACKET.market} · {R0_UTILITY_JACKET.category}
          </p>
          <div className={css.cover} role="img" aria-label={t('r0.coverAlt')} />
          <p className={css.disclaimer}>{t('r0.cardDisclaimer')}</p>
        </>
      ) : null}
      <p className={css.updated}>
        <span>{t('projects.updated')} </span>
        <LocalizedTime iso={project.updatedAt} locale={locale} className={css.time} />
      </p>
      <p className={css.capability} data-fashion-capability>
        {t(capabilityLabelKey(project.origin))}
      </p>
      <p className={css.nextStep} data-fashion-next-step>
        {t(nextStepLabelKey(project.origin))}
      </p>
      <div className={css.actions}>
        <Button
          type="button"
          variant="primary"
          data-fashion-card-open
          onClick={() => { onOpen(projectId) }}
        >
          {cta}
        </Button>
      </div>
    </article>
  )
}
