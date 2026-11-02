import type { AppSession } from '@pomnim/shared'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from '../../shared/api/client'
import { clearToken, readToken, writeToken } from '../../shared/lib/token'

type SessionContextValue = {
  ready: boolean
  session: AppSession | null
  signIn: (session: AppSession) => Promise<void>
  signOut: () => Promise<void>
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [session, setSession] = useState<AppSession | null>(null)

  useEffect(() => {
    let active = true
    readToken()
      .then(async (token) => {
        if (!token) return
        const current = await api<AppSession>('/api/auth/session', { token })
        await writeToken(current.token)
        if (active) setSession(current)
      })
      .catch(async () => {
        await clearToken()
        if (active) setSession(null)
      })
      .finally(() => {
        if (active) setReady(true)
      })
    return () => {
      active = false
    }
  }, [])

  async function signIn(next: AppSession) {
    await writeToken(next.token)
    setSession(next)
  }

  async function signOut() {
    await clearToken()
    setSession(null)
  }

  return <SessionContext.Provider value={{ ready, session, signIn, signOut }}>{children}</SessionContext.Provider>
}

export function useSession() {
  const value = useContext(SessionContext)
  if (!value) throw new Error('Сессия ещё не готова')
  return value
}
