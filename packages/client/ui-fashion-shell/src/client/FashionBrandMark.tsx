import type { HeroBrandMarkOwnerProps } from '@deepseek-ai/dsh-client-ui-conversation/client'

/** Neutral Fashion Harness mark used only by the Fashion product profile. */
export function FashionBrandMark({ size, className }: HeroBrandMarkOwnerProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      focusable="false"
      height={size}
      viewBox="0 0 64 64"
      width={size}
    >
      <rect width="64" height="64" rx="16" fill="#1f2933" />
      <path d="M16 16h16v7H23v7h8v7h-8v11h-7V16Z" fill="#fff" />
      <path d="M36 16h7v12h5V16h7v32h-7V35h-5v13h-7V16Z" fill="#d7e8df" />
    </svg>
  )
}
