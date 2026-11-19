import type { ReactNode } from 'react'
import type { ServiceIcon } from '@pomnim/shared'

const marks: Record<ServiceIcon, ReactNode> = {
  leaf: <path d="M20 3C4 3 2 10 6 15s14 4 14-12Z M4 21 15 10" />,
  paint: (
    <>
      <rect x="3" y="3" width="14" height="7" rx="2" />
      <path d="M17 6h4v8H11v3M9 17h4v5H9Z" />
    </>
  ),
  flower: (
    <>
      <path d="M12 13v9m0-4c-5 0-6-3-6-3m6 5c5 0 6-3 6-3" />
      <path d="M12 3c3-5 7 0 4 3 6 0 5 6 1 6-1 5-6 4-5 0-4 4-8 0-5-3-5-3-1-7 3-4-1-5 3-5 2-2Z" />
    </>
  ),
  camera: (
    <>
      <path d="M3 7h5l2-3h4l2 3h5v14H3Z" />
      <circle cx="12" cy="13" r="4" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  list: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V2h6v2M9 10h6M9 14h6M9 18h3" />
    </>
  ),
}

export function ServiceGlyph({ name }: { name: ServiceIcon }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {marks[name]}
    </svg>
  )
}
