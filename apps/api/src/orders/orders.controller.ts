import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common'
import type { AppToken } from '../phone/app-auth.guard'
import { AppAuthGuard } from '../phone/app-auth.guard'
import { CreateOrderDto } from './create-order.dto'
import { OrdersService } from './orders.service'

@Controller('orders')
@UseGuards(AppAuthGuard)
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  list(@Req() request: { user: AppToken }) {
    return this.orders.list(request.user)
  }

  @Post()
  create(@Req() request: { user: AppToken }, @Body() body: CreateOrderDto) {
    return this.orders.create(request.user, body)
  }

  @Post(':id/cancel')
  cancel(@Req() request: { user: AppToken }, @Param('id') id: string) {
    return this.orders.cancel(request.user, id)
  }
}
