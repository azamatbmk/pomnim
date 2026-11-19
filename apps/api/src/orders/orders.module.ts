import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { ServicesModule } from '../services/services.module'
import { AppAuthGuard } from '../phone/app-auth.guard'
import { OrdersController } from './orders.controller'
import { OrdersService } from './orders.service'

@Module({
  imports: [AuthModule, ServicesModule],
  controllers: [OrdersController],
  providers: [OrdersService, AppAuthGuard],
})
export class OrdersModule {}
