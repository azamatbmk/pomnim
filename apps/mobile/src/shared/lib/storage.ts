import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

type WebStorage = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

function webStorage() {
  const storage = (globalThis as { localStorage?: WebStorage }).localStorage
  if (!storage) throw new Error('Нет хранилища')
  return storage
}

export async function readStorage(key: string) {
  if (Platform.OS === 'web') return webStorage().getItem(key)
  return AsyncStorage.getItem(key)
}

export async function writeStorage(key: string, value: string) {
  if (Platform.OS === 'web') {
    webStorage().setItem(key, value)
    return
  }
  await AsyncStorage.setItem(key, value)
}

export async function clearStorage(key: string) {
  if (Platform.OS === 'web') {
    webStorage().removeItem(key)
    return
  }
  await AsyncStorage.removeItem(key)
}
