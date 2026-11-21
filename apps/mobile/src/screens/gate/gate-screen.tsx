import { Redirect, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { clearGraveDraft, readGraveDraft } from '../../entities/grave'
import { useSession } from '../../entities/session'
import { flushGraveDraft } from '../../features/flush-grave-draft'

export function GateScreen() {
  const router = useRouter()
  const { ready, session } = useSession()
  const [gate, setGate] = useState<'loading' | 'onboarding' | 'phone' | 'flushing' | 'app'>('loading')

  useEffect(() => {
    if (!ready) return
    let active = true
    setGate('loading')

    async function run() {
      try {
        if (!session) {
          const draft = await readGraveDraft()
          if (!active) return
          setGate(draft?.readyForAuth ? 'phone' : 'onboarding')
          return
        }

        if (session.needsName) {
          if (!active) return
          setGate('app')
          return
        }

        if (session.role === 'worker') {
          await clearGraveDraft()
          if (!active) return
          setGate('app')
          return
        }

        setGate('flushing')
        const grave = await flushGraveDraft(session.token)
        if (!active) return
        if (grave) {
          router.replace(`/grave/${grave.id}`)
          return
        }
        setGate('app')
      } catch {
        if (!active) return
        setGate(session ? 'app' : 'onboarding')
      }
    }

    void run()
    return () => {
      active = false
    }
  }, [ready, session, router])

  if (!ready || gate === 'loading' || gate === 'flushing') return null
  if (!session) {
    if (gate === 'phone') return <Redirect href="/phone" />
    return <Redirect href="/onboarding" />
  }
  if (session.needsName) return <Redirect href="/name" />
  if (session.role === 'worker') return <Redirect href="/jobs" />
  return <Redirect href="/graves" />
}
