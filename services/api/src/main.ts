import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.setGlobalPrefix('api/v1');
  app.getHttpAdapter().getInstance().disable('x-powered-by');
  app.use((request: Request, response: Response, next: NextFunction) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    response.setHeader('Cross-Origin-Resource-Policy', 'same-site');
    response.setHeader('X-Request-Id', randomUUID());
    if (
      request.path.startsWith('/api/v1/identity') ||
      request.path.startsWith('/api/v1/me/') ||
      request.path.startsWith('/api/v1/enquiries')
    ) {
      response.setHeader('Cache-Control', 'no-store, private');
      response.setHeader('Pragma', 'no-cache');
    }
    next();
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  const config = app.get(ConfigService);
  const corsOrigins = config.get<string[]>('CORS_ORIGINS') ?? [];
  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : false,
    credentials: false,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    maxAge: 600,
  });

  if (config.get<string>('NODE_ENV') !== 'production') {
    const documentConfig = new DocumentBuilder()
      .setTitle('IRIFE API')
      .setDescription('Versioned API for IRIFE travel and experiences')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, documentConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  app.enableShutdownHooks();
  await app.listen(config.getOrThrow<number>('PORT'), '0.0.0.0');
}

bootstrap().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown startup failure';
  process.stderr.write(`IRIFE API startup failed: ${message}\n`);
  process.exitCode = 1;
});
