import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import bcrypt from 'bcrypt'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(login: string, password: string) {
    const owner = await this.prisma.owner.findUnique({ where: { login: login.trim() } })
    if (!owner || !(await bcrypt.compare(password, owner.passwordHash))) {
      throw new UnauthorizedException('Неверный логин или пароль')
    }
    return this.jwt.sign({ sub: owner.id, login: owner.login })
  }
}
