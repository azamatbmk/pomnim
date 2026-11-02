import { tokens } from '@pomnim/shared'
import { Platform } from 'react-native'

export const theme = {
  ...tokens,
  paperLine: '#dce2d4',
  focus: '#859c78',
  placeholder: '#a1a896',
  help: '#8b9482',
  eyebrow: '#77856d',
  lead: '#6d7867',
  danger: '#895942',
  candle: '#5b715e',
  buttonPressed: '#233d2f',
}

export const serif = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'Georgia',
})

export const sans = Platform.select({
  ios: 'Arial',
  android: 'sans-serif',
  default: 'Arial',
})
