import { api } from '../../shared/api/client'

export type OrderStatus = 'open' | 'cancelled'

export type Order = {
  id: string
  graveId: string
  fullName: string
  city: string
  cemetery: string
  landmarks: string | null
  service: string
  serviceTitle: string
  details: string | null
  wishes: string | null
  price: number
  desiredOn: string
  status: OrderStatus
}

export type OrderInput = {
  graveId: string
  service: string
  details: string | null
  wishes: string | null
  price: number | null
  desiredOn: string
}

export function orderDateLabel(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return value
  return `${match[3]}.${match[2]}.${match[1]}`
}

export function listOrders(token: string) {
  return api<Order[]>('/api/orders', { token })
}

export function createOrder(token: string, body: OrderInput) {
  return api<Order>('/api/orders', { method: 'POST', token, body })
}

export function cancelOrder(token: string, id: string) {
  return api<Order>(`/api/orders/${id}/cancel`, { method: 'POST', token })
}
