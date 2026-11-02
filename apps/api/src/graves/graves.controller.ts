import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common'
import type { AppToken } from '../phone/app-auth.guard'
import { AppAuthGuard } from '../phone/app-auth.guard'
import { GravesService } from './graves.service'
import { SaveGraveDto } from './save-grave.dto'

@Controller('graves')
@UseGuards(AppAuthGuard)
export class GravesController {
  constructor(private readonly graves: GravesService) {}

  @Get()
  list(@Req() request: { user: AppToken }) {
    return this.graves.list(request.user)
  }

  @Get(':id')
  one(@Req() request: { user: AppToken }, @Param('id') id: string) {
    return this.graves.one(request.user, id)
  }

  @Post()
  create(@Req() request: { user: AppToken }, @Body() body: SaveGraveDto) {
    return this.graves.create(request.user, body)
  }

  @Patch(':id')
  update(@Req() request: { user: AppToken }, @Param('id') id: string, @Body() body: SaveGraveDto) {
    return this.graves.update(request.user, id, body)
  }

  @Delete(':id')
  remove(@Req() request: { user: AppToken }, @Param('id') id: string) {
    return this.graves.remove(request.user, id)
  }
}
