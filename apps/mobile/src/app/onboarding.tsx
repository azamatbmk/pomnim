import { Redirect } from 'expo-router'
import { useSession } from '../entities/session'
import { OnboardingScreen } from '../screens/onboarding/onboarding-screen'

export default function OnboardingRoute() {
  const { ready, session } = useSession()
  if (!ready) return null
  if (session) return <Redirect href="/" />
  return <OnboardingScreen />
}
