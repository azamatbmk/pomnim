import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import type { FamilyOption, Grave, GraveInput } from '../../entities/grave'
import { Button } from '../../shared/ui/button'
import { sans, theme } from '../../shared/ui/theme'

type GraveFormProps = {
  families: FamilyOption[]
  initial?: Grave | null
  pending?: boolean
  error?: string
  onChange?: () => void
  onSubmit: (input: GraveInput) => void
}

type FamilyChoice = 'none' | 'have' | 'new'

function yearValue(value: string) {
  if (!value.trim()) return null
  if (!/^\d{4}$/.test(value)) return undefined
  return Number(value)
}

export function GraveForm({ families, initial, pending, error, onChange, onSubmit }: GraveFormProps) {
  const [fullName, setFullName] = useState(initial?.fullName ?? '')
  const [birthYear, setBirthYear] = useState(initial?.birthYear ? String(initial.birthYear) : '')
  const [deathYear, setDeathYear] = useState(initial?.deathYear ? String(initial.deathYear) : '')
  const [city, setCity] = useState(initial?.city ?? '')
  const [cemetery, setCemetery] = useState(initial?.cemetery ?? '')
  const [landmarks, setLandmarks] = useState(initial?.landmarks ?? '')
  const [biography, setBiography] = useState(initial?.biography ?? '')
  const [keepOff, setKeepOff] = useState(initial?.keepOff ?? '')
  const [choice, setChoice] = useState<FamilyChoice>(initial?.familyId ? 'have' : 'none')
  const [familyId, setFamilyId] = useState(initial?.familyId ?? families[0]?.id ?? '')
  const [familyName, setFamilyName] = useState('')
  const [localError, setLocalError] = useState('')
  const familyReady = choice === 'none' || (choice === 'have' && familyId.length > 0) || (choice === 'new' && familyName.trim().length > 0)
  const ready = fullName.trim().length > 0 && city.trim().length > 0 && cemetery.trim().length > 0 && familyReady

  function touch() {
    setLocalError('')
    onChange?.()
  }

  function edit(setter: (value: string) => void) {
    return (value: string) => {
      touch()
      setter(value)
    }
  }

  function choose(next: FamilyChoice) {
    touch()
    setChoice(next)
  }

  function submit() {
    const birth = yearValue(birthYear)
    const death = yearValue(deathYear)
    if (birth === undefined || death === undefined) {
      setLocalError('Год — четыре цифры')
      return
    }
    if (birth != null && death != null && death < birth) {
      setLocalError('Год смерти раньше года рождения')
      return
    }
    if (choice === 'new' && !familyName.trim()) {
      setLocalError('Введите название семьи')
      return
    }
    if (choice === 'have' && !familyId) {
      setLocalError('Выберите семью')
      return
    }
    setLocalError('')
    onSubmit({
      fullName: fullName.trim(),
      birthYear: birth,
      deathYear: death,
      city: city.trim(),
      cemetery: cemetery.trim(),
      landmarks: landmarks.trim() || null,
      biography: biography.trim() || null,
      keepOff: keepOff.trim() || null,
      familyId: choice === 'have' ? familyId : null,
      familyName: choice === 'new' ? familyName.trim() : null,
    })
  }

  return (
    <View style={styles.form}>
      <Text style={styles.section}>Человек</Text>
      <Field label="Имя" value={fullName} onChangeText={edit(setFullName)} placeholder="Как на камне" maxLength={80} />
      <Text style={styles.help}>Фамилию тоже можно. Достаточно года.</Text>
      <View style={styles.years}>
        <View style={styles.year}>
          <Field label="Год рождения" value={birthYear} onChangeText={edit(setBirthYear)} placeholder="1942" maxLength={4} numeric />
        </View>
        <View style={styles.year}>
          <Field label="Год смерти" value={deathYear} onChangeText={edit(setDeathYear)} placeholder="2019" maxLength={4} numeric />
        </View>
      </View>

      <Text style={styles.section}>Место</Text>
      <Field label="Населённый пункт" value={city} onChangeText={edit(setCity)} placeholder="Владикавказ" maxLength={80} />
      <Field label="Кладбище" value={cemetery} onChangeText={edit(setCemetery)} placeholder="Городское кладбище" maxLength={120} />
      <Field
        label="Ориентиры"
        value={landmarks}
        onChangeText={edit(setLandmarks)}
        placeholder="Участок, ряд, как найти"
        maxLength={800}
        multiline
      />

      <Text style={styles.section}>Семья</Text>
      <View style={styles.choices}>
        <Choice label="Не связывать" selected={choice === 'none'} onPress={() => choose('none')} />
        {families.length > 0 ? <Choice label="Уже есть" selected={choice === 'have'} onPress={() => choose('have')} /> : null}
        <Choice label="Новая семья" selected={choice === 'new'} onPress={() => choose('new')} />
      </View>
      {choice === 'have' ? (
        <View style={styles.choices}>
          {families.map((family) => (
            <Choice
              key={family.id}
              label={family.name}
              selected={familyId === family.id}
              onPress={() => {
                touch()
                setFamilyId(family.id)
              }}
            />
          ))}
        </View>
      ) : null}
      {choice === 'new' ? (
        <Field label="Название семьи" value={familyName} onChangeText={edit(setFamilyName)} placeholder="Семья Хугаевых" maxLength={60} />
      ) : null}

      <Text style={styles.section}>Если хотите</Text>
      <Field label="Биография" value={biography} onChangeText={edit(setBiography)} placeholder="Коротко, для семьи" maxLength={2000} multiline />
      <Text style={styles.help}>Биографию видит только семья.</Text>
      <Field
        label="Что нельзя трогать"
        value={keepOff}
        onChangeText={edit(setKeepOff)}
        placeholder="Например, старую ограду"
        maxLength={800}
        multiline
      />

      <Button label={pending ? 'Сохраняем' : 'Сохранить'} onPress={submit} disabled={!ready || pending} />
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
  years: {
    flexDirection: 'row',
    gap: 10,
  },
  year: {
    flex: 1,
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
