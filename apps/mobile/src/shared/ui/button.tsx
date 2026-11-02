import { Pressable, StyleSheet, Text } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { sans, theme } from './theme'

type ButtonProps = {
  label: string
  onPress: () => void
  disabled?: boolean
}

export function Button({ label, onPress, disabled }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, disabled && styles.disabled]}
    >
      <Text style={styles.label}>{label}</Text>
      <Svg width={17} height={17} viewBox="0 0 24 24">
        <Path d="M4 12h16m-6-6 6 6-6 6" stroke="#ffffff" strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    marginTop: 12,
    borderRadius: 8,
    paddingVertical: 13,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: theme.green,
  },
  pressed: {
    backgroundColor: theme.buttonPressed,
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    color: '#ffffff',
    fontFamily: sans,
    fontSize: 13,
    fontWeight: '500',
  },
})
