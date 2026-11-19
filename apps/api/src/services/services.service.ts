import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { isServiceIcon, otherService } from '@pomnim/shared'
import { PrismaService } from '../prisma/prisma.service'
import { SaveServiceDto } from './save-service.dto'

type ServiceRow = {
  id: string
  title: string
  description: string
  price: number
  icon: string | null
}

function toService(row: ServiceRow) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: row.price,
    icon: row.icon && isServiceIcon(row.icon) ? row.icon : null,
  }
}

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const rows = await this.prisma.service.findMany({ orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }] })
    return rows.map(toService)
  }

  async create(input: SaveServiceDto) {
    const last = await this.prisma.service.findFirst({ orderBy: { sort: 'desc' }, select: { sort: true } })
    const row = await this.prisma.service.create({
      data: { ...this.fields(input), sort: (last?.sort ?? 0) + 1 },
    })
    return toService(row)
  }

  async update(id: string, input: SaveServiceDto) {
    this.knownId(id)
    const changed = await this.prisma.service.updateMany({ where: { id }, data: this.fields(input) })
    if (changed.count !== 1) throw new NotFoundException('Услуга не найдена')
    const row = await this.prisma.service.findUnique({ where: { id } })
    if (!row) throw new NotFoundException('Услуга не найдена')
    return toService(row)
  }

  async remove(id: string) {
    this.knownId(id)
    const changed = await this.prisma.service.deleteMany({ where: { id } })
    if (changed.count !== 1) throw new NotFoundException('Услуга не найдена')
    return { ok: true as const }
  }

  async quote(serviceId: string, offered: number | null) {
    if (serviceId === otherService.id) {
      if (offered == null || !Number.isInteger(offered) || offered < 1 || offered > 1000000) {
        throw new BadRequestException(offered != null && offered > 1000000 ? 'Сумма слишком большая' : 'Назовите сумму')
      }
      return { service: otherService.id, serviceTitle: otherService.title, price: offered }
    }
    if (serviceId.length > 64) throw new BadRequestException('Выберите услугу')
    const service = await this.prisma.service.findUnique({ where: { id: serviceId } })
    if (!service) throw new BadRequestException('Выберите услугу')
    return { service: service.id, serviceTitle: service.title, price: service.price }
  }

  private knownId(id: string) {
    if (id.length < 1 || id.length > 64 || id === otherService.id) throw new NotFoundException('Услуга не найдена')
  }

  private fields(input: SaveServiceDto) {
    const title = input.title.trim()
    const description = input.description.trim()
    if (!title) throw new BadRequestException('Введите название')
    if (!description) throw new BadRequestException('Введите описание')
    const icon = input.icon && isServiceIcon(input.icon) ? input.icon : null
    return { title, description, price: input.price, icon }
  }
}
