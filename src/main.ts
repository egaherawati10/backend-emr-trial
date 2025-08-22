import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true
  }));

  app.enableCors({
    origin: ["http:localhost:3001"],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('EMR API')
    .setDescription('Electronic Medical Record REST API')
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'jwt',
    )
    .build();
  const doc = SwaggerModule.createDocument(app, config, { deepScanRoutes: true });
  SwaggerModule.setup('docs', app, doc, { swaggerOptions: { persistAuthorization: true } });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
