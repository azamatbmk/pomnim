import { Redirect } from 'expo-router'
import { useSession } from '../../entities/session'
import { GraveFormScreen } from '../../screens/grave-form/grave-form-screen'

export default function NewGraveRoute() {
  const { ready, session } = useSession()
  if (!ready) return null
  if (!session || session.role !== 'customer' || session.needsName) return <Redirect href="/" />
  return <GraveFormScreen />
}
