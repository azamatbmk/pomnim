import { otherService } from '@pomnim/shared'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { readGrave, type Grave } from '../../entities/grave'
import { createOrder, type OrderInput } from '../../entities/order'
import { listServices, type CatalogService } from '../../entities/service'
import { useSession } from '../../entities/session'
import { OrderForm } from '../../features/create-order'
import { ApiError } from '../../shared/api/client'
import { sans, serif, theme } from '../../shared/ui/theme'

export function OrderFormScreen({ graveId }: { graveId: string }) {
  const router = useRouter()
  const { session } = useSession()
  const [grave, setGrave] = useState<Grave | null>(null)
  const [catalog, setCatalog] = useState<CatalogService[] | null>(null)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [keyboard, setKeyboard] = useState(0)
  const [fullHeight, setFullHeight] = useState(0)
  const { height } = useWindowDimensions()

  useEffect(() => {
    if (keyboard === 0) setFullHeight(height)
  }, [height, keyboard])

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (event) => setKeyboard(event.endCoordinates.height))
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboard(0))
    return () => {
      show.remove()
      hide.remove()
    }
  }, [])

  const keyboardCovers = Platform.OS === 'android' && keyboard > 0 && fullHeight - height < 80

  useEffect(() => {
    if (!session) return
    let active = true
    Promise.all([readGrave(session.token, graveId), listServices()])
      .then(([current, services]) => {
        if (!active) return
        setGrave(current)
        setCatalog(services)
      })
      .catch((caught) => {
        if (!active) return
        setError(caught instanceof ApiError ? caught.message : 'Не получилось')
      })
    return () => {
      active = false
    }
  }, [session, graveId])

  async function submit(input: OrderInput) {
    if (!session || pending) return
    setPending(true)
    setError('')
    try {
      await createOrder(session.token, input)
      router.replace(`/grave/${graveId}`)
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Не получилось')
      setPending(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.content, keyboardCovers ? { paddingBottom: keyboard + 28 } : null]}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        >
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>Захоронение</Text>
          </Pressable>
          {grave ? <Text style={styles.title}>{grave.fullName}</Text> : null}
          {grave && catalog ? (
            <OrderForm
              graveId={graveId}
              offers={[
                ...catalog.map((item) => ({
                  id: item.id,
                  title: item.title,
                  description: item.description,
                  price: item.price,
                })),
                { id: otherService.id, title: otherService.title, price: null },
              ]}
              pending={pending}
              error={error}
              onChange={() => setError('')}
              onSubmit={submit}
            />
          ) : error ? (
            <Text style={styles.error}>{error}</Text>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 28,
  },
  back: {
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  backText: {
    fontFamily: sans,
    fontSize: 13,
    color: theme.green,
  },
  title: {
    fontFamily: serif,
    fontSize: 32,
    lineHeight: 38,
    color: theme.ink,
  },
  error: {
    marginTop: 16,
    fontFamily: sans,
    fontSize: 12,
    lineHeight: 18,
    color: theme.danger,
  },
})
