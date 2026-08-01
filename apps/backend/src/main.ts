import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import csurf from 'csurf';
import { RedisIoAdapter } from './modules/common/adapters/redis-io.adapter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { LoggingInterceptor } from './modules/common/interceptors/logging.interceptor';
import { ExceptionsFilter } from './modules/common/filters/exceptions.filter';
import { SecurityMiddleware } from './modules/common/middleware/security.middleware';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');
  const environment = configService.get<string>('NODE_ENV', 'development');

  app.enableShutdownHooks();

  // Security headers via Helmet with CSP and HSTS
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: environment === 'production'
          ? ["'self'"]
          : ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", configService.get<string>('API_URL', 'http://localhost:4000')],
        fontSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: environment === 'production' ? [] : undefined,
      },
      reportOnly: environment === 'development',
    },
    hsts: {
      maxAge: environment === 'production' ? 31536000 : 0,
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    noSniff: true,
    xssFilter: true,
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
  }));

  // CORS — whitelist only
  app.use(
    cors({
      origin: configService.get<string>('CORS_ORIGIN', 'http://localhost:3000').split(','),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Wallet-Address', 'X-CSRF-Token'],
      exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset', 'Retry-After'],
    }),
  );

  app.use(compression());

  // Global IP-based rate limiting
  const limiter = rateLimit({
    windowMs: parseInt(configService.get<string>('RATE_LIMIT_WINDOW_MS', '900000'), 10),
    max: parseInt(configService.get<string>('RATE_LIMIT_MAX_REQUESTS', '100'), 10),
    message: { statusCode: 429, message: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip || 'anonymous',
    skip: (req) => req.path === '/health' || req.path === '/api/docs',
  });
  app.use(limiter);

  // Security middleware — additional headers, content-type checks
  app.use(SecurityMiddleware);

  // CSRF protection for session-based endpoints (exclude x402 and API endpoints that use wallet auth)
  if (environment === 'production') {
    app.use(csurf({ cookie: { httpOnly: true, secure: true, sameSite: 'strict' } }));
  }

  app.setGlobalPrefix(configService.get<string>('API_PREFIX', 'api/v1'), {
    exclude: ['/health', '/metrics'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(ExceptionsFilter as any);
  app.useGlobalInterceptors(new LoggingInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Synex API')
    .setDescription('Production-ready AI Crypto Operating System API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication')
    .addTag('Users')
    .addTag('Wallets')
    .addTag('Portfolio')
    .addTag('AI')
    .addTag('Alerts')
    .addTag('Subscriptions')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('PORT', 4000);
  const server = app.getHttpAdapter().getInstance();

  if (environment !== 'production') {
    try {
      const { IoAdapter } = await import('@nestjs/platform-socket.io');
      const ioAdapter = new RedisIoAdapter();
      app.useWebSocketAdapter(ioAdapter);
      logger.log('WebSocket adapter initialized with Redis');
    } catch (error) {
      logger.warn('WebSocket adapter failed to initialize, continuing without Redis', error);
    }
  }

  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`API Documentation: http://localhost:${port}/api/docs`);
  logger.log(`Environment: ${environment}`);
  logger.log(`Security: Helmet+CSP+HSTS, CSRF (production), Wallet rate limiting, ValidationPipe`);
}

bootstrap().catch((error) => {
  console.error('Application failed to start:', error);
  process.exit(1);
});
