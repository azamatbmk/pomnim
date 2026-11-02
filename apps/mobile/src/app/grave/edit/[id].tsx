import { Redirect, useLocalSearchParams } from 'expo-router'
import { useSession } from '../../../entities/session'
import { GraveFormScreen } from '../../../screens/grave-form/grave-form-screen'

export default function EditGraveRoute() {
  const { ready, session } = useSession()
  const params = useLocalSearchParams<{ id?: string }>()
  if (!ready) return null
  if (!session || session.role !== 'customer' || session.needsName) return <Redirect href="/" />
  if (typeof params.id !== 'string' || !params.id) return <Redirect href="/graves" />
  return <GraveFormScreen graveId={params.id} />
}
