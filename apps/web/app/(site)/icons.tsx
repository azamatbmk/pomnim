import type { ReactNode } from 'react'
import styles from './site.module.css'

export type IconName = 'home' | 'grid' | 'people' | 'help' | 'pin' | 'arrow' | 'leaf' | 'paint' | 'flower' | 'camera' | 'check' | 'list'

const paths: Record<IconName, ReactNode> = {
  home: <path d="m3 10 9-7 9 7v10H3Z M9 20v-7h6v7" />,
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M2 21v-3a7 7 0 0 1 14 0v3M16 4a3 3 0 0 1 0 6M19 13a6 6 0 0 1 3 5v3" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 5M12 17h.01" />
    </>
  ),
  pin: (
    <>
      <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
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

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg className={className ? `${styles.icon} ${className}` : styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}
