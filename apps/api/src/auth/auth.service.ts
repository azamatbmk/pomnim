import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import bcrypt from 'bcrypt'
import { PrismaService } from '../prisma/prisma.service'

const dummyHash = bcrypt.hashSync('timing-guard', 10)

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(login: string, password: string) {
    const owner = await this.prisma.owner.findUnique({ where: { login: login.trim() } })
    const hash = owner?.passwordHash ?? dummyHash
    const ok = await bcrypt.compare(password, hash)
    if (!owner || !ok) throw new UnauthorizedException('Неверный логин или пароль')
    return this.jwt.sign({ sub: owner.id, login: owner.login })
  }
}
