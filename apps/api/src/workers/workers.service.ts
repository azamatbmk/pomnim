import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { normalizePhone, type Worker } from '@pomnim/shared'
import { PrismaService } from '../prisma/prisma.service'
import { CreateWorkerDto } from './create-worker.dto'

@Injectable()
export class WorkersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<Worker[]> {
    const rows = await this.prisma.worker.findMany({ orderBy: { createdAt: 'desc' } })
    return rows.map(toWorker)
  }

  async create(input: CreateWorkerDto): Promise<Worker> {
    const name = input.name.trim()
    const area = input.area.trim()
    const phone = normalizePhone(input.phone)
    if (!name) throw new BadRequestException('Введите имя')
    if (!area) throw new BadRequestException('Укажите город и кладбище')
    if (!phone) throw new BadRequestException('Укажите телефон в формате +7')
    try {
      const row = await this.prisma.worker.create({ data: { name, phone, area } })
      return toWorker(row)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Такой телефон уже есть')
      }
      throw error
    }
  }

  async setDisabled(id: string, disabled: boolean): Promise<Worker> {
    try {
      const row = await this.prisma.worker.update({
        where: { id },
        data: { disabledAt: disabled ? new Date() : null },
      })
      return toWorker(row)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Исполнитель не найден')
      }
      throw error
    }
  }
}

function toWorker(row: {
  id: string
  name: string
  phone: string
  area: string
  disabledAt: Date | null
  createdAt: Date
}): Worker {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    area: row.area,
    disabledAt: row.disabledAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  }
}
