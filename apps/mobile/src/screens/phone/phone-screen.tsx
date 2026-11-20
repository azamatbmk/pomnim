import { PhoneForm } from '../../features/request-code'
import { EntranceCopy } from '../../shared/ui/entrance-copy'
import { EntranceScreen } from '../../shared/ui/entrance-screen'

export function PhoneScreen() {
  return (
    <EntranceScreen heading={<EntranceCopy title={'Память близко.\nДаже когда вы далеко.'} />}>
      <PhoneForm />
    </EntranceScreen>
  )
}
