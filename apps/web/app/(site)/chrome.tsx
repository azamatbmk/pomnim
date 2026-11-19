'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { Brand } from './brand'
import { Icon, type IconName } from './icons'
import styles from './site.module.css'

const links: { href: string; label: string; icon: IconName }[] = [
  { href: '/', label: 'Главная', icon: 'home' },
  { href: '/services', label: 'Услуги', icon: 'grid' },
  { href: '/help', label: 'Как это работает', icon: 'help' },
]

function current(pathname: string) {
  if (pathname.startsWith('/services')) return 'Услуги'
  if (pathname.startsWith('/people')) return 'Исполнители'
  if (pathname.startsWith('/help')) return 'Как это работает'
  return 'Главная'
}

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return (
    <div className={styles.frame}>
      <aside className={styles.sidebar}>
        <Brand />
        <div className={styles.region}>
          <Icon name="pin" className={styles.pin} />
          <span>Северная Осетия — Алания</span>
        </div>
        <nav className={styles.nav} aria-label="Разделы сайта">
          {links.map((link) => (
            <Link key={link.href} href={link.href} aria-current={isActive(pathname, link.href) ? 'page' : undefined}>
              <Icon name={link.icon} />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
        <div className={styles.asideNote}>
          <span className={styles.leaf}>✧</span>
          <p>
            Забота сохраняет
            <br />
            то, что нам дорого.
          </p>
          <small>
            Бережно. С уважением.
            <br />
            Даже на расстоянии.
          </small>
        </div>
      </aside>
      <div className={styles.shell}>
        <header className={styles.topbar}>
          <span className={styles.crumb}>Помним</span>
          <span className={styles.sep}>/</span>
          <span>{current(pathname)}</span>
        </header>
        <main className={styles.main}>{children}</main>
        <footer className={styles.footer}>
          <span>Помним · Северная Осетия — Алания</span>
        </footer>
      </div>
    </div>
  )
}
