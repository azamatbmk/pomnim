import { StyleSheet, Text, View } from 'react-native'
import { sans, serif, theme } from './theme'

type CopyProps = {
  eyebrow?: string
  title: string
  lead?: string
}

export function EntranceCopy({ eyebrow, title, lead }: CopyProps) {
  return (
    <View>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={[styles.title, lead ? null : styles.titleLast]}>{title}</Text>
      {lead ? <Text style={styles.lead}>{lead}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  eyebrow: {
    marginBottom: 10,
    fontFamily: sans,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: theme.eyebrow,
  },
  title: {
    maxWidth: 320,
    marginBottom: 8,
    fontFamily: serif,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '400',
    letterSpacing: -1.1,
    color: theme.ink,
  },
  titleLast: {
    marginBottom: 0,
  },
  lead: {
    maxWidth: 300,
    fontFamily: sans,
    fontSize: 13,
    lineHeight: 18,
    color: theme.lead,
  },
})
