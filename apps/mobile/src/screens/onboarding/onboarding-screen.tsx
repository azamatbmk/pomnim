import { useRouter } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AppState,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  emptyGraveDraft,
  readGraveDraft,
  writeGraveDraft,
  type GraveFormDraft,
  type GraveInput,
} from '../../entities/grave'
import { GraveForm } from '../../features/save-grave'
import { BrandMark } from '../../shared/ui/brand-mark'
import { sans, serif, theme } from '../../shared/ui/theme'

export function OnboardingScreen() {
  const router = useRouter()
  const [draft, setDraft] = useState<GraveFormDraft | null>(null)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [keyboard, setKeyboard] = useState(0)
  const [fullHeight, setFullHeight] = useState(0)
  const { height } = useWindowDimensions()
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestRef = useRef<GraveFormDraft | null>(null)
  const readyForAuthRef = useRef(false)

  useEffect(() => {
    let active = true
    readGraveDraft()
      .then((saved) => {
        if (!active) return
        const next = saved ?? emptyGraveDraft()
        readyForAuthRef.current = next.readyForAuth
        latestRef.current = next
        setDraft(next)
      })
      .catch(() => {
        if (!active) return
        const next = emptyGraveDraft()
        readyForAuthRef.current = false
        latestRef.current = next
        setDraft(next)
      })
    return () => {
      active = false
    }
  }, [])

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

  const cancelSave = useCallback(() => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current)
      saveTimer.current = null
    }
  }, [])

  const flushNow = useCallback(async () => {
    cancelSave()
    const next = latestRef.current
    if (!next) return
    try {
      await writeGraveDraft({ ...next, readyForAuth: readyForAuthRef.current })
    } catch {
      // ignore storage errors on background flush
    }
  }, [cancelSave])

  const persist = useCallback(
    (next: GraveFormDraft) => {
      const merged = { ...next, readyForAuth: readyForAuthRef.current }
      latestRef.current = merged
      cancelSave()
      saveTimer.current = setTimeout(() => {
        void writeGraveDraft(merged).catch(() => undefined)
      }, 250)
    },
    [cancelSave],
  )

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background' || state === 'inactive') void flushNow()
    })
    return () => {
      sub.remove()
      void flushNow()
    }
  }, [flushNow])

  const keyboardCovers = Platform.OS === 'android' && keyboard > 0 && fullHeight - height < 80

  async function continueToAuth(input: GraveInput) {
    if (pending) return
    setPending(true)
    setError('')
    cancelSave()
    readyForAuthRef.current = true
    const next: GraveFormDraft = {
      ...emptyGraveDraft(),
      fullName: input.fullName,
      birthYear: input.birthYear == null ? '' : String(input.birthYear),
      deathYear: input.deathYear == null ? '' : String(input.deathYear),
      city: input.city,
      cemetery: input.cemetery,
      landmarks: input.landmarks ?? '',
      latitude: input.latitude,
      longitude: input.longitude,
      biography: input.biography ?? '',
      keepOff: input.keepOff ?? '',
      familyChoice: input.familyName ? 'new' : 'none',
      familyId: '',
      familyName: input.familyName ?? '',
      readyForAuth: true,
    }
    latestRef.current = next
    try {
      await writeGraveDraft(next)
      router.replace('/phone')
    } catch {
      setError('Не получилось сохранить черновик')
      setPending(false)
    }
  }

  async function goRegistered() {
    if (pending) return
    setPending(true)
    cancelSave()
    readyForAuthRef.current = false
    const base = latestRef.current ?? draft ?? emptyGraveDraft()
    const next = { ...base, readyForAuth: false }
    latestRef.current = next
    try {
      await writeGraveDraft(next)
    } catch {
      // всё равно пускаем на вход
    }
    router.replace('/phone')
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.content, keyboardCovers ? { paddingBottom: keyboard + 28 } : null]}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        >
          <View style={styles.brand}>
            <BrandMark width={18} />
            <Text style={styles.word}>помним</Text>
          </View>
          <Text style={styles.title}>Новое захоронение</Text>
          <Text style={styles.lead}>Сначала карточка места. Потом короткий вход по телефону — черновик сохранится.</Text>
          {draft ? (
            <GraveForm
              families={[]}
              draft={draft}
              allowExistingFamilies={false}
              submitLabel="Продолжить"
              pending={pending}
              error={error}
              onChange={() => setError('')}
              onDraftChange={persist}
              onSubmit={(input) => {
                void continueToAuth(input)
              }}
              footer={
                <Pressable accessibilityRole="button" disabled={pending} onPress={() => void goRegistered()} style={styles.registered}>
                  <Text style={styles.registeredText}>Я уже зарегистрирован</Text>
                </Pressable>
              }
            />
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
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 22,
  },
  word: {
    fontFamily: serif,
    fontSize: 18,
    color: theme.ink,
  },
  title: {
    fontFamily: serif,
    fontSize: 32,
    lineHeight: 38,
    color: theme.ink,
  },
  lead: {
    marginTop: 10,
    marginBottom: 8,
    fontFamily: sans,
    fontSize: 14,
    lineHeight: 22,
    color: theme.lead,
  },
  registered: {
    marginTop: 14,
    alignSelf: 'center',
    paddingVertical: 8,
  },
  registeredText: {
    fontFamily: sans,
    fontSize: 13,
    color: theme.green,
  },
})
