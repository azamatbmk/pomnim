import { formatRubles, otherService } from '@pomnim/shared'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import type { OrderInput } from '../../entities/order'
import { Button } from '../../shared/ui/button'
import { sans, theme } from '../../shared/ui/theme'

type Offer = {
  id: string
  title: string
  description?: string
  price: number | null
}

type OrderFormProps = {
  graveId: string
  offers: Offer[]
  pending?: boolean
  error?: string
  onChange?: () => void
  onSubmit: (input: OrderInput) => void
}

function money(value: string) {
  if (!/^\d+$/.test(value)) return null
  const amount = Number(value)
  if (!Number.isInteger(amount) || amount < 1 || amount > 1000000) return null
  return amount
}

function isoDate(value: string) {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value.trim())
  if (!match) return null
  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null
  return `${match[3]}-${match[2]}-${match[1]}`
}

export function OrderForm({ graveId, offers, pending, error, onChange, onSubmit }: OrderFormProps) {
  const [service, setService] = useState('')
  const [details, setDetails] = useState('')
  const [price, setPrice] = useState('')
  const [wishes, setWishes] = useState('')
  const [date, setDate] = useState('')
  const [localError, setLocalError] = useState('')
  const amount = money(price)
  const picked = offers.find((item) => item.id === service)
  const ready = service !== '' && isoDate(date) !== null && (service !== otherService.id || (details.trim().length > 0 && amount !== null))

  function touch() {
    setLocalError('')
    onChange?.()
  }

  function submit() {
    const desiredOn = isoDate(date)
    if (!service) {
      setLocalError('Выберите услугу')
      return
    }
    if (service === otherService.id && !details.trim()) {
      setLocalError('Опишите, что нужно сделать')
      return
    }
    if (service === otherService.id && amount == null) {
      setLocalError('Назовите сумму')
      return
    }
    if (!desiredOn) {
      setLocalError('Дата в виде 20.11.2026')
      return
    }
    const today = new Date()
    const current = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    if (desiredOn < current) {
      setLocalError('Эта дата уже прошла')
      return
    }
    setLocalError('')
    onSubmit({
      graveId,
      service,
      details: service === otherService.id ? details.trim() : null,
      wishes: wishes.trim() || null,
      price: service === otherService.id ? amount : null,
      desiredOn,
    })
  }

  return (
    <View style={styles.form}>
      <Text style={styles.section}>Услуга</Text>
      <View style={styles.choices}>
        {offers.map((item) => (
          <Choice
            key={item.id}
            label={item.price == null ? item.title : `${item.title} · ${formatRubles(item.price)}`}
            selected={service === item.id}
            onPress={() => {
              touch()
              setService(item.id)
            }}
          />
        ))}
      </View>
      {service === otherService.id ? (
        <Field
          label="Что нужно сделать"
          value={details}
          onChangeText={(value) => {
            touch()
            setDetails(value)
          }}
          placeholder="Своими словами"
          maxLength={800}
          multiline
        />
      ) : null}
      {service === otherService.id ? (
        <Field
          label="Сумма"
          value={price}
          onChangeText={(value) => {
            touch()
            setPrice(value.replace(/\D/g, ''))
          }}
          placeholder="1500"
          maxLength={7}
          numeric
        />
      ) : null}
      {service === otherService.id ? <Text style={styles.help}>Эту сумму называете вы.</Text> : null}
      {picked && service !== otherService.id ? <Text style={styles.help}>{picked.description || 'Это фиксированная цена услуги.'}</Text> : null}
      <Field
        label="Желаемая дата"
        value={date}
        onChangeText={(value) => {
          touch()
          setDate(value)
        }}
        placeholder="20.11.2026"
        maxLength={10}
      />
      <Text style={styles.help}>Исполнитель подтвердит, что успеет.</Text>
      <Field
        label="Пожелания"
        value={wishes}
        onChangeText={(value) => {
          touch()
          setWishes(value)
        }}
        placeholder="Если есть"
        maxLength={800}
        multiline
      />
      <Button label={pending ? 'Отправляем' : 'Отправить заявку'} onPress={submit} disabled={!ready || pending} />
      {localError || error ? <Text style={styles.error}>{localError || error}</Text> : null}
    </View>
  )
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  maxLength,
  numeric,
  multiline,
}: {
  label: string
  value: string
  onChangeText: (value: string) => void
  placeholder: string
  maxLength: number
  numeric?: boolean
  multiline?: boolean
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.placeholder}
        maxLength={maxLength}
        autoCorrect={false}
        keyboardType={numeric ? 'number-pad' : 'default'}
        inputMode={numeric ? 'numeric' : 'text'}
        multiline={multiline}
        style={[styles.input, multiline && styles.multiline]}
      />
    </View>
  )
}

function Choice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.choice, selected && styles.choiceOn]}>
      <Text style={[styles.choiceText, selected && styles.choiceTextOn]}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  form: {
    paddingBottom: 28,
  },
  section: {
    marginTop: 22,
    marginBottom: 12,
    fontFamily: sans,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: theme.eyebrow,
  },
  field: {
    marginBottom: 12,
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
    backgroundColor: theme.paper,
    fontFamily: sans,
    fontSize: 16,
    color: theme.ink,
  },
  multiline: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  help: {
    marginTop: -4,
    marginBottom: 12,
    fontFamily: sans,
    fontSize: 11,
    lineHeight: 18,
    color: theme.help,
  },
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  choice: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.paperLine,
    borderRadius: 8,
    backgroundColor: theme.paper,
  },
  choiceOn: {
    borderColor: theme.green,
    backgroundColor: '#eef2e7',
  },
  choiceText: {
    fontFamily: sans,
    fontSize: 13,
    color: theme.ink,
  },
  choiceTextOn: {
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
