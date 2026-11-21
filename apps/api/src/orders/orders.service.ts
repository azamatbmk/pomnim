import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { otherService } from '@pomnim/shared'
import { ServicesService } from '../services/services.service'
import type { AppToken } from '../phone/app-auth.guard'
import { PrismaService } from '../prisma/prisma.service'
import { CreateOrderDto } from './create-order.dto'

const graveFields = {
  id: true,
  fullName: true,
  city: true,
  cemetery: true,
  landmarks: true,
  latitude: true,
  longitude: true,
} as const

type OrderRow = {
  id: string
  graveId: string
  service: string
  serviceTitle: string
  details: string | null
  wishes: string | null
  price: number
  desiredOn: Date
  status: string
  grave: {
    fullName: string
    city: string
    cemetery: string
    landmarks: string | null
    latitude: number | null
    longitude: number | null
  }
}

function blank(value?: string | null) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function dayString(date: Date) {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function moscowToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Moscow',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

function toOrder(row: OrderRow) {
  return {
    id: row.id,
    graveId: row.graveId,
    fullName: row.grave.fullName,
    city: row.grave.city,
    cemetery: row.grave.cemetery,
    landmarks: row.grave.landmarks,
    latitude: row.grave.latitude,
    longitude: row.grave.longitude,
    service: row.service,
    serviceTitle: row.serviceTitle || 'Услуга',
    details: row.details,
    wishes: row.wishes,
    price: row.price,
    desiredOn: dayString(row.desiredOn),
    status: row.status,
  }
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly services: ServicesService,
  ) {}

  async list(user: AppToken) {
    if (user.role === 'worker') {
      const rows = await this.prisma.order.findMany({
        where: { status: 'open' },
        orderBy: [{ desiredOn: 'asc' }, { createdAt: 'asc' }],
        include: { grave: { select: graveFields } },
      })
      return rows.map(toOrder)
    }
    if (user.role !== 'customer') throw new ForbiddenException('Нужно войти')
    const rows = await this.prisma.order.findMany({
      where: { customerId: user.sub },
      orderBy: [{ desiredOn: 'asc' }, { createdAt: 'asc' }],
      include: { grave: { select: graveFields } },
    })
    return rows.map(toOrder)
  }

  async create(user: AppToken, input: CreateOrderDto) {
    if (user.role !== 'customer') throw new ForbiddenException('Заявку отправляет семья')
    const details = blank(input.details)
    if (input.service === otherService.id && !details) throw new BadRequestException('Опишите, что нужно сделать')
    const quoted = await this.services.quote(input.service, input.price ?? null)
    const desiredOn = this.day(input.desiredOn)
    if (dayString(desiredOn) < moscowToday()) throw new BadRequestException('Эта дата уже прошла')

    const grave = await this.prisma.grave.findFirst({
      where: { id: input.graveId, customerId: user.sub },
      select: { id: true },
    })
    if (!grave) throw new NotFoundException('Карточка не найдена')

    const row = await this.prisma.order.create({
      data: {
        customerId: user.sub,
        graveId: grave.id,
        service: quoted.service,
        serviceTitle: quoted.serviceTitle,
        details: input.service === otherService.id ? details : null,
        wishes: blank(input.wishes),
        price: quoted.price,
        desiredOn,
        status: 'open',
      },
      include: { grave: { select: graveFields } },
    })
    return toOrder(row)
  }

  async cancel(user: AppToken, id: string) {
    if (user.role !== 'customer') throw new ForbiddenException('Отменить заявку может семья')
    const existing = await this.prisma.order.findFirst({
      where: { id, customerId: user.sub },
      select: { id: true },
    })
    if (!existing) throw new NotFoundException('Заявка не найдена')
    const changed = await this.prisma.order.updateMany({
      where: { id, customerId: user.sub, status: 'open' },
      data: { status: 'cancelled' },
    })
    if (changed.count !== 1) throw new BadRequestException('Заявку уже нельзя отменить')
    const row = await this.prisma.order.findFirst({
      where: { id, customerId: user.sub },
      include: { grave: { select: graveFields } },
    })
    if (!row) throw new NotFoundException('Заявка не найдена')
    return toOrder(row)
  }

  private day(value: string) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
    if (!match) throw new BadRequestException('Укажите дату')
    const year = Number(match[1])
    const month = Number(match[2])
    const day = Number(match[3])
    const date = new Date(Date.UTC(year, month - 1, day))
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
      throw new BadRequestException('Укажите дату')
    }
    return date
  }
}
