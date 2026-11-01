import { Body, Controller, Get, Post, Res } from '@nestjs/common'
import type { Response } from 'express'
import { AuthService } from './auth.service'
import { LoginDto } from './login.dto'
import { OwnerOnly } from './owner.guard'

const week = 7 * 24 * 60 * 60 * 1000

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) response: Response) {
    const token = await this.auth.login(body.login, body.password)
    response.cookie('pomnim_admin', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.COOKIE_SECURE === 'true',
      path: '/',
      maxAge: week,
    })
    return { ok: true }
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('pomnim_admin', { path: '/' })
    return { ok: true }
  }

  @Get('me')
  @OwnerOnly()
  me() {
    return { login: process.env.ADMIN_LOGIN }
  }
}
