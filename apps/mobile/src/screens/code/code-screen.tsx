import { authCodeLength, formatPhone } from '@pomnim/shared'
import { Redirect, useLocalSearchParams } from 'expo-router'
import { CodeForm } from '../../features/confirm-code'
import { EntranceCopy } from '../../shared/ui/entrance-copy'
import { EntranceScreen } from '../../shared/ui/entrance-screen'

export function CodeScreen() {
  const params = useLocalSearchParams<{ phone?: string; dev?: string }>()
  const phone = typeof params.phone === 'string' ? params.phone : ''
  const devCode = __DEV__ && typeof params.dev === 'string' ? params.dev : undefined
  if (!phone) return <Redirect href="/phone" />

  return (
    <EntranceScreen
      heading={
        <EntranceCopy
          eyebrow="Код из СМС"
          title="Введите код"
          lead={`${authCodeLength} цифр отправили на ${formatPhone(phone)}`}
        />
      }
    >
      <CodeForm phone={phone} devCode={devCode} />
    </EntranceScreen>
  )
}
