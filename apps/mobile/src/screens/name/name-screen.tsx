import { NameForm } from '../../features/save-name'
import { EntranceCopy } from '../../shared/ui/entrance-copy'
import { EntranceScreen } from '../../shared/ui/entrance-screen'

export function NameScreen() {
  return (
    <EntranceScreen
      heading={
        <EntranceCopy
          eyebrow="Первый вход"
          title="Как вас зовут"
          lead="Так к вам будут обращаться в заказах. Фамилию указывать не нужно."
        />
      }
    >
      <NameForm />
    </EntranceScreen>
  )
}
