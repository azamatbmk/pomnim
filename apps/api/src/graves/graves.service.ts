import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import type { AppToken } from '../phone/app-auth.guard'
import { PrismaService } from '../prisma/prisma.service'
import { SaveGraveDto } from './save-grave.dto'

const graveInclude = { family: { select: { name: true } } } as const

type GraveRow = {
  id: string
  fullName: string
  birthYear: number | null
  deathYear: number | null
  city: string
  cemetery: string
  landmarks: string | null
  biography: string | null
  keepOff: string | null
  familyId: string | null
  family: { name: string } | null
}

function blank(value?: string | null) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function toGrave(row: GraveRow) {
  return {
    id: row.id,
    fullName: row.fullName,
    birthYear: row.birthYear,
    deathYear: row.deathYear,
    city: row.city,
    cemetery: row.cemetery,
    landmarks: row.landmarks,
    biography: row.biography,
    keepOff: row.keepOff,
    familyId: row.familyId,
    familyName: row.family?.name ?? null,
  }
}

@Injectable()
export class GravesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: AppToken) {
    const customerId = this.customerId(user)
    const [families, graves] = await Promise.all([
      this.prisma.family.findMany({
        where: { customerId, graves: { some: {} } },
        orderBy: { name: 'asc' },
        select: { id: true, name: true },
      }),
      this.prisma.grave.findMany({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
        include: graveInclude,
      }),
    ])
    return { families, graves: graves.map(toGrave) }
  }

  async one(user: AppToken, id: string) {
    const customerId = this.customerId(user)
    const row = await this.prisma.grave.findFirst({
      where: { id, customerId },
      include: graveInclude,
    })
    if (!row) throw new NotFoundException('Карточка не найдена')
    return toGrave(row)
  }

  async create(user: AppToken, input: SaveGraveDto) {
    const customerId = this.customerId(user)
    const row = await this.write(async (tx) => {
      const data = await this.fields(tx, customerId, input)
      const created = await tx.grave.create({
        data: { customerId, ...data },
        include: graveInclude,
      })
      await this.removeEmptyFamilies(tx, customerId)
      return created
    })
    return toGrave(row)
  }

  async update(user: AppToken, id: string, input: SaveGraveDto) {
    const customerId = this.customerId(user)
    const row = await this.write(async (tx) => {
      const data = await this.fields(tx, customerId, input)
      const changed = await tx.grave.updateMany({ where: { id, customerId }, data })
      if (changed.count !== 1) throw new NotFoundException('Карточка не найдена')
      const updated = await tx.grave.findFirst({ where: { id, customerId }, include: graveInclude })
      if (!updated) throw new NotFoundException('Карточка не найдена')
      await this.removeEmptyFamilies(tx, customerId)
      return updated
    })
    return toGrave(row)
  }

  async remove(user: AppToken, id: string) {
    const customerId = this.customerId(user)
    await this.write(async (tx) => {
      const changed = await tx.grave.deleteMany({ where: { id, customerId } })
      if (changed.count !== 1) throw new NotFoundException('Карточка не найдена')
      await this.removeEmptyFamilies(tx, customerId)
      return null
    })
    return { ok: true as const }
  }

  private customerId(user: AppToken) {
    if (user.role !== 'customer') throw new ForbiddenException('Карточки могил видит только семья')
    return user.sub
  }

  private async write<T>(run: (tx: Prisma.TransactionClient) => Promise<T>) {
    try {
      return await this.prisma.$transaction(run)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return this.prisma.$transaction(run)
      }
      throw error
    }
  }

  private async fields(tx: Prisma.TransactionClient, customerId: string, input: SaveGraveDto) {
    const fullName = input.fullName.trim()
    const city = input.city.trim()
    const cemetery = input.cemetery.trim()
    if (!fullName) throw new BadRequestException('Введите имя')
    if (!city) throw new BadRequestException('Укажите населённый пункт')
    if (!cemetery) throw new BadRequestException('Укажите кладбище')
    if (input.birthYear != null && input.deathYear != null && input.deathYear < input.birthYear) {
      throw new BadRequestException('Год смерти раньше года рождения')
    }

    return {
      fullName,
      birthYear: input.birthYear ?? null,
      deathYear: input.deathYear ?? null,
      city,
      cemetery,
      landmarks: blank(input.landmarks),
      biography: blank(input.biography),
      keepOff: blank(input.keepOff),
      familyId: await this.familyId(tx, customerId, input),
    }
  }

  private async familyId(tx: Prisma.TransactionClient, customerId: string, input: SaveGraveDto) {
    const familyName = blank(input.familyName)
    const requested = blank(input.familyId)
    if (familyName) {
      const existing = await tx.family.findFirst({
        where: { customerId, name: { equals: familyName, mode: 'insensitive' } },
        select: { id: true },
      })
      if (existing) return existing.id
      const created = await tx.family.create({ data: { customerId, name: familyName } })
      return created.id
    }
    if (!requested) return null
    const family = await tx.family.findFirst({ where: { id: requested, customerId }, select: { id: true } })
    if (!family) throw new BadRequestException('Такой семьи нет')
    return family.id
  }

  private async removeEmptyFamilies(tx: Prisma.TransactionClient, customerId: string) {
    await tx.family.deleteMany({ where: { customerId, graves: { none: {} } } })
  }
}
