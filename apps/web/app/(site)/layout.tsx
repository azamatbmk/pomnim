import type { Metadata } from 'next'
import { SiteChrome } from './chrome'

export const metadata: Metadata = {
  title: {
    default: 'Помним — забота о памяти',
    template: '%s — Помним',
  },
  description: 'Бережный уход за захоронением в Северной Осетии. Семья согласует работы и получает фотоотчёт.',
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>
}
