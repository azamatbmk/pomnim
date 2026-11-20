import { randomInt, timingSafeEqual } from 'node:crypto'
import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import {
  authCodeLength,
  authResendCooldownSec,
  formatPhone,
  normalizePhone,
  type AppRole,
  type AppSession,
  type AuthPhoneResponse,
} from '@pomnim/shared'
import { PrismaService } from '../prisma/prisma.service'
import { SmsAeroService } from './sms-aero.service'

const codeTtlMs = 5 * 60 * 1000
const resendCooldownMs = authResendCooldownSec * 1000
const maxVerifyAttempts = 5

@Injectable()
export class PhoneService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly smsAero: SmsAeroService,
  ) {}

  async requestCode(rawPhone: string): Promise<AuthPhoneResponse> {
    const phone = this.phone(rawPhone)
    const development = this.config.get<string>('NODE_ENV') === 'development'

    if (this.smsAero.configured()) {
      const code = this.generateCode()
      await this.saveCode(phone, code)
      try {
        await this.smsAero.send(phone, `Код входа «Помним»: ${code}`)
      } catch (error) {
        await this.prisma.phoneCode.deleteMany({ where: { phone } })
        throw error
      }
      return { phone: formatPhone(phone) }
    }

    if (!development) {
      throw new ServiceUnavailableException('СМС пока не подключены')
    }

    const devCode = this.config.get<string>('SMS_DEV_CODE')?.trim()
    if (!devCode || !/^\d+$/.test(devCode) || devCode.length !== authCodeLength) {
      throw new ServiceUnavailableException('СМС пока не подключены')
    }
    await this.saveCode(phone, devCode)
    return { phone: formatPhone(phone), devCode }
  }

  async verify(rawPhone: string, code: string): Promise<AppSession> {
    const phone = this.phone(rawPhone)
    const submitted = code.trim()
    const record = await this.prisma.phoneCode.findUnique({ where: { phone } })

    if (!record || record.expiresAt < new Date()) {
      if (record) await this.prisma.phoneCode.delete({ where: { phone } }).catch(() => undefined)
      throw new UnauthorizedException('Код устарел. Запросите новый.')
    }

    if (!this.codesMatch(record.code, submitted)) {
      let attempts: number
      try {
        const updated = await this.prisma.phoneCode.update({
          where: { phone },
          data: { attempts: { increment: 1 } },
        })
        attempts = updated.attempts
      } catch {
        throw new UnauthorizedException('Код устарел. Запросите новый.')
      }
      if (attempts >= maxVerifyAttempts) {
        await this.prisma.phoneCode.delete({ where: { phone } }).catch(() => undefined)
        throw new UnauthorizedException('Слишком много попыток. Запросите новый код.')
      }
      throw new UnauthorizedException('Неверный код')
    }

    const consumed = await this.prisma.phoneCode.deleteMany({
      where: { phone, code: record.code, expiresAt: { gt: new Date() } },
    })
    if (consumed.count !== 1) throw new UnauthorizedException('Код устарел. Запросите новый.')

    const worker = await this.prisma.worker.findUnique({ where: { phone } })
    if (worker) {
      if (worker.disabledAt) throw new ForbiddenException('Этот номер отключён. Напишите владельцу.')
      return this.session(worker.id, 'worker', phone, worker.name)
    }

    const customer = await this.prisma.customer.upsert({
      where: { phone },
      update: {},
      create: { phone },
    })
    return this.session(customer.id, 'customer', phone, customer.name)
  }

  async setName(userId: string, role: AppRole, name: string): Promise<AppSession> {
    if (role !== 'customer') throw new ForbiddenException('Имя уже задано')
    const trimmed = name.trim()
    if (!trimmed) throw new BadRequestException('Введите имя')
    const customer = await this.prisma.customer.update({
      where: { id: userId },
      data: { name: trimmed },
    })
    return this.session(customer.id, 'customer', customer.phone, customer.name)
  }

  async current(userId: string, role: AppRole): Promise<AppSession> {
    if (role === 'worker') {
      const worker = await this.prisma.worker.findUnique({ where: { id: userId } })
      if (!worker || worker.disabledAt) throw new UnauthorizedException('Нужно войти')
      return this.session(worker.id, 'worker', worker.phone, worker.name)
    }
    const customer = await this.prisma.customer.findUnique({ where: { id: userId } })
    if (!customer) throw new UnauthorizedException('Нужно войти')
    return this.session(customer.id, 'customer', customer.phone, customer.name)
  }

  private async saveCode(phone: string, code: string) {
    const expiresAt = new Date(Date.now() + codeTtlMs)
    const cutoff = new Date(Date.now() - resendCooldownMs)

    const refreshed = await this.prisma.phoneCode.updateMany({
      where: { phone, createdAt: { lte: cutoff } },
      data: { code, expiresAt, attempts: 0, createdAt: new Date() },
    })
    if (refreshed.count === 1) return

    const existing = await this.prisma.phoneCode.findUnique({ where: { phone } })
    if (existing) {
      const seconds = Math.max(1, Math.ceil((existing.createdAt.getTime() + resendCooldownMs - Date.now()) / 1000))
      throw new HttpException(`Подождите ${seconds} сек. перед новым кодом`, HttpStatus.TOO_MANY_REQUESTS)
    }

    try {
      await this.prisma.phoneCode.create({ data: { phone, code, expiresAt, attempts: 0 } })
    } catch {
      throw new HttpException('Подождите перед новым кодом', HttpStatus.TOO_MANY_REQUESTS)
    }
  }

  private generateCode() {
    const min = 10 ** (authCodeLength - 1)
    const max = 10 ** authCodeLength
    return String(randomInt(min, max))
  }

  private codesMatch(stored: string, submitted: string) {
    const left = Buffer.from(stored)
    const right = Buffer.from(submitted)
    if (left.length !== right.length) return false
    return timingSafeEqual(left, right)
  }

  private phone(raw: string) {
    const phone = normalizePhone(raw)
    if (!phone) throw new BadRequestException('Введите мобильный номер полностью')
    return phone
  }

  private async session(sub: string, role: AppRole, phone: string, name: string | null): Promise<AppSession> {
    const token = await this.jwt.signAsync({ sub, role, phone, name })
    return {
      token,
      role,
      phone: formatPhone(phone),
      name,
      needsName: role === 'customer' && !name,
    }
  }
}
