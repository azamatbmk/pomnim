import { Redirect } from 'expo-router'
import { useSession } from '../entities/session'
import { GravesScreen } from '../screens/graves/graves-screen'

export default function GravesRoute() {
  const { ready, session } = useSession()
  if (!ready) return null
  if (!session || session.role !== 'customer' || session.needsName) return <Redirect href="/" />
  return <GravesScreen />
}
