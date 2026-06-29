import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // Valide automatiquement les corps de requête via les décorateurs class-validator dans les DTOs
  app.useGlobalPipes(new ValidationPipe());

  app.enableCors();

  await app.listen(3001);
  console.log('Backend démarré sur http://localhost:3001');
}

bootstrap();
