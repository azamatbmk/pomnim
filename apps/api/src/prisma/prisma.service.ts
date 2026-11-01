import { Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect()
    const login = process.env.ADMIN_LOGIN?.trim()
    const password = process.env.ADMIN_PASSWORD
    if (!login || !password) throw new Error('Нужны ADMIN_LOGIN и ADMIN_PASSWORD')
    const existing = await this.owner.findUnique({ where: { login } })
    if (existing) return
    await this.owner.create({
      data: { login, passwordHash: await bcrypt.hash(password, 10) },
    })
  }
}
