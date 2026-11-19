import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { OwnerOnly } from '../auth/owner.guard'
import { SaveServiceDto } from './save-service.dto'
import { ServicesService } from './services.service'

@Controller('services')
export class ServicesController {
  constructor(private readonly services: ServicesService) {}

  @Get()
  list() {
    return this.services.list()
  }

  @Post()
  @OwnerOnly()
  create(@Body() body: SaveServiceDto) {
    return this.services.create(body)
  }

  @Patch(':id')
  @OwnerOnly()
  update(@Param('id') id: string, @Body() body: SaveServiceDto) {
    return this.services.update(id, body)
  }

  @Delete(':id')
  @OwnerOnly()
  remove(@Param('id') id: string) {
    return this.services.remove(id)
  }
}
