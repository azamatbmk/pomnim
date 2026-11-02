import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import type { AppToken } from './app-auth.guard'
import { AppAuthGuard } from './app-auth.guard'
import { PhoneDto, SetNameDto, VerifyCodeDto } from './phone.dto'
import { PhoneService } from './phone.service'

@Controller('auth')
export class PhoneController {
  constructor(private readonly phone: PhoneService) {}

  @Post('phone')
  requestCode(@Body() body: PhoneDto) {
    return this.phone.requestCode(body.phone)
  }

  @Post('verify')
  verify(@Body() body: VerifyCodeDto) {
    return this.phone.verify(body.phone, body.code)
  }

  @Post('name')
  @UseGuards(AppAuthGuard)
  setName(@Req() request: { user: AppToken }, @Body() body: SetNameDto) {
    return this.phone.setName(request.user.sub, request.user.role, body.name)
  }

  @Get('session')
  @UseGuards(AppAuthGuard)
  session(@Req() request: { user: AppToken }) {
    return this.phone.current(request.user.sub, request.user.role)
  }
}
