import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { OwnerOnly } from '../auth/owner.guard'
import { CreateWorkerDto } from './create-worker.dto'
import { WorkersService } from './workers.service'

@Controller('workers')
@OwnerOnly()
export class WorkersController {
  constructor(private readonly workers: WorkersService) {}

  @Get()
  list() {
    return this.workers.list()
  }

  @Post()
  create(@Body() body: CreateWorkerDto) {
    return this.workers.create(body)
  }

  @Post(':id/disable')
  disable(@Param('id') id: string) {
    return this.workers.setDisabled(id, true)
  }

  @Post(':id/enable')
  enable(@Param('id') id: string) {
    return this.workers.setDisabled(id, false)
  }
}
