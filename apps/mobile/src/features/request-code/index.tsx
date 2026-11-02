import { normalizePhone } from '@pomnim/shared'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { api, ApiError } from '../../shared/api/client'
import { Button } from '../../shared/ui/button'
import { sans, theme } from '../../shared/ui/theme'

function localDigits(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) return digits.slice(1)
  return digits.slice(0, 10)
}

function localView(digits: string) {
  const area = digits.slice(0, 3)
  const first = digits.slice(3, 6)
  const second = digits.slice(6, 8)
  const third = digits.slice(8, 10)
  return [area, first && ` ${first}`, second && `-${second}`, third && `-${third}`].filter(Boolean).join('')
}

export function PhoneForm() {
  const router = useRouter()
  const [digits, setDigits] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const phone = normalizePhone(digits)

  async function submit() {
    if (!phone || pending) return
    setPending(true)
    setError('')
    try {
      const result = await api<{ phone: string; devCode?: string }>('/api/auth/phone', {
        method: 'POST',
        body: { phone },
      })
      router.push({
        pathname: '/code',
        params: result.devCode ? { phone, dev: result.devCode } : { phone },
      })
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Не получилось')
    } finally {
      setPending(false)
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Номер телефона</Text>
      <View style={styles.row}>
        <Text style={styles.prefix}>+7</Text>
        <TextInput
          value={localView(digits)}
          onChangeText={(value) => setDigits(localDigits(value))}
          inputMode="tel"
          autoComplete="tel"
          placeholder="900 000-00-00"
          placeholderTextColor={theme.placeholder}
          style={styles.input}
          maxLength={15}
        />
      </View>
      <Button label={pending ? 'Отправляем' : 'Получить код'} onPress={submit} disabled={!phone || pending} />
      <Text style={styles.help}>Код придёт в СМС. Пароль не нужен.</Text>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.paperLine,
    borderRadius: 8,
    backgroundColor: theme.paper,
  },
  prefix: {
    paddingHorizontal: 12,
    paddingVertical: 13,
    borderRightWidth: 1,
    borderRightColor: theme.line,
    fontFamily: sans,
    fontSize: 16,
    color: theme.muted,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 13,
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
