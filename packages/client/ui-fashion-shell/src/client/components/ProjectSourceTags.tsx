/** Origin + access Tags for cards and Overview headers (F1-03 §4 / §6.4). */
import { Tag } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ProjectAccessMode, ProjectOrigin } from '@gentlexx/dsh-fashion-project/types'
import type { FashionKey } from '../locales.ts'
import {
  accessLabelKey,
  accessTagTone,
  originLabelKey,
  originTagTone,
} from '../presentation/project-presentation.ts'
import css from './ProjectSourceTags.module.css'

export type ProjectSourceTagsProps = {
  readonly origin: ProjectOrigin
  readonly accessMode: ProjectAccessMode
  readonly t: (key: FashionKey) => string
}

/**
 * Render read-only origin and access tags from Host fields.
 * @param props - Host origin/accessMode and fashion translator.
 */
export function ProjectSourceTags({ origin, accessMode, t }: ProjectSourceTagsProps) {
  return (
    <div className={css.row} data-fashion-source-tags>
      <Tag tone={originTagTone(origin)}>{t(originLabelKey(origin))}</Tag>
      <Tag tone={accessTagTone(accessMode)}>{t(accessLabelKey(accessMode))}</Tag>
    </div>
  )
}
