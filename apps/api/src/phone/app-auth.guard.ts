import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import type { AppRole } from '@pomnim/shared'

export type AppToken = {
  sub: string
  role: AppRole
  phone: string
  name: string | null
}

@Injectable()
export class AppAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{ headers: { authorization?: string }; user?: AppToken }>()
    const header = request.headers.authorization
    if (!header?.startsWith('Bearer ')) throw new UnauthorizedException('Нужно войти')
    try {
      const payload = this.jwt.verify<AppToken>(header.slice(7))
      if (payload.role !== 'customer' && payload.role !== 'worker') throw new UnauthorizedException('Нужно войти')
      request.user = payload
      return true
    } catch {
      throw new UnauthorizedException('Нужно войти')
    }
  }
}
