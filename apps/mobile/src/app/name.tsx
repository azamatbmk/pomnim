import { Redirect } from 'expo-router'
import { useSession } from '../entities/session'
import { NameScreen } from '../screens/name/name-screen'

export default function NameRoute() {
  const { ready, session } = useSession()
  if (!ready) return null
  if (!session) return <Redirect href="/phone" />
  if (!session.needsName) return <Redirect href="/" />
  return <NameScreen />
}
