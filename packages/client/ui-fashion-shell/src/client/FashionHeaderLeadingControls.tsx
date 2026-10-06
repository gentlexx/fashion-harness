/** Conversation header utility: restore / toggle the Fashion sidebar. */
import { Button, IconPanelLeftOutline16 } from '@deepseek-ai/dsh-client-ui-primitives'
import type { InjectFace, PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import css from './FashionHeaderLeadingControls.module.css'

export type FashionHeaderLeadingInjected = {
  toggleSidebar: () => void
}

export type FashionHeaderLeadingProps =
  InjectFace<FashionHeaderLeadingInjected>
  & PropsLocale<'fashion'>

/**
 * Keyboard-reachable sidebar toggle for Agent workspace (including macOS
 * hidden-titlebar layouts where the rail may be hard to discover).
 * @param props - toggle inject and fashion locale.
 */
export function FashionHeaderLeadingControls({
  toggleSidebar,
  t,
}: FashionHeaderLeadingProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={css.restore}
      data-fashion-sidebar-restore
      aria-label={t('sidebar.expand')}
      onClick={toggleSidebar}
      icon={<IconPanelLeftOutline16 size={14} />}
    >
      {t('sidebar.expand')}
    </Button>
  )
}
