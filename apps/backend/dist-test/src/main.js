"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const redis_io_adapter_1 = require("./modules/common/adapters/redis-io.adapter");
const swagger_1 = require("@nestjs/swagger");
const logging_interceptor_1 = require("./modules/common/interceptors/logging.interceptor");
const exceptions_filter_1 = require("./modules/common/filters/exceptions.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const logger = new common_1.Logger('Bootstrap');
    app.enableShutdownHooks();
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({
        origin: configService.get('CORS_ORIGIN', 'http://localhost:3000').split(','),
        credentials: true,
    }));
    app.use((0, compression_1.default)());
    const limiter = (0, express_rate_limit_1.default)({
        windowMs: parseInt(configService.get('RATE_LIMIT_WINDOW_MS', '900000'), 10),
        max: parseInt(configService.get('RATE_LIMIT_MAX_REQUESTS', '100'), 10),
        message: { statusCode: 429, message: 'Too many requests, please try again later.' },
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use(limiter);
    app.setGlobalPrefix(configService.get('API_PREFIX', 'api/v1'), {
        exclude: ['/health', '/metrics'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalFilters(new exceptions_filter_1.ExceptionsFilter());
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor());
    const swaggerConfig = new swagger_1.DocumentBuilder()
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
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = configService.get('PORT', 4000);
    const server = app.getHttpAdapter().getInstance();
    if (configService.get('NODE_ENV') !== 'production') {
        const { createAdapter } = await Promise.resolve().then(() => __importStar(require('@nestjs/platform-socket.io')));
        const ioAdapter = new redis_io_adapter_1.RedisIoAdapter(server);
        app.useWebSocketAdapter(ioAdapter);
        logger.log('WebSocket adapter initialized with Redis');
    }
    await app.listen(port);
    logger.log(`Application is running on: http://localhost:${port}`);
    logger.log(`API Documentation: http://localhost:${port}/api/docs`);
    logger.log(`Environment: ${configService.get('NODE_ENV', 'development')}`);
}
bootstrap().catch((error) => {
    console.error('Application failed to start:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map