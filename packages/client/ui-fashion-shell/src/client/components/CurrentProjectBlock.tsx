/** Compact “current project” strip under Fashion sidebar nav (F1-03 §5.1). */
import { Button, Tag } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ProjectView } from '@gentlexx/dsh-fashion-project/types'
import type { FashionKey } from '../locales.ts'
import {
  accessLabelKey,
  accessTagTone,
  originLabelKey,
  originTagTone,
} from '../presentation/project-presentation.ts'
import css from './CurrentProjectBlock.module.css'

export type CurrentProjectBlockProps = {
  readonly project: ProjectView | null
  readonly projectId: string
  readonly onBack: () => void
  readonly t: (key: FashionKey) => string
}

/**
 * Render the overview-route current-project summary.
 * @param props - Host list row when known, otherwise the route id only.
 */
export function CurrentProjectBlock({
  project,
  projectId,
  onBack,
  t,
}: CurrentProjectBlockProps) {
  const title = project?.title ?? projectId
  return (
    <div className={css.block} data-fashion-current-project={projectId}>
      <p className={css.heading}>{t('sidebar.currentHeading')}</p>
      <p className={css.title} title={title}>{title}</p>
      {project !== null ? (
        <div className={css.tags}>
          <Tag tone={originTagTone(project.origin)}>{t(originLabelKey(project.origin))}</Tag>
          <Tag tone={accessTagTone(project.accessMode)}>{t(accessLabelKey(project.accessMode))}</Tag>
        </div>
      ) : null}
      <Button type="button" variant="outline" size="sm" onClick={onBack} data-fashion-current-back>
        {t('overview.back')}
      </Button>
    </div>
  )
}
