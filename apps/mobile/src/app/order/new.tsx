import { Redirect, useLocalSearchParams } from 'expo-router'
import { useSession } from '../../entities/session'
import { OrderFormScreen } from '../../screens/order-form/order-form-screen'

function graveIdFrom(value: string | string[] | undefined) {
  return typeof value === 'string' ? value : ''
}

export default function NewOrderRoute() {
  const { ready, session } = useSession()
  const params = useLocalSearchParams<{ graveId?: string | string[] }>()
  const graveId = graveIdFrom(params.graveId)
  if (!ready) return null
  if (!session || session.role !== 'customer' || session.needsName) return <Redirect href="/" />
  if (!graveId) return <Redirect href="/graves" />
  return <OrderFormScreen graveId={graveId} />
}
