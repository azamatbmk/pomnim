import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

const key = 'pomnim_token'

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

export async function readToken() {
  if (Platform.OS === 'web') return webStorage().getItem(key)
  return SecureStore.getItemAsync(key)
}

export async function writeToken(token: string) {
  if (Platform.OS === 'web') {
    webStorage().setItem(key, token)
    return
  }
  await SecureStore.setItemAsync(key, token)
}

export async function clearToken() {
  if (Platform.OS === 'web') {
    webStorage().removeItem(key)
    return
  }
  await SecureStore.deleteItemAsync(key)
}
