import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { PhoneModule } from './phone/phone.module'
import { WorkersModule } from './workers/workers.module'
import { HealthController } from './health.controller'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    PhoneModule,
    WorkersModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
