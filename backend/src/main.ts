import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('SIGO-Dental Bootstrap');
  const app = await NestFactory.create(AppModule);

  // 1. Cabeceras de Seguridad HTTP (OWASP A05)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'blob:', 'http://localhost:9000', 'https://*.amazonaws.com'],
          scriptSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  // 2. CORS Restringido
  app.enableCors({
    origin: process.env.CORS_ORIGIN || ['http://localhost:5173', 'http://localhost:3000', 'http://localhost'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 3. Validación Global de DTOs (OWASP BOPLA / Injection)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // 4. Filtro Estandarizado de Errores RFC 7807
  app.useGlobalFilters(new GlobalExceptionFilter());

  // 5. Documentación Interactiva OpenAPI / Swagger
  const config = new DocumentBuilder()
    .setTitle('SIGO-Dental API')
    .setDescription('Especificación de Endpoints del Sistema Integral de Gestión Odontológica y Expediente Clínico')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`=======================================================`);
  logger.log(`  SIGO-Dental Backend corriendo en puerto: ${port}`);
  logger.log(`  Documentación Swagger en: http://localhost:${port}/api/docs`);
  logger.log(`=======================================================`);
}

bootstrap();

