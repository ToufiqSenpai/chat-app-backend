import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  // app.useStaticAssets(path.join(__dirname, '..', 'assets'), { prefix: '/assets/' })
  app.enableCors({ origin: 'http://localhost:3000', credentials: true })
  app.use(cookieParser())
  app.useGlobalPipes(new ValidationPipe({ disableErrorMessages: true, whitelist: true }))
  // app.useGlobalGuards()

  await app.listen(8080, () => console.log('Listening on http://localhost:8080'));
}
bootstrap();
