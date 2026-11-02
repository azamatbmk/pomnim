import type { ReactNode } from 'react'
import { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BrandMark } from './brand-mark'
import { EntranceArt } from './entrance-art'
import { sans, serif, theme } from './theme'

type EntranceScreenProps = {
  heading: ReactNode
  children: ReactNode
}

const GAP = 8

export function EntranceScreen({ heading, children }: EntranceScreenProps) {
  const [viewport, setViewport] = useState({ width: 0, height: 0 })
  const [header, setHeader] = useState(0)
  const [form, setForm] = useState(0)

  const headerHeight = header || 64
  const formHeight = form || 280
  const natural = viewport.width > 0 ? Math.round((viewport.width * 360) / 560) : 0
  const free = viewport.height - 12 - headerHeight - formHeight - GAP
  const artHeight = free >= 100 ? Math.min(natural, free) : 0
  const middleRoom = viewport.height - 12 - headerHeight - artHeight
  const formFits = formHeight <= middleRoom

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View
          style={styles.flex}
          onLayout={(event) => {
            const next = {
              width: Math.round(event.nativeEvent.layout.width),
              height: Math.round(event.nativeEvent.layout.height),
            }
            setViewport((current) => (current.width === next.width && current.height === next.height ? current : next))
          }}
        >
          {viewport.height > 0 ? (
            <View style={[styles.column, { height: viewport.height }]}>
              <View style={styles.body}>
                <View
                  collapsable={false}
                  onLayout={(event) => {
                    const next = Math.round(event.nativeEvent.layout.height)
                    setHeader((current) => (current === next ? current : next))
                  }}
                >
                  <View style={styles.brand}>
                    <BrandMark width={22} />
                    <View>
                      <Text style={styles.word}>помним</Text>
                      <Text style={styles.caption}>забота о памяти</Text>
                    </View>
                  </View>
                </View>
                <ScrollView
                  style={styles.middle}
                  contentContainerStyle={[styles.middleContent, formFits ? styles.centered : null]}
                  scrollEnabled={!formFits}
                  keyboardShouldPersistTaps="handled"
                  bounces={false}
                  showsVerticalScrollIndicator={false}
                >
                  <View
                    collapsable={false}
                    onLayout={(event) => {
                      const next = Math.round(event.nativeEvent.layout.height)
                      setForm((current) => (current === next ? current : next))
                    }}
                  >
                    <View style={styles.stack}>
                      {heading}
                      {children}
                    </View>
                  </View>
                </ScrollView>
              </View>
              {artHeight > 0 ? <EntranceArt width={viewport.width} height={artHeight} /> : null}
            </View>
          ) : null}
        </View>
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
  column: {
    paddingTop: 12,
  },
  body: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 24,
  },
  middle: {
    flex: 1,
    minHeight: 0,
  },
  middleContent: {
    flexGrow: 1,
  },
  centered: {
    justifyContent: 'center',
  },
  stack: {
    gap: 20,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  word: {
    fontFamily: serif,
    fontSize: 20,
    color: theme.ink,
    letterSpacing: -0.4,
  },
  caption: {
    marginTop: 1,
    fontFamily: sans,
    fontSize: 11,
    color: theme.muted,
  },
})
