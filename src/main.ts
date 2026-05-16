import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: {
      origin: [`${process.env.FRONTEND_URL}`],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    },
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use(cookieParser());

  app.useStaticAssets(join(__dirname, '..', 'public'));

  // CORS config
  // app.enableCors({
  //   origin: [
  //     process.env.FRONTEND_URL
  //   ],
  //   credentials: true,
  //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  //   allowedHeaders: [
  //     'Origin',
  //     'X-Requested-With',
  //     'Content-Type',
  //     'Accept',
  //     'Authorization',
  //     'Cookie',
  //   ],
  //   exposedHeaders: ['Set-Cookie'],
  // });

  // Global prefix
  app.setGlobalPrefix('api');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('History Learning API')
    .setDescription('API for History Learning Website')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3333;
  await app.listen(port);
  console.log(` Application is running on: http://localhost:${port}`);
  console.log(` Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
