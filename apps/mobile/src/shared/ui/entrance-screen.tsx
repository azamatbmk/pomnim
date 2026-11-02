import type { ReactNode } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Circle, Path } from 'react-native-svg'
import { BrandMark } from './brand-mark'
import { EntranceArt } from './entrance-art'
import { sans, serif, theme } from './theme'

type EntranceScreenProps = {
  children: ReactNode
}

export function EntranceScreen({ children }: EntranceScreenProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <BrandMark />
            <View>
              <Text style={styles.word}>помним</Text>
              <Text style={styles.caption}>забота о памяти</Text>
            </View>
          </View>
          <View style={styles.region}>
            <Svg width={14} height={14} viewBox="0 0 24 24">
              <Path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z" fill="none" stroke={theme.muted} strokeWidth={1.6} />
              <Circle cx={12} cy={10} r={2.5} fill="none" stroke={theme.muted} strokeWidth={1.6} />
            </Svg>
            <Text style={styles.regionText}>Северная Осетия — Алания</Text>
          </View>
          {children}
        </ScrollView>
        <EntranceArt />
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
    paddingTop: 28,
    paddingBottom: 280,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 22,
  },
  word: {
    fontFamily: serif,
    fontSize: 22,
    color: theme.ink,
    letterSpacing: -0.4,
  },
  caption: {
    marginTop: 1,
    fontFamily: sans,
    fontSize: 11,
    color: theme.muted,
  },
  region: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 28,
  },
  regionText: {
    fontFamily: sans,
    fontSize: 12,
    color: theme.muted,
  },
})
