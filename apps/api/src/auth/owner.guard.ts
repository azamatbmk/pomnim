import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, UseGuards } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{ cookies?: Record<string, string> }>()
    const token = request.cookies?.pomnim_admin
    if (!token) throw new UnauthorizedException()
    try {
      const login = ownerLogin(this.jwt.verify(token))
      if (!login) throw new UnauthorizedException()
      return true
    } catch {
      throw new UnauthorizedException()
    }
  }
}

export const OwnerOnly = () => UseGuards(OwnerGuard)

function ownerLogin(payload: unknown) {
  if (typeof payload !== 'object' || payload === null) return ''
  if (typeof Reflect.get(payload, 'role') === 'string') return ''
  const login = Reflect.get(payload, 'login')
  if (typeof login !== 'string') return ''
  return login.trim()
}
