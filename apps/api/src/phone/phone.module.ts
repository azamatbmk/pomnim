import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { AppAuthGuard } from './app-auth.guard'
import { PhoneController } from './phone.controller'
import { PhoneService } from './phone.service'
import { SmsAeroService } from './sms-aero.service'

@Module({
  imports: [AuthModule],
  controllers: [PhoneController],
  providers: [PhoneService, SmsAeroService, AppAuthGuard],
})
export class PhoneModule {}
