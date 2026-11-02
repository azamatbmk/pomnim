import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { AppAuthGuard } from '../phone/app-auth.guard'
import { GravesController } from './graves.controller'
import { GravesService } from './graves.service'

@Module({
  imports: [AuthModule],
  controllers: [GravesController],
  providers: [GravesService, AppAuthGuard],
})
export class GravesModule {}
