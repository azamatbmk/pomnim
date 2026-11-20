import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import type { AppRole } from '@pomnim/shared'
import { PrismaService } from '../prisma/prisma.service'

export type AppToken = {
  sub: string
  role: AppRole
  phone: string
  name: string | null
}

@Injectable()
export class AppAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{ headers: { authorization?: string }; user?: AppToken }>()
    const header = request.headers.authorization
    if (!header?.startsWith('Bearer ')) throw new UnauthorizedException('Нужно войти')

    let payload: AppToken
    try {
      payload = this.jwt.verify<AppToken>(header.slice(7))
    } catch {
      throw new UnauthorizedException('Нужно войти')
    }

    if (payload.role !== 'customer' && payload.role !== 'worker') {
      throw new UnauthorizedException('Нужно войти')
    }

    if (payload.role === 'worker') {
      const worker = await this.prisma.worker.findUnique({ where: { id: payload.sub } })
      if (!worker || worker.disabledAt) throw new UnauthorizedException('Нужно войти')
    }

    request.user = payload
    return true
  }
}
