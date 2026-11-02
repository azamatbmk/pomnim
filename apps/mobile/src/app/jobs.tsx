import { Redirect } from 'expo-router'
import { useSession } from '../entities/session'
import { JobsScreen } from '../screens/jobs/jobs-screen'

export default function JobsRoute() {
  const { ready, session } = useSession()
  if (!ready) return null
  if (!session || session.role !== 'worker') return <Redirect href="/" />
  return <JobsScreen />
}
