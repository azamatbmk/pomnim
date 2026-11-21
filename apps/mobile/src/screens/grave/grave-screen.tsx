import { formatRubles } from '@pomnim/shared'
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { deleteGrave, graveMapPoint, graveYears, readGrave, yandexMapsUrl, type Grave } from '../../entities/grave'
import { cancelOrder, listOrders, orderDateLabel, type Order } from '../../entities/order'
import { useSession } from '../../entities/session'
import { ApiError } from '../../shared/api/client'
import { Button } from '../../shared/ui/button'
import { sans, serif, theme } from '../../shared/ui/theme'

export function GraveScreen() {
  const router = useRouter()
  const { session } = useSession()
  const params = useLocalSearchParams<{ id?: string }>()
  const id = typeof params.id === 'string' ? params.id : ''
  const [grave, setGrave] = useState<Grave | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersNote, setOrdersNote] = useState('')
  const [error, setError] = useState('')
  const [removing, setRemoving] = useState(false)
  const [cancelling, setCancelling] = useState('')

  useFocusEffect(
    useCallback(() => {
      if (!session || !id) return
      let active = true
      readGrave(session.token, id)
        .then((next) => {
          if (!active) return
          setGrave(next)
          setError('')
        })
        .catch((caught) => {
          if (!active) return
          setError(caught instanceof ApiError ? caught.message : 'Не получилось')
        })
      listOrders(session.token)
        .then((list) => {
          if (!active) return
          setOrders(list.filter((order) => order.graveId === id))
          setOrdersNote('')
        })
        .catch(() => {
          if (!active) return
          setOrders([])
          setOrdersNote('Не получилось загрузить заявки')
        })
      return () => {
        active = false
      }
    }, [session, id]),
  )

  function confirmRemove() {
    if (!session || !grave || removing) return
    Alert.alert('Удалить карточку?', 'Она пропадёт из списка. Вернуть её будет нельзя.', [
      { text: 'Оставить', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: () => void remove() },
    ])
  }

  async function remove() {
    if (!session || !grave || removing) return
    setRemoving(true)
    setError('')
    try {
      await deleteGrave(session.token, grave.id)
      router.replace('/graves')
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Не получилось')
      setRemoving(false)
    }
  }

  function confirmCancel(orderId: string) {
    if (!session || cancelling) return
    Alert.alert('Отменить заявку?', 'Исполнитель её больше не увидит.', [
      { text: 'Оставить', style: 'cancel' },
      { text: 'Отменить', style: 'destructive', onPress: () => void cancel(orderId) },
    ])
  }

  async function cancel(orderId: string) {
    if (!session || cancelling) return
    setCancelling(orderId)
    setError('')
    try {
      const next = await cancelOrder(session.token, orderId)
      setOrders((current) => current.map((order) => (order.id === next.id ? next : order)))
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Не получилось')
    } finally {
      setCancelling('')
    }
  }

  const years = grave ? graveYears(grave) : ''
  const mapPoint = grave ? graveMapPoint(grave) : null

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Pressable accessibilityRole="button" onPress={() => router.replace('/graves')} style={styles.back}>
          <Text style={styles.backText}>Захоронения</Text>
        </Pressable>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {ordersNote ? <Text style={styles.error}>{ordersNote}</Text> : null}
        {grave ? (
          <View>
            <Text style={styles.name}>{grave.fullName}</Text>
            {years ? <Text style={styles.years}>{years}</Text> : null}
            <Text style={styles.place}>
              {grave.city} · {grave.cemetery}
            </Text>
            {grave.familyName ? <Note label="Семья" text={grave.familyName} /> : null}
            {mapPoint ? (
              <Pressable
                accessibilityRole="link"
                onPress={() => {
                  void Linking.openURL(yandexMapsUrl(mapPoint)).catch(() => undefined)
                }}
                style={styles.mapLink}
              >
                <Text style={styles.mapLinkText}>Открыть на Яндекс.Картах</Text>
              </Pressable>
            ) : null}
            {grave.landmarks ? <Note label="Как найти" text={grave.landmarks} /> : null}
            {grave.biography ? <Note label="Биография" text={grave.biography} /> : null}
            {grave.keepOff ? <Note label="Что нельзя трогать" text={grave.keepOff} /> : null}
            {orders.length > 0 ? <Text style={styles.ordersTitle}>Заявки</Text> : null}
            {orders.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                cancelling={cancelling === order.id}
                onCancel={() => confirmCancel(order.id)}
              />
            ))}
            <Button label="Заказать уход" onPress={() => router.push(`/order/new?graveId=${grave.id}`)} />
            <Pressable accessibilityRole="button" onPress={() => router.push(`/grave/edit/${grave.id}`)} style={styles.edit}>
              <Text style={styles.editText}>Изменить карточку</Text>
            </Pressable>
            <Pressable accessibilityRole="button" disabled={removing} onPress={confirmRemove} style={styles.remove}>
              <Text style={styles.removeText}>{removing ? 'Удаляем' : 'Удалить карточку'}</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  )
}

function OrderRow({ order, cancelling, onCancel }: { order: Order; cancelling: boolean; onCancel: () => void }) {
  return (
    <View style={styles.order}>
      <Text style={styles.orderTitle}>{order.serviceTitle}</Text>
      <Text style={styles.orderMeta}>{formatRubles(order.price)}</Text>
      <Text style={styles.orderMeta}>{order.status === 'open' ? 'Ждёт исполнителя' : 'Отменена'}</Text>
      <Text style={styles.orderMeta}>{orderDateLabel(order.desiredOn)}</Text>
      {order.details ? <Text style={styles.orderText}>{order.details}</Text> : null}
      {order.wishes ? <Text style={styles.orderText}>{order.wishes}</Text> : null}
      {order.status === 'open' ? (
        <Pressable accessibilityRole="button" disabled={cancelling} onPress={onCancel} style={styles.cancel}>
          <Text style={styles.cancelText}>{cancelling ? 'Отменяем' : 'Отменить заявку'}</Text>
        </Pressable>
      ) : null}
    </View>
  )
}

function Note({ label, text }: { label: string; text: string }) {
  return (
    <View style={styles.note}>
      <Text style={styles.noteLabel}>{label}</Text>
      <Text style={styles.noteText}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 28,
  },
  back: {
    alignSelf: 'flex-start',
    marginBottom: 18,
  },
  backText: {
    fontFamily: sans,
    fontSize: 13,
    color: theme.green,
  },
  name: {
    fontFamily: serif,
    fontSize: 32,
    lineHeight: 38,
    color: theme.ink,
  },
  years: {
    marginTop: 8,
    fontFamily: serif,
    fontSize: 18,
    color: theme.muted,
  },
  place: {
    marginTop: 8,
    fontFamily: sans,
    fontSize: 14,
    lineHeight: 20,
    color: theme.ink,
  },
  mapLink: {
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  mapLinkText: {
    fontFamily: sans,
    fontSize: 13,
    color: theme.green,
  },
  note: {
    marginTop: 18,
  },
  noteLabel: {
    marginBottom: 4,
    fontFamily: sans,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: theme.eyebrow,
  },
  noteText: {
    fontFamily: sans,
    fontSize: 15,
    lineHeight: 22,
    color: theme.ink,
  },
  ordersTitle: {
    marginTop: 26,
    marginBottom: 8,
    fontFamily: sans,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: theme.eyebrow,
  },
  order: {
    marginBottom: 10,
    padding: 16,
    backgroundColor: theme.paper,
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: 16,
  },
  orderTitle: {
    fontFamily: sans,
    fontSize: 15,
    fontWeight: '500',
    color: theme.ink,
  },
  orderMeta: {
    marginTop: 4,
    fontFamily: sans,
    fontSize: 13,
    lineHeight: 18,
    color: theme.muted,
  },
  orderText: {
    marginTop: 8,
    fontFamily: sans,
    fontSize: 14,
    lineHeight: 20,
    color: theme.ink,
  },
  cancel: {
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  cancelText: {
    fontFamily: sans,
    fontSize: 13,
    color: theme.danger,
  },
  edit: {
    alignSelf: 'flex-start',
    marginTop: 16,
  },
  editText: {
    fontFamily: sans,
    fontSize: 13,
    color: theme.green,
  },
  remove: {
    alignSelf: 'flex-start',
    marginTop: 18,
  },
  removeText: {
    fontFamily: sans,
    fontSize: 13,
    color: theme.danger,
  },
  error: {
    fontFamily: sans,
    fontSize: 12,
    lineHeight: 18,
    color: theme.danger,
  },
})
