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
      this.jwt.verify(token)
      return true
    } catch {
      throw new UnauthorizedException()
    }
  }
}

export const OwnerOnly = () => UseGuards(OwnerGuard)
