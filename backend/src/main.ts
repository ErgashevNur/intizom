import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  app.enableCors({
    origin: allowedOrigin,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('INTIZOM API')
    .setDescription('INTIZOM Telegram bot va Mini App API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`INTIZOM backend ishga tushdi: http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
