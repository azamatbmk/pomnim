import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

type SmsAeroResponse = {
  success: boolean
  message: string | null
}

function readSmsAeroResponse(value: unknown): SmsAeroResponse | null {
  if (typeof value !== 'object' || value === null) return null
  const success = Reflect.get(value, 'success')
  const message = Reflect.get(value, 'message')
  if (typeof success !== 'boolean') return null
  if (message !== null && typeof message !== 'string') return null
  return { success, message }
}

@Injectable()
export class SmsAeroService {
  private readonly logger = new Logger(SmsAeroService.name)

  constructor(private readonly config: ConfigService) {}

  configured() {
    return Boolean(this.email() && this.apiKey())
  }

  async send(phoneE164: string, text: string) {
    const email = this.email()
    const apiKey = this.apiKey()
    if (!email || !apiKey) {
      throw new ServiceUnavailableException('СМС пока не подключены')
    }

    const number = phoneE164.replace(/\D/g, '')
    const sign = this.config.get<string>('SMS_AERO_SIGN')?.trim() || 'SMS Aero'
    const auth = Buffer.from(`${email}:${apiKey}`).toString('base64')

    let response: Response
    try {
      response = await fetch('https://gate.smsaero.ru/v2/sms/send', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ number, text, sign }),
        signal: AbortSignal.timeout(8000),
      })
    } catch (error) {
      this.logger.error('SMS Aero network error', error instanceof Error ? error.stack : String(error))
      throw new ServiceUnavailableException('Не удалось отправить СМС. Попробуйте позже.')
    }

    const raw: unknown = await response.json().catch(() => null)
    const data = readSmsAeroResponse(raw)
    if (!response.ok || !data?.success) {
      this.logger.error(`SMS Aero failed: ${response.status} ${data?.message ?? 'unknown'}`)
      throw new ServiceUnavailableException('Не удалось отправить СМС. Попробуйте позже.')
    }
  }

  private email() {
    return this.config.get<string>('SMS_AERO_EMAIL')?.trim()
  }

  private apiKey() {
    return this.config.get<string>('SMS_AERO_API_KEY')?.trim()
  }
}
