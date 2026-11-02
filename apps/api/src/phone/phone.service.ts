import { BadRequestException, ForbiddenException, Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { formatPhone, normalizePhone, type AppRole, type AppSession } from '@pomnim/shared'
import { PrismaService } from '../prisma/prisma.service'

const codeTtlMs = 5 * 60 * 1000

@Injectable()
export class PhoneService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async requestCode(rawPhone: string) {
    const phone = this.phone(rawPhone)
    const devCode = this.config.get<string>('SMS_DEV_CODE')?.trim()
    if (!devCode) throw new ServiceUnavailableException('СМС пока не подключены')
    const expiresAt = new Date(Date.now() + codeTtlMs)
    await this.prisma.phoneCode.deleteMany({ where: { phone } })
    await this.prisma.phoneCode.create({ data: { phone, code: devCode, expiresAt } })
    return { phone: formatPhone(phone), devCode }
  }

  async verify(rawPhone: string, code: string): Promise<AppSession> {
    const phone = this.phone(rawPhone)
    const record = await this.prisma.phoneCode.findFirst({
      where: { phone },
      orderBy: { createdAt: 'desc' },
    })
    if (!record || record.expiresAt < new Date()) throw new UnauthorizedException('Код устарел. Запросите новый.')
    if (record.code !== code.trim()) throw new UnauthorizedException('Неверный код')
    await this.prisma.phoneCode.deleteMany({ where: { phone } })

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

  private phone(raw: string) {
    const phone = normalizePhone(raw)
    if (!phone) throw new BadRequestException('Введите номер полностью')
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
