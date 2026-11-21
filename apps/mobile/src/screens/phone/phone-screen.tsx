import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'
import { draftHasContent, readGraveDraft, writeGraveDraft } from '../../entities/grave'
import { PhoneForm } from '../../features/request-code'
import { EntranceCopy } from '../../shared/ui/entrance-copy'
import { EntranceScreen } from '../../shared/ui/entrance-screen'
import { sans, theme } from '../../shared/ui/theme'

export function PhoneScreen() {
  const router = useRouter()
  const [canEditDraft, setCanEditDraft] = useState(false)

  useEffect(() => {
    let active = true
    readGraveDraft()
      .then((draft) => {
        if (!active) return
        setCanEditDraft(Boolean(draft && (draft.readyForAuth || draftHasContent(draft))))
      })
      .catch(() => {
        if (!active) return
        setCanEditDraft(false)
      })
    return () => {
      active = false
    }
  }, [])

  async function editDraft() {
    const draft = await readGraveDraft()
    if (draft) await writeGraveDraft({ ...draft, readyForAuth: false })
    router.replace('/onboarding')
  }

  return (
    <EntranceScreen
      heading={<EntranceCopy title={'Память близко.\nДаже когда вы далеко.'} />}
      footer={
        canEditDraft ? (
          <Pressable accessibilityRole="button" onPress={() => void editDraft()} style={styles.edit}>
            <Text style={styles.editText}>Изменить карточку захоронения</Text>
          </Pressable>
        ) : null
      }
    >
      <PhoneForm />
    </EntranceScreen>
  )
}

const styles = StyleSheet.create({
  edit: {
    marginTop: 18,
    alignSelf: 'center',
    paddingVertical: 8,
  },
  editText: {
    fontFamily: sans,
    fontSize: 13,
    color: theme.green,
  },
})
