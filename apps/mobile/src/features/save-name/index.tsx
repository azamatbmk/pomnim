import type { AppSession } from '@pomnim/shared'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { useSession } from '../../entities/session'
import { api, ApiError } from '../../shared/api/client'
import { Button } from '../../shared/ui/button'
import { sans, theme } from '../../shared/ui/theme'

export function NameForm() {
  const router = useRouter()
  const { session, signIn } = useSession()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const trimmed = name.trim()

  async function submit() {
    if (!session || !trimmed || pending) return
    setPending(true)
    setError('')
    try {
      const next = await api<AppSession>('/api/auth/name', {
        method: 'POST',
        body: { name: trimmed },
        token: session.token,
      })
      await signIn(next)
      router.replace('/')
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Не получилось')
    } finally {
      setPending(false)
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Имя</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        autoComplete="given-name"
        placeholder="Ваше имя"
        placeholderTextColor={theme.placeholder}
        maxLength={40}
        style={styles.input}
      />
      <Button label={pending ? 'Сохраняем' : 'Продолжить'} onPress={submit} disabled={!trimmed || pending} />
      <Text style={styles.help}>Имя можно поправить позже в профиле.</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    marginTop: 0,
    padding: 18,
    backgroundColor: theme.paper,
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: 16,
  },
  label: {
    marginBottom: 8,
    fontFamily: sans,
    fontSize: 12,
    fontWeight: '500',
    color: theme.ink,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: theme.paperLine,
    borderRadius: 8,
    fontFamily: sans,
    fontSize: 16,
    color: theme.ink,
  },
  help: {
    marginTop: 10,
    fontFamily: sans,
    fontSize: 11,
    lineHeight: 18,
    color: theme.help,
  },
  error: {
    marginTop: 8,
    fontFamily: sans,
    fontSize: 12,
    lineHeight: 18,
    color: theme.danger,
  },
})
