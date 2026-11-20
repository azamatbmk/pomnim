import { formatRubles } from '@pomnim/shared'
import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { listOrders, orderDateLabel, type Order } from '../../entities/order'
import { useSession } from '../../entities/session'
import { ApiError } from '../../shared/api/client'
import { sans, serif, theme } from '../../shared/ui/theme'
import { Cabinet } from '../../widgets/cabinet'

export function JobsScreen() {
  const { session } = useSession()
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState('')

  useFocusEffect(
    useCallback(() => {
      if (!session) return
      let active = true
      listOrders(session.token)
        .then((list) => {
          if (!active) return
          setOrders(list)
          setError('')
        })
        .catch((caught) => {
          if (!active) return
          setError(caught instanceof ApiError ? caught.message : 'Не получилось')
        })
      return () => {
        active = false
      }
    }, [session]),
  )

  const empty = orders !== null && orders.length === 0

  return (
    <Cabinet
      title="Заявки"
      lead={
        empty
          ? 'Пока заявок нет. Они появятся здесь, когда семья отправит заказ.'
          : orders
            ? 'Сумма уже указана в заявке. Телефон семьи здесь не показывается.'
            : undefined
      }
    >
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {orders?.map((order) => (
        <JobCard key={order.id} order={order} />
      ))}
    </Cabinet>
  )
}

function Field({ label, text }: { label: string; text: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  )
}

function JobCard({ order }: { order: Order }) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{order.fullName}</Text>
      <Text style={styles.meta}>
        {order.city} · {order.cemetery}
      </Text>
      <Text style={styles.task}>
        {order.serviceTitle} · {formatRubles(order.price)}
      </Text>
      {order.details ? <Text style={styles.details}>{order.details}</Text> : null}
      {order.wishes ? <Field label="Пожелания" text={order.wishes} /> : null}
      {order.landmarks ? <Field label="Как найти" text={order.landmarks} /> : null}
      <Field label="Желаемая дата" text={orderDateLabel(order.desiredOn)} />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    marginTop: 14,
    padding: 16,
    backgroundColor: theme.paper,
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: 16,
  },
  name: {
    fontFamily: serif,
    fontSize: 22,
    lineHeight: 28,
    color: theme.ink,
  },
  task: {
    marginTop: 10,
    fontFamily: sans,
    fontSize: 15,
    fontWeight: '500',
    color: theme.ink,
  },
  details: {
    marginTop: 6,
    fontFamily: sans,
    fontSize: 14,
    lineHeight: 20,
    color: theme.ink,
  },
  field: {
    marginTop: 10,
  },
  label: {
    marginBottom: 2,
    fontFamily: sans,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: theme.eyebrow,
  },
  text: {
    fontFamily: sans,
    fontSize: 14,
    lineHeight: 20,
    color: theme.ink,
  },
  meta: {
    marginTop: 4,
    fontFamily: sans,
    fontSize: 13,
    lineHeight: 18,
    color: theme.muted,
  },
  error: {
    marginTop: 12,
    fontFamily: sans,
    fontSize: 12,
    lineHeight: 18,
    color: theme.danger,
  },
})
