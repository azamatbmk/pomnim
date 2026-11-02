import type { AppSession } from '@pomnim/shared'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { useSession } from '../../entities/session'
import { api, ApiError } from '../../shared/api/client'
import { Button } from '../../shared/ui/button'
import { sans, serif, theme } from '../../shared/ui/theme'

type CodeFormProps = {
  phone: string
  devCode?: string
}

export function CodeForm({ phone, devCode }: CodeFormProps) {
  const router = useRouter()
  const { signIn } = useSession()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [pending, setPending] = useState(false)

  async function submit() {
    if (code.length < 4 || pending) return
    setPending(true)
    setError('')
    try {
      const session = await api<AppSession>('/api/auth/verify', {
        method: 'POST',
        body: { phone, code },
      })
      await signIn(session)
      router.replace('/')
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Не получилось')
    } finally {
      setPending(false)
    }
  }

  async function resend() {
    if (pending) return
    setPending(true)
    setError('')
    try {
      const result = await api<{ devCode?: string }>('/api/auth/phone', {
        method: 'POST',
        body: { phone },
      })
      if (result.devCode) router.setParams({ dev: result.devCode })
      setNotice('Новый код отправлен')
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Не получилось')
    } finally {
      setPending(false)
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.boxes}>
        {[0, 1, 2, 3].map((index) => (
          <View key={index} style={styles.box}>
            <Text style={styles.digit}>{code[index] ?? ''}</Text>
          </View>
        ))}
        <TextInput
          value={code}
          onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 4))}
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={4}
          autoFocus
          style={styles.catcher}
          caretHidden
        />
      </View>
      <Button label={pending ? 'Проверяем' : 'Подтвердить'} onPress={submit} disabled={code.length < 4 || pending} />
      {devCode ? <Text style={styles.help}>Для проверки на этом компьютере код {devCode}</Text> : null}
      <Pressable onPress={resend} disabled={pending}>
        <Text style={styles.link}>{notice || 'Отправить код ещё раз'}</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    marginTop: 28,
    padding: 18,
    backgroundColor: theme.paper,
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: 16,
  },
  boxes: {
    position: 'relative',
    flexDirection: 'row',
    gap: 8,
  },
  box: {
    flex: 1,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.paperLine,
    borderRadius: 8,
  },
  digit: {
    fontFamily: serif,
    fontSize: 24,
    color: theme.ink,
  },
  catcher: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    color: 'transparent',
  },
  help: {
    marginTop: 10,
    fontFamily: sans,
    fontSize: 11,
    lineHeight: 18,
    color: theme.help,
  },
  link: {
    marginTop: 12,
    fontFamily: sans,
    fontSize: 12,
    color: theme.green,
  },
  error: {
    marginTop: 8,
    fontFamily: sans,
    fontSize: 12,
    lineHeight: 18,
    color: theme.danger,
  },
})
