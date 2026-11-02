import { Redirect } from 'expo-router'
import { useSession } from '../entities/session'

export default function IndexRoute() {
  const { ready, session } = useSession()
  if (!ready) return null
  if (!session) return <Redirect href="/phone" />
  if (session.needsName) return <Redirect href="/name" />
  if (session.role === 'worker') return <Redirect href="/jobs" />
  return <Redirect href="/graves" />
}
