import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { graveYearMax, graveYearMin, parseGraveYear } from '@pomnim/shared'
import {
  emptyGraveDraft,
  graveMapPoint,
  type FamilyOption,
  type Grave,
  type GraveFormDraft,
  type GraveInput,
  type MapPoint,
} from '../../entities/grave'
import { PickGravePoint } from './map-picker'
import { Button } from '../../shared/ui/button'
import { sans, theme } from '../../shared/ui/theme'

type FamilyChoice = GraveFormDraft['familyChoice']

type GraveFormProps = {
  families: FamilyOption[]
  initial?: Grave | null
  draft?: GraveFormDraft | null
  pending?: boolean
  error?: string
  submitLabel?: string
  allowExistingFamilies?: boolean
  footer?: ReactNode
  onChange?: () => void
  onDraftChange?: (draft: GraveFormDraft) => void
  onSubmit: (input: GraveInput) => void
}

function draftFromGrave(grave: Grave, families: FamilyOption[]): GraveFormDraft {
  return {
    ...emptyGraveDraft(),
    fullName: grave.fullName,
    birthYear: grave.birthYear ? String(grave.birthYear) : '',
    deathYear: grave.deathYear ? String(grave.deathYear) : '',
    city: grave.city,
    cemetery: grave.cemetery,
    landmarks: grave.landmarks ?? '',
    latitude: grave.latitude,
    longitude: grave.longitude,
    biography: grave.biography ?? '',
    keepOff: grave.keepOff ?? '',
    familyChoice: grave.familyId ? 'have' : 'none',
    familyId: grave.familyId ?? families[0]?.id ?? '',
    familyName: '',
    readyForAuth: false,
  }
}

export function GraveForm({
  families,
  initial,
  draft,
  pending,
  error,
  submitLabel = 'Сохранить',
  allowExistingFamilies = true,
  footer,
  onChange,
  onDraftChange,
  onSubmit,
}: GraveFormProps) {
  const seed = draft ?? (initial ? draftFromGrave(initial, families) : emptyGraveDraft())
  const [fullName, setFullName] = useState(seed.fullName)
  const [birthYear, setBirthYear] = useState(seed.birthYear)
  const [deathYear, setDeathYear] = useState(seed.deathYear)
  const [city, setCity] = useState(seed.city)
  const [cemetery, setCemetery] = useState(seed.cemetery)
  const [landmarks, setLandmarks] = useState(seed.landmarks)
  const [point, setPoint] = useState<MapPoint | null>(graveMapPoint(seed))
  const [mapOpen, setMapOpen] = useState(false)
  const [biography, setBiography] = useState(seed.biography)
  const [keepOff, setKeepOff] = useState(seed.keepOff)
  const [choice, setChoice] = useState<FamilyChoice>(
    allowExistingFamilies ? seed.familyChoice : seed.familyChoice === 'have' ? 'none' : seed.familyChoice,
  )
  const [familyId, setFamilyId] = useState(seed.familyId || families[0]?.id || '')
  const [familyName, setFamilyName] = useState(seed.familyName)
  const [localError, setLocalError] = useState('')
  const familyReady =
    choice === 'none' || (choice === 'have' && familyId.length > 0) || (choice === 'new' && familyName.trim().length > 0)
  const ready = fullName.trim().length > 0 && city.trim().length > 0 && cemetery.trim().length > 0 && familyReady
  const onDraftChangeRef = useRef(onDraftChange)
  useEffect(() => {
    onDraftChangeRef.current = onDraftChange
  }, [onDraftChange])
  const skipFirstDraftEmit = useRef(true)

  useEffect(() => {
    if (skipFirstDraftEmit.current) {
      skipFirstDraftEmit.current = false
      return
    }
    onDraftChangeRef.current?.({
      fullName,
      birthYear,
      deathYear,
      city,
      cemetery,
      landmarks,
      latitude: point?.latitude ?? null,
      longitude: point?.longitude ?? null,
      biography,
      keepOff,
      familyChoice: choice,
      familyId,
      familyName,
      readyForAuth: false,
      savedAt: Date.now(),
    })
  }, [fullName, birthYear, deathYear, city, cemetery, landmarks, point, biography, keepOff, choice, familyId, familyName])

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
    const birth = parseGraveYear(birthYear)
    const death = parseGraveYear(deathYear)
    if (birth === undefined || death === undefined) {
      setLocalError(`Год — четыре цифры от ${graveYearMin} до ${graveYearMax}`)
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
      latitude: point ? point.latitude : null,
      longitude: point ? point.longitude : null,
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
      <View style={styles.mapBlock}>
        <Text style={styles.label}>На карте</Text>
        <Text style={styles.helpInline}>
          {point
            ? `${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}`
            : 'Необязательно, но так исполнителю проще найти участок'}
        </Text>
        <View style={styles.mapActions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              touch()
              setMapOpen(true)
            }}
            style={styles.mapButton}
          >
            <Text style={styles.mapButtonText}>{point ? 'Изменить точку' : 'Указать на карте'}</Text>
          </Pressable>
          {point ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                touch()
                setPoint(null)
              }}
              style={styles.mapClear}
            >
              <Text style={styles.mapClearText}>Убрать</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
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
        {allowExistingFamilies && families.length > 0 ? (
          <Choice label="Уже есть" selected={choice === 'have'} onPress={() => choose('have')} />
        ) : null}
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
        <Field label="Название семьи" value={familyName} onChangeText={edit(setFamilyName)} placeholder="Фамилия" maxLength={60} />
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

      <Button label={pending ? 'Сохраняем' : submitLabel} onPress={submit} disabled={!ready || pending} />
      {footer}
      {localError || error ? <Text style={styles.error}>{localError || error}</Text> : null}

      <PickGravePoint
        visible={mapOpen}
        initial={point}
        onClose={() => setMapOpen(false)}
        onPick={(next) => {
          touch()
          setPoint(next)
        }}
      />
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
  helpInline: {
    marginTop: -2,
    marginBottom: 10,
    fontFamily: sans,
    fontSize: 11,
    lineHeight: 18,
    color: theme.help,
  },
  mapBlock: {
    marginBottom: 12,
  },
  mapActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  mapButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.green,
    borderRadius: 8,
    backgroundColor: '#eef2e7',
  },
  mapButtonText: {
    fontFamily: sans,
    fontSize: 13,
    color: theme.green,
  },
  mapClear: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  mapClearText: {
    fontFamily: sans,
    fontSize: 13,
    color: theme.muted,
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
