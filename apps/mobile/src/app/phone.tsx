import { Redirect } from 'expo-router'
import { useSession } from '../entities/session'
import { PhoneScreen } from '../screens/phone/phone-screen'

export default function PhoneRoute() {
  const { ready, session } = useSession()
  if (!ready) return null
  if (session) return <Redirect href="/" />
  return <PhoneScreen />
}
