import { Redirect, useLocalSearchParams } from 'expo-router'
import { useSession } from '../../entities/session'
import { GraveScreen } from '../../screens/grave/grave-screen'

export default function GraveRoute() {
  const { ready, session } = useSession()
  const params = useLocalSearchParams<{ id?: string }>()
  if (!ready) return null
  if (!session || session.role !== 'customer' || session.needsName) return <Redirect href="/" />
  if (typeof params.id !== 'string' || !params.id) return <Redirect href="/graves" />
  return <GraveScreen />
}
