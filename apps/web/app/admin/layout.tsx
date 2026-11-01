import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Помним — админка' }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children
}
