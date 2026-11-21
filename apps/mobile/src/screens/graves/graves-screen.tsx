import { useRouter, useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSession } from '../../entities/session'
import { graveYears, listGraves, type Grave, type FamilyOption } from '../../entities/grave'
import { listOrders } from '../../entities/order'
import { ApiError } from '../../shared/api/client'
import { Button } from '../../shared/ui/button'
import { sans, serif, theme } from '../../shared/ui/theme'
import { Cabinet } from '../../widgets/cabinet'

export function GravesScreen() {
  const router = useRouter()
  const { session } = useSession()
  const [graves, setGraves] = useState<Grave[] | null>(null)
  const [families, setFamilies] = useState<FamilyOption[]>([])
  const [openGraves, setOpenGraves] = useState<string[]>([])
  const [error, setError] = useState('')

  useFocusEffect(
    useCallback(() => {
      if (!session) return
      let active = true
      listGraves(session.token)
        .then((result) => {
          if (!active) return
          setGraves(result.graves)
          setFamilies(result.families)
          setError('')
        })
        .catch((caught) => {
          if (!active) return
          setError(caught instanceof ApiError ? caught.message : 'Не получилось')
        })
      listOrders(session.token)
        .then((orders) => {
          if (!active) return
          setOpenGraves(orders.filter((order) => order.status === 'open').map((order) => order.graveId))
        })
        .catch(() => {
          if (!active) return
          setOpenGraves([])
        })
      return () => {
        active = false
      }
    }, [session]),
  )

  const loose = (graves ?? []).filter((grave) => !grave.familyId)
  const groups = families
    .map((family) => ({ ...family, graves: (graves ?? []).filter((grave) => grave.familyId === family.id) }))
    .filter((group) => group.graves.length > 0)
  const empty = graves !== null && graves.length === 0

  return (
    <Cabinet
      title="Захоронения"
      lead={
        empty
          ? 'Пока здесь пусто. Добавьте карточку, чтобы потом заказать уход.'
          : graves
            ? 'Каждое захоронение — отдельная карточка. Семья только собирает их вместе.'
            : undefined
      }
    >
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {groups.map((group) => (
        <View key={group.id} style={styles.group}>
          <Text style={styles.groupTitle}>{group.name}</Text>
          {group.graves.map((grave) => (
            <GraveRow key={grave.id} grave={grave} ordered={openGraves.includes(grave.id)} onPress={() => router.push(`/grave/${grave.id}`)} />
          ))}
        </View>
      ))}
      {loose.length > 0 && groups.length > 0 ? <Text style={styles.groupTitle}>Без семьи</Text> : null}
      {loose.map((grave) => (
        <GraveRow key={grave.id} grave={grave} ordered={openGraves.includes(grave.id)} onPress={() => router.push(`/grave/${grave.id}`)} />
      ))}
      <Button label="Добавить карточку" onPress={() => router.push('/grave/new')} />
    </Cabinet>
  )
}

function GraveRow({ grave, ordered, onPress }: { grave: Grave; ordered: boolean; onPress: () => void }) {
  const years = graveYears(grave)
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.card}>
      <Text style={styles.name}>{grave.fullName}</Text>
      {years ? <Text style={styles.meta}>{years}</Text> : null}
      <Text style={styles.meta}>
        {grave.city} · {grave.cemetery}
      </Text>
      {ordered ? <Text style={styles.ordered}>Есть заявка</Text> : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  group: {
    marginTop: 8,
  },
  groupTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontFamily: sans,
    fontSize: 12,
    fontWeight: '500',
    color: theme.muted,
  },
  card: {
    marginBottom: 10,
    padding: 16,
    backgroundColor: theme.paper,
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: 16,
  },
  name: {
    fontFamily: serif,
    fontSize: 20,
    lineHeight: 26,
    color: theme.ink,
  },
  meta: {
    marginTop: 4,
    fontFamily: sans,
    fontSize: 13,
    lineHeight: 18,
    color: theme.muted,
  },
  ordered: {
    marginTop: 8,
    fontFamily: sans,
    fontSize: 12,
    color: theme.green,
  },
  error: {
    marginTop: 12,
    fontFamily: sans,
    fontSize: 12,
    lineHeight: 18,
    color: theme.danger,
  },
})
