import type { ReactNode } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSession } from '../../entities/session'
import { BrandMark } from '../../shared/ui/brand-mark'
import { sans, serif, theme } from '../../shared/ui/theme'

type CabinetProps = {
  title: string
  lead?: string
  children?: ReactNode
}

export function Cabinet({ title, lead, children }: CabinetProps) {
  const { session, signOut } = useSession()

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.top}>
          <BrandMark width={18} />
          <Text style={styles.word}>помним</Text>
        </View>
        <Text style={styles.who}>{session?.name}</Text>
        <Text style={styles.phone}>{session?.phone}</Text>
        <Text style={styles.title}>{title}</Text>
        {lead ? <Text style={styles.lead}>{lead}</Text> : null}
        {children}
        <Pressable onPress={signOut} style={styles.logout}>
          <Text style={styles.logoutText}>Выйти</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 28,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 28,
  },
  word: {
    fontFamily: serif,
    fontSize: 18,
    color: theme.ink,
  },
  who: {
    fontFamily: sans,
    fontSize: 13,
    color: theme.ink,
  },
  phone: {
    marginTop: 2,
    marginBottom: 22,
    fontFamily: sans,
    fontSize: 12,
    color: theme.muted,
  },
  title: {
    fontFamily: serif,
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '400',
    letterSpacing: -1,
    color: theme.ink,
  },
  lead: {
    maxWidth: 300,
    marginTop: 12,
    fontFamily: sans,
    fontSize: 13,
    lineHeight: 22,
    color: theme.lead,
  },
  logout: {
    marginTop: 28,
  },
  logoutText: {
    fontFamily: sans,
    fontSize: 13,
    color: theme.muted,
  },
})
