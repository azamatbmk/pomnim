import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import cookieParser from 'cookie-parser'
import { AppModule } from './app.module'

async function bootstrap() {
  if (!process.env.JWT_SECRET) throw new Error('Нужен JWT_SECRET')

  const nodeEnv = process.env.NODE_ENV ?? 'development'
  if (nodeEnv !== 'development' && process.env.SMS_DEV_CODE?.trim()) {
    throw new Error('SMS_DEV_CODE нельзя задавать вне development')
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  if (nodeEnv === 'production') {
    app.set('trust proxy', 1)
  }
  app.setGlobalPrefix('api')
  app.use(cookieParser())
  const webOrigin = process.env.WEB_ORIGIN ?? 'http://localhost:3000'
  app.enableCors({
    origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
      const localOk = nodeEnv !== 'production' && !!origin && /^http:\/\/localhost:\d+$/.test(origin)
      if (!origin || origin === webOrigin || localOk) {
        callback(null, true)
        return
      }
      callback(new Error('Not allowed by CORS'), false)
    },
    credentials: true,
  })
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  await app.listen(process.env.PORT ?? 3001, '0.0.0.0')
}

bootstrap()
