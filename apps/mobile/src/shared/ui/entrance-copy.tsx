import { StyleSheet, Text, View } from 'react-native'
import { sans, serif, theme } from './theme'

type CopyProps = {
  eyebrow: string
  title: string
  lead: string
}

export function EntranceCopy({ eyebrow, title, lead }: CopyProps) {
  return (
    <View>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.lead}>{lead}</Text>
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
    marginBottom: 14,
    fontFamily: serif,
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '400',
    letterSpacing: -1.1,
    color: theme.ink,
  },
  lead: {
    maxWidth: 300,
    fontFamily: sans,
    fontSize: 13,
    lineHeight: 22,
    color: theme.lead,
  },
})
