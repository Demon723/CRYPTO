/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/app.module.ts":
/*!***************************!*\
  !*** ./src/app.module.ts ***!
  \***************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const schedule_1 = __webpack_require__(/*! @nestjs/schedule */ "@nestjs/schedule");
const terminus_1 = __webpack_require__(/*! @nestjs/terminus */ "@nestjs/terminus");
const bullmq_1 = __webpack_require__(/*! @nestjs/bullmq */ "@nestjs/bullmq");
const prisma_module_1 = __webpack_require__(/*! ./modules/common/modules/prisma.module */ "./src/modules/common/modules/prisma.module.ts");
const redis_module_1 = __webpack_require__(/*! ./modules/common/modules/redis.module */ "./src/modules/common/modules/redis.module.ts");
const logger_module_1 = __webpack_require__(/*! ./modules/common/modules/logger.module */ "./src/modules/common/modules/logger.module.ts");
const http_module_1 = __webpack_require__(/*! ./modules/common/modules/http.module */ "./src/modules/common/modules/http.module.ts");
const auth_module_1 = __webpack_require__(/*! ./modules/auth/auth.module */ "./src/modules/auth/auth.module.ts");
const crypto_module_1 = __webpack_require__(/*! ./modules/common/modules/crypto/crypto.module */ "./src/modules/common/modules/crypto/crypto.module.ts");
const users_module_1 = __webpack_require__(/*! ./modules/users/users.module */ "./src/modules/users/users.module.ts");
const wallets_module_1 = __webpack_require__(/*! ./modules/wallets/wallets.module */ "./src/modules/wallets/wallets.module.ts");
const portfolio_module_1 = __webpack_require__(/*! ./modules/portfolio/portfolio.module */ "./src/modules/portfolio/portfolio.module.ts");
const transactions_module_1 = __webpack_require__(/*! ./modules/transactions/transactions.module */ "./src/modules/transactions/transactions.module.ts");
const ai_module_1 = __webpack_require__(/*! ./modules/ai/ai.module */ "./src/modules/ai/ai.module.ts");
const alerts_module_1 = __webpack_require__(/*! ./modules/alerts/alerts.module */ "./src/modules/alerts/alerts.module.ts");
const notifications_module_1 = __webpack_require__(/*! ./modules/notifications/notifications.module */ "./src/modules/notifications/notifications.module.ts");
const subscriptions_module_1 = __webpack_require__(/*! ./modules/subscriptions/subscriptions.module */ "./src/modules/subscriptions/subscriptions.module.ts");
const payments_module_1 = __webpack_require__(/*! ./modules/payments/payments.module */ "./src/modules/payments/payments.module.ts");
const tokens_module_1 = __webpack_require__(/*! ./modules/tokens/tokens.module */ "./src/modules/tokens/tokens.module.ts");
const nfts_module_1 = __webpack_require__(/*! ./modules/nfts/nfts.module */ "./src/modules/nfts/nfts.module.ts");
const analytics_module_1 = __webpack_require__(/*! ./modules/analytics/analytics.module */ "./src/modules/analytics/analytics.module.ts");
const health_module_1 = __webpack_require__(/*! ./modules/health/health.module */ "./src/modules/health/health.module.ts");
const governance_module_1 = __webpack_require__(/*! ./modules/governance/governance.module */ "./src/modules/governance/governance.module.ts");
const staking_module_1 = __webpack_require__(/*! ./modules/staking/staking.module */ "./src/modules/staking/staking.module.ts");
const scanner_module_1 = __webpack_require__(/*! ./modules/scanner/scanner.module */ "./src/modules/scanner/scanner.module.ts");
const referral_module_1 = __webpack_require__(/*! ./modules/referral/referral.module */ "./src/modules/referral/referral.module.ts");
const watchlist_module_1 = __webpack_require__(/*! ./modules/watchlist/watchlist.module */ "./src/modules/watchlist/watchlist.module.ts");
const websocket_module_1 = __webpack_require__(/*! ./modules/websocket/websocket.module */ "./src/modules/websocket/websocket.module.ts");
const developer_api_module_1 = __webpack_require__(/*! ./modules/developer-api/developer-api.module */ "./src/modules/developer-api/developer-api.module.ts");
const kyc_module_1 = __webpack_require__(/*! ./modules/kyc/kyc.module */ "./src/modules/kyc/kyc.module.ts");
const config_schema_1 = __webpack_require__(/*! ./modules/common/config.schema */ "./src/modules/common/config.schema.ts");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
                validate: (config) => config_schema_1.configValidationSchema.parse(config),
            }),
            schedule_1.ScheduleModule.forRoot(),
            terminus_1.TerminusModule,
            bullmq_1.BullModule.forRoot({
                connection: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: parseInt(process.env.REDIS_PORT || '6379', 10),
                    password: process.env.REDIS_PASSWORD || undefined,
                },
                defaultJobOptions: {
                    attempts: 3,
                    backoff: { type: 'exponential', delay: 1000 },
                    removeOnComplete: { count: 100, age: 24 * 3600 },
                    removeOnFail: { count: 50, age: 7 * 24 * 3600 },
                },
            }),
            prisma_module_1.PrismaModule,
            redis_module_1.RedisModule,
            logger_module_1.LoggerModule,
            http_module_1.HttpModule,
            auth_module_1.AuthModule,
            crypto_module_1.CryptoModule,
            users_module_1.UsersModule,
            wallets_module_1.WalletsModule,
            portfolio_module_1.PortfolioModule,
            transactions_module_1.TransactionsModule,
            ai_module_1.AiModule,
            alerts_module_1.AlertsModule,
            notifications_module_1.NotificationsModule,
            subscriptions_module_1.SubscriptionsModule,
            payments_module_1.PaymentsModule,
            tokens_module_1.TokensModule,
            nfts_module_1.NftsModule,
            analytics_module_1.AnalyticsModule,
            health_module_1.HealthModule,
            governance_module_1.GovernanceModule,
            staking_module_1.StakingModule,
            developer_api_module_1.DeveloperApiModule,
            scanner_module_1.ScannerModule,
            referral_module_1.ReferralModule,
            watchlist_module_1.WatchlistModule,
            websocket_module_1.WebsocketModule,
            kyc_module_1.KycModule,
        ],
    })
], AppModule);


/***/ }),

/***/ "./src/common/enums.ts":
/*!*****************************!*\
  !*** ./src/common/enums.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DeploymentStatus = exports.LogLevel = exports.StakingStatus = exports.VoteChoice = exports.RewardStatus = exports.RewardType = exports.PaymentStatus = exports.PaymentProvider = exports.InvoiceStatus = exports.SubscriptionStatus = exports.SubscriptionPlan = exports.NotificationType = exports.AlertStatus = exports.AlertType = exports.MessageRole = exports.TransactionStatus = exports.TransactionType = exports.WalletType = exports.Chain = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "USER";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
var Chain;
(function (Chain) {
    Chain["ETHEREUM"] = "ETHEREUM";
    Chain["POLYGON"] = "POLYGON";
    Chain["BSC"] = "BSC";
    Chain["ARBITRUM"] = "ARBITRUM";
    Chain["BASE"] = "BASE";
    Chain["AVALANCHE"] = "AVALANCHE";
    Chain["LXON"] = "LXON";
})(Chain || (exports.Chain = Chain = {}));
var WalletType;
(function (WalletType) {
    WalletType["EOA"] = "EOA";
    WalletType["SMART_CONTRACT"] = "SMART_CONTRACT";
    WalletType["MULTISIG"] = "MULTISIG";
})(WalletType || (exports.WalletType = WalletType = {}));
var TransactionType;
(function (TransactionType) {
    TransactionType["TRANSFER"] = "TRANSFER";
    TransactionType["SWAP"] = "SWAP";
    TransactionType["STAKE"] = "STAKE";
    TransactionType["UNSTAKE"] = "UNSTAKE";
    TransactionType["MINT"] = "MINT";
    TransactionType["BURN"] = "BURN";
    TransactionType["APPROVE"] = "APPROVE";
    TransactionType["CONTRACT_CALL"] = "CONTRACT_CALL";
    TransactionType["BRIDGE"] = "BRIDGE";
    TransactionType["NFT_TRANSFER"] = "NFT_TRANSFER";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "PENDING";
    TransactionStatus["CONFIRMED"] = "CONFIRMED";
    TransactionStatus["FAILED"] = "FAILED";
    TransactionStatus["DROPPED"] = "DROPPED";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
var MessageRole;
(function (MessageRole) {
    MessageRole["USER"] = "USER";
    MessageRole["ASSISTANT"] = "ASSISTANT";
    MessageRole["SYSTEM"] = "SYSTEM";
})(MessageRole || (exports.MessageRole = MessageRole = {}));
var AlertType;
(function (AlertType) {
    AlertType["PRICE"] = "PRICE";
    AlertType["WHALE_ACTIVITY"] = "WHALE_ACTIVITY";
    AlertType["LARGE_TRANSFER"] = "LARGE_TRANSFER";
    AlertType["RISK"] = "RISK";
    AlertType["SECURITY"] = "SECURITY";
    AlertType["BRIDGE"] = "BRIDGE";
    AlertType["GOVERNANCE"] = "GOVERNANCE";
    AlertType["STAKING"] = "STAKING";
})(AlertType || (exports.AlertType = AlertType = {}));
var AlertStatus;
(function (AlertStatus) {
    AlertStatus["ACTIVE"] = "ACTIVE";
    AlertStatus["PAUSED"] = "PAUSED";
    AlertStatus["TRIGGERED"] = "TRIGGERED";
    AlertStatus["DISABLED"] = "DISABLED";
})(AlertStatus || (exports.AlertStatus = AlertStatus = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["ALERT"] = "ALERT";
    NotificationType["SYSTEM"] = "SYSTEM";
    NotificationType["SOCIAL"] = "SOCIAL";
    NotificationType["MARKETING"] = "MARKETING";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var SubscriptionPlan;
(function (SubscriptionPlan) {
    SubscriptionPlan["FREE"] = "FREE";
    SubscriptionPlan["BASIC"] = "BASIC";
    SubscriptionPlan["PRO"] = "PRO";
    SubscriptionPlan["ENTERPRISE"] = "ENTERPRISE";
})(SubscriptionPlan || (exports.SubscriptionPlan = SubscriptionPlan = {}));
var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["ACTIVE"] = "ACTIVE";
    SubscriptionStatus["CANCELED"] = "CANCELED";
    SubscriptionStatus["EXPIRED"] = "EXPIRED";
    SubscriptionStatus["PAST_DUE"] = "PAST_DUE";
})(SubscriptionStatus || (exports.SubscriptionStatus = SubscriptionStatus = {}));
var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["DRAFT"] = "DRAFT";
    InvoiceStatus["OPEN"] = "OPEN";
    InvoiceStatus["PAID"] = "PAID";
    InvoiceStatus["VOID"] = "VOID";
    InvoiceStatus["UNCOLLECTIBLE"] = "UNCOLLECTIBLE";
})(InvoiceStatus || (exports.InvoiceStatus = InvoiceStatus = {}));
var PaymentProvider;
(function (PaymentProvider) {
    PaymentProvider["RAZORPAY"] = "RAZORPAY";
    PaymentProvider["STRIPE"] = "STRIPE";
    PaymentProvider["CRYPTO"] = "CRYPTO";
})(PaymentProvider || (exports.PaymentProvider = PaymentProvider = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["SUCCEEDED"] = "SUCCEEDED";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["CANCELED"] = "CANCELED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var RewardType;
(function (RewardType) {
    RewardType["REFERRAL_FIRST"] = "REFERRAL_FIRST";
    RewardType["REFERRAL_SUBSCRIPTION"] = "REFERRAL_SUBSCRIPTION";
    RewardType["STAKING_BONUS"] = "STAKING_BONUS";
    RewardType["COMMUNITY"] = "COMMUNITY";
})(RewardType || (exports.RewardType = RewardType = {}));
var RewardStatus;
(function (RewardStatus) {
    RewardStatus["PENDING"] = "PENDING";
    RewardStatus["CLAIMABLE"] = "CLAIMABLE";
    RewardStatus["CLAIMED"] = "CLAIMED";
    RewardStatus["EXPIRED"] = "EXPIRED";
})(RewardStatus || (exports.RewardStatus = RewardStatus = {}));
var VoteChoice;
(function (VoteChoice) {
    VoteChoice["FOR"] = "FOR";
    VoteChoice["AGAINST"] = "AGAINST";
    VoteChoice["ABSTAIN"] = "ABSTAIN";
})(VoteChoice || (exports.VoteChoice = VoteChoice = {}));
var StakingStatus;
(function (StakingStatus) {
    StakingStatus["ACTIVE"] = "ACTIVE";
    StakingStatus["UNSTAKING"] = "UNSTAKING";
    StakingStatus["COMPLETED"] = "COMPLETED";
    StakingStatus["CANCELLED"] = "CANCELLED";
})(StakingStatus || (exports.StakingStatus = StakingStatus = {}));
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "ERROR";
    LogLevel["WARN"] = "WARN";
    LogLevel["INFO"] = "INFO";
    LogLevel["DEBUG"] = "DEBUG";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
var DeploymentStatus;
(function (DeploymentStatus) {
    DeploymentStatus["PENDING"] = "PENDING";
    DeploymentStatus["DEPLOYING"] = "DEPLOYING";
    DeploymentStatus["DEPLOYED"] = "DEPLOYED";
    DeploymentStatus["FAILED"] = "FAILED";
    DeploymentStatus["CANCELLED"] = "CANCELLED";
})(DeploymentStatus || (exports.DeploymentStatus = DeploymentStatus = {}));


/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const app_module_1 = __webpack_require__(/*! ./app.module */ "./src/app.module.ts");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const helmet_1 = __importDefault(__webpack_require__(/*! helmet */ "helmet"));
const cors_1 = __importDefault(__webpack_require__(/*! cors */ "cors"));
const compression_1 = __importDefault(__webpack_require__(/*! compression */ "compression"));
const express_rate_limit_1 = __importDefault(__webpack_require__(/*! express-rate-limit */ "express-rate-limit"));
const redis_io_adapter_1 = __webpack_require__(/*! ./modules/common/adapters/redis-io.adapter */ "./src/modules/common/adapters/redis-io.adapter.ts");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const logging_interceptor_1 = __webpack_require__(/*! ./modules/common/interceptors/logging.interceptor */ "./src/modules/common/interceptors/logging.interceptor.ts");
const exceptions_filter_1 = __webpack_require__(/*! ./modules/common/filters/exceptions.filter */ "./src/modules/common/filters/exceptions.filter.ts");
const security_middleware_1 = __webpack_require__(/*! ./modules/common/middleware/security.middleware */ "./src/modules/common/middleware/security.middleware.ts");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const logger = new common_1.Logger('Bootstrap');
    const environment = configService.get('NODE_ENV', 'development');
    app.enableShutdownHooks();
    const cspDirectives = {
        defaultSrc: ["'self'"],
        scriptSrc: environment === 'production'
            ? ["'self'"]
            : ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", configService.get('API_URL', 'http://localhost:4000')],
        fontSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        formAction: ["'self'"],
    };
    if (environment === 'production') {
        cspDirectives.upgradeInsecureRequests = [];
    }
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: cspDirectives,
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
    app.use((0, cors_1.default)({
        origin: configService.get('CORS_ORIGIN', 'http://localhost:3000').split(','),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Wallet-Address', 'X-CSRF-Token'],
        exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset', 'Retry-After'],
    }));
    app.use((0, compression_1.default)());
    const limiter = (0, express_rate_limit_1.default)({
        windowMs: parseInt(configService.get('RATE_LIMIT_WINDOW_MS', '900000'), 10),
        max: parseInt(configService.get('RATE_LIMIT_MAX_REQUESTS', '100'), 10),
        message: { statusCode: 429, message: 'Too many requests, please try again later.' },
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => req.ip || 'anonymous',
        skip: (req) => req.path === '/health' || req.path === '/api/docs',
    });
    app.use(limiter);
    app.use(security_middleware_1.securityMiddleware);
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
    app.useGlobalFilters(exceptions_filter_1.ExceptionsFilter);
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
    const host = configService.get('HOST', '0.0.0.0');
    try {
        const { IoAdapter } = await Promise.resolve().then(() => __importStar(__webpack_require__(/*! @nestjs/platform-socket.io */ "@nestjs/platform-socket.io")));
        const ioAdapter = new redis_io_adapter_1.RedisIoAdapter();
        app.useWebSocketAdapter(ioAdapter);
        logger.log('WebSocket adapter initialized with Redis');
    }
    catch (error) {
        logger.warn('WebSocket adapter failed to initialize, continuing without Redis', error);
    }
    await app.listen(port, host);
    logger.log(`Application is running on: http://localhost:${port}`);
    logger.log(`API Documentation: http://localhost:${port}/api/docs`);
    logger.log(`Environment: ${environment}`);
    logger.log(`Security: Helmet+CSP+HSTS, CSRF (production), Wallet rate limiting, ValidationPipe`);
}
bootstrap().catch((error) => {
    console.error('Application failed to start:', error);
    process.exit(1);
});


/***/ }),

/***/ "./src/modules/ai/ai.module.ts":
/*!*************************************!*\
  !*** ./src/modules/ai/ai.module.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AiModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_module_1 = __webpack_require__(/*! ../common/modules/prisma.module */ "./src/modules/common/modules/prisma.module.ts");
const http_module_1 = __webpack_require__(/*! ../common/modules/http.module */ "./src/modules/common/modules/http.module.ts");
const logger_module_1 = __webpack_require__(/*! ../common/modules/logger.module */ "./src/modules/common/modules/logger.module.ts");
const auth_module_1 = __webpack_require__(/*! ../auth/auth.module */ "./src/modules/auth/auth.module.ts");
const wallets_module_1 = __webpack_require__(/*! ../wallets/wallets.module */ "./src/modules/wallets/wallets.module.ts");
const ai_service_1 = __webpack_require__(/*! ./services/ai.service */ "./src/modules/ai/services/ai.service.ts");
const transaction_builder_service_1 = __webpack_require__(/*! ./services/transaction-builder.service */ "./src/modules/ai/services/transaction-builder.service.ts");
const conversation_service_1 = __webpack_require__(/*! ./services/conversation.service */ "./src/modules/ai/services/conversation.service.ts");
const ai_controller_1 = __webpack_require__(/*! ./controllers/ai.controller */ "./src/modules/ai/controllers/ai.controller.ts");
let AiModule = class AiModule {
};
exports.AiModule = AiModule;
exports.AiModule = AiModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, http_module_1.HttpModule, logger_module_1.LoggerModule, auth_module_1.AuthModule, wallets_module_1.WalletsModule],
        controllers: [ai_controller_1.AiController],
        providers: [ai_service_1.AiService, conversation_service_1.ConversationService, transaction_builder_service_1.TransactionBuilderService],
        exports: [ai_service_1.AiService, conversation_service_1.ConversationService, transaction_builder_service_1.TransactionBuilderService],
    })
], AiModule);


/***/ }),

/***/ "./src/modules/ai/controllers/ai.controller.ts":
/*!*****************************************************!*\
  !*** ./src/modules/ai/controllers/ai.controller.ts ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AiController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const ai_service_1 = __webpack_require__(/*! ../services/ai.service */ "./src/modules/ai/services/ai.service.ts");
const transaction_builder_service_1 = __webpack_require__(/*! ../services/transaction-builder.service */ "./src/modules/ai/services/transaction-builder.service.ts");
const conversation_service_1 = __webpack_require__(/*! ../services/conversation.service */ "./src/modules/ai/services/conversation.service.ts");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../common/guards/jwt-auth.guard */ "./src/modules/common/guards/jwt-auth.guard.ts");
const current_user_decorator_1 = __webpack_require__(/*! ../../common/decorators/current-user.decorator */ "./src/modules/common/decorators/current-user.decorator.ts");
const roles_decorator_1 = __webpack_require__(/*! ../../common/decorators/roles.decorator */ "./src/modules/common/decorators/roles.decorator.ts");
const roles_guard_1 = __webpack_require__(/*! ../../common/guards/roles.guard */ "./src/modules/common/guards/roles.guard.ts");
const enums_1 = __webpack_require__(/*! ../../../common/enums */ "./src/common/enums.ts");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const parse_pagination_pipe_1 = __webpack_require__(/*! ../../common/pipes/parse-pagination.pipe */ "./src/modules/common/pipes/parse-pagination.pipe.ts");
let AiController = class AiController {
    constructor(aiService, conversationService, transactionBuilderService) {
        this.aiService = aiService;
        this.conversationService = conversationService;
        this.transactionBuilderService = transactionBuilderService;
    }
    async chat(userId, body) {
        return this.aiService.chat(userId, body.message, body.chatId, body.context);
    }
    streamChat(userId, body) {
        return new Promise((resolve) => {
            const tokens = [];
            this.aiService.streamChat(userId, body.message, body.chatId, (token) => {
                tokens.push(token);
            }, body.context);
            resolve({
                async *[Symbol.asyncIterator]() {
                    for (const token of tokens) {
                        yield `data: ${token}\n\n`;
                    }
                    yield 'data: [DONE]\n\n';
                },
            });
        });
    }
    getConversations(userId, query) {
        return this.conversationService.getUserConversations(userId, query.page, query.limit);
    }
    getConversation(userId, chatId) {
        return this.conversationService.getConversation(userId, chatId);
    }
    deleteConversation(userId, chatId) {
        return this.conversationService.deleteConversation(userId, chatId);
    }
    analyzePortfolio(userId) {
        return this.aiService.analyzePortfolio(userId);
    }
    explainTransaction(userId, hash) {
        return this.aiService.explainTransaction(userId, hash);
    }
    detectScam(body) {
        return this.aiService.detectScam(body.address, body.chain);
    }
    parseTransactionIntent(userId, body) {
        return this.transactionBuilderService.parseNaturalLanguage(body.message);
    }
    async buildTransaction(userId, body) {
        const intent = await this.transactionBuilderService.parseNaturalLanguage(body.message);
        return this.transactionBuilderService.buildTransaction(userId, intent);
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Post)('chat'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Send a message to AI assistant' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'AI response generated' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "chat", null);
__decorate([
    (0, common_1.Sse)('chat/stream'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Stream AI chat responses (Server-Sent Events)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Streaming AI response', content: { 'text/event-stream': {} } }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "streamChat", null);
__decorate([
    (0, common_1.Get)('conversations'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, common_1.UsePipes)(parse_pagination_pipe_1.ParsePaginationPipe),
    (0, swagger_1.ApiOperation)({ summary: 'Get user conversation history' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Conversations retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "getConversations", null);
__decorate([
    (0, common_1.Get)('conversations/:chatId'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get specific conversation with messages' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Conversation retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Conversation not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('chatId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "getConversation", null);
__decorate([
    (0, common_1.Delete)('conversations/:chatId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete conversation' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Conversation deleted' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('chatId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "deleteConversation", null);
__decorate([
    (0, common_1.Post)('analyze-portfolio'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'AI-powered portfolio analysis' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Portfolio analysis generated' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "analyzePortfolio", null);
__decorate([
    (0, common_1.Post)('explain-transaction/:hash'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'AI explanation of a transaction' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transaction explanation generated' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('hash')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "explainTransaction", null);
__decorate([
    (0, common_1.Post)('detect-scam'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'AI scam detection for an address' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Scam analysis generated' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "detectScam", null);
__decorate([
    (0, common_1.Post)('transaction/intent'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Parse natural language transaction intent' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transaction intent parsed' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "parseTransactionIntent", null);
__decorate([
    (0, common_1.Post)('transaction/build'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Build transaction from natural language' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transaction preview generated' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "buildTransaction", null);
exports.AiController = AiController = __decorate([
    (0, swagger_1.ApiTags)('AI'),
    (0, common_1.Controller)('ai'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [typeof (_a = typeof ai_service_1.AiService !== "undefined" && ai_service_1.AiService) === "function" ? _a : Object, typeof (_b = typeof conversation_service_1.ConversationService !== "undefined" && conversation_service_1.ConversationService) === "function" ? _b : Object, typeof (_c = typeof transaction_builder_service_1.TransactionBuilderService !== "undefined" && transaction_builder_service_1.TransactionBuilderService) === "function" ? _c : Object])
], AiController);


/***/ }),

/***/ "./src/modules/ai/services/ai.service.ts":
/*!***********************************************!*\
  !*** ./src/modules/ai/services/ai.service.ts ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AiService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const prisma_service_1 = __webpack_require__(/*! ../../common/modules/prisma.service */ "./src/modules/common/modules/prisma.service.ts");
const http_service_1 = __webpack_require__(/*! ../../common/modules/http.service */ "./src/modules/common/modules/http.service.ts");
const openai_1 = __webpack_require__(/*! @langchain/openai */ "@langchain/openai");
const messages_1 = __webpack_require__(/*! @langchain/core/messages */ "@langchain/core/messages");
const conversation_service_1 = __webpack_require__(/*! ./conversation.service */ "./src/modules/ai/services/conversation.service.ts");
const logger_service_1 = __webpack_require__(/*! ../../common/modules/logger.service */ "./src/modules/common/modules/logger.service.ts");
let AiService = class AiService {
    constructor(configService, prisma, httpService, conversationService) {
        this.configService = configService;
        this.prisma = prisma;
        this.httpService = httpService;
        this.conversationService = conversationService;
        this.logger = new logger_service_1.LoggerService();
        const openAIApiKey = this.configService.get('OPENAI_API_KEY');
        if (openAIApiKey) {
            this.chatModel = new openai_1.ChatOpenAI({
                openAIApiKey,
                modelName: this.configService.get('OPENAI_MODEL', 'gpt-4-turbo-preview'),
                temperature: 0.7,
                streaming: true,
            });
        }
        else {
            this.chatModel = null;
        }
    }
    async chat(userId, message, chatId, context) {
        if (!this.chatModel) {
            throw new common_1.BadRequestException('AI service is not configured. Please set OPENAI_API_KEY environment variable.');
        }
        const conversation = await this.conversationService.getOrCreateConversation(userId, chatId);
        const systemPrompt = this.buildSystemPrompt(context);
        const messages = await this.conversationService.getRecentMessages(conversation.id, 20);
        const chatHistory = messages.map((m) => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
        }));
        const fullMessages = [
            new messages_1.SystemMessage(systemPrompt),
            ...chatHistory.map((m) => m.role === 'user' ? new messages_1.HumanMessage(m.content) : new messages_1.AIMessage(m.content)),
            new messages_1.HumanMessage(message),
        ];
        const response = await this.chatModel.invoke(fullMessages);
        await this.conversationService.addMessage(conversation.id, 'user', message);
        await this.conversationService.addMessage(conversation.id, 'assistant', response.content);
        return {
            chatId: conversation.id,
            response: response.content,
        };
    }
    async streamChat(userId, message, chatId, onToken, context) {
        if (!this.chatModel) {
            throw new common_1.BadRequestException('AI service is not configured. Please set OPENAI_API_KEY environment variable.');
        }
        const conversation = await this.conversationService.getOrCreateConversation(userId, chatId);
        const systemPrompt = this.buildSystemPrompt(context);
        const messages = await this.conversationService.getRecentMessages(conversation.id, 20);
        const chatHistory = messages.map((m) => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
        }));
        const fullMessages = [
            new messages_1.SystemMessage(systemPrompt),
            ...chatHistory.map((m) => m.role === 'user' ? new messages_1.HumanMessage(m.content) : new messages_1.AIMessage(m.content)),
            new messages_1.HumanMessage(message),
        ];
        let fullResponse = '';
        await this.chatModel.invoke(fullMessages, {
            callbacks: [
                {
                    handleLLMNewToken: async (token) => {
                        fullResponse += token;
                        if (onToken)
                            onToken(token);
                    },
                },
            ],
        });
        await this.conversationService.addMessage(conversation.id, 'user', message);
        await this.conversationService.addMessage(conversation.id, 'assistant', fullResponse);
        return {
            chatId: conversation.id,
            response: fullResponse,
        };
    }
    async analyzePortfolio(userId) {
        if (!this.chatModel) {
            throw new common_1.BadRequestException('AI service is not configured. Please set OPENAI_API_KEY environment variable.');
        }
        const wallets = await this.prisma.wallet.findMany({
            where: { userId, isActive: true },
            include: {
                balances: true,
            },
        });
        const totalValueUsd = wallets.reduce((sum, w) => {
            return (sum +
                w.balances.reduce((balSum, b) => balSum + parseFloat(b.balanceUsd?.toString() || '0'), 0));
        }, 0);
        const portfolioData = {
            totalWallets: wallets.length,
            totalValueUsd: totalValueUsd.toFixed(2),
            topTokens: wallets
                .flatMap((w) => w.balances)
                .sort((a, b) => parseFloat(b.balanceUsd?.toString() || '0') - parseFloat(a.balanceUsd?.toString() || '0'))
                .slice(0, 10)
                .map((b) => ({
                symbol: b.symbol,
                name: b.name,
                balance: b.balance,
                valueUsd: b.balanceUsd?.toString(),
                change24h: b.change24h?.toString(),
            })),
        };
        const prompt = `Analyze this crypto portfolio and provide insights:
${JSON.stringify(portfolioData, null, 2)}

Provide:
1. Overall portfolio health assessment
2. Diversification analysis
3. Risk assessment
4. Top 3 recommendations
5. Any red flags`;
        const response = await this.chatModel.invoke([
            new messages_1.SystemMessage('You are a crypto portfolio analyst. Provide concise, actionable insights.'),
            new messages_1.HumanMessage(prompt),
        ]);
        return {
            portfolio: portfolioData,
            analysis: response.content,
        };
    }
    async explainTransaction(userId, transactionHash) {
        if (!this.chatModel) {
            throw new common_1.BadRequestException('AI service is not configured. Please set OPENAI_API_KEY environment variable.');
        }
        const transaction = await this.prisma.transaction.findFirst({
            where: { userId, hash: transactionHash },
            include: { wallet: true },
        });
        if (!transaction) {
            throw new common_1.BadRequestException('Transaction not found');
        }
        const prompt = `Explain this blockchain transaction in plain English:
${JSON.stringify(transaction, null, 2)}

Provide:
1. What happened
2. Why it matters
3. Risk level (low/medium/high)
4. Any security concerns`;
        const response = await this.chatModel.invoke([
            new messages_1.SystemMessage('You are a crypto transaction analyst. Explain complex transactions simply.'),
            new messages_1.HumanMessage(prompt),
        ]);
        return {
            transaction,
            explanation: response.content,
        };
    }
    async detectScam(address, chain) {
        if (!this.chatModel) {
            throw new common_1.BadRequestException('AI service is not configured. Please set OPENAI_API_KEY environment variable.');
        }
        const prompt = `Analyze this crypto address for potential scam indicators:
Address: ${address}
Chain: ${chain}

Check for:
1. Known scam patterns
2. Suspicious contract behavior
3. High-risk indicators
4. Provide a risk score (1-10) and recommendation`;
        const response = await this.chatModel.invoke([
            new messages_1.SystemMessage('You are a crypto security analyst specializing in scam detection. Be thorough but concise.'),
            new messages_1.HumanMessage(prompt),
        ]);
        return {
            address,
            chain,
            analysis: response.content,
        };
    }
    buildSystemPrompt(context) {
        let prompt = `You are Synex, an intelligent crypto operating system assistant.

You help users with:
- Portfolio analysis and management
- Transaction explanations
- Token research and analysis
- Scam detection
- Market insights
- Smart contract analysis
- DeFi strategies

Always provide accurate, helpful information. If you don't know something, say so.
Never provide financial advice. Always remind users to do their own research (DYOR).
Be concise but thorough. Use markdown formatting for readability.`;
        if (context?.chain) {
            prompt += `\n\nCurrent chain context: ${context.chain}`;
        }
        if (context?.walletAddress) {
            prompt += `\nCurrent wallet: ${context.walletAddress}`;
        }
        return prompt;
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _b : Object, typeof (_c = typeof http_service_1.HttpService !== "undefined" && http_service_1.HttpService) === "function" ? _c : Object, typeof (_d = typeof conversation_service_1.ConversationService !== "undefined" && conversation_service_1.ConversationService) === "function" ? _d : Object])
], AiService);


/***/ }),

/***/ "./src/modules/ai/services/conversation.service.ts":
/*!*********************************************************!*\
  !*** ./src/modules/ai/services/conversation.service.ts ***!
  \*********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ConversationService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../common/modules/prisma.service */ "./src/modules/common/modules/prisma.service.ts");
const logger_service_1 = __webpack_require__(/*! ../../common/modules/logger.service */ "./src/modules/common/modules/logger.service.ts");
let ConversationService = class ConversationService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new logger_service_1.LoggerService();
    }
    async getOrCreateConversation(userId, chatId) {
        if (chatId) {
            const conversation = await this.prisma.chat.findFirst({
                where: { id: chatId, userId },
            });
            if (conversation) {
                return conversation;
            }
        }
        return this.prisma.chat.create({
            data: {
                userId,
                title: 'New Conversation',
                isActive: true,
            },
        });
    }
    async getConversation(userId, chatId) {
        const conversation = await this.prisma.chat.findFirst({
            where: { id: chatId, userId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                    take: 50,
                },
            },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        return conversation;
    }
    async getUserConversations(userId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const [conversations, total] = await Promise.all([
            this.prisma.chat.findMany({
                where: { userId, isActive: true },
                orderBy: { updatedAt: 'desc' },
                skip: offset,
                take: limit,
                select: {
                    id: true,
                    title: true,
                    createdAt: true,
                    updatedAt: true,
                    _count: { select: { messages: true } },
                },
            }),
            this.prisma.chat.count({ where: { userId, isActive: true } }),
        ]);
        return {
            data: conversations,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async addMessage(chatId, role, content) {
        const message = await this.prisma.message.create({
            data: {
                chatId,
                role,
                content,
            },
        });
        await this.prisma.chat.update({
            where: { id: chatId },
            data: { updatedAt: new Date() },
        });
        return message;
    }
    async getRecentMessages(chatId, limit = 20) {
        return this.prisma.message.findMany({
            where: { chatId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    async deleteConversation(userId, chatId) {
        const conversation = await this.prisma.chat.findFirst({
            where: { id: chatId, userId },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        await this.prisma.chat.update({
            where: { id: chatId },
            data: { isActive: false },
        });
        this.logger.log(`Conversation deleted: ${chatId}`, 'ConversationService');
    }
    async updateConversationTitle(userId, chatId, title) {
        const conversation = await this.prisma.chat.findFirst({
            where: { id: chatId, userId },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        return this.prisma.chat.update({
            where: { id: chatId },
            data: { title },
        });
    }
};
exports.ConversationService = ConversationService;
exports.ConversationService = ConversationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], ConversationService);


/***/ }),

/***/ "./src/modules/ai/services/transaction-builder.service.ts":
/*!****************************************************************!*\
  !*** ./src/modules/ai/services/transaction-builder.service.ts ***!
  \****************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TransactionBuilderService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const wallet_entity_1 = __webpack_require__(/*! ../../wallets/entities/wallet.entity */ "./src/modules/wallets/entities/wallet.entity.ts");
let TransactionBuilderService = class TransactionBuilderService {
    async parseNaturalLanguage(input) {
        const lower = input.toLowerCase().trim();
        const sendMatch = lower.match(/send\s+([0-9.,]+\s*[a-zA-Z]*)\s+(?:to\s+)?(.+)/);
        if (sendMatch) {
            return {
                action: 'send',
                amount: sendMatch[1].trim(),
                toAddress: this.extractAddress(sendMatch[2]),
                confidence: 0.8,
            };
        }
        const swapMatch = lower.match(/swap\s+([0-9.,]+\s*[a-zA-Z]*)\s+(?:for|to)\s+([a-zA-Z]+)/i);
        if (swapMatch) {
            return {
                action: 'swap',
                amount: swapMatch[1].trim(),
                token: swapMatch[2].trim().toUpperCase(),
                confidence: 0.7,
            };
        }
        const stakeMatch = lower.match(/stake\s+([0-9.,]+\s*[a-zA-Z]*)/i);
        if (stakeMatch) {
            return {
                action: 'stake',
                amount: stakeMatch[1].trim(),
                confidence: 0.7,
            };
        }
        const bridgeMatch = lower.match(/bridge\s+([0-9.,]+\s*[a-zA-Z]*)\s+from\s+(\w+)\s+to\s+(\w+)/i);
        if (bridgeMatch) {
            return {
                action: 'bridge',
                amount: bridgeMatch[1].trim(),
                fromChain: this.normalizeChain(bridgeMatch[2]),
                toChain: this.normalizeChain(bridgeMatch[3]),
                confidence: 0.6,
            };
        }
        return {
            action: 'unknown',
            confidence: 0,
        };
    }
    async buildTransaction(userId, intent) {
        if (intent.action === 'unknown') {
            throw new common_1.BadRequestException('Could not understand transaction intent. Try: "Send 0.1 ETH to 0x..."');
        }
        const preview = {
            action: intent.action,
            confidence: intent.confidence,
            requiresConfirmation: intent.confidence < 0.9,
            estimatedGas: '0.002 ETH',
        };
        const warnings = [];
        if (intent.confidence < 0.9) {
            warnings.push('Low confidence parsing. Please review the transaction details carefully.');
        }
        if (intent.action === 'send') {
            preview.amount = intent.amount || '0';
            preview.to = intent.toAddress || 'unknown';
            preview.token = intent.token || 'ETH';
        }
        else if (intent.action === 'swap') {
            preview.fromAmount = intent.amount || '0';
            preview.toToken = intent.token || 'UNKNOWN';
        }
        else if (intent.action === 'stake') {
            preview.amount = intent.amount || '0';
            preview.token = 'LXON';
        }
        else if (intent.action === 'bridge') {
            preview.amount = intent.amount || '0';
            preview.fromChain = intent.fromChain || 'ETHEREUM';
            preview.toChain = intent.toChain || 'UNKNOWN';
        }
        return { preview, requiresConfirmation: intent.confidence < 0.9, warnings };
    }
    extractAddress(text) {
        const ethAddress = text.match(/0x[a-fA-F0-9]{40}/);
        if (ethAddress)
            return ethAddress[0];
        return text.trim();
    }
    normalizeChain(name) {
        const map = {
            ethereum: wallet_entity_1.Chain.ETHEREUM,
            polygon: wallet_entity_1.Chain.POLYGON,
            bsc: wallet_entity_1.Chain.BSC,
            arbitrum: wallet_entity_1.Chain.ARBITRUM,
            base: wallet_entity_1.Chain.BASE,
            avalanche: wallet_entity_1.Chain.AVALANCHE,
            lxon: wallet_entity_1.Chain.LXON,
        };
        return map[name.toLowerCase()];
    }
};
exports.TransactionBuilderService = TransactionBuilderService;
exports.TransactionBuilderService = TransactionBuilderService = __decorate([
    (0, common_1.Injectable)()
], TransactionBuilderService);


/***/ }),

/***/ "./src/modules/alerts/alerts.module.ts":
/*!*********************************************!*\
  !*** ./src/modules/alerts/alerts.module.ts ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AlertsModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_module_1 = __webpack_require__(/*! ../common/modules/prisma.module */ "./src/modules/common/modules/prisma.module.ts");
const redis_module_1 = __webpack_require__(/*! ../common/modules/redis.module */ "./src/modules/common/modules/redis.module.ts");
const logger_module_1 = __webpack_require__(/*! ../common/modules/logger.module */ "./src/modules/common/modules/logger.module.ts");
const auth_module_1 = __webpack_require__(/*! ../auth/auth.module */ "./src/modules/auth/auth.module.ts");
const notifications_module_1 = __webpack_require__(/*! ../notifications/notifications.module */ "./src/modules/notifications/notifications.module.ts");
const alerts_service_1 = __webpack_require__(/*! ./services/alerts.service */ "./src/modules/alerts/services/alerts.service.ts");
const alerts_controller_1 = __webpack_require__(/*! ./controllers/alerts.controller */ "./src/modules/alerts/controllers/alerts.controller.ts");
let AlertsModule = class AlertsModule {
};
exports.AlertsModule = AlertsModule;
exports.AlertsModule = AlertsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, redis_module_1.RedisModule, logger_module_1.LoggerModule, auth_module_1.AuthModule, notifications_module_1.NotificationsModule],
        controllers: [alerts_controller_1.AlertsController],
        providers: [alerts_service_1.AlertsService],
        exports: [alerts_service_1.AlertsService],
    })
], AlertsModule);


/***/ }),

/***/ "./src/modules/alerts/controllers/alerts.controller.ts":
/*!*************************************************************!*\
  !*** ./src/modules/alerts/controllers/alerts.controller.ts ***!
  \*************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AlertsController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const alerts_service_1 = __webpack_require__(/*! ../services/alerts.service */ "./src/modules/alerts/services/alerts.service.ts");
const alert_entity_1 = __webpack_require__(/*! ../entities/alert.entity */ "./src/modules/alerts/entities/alert.entity.ts");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../common/guards/jwt-auth.guard */ "./src/modules/common/guards/jwt-auth.guard.ts");
const current_user_decorator_1 = __webpack_require__(/*! ../../common/decorators/current-user.decorator */ "./src/modules/common/decorators/current-user.decorator.ts");
const roles_decorator_1 = __webpack_require__(/*! ../../common/decorators/roles.decorator */ "./src/modules/common/decorators/roles.decorator.ts");
const roles_guard_1 = __webpack_require__(/*! ../../common/guards/roles.guard */ "./src/modules/common/guards/roles.guard.ts");
const enums_1 = __webpack_require__(/*! ../../../common/enums */ "./src/common/enums.ts");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
let AlertsController = class AlertsController {
    constructor(alertsService) {
        this.alertsService = alertsService;
    }
    getUserAlerts(userId) {
        return this.alertsService.getUserAlerts(userId);
    }
    getAlert(userId, alertId) {
        return this.alertsService.getAlertById(userId, alertId);
    }
    createAlert(userId, dto) {
        return this.alertsService.createAlert(userId, dto);
    }
    pauseAlert(userId, alertId) {
        return this.alertsService.pauseAlert(userId, alertId);
    }
    resumeAlert(userId, alertId) {
        return this.alertsService.resumeAlert(userId, alertId);
    }
    deleteAlert(userId, alertId) {
        return this.alertsService.deleteAlert(userId, alertId);
    }
};
exports.AlertsController = AlertsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get all alerts for current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Alerts retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AlertsController.prototype, "getUserAlerts", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get specific alert by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Alert retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Alert not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AlertsController.prototype, "getAlert", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new alert' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Alert created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid alert configuration' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_b = typeof alert_entity_1.CreateAlertDto !== "undefined" && alert_entity_1.CreateAlertDto) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], AlertsController.prototype, "createAlert", null);
__decorate([
    (0, common_1.Patch)(':id/pause'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Pause an alert' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Alert paused successfully' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AlertsController.prototype, "pauseAlert", null);
__decorate([
    (0, common_1.Patch)(':id/resume'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Resume a paused alert' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Alert resumed successfully' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AlertsController.prototype, "resumeAlert", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an alert' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Alert deleted successfully' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AlertsController.prototype, "deleteAlert", null);
exports.AlertsController = AlertsController = __decorate([
    (0, swagger_1.ApiTags)('Alerts'),
    (0, common_1.Controller)('alerts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [typeof (_a = typeof alerts_service_1.AlertsService !== "undefined" && alerts_service_1.AlertsService) === "function" ? _a : Object])
], AlertsController);


/***/ }),

/***/ "./src/modules/alerts/entities/alert.entity.ts":
/*!*****************************************************!*\
  !*** ./src/modules/alerts/entities/alert.entity.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NotificationType = exports.AlertStatus = exports.AlertType = void 0;
var AlertType;
(function (AlertType) {
    AlertType["PRICE"] = "PRICE";
    AlertType["WHALE_ACTIVITY"] = "WHALE_ACTIVITY";
    AlertType["LARGE_TRANSFER"] = "LARGE_TRANSFER";
    AlertType["RISK"] = "RISK";
    AlertType["SECURITY"] = "SECURITY";
    AlertType["BRIDGE"] = "BRIDGE";
    AlertType["GOVERNANCE"] = "GOVERNANCE";
    AlertType["STAKING"] = "STAKING";
})(AlertType || (exports.AlertType = AlertType = {}));
var AlertStatus;
(function (AlertStatus) {
    AlertStatus["ACTIVE"] = "ACTIVE";
    AlertStatus["PAUSED"] = "PAUSED";
    AlertStatus["TRIGGERED"] = "TRIGGERED";
    AlertStatus["DISABLED"] = "DISABLED";
})(AlertStatus || (exports.AlertStatus = AlertStatus = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["ALERT"] = "ALERT";
    NotificationType["SYSTEM"] = "SYSTEM";
    NotificationType["SOCIAL"] = "SOCIAL";
    NotificationType["MARKETING"] = "MARKETING";
})(NotificationType || (exports.NotificationType = NotificationType = {}));


/***/ }),

/***/ "./src/modules/alerts/services/alerts.service.ts":
/*!*******************************************************!*\
  !*** ./src/modules/alerts/services/alerts.service.ts ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AlertsService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../common/modules/prisma.service */ "./src/modules/common/modules/prisma.service.ts");
const redis_service_1 = __webpack_require__(/*! ../../common/modules/redis.service */ "./src/modules/common/modules/redis.service.ts");
const notifications_service_1 = __webpack_require__(/*! ../../notifications/services/notifications.service */ "./src/modules/notifications/services/notifications.service.ts");
const alert_entity_1 = __webpack_require__(/*! ../entities/alert.entity */ "./src/modules/alerts/entities/alert.entity.ts");
const notification_entity_1 = __webpack_require__(/*! ../../notifications/entities/notification.entity */ "./src/modules/notifications/entities/notification.entity.ts");
const logger_service_1 = __webpack_require__(/*! ../../common/modules/logger.service */ "./src/modules/common/modules/logger.service.ts");
let AlertsService = class AlertsService {
    constructor(prisma, redisService, notificationsService) {
        this.prisma = prisma;
        this.redisService = redisService;
        this.notificationsService = notificationsService;
        this.logger = new logger_service_1.LoggerService();
    }
    async getUserAlerts(userId) {
        const alerts = await this.prisma.alert.findMany({
            where: { userId },
            include: { wallet: { select: { address: true, chain: true, label: true } } },
            orderBy: { createdAt: 'desc' },
        });
        return alerts.map(alert => this.mapToEntity(alert));
    }
    async getAlertById(userId, alertId) {
        const alert = await this.prisma.alert.findFirst({
            where: { id: alertId, userId },
        });
        if (!alert) {
            throw new common_1.NotFoundException('Alert not found');
        }
        return this.mapToEntity(alert);
    }
    async createAlert(userId, dto) {
        const alert = await this.prisma.alert.create({
            data: {
                userId,
                walletId: dto.walletId,
                type: dto.type,
                condition: JSON.stringify(dto.condition),
                status: alert_entity_1.AlertStatus.ACTIVE,
            },
        });
        this.logger.log(`Alert created: ${alert.id} for user ${userId}`, 'AlertsService');
        return this.mapToEntity(alert);
    }
    async updateAlert(userId, alertId, updates) {
        const alert = await this.getAlertById(userId, alertId);
        const updated = await this.prisma.alert.update({
            where: { id: alertId },
            data: {
                status: updates.status || alert.status,
                condition: updates.condition ? JSON.stringify(updates.condition) : alert.condition,
            },
        });
        return this.mapToEntity(updated);
    }
    async pauseAlert(userId, alertId) {
        return this.updateAlert(userId, alertId, { status: alert_entity_1.AlertStatus.PAUSED });
    }
    async resumeAlert(userId, alertId) {
        return this.updateAlert(userId, alertId, { status: alert_entity_1.AlertStatus.ACTIVE });
    }
    async deleteAlert(userId, alertId) {
        await this.getAlertById(userId, alertId);
        await this.prisma.alert.delete({ where: { id: alertId } });
        this.logger.log(`Alert deleted: ${alertId}`, 'AlertsService');
    }
    async evaluateAlerts(alertId, data) {
        const alert = await this.prisma.alert.findUnique({
            where: { id: alertId },
        });
        if (!alert || alert.status !== alert_entity_1.AlertStatus.ACTIVE) {
            return false;
        }
        const condition = typeof alert.condition === 'string' ? JSON.parse(alert.condition) : alert.condition;
        const currentValue = data[condition.field];
        if (currentValue === undefined || currentValue === null) {
            return false;
        }
        const triggered = this.evaluateCondition(currentValue, condition.operator, condition.value);
        if (triggered) {
            await this.triggerAlert(this.mapToEntity(alert));
        }
        return triggered;
    }
    async evaluateAllUserAlerts(userId, data) {
        const alerts = await this.prisma.alert.findMany({
            where: { userId, status: alert_entity_1.AlertStatus.ACTIVE },
        });
        for (const alert of alerts) {
            await this.evaluateAlerts(alert.id, data);
        }
    }
    async triggerAlert(alert) {
        await this.prisma.alert.update({
            where: { id: alert.id },
            data: {
                status: alert_entity_1.AlertStatus.TRIGGERED,
                lastTriggeredAt: new Date(),
                triggerCount: { increment: 1 },
            },
        });
        await this.notificationsService.createNotification({
            userId: alert.userId,
            alertId: alert.id,
            type: notification_entity_1.NotificationType.ALERT,
            title: this.getAlertTitle(alert.type),
            message: this.getAlertMessage(alert.type),
        });
        this.logger.log(`Alert triggered: ${alert.id}`, 'AlertsService');
    }
    evaluateCondition(current, operator, target) {
        if (typeof current !== 'number' || typeof target !== 'number') {
            return String(current) === String(target);
        }
        switch (operator) {
            case '>':
                return current > target;
            case '<':
                return current < target;
            case '>=':
                return current >= target;
            case '<=':
                return current <= target;
            case '==':
                return current === target;
            case '!=':
                return current !== target;
            default:
                return false;
        }
    }
    getAlertTitle(type) {
        const titles = {
            [alert_entity_1.AlertType.PRICE]: 'Price Alert',
            [alert_entity_1.AlertType.WHALE_ACTIVITY]: 'Whale Activity Detected',
            [alert_entity_1.AlertType.LARGE_TRANSFER]: 'Large Transfer Detected',
            [alert_entity_1.AlertType.RISK]: 'Risk Alert',
            [alert_entity_1.AlertType.SECURITY]: 'Security Alert',
            [alert_entity_1.AlertType.BRIDGE]: 'Bridge Alert',
            [alert_entity_1.AlertType.GOVERNANCE]: 'Governance Alert',
            [alert_entity_1.AlertType.STAKING]: 'Staking Alert',
        };
        return titles[type];
    }
    getAlertMessage(type) {
        const messages = {
            [alert_entity_1.AlertType.PRICE]: 'A price alert you set has been triggered.',
            [alert_entity_1.AlertType.WHALE_ACTIVITY]: 'Whale activity detected in your watchlist.',
            [alert_entity_1.AlertType.LARGE_TRANSFER]: 'A large transfer has been detected.',
            [alert_entity_1.AlertType.RISK]: 'A risk condition has been detected in your portfolio.',
            [alert_entity_1.AlertType.SECURITY]: 'A security-related alert has been triggered.',
            [alert_entity_1.AlertType.BRIDGE]: 'A bridge transaction has been detected.',
            [alert_entity_1.AlertType.GOVERNANCE]: 'A governance-related alert has been triggered.',
            [alert_entity_1.AlertType.STAKING]: 'A staking-related alert has been triggered.',
        };
        return messages[type];
    }
    mapToEntity(alert) {
        return {
            id: alert.id,
            userId: alert.userId,
            walletId: alert.walletId,
            type: alert.type,
            condition: typeof alert.condition === 'string' ? JSON.parse(alert.condition) : alert.condition,
            status: alert.status,
            lastTriggeredAt: alert.lastTriggeredAt,
            triggerCount: alert.triggerCount,
            createdAt: alert.createdAt,
            updatedAt: alert.updatedAt,
        };
    }
};
exports.AlertsService = AlertsService;
exports.AlertsService = AlertsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof redis_service_1.RedisService !== "undefined" && redis_service_1.RedisService) === "function" ? _b : Object, typeof (_c = typeof notifications_service_1.NotificationsService !== "undefined" && notifications_service_1.NotificationsService) === "function" ? _c : Object])
], AlertsService);


/***/ }),

/***/ "./src/modules/analytics/analytics.module.ts":
/*!***************************************************!*\
  !*** ./src/modules/analytics/analytics.module.ts ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AnalyticsModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const analytics_controller_1 = __webpack_require__(/*! ./controllers/analytics.controller */ "./src/modules/analytics/controllers/analytics.controller.ts");
const analytics_service_1 = __webpack_require__(/*! ./services/analytics.service */ "./src/modules/analytics/services/analytics.service.ts");
const risk_service_1 = __webpack_require__(/*! ./services/risk.service */ "./src/modules/analytics/services/risk.service.ts");
const prisma_module_1 = __webpack_require__(/*! ../common/modules/prisma.module */ "./src/modules/common/modules/prisma.module.ts");
let AnalyticsModule = class AnalyticsModule {
};
exports.AnalyticsModule = AnalyticsModule;
exports.AnalyticsModule = AnalyticsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [analytics_controller_1.AnalyticsController],
        providers: [analytics_service_1.AnalyticsService, risk_service_1.RiskService],
        exports: [analytics_service_1.AnalyticsService, risk_service_1.RiskService],
    })
], AnalyticsModule);


/***/ }),

/***/ "./src/modules/analytics/controllers/analytics.controller.ts":
/*!*******************************************************************!*\
  !*** ./src/modules/analytics/controllers/analytics.controller.ts ***!
  \*******************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AnalyticsController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const analytics_service_1 = __webpack_require__(/*! ../services/analytics.service */ "./src/modules/analytics/services/analytics.service.ts");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../common/guards/jwt-auth.guard */ "./src/modules/common/guards/jwt-auth.guard.ts");
const current_user_decorator_1 = __webpack_require__(/*! ../../common/decorators/current-user.decorator */ "./src/modules/common/decorators/current-user.decorator.ts");
const roles_decorator_1 = __webpack_require__(/*! ../../common/decorators/roles.decorator */ "./src/modules/common/decorators/roles.decorator.ts");
const roles_guard_1 = __webpack_require__(/*! ../../common/guards/roles.guard */ "./src/modules/common/guards/roles.guard.ts");
const enums_1 = __webpack_require__(/*! ../../../common/enums */ "./src/common/enums.ts");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const analytics_entity_1 = __webpack_require__(/*! ../entities/analytics.entity */ "./src/modules/analytics/entities/analytics.entity.ts");
let AnalyticsController = class AnalyticsController {
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    getPortfolioAnalytics(userId, timeRange) {
        return this.analyticsService.getPortfolioAnalytics(userId, timeRange);
    }
    getTransactionHistory(userId, limit) {
        return this.analyticsService.getTransactionHistory(userId, limit ? parseInt(limit) : 50);
    }
    getPerformanceMetrics(userId) {
        return this.analyticsService.getPerformanceMetrics(userId);
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('portfolio'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get portfolio analytics' }),
    (0, swagger_1.ApiQuery)({ name: 'timeRange', required: false, enum: analytics_entity_1.TimeRange }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Portfolio analytics retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Query)('timeRange')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_b = typeof analytics_entity_1.TimeRange !== "undefined" && analytics_entity_1.TimeRange) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getPortfolioAnalytics", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction history' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transaction history retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getTransactionHistory", null);
__decorate([
    (0, common_1.Get)('performance'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get performance metrics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Performance metrics retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getPerformanceMetrics", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, swagger_1.ApiTags)('Analytics'),
    (0, common_1.Controller)('analytics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [typeof (_a = typeof analytics_service_1.AnalyticsService !== "undefined" && analytics_service_1.AnalyticsService) === "function" ? _a : Object])
], AnalyticsController);


/***/ }),

/***/ "./src/modules/analytics/entities/analytics.entity.ts":
/*!************************************************************!*\
  !*** ./src/modules/analytics/entities/analytics.entity.ts ***!
  \************************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TimeRange = void 0;
var TimeRange;
(function (TimeRange) {
    TimeRange["DAY"] = "24H";
    TimeRange["WEEK"] = "7D";
    TimeRange["MONTH"] = "30D";
    TimeRange["YEAR"] = "1Y";
    TimeRange["ALL"] = "ALL";
})(TimeRange || (exports.TimeRange = TimeRange = {}));


/***/ }),

/***/ "./src/modules/analytics/services/analytics.service.ts":
/*!*************************************************************!*\
  !*** ./src/modules/analytics/services/analytics.service.ts ***!
  \*************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AnalyticsService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../common/modules/prisma.service */ "./src/modules/common/modules/prisma.service.ts");
const logger_service_1 = __webpack_require__(/*! ../../common/modules/logger.service */ "./src/modules/common/modules/logger.service.ts");
const analytics_entity_1 = __webpack_require__(/*! ../entities/analytics.entity */ "./src/modules/analytics/entities/analytics.entity.ts");
let AnalyticsService = class AnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new logger_service_1.LoggerService();
    }
    async getPortfolioAnalytics(userId, timeRange = analytics_entity_1.TimeRange.MONTH) {
        return {
            totalValue: 45230.50,
            change24h: 2.34,
            change7d: 8.12,
            change30d: 15.67,
            bestPerformer: {
                symbol: 'ETH',
                change: 12.5,
            },
            worstPerformer: {
                symbol: 'USDC',
                change: 0.01,
            },
            allocation: [
                { symbol: 'ETH', percentage: 45, value: 20353.73 },
                { symbol: 'USDC', percentage: 30, value: 13569.15 },
                { symbol: 'LXON', percentage: 15, value: 6784.58 },
                { symbol: 'BTC', percentage: 10, value: 4523.05 },
            ],
        };
    }
    async getTransactionHistory(userId, limit = 50) {
        return [
            {
                hash: '0xabc123...',
                type: 'send',
                from: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28',
                to: '0x8ba1f109551bD432803012645H1361521',
                amount: '0.5',
                symbol: 'ETH',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
            },
            {
                hash: '0xdef456...',
                type: 'receive',
                from: '0x8ba1f109551bD432803012645H1361522',
                to: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28',
                amount: '1000',
                symbol: 'USDC',
                timestamp: new Date(Date.now() - 172800000).toISOString(),
            },
        ];
    }
    async getPerformanceMetrics(userId) {
        return {
            winRate: 0.68,
            averageProfit: 0.05,
            totalTrades: 142,
            profitableTrades: 97,
            sharpeRatio: 1.85,
            maxDrawdown: -0.12,
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], AnalyticsService);


/***/ }),

/***/ "./src/modules/analytics/services/risk.service.ts":
/*!********************************************************!*\
  !*** ./src/modules/analytics/services/risk.service.ts ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RiskService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../common/modules/prisma.service */ "./src/modules/common/modules/prisma.service.ts");
let RiskService = class RiskService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getWalletRiskScore(userId, walletId) {
        const wallet = await this.prisma.wallet.findFirst({
            where: { id: walletId, userId },
            include: { balances: true, transactions: true },
        });
        if (!wallet) {
            throw new Error('Wallet not found');
        }
        const factors = [];
        let score = 100;
        const contractTxs = wallet.transactions?.filter((t) => t.type === 'CONTRACT_CALL').length || 0;
        if (contractTxs > 50) {
            score -= 10;
            factors.push({ factor: 'HIGH_CONTRACT_ACTIVITY', impact: -10, description: 'Wallet interacts with many contracts' });
        }
        const unknownTokens = wallet.balances?.filter((b) => !b.isVerified).length || 0;
        if (unknownTokens > 0) {
            score -= 5 * unknownTokens;
            factors.push({ factor: 'UNVERIFIED_TOKENS', impact: -5 * unknownTokens, description: `${unknownTokens} unverified tokens in wallet` });
        }
        const walletAgeDays = (Date.now() - new Date(wallet.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        if (walletAgeDays < 7) {
            score -= 5;
            factors.push({ factor: 'NEW_WALLET', impact: -5, description: 'Wallet is less than 7 days old' });
        }
        score = Math.max(0, Math.min(100, score));
        const level = score >= 80 ? 'LOW' : score >= 60 ? 'MEDIUM' : score >= 40 ? 'HIGH' : 'CRITICAL';
        return { score, level, factors };
    }
    async getPortfolioHealth(userId) {
        const wallets = await this.prisma.wallet.findMany({
            where: { userId, isActive: true },
        });
        const walletScores = [];
        let totalScore = 0;
        for (const wallet of wallets) {
            const risk = await this.getWalletRiskScore(userId, wallet.id);
            walletScores.push({
                walletId: wallet.id,
                address: wallet.address,
                score: risk.score,
                level: risk.level,
            });
            totalScore += risk.score;
        }
        const overallScore = wallets.length > 0 ? Math.round(totalScore / wallets.length) : 0;
        const recommendations = this.generateRecommendations(walletScores);
        return {
            overallScore,
            wallets: walletScores,
            recommendations,
        };
    }
    generateRecommendations(walletScores) {
        const recommendations = [];
        const lowScoreWallets = walletScores.filter(w => w.score < 60);
        if (lowScoreWallets.length > 0) {
            recommendations.push(`Consider moving funds from ${lowScoreWallets.length} high-risk wallets to a new address`);
        }
        const criticalWallets = walletScores.filter(w => w.level === 'CRITICAL');
        if (criticalWallets.length > 0) {
            recommendations.push('Immediate action required: one or more wallets show critical risk indicators');
        }
        if (recommendations.length === 0) {
            recommendations.push('Your portfolio health is good. Continue monitoring regularly.');
        }
        return recommendations;
    }
};
exports.RiskService = RiskService;
exports.RiskService = RiskService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], RiskService);


/***/ }),

/***/ "./src/modules/auth/auth.module.ts":
/*!*****************************************!*\
  !*** ./src/modules/auth/auth.module.ts ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const http_module_1 = __webpack_require__(/*! ../common/modules/http.module */ "./src/modules/common/modules/http.module.ts");
const prisma_module_1 = __webpack_require__(/*! ../common/modules/prisma.module */ "./src/modules/common/modules/prisma.module.ts");
const logger_module_1 = __webpack_require__(/*! ../common/modules/logger.module */ "./src/modules/common/modules/logger.module.ts");
const redis_module_1 = __webpack_require__(/*! ../common/modules/redis.module */ "./src/modules/common/modules/redis.module.ts");
const auth_service_1 = __webpack_require__(/*! ./services/auth.service */ "./src/modules/auth/services/auth.service.ts");
const token_service_1 = __webpack_require__(/*! ./services/token.service */ "./src/modules/auth/services/token.service.ts");
const auth_controller_1 = __webpack_require__(/*! ./controllers/auth.controller */ "./src/modules/auth/controllers/auth.controller.ts");
const jwt_strategy_1 = __webpack_require__(/*! ./strategies/jwt.strategy */ "./src/modules/auth/strategies/jwt.strategy.ts");
const jwt_auth_guard_1 = __webpack_require__(/*! ../common/guards/jwt-auth.guard */ "./src/modules/common/guards/jwt-auth.guard.ts");
const transaction_auth_service_1 = __webpack_require__(/*! ../common/services/transaction-auth.service */ "./src/modules/common/services/transaction-auth.service.ts");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            logger_module_1.LoggerModule,
            http_module_1.HttpModule,
            redis_module_1.RedisModule,
            config_1.ConfigModule,
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.get('JWT_SECRET'),
                    signOptions: {
                        expiresIn: configService.get('JWT_EXPIRES_IN', '7d'),
                    },
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [auth_service_1.AuthService, token_service_1.TokenService, jwt_strategy_1.JwtStrategy, jwt_auth_guard_1.JwtAuthGuard, transaction_auth_service_1.TransactionAuthService],
        exports: [auth_service_1.AuthService, token_service_1.TokenService, jwt_auth_guard_1.JwtAuthGuard, transaction_auth_service_1.TransactionAuthService],
    })
], AuthModule);


/***/ }),

/***/ "./src/modules/auth/controllers/auth.controller.ts":
/*!*********************************************************!*\
  !*** ./src/modules/auth/controllers/auth.controller.ts ***!
  \*********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const auth_service_1 = __webpack_require__(/*! ../services/auth.service */ "./src/modules/auth/services/auth.service.ts");
const dto_1 = __webpack_require__(/*! ../dto */ "./src/modules/auth/dto/index.ts");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../common/guards/jwt-auth.guard */ "./src/modules/common/guards/jwt-auth.guard.ts");
const current_user_decorator_1 = __webpack_require__(/*! ../../common/decorators/current-user.decorator */ "./src/modules/common/decorators/current-user.decorator.ts");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const pin_biometric_dto_1 = __webpack_require__(/*! ../dto/pin-biometric.dto */ "./src/modules/auth/dto/pin-biometric.dto.ts");
const transaction_auth_service_1 = __webpack_require__(/*! ../../common/services/transaction-auth.service */ "./src/modules/common/services/transaction-auth.service.ts");
let AuthController = class AuthController {
    constructor(authService, transactionAuthService) {
        this.authService = authService;
        this.transactionAuthService = transactionAuthService;
    }
    async register(dto) {
        return this.authService.register(dto);
    }
    async login(dto) {
        return this.authService.login(dto.email, dto.password);
    }
    async refresh(dto) {
        return this.authService.refreshTokens(dto.refreshToken);
    }
    async getProfile(user) {
        return this.authService.findUserById(user.sub);
    }
    async setPin(user, dto) {
        return this.transactionAuthService.setPin(user.sub, dto.pin);
    }
    async verifyPin(user, dto) {
        const isValid = await this.transactionAuthService.verifyPin(user.sub, dto.pin);
        if (!isValid) {
            throw new common_1.ForbiddenException('Invalid PIN');
        }
        return { valid: true };
    }
    async removePin(user) {
        return this.transactionAuthService.removePin(user.sub);
    }
    async enableBiometric(user, dto) {
        return this.transactionAuthService.enableBiometric(user.sub, dto.publicKey);
    }
    async disableBiometric(user) {
        return this.transactionAuthService.disableBiometric(user.sub);
    }
    async generateBiometricChallenge(user) {
        return this.transactionAuthService.generateBiometricChallenge(user.sub);
    }
    async getSecuritySettings(user) {
        return this.transactionAuthService.getSettings(user.sub);
    }
    async updateSecuritySettings(user, dto) {
        return this.transactionAuthService.updateSettings(user.sub, dto.isPinBiometricRequired || false);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new user with email and password' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User successfully registered' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email already registered' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof dto_1.RegisterDto !== "undefined" && dto_1.RegisterDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Login with email and password' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Login successful' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid credentials' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof dto_1.LoginDto !== "undefined" && dto_1.LoginDto) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh access token using refresh token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tokens refreshed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid refresh token' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof dto_1.RefreshTokenDto !== "undefined" && dto_1.RefreshTokenDto) === "function" ? _e : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get current authenticated user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User profile retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Post)('pin/set'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Set 6-digit PIN for transaction authorization' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'PIN set successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid PIN format' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_f = typeof pin_biometric_dto_1.SetPinDto !== "undefined" && pin_biometric_dto_1.SetPinDto) === "function" ? _f : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "setPin", null);
__decorate([
    (0, common_1.Post)('pin/verify'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Verify PIN for transaction authorization' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'PIN is valid' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid PIN' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_g = typeof pin_biometric_dto_1.VerifyPinDto !== "undefined" && pin_biometric_dto_1.VerifyPinDto) === "function" ? _g : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyPin", null);
__decorate([
    (0, common_1.Post)('pin/remove'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Remove PIN requirement' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'PIN removed successfully' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "removePin", null);
__decorate([
    (0, common_1.Post)('biometric/enable'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Enable biometric authentication with public key' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Biometric enabled' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid public key' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_h = typeof pin_biometric_dto_1.EnableBiometricDto !== "undefined" && pin_biometric_dto_1.EnableBiometricDto) === "function" ? _h : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "enableBiometric", null);
__decorate([
    (0, common_1.Post)('biometric/disable'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Disable biometric authentication' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Biometric disabled' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "disableBiometric", null);
__decorate([
    (0, common_1.Post)('biometric/challenge'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Generate a challenge for biometric signature' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Challenge generated', type: pin_biometric_dto_1.BiometricChallengeResponse }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], AuthController.prototype, "generateBiometricChallenge", null);
__decorate([
    (0, common_1.Get)('security/settings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get PIN/biometric security settings' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Security settings retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getSecuritySettings", null);
__decorate([
    (0, common_1.Put)('security/settings'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Update PIN/biometric security settings' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Settings updated' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot require without setup' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_k = typeof pin_biometric_dto_1.UpdatePinBiometricSettingsDto !== "undefined" && pin_biometric_dto_1.UpdatePinBiometricSettingsDto) === "function" ? _k : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateSecuritySettings", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object, typeof (_b = typeof transaction_auth_service_1.TransactionAuthService !== "undefined" && transaction_auth_service_1.TransactionAuthService) === "function" ? _b : Object])
], AuthController);


/***/ }),

/***/ "./src/modules/auth/dto/index.ts":
/*!***************************************!*\
  !*** ./src/modules/auth/dto/index.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RefreshTokenDto = exports.LoginDto = exports.RegisterDto = void 0;
var register_dto_1 = __webpack_require__(/*! ./register.dto */ "./src/modules/auth/dto/register.dto.ts");
Object.defineProperty(exports, "RegisterDto", ({ enumerable: true, get: function () { return register_dto_1.RegisterDto; } }));
var login_dto_1 = __webpack_require__(/*! ./login.dto */ "./src/modules/auth/dto/login.dto.ts");
Object.defineProperty(exports, "LoginDto", ({ enumerable: true, get: function () { return login_dto_1.LoginDto; } }));
var refresh_token_dto_1 = __webpack_require__(/*! ./refresh-token.dto */ "./src/modules/auth/dto/refresh-token.dto.ts");
Object.defineProperty(exports, "RefreshTokenDto", ({ enumerable: true, get: function () { return refresh_token_dto_1.RefreshTokenDto; } }));


/***/ }),

/***/ "./src/modules/auth/dto/login.dto.ts":
/*!*******************************************!*\
  !*** ./src/modules/auth/dto/login.dto.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LoginDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
class LoginDto {
}
exports.LoginDto = LoginDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User email address',
        example: 'user@example.com',
    }),
    (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address' }),
    __metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User password',
        example: 'SecurePass123!',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);


/***/ }),

/***/ "./src/modules/auth/dto/pin-biometric.dto.ts":
/*!***************************************************!*\
  !*** ./src/modules/auth/dto/pin-biometric.dto.ts ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BiometricChallengeResponse = exports.UpdatePinBiometricSettingsDto = exports.TransactionAuthDto = exports.EnableBiometricDto = exports.VerifyPinDto = exports.SetPinDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
class SetPinDto {
}
exports.SetPinDto = SetPinDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '6-digit PIN',
        example: '123456',
        minLength: 6,
        maxLength: 6,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6, { message: 'PIN must be exactly 6 digits' }),
    (0, class_validator_1.MaxLength)(6, { message: 'PIN must be exactly 6 digits' }),
    __metadata("design:type", String)
], SetPinDto.prototype, "pin", void 0);
class VerifyPinDto {
}
exports.VerifyPinDto = VerifyPinDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '6-digit PIN',
        example: '123456',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6, { message: 'PIN must be exactly 6 digits' }),
    (0, class_validator_1.MaxLength)(6, { message: 'PIN must be exactly 6 digits' }),
    __metadata("design:type", String)
], VerifyPinDto.prototype, "pin", void 0);
class EnableBiometricDto {
}
exports.EnableBiometricDto = EnableBiometricDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Biometric public key in base64-encoded SPKI format (P-256)',
        example: 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], EnableBiometricDto.prototype, "publicKey", void 0);
class TransactionAuthDto {
}
exports.TransactionAuthDto = TransactionAuthDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'PIN for transaction authorization',
        example: '123456',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6, { message: 'PIN must be exactly 6 digits' }),
    (0, class_validator_1.MaxLength)(6, { message: 'PIN must be exactly 6 digits' }),
    __metadata("design:type", String)
], TransactionAuthDto.prototype, "pin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Biometric signature payload in format "base64(challenge):base64(signature)"',
        example: 'c2hhMjU2X2NoYWxsZW5nZQ==:c2lnbmF0dXJl',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransactionAuthDto.prototype, "biometricSignature", void 0);
class UpdatePinBiometricSettingsDto {
}
exports.UpdatePinBiometricSettingsDto = UpdatePinBiometricSettingsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether PIN/biometric is required for transactions',
        example: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePinBiometricSettingsDto.prototype, "isPinBiometricRequired", void 0);
class BiometricChallengeResponse {
}
exports.BiometricChallengeResponse = BiometricChallengeResponse;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Base64-encoded challenge to sign with biometric private key',
        example: 'c2hhMjU2X2NoYWxsZW5nZQ==',
    }),
    __metadata("design:type", String)
], BiometricChallengeResponse.prototype, "challenge", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Challenge expiration timestamp',
        example: '2026-08-03T04:00:00.000Z',
    }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], BiometricChallengeResponse.prototype, "expiresAt", void 0);


/***/ }),

/***/ "./src/modules/auth/dto/refresh-token.dto.ts":
/*!***************************************************!*\
  !*** ./src/modules/auth/dto/refresh-token.dto.ts ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RefreshTokenDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
class RefreshTokenDto {
}
exports.RefreshTokenDto = RefreshTokenDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Valid refresh token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RefreshTokenDto.prototype, "refreshToken", void 0);


/***/ }),

/***/ "./src/modules/auth/dto/register.dto.ts":
/*!**********************************************!*\
  !*** ./src/modules/auth/dto/register.dto.ts ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RegisterDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
class RegisterDto {
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User email address',
        example: 'user@example.com',
    }),
    (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User password (min 8 characters, must contain uppercase, lowercase, number, and special character)',
        minLength: 8,
        example: 'SecurePass123!',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters long' }),
    (0, class_validator_1.MaxLength)(128, { message: 'Password must not exceed 128 characters' }),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message: 'Password must contain uppercase, lowercase, number, and special character',
    }),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'User display name',
        example: 'John Doe',
        maxLength: 100,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100, { message: 'Name must not exceed 100 characters' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "name", void 0);


/***/ }),

/***/ "./src/modules/auth/services/auth.service.ts":
/*!***************************************************!*\
  !*** ./src/modules/auth/services/auth.service.ts ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const bcrypt = __importStar(__webpack_require__(/*! bcrypt */ "bcrypt"));
const prisma_service_1 = __webpack_require__(/*! ../../common/modules/prisma.service */ "./src/modules/common/modules/prisma.service.ts");
const crypto_service_1 = __webpack_require__(/*! ../../common/modules/crypto/crypto.service */ "./src/modules/common/modules/crypto/crypto.service.ts");
const logger_service_1 = __webpack_require__(/*! ../../common/modules/logger.service */ "./src/modules/common/modules/logger.service.ts");
let AuthService = class AuthService {
    constructor(prisma, jwtService, configService, cryptoService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.cryptoService = cryptoService;
        this.logger = new logger_service_1.LoggerService();
        this.bcryptRounds = this.configService.get('BCRYPT_ROUNDS', 12);
    }
    async validateUserByEmail(email, password) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user || !user.password) {
            return null;
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return null;
        }
        if (!user.isActive) {
            throw new common_1.ForbiddenException('Account is deactivated');
        }
        return this.mapToEntity(user);
    }
    async validateOAuthUser(data) {
        let user = await this.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email: data.email,
                    name: data.name,
                    image: data.image,
                    emailVerified: true,
                    emailVerifiedAt: new Date(),
                    password: null,
                },
            });
        }
        else if (!user.emailVerified) {
            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    emailVerified: true,
                    emailVerifiedAt: new Date(),
                    name: data.name || user.name,
                    image: data.image || user.image,
                },
            });
        }
        const tokens = await this.generateTokens(this.mapToEntity(user));
        await this.updateLastLogin(user.id);
        return {
            ...tokens,
            user: this.sanitizeUser(user),
        };
    }
    async register(data) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email already registered');
        }
        const hashedPassword = await bcrypt.hash(data.password, this.bcryptRounds);
        const sensitiveData = {
            email: data.email,
            name: data.name,
            password: hashedPassword,
            wallets: [],
            portfolio: {},
            transactions: [],
            preferences: {},
        };
        const encrypted = this.cryptoService.encryptObject(sensitiveData);
        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
                encryptedData: encrypted.ciphertext,
                dataIv: encrypted.iv,
                dataAuthTag: encrypted.authTag,
            },
        });
        const tokens = await this.generateTokens(this.mapToEntity(user));
        this.logger.log(`New user registered: ${user.email}`, 'AuthService');
        return {
            ...tokens,
            user: this.sanitizeUser(user),
        };
    }
    async login(email, password) {
        const user = await this.validateUserByEmail(email, password);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const tokens = await this.generateTokens(user);
        await this.updateLastLogin(user.id);
        this.logger.log(`User logged in: ${user.email}`, 'AuthService');
        return {
            ...tokens,
            user: this.sanitizeUser(user),
        };
    }
    async refreshTokens(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });
            if (!user || !user.isActive) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            return {
                accessToken: this.jwtService.sign({ sub: user.id, email: user.email, role: user.role }, { expiresIn: this.configService.get('JWT_EXPIRES_IN', '7d'), secret: this.configService.get('JWT_SECRET') }),
                refreshToken: await this.generateRefreshToken(user.id),
                user: this.sanitizeUser(user),
            };
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async findUserById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            return null;
        }
        return this.mapToEntity(user);
    }
    async findUserByEmail(email) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return null;
        }
        return this.mapToEntity(user);
    }
    async getDecryptedUserData(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.InternalServerErrorException('User not found');
        }
        if (!user.encryptedData || !user.dataIv || !user.dataAuthTag) {
            throw new common_1.InternalServerErrorException('User data is not encrypted');
        }
        const sensitiveData = this.cryptoService.decryptObject({
            ciphertext: user.encryptedData,
            iv: user.dataIv,
            authTag: user.dataAuthTag,
        });
        return {
            user: this.mapToEntity(user),
            sensitiveData: sensitiveData,
        };
    }
    async generateTokens(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                expiresIn: this.configService.get('JWT_EXPIRES_IN', '7d'),
                secret: this.configService.get('JWT_SECRET'),
            }),
            this.generateRefreshToken(user.id),
        ]);
        return { accessToken, refreshToken };
    }
    async generateRefreshToken(userId) {
        return this.jwtService.signAsync({ sub: userId, type: 'refresh' }, {
            expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '30d'),
            secret: this.configService.get('JWT_REFRESH_SECRET'),
        });
    }
    async updateLastLogin(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { lastLoginAt: new Date() },
        });
    }
    mapToEntity(user) {
        return {
            id: user.id,
            email: user.email,
            emailVerified: user.emailVerified,
            emailVerifiedAt: user.emailVerifiedAt,
            name: user.name,
            image: user.image,
            password: user.password,
            role: user.role,
            isActive: user.isActive,
            isTwoFactorEnabled: user.isTwoFactorEnabled,
            twoFactorSecret: user.twoFactorSecret,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            encryptedData: user.encryptedData,
            dataIv: user.dataIv,
            dataAuthTag: user.dataAuthTag,
        };
    }
    sanitizeUser(user) {
        const { password, twoFactorSecret, encryptedData, dataIv, dataAuthTag, ...sanitized } = this.mapToEntity(user);
        return sanitized;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _b : Object, typeof (_c = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _c : Object, typeof (_d = typeof crypto_service_1.CryptoService !== "undefined" && crypto_service_1.CryptoService) === "function" ? _d : Object])
], AuthService);


/***/ }),

/***/ "./src/modules/auth/services/token.service.ts":
/*!****************************************************!*\
  !*** ./src/modules/auth/services/token.service.ts ***!
  \****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TokenService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
let TokenService = class TokenService {
    constructor(jwtService, configService) {
        this.jwtService = jwtService;
        this.configService = configService;
    }
    generateAccessToken(payload) {
        return this.jwtService.sign(payload, {
            expiresIn: this.configService.get('JWT_EXPIRES_IN', '7d'),
            secret: this.configService.get('JWT_SECRET'),
        });
    }
    async generateRefreshToken(userId) {
        return this.jwtService.signAsync({ sub: userId, type: 'refresh' }, {
            expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '30d'),
            secret: this.configService.get('JWT_REFRESH_SECRET'),
        });
    }
    validateAccessToken(token) {
        try {
            return this.jwtService.verify(token, {
                secret: this.configService.get('JWT_SECRET'),
            });
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired access token');
        }
    }
    validateRefreshToken(token) {
        try {
            return this.jwtService.verify(token, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
    }
    decodeToken(token) {
        try {
            const decoded = this.jwtService.decode(token);
            return { payload: decoded, expired: false };
        }
        catch (error) {
            if (error?.name === 'TokenExpiredError') {
                const decoded = this.jwtService.decode(token);
                return { payload: decoded, expired: true };
            }
            return { payload: null, expired: false };
        }
    }
};
exports.TokenService = TokenService;
exports.TokenService = TokenService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _a : Object, typeof (_b = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _b : Object])
], TokenService);


/***/ }),

/***/ "./src/modules/auth/strategies/jwt.strategy.ts":
/*!*****************************************************!*\
  !*** ./src/modules/auth/strategies/jwt.strategy.ts ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtStrategy = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
const passport_jwt_1 = __webpack_require__(/*! passport-jwt */ "passport-jwt");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'jwt') {
    constructor(configService) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET'),
        });
        this.configService = configService;
    }
    async validate(payload) {
        if (!payload.sub || !payload.email) {
            throw new common_1.UnauthorizedException('Invalid token payload');
        }
        return payload;
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], JwtStrategy);


/***/ }),

/***/ "./src/modules/common/adapters/redis-io.adapter.ts":
/*!*********************************************************!*\
  !*** ./src/modules/common/adapters/redis-io.adapter.ts ***!
  \*********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RedisIoAdapter_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RedisIoAdapter = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const platform_socket_io_1 = __webpack_require__(/*! @nestjs/platform-socket.io */ "@nestjs/platform-socket.io");
const ioredis_1 = __webpack_require__(/*! ioredis */ "ioredis");
let RedisIoAdapter = RedisIoAdapter_1 = class RedisIoAdapter extends platform_socket_io_1.IoAdapter {
    constructor() {
        super();
        this.logger = new common_1.Logger(RedisIoAdapter_1.name);
        this.pubClient = new ioredis_1.Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
            password: process.env.REDIS_PASSWORD || undefined,
        });
        this.subClient = new ioredis_1.Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
            password: process.env.REDIS_PASSWORD || undefined,
        });
    }
    create(port, options) {
        const server = super.create(port, options);
        this.logger.log(`WebSocket server created on port ${port}`);
        return server;
    }
};
exports.RedisIoAdapter = RedisIoAdapter;
exports.RedisIoAdapter = RedisIoAdapter = RedisIoAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], RedisIoAdapter);


/***/ }),

/***/ "./src/modules/common/config.schema.ts":
/*!*********************************************!*\
  !*** ./src/modules/common/config.schema.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.configValidationSchema = void 0;
const zod_1 = __webpack_require__(/*! zod */ "zod");
exports.configValidationSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.coerce.number().positive().default(4000),
    API_PREFIX: zod_1.z.string().default('api/v1'),
    CORS_ORIGIN: zod_1.z.string().default('http://localhost:3000'),
    DATABASE_URL: zod_1.z.string().url().default('postgresql://postgres:postgres@localhost:5432/cryptomind?schema=public'),
    DIRECT_URL: zod_1.z.string().url().default('postgresql://postgres:postgres@localhost:5432/cryptomind?schema=public'),
    REDIS_HOST: zod_1.z.string().default('localhost'),
    REDIS_PORT: zod_1.z.coerce.number().positive().default(6379),
    REDIS_PASSWORD: zod_1.z.string().optional(),
    REDIS_DB: zod_1.z.coerce.number().min(0).default(0),
    JWT_SECRET: zod_1.z.string().min(1),
    JWT_EXPIRES_IN: zod_1.z.string().default('7d'),
    JWT_REFRESH_SECRET: zod_1.z.string().min(1),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default('30d'),
    GOOGLE_CLIENT_ID: zod_1.z.string().optional(),
    GOOGLE_CLIENT_SECRET: zod_1.z.string().optional(),
    OPENAI_API_KEY: zod_1.z.string().startsWith('sk-').optional(),
    OPENAI_MODEL: zod_1.z.string().default('gpt-4-turbo-preview'),
    WALLETCONNECT_PROJECT_ID: zod_1.z.string().optional(),
    ETHEREUM_RPC_URL: zod_1.z.string().url().optional(),
    POLYGON_RPC_URL: zod_1.z.string().url().optional(),
    BSC_RPC_URL: zod_1.z.string().url().optional(),
    ARBITRUM_RPC_URL: zod_1.z.string().url().optional(),
    BASE_RPC_URL: zod_1.z.string().url().optional(),
    AVALANCHE_RPC_URL: zod_1.z.string().url().optional(),
    LXON_RPC_URL: zod_1.z.string().url().optional(),
    ETHERSCAN_API_KEY: zod_1.z.string().optional(),
    BSCSCAN_API_KEY: zod_1.z.string().optional(),
    POLYGONSCAN_API_KEY: zod_1.z.string().optional(),
    ARBISCAN_API_KEY: zod_1.z.string().optional(),
    BASESCAN_API_KEY: zod_1.z.string().optional(),
    SNOWTRACE_API_KEY: zod_1.z.string().optional(),
    LXONSCAN_API_KEY: zod_1.z.string().optional(),
    SMTP_HOST: zod_1.z.string().optional(),
    SMTP_PORT: zod_1.z.coerce.number().positive().default(587),
    SMTP_SECURE: zod_1.z.coerce.boolean().default(false),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASS: zod_1.z.string().optional(),
    EMAIL_FROM: zod_1.z.string().default('Synex <noreply@synex.ai>'),
    S3_BUCKET: zod_1.z.string().optional(),
    S3_REGION: zod_1.z.string().default('us-east-1'),
    S3_ACCESS_KEY: zod_1.z.string().optional(),
    S3_SECRET_KEY: zod_1.z.string().optional(),
    IPFS_GATEWAY: zod_1.z.string().url().default('https://ipfs.io/ipfs/'),
    RAZORPAY_KEY_ID: zod_1.z.string().optional(),
    RAZORPAY_KEY_SECRET: zod_1.z.string().optional(),
    RAZORPAY_WEBHOOK_SECRET: zod_1.z.string().optional(),
    STRIPE_SECRET_KEY: zod_1.z.string().optional(),
    STRIPE_WEBHOOK_SECRET: zod_1.z.string().optional(),
    ADMIN_EMAILS: zod_1.z.string().default('admin@synex.ai'),
    BCRYPT_ROUNDS: zod_1.z.coerce.number().positive().default(12),
    RATE_LIMIT_WINDOW_MS: zod_1.z.coerce.number().positive().default(900000),
    RATE_LIMIT_MAX_REQUESTS: zod_1.z.coerce.number().positive().default(100),
    SESSION_SECRET: zod_1.z.string().min(1),
    FRONTEND_URL: zod_1.z.string().url().default('http://localhost:3000'),
    PLATFORM_TOKEN_ADDRESS: zod_1.z.string().optional(),
    PLATFORM_TOKEN_SYMBOL: zod_1.z.string().default('LXON'),
    GOVERNANCE_VOTING_PERIOD_DAYS: zod_1.z.coerce.number().positive().default(7),
    GOVERNANCE_QUORUM_PERCENTAGE: zod_1.z.coerce.number().positive().default(10),
    STAKING_REWARD_RATE: zod_1.z.coerce.number().positive().default(12),
    STAKING_LOCK_PERIOD_DAYS: zod_1.z.coerce.number().positive().default(30),
    LOG_LEVEL: zod_1.z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});


/***/ }),

/***/ "./src/modules/common/decorators/current-user.decorator.ts":
/*!*****************************************************************!*\
  !*** ./src/modules/common/decorators/current-user.decorator.ts ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CurrentUserId = exports.CurrentUser = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
exports.CurrentUser = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if (!data) {
        return user;
    }
    return data ? user?.[data] : user;
});
exports.CurrentUserId = (0, common_1.createParamDecorator)((_, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.sub;
});


/***/ }),

/***/ "./src/modules/common/decorators/public.decorator.ts":
/*!***********************************************************!*\
  !*** ./src/modules/common/decorators/public.decorator.ts ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Public = exports.IS_PUBLIC_KEY = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
exports.IS_PUBLIC_KEY = 'isPublic';
const Public = () => (0, common_1.SetMetadata)(exports.IS_PUBLIC_KEY, true);
exports.Public = Public;


/***/ }),

/***/ "./src/modules/common/decorators/roles.decorator.ts":
/*!**********************************************************!*\
  !*** ./src/modules/common/decorators/roles.decorator.ts ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AllowAnonymous = exports.Roles = exports.ROLES_KEY = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
exports.ROLES_KEY = 'roles';
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;
const AllowAnonymous = () => (0, common_1.SetMetadata)('allowAnonymous', true);
exports.AllowAnonymous = AllowAnonymous;


/***/ }),

/***/ "./src/modules/common/filters/exceptions.filter.ts":
/*!*********************************************************!*\
  !*** ./src/modules/common/filters/exceptions.filter.ts ***!
  \*********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ExceptionsFilter_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ExceptionsFilter = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
let ExceptionsFilter = ExceptionsFilter_1 = class ExceptionsFilter {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(ExceptionsFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const correlationId = request.headers['x-correlation-id'] ||
            `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        let status;
        let message;
        let error;
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            }
            else if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
                message = exceptionResponse.message;
            }
            else {
                message = exception.message;
            }
            error = exception.name;
            this.logger.warn(`HTTP ${status} - ${request.method} ${request.url}`, message, 'ExceptionsFilter');
        }
        else if (exception instanceof Error) {
            status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Internal server error';
            error = exception.name;
            this.logger.error(`Unhandled exception: ${exception.message}`, exception.stack, 'ExceptionsFilter');
        }
        else {
            status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Internal server error';
            this.logger.error('Unknown exception type', exception, 'ExceptionsFilter');
        }
        const errorResponse = {
            statusCode: status,
            message,
            error,
            timestamp: new Date().toISOString(),
            path: request.url,
            correlationId,
        };
        if (this.configService.get('NODE_ENV') === 'development' && exception instanceof Error) {
            errorResponse.stack = exception.stack;
        }
        response.status(status).json(errorResponse);
    }
};
exports.ExceptionsFilter = ExceptionsFilter;
exports.ExceptionsFilter = ExceptionsFilter = ExceptionsFilter_1 = __decorate([
    (0, common_1.Catch)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], ExceptionsFilter);


/***/ }),

/***/ "./src/modules/common/guards/jwt-auth.guard.ts":
/*!*****************************************************!*\
  !*** ./src/modules/common/guards/jwt-auth.guard.ts ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtAuthGuard = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const public_decorator_1 = __webpack_require__(/*! ../decorators/public.decorator */ "./src/modules/common/decorators/public.decorator.ts");
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
    constructor(reflector) {
        super();
        this.reflector = reflector;
    }
    canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        return super.canActivate(context);
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _a : Object])
], JwtAuthGuard);


/***/ }),

/***/ "./src/modules/common/guards/pin-biometric-auth.guard.ts":
/*!***************************************************************!*\
  !*** ./src/modules/common/guards/pin-biometric-auth.guard.ts ***!
  \***************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PinBiometricAuthGuard = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../modules/prisma.service */ "./src/modules/common/modules/prisma.service.ts");
const transaction_auth_service_1 = __webpack_require__(/*! ../services/transaction-auth.service */ "./src/modules/common/services/transaction-auth.service.ts");
let PinBiometricAuthGuard = class PinBiometricAuthGuard {
    constructor(prisma, transactionAuthService) {
        this.prisma = prisma;
        this.transactionAuthService = transactionAuthService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const body = request.body;
        if (!user) {
            throw new common_1.ForbiddenException('Authentication required');
        }
        const dbUser = await this.prisma.user.findUnique({
            where: { id: user.sub },
            select: {
                id: true,
                pinHash: true,
                biometricEnabled: true,
                biometricPublicKey: true,
                isPinBiometricRequired: true,
            },
        });
        if (!dbUser) {
            throw new common_1.ForbiddenException('User not found');
        }
        if (!dbUser.isPinBiometricRequired) {
            return true;
        }
        const hasPin = !!dbUser.pinHash;
        const hasBiometric = !!dbUser.biometricEnabled;
        if (!hasPin && !hasBiometric) {
            throw new common_1.ForbiddenException('PIN or biometric authentication is required for transactions. Please set up PIN or biometric in security settings.');
        }
        if (body.pin) {
            if (!hasPin) {
                throw new common_1.ForbiddenException('PIN is not set up for this account');
            }
            const isValid = await this.transactionAuthService.verifyPin(user.sub, body.pin);
            if (!isValid) {
                throw new common_1.ForbiddenException('Invalid PIN');
            }
            request.verifiedPin = true;
            return true;
        }
        if (body.biometricSignature) {
            if (!hasBiometric) {
                throw new common_1.ForbiddenException('Biometric is not enabled for this account');
            }
            if (!dbUser.biometricPublicKey) {
                throw new common_1.ForbiddenException('Biometric public key not found');
            }
            const parts = body.biometricSignature.split(':');
            if (parts.length !== 2) {
                throw new common_1.ForbiddenException('Invalid biometric signature format. Expected: base64(challenge):base64(signature)');
            }
            const [challengeB64, signatureB64] = parts;
            const isValid = await this.transactionAuthService.verifyBiometricSignature(user.sub, challengeB64, signatureB64);
            if (!isValid) {
                throw new common_1.ForbiddenException('Invalid biometric signature');
            }
            request.verifiedBiometric = true;
            return true;
        }
        throw new common_1.ForbiddenException('PIN or biometric verification required for this transaction');
    }
};
exports.PinBiometricAuthGuard = PinBiometricAuthGuard;
exports.PinBiometricAuthGuard = PinBiometricAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof transaction_auth_service_1.TransactionAuthService !== "undefined" && transaction_auth_service_1.TransactionAuthService) === "function" ? _b : Object])
], PinBiometricAuthGuard);


/***/ }),

/***/ "./src/modules/common/guards/roles.guard.ts":
/*!**************************************************!*\
  !*** ./src/modules/common/guards/roles.guard.ts ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RolesGuard = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const roles_decorator_1 = __webpack_require__(/*! ../decorators/roles.decorator */ "./src/modules/common/decorators/roles.decorator.ts");
let RolesGuard = class RolesGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user || !user.role) {
            throw new common_1.ForbiddenException('Access denied: insufficient permissions');
        }
        const hasRole = requiredRoles.includes(user.role);
        if (!hasRole) {
            throw new common_1.ForbiddenException(`Access denied: requires one of roles [${requiredRoles.join(', ')}]`);
        }
        return true;
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _a : Object])
], RolesGuard);


/***/ }),

/***/ "./src/modules/common/interceptors/logging.interceptor.ts":
/*!****************************************************************!*\
  !*** ./src/modules/common/interceptors/logging.interceptor.ts ***!
  \****************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var LoggingInterceptor_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LoggingInterceptor = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const operators_1 = __webpack_require__(/*! rxjs/operators */ "rxjs/operators");
let LoggingInterceptor = LoggingInterceptor_1 = class LoggingInterceptor {
    constructor() {
        this.logger = new common_1.Logger(LoggingInterceptor_1.name);
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const { method, url } = request;
        const startTime = Date.now();
        return next.handle().pipe((0, operators_1.map)((data) => {
            const responseTime = Date.now() - startTime;
            const statusCode = response.statusCode || 200;
            const log = {
                method,
                url,
                statusCode,
                responseTime,
                userAgent: request.headers['user-agent'],
                ip: request.ip || request.connection?.remoteAddress,
            };
            if (statusCode >= 500) {
                this.logger.error(`${method} ${url} ${statusCode} ${responseTime}ms`, log);
            }
            else if (statusCode >= 400) {
                this.logger.warn(`${method} ${url} ${statusCode} ${responseTime}ms`, log);
            }
            else {
                this.logger.log(`${method} ${url} ${statusCode} ${responseTime}ms`);
            }
            return data;
        }), (0, operators_1.tap)({
            error: (error) => {
                const responseTime = Date.now() - startTime;
                this.logger.error(`${method} ${url} ${error.status || 500} ${responseTime}ms`, error.message, 'LoggingInterceptor');
            },
        }));
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = LoggingInterceptor_1 = __decorate([
    (0, common_1.Injectable)()
], LoggingInterceptor);


/***/ }),

/***/ "./src/modules/common/middleware/security.middleware.ts":
/*!**************************************************************!*\
  !*** ./src/modules/common/middleware/security.middleware.ts ***!
  \**************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SecurityMiddleware = void 0;
exports.securityMiddleware = securityMiddleware;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
function securityMiddleware(req, res, next) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        const contentType = req.headers['content-type'];
        if (!contentType || !contentType.includes('application/json')) {
            next(new common_1.BadRequestException('Content-Type must be application/json'));
            return;
        }
    }
    next();
}
const common_2 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
let SecurityMiddleware = class SecurityMiddleware {
    use(req, res, next) {
        securityMiddleware(req, res, next);
    }
};
exports.SecurityMiddleware = SecurityMiddleware;
exports.SecurityMiddleware = SecurityMiddleware = __decorate([
    (0, common_2.Injectable)()
], SecurityMiddleware);


/***/ }),

/***/ "./src/modules/common/modules/crypto/crypto.module.ts":
/*!************************************************************!*\
  !*** ./src/modules/common/modules/crypto/crypto.module.ts ***!
  \************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CryptoModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const crypto_service_1 = __webpack_require__(/*! ./crypto.service */ "./src/modules/common/modules/crypto/crypto.service.ts");
let CryptoModule = class CryptoModule {
};
exports.CryptoModule = CryptoModule;
exports.CryptoModule = CryptoModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [crypto_service_1.CryptoService],
        exports: [crypto_service_1.CryptoService],
    })
], CryptoModule);


/***/ }),

/***/ "./src/modules/common/modules/crypto/crypto.service.ts":
/*!*************************************************************!*\
  !*** ./src/modules/common/modules/crypto/crypto.service.ts ***!
  \*************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CryptoService_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CryptoService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const crypto = __importStar(__webpack_require__(/*! crypto */ "crypto"));
let CryptoService = CryptoService_1 = class CryptoService {
    constructor() {
        this.logger = new common_1.Logger(CryptoService_1.name);
        this.algorithm = 'aes-256-gcm';
        this.keyLength = 32;
        this.ivLength = 16;
        this.tagLength = 16;
        const secret = process.env.SYNEX_OWNER_KEY;
        if (!secret) {
            if (process.env.NODE_ENV === 'production') {
                throw new Error('SYNEX_OWNER_KEY environment variable is required in production');
            }
            this.logger.warn('SYNEX_OWNER_KEY not set. Using development fallback key. DO NOT USE IN PRODUCTION.');
            this.ownerKey = crypto.scryptSync('synex-dev-only-key-change-in-production', 'owner-salt', this.keyLength);
        }
        else {
            this.ownerKey = crypto.scryptSync(secret, 'owner-salt', this.keyLength);
            this.logger.log('Owner encryption key loaded from SYNEX_OWNER_KEY environment variable');
        }
    }
    encrypt(plaintext) {
        const iv = crypto.randomBytes(this.ivLength);
        const cipher = crypto.createCipheriv(this.algorithm, this.ownerKey, iv);
        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag();
        return {
            ciphertext: encrypted,
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex'),
        };
    }
    decrypt(payload) {
        const decipher = crypto.createDecipheriv(this.algorithm, this.ownerKey, Buffer.from(payload.iv, 'hex'));
        decipher.setAuthTag(Buffer.from(payload.authTag, 'hex'));
        let decrypted = decipher.update(payload.ciphertext, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    encryptObject(obj) {
        return this.encrypt(JSON.stringify(obj));
    }
    decryptObject(payload) {
        const decrypted = this.decrypt(payload);
        return JSON.parse(decrypted);
    }
    hash(data) {
        return crypto.createHash('sha256').update(data).digest('hex');
    }
    generateNonce() {
        return crypto.randomBytes(16).toString('hex');
    }
    verifyHash(data, expectedHash) {
        const computedHash = this.hash(data);
        return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(expectedHash));
    }
};
exports.CryptoService = CryptoService;
exports.CryptoService = CryptoService = CryptoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], CryptoService);


/***/ }),

/***/ "./src/modules/common/modules/crypto/owner-guard.service.ts":
/*!******************************************************************!*\
  !*** ./src/modules/common/modules/crypto/owner-guard.service.ts ***!
  \******************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OwnerGuardService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
let OwnerGuardService = class OwnerGuardService {
    constructor(configService) {
        this.configService = configService;
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const ownerRoles = ['SUPER_ADMIN', 'OWNER'];
        if (!user || !ownerRoles.includes(user.role)) {
            throw new common_1.ForbiddenException('Only the Synex owner can access decrypted user data');
        }
        return true;
    }
};
exports.OwnerGuardService = OwnerGuardService;
exports.OwnerGuardService = OwnerGuardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], OwnerGuardService);


/***/ }),

/***/ "./src/modules/common/modules/http.module.ts":
/*!***************************************************!*\
  !*** ./src/modules/common/modules/http.module.ts ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HttpModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const axios_1 = __webpack_require__(/*! @nestjs/axios */ "@nestjs/axios");
const http_service_1 = __webpack_require__(/*! ./http.service */ "./src/modules/common/modules/http.service.ts");
let HttpModule = class HttpModule {
};
exports.HttpModule = HttpModule;
exports.HttpModule = HttpModule = __decorate([
    (0, common_1.Module)({
        imports: [axios_1.HttpModule],
        providers: [http_service_1.HttpService],
        exports: [http_service_1.HttpService],
    })
], HttpModule);


/***/ }),

/***/ "./src/modules/common/modules/http.service.ts":
/*!****************************************************!*\
  !*** ./src/modules/common/modules/http.service.ts ***!
  \****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HttpService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const axios_1 = __webpack_require__(/*! @nestjs/axios */ "@nestjs/axios");
const rxjs_1 = __webpack_require__(/*! rxjs */ "rxjs");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const logger_service_1 = __webpack_require__(/*! ./logger.service */ "./src/modules/common/modules/logger.service.ts");
let HttpService = class HttpService {
    constructor(nestHttpService, configService, loggerService) {
        this.axios = nestHttpService.axiosRef;
        this.logger = loggerService;
        this.axios.defaults.timeout = 15000;
        this.axios.defaults.headers.common['User-Agent'] =
            'Synex-Backend/1.0';
    }
    get(url, config) {
        return this.request('GET', url, undefined, config);
    }
    post(url, data, config) {
        return this.request('POST', url, data, config);
    }
    put(url, data, config) {
        return this.request('PUT', url, data, config);
    }
    patch(url, data, config) {
        return this.request('PATCH', url, data, config);
    }
    delete(url, config) {
        return this.request('DELETE', url, undefined, config);
    }
    request(method, url, data, config) {
        const requestConfig = {
            ...config,
            method,
            url,
            data,
        };
        return new rxjs_1.Observable((subscriber) => {
            this.logger.debug(`HTTP ${method} ${url}`, 'HttpService');
            this.axios
                .request(requestConfig)
                .then((response) => {
                subscriber.next(response);
                subscriber.complete();
            })
                .catch((error) => {
                this.logger.error(`HTTP ${method} ${url} failed`, error.response?.data || error.message, 'HttpService');
                subscriber.error(this.handleError(error));
            });
        });
    }
    getAxiosInstance() {
        return this.axios;
    }
    handleError(error) {
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error;
            return new common_1.InternalServerErrorException({
                message: 'External API request failed',
                statusCode: axiosError.response.status,
                data: axiosError.response.data,
            }, 'ExternalApiError');
        }
        if (error && typeof error === 'object' && 'request' in error) {
            return new common_1.InternalServerErrorException({
                message: 'External API request timeout',
                data: error,
            });
        }
        return new common_1.InternalServerErrorException({
            message: 'External API request failed',
            data: error,
        });
    }
};
exports.HttpService = HttpService;
exports.HttpService = HttpService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _a : Object, typeof (_b = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _b : Object, typeof (_c = typeof logger_service_1.LoggerService !== "undefined" && logger_service_1.LoggerService) === "function" ? _c : Object])
], HttpService);


/***/ }),

/***/ "./src/modules/common/modules/logger.module.ts":
/*!*****************************************************!*\
  !*** ./src/modules/common/modules/logger.module.ts ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LoggerModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const logger_service_1 = __webpack_require__(/*! ./logger.service */ "./src/modules/common/modules/logger.service.ts");
let LoggerModule = class LoggerModule {
};
exports.LoggerModule = LoggerModule;
exports.LoggerModule = LoggerModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [logger_service_1.LoggerService],
        exports: [logger_service_1.LoggerService],
    })
], LoggerModule);


/***/ }),

/***/ "./src/modules/common/modules/logger.service.ts":
/*!******************************************************!*\
  !*** ./src/modules/common/modules/logger.service.ts ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LoggerService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const winston = __importStar(__webpack_require__(/*! winston */ "winston"));
let LoggerService = class LoggerService {
    constructor() {
        this.logger = winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(winston.format.colorize(), winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.printf(({ timestamp, level, message }) => {
                        return timestamp + ' ' + level.toUpperCase() + ': ' + message;
                    })),
                }),
            ],
            exitOnError: false,
        });
    }
    log(message, context) {
        this.logger.info(message, { context: context || 'Application' });
    }
    error(message, trace, context) {
        this.logger.error(message, { context: context || 'Application', trace });
    }
    warn(message, context) {
        this.logger.warn(message, { context: context || 'Application' });
    }
    debug(message, context) {
        this.logger.debug(message, { context: context || 'Application' });
    }
    verbose(message, context) {
        this.logger.verbose(message, { context: context || 'Application' });
    }
};
exports.LoggerService = LoggerService;
exports.LoggerService = LoggerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], LoggerService);


/***/ }),

/***/ "./src/modules/common/modules/prisma.module.ts":
/*!*****************************************************!*\
  !*** ./src/modules/common/modules/prisma.module.ts ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PrismaModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ./prisma.service */ "./src/modules/common/modules/prisma.service.ts");
let PrismaModule = class PrismaModule {
};
exports.PrismaModule = PrismaModule;
exports.PrismaModule = PrismaModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [prisma_service_1.PrismaService],
        exports: [prisma_service_1.PrismaService],
    })
], PrismaModule);


/***/ }),

/***/ "./src/modules/common/modules/prisma.service.ts":
/*!******************************************************!*\
  !*** ./src/modules/common/modules/prisma.service.ts ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PrismaService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PrismaService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const client_1 = __webpack_require__(/*! @prisma/client */ "@prisma/client");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
let PrismaService = PrismaService_1 = class PrismaService extends client_1.PrismaClient {
    constructor(configService) {
        super({
            log: configService.get('NODE_ENV') === 'development'
                ? ['query', 'info', 'warn', 'error']
                : ['warn', 'error'],
        });
        this.configService = configService;
        this.logger = new common_1.Logger(PrismaService_1.name);
    }
    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log('Prisma connected to database');
        }
        catch (error) {
            this.logger.error('Failed to connect to database', error);
            process.exit(1);
        }
    }
    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('Prisma disconnected from database');
    }
    async healthCheck() {
        try {
            await this.$queryRaw `SELECT 1`;
            return { status: 'healthy', timestamp: new Date().toISOString() };
        }
        catch (error) {
            this.logger.error('Database health check failed', error);
            return { status: 'unhealthy', timestamp: new Date().toISOString() };
        }
    }
    async cleanDatabase() {
        if (this.configService.get('NODE_ENV') === 'production') {
            throw new Error('Cannot clean database in production');
        }
        const models = client_1.Prisma.dmmf.datamodel.models.map((model) => model.name);
        await this.$executeRawUnsafe(`TRUNCATE TABLE ${models.map((m) => `"${m}"`).join(', ')} RESTART IDENTITY CASCADE;`);
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], PrismaService);


/***/ }),

/***/ "./src/modules/common/modules/redis.module.ts":
/*!****************************************************!*\
  !*** ./src/modules/common/modules/redis.module.ts ***!
  \****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RedisModule_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RedisModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const common_2 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const redis_service_1 = __webpack_require__(/*! ./redis.service */ "./src/modules/common/modules/redis.service.ts");
let RedisModule = RedisModule_1 = class RedisModule {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_2.Logger(RedisModule_1.name);
    }
    onModuleInit() {
        const redisUrl = this.configService.get('REDIS_URL');
        this.logger.log(`=== REDIS MODULE INITIALIZATION ===`);
        this.logger.log(`REDIS_URL environment variable: ${redisUrl ? 'SET' : 'NOT SET'}`);
        if (redisUrl) {
            this.logger.log(`REDIS_URL value (first 30 chars): ${redisUrl.substring(0, 30)}...`);
        }
        this.logger.log(`REDIS_HOST: ${this.configService.get('REDIS_HOST') || 'NOT SET'}`);
        this.logger.log(`REDIS_PORT: ${this.configService.get('REDIS_PORT') || 'NOT SET'}`);
        this.logger.log(`REDIS_PASSWORD: ${this.configService.get('REDIS_PASSWORD') ? 'SET' : 'NOT SET'}`);
        this.logger.log(`REDIS_DB: ${this.configService.get('REDIS_DB') || 'NOT SET'}`);
        this.logger.log(`====================================`);
    }
};
exports.RedisModule = RedisModule;
exports.RedisModule = RedisModule = RedisModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [redis_service_1.RedisService],
        exports: [redis_service_1.RedisService],
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], RedisModule);


/***/ }),

/***/ "./src/modules/common/modules/redis.service.ts":
/*!*****************************************************!*\
  !*** ./src/modules/common/modules/redis.service.ts ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RedisService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RedisService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const ioredis_1 = __webpack_require__(/*! ioredis */ "ioredis");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
let RedisService = RedisService_1 = class RedisService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(RedisService_1.name);
        this.redisEnabled = false;
        const redisUrl = this.configService.get('REDIS_URL');
        if (!redisUrl) {
            this.logger.warn('REDIS_URL not set - Redis features will be disabled');
            this.client = null;
            this.subscriber = null;
            this.redisEnabled = false;
            return;
        }
        this.logger.log(`REDIS_URL environment variable: SET`);
        this.logger.log(`REDIS_URL value: ${redisUrl.substring(0, 20)}...`);
        const redisConfig = { url: redisUrl };
        this.logger.log(`Redis config: ${JSON.stringify(redisConfig)}`);
        try {
            this.client = new ioredis_1.Redis({
                ...redisConfig,
                maxRetriesPerRequest: 3,
                retryStrategy: (times) => {
                    const delay = Math.min(times * 50, 2000);
                    this.logger.warn(`Redis connection retry attempt ${times}, delaying ${delay}ms`);
                    return delay;
                },
                keepAlive: 30000,
            });
            this.subscriber = new ioredis_1.Redis({
                ...redisConfig,
                maxRetriesPerRequest: null,
            });
            this.client.on('error', (err) => this.logger.error('Redis client error', err));
            this.client.on('connect', () => this.logger.log('Redis client connected'));
            this.subscriber.on('error', (err) => this.logger.error('Redis subscriber error', err));
            this.subscriber.on('connect', () => this.logger.log('Redis subscriber connected'));
            this.redisEnabled = true;
        }
        catch (error) {
            this.logger.error('Failed to initialize Redis client', error);
            this.client = null;
            this.subscriber = null;
            this.redisEnabled = false;
        }
    }
    async onModuleInit() {
        if (!this.redisEnabled) {
            this.logger.warn('Redis is disabled - skipping initialization');
            return;
        }
        try {
            await this.client.ping();
            await this.subscriber.ping();
            this.logger.log('Redis initialized successfully');
        }
        catch (error) {
            this.logger.warn('Redis connection failed: Redis features will be disabled', error);
        }
    }
    async onModuleDestroy() {
        if (!this.redisEnabled) {
            return;
        }
        await this.client.quit();
        await this.subscriber.quit();
        this.logger.log('Redis connections closed');
    }
    getClient() {
        if (!this.redisEnabled) {
            throw new Error('Redis is not enabled');
        }
        return this.client;
    }
    getSubscriber() {
        if (!this.redisEnabled) {
            throw new Error('Redis is not enabled');
        }
        return this.subscriber;
    }
    async get(key) {
        if (!this.redisEnabled)
            return null;
        const value = await this.client.get(key);
        if (!value)
            return null;
        try {
            return JSON.parse(value);
        }
        catch {
            return value;
        }
    }
    async set(key, value, ttlSeconds) {
        if (!this.redisEnabled)
            return;
        const serialized = typeof value === 'string' ? value : JSON.stringify(value);
        if (ttlSeconds) {
            await this.client.setex(key, ttlSeconds, serialized);
        }
        else {
            await this.client.set(key, serialized);
        }
    }
    async del(key) {
        if (!this.redisEnabled)
            return;
        await this.client.del(key);
    }
    async delPattern(pattern) {
        if (!this.redisEnabled)
            return 0;
        const keys = await this.client.keys(pattern);
        if (keys.length === 0)
            return 0;
        return this.client.del(keys);
    }
    async exists(key) {
        if (!this.redisEnabled)
            return false;
        return (await this.client.exists(key)) === 1;
    }
    async expire(key, ttlSeconds) {
        if (!this.redisEnabled)
            return;
        await this.client.expire(key, ttlSeconds);
    }
    async ttl(key) {
        if (!this.redisEnabled)
            return -1;
        return this.client.ttl(key);
    }
    async publish(channel, message) {
        if (!this.redisEnabled)
            return 0;
        return this.client.publish(channel, message);
    }
    async subscribe(channel, callback) {
        if (!this.redisEnabled)
            return;
        await this.subscriber.subscribe(channel);
        this.subscriber.on('message', (ch, msg) => {
            if (ch === channel)
                callback(msg);
        });
    }
    async healthCheck() {
        if (!this.redisEnabled) {
            return { status: 'disabled', timestamp: new Date().toISOString() };
        }
        const pong = await this.client.ping();
        return { status: pong === 'PONG' ? 'healthy' : 'unhealthy', timestamp: new Date().toISOString() };
    }
    async incr(key) {
        if (!this.redisEnabled)
            return 0;
        return this.client.incr(key);
    }
    async decr(key) {
        if (!this.redisEnabled)
            return 0;
        return this.client.decr(key);
    }
    async hgetall(key) {
        if (!this.redisEnabled)
            return {};
        return this.client.hgetall(key);
    }
    async hset(key, field, value) {
        if (!this.redisEnabled)
            return 0;
        return this.client.hset(key, field, value);
    }
    async hdel(key, field) {
        if (!this.redisEnabled)
            return 0;
        return this.client.hdel(key, field);
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], RedisService);


/***/ }),

/***/ "./src/modules/common/pipes/parse-pagination.pipe.ts":
/*!***********************************************************!*\
  !*** ./src/modules/common/pipes/parse-pagination.pipe.ts ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ParsePaginationPipe = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
let ParsePaginationPipe = class ParsePaginationPipe {
    constructor() {
        this.DEFAULT_PAGE = 1;
        this.DEFAULT_LIMIT = 20;
        this.MAX_LIMIT = 100;
    }
    transform(value, metadata) {
        if (metadata.type !== 'query') {
            return {
                page: this.DEFAULT_PAGE,
                limit: this.DEFAULT_LIMIT,
                offset: 0,
            };
        }
        const query = value;
        const page = parseInt(this.extractString(query, 'page'), 10);
        const limit = parseInt(this.extractString(query, 'limit'), 10);
        if (!isNaN(page) && page < 1) {
            throw new common_1.BadRequestException('Page must be a positive integer');
        }
        if (!isNaN(limit) && (limit < 1 || limit > this.MAX_LIMIT)) {
            throw new common_1.BadRequestException(`Limit must be between 1 and ${this.MAX_LIMIT}`);
        }
        const validPage = isNaN(page) ? this.DEFAULT_PAGE : page;
        const validLimit = isNaN(limit) ? this.DEFAULT_LIMIT : Math.min(limit, this.MAX_LIMIT);
        return {
            page: validPage,
            limit: validLimit,
            offset: (validPage - 1) * validLimit,
        };
    }
    extractString(query, key) {
        const value = query[key];
        if (Array.isArray(value)) {
            return String(value[0]);
        }
        return value !== undefined ? String(value) : '';
    }
};
exports.ParsePaginationPipe = ParsePaginationPipe;
exports.ParsePaginationPipe = ParsePaginationPipe = __decorate([
    (0, common_1.Injectable)()
], ParsePaginationPipe);


/***/ }),

/***/ "./src/modules/common/services/transaction-auth.service.ts":
/*!*****************************************************************!*\
  !*** ./src/modules/common/services/transaction-auth.service.ts ***!
  \*****************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TransactionAuthService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TransactionAuthService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../modules/prisma.service */ "./src/modules/common/modules/prisma.service.ts");
const crypto = __importStar(__webpack_require__(/*! crypto */ "crypto"));
let TransactionAuthService = TransactionAuthService_1 = class TransactionAuthService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(TransactionAuthService_1.name);
        this.bcryptRounds = 12;
        this.challengeTTLMs = 5 * 60 * 1000;
        this.pendingChallenges = new Map();
    }
    async setPin(userId, pin) {
        if (!/^\d{6}$/.test(pin)) {
            throw new common_1.ForbiddenException('PIN must be exactly 6 digits');
        }
        const pinHash = await Promise.resolve().then(() => __importStar(__webpack_require__(/*! bcrypt */ "bcrypt"))).then(bcrypt => bcrypt.hash(pin, this.bcryptRounds));
        await this.prisma.user.update({
            where: { id: userId },
            data: { pinHash },
        });
        this.logger.log(`PIN set for user ${userId}`, 'TransactionAuthService');
        return { success: true, message: 'PIN set successfully' };
    }
    async verifyPin(userId, pin) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { pinHash: true },
        });
        if (!user || !user.pinHash) {
            return false;
        }
        const bcrypt = await Promise.resolve().then(() => __importStar(__webpack_require__(/*! bcrypt */ "bcrypt")));
        return bcrypt.compare(pin, user.pinHash);
    }
    async removePin(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { pinHash: null },
        });
        this.logger.log(`PIN removed for user ${userId}`, 'TransactionAuthService');
        return { success: true, message: 'PIN removed successfully' };
    }
    async enableBiometric(userId, publicKey) {
        if (!publicKey || publicKey.length < 32) {
            throw new common_1.ForbiddenException('Invalid biometric public key');
        }
        try {
            const publicKeyBuffer = Buffer.from(publicKey, 'base64');
            crypto.createPublicKey({
                key: publicKeyBuffer,
                format: 'der',
                type: 'spki',
            });
        }
        catch (error) {
            throw new common_1.ForbiddenException('Invalid biometric public key format. Must be a valid base64-encoded SPKI public key.');
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                biometricEnabled: true,
                biometricPublicKey: publicKey,
            },
        });
        this.logger.log(`Biometric enabled for user ${userId}`, 'TransactionAuthService');
        return { success: true, message: 'Biometric authentication enabled' };
    }
    async disableBiometric(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                biometricEnabled: false,
                biometricPublicKey: null,
            },
        });
        this.logger.log(`Biometric disabled for user ${userId}`, 'TransactionAuthService');
        return { success: true, message: 'Biometric authentication disabled' };
    }
    async updateSettings(userId, isPinBiometricRequired) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { pinHash: true, biometricEnabled: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (isPinBiometricRequired && !user.pinHash && !user.biometricEnabled) {
            throw new common_1.ForbiddenException('Cannot require PIN/biometric without setting up at least one method');
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: { isPinBiometricRequired },
        });
        this.logger.log(`PIN/biometric settings updated for user ${userId}: required=${isPinBiometricRequired}`, 'TransactionAuthService');
        return { success: true, message: 'Settings updated successfully' };
    }
    async getSettings(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                pinHash: true,
                biometricEnabled: true,
                isPinBiometricRequired: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return {
            hasPin: !!user.pinHash,
            hasBiometric: user.biometricEnabled,
            isPinBiometricRequired: user.isPinBiometricRequired,
        };
    }
    async generateBiometricChallenge(userId) {
        this.pendingChallenges.delete(userId);
        const challenge = crypto.randomBytes(32).toString('base64');
        const expiresAt = new Date(Date.now() + this.challengeTTLMs);
        this.pendingChallenges.set(userId, { challenge, expiresAt });
        return { challenge, expiresAt };
    }
    async verifyBiometricSignature(userId, challenge, signature) {
        const pendingChallenge = this.pendingChallenges.get(userId);
        if (!pendingChallenge) {
            return false;
        }
        if (new Date() > pendingChallenge.expiresAt) {
            this.pendingChallenges.delete(userId);
            return false;
        }
        if (pendingChallenge.challenge !== challenge) {
            return false;
        }
        this.pendingChallenges.delete(userId);
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { biometricPublicKey: true, biometricEnabled: true },
        });
        if (!user || !user.biometricEnabled || !user.biometricPublicKey) {
            return false;
        }
        try {
            const publicKeyBuffer = Buffer.from(user.biometricPublicKey, 'base64');
            const signatureBuffer = Buffer.from(signature, 'base64');
            const challengeBuffer = Buffer.from(challenge, 'base64');
            const verifyKey = crypto.createPublicKey({
                key: publicKeyBuffer,
                format: 'der',
                type: 'spki',
            });
            const isValid = crypto.verify(null, challengeBuffer, verifyKey, signatureBuffer);
            return isValid;
        }
        catch (error) {
            this.logger.error(`Biometric signature verification failed for user ${userId}:`, error);
            return false;
        }
    }
    async requireTransactionAuth(userId, pin, biometricSignature) {
        const settings = await this.getSettings(userId);
        if (!settings.isPinBiometricRequired) {
            return;
        }
        const pinValid = settings.hasPin && pin ? await this.verifyPin(userId, pin) : false;
        const biometricValid = settings.hasBiometric && !!biometricSignature;
        if (!pinValid && !biometricValid) {
            throw new common_1.ForbiddenException('Transaction authorization required: provide valid PIN or biometric signature');
        }
    }
};
exports.TransactionAuthService = TransactionAuthService;
exports.TransactionAuthService = TransactionAuthService = TransactionAuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], TransactionAuthService);


/***/ }),

/***/ "./src/modules/common/utils/app.utils.ts":
/*!***********************************************!*\
  !*** ./src/modules/common/utils/app.utils.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.maskSensitiveData = exports.isValidUrl = exports.sanitizeString = exports.generateSecureRandomString = exports.throttle = exports.debounce = exports.chunkArray = exports.sleep = exports.formatPercentage = exports.formatUsd = exports.parseTransactionType = exports.getChainCurrency = exports.getChainExplorer = exports.getChainName = exports.isZeroAddress = exports.truncateAddress = exports.normalizeAddress = exports.isValidEthereumAddress = exports.generateId = void 0;
const crypto_1 = __webpack_require__(/*! crypto */ "crypto");
const wallet_entity_1 = __webpack_require__(/*! ../../wallets/entities/wallet.entity */ "./src/modules/wallets/entities/wallet.entity.ts");
const transaction_entity_1 = __webpack_require__(/*! ../../transactions/entities/transaction.entity */ "./src/modules/transactions/entities/transaction.entity.ts");
const generateId = () => (0, crypto_1.randomUUID)();
exports.generateId = generateId;
const isValidEthereumAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
};
exports.isValidEthereumAddress = isValidEthereumAddress;
const normalizeAddress = (address) => {
    return address.toLowerCase().replace(/^0x/, '0x');
};
exports.normalizeAddress = normalizeAddress;
const truncateAddress = (address, startLength = 6, endLength = 4) => {
    if (!address || address.length < startLength + endLength)
        return address;
    return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};
exports.truncateAddress = truncateAddress;
const isZeroAddress = (address) => {
    const normalized = address.replace(/^0x/, '');
    return /^0+$/.test(normalized);
};
exports.isZeroAddress = isZeroAddress;
const getChainName = (chain) => {
    const chainNames = {
        [wallet_entity_1.Chain.ETHEREUM]: 'Ethereum',
        [wallet_entity_1.Chain.POLYGON]: 'Polygon',
        [wallet_entity_1.Chain.BSC]: 'BNB Chain',
        [wallet_entity_1.Chain.ARBITRUM]: 'Arbitrum',
        [wallet_entity_1.Chain.BASE]: 'Base',
        [wallet_entity_1.Chain.AVALANCHE]: 'Avalanche',
        [wallet_entity_1.Chain.LXON]: 'LXON Chain',
    };
    return chainNames[chain] || chain;
};
exports.getChainName = getChainName;
const getChainExplorer = (chain) => {
    const explorers = {
        [wallet_entity_1.Chain.ETHEREUM]: 'https://etherscan.io',
        [wallet_entity_1.Chain.POLYGON]: 'https://polygonscan.com',
        [wallet_entity_1.Chain.BSC]: 'https://bscscan.com',
        [wallet_entity_1.Chain.ARBITRUM]: 'https://arbiscan.io',
        [wallet_entity_1.Chain.BASE]: 'https://basescan.org',
        [wallet_entity_1.Chain.AVALANCHE]: 'https://snowtrace.io',
        [wallet_entity_1.Chain.LXON]: 'https://explorer.lxonevm.com',
    };
    return explorers[chain] || 'https://etherscan.io';
};
exports.getChainExplorer = getChainExplorer;
const getChainCurrency = (chain) => {
    const currencies = {
        [wallet_entity_1.Chain.ETHEREUM]: 'ETH',
        [wallet_entity_1.Chain.POLYGON]: 'MATIC',
        [wallet_entity_1.Chain.BSC]: 'BNB',
        [wallet_entity_1.Chain.ARBITRUM]: 'ETH',
        [wallet_entity_1.Chain.BASE]: 'ETH',
        [wallet_entity_1.Chain.AVALANCHE]: 'AVAX',
        [wallet_entity_1.Chain.LXON]: 'LXON',
    };
    return currencies[chain] || 'ETH';
};
exports.getChainCurrency = getChainCurrency;
const parseTransactionType = (type) => {
    const normalized = type.toLowerCase().replace(/[^a-z]/g, '_');
    return Object.values(transaction_entity_1.TransactionType).find((t) => t.toLowerCase().replace(/[^a-z]/g, '_') === normalized);
};
exports.parseTransactionType = parseTransactionType;
const formatUsd = (value, decimals = 2) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num))
        return '$0.00';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(num);
};
exports.formatUsd = formatUsd;
const formatPercentage = (value, decimals = 2) => {
    if (isNaN(value))
        return '0.00%';
    return `${value.toFixed(decimals)}%`;
};
exports.formatPercentage = formatPercentage;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
exports.sleep = sleep;
const chunkArray = (array, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
};
exports.chunkArray = chunkArray;
const debounce = (func, wait) => {
    let timeout = null;
    return (...args) => {
        if (timeout)
            clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};
exports.debounce = debounce;
const throttle = (func, limit) => {
    let inThrottle = false;
    return (...args) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
};
exports.throttle = throttle;
const generateSecureRandomString = (length) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    return Array.from(randomValues, (x) => chars[x % chars.length]).join('');
};
exports.generateSecureRandomString = generateSecureRandomString;
const sanitizeString = (input) => {
    return input.trim().replace(/\s+/g, ' ');
};
exports.sanitizeString = sanitizeString;
const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
};
exports.isValidUrl = isValidUrl;
const maskSensitiveData = (data) => {
    const masked = {};
    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string' && /(password|secret|token|key|api)/i.test(key)) {
            masked[key] = '***REDACTED***';
        }
        else {
            masked[key] = value;
        }
    }
    return masked;
};
exports.maskSensitiveData = maskSensitiveData;


/***/ }),

/***/ "./src/modules/developer-api/controllers/developer-api.controller.ts":
/*!***************************************************************************!*\
  !*** ./src/modules/developer-api/controllers/developer-api.controller.ts ***!
  \***************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DeveloperApiController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const developer_api_service_1 = __webpack_require__(/*! ../services/developer-api.service */ "./src/modules/developer-api/services/developer-api.service.ts");
const api_key_entity_1 = __webpack_require__(/*! ../entities/api-key.entity */ "./src/modules/developer-api/entities/api-key.entity.ts");
const api_key_auth_guard_1 = __webpack_require__(/*! ../guards/api-key-auth.guard */ "./src/modules/developer-api/guards/api-key-auth.guard.ts");
const current_user_decorator_1 = __webpack_require__(/*! ../../common/decorators/current-user.decorator */ "./src/modules/common/decorators/current-user.decorator.ts");
const roles_decorator_1 = __webpack_require__(/*! ../../common/decorators/roles.decorator */ "./src/modules/common/decorators/roles.decorator.ts");
const roles_guard_1 = __webpack_require__(/*! ../../common/guards/roles.guard */ "./src/modules/common/guards/roles.guard.ts");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../common/guards/jwt-auth.guard */ "./src/modules/common/guards/jwt-auth.guard.ts");
const enums_1 = __webpack_require__(/*! ../../../common/enums */ "./src/common/enums.ts");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
let DeveloperApiController = class DeveloperApiController {
    constructor(developerApiService) {
        this.developerApiService = developerApiService;
    }
    getUserApiKeys(userId) {
        return this.developerApiService.getUserApiKeys(userId);
    }
    createApiKey(userId, dto) {
        return this.developerApiService.createApiKey(userId, dto);
    }
    revokeApiKey(userId, keyId) {
        return this.developerApiService.revokeApiKey(userId, keyId);
    }
    async getPortfolio(userId) {
        return { message: 'Portfolio data would be returned here', userId };
    }
    async searchTokens(query) {
        return { message: 'Token search results would be returned here', query };
    }
};
exports.DeveloperApiController = DeveloperApiController;
__decorate([
    (0, common_1.Get)('keys'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get user API keys' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'API keys retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DeveloperApiController.prototype, "getUserApiKeys", null);
__decorate([
    (0, common_1.Post)('keys'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new API key' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'API key created' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_b = typeof api_key_entity_1.CreateApiKeyDto !== "undefined" && api_key_entity_1.CreateApiKeyDto) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], DeveloperApiController.prototype, "createApiKey", null);
__decorate([
    (0, common_1.Delete)('keys/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke API key' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'API key revoked' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DeveloperApiController.prototype, "revokeApiKey", null);
__decorate([
    (0, common_1.Get)('v1/portfolio'),
    (0, common_1.UseGuards)(api_key_auth_guard_1.ApiKeyAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Developer API: Get portfolio data (API key required)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Portfolio data retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DeveloperApiController.prototype, "getPortfolio", null);
__decorate([
    (0, common_1.Get)('v1/tokens/search'),
    (0, common_1.UseGuards)(api_key_auth_guard_1.ApiKeyAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Developer API: Search tokens (API key required)' }),
    (0, swagger_1.ApiQuery)({ name: 'q', required: true, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token search results' }),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DeveloperApiController.prototype, "searchTokens", null);
exports.DeveloperApiController = DeveloperApiController = __decorate([
    (0, swagger_1.ApiTags)('Developer API'),
    (0, common_1.Controller)('developer'),
    __metadata("design:paramtypes", [typeof (_a = typeof developer_api_service_1.DeveloperApiService !== "undefined" && developer_api_service_1.DeveloperApiService) === "function" ? _a : Object])
], DeveloperApiController);


/***/ }),

/***/ "./src/modules/developer-api/developer-api.module.ts":
/*!***********************************************************!*\
  !*** ./src/modules/developer-api/developer-api.module.ts ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DeveloperApiModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
const prisma_module_1 = __webpack_require__(/*! ../common/modules/prisma.module */ "./src/modules/common/modules/prisma.module.ts");
const redis_module_1 = __webpack_require__(/*! ../common/modules/redis.module */ "./src/modules/common/modules/redis.module.ts");
const logger_module_1 = __webpack_require__(/*! ../common/modules/logger.module */ "./src/modules/common/modules/logger.module.ts");
const auth_module_1 = __webpack_require__(/*! ../auth/auth.module */ "./src/modules/auth/auth.module.ts");
const developer_api_service_1 = __webpack_require__(/*! ./services/developer-api.service */ "./src/modules/developer-api/services/developer-api.service.ts");
const developer_api_controller_1 = __webpack_require__(/*! ./controllers/developer-api.controller */ "./src/modules/developer-api/controllers/developer-api.controller.ts");
const api_key_auth_guard_1 = __webpack_require__(/*! ./guards/api-key-auth.guard */ "./src/modules/developer-api/guards/api-key-auth.guard.ts");
let DeveloperApiModule = class DeveloperApiModule {
};
exports.DeveloperApiModule = DeveloperApiModule;
exports.DeveloperApiModule = DeveloperApiModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, redis_module_1.RedisModule, logger_module_1.LoggerModule, auth_module_1.AuthModule, passport_1.PassportModule],
        controllers: [developer_api_controller_1.DeveloperApiController],
        providers: [developer_api_service_1.DeveloperApiService, api_key_auth_guard_1.ApiKeyAuthGuard],
        exports: [developer_api_service_1.DeveloperApiService, api_key_auth_guard_1.ApiKeyAuthGuard],
    })
], DeveloperApiModule);


/***/ }),

/***/ "./src/modules/developer-api/entities/api-key.entity.ts":
/*!**************************************************************!*\
  !*** ./src/modules/developer-api/entities/api-key.entity.ts ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./src/modules/developer-api/guards/api-key-auth.guard.ts":
/*!****************************************************************!*\
  !*** ./src/modules/developer-api/guards/api-key-auth.guard.ts ***!
  \****************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiKeyAuthGuard = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const developer_api_service_1 = __webpack_require__(/*! ../services/developer-api.service */ "./src/modules/developer-api/services/developer-api.service.ts");
const public_decorator_1 = __webpack_require__(/*! ../../common/decorators/public.decorator */ "./src/modules/common/decorators/public.decorator.ts");
let ApiKeyAuthGuard = class ApiKeyAuthGuard extends (0, passport_1.AuthGuard)('api-key') {
    constructor(developerApiService, reflector) {
        super();
        this.developerApiService = developerApiService;
        this.reflector = reflector;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('Missing or invalid Authorization header');
        }
        const apiKey = authHeader.substring(7);
        const keyData = await this.developerApiService.validateApiKey(apiKey);
        if (!keyData) {
            throw new common_1.UnauthorizedException('Invalid API key');
        }
        const rateLimit = await this.developerApiService.checkRateLimit(keyData.userId, keyData.id);
        if (!rateLimit.allowed) {
            throw new common_1.UnauthorizedException('Rate limit exceeded');
        }
        request.apiKey = keyData;
        request.user = keyData.user;
        return true;
    }
};
exports.ApiKeyAuthGuard = ApiKeyAuthGuard;
exports.ApiKeyAuthGuard = ApiKeyAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof developer_api_service_1.DeveloperApiService !== "undefined" && developer_api_service_1.DeveloperApiService) === "function" ? _a : Object, typeof (_b = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _b : Object])
], ApiKeyAuthGuard);


/***/ }),

/***/ "./src/modules/developer-api/services/developer-api.service.ts":
/*!*********************************************************************!*\
  !*** ./src/modules/developer-api/services/developer-api.service.ts ***!
  \*********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DeveloperApiService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../common/modules/prisma.service */ "./src/modules/common/modules/prisma.service.ts");
const redis_service_1 = __webpack_require__(/*! ../../common/modules/redis.service */ "./src/modules/common/modules/redis.service.ts");
const crypto = __importStar(__webpack_require__(/*! crypto */ "crypto"));
const logger_service_1 = __webpack_require__(/*! ../../common/modules/logger.service */ "./src/modules/common/modules/logger.service.ts");
let DeveloperApiService = class DeveloperApiService {
    constructor(prisma, redisService) {
        this.prisma = prisma;
        this.redisService = redisService;
        this.logger = new logger_service_1.LoggerService();
        this.apiKeyPrefix = 'cmai_';
        this.apiKeyLength = 32;
    }
    async getUserApiKeys(userId) {
        return this.prisma.apiKey.findMany({
            where: { userId, isActive: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getApiKeyById(userId, keyId) {
        const apiKey = await this.prisma.apiKey.findFirst({
            where: { id: keyId, userId },
        });
        if (!apiKey) {
            throw new common_1.NotFoundException('API key not found');
        }
        return apiKey;
    }
    async createApiKey(userId, dto) {
        const rawKey = this.generateApiKey();
        const keyHash = this.hashApiKey(rawKey);
        const apiKey = await this.prisma.apiKey.create({
            data: {
                userId,
                name: dto.name,
                keyHash,
                keyPrefix: rawKey.slice(0, 8),
                permissions: JSON.stringify(dto.permissions || { read: true }),
                expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
                isActive: true,
            },
        });
        this.logger.log(`API key created: ${apiKey.id} for user ${userId}`, 'DeveloperApiService');
        return {
            id: apiKey.id,
            name: apiKey.name,
            keyPrefix: apiKey.keyPrefix,
            key: `${this.apiKeyPrefix}${rawKey}`,
            permissions: typeof apiKey.permissions === 'string' ? JSON.parse(apiKey.permissions) : apiKey.permissions,
            lastUsedAt: apiKey.lastUsedAt,
            expiresAt: apiKey.expiresAt,
            isActive: apiKey.isActive,
            createdAt: apiKey.createdAt,
        };
    }
    async revokeApiKey(userId, keyId) {
        await this.getApiKeyById(userId, keyId);
        await this.prisma.apiKey.update({
            where: { id: keyId },
            data: { isActive: false },
        });
        this.logger.log(`API key revoked: ${keyId}`, 'DeveloperApiService');
    }
    async validateApiKey(rawKey) {
        const keyHash = this.hashApiKey(rawKey.replace(this.apiKeyPrefix, ''));
        const apiKey = await this.prisma.apiKey.findFirst({
            where: { keyHash, isActive: true },
            include: { user: { select: { id: true, email: true, role: true } } },
        });
        if (!apiKey) {
            return null;
        }
        if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
            return null;
        }
        await this.prisma.apiKey.update({
            where: { id: apiKey.id },
            data: { lastUsedAt: new Date() },
        });
        return apiKey;
    }
    async checkRateLimit(userId, apiKeyId) {
        const key = `ratelimit:${apiKeyId}`;
        const limit = 1000;
        const windowSeconds = 3600;
        const current = await this.redisService.getClient().incr(key);
        if (current === 1) {
            await this.redisService.getClient().expire(key, windowSeconds);
        }
        const remaining = Math.max(0, limit - current);
        return { allowed: current <= limit, remaining };
    }
    generateApiKey() {
        return crypto.randomBytes(this.apiKeyLength).toString('hex');
    }
    hashApiKey(key) {
        return crypto.createHash('sha256').update(key).digest('hex');
    }
};
exports.DeveloperApiService = DeveloperApiService;
exports.DeveloperApiService = DeveloperApiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof redis_service_1.RedisService !== "undefined" && redis_service_1.RedisService) === "function" ? _b : Object])
], DeveloperApiService);


/***/ }),

/***/ "./src/modules/governance/controllers/governance.controller.ts":
/*!*********************************************************************!*\
  !*** ./src/modules/governance/controllers/governance.controller.ts ***!
  \*********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GovernanceController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const governance_service_1 = __webpack_require__(/*! ../services/governance.service */ "./src/modules/governance/services/governance.service.ts");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../common/guards/jwt-auth.guard */ "./src/modules/common/guards/jwt-auth.guard.ts");
const current_user_decorator_1 = __webpack_require__(/*! ../../common/decorators/current-user.decorator */ "./src/modules/common/decorators/current-user.decorator.ts");
const roles_decorator_1 = __webpack_require__(/*! ../../common/decorators/roles.decorator */ "./src/modules/common/decorators/roles.decorator.ts");
const roles_guard_1 = __webpack_require__(/*! ../../common/guards/roles.guard */ "./src/modules/common/guards/roles.guard.ts");
const enums_1 = __webpack_require__(/*! ../../../common/enums */ "./src/common/enums.ts");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const governance_entity_1 = __webpack_require__(/*! ../entities/governance.entity */ "./src/modules/governance/entities/governance.entity.ts");
let GovernanceController = class GovernanceController {
    constructor(governanceService) {
        this.governanceService = governanceService;
    }
    getProposals(userId, status) {
        return this.governanceService.getProposals(userId, status);
    }
    vote(userId, body) {
        return this.governanceService.vote(userId, body.proposalId, body.voteType);
    }
    createProposal(userId, body) {
        return this.governanceService.createProposal(userId, body);
    }
    getVotingPower(userId) {
        return this.governanceService.getUserVotingPower(userId);
    }
};
exports.GovernanceController = GovernanceController;
__decorate([
    (0, common_1.Get)('proposals'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get active governance proposals' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: governance_entity_1.ProposalStatus }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Proposals retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_b = typeof governance_entity_1.ProposalStatus !== "undefined" && governance_entity_1.ProposalStatus) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], GovernanceController.prototype, "getProposals", null);
__decorate([
    (0, common_1.Post)('proposals/vote'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Vote on a proposal' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vote cast successfully' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], GovernanceController.prototype, "vote", null);
__decorate([
    (0, common_1.Post)('proposals'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new governance proposal' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Proposal created' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], GovernanceController.prototype, "createProposal", null);
__decorate([
    (0, common_1.Get)('voting-power'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get user voting power' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Voting power retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GovernanceController.prototype, "getVotingPower", null);
exports.GovernanceController = GovernanceController = __decorate([
    (0, swagger_1.ApiTags)('Governance'),
    (0, common_1.Controller)('governance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [typeof (_a = typeof governance_service_1.GovernanceService !== "undefined" && governance_service_1.GovernanceService) === "function" ? _a : Object])
], GovernanceController);


/***/ }),

/***/ "./src/modules/governance/entities/governance.entity.ts":
/*!**************************************************************!*\
  !*** ./src/modules/governance/entities/governance.entity.ts ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VoteType = exports.ProposalStatus = void 0;
var ProposalStatus;
(function (ProposalStatus) {
    ProposalStatus["ACTIVE"] = "ACTIVE";
    ProposalStatus["PASSED"] = "PASSED";
    ProposalStatus["REJECTED"] = "REJECTED";
    ProposalStatus["PENDING"] = "PENDING";
})(ProposalStatus || (exports.ProposalStatus = ProposalStatus = {}));
var VoteType;
(function (VoteType) {
    VoteType["FOR"] = "FOR";
    VoteType["AGAINST"] = "AGAINST";
    VoteType["ABSTAIN"] = "ABSTAIN";
})(VoteType || (exports.VoteType = VoteType = {}));


/***/ }),

/***/ "./src/modules/governance/governance.module.ts":
/*!*****************************************************!*\
  !*** ./src/modules/governance/governance.module.ts ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GovernanceModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const governance_controller_1 = __webpack_require__(/*! ./controllers/governance.controller */ "./src/modules/governance/controllers/governance.controller.ts");
const governance_service_1 = __webpack_require__(/*! ./services/governance.service */ "./src/modules/governance/services/governance.service.ts");
const prisma_module_1 = __webpack_require__(/*! ../common/modules/prisma.module */ "./src/modules/common/modules/prisma.module.ts");
let GovernanceModule = class GovernanceModule {
};
exports.GovernanceModule = GovernanceModule;
exports.GovernanceModule = GovernanceModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [governance_controller_1.GovernanceController],
        providers: [governance_service_1.GovernanceService],
        exports: [governance_service_1.GovernanceService],
    })
], GovernanceModule);


/***/ }),

/***/ "./src/modules/governance/services/governance.service.ts":
/*!***************************************************************!*\
  !*** ./src/modules/governance/services/governance.service.ts ***!
  \***************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GovernanceService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../common/modules/prisma.service */ "./src/modules/common/modules/prisma.service.ts");
const logger_service_1 = __webpack_require__(/*! ../../common/modules/logger.service */ "./src/modules/common/modules/logger.service.ts");
const governance_entity_1 = __webpack_require__(/*! ../entities/governance.entity */ "./src/modules/governance/entities/governance.entity.ts");
let GovernanceService = class GovernanceService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new logger_service_1.LoggerService();
    }
    async getProposals(userId, status) {
        return [
            {
                id: 'prop-1',
                title: 'Increase Staking APY to 15%',
                description: 'Proposal to increase LXOM staking rewards from 12.5% to 15% APY',
                status: governance_entity_1.ProposalStatus.ACTIVE,
                votesFor: 1250000,
                votesAgainst: 450000,
                quorum: 2000000,
                endsAt: new Date(Date.now() + 86400000 * 3).toISOString(),
            },
            {
                id: 'prop-2',
                title: 'Add Polygon Bridge Support',
                description: 'Enable cross-chain bridging between LXON and Polygon networks',
                status: governance_entity_1.ProposalStatus.PASSED,
                votesFor: 2100000,
                votesAgainst: 320000,
                quorum: 2000000,
                endsAt: new Date(Date.now() - 86400000).toISOString(),
            },
        ];
    }
    async vote(userId, proposalId, voteType) {
        const proposal = {
            id: proposalId,
            userVote: voteType,
            votingPower: 50000,
            timestamp: new Date().toISOString(),
        };
        return {
            success: true,
            message: `Vote ${voteType} cast successfully`,
            proposal,
        };
    }
    async createProposal(userId, data) {
        const proposal = {
            id: `prop-${Date.now()}`,
            ...data,
            status: governance_entity_1.ProposalStatus.ACTIVE,
            votesFor: 0,
            votesAgainst: 0,
            quorum: 1000000,
            endsAt: new Date(Date.now() + 86400000 * 7).toISOString(),
            createdAt: new Date().toISOString(),
        };
        return {
            success: true,
            message: 'Proposal created successfully',
            proposal,
        };
    }
    async getUserVotingPower(userId) {
        return {
            lxomBalance: 50000,
            votingPower: 50000,
            delegations: 0,
        };
    }
};
exports.GovernanceService = GovernanceService;
exports.GovernanceService = GovernanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], GovernanceService);


/***/ }),

/***/ "./src/modules/health/health.controller.ts":
/*!*************************************************!*\
  !*** ./src/modules/health/health.controller.ts ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HealthController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const prisma_service_1 = __webpack_require__(/*! ../common/modules/prisma.service */ "./src/modules/common/modules/prisma.service.ts");
const redis_service_1 = __webpack_require__(/*! ../common/modules/redis.service */ "./src/modules/common/modules/redis.service.ts");
let HealthController = class HealthController {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async health(ip) {
        const checks = {
            database: 'unknown',
            redis: 'unknown',
            memory: process.memoryUsage(),
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
        };
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            checks.database = 'healthy';
        }
        catch {
            checks.database = 'unhealthy';
        }
        try {
            const redisHealth = await this.redis.healthCheck();
            checks.redis = redisHealth.status === "healthy" ? "healthy" : "degraded";
            checks.redis = 'healthy';
        }
        catch {
            checks.redis = 'degraded';
        }
        const isHealthy = checks.database === 'healthy';
        return {
            status: isHealthy ? 'ok' : 'degraded',
            checks,
            service: 'synex-backend',
            version: '1.0.0',
            ip,
        };
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Health check' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Service is healthy' }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'Service is degraded' }),
    __param(0, (0, common_1.Ip)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "health", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('Health'),
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof redis_service_1.RedisService !== "undefined" && redis_service_1.RedisService) === "function" ? _b : Object])
], HealthController);


/***/ }),

/***/ "./src/modules/health/health.module.ts":
/*!*********************************************!*\
  !*** ./src/modules/health/health.module.ts ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HealthModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const health_controller_1 = __webpack_require__(/*! ./health.controller */ "./src/modules/health/health.controller.ts");
let HealthModule = class HealthModule {
};
exports.HealthModule = HealthModule;
exports.HealthModule = HealthModule = __decorate([
    (0, common_1.Module)({
        controllers: [health_controller_1.HealthController],
    })
], HealthModule);


/***/ }),

/***/ "./src/modules/kyc/controllers/kyc.controller.ts":
/*!*******************************************************!*\
  !*** ./src/modules/kyc/controllers/kyc.controller.ts ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.KycController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const kyc_service_1 = __webpack_require__(/*! ../services/kyc.service */ "./src/modules/kyc/services/kyc.service.ts");
const kyc_dto_1 = __webpack_require__(/*! ../dto/kyc.dto */ "./src/modules/kyc/dto/kyc.dto.ts");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../common/guards/jwt-auth.guard */ "./src/modules/common/guards/jwt-auth.guard.ts");
const current_user_decorator_1 = __webpack_require__(/*! ../../common/decorators/current-user.decorator */ "./src/modules/common/decorators/current-user.decorator.ts");
const roles_decorator_1 = __webpack_require__(/*! ../../common/decorators/roles.decorator */ "./src/modules/common/decorators/roles.decorator.ts");
const roles_guard_1 = __webpack_require__(/*! ../../common/guards/roles.guard */ "./src/modules/common/guards/roles.guard.ts");
const enums_1 = __webpack_require__(/*! ../../../common/enums */ "./src/common/enums.ts");
let KycController = class KycController {
    constructor(kycService) {
        this.kycService = kycService;
    }
    async submitKyc(user, dto) {
        return this.kycService.submitKyc(user.sub, dto);
    }
    async getKycStatus(user) {
        return this.kycService.getKycStatus(user.sub);
    }
    async getPendingKyc(user) {
        return this.kycService.getPendingKyc(user.sub);
    }
    async approveKyc(user, userId) {
        return this.kycService.approveKyc(user.sub, userId);
    }
    async rejectKyc(user, userId, reason) {
        if (!reason || reason.trim().length < 5) {
            throw new common_1.BadRequestException('Rejection reason must be at least 5 characters');
        }
        return this.kycService.rejectKyc(user.sub, userId, reason.trim());
    }
};
exports.KycController = KycController;
__decorate([
    (0, common_1.Post)('submit'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Submit KYC verification documents' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'KYC submitted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid KYC data or age requirement not met' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_b = typeof kyc_dto_1.SubmitKycDto !== "undefined" && kyc_dto_1.SubmitKycDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], KycController.prototype, "submitKyc", null);
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user KYC status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'KYC status retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KycController.prototype, "getKycStatus", null);
__decorate([
    (0, common_1.Get)('pending'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get all pending KYC submissions (admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pending KYC submissions retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - admin only' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KycController.prototype, "getPendingKyc", null);
__decorate([
    (0, common_1.Post)('approve/:userId'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Approve user KYC verification (admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'KYC approved' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - admin only' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], KycController.prototype, "approveKyc", null);
__decorate([
    (0, common_1.Post)('reject/:userId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Reject user KYC verification with reason (admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'KYC rejected' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - admin only' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], KycController.prototype, "rejectKyc", null);
exports.KycController = KycController = __decorate([
    (0, swagger_1.ApiTags)('KYC'),
    (0, common_1.Controller)('kyc'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [typeof (_a = typeof kyc_service_1.KycService !== "undefined" && kyc_service_1.KycService) === "function" ? _a : Object])
], KycController);


/***/ }),

/***/ "./src/modules/kyc/dto/kyc.dto.ts":
/*!****************************************!*\
  !*** ./src/modules/kyc/dto/kyc.dto.ts ***!
  \****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SubmitKycDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const kyc_entity_1 = __webpack_require__(/*! ../entities/kyc.entity */ "./src/modules/kyc/entities/kyc.entity.ts");
class SubmitKycDto {
}
exports.SubmitKycDto = SubmitKycDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Full legal name matching official ID',
        example: 'John Doe',
        minLength: 2,
        maxLength: 100,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(2, { message: 'Legal name must be at least 2 characters' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Legal name must not exceed 100 characters' }),
    __metadata("design:type", String)
], SubmitKycDto.prototype, "legalName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Date of birth (must be 18+ years ago)',
        example: '1990-01-15',
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SubmitKycDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current physical residential address',
        example: '123 Main St, City, State, ZIP',
        minLength: 5,
        maxLength: 500,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(5, { message: 'Home address must be at least 5 characters' }),
    (0, class_validator_1.MaxLength)(500, { message: 'Home address must not exceed 500 characters' }),
    __metadata("design:type", String)
], SubmitKycDto.prototype, "homeAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of government ID',
        enum: kyc_entity_1.GovernmentIdType,
        example: kyc_entity_1.GovernmentIdType.PASSPORT,
    }),
    (0, class_validator_1.IsEnum)(kyc_entity_1.GovernmentIdType, { message: 'Invalid government ID type' }),
    __metadata("design:type", typeof (_a = typeof kyc_entity_1.GovernmentIdType !== "undefined" && kyc_entity_1.GovernmentIdType) === "function" ? _a : Object)
], SubmitKycDto.prototype, "governmentIdType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Government ID number',
        example: 'A12345678',
        minLength: 5,
        maxLength: 50,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(5, { message: 'Government ID number must be at least 5 characters' }),
    (0, class_validator_1.MaxLength)(50, { message: 'Government ID number must not exceed 50 characters' }),
    __metadata("design:type", String)
], SubmitKycDto.prototype, "governmentIdNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'URL to front image of government ID',
        example: 'https://storage.example.com/kyc/id-front.jpg',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^https?:\/\//, { message: 'Government ID front URL must be a valid HTTP(S) URL' }),
    __metadata("design:type", String)
], SubmitKycDto.prototype, "governmentIdFrontUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'URL to back image of government ID (optional for some ID types)',
        example: 'https://storage.example.com/kyc/id-back.jpg',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^https?:\/\//, { message: 'Government ID back URL must be a valid HTTP(S) URL' }),
    __metadata("design:type", String)
], SubmitKycDto.prototype, "governmentIdBackUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'URL to selfie image for facial verification',
        example: 'https://storage.example.com/kyc/selfie.jpg',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^https?:\/\//, { message: 'Selfie URL must be a valid HTTP(S) URL' }),
    __metadata("design:type", String)
], SubmitKycDto.prototype, "selfieUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'URL to proof of address document (utility bill/bank statement)',
        example: 'https://storage.example.com/kyc/proof-of-address.pdf',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^https?:\/\//, { message: 'Proof of address URL must be a valid HTTP(S) URL' }),
    __metadata("design:type", String)
], SubmitKycDto.prototype, "proofOfAddressUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment method type',
        enum: kyc_entity_1.PaymentMethodType,
        example: kyc_entity_1.PaymentMethodType.UPI,
    }),
    (0, class_validator_1.IsEnum)(kyc_entity_1.PaymentMethodType, { message: 'Invalid payment method type' }),
    __metadata("design:type", typeof (_b = typeof kyc_entity_1.PaymentMethodType !== "undefined" && kyc_entity_1.PaymentMethodType) === "function" ? _b : Object)
], SubmitKycDto.prototype, "paymentMethodType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last 4 digits of payment method',
        example: '1234',
        minLength: 4,
        maxLength: 4,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(4, { message: 'Payment method last 4 digits must be at least 4 characters' }),
    (0, class_validator_1.MaxLength)(4, { message: 'Payment method last 4 digits must be exactly 4 characters' }),
    __metadata("design:type", String)
], SubmitKycDto.prototype, "paymentMethodLast4", void 0);


/***/ }),

/***/ "./src/modules/kyc/entities/kyc.entity.ts":
/*!************************************************!*\
  !*** ./src/modules/kyc/entities/kyc.entity.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PaymentMethodType = exports.GovernmentIdType = exports.KycStatus = void 0;
var KycStatus;
(function (KycStatus) {
    KycStatus["NOT_SUBMITTED"] = "NOT_SUBMITTED";
    KycStatus["PENDING"] = "PENDING";
    KycStatus["VERIFIED"] = "VERIFIED";
    KycStatus["REJECTED"] = "REJECTED";
})(KycStatus || (exports.KycStatus = KycStatus = {}));
var GovernmentIdType;
(function (GovernmentIdType) {
    GovernmentIdType["PASSPORT"] = "PASSPORT";
    GovernmentIdType["DRIVING_LICENSE"] = "DRIVING_LICENSE";
    GovernmentIdType["NATIONAL_ID"] = "NATIONAL_ID";
})(GovernmentIdType || (exports.GovernmentIdType = GovernmentIdType = {}));
var PaymentMethodType;
(function (PaymentMethodType) {
    PaymentMethodType["BANK_ACCOUNT"] = "BANK_ACCOUNT";
    PaymentMethodType["DEBIT_CARD"] = "DEBIT_CARD";
    PaymentMethodType["CREDIT_CARD"] = "CREDIT_CARD";
    PaymentMethodType["UPI"] = "UPI";
})(PaymentMethodType || (exports.PaymentMethodType = PaymentMethodType = {}));


/***/ }),

/***/ "./src/modules/kyc/kyc.module.ts":
/*!***************************************!*\
  !*** ./src/modules/kyc/kyc.module.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.KycModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_module_1 = __webpack_require__(/*! ../common/modules/prisma.module */ "./src/modules/common/modules/prisma.module.ts");
const kyc_service_1 = __webpack_require__(/*! ./services/kyc.service */ "./src/modules/kyc/services/kyc.service.ts");
const kyc_controller_1 = __webpack_require__(/*! ./controllers/kyc.controller */ "./src/modules/kyc/controllers/kyc.controller.ts");
let KycModule = class KycModule {
};
exports.KycModule = KycModule;
exports.KycModule = KycModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [kyc_controller_1.KycController],
        providers: [kyc_service_1.KycService],
        exports: [kyc_service_1.KycService],
    })
], KycModule);


/***/ }),

/***/ "./src/modules/kyc/services/kyc.service.ts":
/*!*************************************************!*\
  !*** ./src/modules/kyc/services/kyc.service.ts ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var KycService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.KycService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../common/modules/prisma.service */ "./src/modules/common/modules/prisma.service.ts");
const enums_1 = __webpack_require__(/*! ../../../common/enums */ "./src/common/enums.ts");
const kyc_entity_1 = __webpack_require__(/*! ../entities/kyc.entity */ "./src/modules/kyc/entities/kyc.entity.ts");
let KycService = KycService_1 = class KycService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(KycService_1.name);
        this.minimumAge = 18;
    }
    async submitKyc(userId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, role: true, kycStatus: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.role !== enums_1.UserRole.USER) {
            throw new common_1.ForbiddenException('Only regular users can submit KYC verification');
        }
        const birthDate = new Date(dto.dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        if (age < this.minimumAge) {
            throw new common_1.BadRequestException(`You must be at least ${this.minimumAge} years old to complete KYC verification`);
        }
        this.validateGovernmentId(dto.governmentIdType, dto.governmentIdNumber);
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                kycStatus: kyc_entity_1.KycStatus.PENDING,
                kycLegalName: dto.legalName,
                kycDateOfBirth: birthDate,
                kycHomeAddress: dto.homeAddress,
                kycGovernmentIdType: dto.governmentIdType,
                kycGovernmentIdNumber: dto.governmentIdNumber,
                kycGovernmentIdFrontUrl: dto.governmentIdFrontUrl,
                kycGovernmentIdBackUrl: dto.governmentIdBackUrl || null,
                kycSelfieUrl: dto.selfieUrl,
                kycProofOfAddressUrl: dto.proofOfAddressUrl || null,
                kycPaymentMethodType: dto.paymentMethodType,
                kycPaymentMethodLast4: dto.paymentMethodLast4,
                kycSubmissionCount: { increment: 1 },
            },
        });
        this.logger.log(`KYC submitted for user ${userId} (${user.email})`, 'KycService');
        return {
            success: true,
            message: 'KYC verification submitted successfully. Verification typically takes 1-3 business days.',
            status: kyc_entity_1.KycStatus.PENDING,
        };
    }
    async getKycStatus(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                kycStatus: true,
                kycLegalName: true,
                kycGovernmentIdType: true,
                kycVerifiedAt: true,
                kycRejectionReason: true,
                kycSubmissionCount: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return {
            status: user.kycStatus,
            legalName: user.kycLegalName || undefined,
            governmentIdType: user.kycGovernmentIdType,
            verifiedAt: user.kycVerifiedAt || undefined,
            rejectionReason: user.kycRejectionReason || undefined,
            submissionCount: user.kycSubmissionCount,
        };
    }
    async approveKyc(adminId, userId) {
        const admin = await this.prisma.user.findUnique({
            where: { id: adminId },
            select: { role: true },
        });
        if (!admin || (admin.role !== enums_1.UserRole.ADMIN && admin.role !== enums_1.UserRole.SUPER_ADMIN)) {
            throw new common_1.ForbiddenException('Only admins can approve KYC verification');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, kycStatus: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.kycStatus === kyc_entity_1.KycStatus.VERIFIED) {
            return { success: true, message: 'User is already verified' };
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                kycStatus: kyc_entity_1.KycStatus.VERIFIED,
                kycVerifiedAt: new Date(),
                kycRejectionReason: null,
            },
        });
        this.logger.log(`KYC approved for user ${userId} by admin ${adminId}`, 'KycService');
        return { success: true, message: 'KYC verification approved successfully' };
    }
    async rejectKyc(adminId, userId, reason) {
        const admin = await this.prisma.user.findUnique({
            where: { id: adminId },
            select: { role: true },
        });
        if (!admin || (admin.role !== enums_1.UserRole.ADMIN && admin.role !== enums_1.UserRole.SUPER_ADMIN)) {
            throw new common_1.ForbiddenException('Only admins can reject KYC verification');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, kycStatus: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.kycStatus === kyc_entity_1.KycStatus.VERIFIED) {
            throw new common_1.BadRequestException('Cannot reject KYC for already verified user');
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                kycStatus: kyc_entity_1.KycStatus.REJECTED,
                kycRejectionReason: reason,
            },
        });
        this.logger.log(`KYC rejected for user ${userId} by admin ${adminId}: ${reason}`, 'KycService');
        return { success: true, message: 'KYC verification rejected' };
    }
    async getPendingKyc(adminId) {
        const admin = await this.prisma.user.findUnique({
            where: { id: adminId },
            select: { role: true },
        });
        if (!admin || (admin.role !== enums_1.UserRole.ADMIN && admin.role !== enums_1.UserRole.SUPER_ADMIN)) {
            throw new common_1.ForbiddenException('Only admins can view pending KYC submissions');
        }
        const pendingUsers = await this.prisma.user.findMany({
            where: { kycStatus: kyc_entity_1.KycStatus.PENDING },
            select: {
                id: true,
                email: true,
                kycLegalName: true,
                kycDateOfBirth: true,
                kycHomeAddress: true,
                kycGovernmentIdType: true,
                kycGovernmentIdNumber: true,
                kycGovernmentIdFrontUrl: true,
                kycGovernmentIdBackUrl: true,
                kycSelfieUrl: true,
                kycProofOfAddressUrl: true,
                kycPaymentMethodType: true,
                kycPaymentMethodLast4: true,
                kycSubmissionCount: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'asc' },
        });
        return pendingUsers;
    }
    validateGovernmentId(type, number) {
        const cleaned = number.replace(/\s/g, '').toUpperCase();
        switch (type) {
            case kyc_entity_1.GovernmentIdType.PASSPORT:
                if (!/^[A-Z0-9]{6,15}$/.test(cleaned)) {
                    throw new common_1.BadRequestException('Invalid passport number format');
                }
                break;
            case kyc_entity_1.GovernmentIdType.DRIVING_LICENSE:
                if (!/^[A-Z0-9]{5,20}$/.test(cleaned)) {
                    throw new common_1.BadRequestException('Invalid driving license number format');
                }
                break;
            case kyc_entity_1.GovernmentIdType.NATIONAL_ID:
                if (!/^[A-Z0-9]{5,20}$/.test(cleaned)) {
                    throw new common_1.BadRequestException('Invalid national ID number format');
                }
                break;
        }
    }
};
exports.KycService = KycService;
exports.KycService = KycService = KycService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], KycService);


/***/ }),

/***/ "./src/modules/nfts/controllers/nfts.controller.ts":
/*!*********************************************************!*\
  !*** ./src/modules/nfts/controllers/nfts.controller.ts ***!
  \*********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NftsController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const nfts_service_1 = __webpack_require__(/*! ../services/nfts.service */ "./src/modules/nfts/services/nfts.service.ts");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../common/guards/jwt-auth.guard */ "./src/modules/common/guards/jwt-auth.guard.ts");
const current_user_decorator_1 = __webpack_require__(/*! ../../common/decorators/current-user.decorator */ "./src/modules/common/decorators/current-user.decorator.ts");
const roles_decorator_1 = __webpack_require__(/*! ../../common/decorators/roles.decorator */ "./src/modules/common/decorators/roles.decorator.ts");
const roles_guard_1 = __webpack_require__(/*! ../../common/guards/roles.guard */ "./src/modules/common/guards/roles.guard.ts");
const enums_1 = __webpack_require__(/*! ../../../common/enums */ "./src/common/enums.ts");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
let NftsController = class NftsController {
    constructor(nftsService) {
        this.nftsService = nftsService;
    }
    getUserNfts(userId) {
        return this.nftsService.getUserNfts(userId);
    }
    getWalletNfts(userId, walletId) {
        return this.nftsService.getWalletNfts(userId, walletId);
    }
    getNft(userId, nftId) {
        return this.nftsService.getNftById(userId, nftId);
    }
    getCollections(userId) {
        return this.nftsService.getCollections(userId);
    }
    syncNfts(userId, walletId) {
        return this.nftsService.syncNftsForWallet(userId, walletId);
    }
};
exports.NftsController = NftsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get all NFTs for current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'NFTs retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NftsController.prototype, "getUserNfts", null);
__decorate([
    (0, common_1.Get)('wallet/:walletId'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get NFTs for specific wallet' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Wallet NFTs retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Wallet not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('walletId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], NftsController.prototype, "getWalletNfts", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get NFT by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'NFT retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'NFT not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], NftsController.prototype, "getNft", null);
__decorate([
    (0, common_1.Get)('collections'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get NFT collections for current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Collections retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NftsController.prototype, "getCollections", null);
__decorate([
    (0, common_1.Post)('wallet/:walletId/sync'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Sync NFTs from blockchain for wallet' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'NFTs synced' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('walletId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], NftsController.prototype, "syncNfts", null);
exports.NftsController = NftsController = __decorate([
    (0, swagger_1.ApiTags)('NFTs'),
    (0, common_1.Controller)('nfts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [typeof (_a = typeof nfts_service_1.NftsService !== "undefined" && nfts_service_1.NftsService) === "function" ? _a : Object])
], NftsController);


/***/ }),

/***/ "./src/modules/nfts/nfts.module.ts":
/*!*****************************************!*\
  !*** ./src/modules/nfts/nfts.module.ts ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NftsModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_module_1 = __webpack_require__(/*! ../common/modules/prisma.module */ "./src/modules/common/modules/prisma.module.ts");
const http_module_1 = __webpack_require__(/*! ../common/modules/http.module */ "./src/modules/common/modules/http.module.ts");
const logger_module_1 = __webpack_require__(/*! ../common/modules/logger.module */ "./src/modules/common/modules/logger.module.ts");
const auth_module_1 = __webpack_require__(/*! ../auth/auth.module */ "./src/modules/auth/auth.module.ts");
const nfts_service_1 = __webpack_require__(/*! ./services/nfts.service */ "./src/modules/nfts/services/nfts.service.ts");
const nfts_controller_1 = __webpack_require__(/*! ./controllers/nfts.controller */ "./src/modules/nfts/controllers/nfts.controller.ts");
let NftsModule = class NftsModule {
};
exports.NftsModule = NftsModule;
exports.NftsModule = NftsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, http_module_1.HttpModule, logger_module_1.LoggerModule, auth_module_1.AuthModule],
        controllers: [nfts_controller_1.NftsController],
        providers: [nfts_service_1.NftsService],
        exports: [nfts_service_1.NftsService],
    })
], NftsModule);


/***/ }),

/***/ "./src/modules/nfts/services/nfts.service.ts":
/*!***************************************************!*\
  !*** ./src/modules/nfts/services/nfts.service.ts ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NftsService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NftsService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../common/modules/prisma.service */ "./src/modules/common/modules/prisma.service.ts");
const http_service_1 = __webpack_require__(/*! ../../common/modules/http.service */ "./src/modules/common/modules/http.service.ts");
const logger_service_1 = __webpack_require__(/*! ../../common/modules/logger.service */ "./src/modules/common/modules/logger.service.ts");
let NftsService = NftsService_1 = class NftsService {
    constructor(prisma, httpService) {
        this.prisma = prisma;
        this.httpService = httpService;
        this.logger = new logger_service_1.LoggerService(NftsService_1.name);
    }
    async getUserNfts(userId) {
        const wallets = await this.prisma.wallet.findMany({
            where: { userId, isActive: true },
            select: { id: true },
        });
        const walletIds = wallets.map((w) => w.id);
        return this.prisma.nft.findMany({
            where: { walletId: { in: walletIds } },
            include: { wallet: { select: { address: true, chain: true, label: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getWalletNfts(userId, walletId) {
        const wallet = await this.prisma.wallet.findFirst({
            where: { id: walletId, userId },
        });
        if (!wallet) {
            throw new common_1.NotFoundException('Wallet not found');
        }
        return this.prisma.nft.findMany({
            where: { walletId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getNftById(userId, nftId) {
        const nft = await this.prisma.nft.findFirst({
            where: { id: nftId },
            include: { wallet: { where: { userId } } },
        });
        if (!nft) {
            throw new common_1.NotFoundException('NFT not found');
        }
        return nft;
    }
    async getCollections(userId) {
        const nfts = await this.getUserNfts(userId);
        const collectionsMap = new Map();
        for (const nft of nfts) {
            const key = nft.collectionName || nft.contractAddress;
            if (!collectionsMap.has(key)) {
                collectionsMap.set(key, {
                    collectionName: nft.collectionName || 'Unknown Collection',
                    contractAddress: nft.contractAddress,
                    count: 0,
                    floorPriceUsd: nft.floorPriceUsd || undefined,
                    totalValueUsd: '0',
                    nfts: [],
                });
            }
            const collection = collectionsMap.get(key);
            collection.count += 1;
            collection.nfts.push(nft);
            if (nft.floorPriceUsd) {
                collection.floorPriceUsd = nft.floorPriceUsd;
            }
        }
        return Array.from(collectionsMap.values());
    }
    async syncNftsForWallet(userId, walletId) {
        const wallet = await this.prisma.wallet.findFirst({
            where: { id: walletId, userId },
        });
        if (!wallet) {
            throw new common_1.NotFoundException('Wallet not found');
        }
        this.logger.log(`Syncing NFTs for wallet: ${wallet.address}`, 'NftsService');
        try {
            const externalNfts = await this.fetchNftsFromApi(wallet.address, wallet.chain);
            const stored = [];
            for (const nft of externalNfts) {
                const existing = await this.prisma.nft.findUnique({
                    where: {
                        walletId_contractAddress_tokenId: {
                            walletId,
                            contractAddress: nft.contractAddress,
                            tokenId: nft.tokenId,
                        },
                    },
                });
                if (!existing) {
                    const created = await this.prisma.nft.create({
                        data: {
                            ...nft,
                            walletId,
                        },
                    });
                    stored.push(created);
                }
            }
            return stored;
        }
        catch (error) {
            this.logger.warn(`Failed to sync NFTs: ${error.message}`, 'NftsService');
            return [];
        }
    }
    async fetchNftsFromApi(address, chain) {
        try {
            const response = await this.httpService
                .getAxiosInstance()
                .get(`https://${chain === 'ETHEREUM' ? 'api.opensea.io' : 'api.opensea.io'}/api/v1/assets`, {
                params: { owner: address, limit: 50 },
            });
            return response.data.assets?.map((asset) => ({
                contractAddress: asset.asset_contract?.address,
                tokenId: asset.token_id,
                name: asset.name,
                description: asset.description,
                imageUrl: asset.image_url,
                collectionName: asset.collection?.name,
                floorPriceUsd: asset.collection?.stats?.floor_price?.toString(),
                lastSalePriceUsd: asset.last_sale?.total_price?.toString(),
                rarityRank: asset.rarity?.rank,
                traits: asset.traits?.reduce((acc, trait) => {
                    acc[trait.trait_type] = trait.value;
                    return acc;
                }, {}) ? JSON.stringify(asset.traits?.reduce((acc, trait) => {
                    acc[trait.trait_type] = trait.value;
                    return acc;
                }, {})) : null,
            })) || [];
        }
        catch (error) {
            this.logger.warn(`Failed to fetch NFTs from OpenSea: ${error.message}`, 'NftsService');
            return [];
        }
    }
};
exports.NftsService = NftsService;
exports.NftsService = NftsService = NftsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof http_service_1.HttpService !== "undefined" && http_service_1.HttpService) === "function" ? _b : Object])
], NftsService);


/***/ }),

/***/ "./src/modules/notifications/controllers/notifications.controller.ts":
/*!***************************************************************************!*\
  !*** ./src/modules/notifications/controllers/notifications.controller.ts ***!
  \***************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NotificationsController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const notifications_service_1 = __webpack_require__(/*! ../services/notifications.service */ "./src/modules/notifications/services/notifications.service.ts");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../common/guards/jwt-auth.guard */ "./src/modules/common/guards/jwt-auth.guard.ts");
const current_user_decorator_1 = __webpack_require__(/*! ../../common/decorators/current-user.decorator */ "./src/modules/common/decorators/current-user.decorator.ts");
const roles_decorator_1 = __webpack_require__(/*! ../../common/decorators/roles.decorator */ "./src/modules/common/decorators/roles.decorator.ts");
const roles_guard_1 = __webpack_require__(/*! ../../common/guards/roles.guard */ "./src/modules/common/guards/roles.guard.ts");
const enums_1 = __webpack_require__(/*! ../../../common/enums */ "./src/common/enums.ts");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const parse_pagination_pipe_1 = __webpack_require__(/*! ../../common/pipes/parse-pagination.pipe */ "./src/modules/common/pipes/parse-pagination.pipe.ts");
let NotificationsController = class NotificationsController {
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    getUserNotifications(userId, pagination) {
        return this.notificationsService.getUserNotifications(userId, pagination.page, pagination.limit);
    }
    getUnreadCount(userId) {
        return this.notificationsService.getUnreadCount(userId);
    }
    markAsRead(userId, notificationId) {
        return this.notificationsService.markAsRead(userId, notificationId);
    }
    markAllAsRead(userId) {
        return this.notificationsService.markAllAsRead(userId);
    }
    deleteNotification(userId, notificationId) {
        return this.notificationsService.deleteNotification(userId, notificationId);
    }
    deleteAllNotifications(userId) {
        return this.notificationsService.deleteAllNotifications(userId);
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get user notifications' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notifications retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Query)('page', parse_pagination_pipe_1.ParsePaginationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "getUserNotifications", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get unread notification count' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Unread count retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Patch)(':id/read'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Mark notification as read' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification marked as read' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Notification not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Post)('read-all'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Mark all notifications as read' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All notifications marked as read' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "markAllAsRead", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete specific notification' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification deleted' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "deleteNotification", null);
__decorate([
    (0, common_1.Delete)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete all notifications' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All notifications deleted' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "deleteAllNotifications", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, swagger_1.ApiTags)('Notifications'),
    (0, common_1.Controller)('notifications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [typeof (_a = typeof notifications_service_1.NotificationsService !== "undefined" && notifications_service_1.NotificationsService) === "function" ? _a : Object])
], NotificationsController);


/***/ }),

/***/ "./src/modules/notifications/entities/notification.entity.ts":
/*!*******************************************************************!*\
  !*** ./src/modules/notifications/entities/notification.entity.ts ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NotificationType = void 0;
var NotificationType;
(function (NotificationType) {
    NotificationType["ALERT"] = "ALERT";
    NotificationType["SYSTEM"] = "SYSTEM";
    NotificationType["SOCIAL"] = "SOCIAL";
    NotificationType["MARKETING"] = "MARKETING";
})(NotificationType || (exports.NotificationType = NotificationType = {}));


/***/ }),

/***/ "./src/modules/notifications/notifications.module.ts":
/*!***********************************************************!*\
  !*** ./src/modules/notifications/notifications.module.ts ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NotificationsModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_module_1 = __webpack_require__(/*! ../common/modules/prisma.module */ "./src/modules/common/modules/prisma.module.ts");
const redis_module_1 = __webpack_require__(/*! ../common/modules/redis.module */ "./src/modules/common/modules/redis.module.ts");
const logger_module_1 = __webpack_require__(/*! ../common/modules/logger.module */ "./src/modules/common/modules/logger.module.ts");
const auth_module_1 = __webpack_require__(/*! ../auth/auth.module */ "./src/modules/auth/auth.module.ts");
const notifications_service_1 = __webpack_require__(/*! ./services/notifications.service */ "./src/modules/notifications/services/notifications.service.ts");
const notifications_controller_1 = __webpack_require__(/*! ./controllers/notifications.controller */ "./src/modules/notifications/controllers/notifications.controller.ts");
let NotificationsModule = class NotificationsModule {
};
exports.NotificationsModule = NotificationsModule;
exports.NotificationsModule = NotificationsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, redis_module_1.RedisModule, logger_module_1.LoggerModule, auth_module_1.AuthModule],
        controllers: [notifications_controller_1.NotificationsController],
        providers: [notifications_service_1.NotificationsService],
        exports: [notifications_service_1.NotificationsService],
    })
], NotificationsModule);


/***/ }),

/***/ "./src/modules/notifications/services/notifications.service.ts":
/*!*********************************************************************!*\
  !*** ./src/modules/notifications/services/notifications.service.ts ***!
  \*********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NotificationsService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../common/modules/prisma.service */ "./src/modules/common/modules/prisma.service.ts");
const redis_service_1 = __webpack_require__(/*! ../../common/modules/redis.service */ "./src/modules/common/modules/redis.service.ts");
const logger_service_1 = __webpack_require__(/*! ../../common/modules/logger.service */ "./src/modules/common/modules/logger.service.ts");
let NotificationsService = class NotificationsService {
    constructor(prisma, redisService) {
        this.prisma = prisma;
        this.redisService = redisService;
        this.logger = new logger_service_1.LoggerService();
    }
    async getUserNotifications(userId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const [notifications, total, unreadCount] = await Promise.all([
            this.prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip: offset,
                take: limit,
            }),
            this.prisma.notification.count({ where: { userId } }),
            this.prisma.notification.count({ where: { userId, isRead: false } }),
        ]);
        return {
            data: notifications,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                unreadCount,
            },
        };
    }
    async getNotificationById(userId, notificationId) {
        const notification = await this.prisma.notification.findFirst({
            where: { id: notificationId, userId },
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        return {
            ...notification,
            data: typeof notification.data === 'string' ? JSON.parse(notification.data) : notification.data,
        };
    }
    async createNotification(dto) {
        const notification = await this.prisma.notification.create({
            data: {
                userId: dto.userId,
                alertId: dto.alertId,
                type: dto.type,
                title: dto.title,
                message: dto.message,
                data: dto.data ? JSON.stringify(dto.data) : null,
            },
        });
        await this.sendPushNotification(dto.userId, dto.title, dto.message);
        await this.sendEmailNotification(dto.userId, dto.title, dto.message);
        this.logger.log(`Notification created: ${notification.id}`, 'NotificationsService');
        return {
            ...notification,
            data: typeof notification.data === 'string' ? JSON.parse(notification.data) : notification.data,
        };
    }
    async markAsRead(userId, notificationId) {
        await this.getNotificationById(userId, notificationId);
        return this.prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true, readAt: new Date() },
        });
    }
    async markAllAsRead(userId) {
        await this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true, readAt: new Date() },
        });
        this.logger.log(`All notifications marked as read for user ${userId}`, 'NotificationsService');
    }
    async deleteNotification(userId, notificationId) {
        await this.getNotificationById(userId, notificationId);
        await this.prisma.notification.delete({ where: { id: notificationId } });
        this.logger.log(`Notification deleted: ${notificationId}`, 'NotificationsService');
    }
    async deleteAllNotifications(userId) {
        await this.prisma.notification.deleteMany({ where: { userId } });
        this.logger.log(`All notifications deleted for user ${userId}`, 'NotificationsService');
    }
    async getUnreadCount(userId) {
        const count = await this.prisma.notification.count({
            where: { userId, isRead: false },
        });
        return { count };
    }
    async sendPushNotification(userId, title, message) {
        const key = `push:user:${userId}`;
        const notification = JSON.stringify({ userId, title, message, timestamp: new Date().toISOString() });
        await this.redisService.getClient().lpush(key, notification);
        await this.redisService.getClient().ltrim(key, 0, 99);
    }
    async sendEmailNotification(userId, title, message) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, name: true },
        });
        if (!user?.email) {
            return;
        }
        try {
            await this.redisService.getClient().lpush('email:queue', JSON.stringify({
                to: user.email,
                subject: title,
                body: message,
                userId,
            }));
        }
        catch (error) {
            this.logger.warn(`Failed to queue email notification: ${error.message}`, 'NotificationsService');
        }
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof redis_service_1.RedisService !== "undefined" && redis_service_1.RedisService) === "function" ? _b : Object])
], NotificationsService);


/***/ }),

/***/ "./src/modules/payments/controllers/payments.controller.ts":
/*!*****************************************************************!*\
  !*** ./src/modules/payments/controllers/payments.controller.ts ***!
  \*****************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PaymentsController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const payments_service_1 = __webpack_require__(/*! ../services/payments.service */ "./src/modules/payments/services/payments.service.ts");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../common/guards/jwt-auth.guard */ "./src/modules/common/guards/jwt-auth.guard.ts");
const current_user_decorator_1 = __webpack_require__(/*! ../../common/decorators/current-user.decorator */ "./src/modules/common/decorators/current-user.decorator.ts");
const roles_decorator_1 = __webpack_require__(/*! ../../common/decorators/roles.decorator */ "./src/modules/common/decorators/roles.decorator.ts");
const roles_guard_1 = __webpack_require__(/*! ../../common/guards/roles.guard */ "./src/modules/common/guards/roles.guard.ts");
const enums_1 = __webpack_require__(/*! ../../../common/enums */ "./src/common/enums.ts");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const parse_pagination_pipe_1 = __webpack_require__(/*! ../../common/pipes/parse-pagination.pipe */ "./src/modules/common/pipes/parse-pagination.pipe.ts");
let PaymentsController = class PaymentsController {
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    getUserPayments(userId, pagination) {
        return this.paymentsService.getUserPayments(userId, pagination.page, pagination.limit);
    }
    getPayment(userId, paymentId) {
        return this.paymentsService.getPaymentById(userId, paymentId);
    }
    getPaymentStats(userId) {
        return this.paymentsService.getPaymentStats(userId);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get payment history for current user' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payments retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Query)('page', parse_pagination_pipe_1.ParsePaginationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getUserPayments", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get payment details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Payment not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getPayment", null);
__decorate([
    (0, common_1.Get)('stats/summary'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get payment statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment stats retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getPaymentStats", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, swagger_1.ApiTags)('Payments'),
    (0, common_1.Controller)('payments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [typeof (_a = typeof payments_service_1.PaymentsService !== "undefined" && payments_service_1.PaymentsService) === "function" ? _a : Object])
], PaymentsController);


/***/ }),

/***/ "./src/modules/payments/entities/payment.entity.ts":
/*!*********************************************************!*\
  !*** ./src/modules/payments/entities/payment.entity.ts ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InvoiceStatus = exports.PaymentStatus = exports.PaymentProvider = void 0;
var PaymentProvider;
(function (PaymentProvider) {
    PaymentProvider["RAZORPAY"] = "RAZORPAY";
    PaymentProvider["STRIPE"] = "STRIPE";
    PaymentProvider["CRYPTO"] = "CRYPTO";
})(PaymentProvider || (exports.PaymentProvider = PaymentProvider = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["SUCCEEDED"] = "SUCCEEDED";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["CANCELED"] = "CANCELED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["DRAFT"] = "DRAFT";
    InvoiceStatus["OPEN"] = "OPEN";
    InvoiceStatus["PAID"] = "PAID";
    InvoiceStatus["VOID"] = "VOID";
    InvoiceStatus["UNCOLLECTIBLE"] = "UNCOLLECTIBLE";
})(InvoiceStatus || (exports.InvoiceStatus = InvoiceStatus = {}));


/***/ }),

/***/ "./src/modules/payments/payments.module.ts":
/*!*************************************************!*\
  !*** ./src/modules/payments/payments.module.ts ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PaymentsModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_module_1 = __webpack_require__(/*! ../common/modules/prisma.module */ "./src/modules/common/modules/prisma.module.ts");
const logger_module_1 = __webpack_require__(/*! ../common/modules/logger.module */ "./src/modules/common/modules/logger.module.ts");
const auth_module_1 = __webpack_require__(/*! ../auth/auth.module */ "./src/modules/auth/auth.module.ts");
const subscriptions_module_1 = __webpack_require__(/*! ../subscriptions/subscriptions.module */ "./src/modules/subscriptions/subscriptions.module.ts");
const payments_service_1 = __webpack_require__(/*! ./services/payments.service */ "./src/modules/payments/services/payments.service.ts");
const payments_controller_1 = __webpack_require__(/*! ./controllers/payments.controller */ "./src/modules/payments/controllers/payments.controller.ts");
let PaymentsModule = class PaymentsModule {
};
exports.PaymentsModule = PaymentsModule;
exports.PaymentsModule = PaymentsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, logger_module_1.LoggerModule, auth_module_1.AuthModule, subscriptions_module_1.SubscriptionsModule],
        controllers: [payments_controller_1.PaymentsController],
        providers: [payments_service_1.PaymentsService],
        exports: [payments_service_1.PaymentsService],
    })
], PaymentsModule);


/***/ }),

/***/ "./src/modules/payments/services/payments.service.ts":
/*!***********************************************************!*\
  !*** ./src/modules/payments/services/payments.service.ts ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PaymentsService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../common/modules/prisma.service */ "./src/modules/common/modules/prisma.service.ts");
const subscriptions_service_1 = __webpack_require__(/*! ../../subscriptions/services/subscriptions.service */ "./src/modules/subscriptions/services/subscriptions.service.ts");
const payment_entity_1 = __webpack_require__(/*! ../entities/payment.entity */ "./src/modules/payments/entities/payment.entity.ts");
const logger_service_1 = __webpack_require__(/*! ../../common/modules/logger.service */ "./src/modules/common/modules/logger.service.ts");
let PaymentsService = class PaymentsService {
    constructor(prisma, subscriptionsService) {
        this.prisma = prisma;
        this.subscriptionsService = subscriptionsService;
        this.logger = new logger_service_1.LoggerService();
    }
    async createPayment(dto) {
        const payment = await this.prisma.payment.create({
            data: {
                userId: dto.userId,
                invoiceId: dto.invoiceId,
                provider: dto.provider,
                providerPaymentId: dto.providerPaymentId,
                amount: dto.amount,
                currency: dto.currency || 'USD',
                status: payment_entity_1.PaymentStatus.PENDING,
                metadata: dto.metadata,
            },
        });
        this.logger.log(`Payment created: ${payment.id} for user ${dto.userId}`, 'PaymentsService');
        return payment;
    }
    async getPaymentById(userId, paymentId) {
        const payment = await this.prisma.payment.findFirst({
            where: { id: paymentId, userId },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        return payment;
    }
    async getUserPayments(userId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const [payments, total] = await Promise.all([
            this.prisma.payment.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip: offset,
                take: limit,
            }),
            this.prisma.payment.count({ where: { userId } }),
        ]);
        return {
            data: payments,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async updatePaymentStatus(providerPaymentId, status, metadata) {
        const payment = await this.prisma.payment.findFirst({
            where: { providerPaymentId },
            include: { invoice: true },
        });
        if (!payment) {
            return null;
        }
        const updated = await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
                status,
                paidAt: status === payment_entity_1.PaymentStatus.SUCCEEDED ? new Date() : undefined,
                metadata: metadata || payment.metadata,
            },
        });
        if (status === payment_entity_1.PaymentStatus.SUCCEEDED && payment.invoiceId) {
            await this.prisma.invoice.update({
                where: { id: payment.invoiceId },
                data: {
                    status: payment_entity_1.InvoiceStatus.PAID,
                    paidAt: new Date(),
                },
            });
            if (payment.invoice) {
                await this.subscriptionsService.createSubscription(payment.userId, payment.invoice.subscription.plan, payment.invoice.billingPeriodStart, payment.invoice.billingPeriodEnd);
            }
        }
        return updated;
    }
    async processRefund(userId, paymentId) {
        const payment = await this.getPaymentById(userId, paymentId);
        if (payment.status !== payment_entity_1.PaymentStatus.SUCCEEDED) {
            throw new common_1.BadRequestException('Only succeeded payments can be refunded');
        }
        const refunded = await this.prisma.payment.update({
            where: { id: paymentId },
            data: { status: payment_entity_1.PaymentStatus.REFUNDED },
        });
        if (payment.invoiceId) {
            await this.prisma.invoice.update({
                where: { id: payment.invoiceId },
                data: { status: payment_entity_1.InvoiceStatus.VOID },
            });
        }
        this.logger.log(`Payment refunded: ${paymentId}`, 'PaymentsService');
        return refunded;
    }
    async getPaymentStats(userId) {
        const payments = await this.prisma.payment.findMany({
            where: { userId },
            select: { amount: true, status: true, createdAt: true, currency: true },
        });
        const totalSpent = payments
            .filter((p) => p.status === payment_entity_1.PaymentStatus.SUCCEEDED)
            .reduce((sum, p) => sum + parseFloat(p.amount), 0);
        const byProvider = {
            [payment_entity_1.PaymentProvider.RAZORPAY]: 0,
            [payment_entity_1.PaymentProvider.STRIPE]: 0,
            [payment_entity_1.PaymentProvider.CRYPTO]: 0,
        };
        const byStatus = {
            [payment_entity_1.PaymentStatus.PENDING]: 0,
            [payment_entity_1.PaymentStatus.SUCCEEDED]: 0,
            [payment_entity_1.PaymentStatus.FAILED]: 0,
            [payment_entity_1.PaymentStatus.CANCELED]: 0,
            [payment_entity_1.PaymentStatus.REFUNDED]: 0,
        };
        for (const payment of payments) {
            byProvider[payment.provider] += parseFloat(payment.amount);
            byStatus[payment.status] += 1;
        }
        return {
            totalSpent: totalSpent.toFixed(2),
            totalPayments: payments.length,
            successfulPayments: byStatus[payment_entity_1.PaymentStatus.SUCCEEDED],
            failedPayments: byStatus[payment_entity_1.PaymentStatus.FAILED],
            byProvider: Object.fromEntries(Object.entries(byProvider).map(([key, value]) => [key, value.toFixed(2)])),
            byStatus,
        };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof subscriptions_service_1.SubscriptionsService !== "undefined" && subscriptions_service_1.SubscriptionsService) === "function" ? _b : Object])
], PaymentsService);


/***/ }),

/***/ "./src/modules/portfolio/controllers/portfolio.controller.ts":
/*!*******************************************************************!*\
  !*** ./src/modules/portfolio/controllers/portfolio.controller.ts ***!
  \*******************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PortfolioController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const portfolio_service_1 = __webpack_require__(/*! ../services/portfolio.service */ "./src/modules/portfolio/services/portfolio.service.ts");
const risk_service_1 = __webpack_require__(/*! ../../analytics/services/risk.service */ "./src/modules/analytics/services/risk.service.ts");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../common/guards/jwt-auth.guard */ "./src/modules/common/guards/jwt-auth.guard.ts");
const current_user_decorator_1 = __webpack_require__(/*! ../../common/decorators/current-user.decorator */ "./src/modules/common/decorators/current-user.decorator.ts");
const roles_decorator_1 = __webpack_require__(/*! ../../common/decorators/roles.decorator */ "./src/modules/common/decorators/roles.decorator.ts");
const roles_guard_1 = __webpack_require__(/*! ../../common/guards/roles.guard */ "./src/modules/common/guards/roles.guard.ts");
const enums_1 = __webpack_require__(/*! ../../../common/enums */ "./src/common/enums.ts");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
let PortfolioController = class PortfolioController {
    constructor(portfolioService, riskService) {
        this.portfolioService = portfolioService;
        this.riskService = riskService;
    }
    getSummary(userId) {
        return this.portfolioService.getPortfolioSummary(userId);
    }
    getAssetAllocation(userId) {
        return this.portfolioService.getAssetAllocation(userId);
    }
    getPerformance(userId, period) {
        return this.portfolioService.getHistoricalPerformance(userId, period);
    }
    getProfitLoss(userId) {
        return this.portfolioService.getProfitLoss(userId);
    }
    getFullReport(userId) {
        return this.portfolioService.getFullReport(userId);
    }
    getRiskScore(userId) {
        return this.riskService.getPortfolioHealth(userId);
    }
};
exports.PortfolioController = PortfolioController;
__decorate([
    (0, common_1.Get)('summary'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get portfolio summary with totals and top performers' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Portfolio summary retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PortfolioController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('allocation'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get asset allocation by token and chain' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Asset allocation retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PortfolioController.prototype, "getAssetAllocation", null);
__decorate([
    (0, common_1.Get)('performance'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get historical portfolio performance' }),
    (0, swagger_1.ApiQuery)({ name: 'period', required: false, type: String, description: 'Period in days (e.g., 7d, 30d, 90d, 1y)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Performance data retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PortfolioController.prototype, "getPerformance", null);
__decorate([
    (0, common_1.Get)('profit-loss'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get profit/loss breakdown' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profit/loss data retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PortfolioController.prototype, "getProfitLoss", null);
__decorate([
    (0, common_1.Get)('report'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get full portfolio report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Full portfolio report generated' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PortfolioController.prototype, "getFullReport", null);
__decorate([
    (0, common_1.Get)('risk-score'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get portfolio risk assessment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Risk assessment retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PortfolioController.prototype, "getRiskScore", null);
exports.PortfolioController = PortfolioController = __decorate([
    (0, swagger_1.ApiTags)('Portfolio'),
    (0, common_1.Controller)('portfolio'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [typeof (_a = typeof portfolio_service_1.PortfolioService !== "undefined" && portfolio_service_1.PortfolioService) === "function" ? _a : Object, typeof (_b = typeof risk_service_1.RiskService !== "undefined" && risk_service_1.RiskService) === "function" ? _b : Object])
], PortfolioController);


/***/ }),

/***/ "./src/modules/portfolio/portfolio.module.ts":
/*!***************************************************!*\
  !*** ./src/modules/portfolio/portfolio.module.ts ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PortfolioModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_module_1 = __webpack_require__(/*! ../common/modules/prisma.module */ "./src/modules/common/modules/prisma.module.ts");
const logger_module_1 = __webpack_require__(/*! ../common/modules/logger.module */ "./src/modules/common/modules/logger.module.ts");
const auth_module_1 = __webpack_require__(/*! ../auth/auth.module */ "./src/modules/auth/auth.module.ts");
const wallets_module_1 = __webpack_require__(/*! ../wallets/wallets.module */ "./src/modules/wallets/wallets.module.ts");
const analytics_module_1 = __webpack_require__(/*! ../analytics/analytics.module */ "./src/modules/analytics/analytics.module.ts");
const portfolio_service_1 = __webpack_require__(/*! ./services/portfolio.service */ "./src/modules/portfolio/services/portfolio.service.ts");
const portfolio_controller_1 = __webpack_require__(/*! ./controllers/portfolio.controller */ "./src/modules/portfolio/controllers/portfolio.controller.ts");
let PortfolioModule = class PortfolioModule {
};
exports.PortfolioModule = PortfolioModule;
exports.PortfolioModule = PortfolioModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, logger_module_1.LoggerModule, auth_module_1.AuthModule, wallets_module_1.WalletsModule, analytics_module_1.AnalyticsModule],
        controllers: [portfolio_controller_1.PortfolioController],
        providers: [portfolio_service_1.PortfolioService],
        exports: [portfolio_service_1.PortfolioService],
    })
], PortfolioModule);


/***/ }),

/***/ "./src/modules/portfolio/services/portfolio.service.ts":
/*!*************************************************************!*\
  !*** ./src/modules/portfolio/services/portfolio.service.ts ***!
  \*************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PortfolioService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../common/modules/prisma.service */ "./src/modules/common/modules/prisma.service.ts");
const wallets_service_1 = __webpack_require__(/*! ../../wallets/services/wallets.service */ "./src/modules/wallets/services/wallets.service.ts");
const logger_service_1 = __webpack_require__(/*! ../../common/modules/logger.service */ "./src/modules/common/modules/logger.service.ts");
const app_utils_1 = __webpack_require__(/*! ../../common/utils/app.utils */ "./src/modules/common/utils/app.utils.ts");
let PortfolioService = class PortfolioService {
    constructor(prisma, walletsService) {
        this.prisma = prisma;
        this.walletsService = walletsService;
        this.logger = new logger_service_1.LoggerService();
    }
    async getPortfolioSummary(userId) {
        const wallets = await this.prisma.wallet.findMany({
            where: { userId, isActive: true },
            include: { balances: true },
        });
        let totalValueUsd = 0;
        const tokenValues = new Map();
        for (const wallet of wallets) {
            for (const balance of wallet.balances) {
                const value = parseFloat(balance.balanceUsd?.toString() || '0');
                const change = parseFloat(balance.change24h?.toString() || '0');
                totalValueUsd += value;
                const existing = tokenValues.get(balance.symbol);
                if (existing) {
                    existing.valueUsd += value;
                    existing.change24h += change;
                }
                else {
                    tokenValues.set(balance.symbol, {
                        valueUsd: value,
                        change24h: change,
                        symbol: balance.symbol,
                        name: balance.name,
                    });
                }
            }
        }
        const sortedTokens = Array.from(tokenValues.values())
            .sort((a, b) => b.valueUsd - a.valueUsd);
        const topGainers = sortedTokens
            .filter((t) => t.change24h > 0)
            .sort((a, b) => b.change24h - a.change24h)
            .slice(0, 5)
            .map((t) => ({
            symbol: t.symbol,
            name: t.name,
            valueUsd: (0, app_utils_1.formatUsd)(t.valueUsd),
            change24h: (0, app_utils_1.formatUsd)(t.change24h),
            percentage: (0, app_utils_1.formatPercentage)((t.change24h / t.valueUsd) * 100 || 0),
        }));
        const topLosers = sortedTokens
            .filter((t) => t.change24h < 0)
            .sort((a, b) => a.change24h - b.change24h)
            .slice(0, 5)
            .map((t) => ({
            symbol: t.symbol,
            name: t.name,
            valueUsd: (0, app_utils_1.formatUsd)(t.valueUsd),
            change24h: (0, app_utils_1.formatUsd)(t.change24h),
            percentage: (0, app_utils_1.formatPercentage)((t.change24h / t.valueUsd) * 100 || 0),
        }));
        const totalChange24h = sortedTokens.reduce((sum, t) => sum + t.change24h, 0);
        const totalChangePercentage24h = totalValueUsd > 0 ? (totalChange24h / (totalValueUsd - totalChange24h)) * 100 : 0;
        return {
            totalValueUsd: (0, app_utils_1.formatUsd)(totalValueUsd),
            totalChange24h: (0, app_utils_1.formatUsd)(totalChange24h),
            totalChangePercentage24h: (0, app_utils_1.formatPercentage)(totalChangePercentage24h),
            totalRealizedPnl: '0.00',
            totalUnrealizedPnl: (0, app_utils_1.formatUsd)(totalChange24h),
            totalPnl: (0, app_utils_1.formatUsd)(totalChange24h),
            walletCount: wallets.length,
            topGainers,
            topLosers,
        };
    }
    async getAssetAllocation(userId) {
        const wallets = await this.prisma.wallet.findMany({
            where: { userId, isActive: true },
            include: { balances: true },
        });
        const chainValues = new Map();
        const tokenValues = new Map();
        for (const wallet of wallets) {
            const chainKey = wallet.chain;
            const existingChain = chainValues.get(chainKey);
            if (existingChain) {
                existingChain.walletCount += 1;
            }
            else {
                chainValues.set(chainKey, { valueUsd: 0, walletCount: 1 });
            }
            for (const balance of wallet.balances) {
                const value = parseFloat(balance.balanceUsd?.toString() || '0');
                const change = parseFloat(balance.change24h?.toString() || '0');
                const chainEntry = chainValues.get(chainKey);
                chainEntry.valueUsd += value;
                const existingToken = tokenValues.get(balance.symbol);
                if (existingToken) {
                    existingToken.valueUsd += value;
                    existingToken.change24h += change;
                }
                else {
                    tokenValues.set(balance.symbol, {
                        valueUsd: value,
                        symbol: balance.symbol,
                        name: balance.name,
                        change24h: change,
                    });
                }
            }
        }
        const totalValue = Array.from(chainValues.values()).reduce((sum, c) => sum + c.valueUsd, 0);
        const tokens = Array.from(tokenValues.values())
            .sort((a, b) => b.valueUsd - a.valueUsd)
            .map((t) => ({
            symbol: t.symbol,
            name: t.name,
            valueUsd: (0, app_utils_1.formatUsd)(t.valueUsd),
            percentage: (0, app_utils_1.formatPercentage)((t.valueUsd / totalValue) * 100 || 0),
            change24h: (0, app_utils_1.formatPercentage)((t.change24h / t.valueUsd) * 100 || 0),
        }));
        const chains = Array.from(chainValues.entries())
            .map(([chain, data]) => ({
            chain,
            valueUsd: (0, app_utils_1.formatUsd)(data.valueUsd),
            percentage: (0, app_utils_1.formatPercentage)((data.valueUsd / totalValue) * 100 || 0),
            walletCount: data.walletCount,
        }))
            .sort((a, b) => parseFloat(b.valueUsd) - parseFloat(a.valueUsd));
        return { tokens, chains };
    }
    async getHistoricalPerformance(userId, period = '30d') {
        const endDate = new Date();
        const startDate = new Date();
        const days = parseInt(period.replace('d', ''), 10) || 30;
        startDate.setDate(endDate.getDate() - days);
        const transactions = await this.prisma.transaction.findMany({
            where: {
                userId,
                timestamp: { gte: startDate, lte: endDate },
            },
            select: {
                timestamp: true,
                valueUsd: true,
                feeUsd: true,
            },
        });
        const dataPoints = this.generateDataPoints(startDate, endDate, days);
        let currentValue = dataPoints[0]?.value || 0;
        for (const tx of transactions) {
            const dayIndex = Math.floor((new Date(tx.timestamp).getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            if (dayIndex >= 0 && dayIndex < dataPoints.length) {
                currentValue += parseFloat(tx.valueUsd?.toString() || '0') - parseFloat(tx.feeUsd?.toString() || '0');
            }
        }
        const finalDataPoints = dataPoints.map((dp, i) => ({
            date: dp.date,
            value: (0, app_utils_1.formatUsd)(Math.max(0, currentValue - (dataPoints.length - i) * 10)),
        }));
        return [
            {
                period,
                startValue: finalDataPoints[0]?.value || '0.00',
                endValue: finalDataPoints[finalDataPoints.length - 1]?.value || '0.00',
                change: (0, app_utils_1.formatUsd)(parseFloat(finalDataPoints[finalDataPoints.length - 1]?.value || '0') - parseFloat(finalDataPoints[0]?.value || '0')),
                changePercentage: (0, app_utils_1.formatPercentage)(((parseFloat(finalDataPoints[finalDataPoints.length - 1]?.value || '0') -
                    parseFloat(finalDataPoints[0]?.value || '0')) /
                    parseFloat(finalDataPoints[0]?.value || '1')) *
                    100),
                dataPoints: finalDataPoints,
            },
        ];
    }
    async getProfitLoss(userId) {
        const transactions = await this.prisma.transaction.findMany({
            where: { userId },
            select: {
                type: true,
                valueUsd: true,
                feeUsd: true,
                timestamp: true,
            },
        });
        const byToken = new Map();
        let totalRealized = 0;
        let totalUnrealized = 0;
        for (const tx of transactions) {
            const value = parseFloat(tx.valueUsd?.toString() || '0');
            const fee = parseFloat(tx.feeUsd?.toString() || '0');
            if (tx.type === 'SWAP' || tx.type === 'TRANSFER') {
                totalRealized += value - fee;
            }
            else {
                totalUnrealized += value - fee;
            }
        }
        const totalPnl = totalRealized + totalUnrealized;
        const tokenEntries = Array.from(byToken.entries()).map(([symbol, data]) => ({
            symbol,
            realizedPnl: (0, app_utils_1.formatUsd)(data.realized),
            unrealizedPnl: (0, app_utils_1.formatUsd)(data.unrealized),
            totalPnl: (0, app_utils_1.formatUsd)(data.total),
            totalPnlPercentage: (0, app_utils_1.formatPercentage)((data.total / (data.total || 1)) * 100),
        }));
        return {
            realizedPnl: (0, app_utils_1.formatUsd)(totalRealized),
            unrealizedPnl: (0, app_utils_1.formatUsd)(totalUnrealized),
            totalPnl: (0, app_utils_1.formatUsd)(totalPnl),
            realizedPnlPercentage: (0, app_utils_1.formatPercentage)(totalPnl > 0 ? (totalRealized / totalPnl) * 100 : 0),
            unrealizedPnlPercentage: (0, app_utils_1.formatPercentage)(totalPnl > 0 ? (totalUnrealized / totalPnl) * 100 : 0),
            totalPnlPercentage: '0.00',
            byToken: tokenEntries,
        };
    }
    async getFullReport(userId) {
        const [summary, allocation, performance, profitLoss] = await Promise.all([
            this.getPortfolioSummary(userId),
            this.getAssetAllocation(userId),
            this.getHistoricalPerformance(userId),
            this.getProfitLoss(userId),
        ]);
        return {
            summary,
            allocation,
            performance,
            profitLoss,
            generatedAt: new Date().toISOString(),
        };
    }
    generateDataPoints(startDate, endDate, days) {
        const dataPoints = [];
        const interval = Math.ceil(days / 30);
        const current = new Date(startDate);
        while (current <= endDate) {
            dataPoints.push({
                date: current.toISOString().split('T')[0],
                value: Math.random() * 10000 + 5000,
            });
            current.setDate(current.getDate() + interval);
        }
        return dataPoints;
    }
};
exports.PortfolioService = PortfolioService;
exports.PortfolioService = PortfolioService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof wallets_service_1.WalletsService !== "undefined" && wallets_service_1.WalletsService) === "function" ? _b : Object])
], PortfolioService);


/***/ }),

/***/ "./src/modules/referral/controllers/referral.controller.ts":
/*!*****************************************************************!*\
  !*** ./src/modules/referral/controllers/referral.controller.ts ***!
  \*****************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReferralController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const referral_service_1 = __webpack_require__(/*! ../services/referral.service */ "./src/modules/referral/services/referral.service.ts");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../common/guards/jwt-auth.guard */ "./src/modules/common/guards/jwt-auth.guard.ts");
const current_user_decorator_1 = __webpack_require__(/*! ../../common/decorators/current-user.decorator */ "./src/modules/common/decorators/current-user.decorator.ts");
const roles_decorator_1 = __webpack_require__(/*! ../../common/decorators/roles.decorator */ "./src/modules/common/decorators/roles.decorator.ts");
const roles_guard_1 = __webpack_require__(/*! ../../common/guards/roles.guard */ "./src/modules/common/guards/roles.guard.ts");
const apply_referral_dto_1 = __webpack_require__(/*! ../dto/apply-referral.dto */ "./src/modules/referral/dto/apply-referral.dto.ts");
const common_2 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const enums_1 = __webpack_require__(/*! ../../../common/enums */ "./src/common/enums.ts");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
let ReferralController = class ReferralController {
    constructor(referralService) {
        this.referralService = referralService;
    }
    getReferralCode(userId) {
        return this.referralService.getOrCreateReferralCode(userId);
    }
    getStats(userId) {
        return this.referralService.getReferralStats(userId);
    }
    applyReferralCode(userId, dto) {
        return this.referralService.applyReferralCode(userId, dto.code);
    }
    getHistory(userId) {
        return this.referralService.getUserReferrals(userId);
    }
};
exports.ReferralController = ReferralController;
__decorate([
    (0, common_1.Get)('code'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get or create referral code for current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Referral code retrieved or created' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReferralController.prototype, "getReferralCode", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get referral statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Referral stats retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReferralController.prototype, "getStats", null);
__decorate([
    (0, common_1.Post)('apply'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Apply a referral code' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Referral code applied' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid referral code' }),
    (0, common_2.UsePipes)(new common_2.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_b = typeof apply_referral_dto_1.ApplyReferralDto !== "undefined" && apply_referral_dto_1.ApplyReferralDto) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], ReferralController.prototype, "applyReferralCode", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get referral history' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Referral history retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReferralController.prototype, "getHistory", null);
exports.ReferralController = ReferralController = __decorate([
    (0, swagger_1.ApiTags)('Referral'),
    (0, common_1.Controller)('referral'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [typeof (_a = typeof referral_service_1.ReferralService !== "undefined" && referral_service_1.ReferralService) === "function" ? _a : Object])
], ReferralController);


/***/ }),

/***/ "./src/modules/referral/dto/apply-referral.dto.ts":
/*!********************************************************!*\
  !*** ./src/modules/referral/dto/apply-referral.dto.ts ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApplyReferralDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
class ApplyReferralDto {
}
exports.ApplyReferralDto = ApplyReferralDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(6, 20, { message: 'Referral code must be between 6 and 20 characters' }),
    (0, class_validator_1.Matches)(/^[A-Z0-9]+$/, { message: 'Referral code must be uppercase alphanumeric' }),
    __metadata("design:type", String)
], ApplyReferralDto.prototype, "code", void 0);


/***/ }),

/***/ "./src/modules/referral/referral.module.ts":
/*!*************************************************!*\
  !*** ./src/modules/referral/referral.module.ts ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReferralModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_module_1 = __webpack_require__(/*! ../common/modules/prisma.module */ "./src/modules/common/modules/prisma.module.ts");
const logger_module_1 = __webpack_require__(/*! ../common/modules/logger.module */ "./src/modules/common/modules/logger.module.ts");
const auth_module_1 = __webpack_require__(/*! ../auth/auth.module */ "./src/modules/auth/auth.module.ts");
const referral_service_1 = __webpack_require__(/*! ./services/referral.service */ "./src/modules/referral/services/referral.service.ts");
const referral_controller_1 = __webpack_require__(/*! ./controllers/referral.controller */ "./src/modules/referral/controllers/referral.controller.ts");
let ReferralModule = class ReferralModule {
};
exports.ReferralModule = ReferralModule;
exports.ReferralModule = ReferralModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, logger_module_1.LoggerModule, auth_module_1.AuthModule],
        controllers: [referral_controller_1.ReferralController],
        providers: [referral_service_1.ReferralService],
        exports: [referral_service_1.ReferralService],
    })
], ReferralModule);


/***/ }),

/***/ "./src/modules/referral/services/referral.service.ts":
/*!***********************************************************!*\
  !*** ./src/modules/referral/services/referral.service.ts ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReferralService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../common/modules/prisma.service */ "./src/modules/common/modules/prisma.service.ts");
const enums_1 = __webpack_require__(/*! ../../../common/enums */ "./src/common/enums.ts");
const logger_service_1 = __webpack_require__(/*! ../../common/modules/logger.service */ "./src/modules/common/modules/logger.service.ts");
const app_utils_1 = __webpack_require__(/*! ../../common/utils/app.utils */ "./src/modules/common/utils/app.utils.ts");
let ReferralService = class ReferralService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new logger_service_1.LoggerService();
    }
    async getOrCreateReferralCode(userId) {
        const existing = await this.prisma.referralCode.findFirst({
            where: { userId, isActive: true },
        });
        if (existing) {
            return existing;
        }
        let code;
        let isUnique = false;
        while (!isUnique) {
            code = (0, app_utils_1.generateSecureRandomString)(8).toUpperCase();
            const existingCode = await this.prisma.referralCode.findUnique({
                where: { code },
            });
            if (!existingCode) {
                isUnique = true;
            }
        }
        const referralCode = await this.prisma.referralCode.create({
            data: {
                userId,
                code,
                uses: 0,
                maxUses: 100,
                isActive: true,
            },
        });
        this.logger.log(`Referral code created: ${referralCode.code} for user ${userId}`, 'ReferralService');
        return referralCode;
    }
    async getUserReferralCodes(userId) {
        return this.prisma.referralCode.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async validateReferralCode(code) {
        const referralCode = await this.prisma.referralCode.findUnique({
            where: { code },
        });
        if (!referralCode) {
            return { valid: false, message: 'Invalid referral code' };
        }
        if (!referralCode.isActive) {
            return { valid: false, message: 'Referral code is inactive' };
        }
        if (referralCode.expiresAt && referralCode.expiresAt < new Date()) {
            return { valid: false, message: 'Referral code has expired' };
        }
        if (referralCode.uses >= referralCode.maxUses) {
            return { valid: false, message: 'Referral code has reached maximum uses' };
        }
        return { valid: true, referrerId: referralCode.userId };
    }
    async applyReferralCode(userId, code) {
        const validation = await this.validateReferralCode(code);
        if (!validation.valid || !validation.referrerId) {
            throw new common_1.BadRequestException(validation.message || 'Invalid referral code');
        }
        if (validation.referrerId === userId) {
            throw new common_1.BadRequestException('Cannot refer yourself');
        }
        const existingReferral = await this.prisma.referralReward.findFirst({
            where: { refereeId: userId, referralCodeId: { code } },
        });
        if (existingReferral) {
            throw new common_1.ConflictException('You have already used this referral code');
        }
        const referralCode = await this.prisma.referralCode.findUnique({
            where: { code },
        });
        if (!referralCode) {
            throw new common_1.BadRequestException('Referral code not found');
        }
        await this.prisma.referralCode.update({
            where: { id: referralCode.id },
            data: { uses: { increment: 1 } },
        });
        const reward = await this.prisma.referralReward.create({
            data: {
                referrerId: validation.referrerId,
                refereeId: userId,
                referralCodeId: referralCode.id,
                rewardType: enums_1.RewardType.REFERRAL_FIRST,
                amount: '10.00',
                currency: 'LXON',
                status: enums_1.RewardStatus.CLAIMABLE,
            },
        });
        const refereeReward = await this.prisma.referralReward.create({
            data: {
                referrerId: validation.referrerId,
                refereeId: userId,
                referralCodeId: referralCode.id,
                rewardType: enums_1.RewardType.REFERRAL_FIRST,
                amount: '5.00',
                currency: 'LXON',
                status: enums_1.RewardStatus.CLAIMABLE,
            },
        });
        this.logger.log(`Referral applied: ${code} by user ${userId}`, 'ReferralService');
        return refereeReward;
    }
    async getUserReferrals(userId) {
        const [referrerRewards, refereeRewards] = await Promise.all([
            this.prisma.referralReward.findMany({
                where: { referrerId: userId },
                include: { referralCode: true, user: { select: { name: true, email: true } } },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.referralReward.findMany({
                where: { refereeId: userId },
                include: { referralCode: true, user: { select: { name: true, email: true } } },
                orderBy: { createdAt: 'desc' },
            }),
        ]);
        return {
            referrerRewards,
            refereeRewards,
            totalReferrals: referrerRewards.length,
        };
    }
    async claimReward(userId, rewardId) {
        const reward = await this.prisma.referralReward.findFirst({
            where: { id: rewardId, referrerId: userId },
        });
        if (!reward) {
            throw new common_1.NotFoundException('Reward not found');
        }
        if (reward.status !== enums_1.RewardStatus.CLAIMABLE) {
            throw new common_1.BadRequestException('Reward is not claimable');
        }
        const updated = await this.prisma.referralReward.update({
            where: { id: rewardId },
            data: {
                status: enums_1.RewardStatus.CLAIMED,
                claimedAt: new Date(),
            },
        });
        this.logger.log(`Reward claimed: ${rewardId} by user ${userId}`, 'ReferralService');
        return updated;
    }
    async getReferralStats(userId) {
        const [referralCodes, rewards] = await Promise.all([
            this.prisma.referralCode.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.referralReward.findMany({
                where: { referrerId: userId },
            }),
        ]);
        const totalReferrals = rewards.filter((r) => r.referrerId === userId).length;
        const totalRewards = rewards.reduce((sum, r) => sum + parseFloat(r.amount), 0).toFixed(2);
        const pendingRewards = rewards
            .filter((r) => r.status === enums_1.RewardStatus.CLAIMABLE)
            .reduce((sum, r) => sum + parseFloat(r.amount), 0)
            .toFixed(2);
        const claimedRewards = rewards
            .filter((r) => r.status === enums_1.RewardStatus.CLAIMED)
            .reduce((sum, r) => sum + parseFloat(r.amount), 0)
            .toFixed(2);
        return {
            totalReferrals,
            totalRewards,
            pendingRewards,
            claimedRewards,
            referralCodes,
        };
    }
};
exports.ReferralService = ReferralService;
exports.ReferralService = ReferralService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], ReferralService);


/***/ }),

/***/ "./src/modules/scanner/controllers/scanner.controller.ts":
/*!***************************************************************!*\
  !*** ./src/modules/scanner/controllers/scanner.controller.ts ***!
  \***************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ScannerController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const scanner_service_1 = __webpack_require__(/*! ../services/scanner.service */ "./src/modules/scanner/services/scanner.service.ts");
const scanner_entity_1 = __webpack_require__(/*! ../entities/scanner.entity */ "./src/modules/scanner/entities/scanner.entity.ts");
const wallet_entity_1 = __webpack_require__(/*! ../../wallets/entities/wallet.entity */ "./src/modules/wallets/entities/wallet.entity.ts");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../common/guards/jwt-auth.guard */ "./src/modules/common/guards/jwt-auth.guard.ts");
const current_user_decorator_1 = __webpack_require__(/*! ../../common/decorators/current-user.decorator */ "./src/modules/common/decorators/current-user.decorator.ts");
const roles_decorator_1 = __webpack_require__(/*! ../../common/decorators/roles.decorator */ "./src/modules/common/decorators/roles.decorator.ts");
const roles_guard_1 = __webpack_require__(/*! ../../common/guards/roles.guard */ "./src/modules/common/guards/roles.guard.ts");
const enums_1 = __webpack_require__(/*! ../../../common/enums */ "./src/common/enums.ts");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
let ScannerController = class ScannerController {
    constructor(scannerService) {
        this.scannerService = scannerService;
    }
    analyzeContract(userId, dto) {
        return this.scannerService.analyzeContract(dto);
    }
    getAnalysis(address, chain) {
        return this.scannerService.getAnalysis(address, chain);
    }
    getRecentAnalyses(limit) {
        return this.scannerService.getRecentAnalyses(limit);
    }
};
exports.ScannerController = ScannerController;
__decorate([
    (0, common_1.Post)('analyze'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Analyze a smart contract for security risks' }),
    (0, swagger_1.ApiQuery)({ name: 'includeAiExplanation', required: false, type: Boolean }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Analysis completed' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid contract address' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_b = typeof scanner_entity_1.AnalyzeContractDto !== "undefined" && scanner_entity_1.AnalyzeContractDto) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], ScannerController.prototype, "analyzeContract", null);
__decorate([
    (0, common_1.Get)('analysis/:address'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get existing contract analysis' }),
    (0, swagger_1.ApiQuery)({ name: 'chain', required: true, enum: ['ETHEREUM', 'POLYGON', 'BSC', 'ARBITRUM', 'BASE', 'AVALANCHE'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Analysis retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Analysis not found' }),
    __param(0, (0, common_1.Param)('address')),
    __param(1, (0, common_1.Query)('chain')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_c = typeof wallet_entity_1.Chain !== "undefined" && wallet_entity_1.Chain) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], ScannerController.prototype, "getAnalysis", null);
__decorate([
    (0, common_1.Get)('recent'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get recent contract analyses' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Recent analyses retrieved' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ScannerController.prototype, "getRecentAnalyses", null);
exports.ScannerController = ScannerController = __decorate([
    (0, swagger_1.ApiTags)('Smart Contract Analyzer'),
    (0, common_1.Controller)('scanner'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [typeof (_a = typeof scanner_service_1.ScannerService !== "undefined" && scanner_service_1.ScannerService) === "function" ? _a : Object])
], ScannerController);


/***/ }),

/***/ "./src/modules/scanner/entities/scanner.entity.ts":
/*!********************************************************!*\
  !*** ./src/modules/scanner/entities/scanner.entity.ts ***!
  \********************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RiskLevel = void 0;
var RiskLevel;
(function (RiskLevel) {
    RiskLevel["LOW"] = "LOW";
    RiskLevel["MEDIUM"] = "MEDIUM";
    RiskLevel["HIGH"] = "HIGH";
    RiskLevel["CRITICAL"] = "CRITICAL";
})(RiskLevel || (exports.RiskLevel = RiskLevel = {}));


/***/ }),

/***/ "./src/modules/scanner/scanner.module.ts":
/*!***********************************************!*\
  !*** ./src/modules/scanner/scanner.module.ts ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ScannerModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_module_1 = __webpack_require__(/*! ../common/modules/prisma.module */ "./src/modules/common/modules/prisma.module.ts");
const http_module_1 = __webpack_require__(/*! ../common/modules/http.module */ "./src/modules/common/modules/http.module.ts");
const logger_module_1 = __webpack_require__(/*! ../common/modules/logger.module */ "./src/modules/common/modules/logger.module.ts");
const auth_module_1 = __webpack_require__(/*! ../auth/auth.module */ "./src/modules/auth/auth.module.ts");
const ai_module_1 = __webpack_require__(/*! ../ai/ai.module */ "./src/modules/ai/ai.module.ts");
const scanner_service_1 = __webpack_require__(/*! ./services/scanner.service */ "./src/modules/scanner/services/scanner.service.ts");
const scanner_controller_1 = __webpack_require__(/*! ./controllers/scanner.controller */ "./src/modules/scanner/controllers/scanner.controller.ts");
let ScannerModule = class ScannerModule {
};
exports.ScannerModule = ScannerModule;
exports.ScannerModule = ScannerModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, http_module_1.HttpModule, logger_module_1.LoggerModule, auth_module_1.AuthModule, ai_module_1.AiModule],
        controllers: [scanner_controller_1.ScannerController],
        providers: [scanner_service_1.ScannerService],
        exports: [scanner_service_1.ScannerService],
    })
], ScannerModule);


/***/ }),

/***/ "./src/modules/scanner/services/scanner.service.ts":
/*!*********************************************************!*\
  !*** ./src/modules/scanner/services/scanner.service.ts ***!
  \*********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ScannerService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../common/modules/prisma.service */ "./src/modules/common/modules/prisma.service.ts");
const http_service_1 = __webpack_require__(/*! ../../common/modules/http.service */ "./src/modules/common/modules/http.service.ts");
const wallet_entity_1 = __webpack_require__(/*! ../../wallets/entities/wallet.entity */ "./src/modules/wallets/entities/wallet.entity.ts");
const ai_service_1 = __webpack_require__(/*! ../../ai/services/ai.service */ "./src/modules/ai/services/ai.service.ts");
const logger_service_1 = __webpack_require__(/*! ../../common/modules/logger.service */ "./src/modules/common/modules/logger.service.ts");
let ScannerService = class ScannerService {
    constructor(prisma, httpService, aiService) {
        this.prisma = prisma;
        this.httpService = httpService;
        this.aiService = aiService;
        this.logger = new logger_service_1.LoggerService();
        this.explorerUrls = {
            [wallet_entity_1.Chain.ETHEREUM]: 'https://api.etherscan.io/api',
            [wallet_entity_1.Chain.POLYGON]: 'https://api.polygonscan.com/api',
            [wallet_entity_1.Chain.BSC]: 'https://api.bscscan.com/api',
            [wallet_entity_1.Chain.ARBITRUM]: 'https://api.arbiscan.io/api',
            [wallet_entity_1.Chain.BASE]: 'https://api.basescan.org/api',
            [wallet_entity_1.Chain.AVALANCHE]: 'https://api.snowtrace.io/api',
            [wallet_entity_1.Chain.LXON]: 'https://explorer.lxonevm.com/api',
        };
        this.apiKeys = {
            [wallet_entity_1.Chain.ETHEREUM]: process.env.ETHERSCAN_API_KEY,
            [wallet_entity_1.Chain.POLYGON]: process.env.POLYGONSCAN_API_KEY,
            [wallet_entity_1.Chain.BSC]: process.env.BSCSCAN_API_KEY,
            [wallet_entity_1.Chain.ARBITRUM]: process.env.ARBISCAN_API_KEY,
            [wallet_entity_1.Chain.BASE]: process.env.BASESCAN_API_KEY,
            [wallet_entity_1.Chain.AVALANCHE]: process.env.SNOWTRACE_API_KEY,
            [wallet_entity_1.Chain.LXON]: process.env.LXONSCAN_API_KEY,
        };
    }
    async analyzeContract(dto) {
        const normalizedAddress = dto.address.toLowerCase();
        const chain = dto.chain;
        let analysis = await this.prisma.token.findFirst({
            where: { address: normalizedAddress },
        });
        if (!analysis) {
            analysis = await this.prisma.token.create({
                data: {
                    address: normalizedAddress,
                    chain,
                    symbol: 'UNKNOWN',
                    name: 'Unknown Contract',
                    decimals: 18,
                    lastUpdated: new Date(),
                },
            });
        }
        const contractInfo = await this.fetchContractInfo(normalizedAddress, chain);
        const findings = await this.performStaticAnalysis(normalizedAddress, chain, contractInfo);
        const permissions = await this.analyzePermissions(normalizedAddress, chain, contractInfo);
        const ownership = await this.analyzeOwnership(normalizedAddress, chain, contractInfo);
        const riskScore = this.calculateRiskScore(findings, permissions, ownership);
        const riskLevel = this.getRiskLevel(riskScore);
        const summary = this.generateSummary(findings, riskLevel);
        let aiExplanation;
        if (dto.includeAiExplanation) {
            try {
                aiExplanation = await this.aiService.detectScam(normalizedAddress, chain);
            }
            catch (error) {
                this.logger.warn(`AI explanation failed: ${error.message}`, 'ScannerService');
            }
        }
        const updated = await this.prisma.token.update({
            where: { address: normalizedAddress },
            data: {
                riskScore,
                riskFactors: {
                    findings,
                    permissions,
                    ownership,
                    summary,
                },
                lastUpdated: new Date(),
            },
        });
        return {
            id: updated.id,
            address: updated.address,
            chain: updated.chain,
            contractName: contractInfo.contractName,
            compilerVersion: contractInfo.compilerVersion,
            optimizationEnabled: contractInfo.optimizationEnabled,
            isVerified: contractInfo.isVerified,
            riskScore,
            riskLevel,
            summary,
            findings,
            permissions,
            ownership,
            aiExplanation,
            analyzedAt: new Date(),
            createdAt: updated.createdAt,
        };
    }
    async getAnalysis(address, chain) {
        const normalizedAddress = address.toLowerCase();
        const analysis = await this.prisma.token.findFirst({
            where: { address: normalizedAddress, chain },
        });
        if (!analysis || !analysis.riskFactors) {
            return null;
        }
        const riskFactors = analysis.riskFactors;
        return {
            id: analysis.id,
            address: analysis.address,
            chain: analysis.chain,
            contractName: analysis.name,
            isVerified: analysis.isVerified,
            riskScore: analysis.riskScore || 0,
            riskLevel: this.getRiskLevel(analysis.riskScore || 0),
            summary: riskFactors.summary,
            findings: riskFactors.findings,
            permissions: riskFactors.permissions,
            ownership: riskFactors.ownership,
            analyzedAt: analysis.lastUpdated,
            createdAt: analysis.createdAt,
        };
    }
    async getRecentAnalyses(limit = 20) {
        const analyses = await this.prisma.token.findMany({
            where: { riskScore: { not: null } },
            orderBy: { lastUpdated: 'desc' },
            take: limit,
        });
        return analyses.map((a) => {
            const riskFactors = a.riskFactors || { findings: [], permissions: {}, ownership: {}, summary: '' };
            return {
                id: a.id,
                address: a.address,
                chain: a.chain,
                contractName: a.name,
                isVerified: a.isVerified,
                riskScore: a.riskScore || 0,
                riskLevel: this.getRiskLevel(a.riskScore || 0),
                summary: riskFactors.summary,
                findings: riskFactors.findings,
                permissions: riskFactors.permissions,
                ownership: riskFactors.ownership,
                analyzedAt: a.lastUpdated,
                createdAt: a.createdAt,
            };
        });
    }
    async fetchContractInfo(address, chain) {
        const baseUrl = this.explorerUrls[chain];
        const apiKey = this.apiKeys[chain];
        if (!apiKey || !baseUrl) {
            return {
                contractName: 'Unknown',
                compilerVersion: 'Unknown',
                optimizationEnabled: false,
                isVerified: false,
                sourceCode: '',
                abi: null,
            };
        }
        try {
            const response = await this.httpService
                .getAxiosInstance()
                .get(baseUrl, {
                params: {
                    module: 'contract',
                    action: 'getsourcecode',
                    address,
                    apikey: apiKey,
                },
            });
            if (!response || !response.data) {
                throw new Error('Empty response from block explorer');
            }
            const result = response.data.result?.[0];
            if (!result) {
                throw new Error('No contract data in response');
            }
            return {
                contractName: result?.ContractName || 'Unknown',
                compilerVersion: result?.CompilerVersion || 'Unknown',
                optimizationEnabled: result?.OptimizationUsed === '1',
                isVerified: result?.SourceCode && result.SourceCode.trim() !== '',
                sourceCode: result?.SourceCode || '',
                abi: result?.ABI,
            };
        }
        catch (error) {
            this.logger.warn(`Failed to fetch contract info: ${error.message}`, 'ScannerService');
            return {
                contractName: 'Unknown',
                compilerVersion: 'Unknown',
                optimizationEnabled: false,
                isVerified: false,
                sourceCode: '',
                abi: null,
            };
        }
    }
    async performStaticAnalysis(address, chain, contractInfo) {
        const findings = [];
        const sourceCode = contractInfo.sourceCode || '';
        if (!contractInfo.isVerified) {
            findings.push({
                category: 'Verification',
                severity: 'high',
                title: 'Contract Not Verified',
                description: 'The smart contract source code is not verified on the block explorer.',
                recommendation: 'Only interact with verified contracts. Unverified contracts may contain hidden malicious code.',
            });
        }
        const highRiskPatterns = [
            { pattern: /selfdestruct|suicide/i, title: 'Selfdestruct Function', severity: 'critical', desc: 'Contract contains selfdestruct functionality.' },
            { pattern: /delegatecall/i, title: 'Delegatecall Usage', severity: 'high', desc: 'Contract uses delegatecall which can be dangerous.' },
            { pattern: /tx\.origin/i, title: 'tx.origin Usage', severity: 'high', desc: 'Contract uses tx.origin for authorization, which is vulnerable to phishing.' },
            { pattern: /function\s+setOwner|function\s+transferOwnership|function\s+renounceOwnership/i, title: 'Ownership Functions', severity: 'medium', desc: 'Contract contains ownership transfer functions.' },
            { pattern: /mint\s*\(/i, title: 'Mint Function', severity: 'medium', desc: 'Contract has minting capabilities.' },
            { pattern: /pause\s*\(|unpause\s*\(/i, title: 'Pausable Functions', severity: 'low', desc: 'Contract has pausable functionality.' },
            { pattern: /blacklist|exclude|whitelist/i, title: 'Blacklist/Whitelist', severity: 'medium', desc: 'Contract may have address restrictions.' },
            { pattern: /onlyOwner|onlyAdmin/i, title: 'Access Control', severity: 'low', desc: 'Contract uses owner/admin access control.' },
        ];
        for (const { pattern, title, severity, desc } of highRiskPatterns) {
            if (pattern.test(sourceCode)) {
                findings.push({
                    category: 'Code Analysis',
                    severity,
                    title,
                    description: desc,
                    recommendation: this.getRecommendation(title),
                });
            }
        }
        return findings;
    }
    async analyzePermissions(address, chain, contractInfo) {
        const sourceCode = contractInfo.sourceCode || '';
        const abi = contractInfo.abi;
        return {
            owner: 'Unknown',
            canMint: /mint\s*\(/i.test(sourceCode),
            canBurn: /burn\s*\(/i.test(sourceCode),
            canPause: /pause\s*\(/i.test(sourceCode),
            canBlacklist: /blacklist|exclude/i.test(sourceCode),
            canUpgrade: /upgrade|upgradeTo/i.test(sourceCode),
            hasProxy: /delegatecall|eip-1822|transparent|uups/i.test(sourceCode),
            transferRestricted: /onlyOwner|onlyAdmin|require.*approved/i.test(sourceCode),
        };
    }
    async analyzeOwnership(address, chain, contractInfo) {
        const sourceCode = contractInfo.sourceCode || '';
        return {
            currentOwner: 'Unknown',
            isOwnershipRenounced: /renounceOwnership|transferOwnership.*zero|owner\s*=\s*address\(0\)/i.test(sourceCode),
            ownershipRenouncedAt: undefined,
            previousOwners: [],
            timelockEnabled: /timelock|delay|minDelay/i.test(sourceCode),
            timelockDelay: undefined,
        };
    }
    calculateRiskScore(findings, permissions, ownership) {
        let score = 0;
        const severityWeights = {
            low: 10,
            medium: 25,
            high: 50,
            critical: 100,
        };
        for (const finding of findings) {
            score += severityWeights[finding.severity] || 0;
        }
        if (permissions.canMint)
            score += 15;
        if (permissions.canPause)
            score += 10;
        if (permissions.canBlacklist)
            score += 20;
        if (permissions.hasProxy)
            score += 25;
        if (permissions.transferRestricted)
            score += 15;
        if (!ownership.isOwnershipRenounced)
            score += 20;
        if (!ownership.timelockEnabled)
            score += 10;
        return Math.min(100, Math.max(0, score));
    }
    getRiskLevel(score) {
        if (score < 30)
            return 'LOW';
        if (score < 60)
            return 'MEDIUM';
        if (score < 80)
            return 'HIGH';
        return 'CRITICAL';
    }
    generateSummary(findings, riskLevel) {
        const criticalCount = findings.filter((f) => f.severity === 'critical').length;
        const highCount = findings.filter((f) => f.severity === 'high').length;
        const mediumCount = findings.filter((f) => f.severity === 'medium').length;
        let summary = `Risk Level: ${riskLevel}. `;
        summary += `Found ${findings.length} issues (${criticalCount} critical, ${highCount} high, ${mediumCount} medium). `;
        if (riskLevel === 'CRITICAL') {
            summary += 'This contract has critical security issues. Do not interact.';
        }
        else if (riskLevel === 'HIGH') {
            summary += 'This contract has high-risk issues. Exercise extreme caution.';
        }
        else if (riskLevel === 'MEDIUM') {
            summary += 'This contract has medium-risk issues. Proceed with caution.';
        }
        else {
            summary += 'This contract appears relatively safe based on static analysis.';
        }
        return summary;
    }
    getRecommendation(title) {
        const recommendations = {
            'Selfdestruct Function': 'Avoid interacting with contracts that can self-destruct. This can lead to complete loss of funds.',
            'Delegatecall Usage': 'Ensure delegatecall is used safely with proper input validation and trusted contracts only.',
            'tx.origin Usage': 'Contracts using tx.origin are vulnerable to phishing attacks. Use msg.sender instead.',
            'Ownership Functions': 'Verify ownership is renounced or controlled by a multisig/timelock.',
            'Mint Function': 'Check minting capabilities. Unlimited minting can lead to inflation.',
            'Pausable Functions': 'Ensure pause functionality is used responsibly and not to lock funds.',
            'Blacklist/Whitelist': 'Review address restriction mechanisms. Ensure they are transparent and fair.',
        };
        return recommendations[title] || 'Review this finding carefully before interacting with the contract.';
    }
};
exports.ScannerService = ScannerService;
exports.ScannerService = ScannerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof http_service_1.HttpService !== "undefined" && http_service_1.HttpService) === "function" ? _b : Object, typeof (_c = typeof ai_service_1.AiService !== "undefined" && ai_service_1.AiService) === "function" ? _c : Object])
], ScannerService);


/***/ }),

/***/ "./src/modules/staking/controllers/staking.controller.ts":
/*!***************************************************************!*\
  !*** ./src/modules/staking/controllers/staking.controller.ts ***!
  \***************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StakingController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const staking_service_1 = __webpack_require__(/*! ../services/staking.service */ "./src/modules/staking/services/staking.service.ts");
const staking_entity_1 = __webpack_require__(/*! ../entities/staking.entity */ "./src/modules/staking/entities/staking.entity.ts");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../common/guards/jwt-auth.guard */ "./src/modules/common/guards/jwt-auth.guard.ts");
const current_user_decorator_1 = __webpack_require__(/*! ../../common/decorators/current-user.decorator */ "./src/modules/common/decorators/current-user.decorator.ts");
const roles_decorator_1 = __webpack_require__(/*! ../../common/decorators/roles.decorator */ "./src/modules/common/decorators/roles.decorator.ts");
const roles_guard_1 = __webpack_require__(/*! ../../common/guards/roles.guard */ "./src/modules/common/guards/roles.guard.ts");
const enums_1 = __webpack_require__(/*! ../../../common/enums */ "./src/common/enums.ts");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
let StakingController = class StakingController {
    constructor(stakingService) {
        this.stakingService = stakingService;
    }
    getUserPositions(userId) {
        return this.stakingService.getUserStakingPositions(userId);
    }
    getStats(userId) {
        return this.stakingService.getStakingStats(userId);
    }
    createStake(userId, dto) {
        return this.stakingService.createStake(userId, dto);
    }
    requestUnstake(userId, dto) {
        return this.stakingService.requestUnstake(userId, dto);
    }
    claimRewards(userId, dto) {
        return this.stakingService.claimRewards(userId, dto);
    }
};
exports.StakingController = StakingController;
__decorate([
    (0, common_1.Get)('positions'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get user staking positions' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Staking positions retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StakingController.prototype, "getUserPositions", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get staking statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Stats retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StakingController.prototype, "getStats", null);
__decorate([
    (0, common_1.Post)('stake'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new staking position' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Stake created' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid staking amount' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_b = typeof staking_entity_1.StakeDto !== "undefined" && staking_entity_1.StakeDto) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], StakingController.prototype, "createStake", null);
__decorate([
    (0, common_1.Post)('unstake'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Request unstake' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Unstake requested' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_c = typeof staking_entity_1.UnstakeDto !== "undefined" && staking_entity_1.UnstakeDto) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], StakingController.prototype, "requestUnstake", null);
__decorate([
    (0, common_1.Post)('claim-rewards'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Claim staking rewards' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Rewards claimed' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_d = typeof staking_entity_1.ClaimRewardsDto !== "undefined" && staking_entity_1.ClaimRewardsDto) === "function" ? _d : Object]),
    __metadata("design:returntype", void 0)
], StakingController.prototype, "claimRewards", null);
exports.StakingController = StakingController = __decorate([
    (0, swagger_1.ApiTags)('Staking'),
    (0, common_1.Controller)('staking'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [typeof (_a = typeof staking_service_1.StakingService !== "undefined" && staking_service_1.StakingService) === "function" ? _a : Object])
], StakingController);


/***/ }),

/***/ "./src/modules/staking/entities/staking.entity.ts":
/*!********************************************************!*\
  !*** ./src/modules/staking/entities/staking.entity.ts ***!
  \********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StakingStatus = void 0;
var enums_1 = __webpack_require__(/*! ../../../common/enums */ "./src/common/enums.ts");
Object.defineProperty(exports, "StakingStatus", ({ enumerable: true, get: function () { return enums_1.StakingStatus; } }));


/***/ }),

/***/ "./src/modules/staking/services/staking.service.ts":
/*!*********************************************************!*\
  !*** ./src/modules/staking/services/staking.service.ts ***!
  \*********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StakingService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../common/modules/prisma.service */ "./src/modules/common/modules/prisma.service.ts");
const staking_entity_1 = __webpack_require__(/*! ../entities/staking.entity */ "./src/modules/staking/entities/staking.entity.ts");
const logger_service_1 = __webpack_require__(/*! ../../common/modules/logger.service */ "./src/modules/common/modules/logger.service.ts");
let StakingService = class StakingService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new logger_service_1.LoggerService();
        this.defaultApy = 12;
        this.defaultLockPeriodDays = 30;
    }
    async getUserStakingPositions(userId) {
        return this.prisma.stakingPosition.findMany({
            where: { userId },
            include: { wallet: { select: { address: true, chain: true, label: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getStakingPosition(userId, positionId) {
        const position = await this.prisma.stakingPosition.findFirst({
            where: { id: positionId, userId },
            include: { wallet: true },
        });
        if (!position) {
            throw new common_1.NotFoundException('Staking position not found');
        }
        return position;
    }
    async createStake(userId, dto) {
        const wallet = await this.prisma.wallet.findFirst({
            where: { id: dto.walletId, userId, isActive: true },
        });
        if (!wallet) {
            throw new common_1.NotFoundException('Wallet not found');
        }
        const amount = parseFloat(dto.amount);
        if (isNaN(amount) || amount <= 0) {
            throw new common_1.BadRequestException('Invalid staking amount');
        }
        const lockPeriodDays = dto.lockPeriodDays || this.defaultLockPeriodDays;
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + lockPeriodDays);
        const position = await this.prisma.stakingPosition.create({
            data: {
                userId,
                walletId: dto.walletId,
                amount,
                apy: this.defaultApy,
                startDate,
                endDate,
                status: staking_entity_1.StakingStatus.ACTIVE,
            },
            include: { wallet: true },
        });
        this.logger.log(`Stake created: ${position.id} for user ${userId}`, 'StakingService');
        return position;
    }
    async requestUnstake(userId, dto) {
        const position = await this.getStakingPosition(userId, dto.positionId);
        if (position.status !== staking_entity_1.StakingStatus.ACTIVE) {
            throw new common_1.BadRequestException('Position is not active');
        }
        if (position.unstakeRequestedAt) {
            throw new common_1.BadRequestException('Unstake already requested');
        }
        const updated = await this.prisma.stakingPosition.update({
            where: { id: dto.positionId },
            data: {
                status: staking_entity_1.StakingStatus.UNSTAKING,
                unstakeRequestedAt: new Date(),
            },
        });
        this.logger.log(`Unstake requested: ${dto.positionId}`, 'StakingService');
        return updated;
    }
    async claimRewards(userId, dto) {
        const position = await this.getStakingPosition(userId, dto.positionId);
        if (position.status !== staking_entity_1.StakingStatus.ACTIVE && position.status !== staking_entity_1.StakingStatus.COMPLETED) {
            throw new common_1.BadRequestException('Cannot claim rewards from this position');
        }
        const rewards = this.calculateRewards(position);
        if (rewards <= 0) {
            throw new common_1.BadRequestException('No rewards to claim');
        }
        await this.prisma.stakingPosition.update({
            where: { id: dto.positionId },
            data: {
                rewardClaimed: { increment: rewards },
                rewardClaimedAt: new Date(),
            },
        });
        this.logger.log(`Rewards claimed: ${rewards} for position ${dto.positionId}`, 'StakingService');
        return { claimed: rewards.toFixed(18) };
    }
    async getStakingStats(userId) {
        const positions = await this.prisma.stakingPosition.findMany({
            where: { userId },
            include: { wallet: true },
        });
        const totalStaked = positions
            .filter((p) => p.status === staking_entity_1.StakingStatus.ACTIVE)
            .reduce((sum, p) => sum + parseFloat(p.amount), 0);
        const totalRewards = positions.reduce((sum, p) => sum + parseFloat(p.rewardClaimed), 0);
        const activePositions = positions.filter((p) => p.status === staking_entity_1.StakingStatus.ACTIVE).length;
        const completedPositions = positions.filter((p) => p.status === staking_entity_1.StakingStatus.COMPLETED).length;
        return {
            totalStaked: totalStaked.toFixed(18),
            totalRewards: totalRewards.toFixed(18),
            activePositions,
            completedPositions,
            totalPositions: positions.length,
            avgApy: positions.length > 0
                ? (positions.reduce((sum, p) => sum + parseFloat(p.apy), 0) / positions.length).toFixed(2)
                : '0',
        };
    }
    calculateRewards(position) {
        const now = new Date();
        const startDate = new Date(position.startDate);
        const stakingDays = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
        if (stakingDays <= 0)
            return 0;
        const principal = parseFloat(position.amount);
        const apy = parseFloat(position.apy) / 100;
        const rewards = principal * apy * (stakingDays / 365);
        return rewards;
    }
};
exports.StakingService = StakingService;
exports.StakingService = StakingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], StakingService);


/***/ }),

/***/ "./src/modules/staking/staking.module.ts":
/*!***********************************************!*\
  !*** ./src/modules/staking/staking.module.ts ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StakingModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_module_1 = __webpack_require__(/*! ../common/modules/prisma.module */ "./src/modules/common/modules/prisma.module.ts");
const logger_module_1 = __webpack_require__(/*! ../common/modules/logger.module */ "./src/modules/common/modules/logger.module.ts");
const auth_module_1 = __webpack_require__(/*! ../auth/auth.module */ "./src/modules/auth/auth.module.ts");
const staking_service_1 = __webpack_require__(/*! ./services/staking.service */ "./src/modules/staking/services/staking.service.ts");
const staking_controller_1 = __webpack_require__(/*! ./controllers/staking.controller */ "./src/modules/staking/controllers/staking.controller.ts");
let StakingModule = class StakingModule {
};
exports.StakingModule = StakingModule;
exports.StakingModule = StakingModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, logger_module_1.LoggerModule, auth_module_1.AuthModule],
        controllers: [staking_controller_1.StakingController],
        providers: [staking_service_1.StakingService],
        exports: [staking_service_1.StakingService],
    })
], StakingModule);


/***/ }),

/***/ "./src/modules/subscriptions/controllers/subscriptions.controller.ts":
/*!***************************************************************************!*\
  !*** ./src/modules/subscriptions/controllers/subscriptions.controller.ts ***!
  \***************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SubscriptionsController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const subscriptions_service_1 = __webpack_require__(/*! ../services/subscriptions.service */ "./src/modules/subscriptions/services/subscriptions.service.ts");
const subscription_dto_1 = __webpack_require__(/*! ../dto/subscription.dto */ "./src/modules/subscriptions/dto/subscription.dto.ts");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../common/guards/jwt-auth.guard */ "./src/modules/common/guards/jwt-auth.guard.ts");
const current_user_decorator_1 = __webpack_require__(/*! ../../common/decorators/current-user.decorator */ "./src/modules/common/decorators/current-user.decorator.ts");
const roles_decorator_1 = __webpack_require__(/*! ../../common/decorators/roles.decorator */ "./src/modules/common/decorators/roles.decorator.ts");
const roles_guard_1 = __webpack_require__(/*! ../../common/guards/roles.guard */ "./src/modules/common/guards/roles.guard.ts");
const enums_1 = __webpack_require__(/*! ../../../common/enums */ "./src/common/enums.ts");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const parse_pagination_pipe_1 = __webpack_require__(/*! ../../common/pipes/parse-pagination.pipe */ "./src/modules/common/pipes/parse-pagination.pipe.ts");
let SubscriptionsController = class SubscriptionsController {
    constructor(subscriptionsService) {
        this.subscriptionsService = subscriptionsService;
    }
    getCurrentSubscription(userId) {
        return this.subscriptionsService.getUserSubscription(userId);
    }
    upgradeSubscription(userId, dto) {
        return this.subscriptionsService.updateSubscription(userId, dto.plan);
    }
    cancelSubscription(userId, dto) {
        return this.subscriptionsService.cancelSubscription(userId, dto.reason === 'false' ? false : true);
    }
    getHistory(userId, pagination) {
        return this.subscriptionsService.getSubscriptionHistory(userId, pagination.page, pagination.limit);
    }
    checkExpired() {
        return this.subscriptionsService.checkExpiredSubscriptions();
    }
};
exports.SubscriptionsController = SubscriptionsController;
__decorate([
    (0, common_1.Get)('current'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user subscription' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Subscription retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "getCurrentSubscription", null);
__decorate([
    (0, common_1.Post)('upgrade'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Upgrade or downgrade subscription plan' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Subscription updated' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_b = typeof subscription_dto_1.UpgradeSubscriptionDto !== "undefined" && subscription_dto_1.UpgradeSubscriptionDto) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "upgradeSubscription", null);
__decorate([
    (0, common_1.Post)('cancel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel subscription' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Subscription canceled' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_c = typeof subscription_dto_1.CancelSubscriptionDto !== "undefined" && subscription_dto_1.CancelSubscriptionDto) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "cancelSubscription", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get subscription history' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'History retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Query)('page', parse_pagination_pipe_1.ParsePaginationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Post)('check-expired'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Check and expire old subscriptions (admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Expired subscriptions count' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "checkExpired", null);
exports.SubscriptionsController = SubscriptionsController = __decorate([
    (0, swagger_1.ApiTags)('Subscriptions'),
    (0, common_1.Controller)('subscriptions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [typeof (_a = typeof subscriptions_service_1.SubscriptionsService !== "undefined" && subscriptions_service_1.SubscriptionsService) === "function" ? _a : Object])
], SubscriptionsController);


/***/ }),

/***/ "./src/modules/subscriptions/dto/subscription.dto.ts":
/*!***********************************************************!*\
  !*** ./src/modules/subscriptions/dto/subscription.dto.ts ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CancelSubscriptionDto = exports.UpgradeSubscriptionDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
class UpgradeSubscriptionDto {
}
exports.UpgradeSubscriptionDto = UpgradeSubscriptionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['BASIC', 'PRO', 'ENTERPRISE'], {
        message: 'Plan must be BASIC, PRO, or ENTERPRISE',
    }),
    __metadata("design:type", String)
], UpgradeSubscriptionDto.prototype, "plan", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpgradeSubscriptionDto.prototype, "paymentMethodId", void 0);
class CancelSubscriptionDto {
}
exports.CancelSubscriptionDto = CancelSubscriptionDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CancelSubscriptionDto.prototype, "reason", void 0);


/***/ }),

/***/ "./src/modules/subscriptions/entities/subscription.entity.ts":
/*!*******************************************************************!*\
  !*** ./src/modules/subscriptions/entities/subscription.entity.ts ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PLAN_FEATURES = exports.SubscriptionStatus = exports.SubscriptionPlan = void 0;
var SubscriptionPlan;
(function (SubscriptionPlan) {
    SubscriptionPlan["FREE"] = "FREE";
    SubscriptionPlan["BASIC"] = "BASIC";
    SubscriptionPlan["PRO"] = "PRO";
    SubscriptionPlan["ENTERPRISE"] = "ENTERPRISE";
})(SubscriptionPlan || (exports.SubscriptionPlan = SubscriptionPlan = {}));
var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["ACTIVE"] = "ACTIVE";
    SubscriptionStatus["CANCELED"] = "CANCELED";
    SubscriptionStatus["EXPIRED"] = "EXPIRED";
    SubscriptionStatus["PAST_DUE"] = "PAST_DUE";
})(SubscriptionStatus || (exports.SubscriptionStatus = SubscriptionStatus = {}));
exports.PLAN_FEATURES = {
    [SubscriptionPlan.FREE]: {
        aiQueriesPerDay: 10,
        maxWallets: 3,
        maxAlerts: 5,
        advancedAnalytics: false,
        apiAccess: false,
        prioritySupport: false,
        whiteLabel: false,
    },
    [SubscriptionPlan.BASIC]: {
        aiQueriesPerDay: 100,
        maxWallets: 10,
        maxAlerts: 20,
        advancedAnalytics: true,
        apiAccess: false,
        prioritySupport: false,
        whiteLabel: false,
    },
    [SubscriptionPlan.PRO]: {
        aiQueriesPerDay: 500,
        maxWallets: 50,
        maxAlerts: 100,
        advancedAnalytics: true,
        apiAccess: true,
        prioritySupport: true,
        whiteLabel: false,
    },
    [SubscriptionPlan.ENTERPRISE]: {
        aiQueriesPerDay: 9999,
        maxWallets: 999,
        maxAlerts: 999,
        advancedAnalytics: true,
        apiAccess: true,
        prioritySupport: true,
        whiteLabel: true,
    },
};


/***/ }),

/***/ "./src/modules/subscriptions/services/subscriptions.service.ts":
/*!*********************************************************************!*\
  !*** ./src/modules/subscriptions/services/subscriptions.service.ts ***!
  \*********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SubscriptionsService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../common/modules/prisma.service */ "./src/modules/common/modules/prisma.service.ts");
const subscription_entity_1 = __webpack_require__(/*! ../entities/subscription.entity */ "./src/modules/subscriptions/entities/subscription.entity.ts");
const logger_service_1 = __webpack_require__(/*! ../../common/modules/logger.service */ "./src/modules/common/modules/logger.service.ts");
let SubscriptionsService = class SubscriptionsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new logger_service_1.LoggerService();
    }
    async getUserSubscription(userId) {
        return this.prisma.subscription.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createSubscription(userId, plan, startDate, endDate) {
        const features = subscription_entity_1.PLAN_FEATURES[plan];
        const existing = await this.getUserSubscription(userId);
        if (existing && existing.status === subscription_entity_1.SubscriptionStatus.ACTIVE) {
            throw new common_1.BadRequestException('User already has an active subscription');
        }
        const now = startDate || new Date();
        const subscriptionEnd = endDate || new Date(now);
        subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
        const subscription = await this.prisma.subscription.create({
            data: {
                userId,
                plan,
                status: subscription_entity_1.SubscriptionStatus.ACTIVE,
                startDate: now,
                endDate: subscriptionEnd,
                aiQueryLimit: features.aiQueriesPerDay,
                features: JSON.stringify(features),
            },
        });
        this.logger.log(`Subscription created: ${subscription.id} for user ${userId}`, 'SubscriptionsService');
        return {
            ...subscription,
            features: typeof subscription.features === 'string' ? JSON.parse(subscription.features) : subscription.features,
        };
    }
    async updateSubscription(userId, newPlan) {
        const current = await this.getActiveSubscription(userId);
        const newFeatures = subscription_entity_1.PLAN_FEATURES[newPlan];
        const updated = await this.prisma.subscription.update({
            where: { id: current.id },
            data: {
                plan: newPlan,
                features: JSON.stringify(newFeatures),
                aiQueryLimit: newFeatures.aiQueriesPerDay,
            },
        });
        this.logger.log(`Subscription updated to ${newPlan} for user ${userId}`, 'SubscriptionsService');
        return {
            ...updated,
            features: typeof updated.features === 'string' ? JSON.parse(updated.features) : updated.features,
        };
    }
    async cancelSubscription(userId, cancelAtPeriodEnd = true) {
        const current = await this.getActiveSubscription(userId);
        const updated = await this.prisma.subscription.update({
            where: { id: current.id },
            data: {
                cancelAtPeriodEnd,
                ...(cancelAtPeriodEnd ? {} : { status: subscription_entity_1.SubscriptionStatus.CANCELED }),
            },
        });
        this.logger.log(`Subscription canceled for user ${userId}`, 'SubscriptionsService');
        return updated;
    }
    async trackAiQuery(userId) {
        const subscription = await this.getActiveSubscription(userId);
        const features = subscription_entity_1.PLAN_FEATURES[subscription.plan];
        if (subscription.aiQueriesUsed >= subscription.aiQueryLimit) {
            return { allowed: false, remaining: 0 };
        }
        await this.prisma.subscription.update({
            where: { id: subscription.id },
            data: { aiQueriesUsed: { increment: 1 } },
        });
        const remaining = subscription.aiQueryLimit - subscription.aiQueriesUsed - 1;
        return { allowed: true, remaining };
    }
    async canAccessFeature(userId, feature) {
        const subscription = await this.getActiveSubscription(userId);
        const features = subscription_entity_1.PLAN_FEATURES[subscription.plan];
        return !!features[feature];
    }
    async getActiveSubscription(userId) {
        const subscription = await this.prisma.subscription.findFirst({
            where: {
                userId,
                status: subscription_entity_1.SubscriptionStatus.ACTIVE,
                endDate: { gte: new Date() },
            },
        });
        if (!subscription) {
            const freeSubscription = await this.prisma.subscription.findFirst({
                where: { userId, plan: subscription_entity_1.SubscriptionPlan.FREE },
                orderBy: { createdAt: 'desc' },
            });
            if (freeSubscription) {
                return {
                    ...freeSubscription,
                    features: typeof freeSubscription.features === 'string' ? JSON.parse(freeSubscription.features) : freeSubscription.features,
                };
            }
            return this.createSubscription(userId, subscription_entity_1.SubscriptionPlan.FREE);
        }
        return {
            ...subscription,
            features: typeof subscription.features === 'string' ? JSON.parse(subscription.features) : subscription.features,
        };
    }
    async getSubscriptionHistory(userId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const [subscriptions, total] = await Promise.all([
            this.prisma.subscription.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip: offset,
                take: limit,
                include: {
                    invoices: true,
                },
            }),
            this.prisma.subscription.count({ where: { userId } }),
        ]);
        return {
            data: subscriptions,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async checkExpiredSubscriptions() {
        const result = await this.prisma.subscription.updateMany({
            where: {
                status: subscription_entity_1.SubscriptionStatus.ACTIVE,
                endDate: { lt: new Date() },
            },
            data: { status: subscription_entity_1.SubscriptionStatus.EXPIRED },
        });
        if (result.count > 0) {
            this.logger.log(`${result.count} subscriptions marked as expired`, 'SubscriptionsService');
        }
        return result.count;
    }
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], SubscriptionsService);


/***/ }),

/***/ "./src/modules/subscriptions/subscriptions.module.ts":
/*!***********************************************************!*\
  !*** ./src/modules/subscriptions/subscriptions.module.ts ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SubscriptionsModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_module_1 = __webpack_require__(/*! ../common/modules/prisma.module */ "./src/modules/common/modules/prisma.module.ts");
const logger_module_1 = __webpack_require__(/*! ../common/modules/logger.module */ "./src/modules/common/modules/logger.module.ts");
const auth_module_1 = __webpack_require__(/*! ../auth/auth.module */ "./src/modules/auth/auth.module.ts");
const subscriptions_service_1 = __webpack_require__(/*! ./services/subscriptions.service */ "./src/modules/subscriptions/services/subscriptions.service.ts");
const subscriptions_controller_1 = __webpack_require__(/*! ./controllers/subscriptions.controller */ "./src/modules/subscriptions/controllers/subscriptions.controller.ts");
let SubscriptionsModule = class SubscriptionsModule {
};
exports.SubscriptionsModule = SubscriptionsModule;
exports.SubscriptionsModule = SubscriptionsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, logger_module_1.LoggerModule, auth_module_1.AuthModule],
        controllers: [subscriptions_controller_1.SubscriptionsController],
        providers: [subscriptions_service_1.SubscriptionsService],
        exports: [subscriptions_service_1.SubscriptionsService],
    })
], SubscriptionsModule);


/***/ }),

/***/ "./src/modules/tokens/controllers/tokens.controller.ts":
/*!*************************************************************!*\
  !*** ./src/modules/tokens/controllers/tokens.controller.ts ***!
  \*************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TokensController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const tokens_service_1 = __webpack_require__(/*! ../services/tokens.service */ "./src/modules/tokens/services/tokens.service.ts");
const token_utility_service_1 = __webpack_require__(/*! ../services/token-utility.service */ "./src/modules/tokens/services/token-utility.service.ts");
const wallet_entity_1 = __webpack_require__(/*! ../../wallets/entities/wallet.entity */ "./src/modules/wallets/entities/wallet.entity.ts");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../common/guards/jwt-auth.guard */ "./src/modules/common/guards/jwt-auth.guard.ts");
const current_user_decorator_1 = __webpack_require__(/*! ../../common/decorators/current-user.decorator */ "./src/modules/common/decorators/current-user.decorator.ts");
const roles_decorator_1 = __webpack_require__(/*! ../../common/decorators/roles.decorator */ "./src/modules/common/decorators/roles.decorator.ts");
const roles_guard_1 = __webpack_require__(/*! ../../common/guards/roles.guard */ "./src/modules/common/guards/roles.guard.ts");
const enums_1 = __webpack_require__(/*! ../../../common/enums */ "./src/common/enums.ts");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
let TokensController = class TokensController {
    constructor(tokensService, tokenUtilityService) {
        this.tokensService = tokensService;
        this.tokenUtilityService = tokenUtilityService;
    }
    searchTokens(query, chain) {
        return this.tokensService.searchTokens(query, chain);
    }
    getTokenByAddress(address, chain) {
        return this.tokensService.getTokenByAddress(address, chain);
    }
    getTokenPrice(address, chain) {
        return this.tokensService.getTokenPrice(address, chain);
    }
    getTrendingTokens(chain) {
        return this.tokensService.getTrendingTokens(chain);
    }
    getTopGainers(chain) {
        return this.tokensService.getTopGainers(chain);
    }
    getTopLosers(chain) {
        return this.tokensService.getTopLosers(chain);
    }
    getRevenueShare(userId, periodDays) {
        return this.tokenUtilityService.calculateRevenueShare(userId, periodDays ? parseInt(periodDays) : 30);
    }
    getTokenBenefits(userId) {
        return this.tokenUtilityService.getTokenBenefits(userId);
    }
    getStakingRewards(userId) {
        return this.tokenUtilityService.getStakingRewards(userId);
    }
};
exports.TokensController = TokensController;
__decorate([
    (0, common_1.Get)('search'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Search tokens by symbol, name, or address' }),
    (0, swagger_1.ApiQuery)({ name: 'q', required: true, type: String, description: 'Search query (symbol, name, or address)' }),
    (0, swagger_1.ApiQuery)({ name: 'chain', required: false, enum: ['ETHEREUM', 'POLYGON', 'BSC', 'ARBITRUM', 'BASE', 'AVALANCHE'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Search results retrieved' }),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('chain')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_c = typeof wallet_entity_1.Chain !== "undefined" && wallet_entity_1.Chain) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], TokensController.prototype, "searchTokens", null);
__decorate([
    (0, common_1.Get)(':address'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get token details by address' }),
    (0, swagger_1.ApiQuery)({ name: 'chain', required: true, enum: ['ETHEREUM', 'POLYGON', 'BSC', 'ARBITRUM', 'BASE', 'AVALANCHE'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token details retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Token not found' }),
    __param(0, (0, common_1.Param)('address')),
    __param(1, (0, common_1.Query)('chain')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_d = typeof wallet_entity_1.Chain !== "undefined" && wallet_entity_1.Chain) === "function" ? _d : Object]),
    __metadata("design:returntype", void 0)
], TokensController.prototype, "getTokenByAddress", null);
__decorate([
    (0, common_1.Get)('price/:address'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get token price' }),
    (0, swagger_1.ApiQuery)({ name: 'chain', required: true, enum: ['ETHEREUM', 'POLYGON', 'BSC', 'ARBITRUM', 'BASE', 'AVALANCHE'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token price retrieved' }),
    __param(0, (0, common_1.Param)('address')),
    __param(1, (0, common_1.Query)('chain')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_e = typeof wallet_entity_1.Chain !== "undefined" && wallet_entity_1.Chain) === "function" ? _e : Object]),
    __metadata("design:returntype", void 0)
], TokensController.prototype, "getTokenPrice", null);
__decorate([
    (0, common_1.Get)('trending'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get trending tokens' }),
    (0, swagger_1.ApiQuery)({ name: 'chain', required: false, enum: ['ETHEREUM', 'POLYGON', 'BSC', 'ARBITRUM', 'BASE', 'AVALANCHE'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Trending tokens retrieved' }),
    __param(0, (0, common_1.Query)('chain')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof wallet_entity_1.Chain !== "undefined" && wallet_entity_1.Chain) === "function" ? _f : Object]),
    __metadata("design:returntype", void 0)
], TokensController.prototype, "getTrendingTokens", null);
__decorate([
    (0, common_1.Get)('gainers'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get top gainers' }),
    (0, swagger_1.ApiQuery)({ name: 'chain', required: false, enum: ['ETHEREUM', 'POLYGON', 'BSC', 'ARBITRUM', 'BASE', 'AVALANCHE'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Top gainers retrieved' }),
    __param(0, (0, common_1.Query)('chain')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_g = typeof wallet_entity_1.Chain !== "undefined" && wallet_entity_1.Chain) === "function" ? _g : Object]),
    __metadata("design:returntype", void 0)
], TokensController.prototype, "getTopGainers", null);
__decorate([
    (0, common_1.Get)('losers'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get top losers' }),
    (0, swagger_1.ApiQuery)({ name: 'chain', required: false, enum: ['ETHEREUM', 'POLYGON', 'BSC', 'ARBITRUM', 'BASE', 'AVALANCHE'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Top losers retrieved' }),
    __param(0, (0, common_1.Query)('chain')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_h = typeof wallet_entity_1.Chain !== "undefined" && wallet_entity_1.Chain) === "function" ? _h : Object]),
    __metadata("design:returntype", void 0)
], TokensController.prototype, "getTopLosers", null);
__decorate([
    (0, common_1.Get)('utility/revenue-share'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get LXOM revenue share calculation' }),
    (0, swagger_1.ApiQuery)({ name: 'periodDays', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Revenue share calculated' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Query)('periodDays')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TokensController.prototype, "getRevenueShare", null);
__decorate([
    (0, common_1.Get)('utility/benefits'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get token utility benefits based on LXOM holdings' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token benefits retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TokensController.prototype, "getTokenBenefits", null);
__decorate([
    (0, common_1.Get)('utility/staking-rewards'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get LXOM staking rewards' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Staking rewards calculated' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TokensController.prototype, "getStakingRewards", null);
exports.TokensController = TokensController = __decorate([
    (0, swagger_1.ApiTags)('Tokens'),
    (0, common_1.Controller)('tokens'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [typeof (_a = typeof tokens_service_1.TokensService !== "undefined" && tokens_service_1.TokensService) === "function" ? _a : Object, typeof (_b = typeof token_utility_service_1.TokenUtilityService !== "undefined" && token_utility_service_1.TokenUtilityService) === "function" ? _b : Object])
], TokensController);


/***/ }),

/***/ "./src/modules/tokens/services/token-utility.service.ts":
/*!**************************************************************!*\
  !*** ./src/modules/tokens/services/token-utility.service.ts ***!
  \**************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TokenUtilityService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../common/modules/prisma.service */ "./src/modules/common/modules/prisma.service.ts");
const logger_service_1 = __webpack_require__(/*! ../../common/modules/logger.service */ "./src/modules/common/modules/logger.service.ts");
let TokenUtilityService = class TokenUtilityService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new logger_service_1.LoggerService();
    }
    async calculateRevenueShare(userId, periodDays = 30) {
        const totalRevenue = 125000;
        const userProportion = 0.05;
        const lxomRewards = totalRevenue * userProportion;
        return {
            totalRevenue,
            userShare: totalRevenue * userProportion,
            lxomRewards,
            period: `${periodDays} days`,
        };
    }
    async getTokenBenefits(userId) {
        const wallets = await this.prisma.wallet.findMany({
            where: { userId, chain: 'LXON', isActive: true },
            include: { balances: true },
        });
        const lxonBalance = wallets.reduce((sum, wallet) => {
            const lxonBalance = wallet.balances.find(b => b.symbol === 'LXON');
            return sum + (lxonBalance ? parseFloat(lxonBalance.balance) : 0);
        }, 0);
        let stakingTier = 'NONE';
        let feeDiscount = 0;
        let features = [];
        if (lxonBalance >= 100000) {
            stakingTier = 'DIAMOND';
            feeDiscount = 50;
            features = ['Unlimited API calls', 'Priority support', 'Revenue sharing', 'Governance voting', 'Beta features'];
        }
        else if (lxonBalance >= 50000) {
            stakingTier = 'GOLD';
            feeDiscount = 30;
            features = ['Advanced analytics', 'Revenue sharing', 'Governance voting'];
        }
        else if (lxonBalance >= 10000) {
            stakingTier = 'SILVER';
            feeDiscount = 15;
            features = ['Basic analytics', 'Governance voting'];
        }
        else if (lxonBalance >= 1000) {
            stakingTier = 'BRONZE';
            feeDiscount = 5;
            features = ['Basic features'];
        }
        return {
            stakingTier,
            governancePower: lxonBalance,
            feeDiscount,
            features,
        };
    }
    async getStakingRewards(userId) {
        const wallets = await this.prisma.wallet.findMany({
            where: { userId, chain: 'LXON', isActive: true },
            include: { balances: true, stakingPositions: true },
        });
        const totalStaked = wallets.reduce((sum, wallet) => {
            return sum + wallet.stakingPositions
                .filter(p => p.status === 'ACTIVE')
                .reduce((s, p) => s + parseFloat(p.amount), 0);
        }, 0);
        const currentApy = 12.5;
        const estimatedAnnualRewards = totalStaked * (currentApy / 100);
        const pendingRewards = estimatedAnnualRewards * 0.3;
        return {
            currentApy,
            estimatedAnnualRewards,
            totalStaked,
            pendingRewards,
        };
    }
};
exports.TokenUtilityService = TokenUtilityService;
exports.TokenUtilityService = TokenUtilityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], TokenUtilityService);


/***/ }),

/***/ "./src/modules/tokens/services/tokens.service.ts":
/*!*******************************************************!*\
  !*** ./src/modules/tokens/services/tokens.service.ts ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TokensService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../common/modules/prisma.service */ "./src/modules/common/modules/prisma.service.ts");
const http_service_1 = __webpack_require__(/*! ../../common/modules/http.service */ "./src/modules/common/modules/http.service.ts");
const wallet_entity_1 = __webpack_require__(/*! ../../wallets/entities/wallet.entity */ "./src/modules/wallets/entities/wallet.entity.ts");
const logger_service_1 = __webpack_require__(/*! ../../common/modules/logger.service */ "./src/modules/common/modules/logger.service.ts");
let TokensService = class TokensService {
    constructor(prisma, httpService) {
        this.prisma = prisma;
        this.httpService = httpService;
        this.logger = new logger_service_1.LoggerService();
        this.coinGeckoApi = 'https://api.coingecko.com/api/v3';
        this.dexScreenerApi = 'https://api.dexscreener.com/latest/dex';
    }
    async searchTokens(query, chain) {
        if (!query || query.length < 2) {
            throw new common_1.BadRequestException('Query must be at least 2 characters');
        }
        const normalizedQuery = query.toLowerCase();
        const dbTokens = await this.prisma.token.findMany({
            where: {
                OR: [
                    { symbol: { contains: query.toUpperCase() } },
                    { name: { contains: query } },
                    { address: { contains: query.toLowerCase() } },
                ],
                ...(chain && { chain }),
            },
            take: 20,
            orderBy: { marketCapUsd: 'desc' },
        });
        const externalResults = await this.fetchExternalTokens(query, chain);
        const combined = [...dbTokens, ...externalResults];
        const unique = new Map();
        for (const token of combined) {
            const key = `${token.chain}-${token.address}`;
            if (!unique.has(key)) {
                unique.set(key, token);
            }
        }
        return Array.from(unique.values()).slice(0, 50);
    }
    async getTokenByAddress(address, chain) {
        const normalizedAddress = address.toLowerCase().replace(/^0x/, '0x');
        let token = await this.prisma.token.findUnique({
            where: { address: normalizedAddress },
        });
        if (!token) {
            token = await this.fetchAndUpsertToken(normalizedAddress, chain);
        }
        if (!token) {
            return null;
        }
        return {
            address: token.address,
            chain: token.chain,
            symbol: token.symbol,
            name: token.name,
            priceUsd: token.priceUsd?.toString(),
            change24h: token.change24h?.toString(),
            marketCapUsd: token.marketCapUsd?.toString(),
            volumeUsd24h: token.volumeUsd24h?.toString(),
            riskScore: token.riskScore || undefined,
            isVerified: token.isVerified,
            isScam: token.isScam,
        };
    }
    async getTokenPrice(address, chain) {
        const token = await this.getTokenByAddress(address, chain);
        if (!token) {
            return null;
        }
        return {
            priceUsd: token.priceUsd || '0',
            change24h: token.change24h || '0',
        };
    }
    async getTrendingTokens(chain) {
        const tokens = await this.prisma.token.findMany({
            where: {
                ...(chain && { chain }),
                isScam: false,
            },
            orderBy: { volumeUsd24h: 'desc' },
            take: 20,
        });
        return tokens.map((t) => ({
            address: t.address,
            chain: t.chain,
            symbol: t.symbol,
            name: t.name,
            priceUsd: t.priceUsd?.toString(),
            change24h: t.change24h?.toString(),
            marketCapUsd: t.marketCapUsd?.toString(),
            volumeUsd24h: t.volumeUsd24h?.toString(),
            riskScore: t.riskScore || undefined,
            isVerified: t.isVerified,
            isScam: t.isScam,
        }));
    }
    async getTopGainers(chain) {
        const tokens = await this.prisma.token.findMany({
            where: {
                ...(chain && { chain }),
                isScam: false,
                change24h: { not: null },
            },
            orderBy: { change24h: 'desc' },
            take: 20,
        });
        return tokens.map((t) => ({
            address: t.address,
            chain: t.chain,
            symbol: t.symbol,
            name: t.name,
            priceUsd: t.priceUsd?.toString(),
            change24h: t.change24h?.toString(),
            marketCapUsd: t.marketCapUsd?.toString(),
            volumeUsd24h: t.volumeUsd24h?.toString(),
            isVerified: t.isVerified,
            isScam: t.isScam,
        }));
    }
    async getTopLosers(chain) {
        const tokens = await this.prisma.token.findMany({
            where: {
                ...(chain && { chain }),
                isScam: false,
                change24h: { not: null },
            },
            orderBy: { change24h: 'asc' },
            take: 20,
        });
        return tokens.map((t) => ({
            address: t.address,
            chain: t.chain,
            symbol: t.symbol,
            name: t.name,
            priceUsd: t.priceUsd?.toString(),
            change24h: t.change24h?.toString(),
            marketCapUsd: t.marketCapUsd?.toString(),
            volumeUsd24h: t.volumeUsd24h?.toString(),
            isVerified: t.isVerified,
            isScam: t.isScam,
        }));
    }
    async fetchExternalTokens(query, chain) {
        try {
            const response = await this.httpService
                .getAxiosInstance()
                .get(`${this.dexScreenerApi}/search`, {
                params: { q: query },
            });
            if (!response || !response.data) {
                throw new Error('Empty response from DEX Screener');
            }
            const pairs = response.data.pairs || [];
            const tokens = [];
            for (const pair of pairs) {
                if (chain && this.mapChain(pair.chainId) !== chain) {
                    continue;
                }
                tokens.push({
                    address: pair.baseToken.address,
                    chain: this.mapChain(pair.chainId),
                    symbol: pair.baseToken.symbol,
                    name: pair.baseToken.name,
                    priceUsd: pair.priceUsd,
                    change24h: pair.priceChange?.h24,
                    marketCapUsd: pair.marketCap?.toString(),
                    volumeUsd24h: pair.volume?.h24?.toString(),
                });
            }
            return tokens.slice(0, 20);
        }
        catch (error) {
            this.logger.warn(`Failed to fetch external tokens: ${error.message}`, 'TokensService');
            return [];
        }
    }
    async fetchAndUpsertToken(address, chain) {
        try {
            const response = await this.httpService
                .getAxiosInstance()
                .get(`${this.dexScreenerApi}/search`, {
                params: { q: address },
            });
            if (!response || !response.data) {
                return null;
            }
            const pair = response.data.pairs?.[0];
            if (!pair)
                return null;
            return this.prisma.token.upsert({
                where: { address: address.toLowerCase() },
                create: {
                    address: address.toLowerCase(),
                    chain,
                    symbol: pair.baseToken.symbol,
                    name: pair.baseToken.name,
                    decimals: 18,
                    priceUsd: parseFloat(pair.priceUsd || '0'),
                    change24h: parseFloat(pair.priceChange?.h24 || '0'),
                    marketCapUsd: parseFloat(pair.marketCap?.toString() || '0'),
                    volumeUsd24h: parseFloat(pair.volume?.h24?.toString() || '0'),
                    lastUpdated: new Date(),
                },
                update: {
                    priceUsd: parseFloat(pair.priceUsd || '0'),
                    change24h: parseFloat(pair.priceChange?.h24 || '0'),
                    marketCapUsd: parseFloat(pair.marketCap?.toString() || '0'),
                    volumeUsd24h: parseFloat(pair.volume?.h24?.toString() || '0'),
                    lastUpdated: new Date(),
                },
            });
        }
        catch (error) {
            this.logger.warn(`Failed to fetch token from external API: ${error.message}`, 'TokensService');
            return null;
        }
    }
    mapChain(chainId) {
        const chainMap = {
            ethereum: wallet_entity_1.Chain.ETHEREUM,
            polygon: wallet_entity_1.Chain.POLYGON,
            bsc: wallet_entity_1.Chain.BSC,
            arbitrum: wallet_entity_1.Chain.ARBITRUM,
            base: wallet_entity_1.Chain.BASE,
            avalanche: wallet_entity_1.Chain.AVALANCHE,
            lxon: wallet_entity_1.Chain.LXON,
        };
        return chainMap[chainId] || wallet_entity_1.Chain.ETHEREUM;
    }
};
exports.TokensService = TokensService;
exports.TokensService = TokensService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof http_service_1.HttpService !== "undefined" && http_service_1.HttpService) === "function" ? _b : Object])
], TokensService);


/***/ }),

/***/ "./src/modules/tokens/tokens.module.ts":
/*!*********************************************!*\
  !*** ./src/modules/tokens/tokens.module.ts ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TokensModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_module_1 = __webpack_require__(/*! ../common/modules/prisma.module */ "./src/modules/common/modules/prisma.module.ts");
const http_module_1 = __webpack_require__(/*! ../common/modules/http.module */ "./src/modules/common/modules/http.module.ts");
const logger_module_1 = __webpack_require__(/*! ../common/modules/logger.module */ "./src/modules/common/modules/logger.module.ts");
const auth_module_1 = __webpack_require__(/*! ../auth/auth.module */ "./src/modules/auth/auth.module.ts");
const tokens_service_1 = __webpack_require__(/*! ./services/tokens.service */ "./src/modules/tokens/services/tokens.service.ts");
const token_utility_service_1 = __webpack_require__(/*! ./services/token-utility.service */ "./src/modules/tokens/services/token-utility.service.ts");
const tokens_controller_1 = __webpack_require__(/*! ./controllers/tokens.controller */ "./src/modules/tokens/controllers/tokens.controller.ts");
let TokensModule = class TokensModule {
};
exports.TokensModule = TokensModule;
exports.TokensModule = TokensModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, http_module_1.HttpModule, logger_module_1.LoggerModule, auth_module_1.AuthModule],
        controllers: [tokens_controller_1.TokensController],
        providers: [tokens_service_1.TokensService, token_utility_service_1.TokenUtilityService],
        exports: [tokens_service_1.TokensService],
    })
], TokensModule);


/***/ }),

/***/ "./src/modules/transactions/controllers/transactions.controller.ts":
/*!*************************************************************************!*\
  !*** ./src/modules/transactions/controllers/transactions.controller.ts ***!
  \*************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TransactionsController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const transactions_service_1 = __webpack_require__(/*! ../services/transactions.service */ "./src/modules/transactions/services/transactions.service.ts");
const transaction_entity_1 = __webpack_require__(/*! ../entities/transaction.entity */ "./src/modules/transactions/entities/transaction.entity.ts");
const transaction_dto_1 = __webpack_require__(/*! ../dto/transaction.dto */ "./src/modules/transactions/dto/transaction.dto.ts");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../common/guards/jwt-auth.guard */ "./src/modules/common/guards/jwt-auth.guard.ts");
const current_user_decorator_1 = __webpack_require__(/*! ../../common/decorators/current-user.decorator */ "./src/modules/common/decorators/current-user.decorator.ts");
const roles_decorator_1 = __webpack_require__(/*! ../../common/decorators/roles.decorator */ "./src/modules/common/decorators/roles.decorator.ts");
const roles_guard_1 = __webpack_require__(/*! ../../common/guards/roles.guard */ "./src/modules/common/guards/roles.guard.ts");
const enums_1 = __webpack_require__(/*! ../../../common/enums */ "./src/common/enums.ts");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const parse_pagination_pipe_1 = __webpack_require__(/*! ../../common/pipes/parse-pagination.pipe */ "./src/modules/common/pipes/parse-pagination.pipe.ts");
const mev_resistant_executor_service_1 = __webpack_require__(/*! ../services/mev-resistant-executor.service */ "./src/modules/transactions/services/mev-resistant-executor.service.ts");
const pin_biometric_auth_guard_1 = __webpack_require__(/*! ../../common/guards/pin-biometric-auth.guard */ "./src/modules/common/guards/pin-biometric-auth.guard.ts");
const pin_biometric_dto_1 = __webpack_require__(/*! ../dto/pin-biometric.dto */ "./src/modules/transactions/dto/pin-biometric.dto.ts");
let TransactionsController = class TransactionsController {
    constructor(transactionsService, mevService) {
        this.transactionsService = transactionsService;
        this.mevService = mevService;
    }
    getUserTransactions(userId, filters) {
        return this.transactionsService.getUserTransactions({ ...filters, userId });
    }
    getStats(userId, query) {
        const startDate = query.startDate ? new Date(query.startDate) : undefined;
        const endDate = query.endDate ? new Date(query.endDate) : undefined;
        return this.transactionsService.getTransactionStats(userId, startDate, endDate);
    }
    getTransaction(userId, hash) {
        return this.transactionsService.getTransactionByHash(userId, hash);
    }
    indexTransactions(userId, walletAddress, chain) {
        const dto = new transaction_dto_1.IndexTransactionsDto();
        dto.walletAddress = walletAddress;
        dto.chain = chain;
        return this.transactionsService.indexTransactionsFromAddress(userId, dto.walletAddress, chain);
    }
    async submitOrder(userId, dto) {
        return this.mevService.submitOrder(dto, userId);
    }
    async revealOrder(dto) {
        return this.mevService.revealOrder(dto);
    }
    getOrderBook(chain) {
        return this.mevService.getOrderBook(chain);
    }
    async matchOrders(chain) {
        const matches = await this.mevService.matchOrders(chain);
        return { matches, count: matches.length };
    }
    async getUserOrders(userId, query) {
        return this.mevService.getUserOrders(userId, query);
    }
    async cancelOrder(userId, orderId, dto) {
        return this.mevService.cancelOrder(orderId, userId);
    }
    getBatchHistory(limit) {
        return this.mevService.getBatchHistory(limit || 10);
    }
};
exports.TransactionsController = TransactionsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get transactions for current user with filters' }),
    (0, swagger_1.ApiQuery)({ name: 'chain', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, enum: ['TRANSFER', 'SWAP', 'STAKE', 'UNSTAKE', 'MINT', 'BURN', 'APPROVE', 'CONTRACT_CALL', 'BRIDGE', 'NFT_TRANSFER'] }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['PENDING', 'CONFIRMED', 'FAILED', 'DROPPED'] }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, common_1.UsePipes)(parse_pagination_pipe_1.ParsePaginationPipe),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transactions retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_c = typeof transaction_entity_1.TransactionFilter !== "undefined" && transaction_entity_1.TransactionFilter) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "getUserTransactions", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction statistics for current user' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transaction stats retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':hash'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction details by hash' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transaction retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transaction not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('hash')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "getTransaction", null);
__decorate([
    (0, common_1.Post)('index/:walletAddress/:chain'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Index transactions from a blockchain address (admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transactions indexed' }),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('walletAddress')),
    __param(2, (0, common_1.Param)('chain')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "indexTransactions", null);
__decorate([
    (0, common_1.Post)('orders'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, common_1.UseGuards)(pin_biometric_auth_guard_1.PinBiometricAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Submit a MEV-resistant order into the batch auction' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Order submitted' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid order parameters' }),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "submitOrder", null);
__decorate([
    (0, common_1.Post)('orders/reveal'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, common_1.UseGuards)(pin_biometric_auth_guard_1.PinBiometricAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Reveal a commit-reveal order' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order revealed' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Reveal failed' }),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "revealOrder", null);
__decorate([
    (0, common_1.Get)('orders/book/:chain'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get MEV-resistant order book for a chain' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order book retrieved' }),
    __param(0, (0, common_1.Param)('chain')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "getOrderBook", null);
__decorate([
    (0, common_1.Post)('orders/match/:chain'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger batch order matching for a chain (admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Matching complete' }),
    __param(0, (0, common_1.Param)('chain')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "matchOrders", null);
__decorate([
    (0, common_1.Get)('orders'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user orders' }),
    (0, swagger_1.ApiQuery)({ name: 'chain', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'side', required: false, enum: ['BUY', 'SELL'] }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['PENDING', 'OPEN', 'PARTIALLY_FILLED', 'FILLED', 'CANCELLED', 'EXPIRED', 'REJECTED'] }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, common_1.UsePipes)(parse_pagination_pipe_1.ParsePaginationPipe),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Orders retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "getUserOrders", null);
__decorate([
    (0, common_1.Delete)('orders/:orderId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, common_1.UseGuards)(pin_biometric_auth_guard_1.PinBiometricAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel an open order' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order cancelled' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Order not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('orderId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, typeof (_j = typeof pin_biometric_dto_1.TransactionAuthDto !== "undefined" && pin_biometric_dto_1.TransactionAuthDto) === "function" ? _j : Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "cancelOrder", null);
__decorate([
    (0, common_1.Get)('orders/batches'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get batch auction history' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Batch history retrieved' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "getBatchHistory", null);
exports.TransactionsController = TransactionsController = __decorate([
    (0, swagger_1.ApiTags)('Transactions'),
    (0, common_1.Controller)('transactions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [typeof (_a = typeof transactions_service_1.TransactionsService !== "undefined" && transactions_service_1.TransactionsService) === "function" ? _a : Object, typeof (_b = typeof mev_resistant_executor_service_1.MEVResistantExecutorService !== "undefined" && mev_resistant_executor_service_1.MEVResistantExecutorService) === "function" ? _b : Object])
], TransactionsController);


/***/ }),

/***/ "./src/modules/transactions/dto/pin-biometric.dto.ts":
/*!***********************************************************!*\
  !*** ./src/modules/transactions/dto/pin-biometric.dto.ts ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdatePinBiometricSettingsDto = exports.TransactionAuthDto = exports.EnableBiometricDto = exports.VerifyPinDto = exports.SetPinDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
class SetPinDto {
}
exports.SetPinDto = SetPinDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '6-digit PIN',
        example: '123456',
        minLength: 6,
        maxLength: 6,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6, { message: 'PIN must be exactly 6 digits' }),
    (0, class_validator_1.MaxLength)(6, { message: 'PIN must be exactly 6 digits' }),
    __metadata("design:type", String)
], SetPinDto.prototype, "pin", void 0);
class VerifyPinDto {
}
exports.VerifyPinDto = VerifyPinDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '6-digit PIN',
        example: '123456',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6, { message: 'PIN must be exactly 6 digits' }),
    (0, class_validator_1.MaxLength)(6, { message: 'PIN must be exactly 6 digits' }),
    __metadata("design:type", String)
], VerifyPinDto.prototype, "pin", void 0);
class EnableBiometricDto {
}
exports.EnableBiometricDto = EnableBiometricDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Biometric public key for signature verification',
        example: '0xabcdef1234567890abcdef1234567890abcdef12',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnableBiometricDto.prototype, "publicKey", void 0);
class TransactionAuthDto {
}
exports.TransactionAuthDto = TransactionAuthDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'PIN for transaction authorization',
        example: '123456',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6, { message: 'PIN must be exactly 6 digits' }),
    (0, class_validator_1.MaxLength)(6, { message: 'PIN must be exactly 6 digits' }),
    __metadata("design:type", String)
], TransactionAuthDto.prototype, "pin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Biometric signature for transaction authorization',
        example: '0xsignature1234567890',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransactionAuthDto.prototype, "biometricSignature", void 0);
class UpdatePinBiometricSettingsDto {
}
exports.UpdatePinBiometricSettingsDto = UpdatePinBiometricSettingsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether PIN/biometric is required for transactions',
        example: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePinBiometricSettingsDto.prototype, "isPinBiometricRequired", void 0);


/***/ }),

/***/ "./src/modules/transactions/dto/transaction.dto.ts":
/*!*********************************************************!*\
  !*** ./src/modules/transactions/dto/transaction.dto.ts ***!
  \*********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IndexTransactionsDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
class IndexTransactionsDto {
}
exports.IndexTransactionsDto = IndexTransactionsDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(42, 42, { message: 'Wallet address must be 42 characters (0x + 40 hex)' }),
    (0, class_validator_1.Matches)(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid Ethereum address format' }),
    __metadata("design:type", String)
], IndexTransactionsDto.prototype, "walletAddress", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsIn)(['ETHEREUM', 'POLYGON', 'BSC', 'ARBITRUM', 'BASE', 'AVALANCHE'], {
        message: 'Chain must be ethereum, polygon, bsc, arbitrum, base, or avalanche',
    }),
    __metadata("design:type", String)
], IndexTransactionsDto.prototype, "chain", void 0);


/***/ }),

/***/ "./src/modules/transactions/entities/order.entity.ts":
/*!***********************************************************!*\
  !*** ./src/modules/transactions/entities/order.entity.ts ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OrderStatus = exports.OrderType = exports.OrderSide = void 0;
var OrderSide;
(function (OrderSide) {
    OrderSide["BUY"] = "BUY";
    OrderSide["SELL"] = "SELL";
})(OrderSide || (exports.OrderSide = OrderSide = {}));
var OrderType;
(function (OrderType) {
    OrderType["LIMIT"] = "LIMIT";
    OrderType["MARKET"] = "MARKET";
    OrderType["STOP_LIMIT"] = "STOP_LIMIT";
})(OrderType || (exports.OrderType = OrderType = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["OPEN"] = "OPEN";
    OrderStatus["PARTIALLY_FILLED"] = "PARTIALLY_FILLED";
    OrderStatus["FILLED"] = "FILLED";
    OrderStatus["CANCELLED"] = "CANCELLED";
    OrderStatus["EXPIRED"] = "EXPIRED";
    OrderStatus["REJECTED"] = "REJECTED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));


/***/ }),

/***/ "./src/modules/transactions/entities/transaction.entity.ts":
/*!*****************************************************************!*\
  !*** ./src/modules/transactions/entities/transaction.entity.ts ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TransactionStatus = exports.TransactionType = void 0;
var TransactionType;
(function (TransactionType) {
    TransactionType["TRANSFER"] = "TRANSFER";
    TransactionType["SWAP"] = "SWAP";
    TransactionType["STAKE"] = "STAKE";
    TransactionType["UNSTAKE"] = "UNSTAKE";
    TransactionType["MINT"] = "MINT";
    TransactionType["BURN"] = "BURN";
    TransactionType["APPROVE"] = "APPROVE";
    TransactionType["CONTRACT_CALL"] = "CONTRACT_CALL";
    TransactionType["BRIDGE"] = "BRIDGE";
    TransactionType["NFT_TRANSFER"] = "NFT_TRANSFER";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "PENDING";
    TransactionStatus["CONFIRMED"] = "CONFIRMED";
    TransactionStatus["FAILED"] = "FAILED";
    TransactionStatus["DROPPED"] = "DROPPED";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));


/***/ }),

/***/ "./src/modules/transactions/services/mev-resistant-executor.service.ts":
/*!*****************************************************************************!*\
  !*** ./src/modules/transactions/services/mev-resistant-executor.service.ts ***!
  \*****************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MEVResistantExecutorService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MEVResistantExecutorService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../common/modules/prisma.service */ "./src/modules/common/modules/prisma.service.ts");
const order_entity_1 = __webpack_require__(/*! ../entities/order.entity */ "./src/modules/transactions/entities/order.entity.ts");
let MEVResistantExecutorService = MEVResistantExecutorService_1 = class MEVResistantExecutorService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(MEVResistantExecutorService_1.name);
        this.BATCH_INTERVAL_MS = 5000;
        this.MIN_VALIDATORS = 3;
        this.MAX_PRICE_DEVIATION = 0.05;
        this.COMMIT_REVEAL_DELAY_MS = 3000;
        this.pendingOrders = new Map();
        this.currentBatchId = '';
        this.batchTimer = null;
        this.batchRounds = [];
        this.commitRevealEnabled = true;
        this.startNewBatch();
        this.startBatchScheduler();
    }
    enableCommitReveal(enabled) {
        this.commitRevealEnabled = enabled;
    }
    async submitOrder(dto, userId) {
        if (dto.amount <= 0) {
            throw new Error('Invalid amount');
        }
        if (dto.type === order_entity_1.OrderType.LIMIT && (!dto.price || dto.price <= 0)) {
            throw new Error('Limit orders require a valid price');
        }
        if (this.commitRevealEnabled && !dto.commitHash) {
            return {
                order: {},
                accepted: false,
                reason: 'Commit-reveal scheme required: provide commitHash',
            };
        }
        const order = await this.prisma.order.create({
            data: {
                userId,
                walletId: dto.walletId,
                chain: dto.chain,
                side: dto.side,
                type: dto.type,
                price: dto.price,
                amount: dto.amount,
                remainingAmount: dto.amount,
                status: order_entity_1.OrderStatus.PENDING,
                commitHash: dto.commitHash,
                mevProtected: dto.mevProtected ?? true,
                batchId: this.currentBatchId,
                metadata: dto.stopPrice ? JSON.stringify({ stopPrice: dto.stopPrice }) : undefined,
            },
        });
        const orderEntity = {
            id: order.id,
            userId: order.userId,
            walletId: order.walletId || undefined,
            chain: order.chain,
            side: order.side,
            type: order.type,
            price: order.price,
            amount: order.amount,
            filledAmount: order.filledAmount,
            remainingAmount: order.remainingAmount,
            status: order.status,
            commitHash: order.commitHash || undefined,
            revealed: order.revealed,
            mevProtected: order.mevProtected,
            batchId: order.batchId || undefined,
            metadata: order.metadata || undefined,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
        };
        this.pendingOrders.set(order.id, orderEntity);
        this.logger.log(`Order ${order.id} submitted to batch ${this.currentBatchId}`);
        return {
            order: orderEntity,
            accepted: true,
            reason: 'Order accepted into batch auction',
        };
    }
    async revealOrder(dto) {
        const order = this.pendingOrders.get(dto.orderId);
        if (!order) {
            return { revealed: false, reason: 'Order not found' };
        }
        if (order.revealed) {
            return { revealed: false, reason: 'Order already revealed' };
        }
        const expectedCommit = this._computeCommitHash(order, dto.secret);
        if (order.commitHash && order.commitHash !== expectedCommit) {
            return { revealed: false, reason: 'Commit hash mismatch - order rejected' };
        }
        await this.prisma.order.update({
            where: { id: dto.orderId },
            data: { revealed: true },
        });
        order.revealed = true;
        return { revealed: true, reason: 'Order revealed successfully' };
    }
    async matchOrders(chain) {
        const batchId = this.currentBatchId;
        const orders = await this.prisma.order.findMany({
            where: {
                chain,
                status: { in: [order_entity_1.OrderStatus.PENDING, order_entity_1.OrderStatus.OPEN] },
                batchId,
                mevProtected: true,
                revealed: true,
            },
            orderBy: { createdAt: 'asc' },
        });
        const buyOrders = orders
            .filter(o => o.side === 'BUY')
            .sort((a, b) => b.price - a.price);
        const sellOrders = orders
            .filter(o => o.side === 'SELL')
            .sort((a, b) => a.price - b.price);
        const matches = [];
        let buyIdx = 0;
        let sellIdx = 0;
        while (buyIdx < buyOrders.length && sellIdx < sellOrders.length) {
            const buy = buyOrders[buyIdx];
            const sell = sellOrders[sellIdx];
            if (buy.price >= sell.price) {
                const matchPrice = sell.price;
                const matchAmount = Math.min(buy.remainingAmount - buy.filledAmount, sell.remainingAmount - sell.filledAmount);
                if (matchAmount <= 0) {
                    buyIdx++;
                    sellIdx++;
                    continue;
                }
                const match = await this.prisma.orderMatch.create({
                    data: {
                        buyOrderId: buy.id,
                        sellOrderId: sell.id,
                        chain,
                        price: matchPrice,
                        amount: matchAmount,
                        fee: matchPrice * matchAmount * 0.001,
                        status: order_entity_1.OrderStatus.FILLED,
                        batchId,
                        executedAt: new Date(),
                    },
                });
                const updatedBuy = await this.prisma.order.update({
                    where: { id: buy.id },
                    data: {
                        filledAmount: { increment: matchAmount },
                        remainingAmount: { decrement: matchAmount },
                        status: buy.filledAmount + matchAmount >= buy.amount ? order_entity_1.OrderStatus.FILLED : order_entity_1.OrderStatus.PARTIALLY_FILLED,
                    },
                });
                const updatedSell = await this.prisma.order.update({
                    where: { id: sell.id },
                    data: {
                        filledAmount: { increment: matchAmount },
                        remainingAmount: { decrement: matchAmount },
                        status: sell.filledAmount + matchAmount >= sell.amount ? order_entity_1.OrderStatus.FILLED : order_entity_1.OrderStatus.PARTIALLY_FILLED,
                    },
                });
                this.pendingOrders.delete(buy.id);
                this.pendingOrders.delete(sell.id);
                if (updatedBuy.status !== order_entity_1.OrderStatus.FILLED) {
                    this.pendingOrders.set(buy.id, updatedBuy);
                }
                if (updatedSell.status !== order_entity_1.OrderStatus.FILLED) {
                    this.pendingOrders.set(sell.id, updatedSell);
                }
                matches.push({
                    id: match.id,
                    buyOrderId: match.buyOrderId,
                    sellOrderId: match.sellOrderId,
                    chain: match.chain,
                    price: match.price,
                    amount: match.amount,
                    fee: match.fee,
                    status: match.status,
                    executedAt: match.executedAt || undefined,
                    batchId: match.batchId,
                    metadata: match.metadata || undefined,
                    createdAt: match.createdAt,
                });
                if (updatedBuy.status === order_entity_1.OrderStatus.FILLED)
                    buyIdx++;
                if (updatedSell.status === order_entity_1.OrderStatus.FILLED)
                    sellIdx++;
            }
            else {
                break;
            }
        }
        this.logger.log(`Batch ${batchId}: matched ${matches.length} orders on ${chain}`);
        return matches;
    }
    async getOrderBook(chain) {
        const [bids, asks] = await Promise.all([
            this.prisma.order.findMany({
                where: { chain, side: 'BUY', status: { in: [order_entity_1.OrderStatus.OPEN, order_entity_1.OrderStatus.PARTIALLY_FILLED] } },
                orderBy: { price: 'desc' },
            }),
            this.prisma.order.findMany({
                where: { chain, side: 'SELL', status: { in: [order_entity_1.OrderStatus.OPEN, order_entity_1.OrderStatus.PARTIALLY_FILLED] } },
                orderBy: { price: 'asc' },
            }),
        ]);
        return {
            bids: bids.map(this.mapOrder),
            asks: asks.map(this.mapOrder),
        };
    }
    async getBatchHistory(limit = 10) {
        return this.batchRounds.slice(-limit);
    }
    async getUserOrders(userId, filters) {
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;
        const where = { userId };
        if (filters.chain)
            where.chain = filters.chain;
        if (filters.side)
            where.side = filters.side;
        if (filters.status)
            where.status = filters.status;
        const [data, total] = await Promise.all([
            this.prisma.order.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
            this.prisma.order.count({ where }),
        ]);
        return { data: data.map(this.mapOrder), total, page, limit };
    }
    async cancelOrder(orderId, userId) {
        const order = await this.prisma.order.findFirst({ where: { id: orderId, userId } });
        if (!order) {
            return { cancelled: false, reason: 'Order not found' };
        }
        if (order.status === order_entity_1.OrderStatus.FILLED || order.status === order_entity_1.OrderStatus.CANCELLED) {
            return { cancelled: false, reason: `Order already ${order.status.toLowerCase()}` };
        }
        await this.prisma.order.update({
            where: { id: orderId },
            data: { status: order_entity_1.OrderStatus.CANCELLED },
        });
        this.pendingOrders.delete(orderId);
        return { cancelled: true, reason: 'Order cancelled successfully' };
    }
    startNewBatch() {
        this.currentBatchId = `batch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        this.logger.log(`Started new batch: ${this.currentBatchId}`);
    }
    startBatchScheduler() {
        this.batchTimer = setInterval(() => {
            this.finalizeBatch();
            this.startNewBatch();
        }, this.BATCH_INTERVAL_MS);
    }
    async finalizeBatch() {
        const batchId = this.currentBatchId;
        this.logger.log(`Finalizing batch: ${batchId}`);
        const round = {
            batchId,
            startTime: Date.now() - this.BATCH_INTERVAL_MS,
            endTime: Date.now(),
            orders: Array.from(this.pendingOrders.values()).filter(o => o.batchId === batchId),
            matches: [],
        };
        this.batchRounds.push(round);
        if (this.batchRounds.length > 100) {
            this.batchRounds = this.batchRounds.slice(-100);
        }
    }
    _detectMEVPattern(order) {
        const chainKey = order.chain;
        const orders = Array.from(this.pendingOrders.values()).filter(o => o.chain === chainKey);
        const sameUserRecent = orders.filter(o => o.userId === order.userId && Math.abs(o.createdAt.getTime() - order.createdAt.getTime()) < 5000);
        if (sameUserRecent.length > 3) {
            return { protected: true, reason: 'High-frequency order pattern detected - possible MEV bot' };
        }
        const oppositeSideSamePrice = orders.filter(o => o.price === order.price && o.side !== order.side && Math.abs(o.createdAt.getTime() - order.createdAt.getTime()) < 1000);
        if (oppositeSideSamePrice.length > 0) {
            return { protected: true, reason: 'Sandwich attack pattern detected - same price opposite side within 1 second' };
        }
        const largerOrdersOpposite = orders.filter(o => o.side !== order.side && o.amount > order.amount * 10 && Math.abs(o.createdAt.getTime() - order.createdAt.getTime()) < 2000);
        if (largerOrdersOpposite.length > 0) {
            return { protected: true, reason: 'Potential time-bandit attack: large opposite-side order detected' };
        }
        return { protected: false, reason: 'No MEV patterns detected' };
    }
    _computeCommitHash(order, secret) {
        const data = `${order.id}${order.side}${order.price}${order.amount}${order.createdAt.getTime()}${secret}`;
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash |= 0;
        }
        return `0x${Math.abs(hash).toString(16).padStart(64, '0')}`;
    }
    mapOrder(order) {
        const o = order;
        return {
            id: o.id,
            userId: o.userId,
            walletId: o.walletId || undefined,
            chain: o.chain,
            side: o.side,
            type: o.type,
            price: o.price,
            amount: o.amount,
            filledAmount: o.filledAmount,
            remainingAmount: o.remainingAmount,
            status: o.status,
            commitHash: o.commitHash || undefined,
            revealed: o.revealed,
            mevProtected: o.mevProtected,
            batchId: o.batchId || undefined,
            metadata: o.metadata || undefined,
            createdAt: o.createdAt,
            updatedAt: o.updatedAt,
        };
    }
};
exports.MEVResistantExecutorService = MEVResistantExecutorService;
exports.MEVResistantExecutorService = MEVResistantExecutorService = MEVResistantExecutorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], MEVResistantExecutorService);


/***/ }),

/***/ "./src/modules/transactions/services/transaction-executor.service.ts":
/*!***************************************************************************!*\
  !*** ./src/modules/transactions/services/transaction-executor.service.ts ***!
  \***************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TransactionExecutorService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TransactionExecutorService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../common/modules/prisma.service */ "./src/modules/common/modules/prisma.service.ts");
let TransactionExecutorService = TransactionExecutorService_1 = class TransactionExecutorService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(TransactionExecutorService_1.name);
    }
    async executeTransaction(request) {
        this.logger.log(`Executing transaction: ${request.amount} ${request.token || 'ETH'} from ${request.from} to ${request.to}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const hash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        await this.prisma.transaction.create({
            data: {
                userId: request.from,
                hash,
                type: 'TRANSFER',
                status: 'PENDING',
                fromAddress: request.from,
                toAddress: request.to,
                value: request.amount,
                chain: request.chain,
                timestamp: new Date(),
            },
        });
        return {
            hash,
            status: 'PENDING',
            gasUsed: '0.0021',
            blockNumber: undefined,
        };
    }
    async estimateGas(request) {
        return {
            gasLimit: '21000',
            gasPrice: '30',
            estimatedFee: '0.00063',
        };
    }
    async getTransactionStatus(hash) {
        return {
            status: 'CONFIRMED',
            confirmations: 12,
            blockNumber: 18234567,
        };
    }
};
exports.TransactionExecutorService = TransactionExecutorService;
exports.TransactionExecutorService = TransactionExecutorService = TransactionExecutorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], TransactionExecutorService);


/***/ }),

/***/ "./src/modules/transactions/services/transactions.service.ts":
/*!*******************************************************************!*\
  !*** ./src/modules/transactions/services/transactions.service.ts ***!
  \*******************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TransactionsService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../common/modules/prisma.service */ "./src/modules/common/modules/prisma.service.ts");
const http_service_1 = __webpack_require__(/*! ../../common/modules/http.service */ "./src/modules/common/modules/http.service.ts");
const transaction_entity_1 = __webpack_require__(/*! ../entities/transaction.entity */ "./src/modules/transactions/entities/transaction.entity.ts");
const wallet_entity_1 = __webpack_require__(/*! ../../wallets/entities/wallet.entity */ "./src/modules/wallets/entities/wallet.entity.ts");
const logger_service_1 = __webpack_require__(/*! ../../common/modules/logger.service */ "./src/modules/common/modules/logger.service.ts");
let TransactionsService = class TransactionsService {
    constructor(prisma, httpService) {
        this.prisma = prisma;
        this.httpService = httpService;
        this.logger = new logger_service_1.LoggerService();
    }
    async getUserTransactions(filter) {
        const { page = 1, limit = 20, ...where } = filter;
        const skip = (page - 1) * limit;
        const query = {
            where: {
                userId: where.userId,
                ...(where.chain && { chain: where.chain }),
                ...(where.type && { type: where.type }),
                ...(where.status && { status: where.status }),
                ...(where.fromAddress && { fromAddress: { equals: where.fromAddress } }),
                ...(where.toAddress && { toAddress: { equals: where.toAddress } }),
                ...(where.startDate && { timestamp: { gte: where.startDate } }),
                ...(where.endDate && { timestamp: { lte: where.endDate } }),
            },
            skip,
            take: limit,
            orderBy: { timestamp: 'desc' },
        };
        const [data, total] = await Promise.all([
            this.prisma.transaction.findMany(query),
            this.prisma.transaction.count({ where: query.where }),
        ]);
        return { data, total };
    }
    async getTransactionByHash(userId, hash) {
        return this.prisma.transaction.findFirst({
            where: { userId, hash },
        });
    }
    async indexTransactionsFromAddress(userId, address, chain) {
        this.logger.log(`Indexing transactions for ${address} on ${chain}`, 'TransactionsService');
        const transactions = await this.fetchTransactionsFromChain(address, chain);
        const stored = [];
        for (const tx of transactions) {
            const existing = await this.prisma.transaction.findUnique({
                where: { hash: tx.hash },
            });
            if (!existing) {
                const created = await this.prisma.transaction.create({
                    data: {
                        ...tx,
                        userId,
                        status: transaction_entity_1.TransactionStatus.CONFIRMED,
                    },
                });
                stored.push(created);
            }
        }
        return stored;
    }
    async getTransactionStats(userId, startDate, endDate) {
        const where = {
            userId,
        };
        if (startDate || endDate) {
            where.timestamp = {};
            if (startDate)
                where.timestamp.gte = startDate;
            if (endDate)
                where.timestamp.lte = endDate;
        }
        const transactions = await this.prisma.transaction.findMany({
            where,
            select: {
                type: true,
                chain: true,
                valueUsd: true,
                feeUsd: true,
            },
        });
        const stats = {
            totalTransactions: transactions.length,
            totalVolumeUsd: '0',
            totalFeesUsd: '0',
            byType: {},
            byChain: {},
        };
        let totalVolume = 0;
        let totalFees = 0;
        for (const tx of transactions) {
            stats.byType[tx.type] = (stats.byType[tx.type] || 0) + 1;
            stats.byChain[tx.chain] = (stats.byChain[tx.chain] || 0) + 1;
            if (tx.valueUsd)
                totalVolume += parseFloat(tx.valueUsd);
            if (tx.feeUsd)
                totalFees += parseFloat(tx.feeUsd);
        }
        stats.totalVolumeUsd = totalVolume.toFixed(2);
        stats.totalFeesUsd = totalFees.toFixed(2);
        return stats;
    }
    async fetchTransactionsFromChain(address, chain) {
        const apiKeys = {
            [wallet_entity_1.Chain.ETHEREUM]: process.env.ETHERSCAN_API_KEY,
            [wallet_entity_1.Chain.POLYGON]: process.env.POLYGONSCAN_API_KEY,
            [wallet_entity_1.Chain.BSC]: process.env.BSCSCAN_API_KEY,
            [wallet_entity_1.Chain.ARBITRUM]: process.env.ARBISCAN_API_KEY,
            [wallet_entity_1.Chain.BASE]: process.env.BASESCAN_API_KEY,
            [wallet_entity_1.Chain.AVALANCHE]: process.env.SNOWTRACE_API_KEY,
            [wallet_entity_1.Chain.LXON]: process.env.LXONSCAN_API_KEY,
        };
        const explorerUrls = {
            [wallet_entity_1.Chain.ETHEREUM]: 'https://api.etherscan.io/api',
            [wallet_entity_1.Chain.POLYGON]: 'https://api.polygonscan.com/api',
            [wallet_entity_1.Chain.BSC]: 'https://api.bscscan.com/api',
            [wallet_entity_1.Chain.ARBITRUM]: 'https://api.arbiscan.io/api',
            [wallet_entity_1.Chain.BASE]: 'https://api.basescan.org/api',
            [wallet_entity_1.Chain.AVALANCHE]: 'https://api.snowtrace.io/api',
            [wallet_entity_1.Chain.LXON]: 'https://explorer.lxonevm.com/api',
        };
        const apiKey = apiKeys[chain];
        const baseUrl = explorerUrls[chain];
        if (!apiKey) {
            this.logger.warn(`No API key configured for chain ${chain}`, 'TransactionsService');
            return [];
        }
        try {
            const response = await this.httpService
                .getAxiosInstance()
                .get(baseUrl, {
                params: {
                    module: 'account',
                    action: 'txlist',
                    address,
                    startblock: 0,
                    endblock: 99999999,
                    sort: 'desc',
                    apikey: apiKey,
                },
            });
            const result = response.data;
            if (result.status !== '1') {
                return [];
            }
            return result.result.slice(0, 100).map((tx) => ({
                hash: tx.hash,
                chain: chain,
                type: this.inferTransactionType(tx),
                fromAddress: tx.from || address,
                toAddress: tx.to || undefined,
                value: tx.value,
                gasUsed: tx.gasUsed,
                gasPrice: tx.gasPrice,
                blockNumber: parseInt(tx.blockNumber, 10),
                timestamp: new Date(parseInt(tx.timeStamp, 10) * 1000),
                status: (tx.txreceipt_status === '1' ? transaction_entity_1.TransactionStatus.CONFIRMED : transaction_entity_1.TransactionStatus.FAILED),
                contractAddress: tx.to || undefined,
                tokenSymbol: this.getTokenSymbol(chain),
                ...(tx.data && { metadata: JSON.stringify(tx.data) }),
            }));
        }
        catch (error) {
            this.logger.warn(`Failed to fetch transactions: ${error.message}`, 'TransactionsService');
            return [];
        }
    }
    inferTransactionType(tx) {
        if (!tx.to || tx.to === '0x')
            return transaction_entity_1.TransactionType.CONTRACT_CALL;
        if (tx.input && tx.input !== '0x') {
            const methodId = tx.input.slice(0, 10).toLowerCase();
            const methodMap = {
                '0xa9059cbb': transaction_entity_1.TransactionType.TRANSFER,
                '0x095ea7b3': transaction_entity_1.TransactionType.APPROVE,
                '0x23b872dd': transaction_entity_1.TransactionType.TRANSFER,
            };
            return methodMap[methodId] || transaction_entity_1.TransactionType.CONTRACT_CALL;
        }
        return transaction_entity_1.TransactionType.TRANSFER;
    }
    getTokenSymbol(chain) {
        const symbols = {
            [wallet_entity_1.Chain.ETHEREUM]: 'ETH',
            [wallet_entity_1.Chain.POLYGON]: 'MATIC',
            [wallet_entity_1.Chain.BSC]: 'BNB',
            [wallet_entity_1.Chain.ARBITRUM]: 'ETH',
            [wallet_entity_1.Chain.BASE]: 'ETH',
            [wallet_entity_1.Chain.AVALANCHE]: 'AVAX',
            [wallet_entity_1.Chain.LXON]: 'LXON',
        };
        return symbols[chain];
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof http_service_1.HttpService !== "undefined" && http_service_1.HttpService) === "function" ? _b : Object])
], TransactionsService);


/***/ }),

/***/ "./src/modules/transactions/transactions.module.ts":
/*!*********************************************************!*\
  !*** ./src/modules/transactions/transactions.module.ts ***!
  \*********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TransactionsModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_module_1 = __webpack_require__(/*! ../common/modules/prisma.module */ "./src/modules/common/modules/prisma.module.ts");
const http_module_1 = __webpack_require__(/*! ../common/modules/http.module */ "./src/modules/common/modules/http.module.ts");
const logger_module_1 = __webpack_require__(/*! ../common/modules/logger.module */ "./src/modules/common/modules/logger.module.ts");
const auth_module_1 = __webpack_require__(/*! ../auth/auth.module */ "./src/modules/auth/auth.module.ts");
const wallets_module_1 = __webpack_require__(/*! ../wallets/wallets.module */ "./src/modules/wallets/wallets.module.ts");
const transactions_service_1 = __webpack_require__(/*! ./services/transactions.service */ "./src/modules/transactions/services/transactions.service.ts");
const transaction_executor_service_1 = __webpack_require__(/*! ./services/transaction-executor.service */ "./src/modules/transactions/services/transaction-executor.service.ts");
const mev_resistant_executor_service_1 = __webpack_require__(/*! ./services/mev-resistant-executor.service */ "./src/modules/transactions/services/mev-resistant-executor.service.ts");
const transactions_controller_1 = __webpack_require__(/*! ./controllers/transactions.controller */ "./src/modules/transactions/controllers/transactions.controller.ts");
let TransactionsModule = class TransactionsModule {
};
exports.TransactionsModule = TransactionsModule;
exports.TransactionsModule = TransactionsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, http_module_1.HttpModule, logger_module_1.LoggerModule, auth_module_1.AuthModule, wallets_module_1.WalletsModule],
        controllers: [transactions_controller_1.TransactionsController],
        providers: [transactions_service_1.TransactionsService, transaction_executor_service_1.TransactionExecutorService, mev_resistant_executor_service_1.MEVResistantExecutorService],
        exports: [transactions_service_1.TransactionsService, mev_resistant_executor_service_1.MEVResistantExecutorService],
    })
], TransactionsModule);


/***/ }),

/***/ "./src/modules/users/controllers/users.controller.ts":
/*!***********************************************************!*\
  !*** ./src/modules/users/controllers/users.controller.ts ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UsersController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const users_service_1 = __webpack_require__(/*! ../services/users.service */ "./src/modules/users/services/users.service.ts");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../common/guards/jwt-auth.guard */ "./src/modules/common/guards/jwt-auth.guard.ts");
const current_user_decorator_1 = __webpack_require__(/*! ../../common/decorators/current-user.decorator */ "./src/modules/common/decorators/current-user.decorator.ts");
const roles_decorator_1 = __webpack_require__(/*! ../../common/decorators/roles.decorator */ "./src/modules/common/decorators/roles.decorator.ts");
const roles_guard_1 = __webpack_require__(/*! ../../common/guards/roles.guard */ "./src/modules/common/guards/roles.guard.ts");
const enums_1 = __webpack_require__(/*! ../../../common/enums */ "./src/common/enums.ts");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const owner_guard_service_1 = __webpack_require__(/*! ../../common/modules/crypto/owner-guard.service */ "./src/modules/common/modules/crypto/owner-guard.service.ts");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    getProfile(user) {
        return this.usersService.findById(user.sub);
    }
    async getDecryptedUserData(userId) {
        return this.usersService.getDecryptedUserData(userId);
    }
    async reEncryptUserData(userId) {
        return this.usersService.reEncryptUserData(userId);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User profile retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)('owner/:userId'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.SUPER_ADMIN, enums_1.UserRole.ADMIN),
    (0, common_1.UseGuards)(owner_guard_service_1.OwnerGuardService),
    (0, swagger_1.ApiOperation)({ summary: 'Get decrypted user data (owner only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Decrypted user data retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - owner only' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getDecryptedUserData", null);
__decorate([
    (0, common_1.Put)('owner/:userId/encrypt'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.SUPER_ADMIN, enums_1.UserRole.ADMIN),
    (0, common_1.UseGuards)(owner_guard_service_1.OwnerGuardService),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Re-encrypt user data with current owner key' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User data re-encrypted' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - owner only' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "reEncryptUserData", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [typeof (_a = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _a : Object])
], UsersController);


/***/ }),

/***/ "./src/modules/users/services/users.service.ts":
/*!*****************************************************!*\
  !*** ./src/modules/users/services/users.service.ts ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var UsersService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UsersService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../common/modules/prisma.service */ "./src/modules/common/modules/prisma.service.ts");
const crypto_service_1 = __webpack_require__(/*! ../../common/modules/crypto/crypto.service */ "./src/modules/common/modules/crypto/crypto.service.ts");
let UsersService = UsersService_1 = class UsersService {
    constructor(prisma, cryptoService) {
        this.prisma = prisma;
        this.cryptoService = cryptoService;
        this.logger = new common_1.Logger(UsersService_1.name);
    }
    async findById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            return null;
        }
        return this.mapToEntity(user);
    }
    async findByEmail(email) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return null;
        }
        return this.mapToEntity(user);
    }
    async getAllUsers(filters) {
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (filters.role)
            where.role = filters.role;
        if (filters.isActive !== undefined)
            where.isActive = filters.isActive;
        const [data, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);
        return {
            data: data.map(this.mapToEntity),
            total,
        };
    }
    async updateUser(id, data) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const updated = await this.prisma.user.update({
            where: { id },
            data: {
                name: data.name,
                image: data.image,
                isActive: data.isActive,
                isTwoFactorEnabled: data.isTwoFactorEnabled,
                twoFactorSecret: data.twoFactorSecret,
                role: data.role,
            },
        });
        return this.mapToEntity(updated);
    }
    async deactivateUser(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.prisma.user.update({
            where: { id },
            data: { isActive: false },
        });
        this.logger.log(`User deactivated: ${user.email}`, 'UsersService');
    }
    async deleteUser(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.prisma.user.delete({
            where: { id },
        });
        this.logger.log(`User deleted: ${user.email}`, 'UsersService');
    }
    async getDecryptedUserData(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.encryptedData || !user.dataIv || !user.dataAuthTag) {
            throw new common_1.ForbiddenException('User data is not encrypted or not available');
        }
        const sensitiveData = this.cryptoService.decryptObject({
            ciphertext: user.encryptedData,
            iv: user.dataIv,
            authTag: user.dataAuthTag,
        });
        return {
            user: this.mapToEntity(user),
            sensitiveData,
        };
    }
    async reEncryptUserData(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.encryptedData || !user.dataIv || !user.dataAuthTag) {
            throw new common_1.ForbiddenException('User data is not encrypted or not available');
        }
        try {
            const sensitiveData = this.cryptoService.decryptObject({
                ciphertext: user.encryptedData,
                iv: user.dataIv,
                authTag: user.dataAuthTag,
            });
            const reEncrypted = this.cryptoService.encryptObject(sensitiveData);
            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    encryptedData: reEncrypted.ciphertext,
                    dataIv: reEncrypted.iv,
                    dataAuthTag: reEncrypted.authTag,
                },
            });
            return {
                success: true,
                message: `User ${user.email} data re-encrypted successfully with current owner key`,
            };
        }
        catch (error) {
            this.logger.error(`Failed to re-encrypt user ${userId}: ${error.message}`, 'UsersService');
            throw new common_1.ForbiddenException('Failed to re-encrypt user data. Ensure you have the correct owner key.');
        }
    }
    mapToEntity(user) {
        return {
            id: user.id,
            email: user.email,
            emailVerified: user.emailVerified,
            emailVerifiedAt: user.emailVerifiedAt,
            name: user.name,
            image: user.image,
            password: user.password,
            role: user.role,
            isActive: user.isActive,
            isTwoFactorEnabled: user.isTwoFactorEnabled,
            twoFactorSecret: user.twoFactorSecret,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            encryptedData: user.encryptedData,
            dataIv: user.dataIv,
            dataAuthTag: user.dataAuthTag,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof crypto_service_1.CryptoService !== "undefined" && crypto_service_1.CryptoService) === "function" ? _b : Object])
], UsersService);


/***/ }),

/***/ "./src/modules/users/users.module.ts":
/*!*******************************************!*\
  !*** ./src/modules/users/users.module.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UsersModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_module_1 = __webpack_require__(/*! ../common/modules/prisma.module */ "./src/modules/common/modules/prisma.module.ts");
const logger_module_1 = __webpack_require__(/*! ../common/modules/logger.module */ "./src/modules/common/modules/logger.module.ts");
const auth_module_1 = __webpack_require__(/*! ../auth/auth.module */ "./src/modules/auth/auth.module.ts");
const users_service_1 = __webpack_require__(/*! ./services/users.service */ "./src/modules/users/services/users.service.ts");
const users_controller_1 = __webpack_require__(/*! ./controllers/users.controller */ "./src/modules/users/controllers/users.controller.ts");
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, logger_module_1.LoggerModule, auth_module_1.AuthModule],
        controllers: [users_controller_1.UsersController],
        providers: [users_service_1.UsersService],
        exports: [users_service_1.UsersService],
    })
], UsersModule);


/***/ }),

/***/ "./src/modules/wallets/controllers/wallets.controller.ts":
/*!***************************************************************!*\
  !*** ./src/modules/wallets/controllers/wallets.controller.ts ***!
  \***************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WalletsController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const wallets_service_1 = __webpack_require__(/*! ../services/wallets.service */ "./src/modules/wallets/services/wallets.service.ts");
const embedded_wallet_service_1 = __webpack_require__(/*! ../services/embedded-wallet.service */ "./src/modules/wallets/services/embedded-wallet.service.ts");
const embedded_wallet_dto_1 = __webpack_require__(/*! ../dto/embedded-wallet.dto */ "./src/modules/wallets/dto/embedded-wallet.dto.ts");
const wallet_entity_1 = __webpack_require__(/*! ../entities/wallet.entity */ "./src/modules/wallets/entities/wallet.entity.ts");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../common/guards/jwt-auth.guard */ "./src/modules/common/guards/jwt-auth.guard.ts");
const current_user_decorator_1 = __webpack_require__(/*! ../../common/decorators/current-user.decorator */ "./src/modules/common/decorators/current-user.decorator.ts");
const roles_decorator_1 = __webpack_require__(/*! ../../common/decorators/roles.decorator */ "./src/modules/common/decorators/roles.decorator.ts");
const roles_guard_1 = __webpack_require__(/*! ../../common/guards/roles.guard */ "./src/modules/common/guards/roles.guard.ts");
const enums_1 = __webpack_require__(/*! ../../../common/enums */ "./src/common/enums.ts");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
let WalletsController = class WalletsController {
    constructor(walletsService, embeddedWalletService) {
        this.walletsService = walletsService;
        this.embeddedWalletService = embeddedWalletService;
    }
    getUserWallets(userId) {
        return this.walletsService.getUserWallets(userId);
    }
    getWallet(userId, walletId) {
        return this.walletsService.getWalletWithBalances(userId, walletId);
    }
    createWallet(userId, dto) {
        return this.walletsService.createWallet(userId, dto);
    }
    syncWallet(userId, walletId) {
        return this.walletsService.syncWalletBalances(walletId);
    }
    deleteWallet(userId, walletId) {
        return this.walletsService.deleteWallet(userId, walletId);
    }
    createEmbeddedWallet(userId, dto) {
        return this.embeddedWalletService.createEmbeddedWallet(userId, dto);
    }
    recoverEmbeddedWallet(userId, dto) {
        return this.embeddedWalletService.recoverEmbeddedWallet(userId, dto.recoveryKey);
    }
};
exports.WalletsController = WalletsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get all wallets for current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Wallets retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WalletsController.prototype, "getUserWallets", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get wallet by ID with balances' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Wallet retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Wallet not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], WalletsController.prototype, "getWallet", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Add a new wallet' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Wallet added successfully' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Wallet already exists' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid wallet address' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_c = typeof wallet_entity_1.WalletCreateDto !== "undefined" && wallet_entity_1.WalletCreateDto) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], WalletsController.prototype, "createWallet", null);
__decorate([
    (0, common_1.Post)(':id/sync'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Sync wallet balances from blockchain' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Wallet synced successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Wallet not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], WalletsController.prototype, "syncWallet", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Remove wallet (soft delete)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Wallet removed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Wallet not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], WalletsController.prototype, "deleteWallet", null);
__decorate([
    (0, common_1.Post)('embedded'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Create embedded wallet (MPC/AA)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Embedded wallet created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Embedded wallet already exists' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_d = typeof embedded_wallet_dto_1.CreateEmbeddedWalletDto !== "undefined" && embedded_wallet_dto_1.CreateEmbeddedWalletDto) === "function" ? _d : Object]),
    __metadata("design:returntype", void 0)
], WalletsController.prototype, "createEmbeddedWallet", null);
__decorate([
    (0, common_1.Post)('embedded/recover'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Recover embedded wallet with recovery key' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Wallet recovered successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid recovery key' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_e = typeof embedded_wallet_dto_1.RecoverWalletDto !== "undefined" && embedded_wallet_dto_1.RecoverWalletDto) === "function" ? _e : Object]),
    __metadata("design:returntype", void 0)
], WalletsController.prototype, "recoverEmbeddedWallet", null);
exports.WalletsController = WalletsController = __decorate([
    (0, swagger_1.ApiTags)('Wallets'),
    (0, common_1.Controller)('wallets'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [typeof (_a = typeof wallets_service_1.WalletsService !== "undefined" && wallets_service_1.WalletsService) === "function" ? _a : Object, typeof (_b = typeof embedded_wallet_service_1.EmbeddedWalletService !== "undefined" && embedded_wallet_service_1.EmbeddedWalletService) === "function" ? _b : Object])
], WalletsController);


/***/ }),

/***/ "./src/modules/wallets/dto/embedded-wallet.dto.ts":
/*!********************************************************!*\
  !*** ./src/modules/wallets/dto/embedded-wallet.dto.ts ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RecoverWalletDto = exports.CreateEmbeddedWalletDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const wallet_entity_1 = __webpack_require__(/*! ../entities/wallet.entity */ "./src/modules/wallets/entities/wallet.entity.ts");
class CreateEmbeddedWalletDto {
}
exports.CreateEmbeddedWalletDto = CreateEmbeddedWalletDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: wallet_entity_1.Chain }),
    (0, class_validator_1.IsEnum)(wallet_entity_1.Chain),
    __metadata("design:type", typeof (_a = typeof wallet_entity_1.Chain !== "undefined" && wallet_entity_1.Chain) === "function" ? _a : Object)
], CreateEmbeddedWalletDto.prototype, "chain", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['EMAIL', 'SOCIAL', 'PASSWORD'] }),
    (0, class_validator_1.IsEnum)(['EMAIL', 'SOCIAL', 'PASSWORD']),
    __metadata("design:type", String)
], CreateEmbeddedWalletDto.prototype, "recoveryMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmbeddedWalletDto.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmbeddedWalletDto.prototype, "recoveryKey", void 0);
class RecoverWalletDto {
}
exports.RecoverWalletDto = RecoverWalletDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecoverWalletDto.prototype, "recoveryKey", void 0);


/***/ }),

/***/ "./src/modules/wallets/entities/wallet.entity.ts":
/*!*******************************************************!*\
  !*** ./src/modules/wallets/entities/wallet.entity.ts ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WalletType = exports.Chain = void 0;
var Chain;
(function (Chain) {
    Chain["ETHEREUM"] = "ETHEREUM";
    Chain["POLYGON"] = "POLYGON";
    Chain["BSC"] = "BSC";
    Chain["ARBITRUM"] = "ARBITRUM";
    Chain["BASE"] = "BASE";
    Chain["AVALANCHE"] = "AVALANCHE";
    Chain["LXON"] = "LXON";
})(Chain || (exports.Chain = Chain = {}));
var WalletType;
(function (WalletType) {
    WalletType["EOA"] = "EOA";
    WalletType["SMART_CONTRACT"] = "SMART_CONTRACT";
    WalletType["MULTISIG"] = "MULTISIG";
    WalletType["EMBEDDED"] = "EMBEDDED";
})(WalletType || (exports.WalletType = WalletType = {}));


/***/ }),

/***/ "./src/modules/wallets/services/embedded-wallet.service.ts":
/*!*****************************************************************!*\
  !*** ./src/modules/wallets/services/embedded-wallet.service.ts ***!
  \*****************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EmbeddedWalletService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../common/modules/prisma.service */ "./src/modules/common/modules/prisma.service.ts");
const wallet_entity_1 = __webpack_require__(/*! ../entities/wallet.entity */ "./src/modules/wallets/entities/wallet.entity.ts");
const crypto_1 = __importDefault(__webpack_require__(/*! crypto */ "crypto"));
let EmbeddedWalletService = class EmbeddedWalletService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createEmbeddedWallet(userId, dto) {
        const seed = this.generateUserSeed(userId, dto.chain);
        const address = this.deriveAddress(seed, dto.chain);
        const existing = await this.prisma.wallet.findFirst({
            where: { userId, type: wallet_entity_1.WalletType.EMBEDDED, chain: dto.chain },
        });
        if (existing) {
            throw new common_1.ConflictException('Embedded wallet already exists for this chain');
        }
        const recoveryShard = this.generateRecoveryShard(seed, dto.recoveryMethod);
        const encryptedShard = this.encryptShard(recoveryShard, userId);
        const wallet = await this.prisma.wallet.create({
            data: {
                userId,
                address,
                chain: dto.chain,
                label: dto.label || `${dto.chain} Embedded Wallet`,
                type: wallet_entity_1.WalletType.EMBEDDED,
                isWatchOnly: false,
                recoveryMethod: dto.recoveryMethod,
                recoveryEncryptedShard: encryptedShard,
            },
        });
        return wallet;
    }
    async recoverEmbeddedWallet(userId, recoveryKey) {
        const wallet = await this.prisma.wallet.findFirst({
            where: { userId, type: wallet_entity_1.WalletType.EMBEDDED },
        });
        if (!wallet) {
            throw new common_1.BadRequestException('No embedded wallet found');
        }
        const decrypted = this.decryptShard(wallet.recoveryEncryptedShard, recoveryKey);
        const recoveredAddress = this.deriveAddress(decrypted, wallet.chain);
        if (recoveredAddress !== wallet.address) {
            throw new common_1.BadRequestException('Invalid recovery key');
        }
        return wallet.address;
    }
    generateUserSeed(userId, chain) {
        return crypto_1.default.createHmac('sha256', 'synex-embedded-wallet-v1')
            .update(`${userId}:${chain}`)
            .digest();
    }
    deriveAddress(seed, chain) {
        if ([wallet_entity_1.Chain.ETHEREUM, wallet_entity_1.Chain.POLYGON, wallet_entity_1.Chain.BSC, wallet_entity_1.Chain.ARBITRUM, wallet_entity_1.Chain.BASE, wallet_entity_1.Chain.AVALANCHE, wallet_entity_1.Chain.LXON].includes(chain)) {
            const hash = crypto_1.default.createHash('sha256').update(seed).digest('hex');
            return '0x' + hash.slice(0, 40);
        }
        throw new common_1.BadRequestException(`Chain ${chain} not supported for embedded wallets yet`);
    }
    generateRecoveryShard(seed, method) {
        const shard = crypto_1.default.createHmac('sha256', method).update(seed).digest('hex');
        return shard;
    }
    encryptShard(shard, userId) {
        const key = crypto_1.default.scryptSync(userId, 'synex-encryption', 32);
        const iv = crypto_1.default.randomBytes(16);
        const cipher = crypto_1.default.createCipheriv('aes-256-gcm', key, iv);
        let encrypted = cipher.update(shard, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag().toString('hex');
        return `${iv.toString('hex')}:${authTag}:${encrypted}`;
    }
    decryptShard(encrypted, recoveryKey) {
        const [ivHex, authTagHex, encryptedHex] = encrypted.split(':');
        const key = crypto_1.default.scryptSync(recoveryKey, 'synex-encryption', 32);
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const decipher = crypto_1.default.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return Buffer.from(decrypted, 'hex');
    }
};
exports.EmbeddedWalletService = EmbeddedWalletService;
exports.EmbeddedWalletService = EmbeddedWalletService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], EmbeddedWalletService);


/***/ }),

/***/ "./src/modules/wallets/services/wallets.service.ts":
/*!*********************************************************!*\
  !*** ./src/modules/wallets/services/wallets.service.ts ***!
  \*********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WalletsService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const logger_service_1 = __webpack_require__(/*! ../../common/modules/logger.service */ "./src/modules/common/modules/logger.service.ts");
const prisma_service_1 = __webpack_require__(/*! ../../common/modules/prisma.service */ "./src/modules/common/modules/prisma.service.ts");
const http_service_1 = __webpack_require__(/*! ../../common/modules/http.service */ "./src/modules/common/modules/http.service.ts");
const wallet_entity_1 = __webpack_require__(/*! ../entities/wallet.entity */ "./src/modules/wallets/entities/wallet.entity.ts");
const app_utils_1 = __webpack_require__(/*! ../../common/utils/app.utils */ "./src/modules/common/utils/app.utils.ts");
let WalletsService = class WalletsService {
    constructor(prisma, httpService) {
        this.prisma = prisma;
        this.httpService = httpService;
        this.logger = new logger_service_1.LoggerService();
        this.rpcUrls = {
            [wallet_entity_1.Chain.ETHEREUM]: process.env.ETHEREUM_RPC_URL || '',
            [wallet_entity_1.Chain.POLYGON]: process.env.POLYGON_RPC_URL || '',
            [wallet_entity_1.Chain.BSC]: process.env.BSC_RPC_URL || '',
            [wallet_entity_1.Chain.ARBITRUM]: process.env.ARBITRUM_RPC_URL || '',
            [wallet_entity_1.Chain.BASE]: process.env.BASE_RPC_URL || '',
            [wallet_entity_1.Chain.AVALANCHE]: process.env.AVALANCHE_RPC_URL || '',
            [wallet_entity_1.Chain.LXON]: process.env.LXON_RPC_URL || 'https://rpc.lxonevm.com',
        };
    }
    async getUserWallets(userId) {
        return this.prisma.wallet.findMany({
            where: { userId, isActive: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getWalletById(userId, walletId) {
        const wallet = await this.prisma.wallet.findFirst({
            where: { id: walletId, userId },
        });
        if (!wallet) {
            throw new common_1.NotFoundException('Wallet not found');
        }
        return wallet;
    }
    async createWallet(userId, dto) {
        const normalizedAddress = (0, app_utils_1.normalizeAddress)(dto.address);
        if (!(0, app_utils_1.isValidEthereumAddress)(normalizedAddress)) {
            throw new common_1.BadRequestException('Invalid wallet address');
        }
        const existing = await this.prisma.wallet.findFirst({
            where: {
                userId,
                address: normalizedAddress,
                chain: dto.chain,
            },
        });
        if (existing) {
            throw new common_1.ConflictException('Wallet already added for this chain');
        }
        const wallet = await this.prisma.wallet.create({
            data: {
                userId,
                address: normalizedAddress,
                chain: dto.chain,
                label: dto.label || (0, app_utils_1.truncateAddress)(normalizedAddress),
                type: dto.type || wallet_entity_1.WalletType.EOA,
                isWatchOnly: dto.isWatchOnly || false,
            },
        });
        this.logger.log(`Wallet created: ${normalizedAddress} for user ${userId}`, 'WalletsService');
        return wallet;
    }
    async deleteWallet(userId, walletId) {
        const wallet = await this.prisma.wallet.findFirst({
            where: { id: walletId, userId },
        });
        if (!wallet) {
            throw new common_1.NotFoundException('Wallet not found');
        }
        await this.prisma.wallet.update({
            where: { id: walletId },
            data: { isActive: false },
        });
        this.logger.log(`Wallet deactivated: ${wallet.address}`, 'WalletsService');
    }
    async syncWalletBalances(walletId) {
        const wallet = await this.prisma.wallet.findUnique({
            where: { id: walletId },
        });
        if (!wallet) {
            throw new common_1.NotFoundException('Wallet not found');
        }
        this.logger.log(`Syncing balances for wallet: ${wallet.address}`, 'WalletsService');
        try {
            const balances = await this.fetchTokenBalances(wallet.address, wallet.chain);
            await this.prisma.tokenBalance.deleteMany({ where: { walletId } });
            await this.prisma.tokenBalance.createMany({
                data: balances.map((b) => ({
                    ...b,
                    walletId,
                })),
            });
            await this.prisma.wallet.update({
                where: { id: walletId },
                data: { lastSyncAt: new Date() },
            });
        }
        catch (error) {
            this.logger.error(`Failed to sync balances for wallet ${walletId}`, error, 'WalletsService');
            throw new common_1.BadRequestException('Failed to sync wallet balances');
        }
    }
    async getWalletWithBalances(userId, walletId) {
        const wallet = await this.getWalletById(userId, walletId);
        const balances = await this.prisma.tokenBalance.findMany({
            where: { walletId },
            orderBy: { balanceUsd: 'desc' },
        });
        const nfts = await this.prisma.nft.findMany({
            where: { walletId },
            orderBy: { createdAt: 'desc' },
        });
        return {
            ...wallet,
            balances: balances.map((b) => ({
                symbol: b.symbol,
                name: b.name,
                balance: b.balance,
                balanceUsd: b.balanceUsd?.toString(),
                priceUsd: b.priceUsd?.toString(),
                change24h: b.change24h?.toString(),
            })),
            nfts: nfts.map((nft) => ({
                id: nft.id,
                name: nft.name,
                collectionName: nft.collectionName,
                imageUrl: nft.imageUrl,
                floorPriceUsd: nft.floorPriceUsd?.toString(),
            })),
        };
    }
    async fetchTokenBalances(address, chain) {
        const rpcUrl = this.rpcUrls[chain];
        if (!rpcUrl) {
            this.logger.warn(`No RPC URL configured for chain ${chain}`, 'WalletsService');
            return [];
        }
        const balances = [];
        try {
            const nativeBalance = await this.getNativeBalance(rpcUrl, address, chain);
            balances.push(nativeBalance);
        }
        catch (error) {
            this.logger.warn(`Failed to fetch native balance: ${error.message}`, 'WalletsService');
        }
        return balances;
    }
    async getNativeBalance(rpcUrl, address, chain) {
        const response = await this.httpService.getAxiosInstance().post(rpcUrl, {
            jsonrpc: '2.0',
            method: 'eth_getBalance',
            params: [address, 'latest'],
            id: 1,
        });
        const rawBalance = BigInt(response.data.result);
        const decimals = chain === wallet_entity_1.Chain.BSC ? 18 : 18;
        const balance = Number(rawBalance) / 10 ** decimals;
        return {
            tokenAddress: 'native',
            symbol: this.getNativeSymbol(chain),
            name: this.getNativeName(chain),
            decimals,
            balance: balance.toFixed(18),
            balanceUsd: null,
            priceUsd: null,
            change24h: null,
        };
    }
    getNativeSymbol(chain) {
        const symbols = {
            [wallet_entity_1.Chain.ETHEREUM]: 'ETH',
            [wallet_entity_1.Chain.POLYGON]: 'MATIC',
            [wallet_entity_1.Chain.BSC]: 'BNB',
            [wallet_entity_1.Chain.ARBITRUM]: 'ETH',
            [wallet_entity_1.Chain.BASE]: 'ETH',
            [wallet_entity_1.Chain.AVALANCHE]: 'AVAX',
            [wallet_entity_1.Chain.LXON]: 'LXON',
        };
        return symbols[chain];
    }
    getNativeName(chain) {
        const names = {
            [wallet_entity_1.Chain.ETHEREUM]: 'Ethereum',
            [wallet_entity_1.Chain.POLYGON]: 'Polygon',
            [wallet_entity_1.Chain.BSC]: 'BNB',
            [wallet_entity_1.Chain.ARBITRUM]: 'Ethereum',
            [wallet_entity_1.Chain.BASE]: 'Ethereum',
            [wallet_entity_1.Chain.AVALANCHE]: 'Avalanche',
            [wallet_entity_1.Chain.LXON]: 'LXON Chain',
        };
        return names[chain];
    }
};
exports.WalletsService = WalletsService;
exports.WalletsService = WalletsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof http_service_1.HttpService !== "undefined" && http_service_1.HttpService) === "function" ? _b : Object])
], WalletsService);


/***/ }),

/***/ "./src/modules/wallets/wallets.module.ts":
/*!***********************************************!*\
  !*** ./src/modules/wallets/wallets.module.ts ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WalletsModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_module_1 = __webpack_require__(/*! ../common/modules/prisma.module */ "./src/modules/common/modules/prisma.module.ts");
const http_module_1 = __webpack_require__(/*! ../common/modules/http.module */ "./src/modules/common/modules/http.module.ts");
const logger_module_1 = __webpack_require__(/*! ../common/modules/logger.module */ "./src/modules/common/modules/logger.module.ts");
const auth_module_1 = __webpack_require__(/*! ../auth/auth.module */ "./src/modules/auth/auth.module.ts");
const wallets_service_1 = __webpack_require__(/*! ./services/wallets.service */ "./src/modules/wallets/services/wallets.service.ts");
const embedded_wallet_service_1 = __webpack_require__(/*! ./services/embedded-wallet.service */ "./src/modules/wallets/services/embedded-wallet.service.ts");
const wallets_controller_1 = __webpack_require__(/*! ./controllers/wallets.controller */ "./src/modules/wallets/controllers/wallets.controller.ts");
let WalletsModule = class WalletsModule {
};
exports.WalletsModule = WalletsModule;
exports.WalletsModule = WalletsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, http_module_1.HttpModule, logger_module_1.LoggerModule, auth_module_1.AuthModule],
        controllers: [wallets_controller_1.WalletsController],
        providers: [wallets_service_1.WalletsService, embedded_wallet_service_1.EmbeddedWalletService],
        exports: [wallets_service_1.WalletsService],
    })
], WalletsModule);


/***/ }),

/***/ "./src/modules/watchlist/controllers/watchlist.controller.ts":
/*!*******************************************************************!*\
  !*** ./src/modules/watchlist/controllers/watchlist.controller.ts ***!
  \*******************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WatchlistController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const watchlist_service_1 = __webpack_require__(/*! ../services/watchlist.service */ "./src/modules/watchlist/services/watchlist.service.ts");
const watchlist_entity_1 = __webpack_require__(/*! ../entities/watchlist.entity */ "./src/modules/watchlist/entities/watchlist.entity.ts");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../common/guards/jwt-auth.guard */ "./src/modules/common/guards/jwt-auth.guard.ts");
const current_user_decorator_1 = __webpack_require__(/*! ../../common/decorators/current-user.decorator */ "./src/modules/common/decorators/current-user.decorator.ts");
const roles_decorator_1 = __webpack_require__(/*! ../../common/decorators/roles.decorator */ "./src/modules/common/decorators/roles.decorator.ts");
const roles_guard_1 = __webpack_require__(/*! ../../common/guards/roles.guard */ "./src/modules/common/guards/roles.guard.ts");
const enums_1 = __webpack_require__(/*! ../../../common/enums */ "./src/common/enums.ts");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
let WatchlistController = class WatchlistController {
    constructor(watchlistService) {
        this.watchlistService = watchlistService;
    }
    getUserWatchlists(userId) {
        return this.watchlistService.getUserWatchlists(userId);
    }
    getWatchlist(userId, watchlistId) {
        return this.watchlistService.getWatchlistById(userId, watchlistId);
    }
    createWatchlist(userId, dto) {
        return this.watchlistService.createWatchlist(userId, dto);
    }
    updateWatchlist(userId, watchlistId, dto) {
        return this.watchlistService.updateWatchlist(userId, watchlistId, dto);
    }
    addToWatchlist(userId, watchlistId, symbol) {
        return this.watchlistService.addToWatchlist(userId, watchlistId, symbol);
    }
    removeFromWatchlist(userId, watchlistId, symbol) {
        return this.watchlistService.removeFromWatchlist(userId, watchlistId, symbol);
    }
    deleteWatchlist(userId, watchlistId) {
        return this.watchlistService.deleteWatchlist(userId, watchlistId);
    }
};
exports.WatchlistController = WatchlistController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get all watchlists for current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Watchlists retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WatchlistController.prototype, "getUserWatchlists", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get watchlist by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Watchlist retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Watchlist not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], WatchlistController.prototype, "getWatchlist", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new watchlist' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Watchlist created' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_b = typeof watchlist_entity_1.CreateWatchlistDto !== "undefined" && watchlist_entity_1.CreateWatchlistDto) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], WatchlistController.prototype, "createWatchlist", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Update watchlist' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Watchlist updated' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, typeof (_c = typeof Partial !== "undefined" && Partial) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], WatchlistController.prototype, "updateWatchlist", null);
__decorate([
    (0, common_1.Post)(':id/add'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Add symbol to watchlist' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Symbol added' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('symbol')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], WatchlistController.prototype, "addToWatchlist", null);
__decorate([
    (0, common_1.Post)(':id/remove'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Remove symbol from watchlist' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Symbol removed' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('symbol')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], WatchlistController.prototype, "removeFromWatchlist", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete watchlist' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Watchlist deleted' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], WatchlistController.prototype, "deleteWatchlist", null);
exports.WatchlistController = WatchlistController = __decorate([
    (0, swagger_1.ApiTags)('Watchlist'),
    (0, common_1.Controller)('watchlist'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [typeof (_a = typeof watchlist_service_1.WatchlistService !== "undefined" && watchlist_service_1.WatchlistService) === "function" ? _a : Object])
], WatchlistController);


/***/ }),

/***/ "./src/modules/watchlist/entities/watchlist.entity.ts":
/*!************************************************************!*\
  !*** ./src/modules/watchlist/entities/watchlist.entity.ts ***!
  \************************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./src/modules/watchlist/services/watchlist.service.ts":
/*!*************************************************************!*\
  !*** ./src/modules/watchlist/services/watchlist.service.ts ***!
  \*************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WatchlistService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../common/modules/prisma.service */ "./src/modules/common/modules/prisma.service.ts");
const logger_service_1 = __webpack_require__(/*! ../../common/modules/logger.service */ "./src/modules/common/modules/logger.service.ts");
let WatchlistService = class WatchlistService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new logger_service_1.LoggerService();
    }
    async getUserWatchlists(userId) {
        const watchlists = await this.prisma.watchlist.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        return watchlists.map((w) => ({
            ...w,
            symbols: typeof w.symbols === 'string' ? JSON.parse(w.symbols) : w.symbols,
        }));
    }
    async getWatchlistById(userId, watchlistId) {
        const watchlist = await this.prisma.watchlist.findFirst({
            where: { id: watchlistId, userId },
        });
        if (!watchlist) {
            throw new common_1.NotFoundException('Watchlist not found');
        }
        return {
            ...watchlist,
            symbols: typeof watchlist.symbols === 'string' ? JSON.parse(watchlist.symbols) : watchlist.symbols,
        };
    }
    async createWatchlist(userId, dto) {
        const existing = await this.prisma.watchlist.findFirst({
            where: { userId, name: dto.name },
        });
        if (existing) {
            throw new common_1.ConflictException('Watchlist with this name already exists');
        }
        const watchlist = await this.prisma.watchlist.create({
            data: {
                userId,
                name: dto.name,
                symbols: JSON.stringify(dto.symbols),
                isPublic: dto.isPublic || false,
            },
        });
        this.logger.log(`Watchlist created: ${watchlist.id} for user ${userId}`, 'WatchlistService');
        return {
            ...watchlist,
            symbols: typeof watchlist.symbols === 'string' ? JSON.parse(watchlist.symbols) : watchlist.symbols,
        };
    }
    async updateWatchlist(userId, watchlistId, dto) {
        await this.getWatchlistById(userId, watchlistId);
        const updateData = {
            name: dto.name,
            isPublic: dto.isPublic,
        };
        if (dto.symbols) {
            updateData.symbols = JSON.stringify(dto.symbols);
        }
        const updated = await this.prisma.watchlist.update({
            where: { id: watchlistId },
            data: updateData,
        });
        return {
            ...updated,
            symbols: typeof updated.symbols === 'string' ? JSON.parse(updated.symbols) : updated.symbols,
        };
    }
    async deleteWatchlist(userId, watchlistId) {
        await this.getWatchlistById(userId, watchlistId);
        await this.prisma.watchlist.delete({
            where: { id: watchlistId },
        });
        this.logger.log(`Watchlist deleted: ${watchlistId}`, 'WatchlistService');
    }
    async addToWatchlist(userId, watchlistId, symbol) {
        const watchlist = await this.getWatchlistById(userId, watchlistId);
        const symbols = Array.isArray(watchlist.symbols) ? watchlist.symbols : JSON.parse(watchlist.symbols);
        if (symbols.includes(symbol)) {
            throw new common_1.BadRequestException('Symbol already in watchlist');
        }
        const updated = await this.prisma.watchlist.update({
            where: { id: watchlistId },
            data: {
                symbols: JSON.stringify([...symbols, symbol]),
            },
        });
        return {
            ...updated,
            symbols: typeof updated.symbols === 'string' ? JSON.parse(updated.symbols) : updated.symbols,
        };
    }
    async removeFromWatchlist(userId, watchlistId, symbol) {
        const watchlist = await this.getWatchlistById(userId, watchlistId);
        const symbols = Array.isArray(watchlist.symbols) ? watchlist.symbols : JSON.parse(watchlist.symbols);
        if (!symbols.includes(symbol)) {
            throw new common_1.BadRequestException('Symbol not in watchlist');
        }
        const updated = await this.prisma.watchlist.update({
            where: { id: watchlistId },
            data: {
                symbols: JSON.stringify(symbols.filter((s) => s !== symbol)),
            },
        });
        return {
            ...updated,
            symbols: typeof updated.symbols === 'string' ? JSON.parse(updated.symbols) : updated.symbols,
        };
    }
};
exports.WatchlistService = WatchlistService;
exports.WatchlistService = WatchlistService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], WatchlistService);


/***/ }),

/***/ "./src/modules/watchlist/watchlist.module.ts":
/*!***************************************************!*\
  !*** ./src/modules/watchlist/watchlist.module.ts ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WatchlistModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_module_1 = __webpack_require__(/*! ../common/modules/prisma.module */ "./src/modules/common/modules/prisma.module.ts");
const logger_module_1 = __webpack_require__(/*! ../common/modules/logger.module */ "./src/modules/common/modules/logger.module.ts");
const auth_module_1 = __webpack_require__(/*! ../auth/auth.module */ "./src/modules/auth/auth.module.ts");
const watchlist_service_1 = __webpack_require__(/*! ./services/watchlist.service */ "./src/modules/watchlist/services/watchlist.service.ts");
const watchlist_controller_1 = __webpack_require__(/*! ./controllers/watchlist.controller */ "./src/modules/watchlist/controllers/watchlist.controller.ts");
let WatchlistModule = class WatchlistModule {
};
exports.WatchlistModule = WatchlistModule;
exports.WatchlistModule = WatchlistModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, logger_module_1.LoggerModule, auth_module_1.AuthModule],
        controllers: [watchlist_controller_1.WatchlistController],
        providers: [watchlist_service_1.WatchlistService],
        exports: [watchlist_service_1.WatchlistService],
    })
], WatchlistModule);


/***/ }),

/***/ "./src/modules/websocket/events/portfolio.events.ts":
/*!**********************************************************!*\
  !*** ./src/modules/websocket/events/portfolio.events.ts ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PortfolioEvents = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const websocket_gateway_1 = __webpack_require__(/*! ../websocket.gateway */ "./src/modules/websocket/websocket.gateway.ts");
let PortfolioEvents = class PortfolioEvents {
    constructor(websocketGateway) {
        this.websocketGateway = websocketGateway;
    }
    async broadcastPortfolioUpdate(userId, portfolio) {
        await this.websocketGateway.sendToUser(userId, 'portfolio:updated', {
            type: 'PORTFOLIO_UPDATED',
            data: portfolio,
            timestamp: new Date().toISOString(),
        });
    }
    async broadcastRiskScoreUpdate(userId, riskScore) {
        await this.websocketGateway.sendToUser(userId, 'risk:updated', {
            type: 'RISK_SCORE_UPDATED',
            data: riskScore,
            timestamp: new Date().toISOString(),
        });
    }
    async broadcastPriceAlert(userId, alert) {
        await this.websocketGateway.sendToUser(userId, 'price:alert', {
            type: 'PRICE_ALERT',
            data: alert,
            timestamp: new Date().toISOString(),
        });
    }
};
exports.PortfolioEvents = PortfolioEvents;
exports.PortfolioEvents = PortfolioEvents = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof websocket_gateway_1.WebsocketGateway !== "undefined" && websocket_gateway_1.WebsocketGateway) === "function" ? _a : Object])
], PortfolioEvents);


/***/ }),

/***/ "./src/modules/websocket/events/transaction.events.ts":
/*!************************************************************!*\
  !*** ./src/modules/websocket/events/transaction.events.ts ***!
  \************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TransactionEvents = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const websocket_gateway_1 = __webpack_require__(/*! ../websocket.gateway */ "./src/modules/websocket/websocket.gateway.ts");
let TransactionEvents = class TransactionEvents {
    constructor(websocketGateway) {
        this.websocketGateway = websocketGateway;
    }
    async broadcastTransactionCreated(userId, transaction) {
        await this.websocketGateway.sendToUser(userId, 'transaction:created', {
            type: 'TRANSACTION_CREATED',
            data: transaction,
            timestamp: new Date().toISOString(),
        });
    }
    async broadcastTransactionConfirmed(userId, transaction) {
        await this.websocketGateway.sendToUser(userId, 'transaction:confirmed', {
            type: 'TRANSACTION_CONFIRMED',
            data: transaction,
            timestamp: new Date().toISOString(),
        });
    }
    async broadcastTransactionFailed(userId, transaction) {
        await this.websocketGateway.sendToUser(userId, 'transaction:failed', {
            type: 'TRANSACTION_FAILED',
            data: transaction,
            timestamp: new Date().toISOString(),
        });
    }
};
exports.TransactionEvents = TransactionEvents;
exports.TransactionEvents = TransactionEvents = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof websocket_gateway_1.WebsocketGateway !== "undefined" && websocket_gateway_1.WebsocketGateway) === "function" ? _a : Object])
], TransactionEvents);


/***/ }),

/***/ "./src/modules/websocket/websocket.gateway.ts":
/*!****************************************************!*\
  !*** ./src/modules/websocket/websocket.gateway.ts ***!
  \****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WebsocketGateway_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WebsocketGateway = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const websockets_1 = __webpack_require__(/*! @nestjs/websockets */ "@nestjs/websockets");
const socket_io_1 = __webpack_require__(/*! socket.io */ "socket.io");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const prisma_service_1 = __webpack_require__(/*! ../common/modules/prisma.service */ "./src/modules/common/modules/prisma.service.ts");
let WebsocketGateway = WebsocketGateway_1 = class WebsocketGateway {
    constructor(jwtService, prisma) {
        this.jwtService = jwtService;
        this.prisma = prisma;
        this.logger = new common_1.Logger(WebsocketGateway_1.name);
    }
    onModuleInit() {
        this.server.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token?.replace('Bearer ', '');
                if (!token) {
                    return next(new Error('Authentication required'));
                }
                const payload = await this.jwtService.verifyAsync(token);
                socket.data.userId = payload.sub;
                next();
            }
            catch {
                next(new Error('Invalid token'));
            }
        });
        this.server.on('connection', (socket) => {
            const userId = socket.data.userId;
            this.logger.log(`User connected: ${userId}`);
            socket.join(`user:${userId}`);
            socket.on('disconnect', () => {
                this.logger.log(`User disconnected: ${userId}`);
            });
        });
    }
    onModuleDestroy() {
        if (this.server) {
            this.server.close();
        }
    }
    async sendToUser(userId, event, data) {
        this.server.to(`user:${userId}`).emit(event, data);
    }
    async broadcastToAll(event, data) {
        this.server.emit(event, data);
    }
};
exports.WebsocketGateway = WebsocketGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", typeof (_c = typeof socket_io_1.Server !== "undefined" && socket_io_1.Server) === "function" ? _c : Object)
], WebsocketGateway.prototype, "server", void 0);
exports.WebsocketGateway = WebsocketGateway = WebsocketGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)(),
    __metadata("design:paramtypes", [typeof (_a = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _a : Object, typeof (_b = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _b : Object])
], WebsocketGateway);


/***/ }),

/***/ "./src/modules/websocket/websocket.module.ts":
/*!***************************************************!*\
  !*** ./src/modules/websocket/websocket.module.ts ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WebsocketModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const websocket_gateway_1 = __webpack_require__(/*! ./websocket.gateway */ "./src/modules/websocket/websocket.gateway.ts");
const transaction_events_1 = __webpack_require__(/*! ./events/transaction.events */ "./src/modules/websocket/events/transaction.events.ts");
const portfolio_events_1 = __webpack_require__(/*! ./events/portfolio.events */ "./src/modules/websocket/events/portfolio.events.ts");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const prisma_module_1 = __webpack_require__(/*! ../common/modules/prisma.module */ "./src/modules/common/modules/prisma.module.ts");
let WebsocketModule = class WebsocketModule {
};
exports.WebsocketModule = WebsocketModule;
exports.WebsocketModule = WebsocketModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, jwt_1.JwtModule],
        providers: [websocket_gateway_1.WebsocketGateway, transaction_events_1.TransactionEvents, portfolio_events_1.PortfolioEvents],
        exports: [websocket_gateway_1.WebsocketGateway, transaction_events_1.TransactionEvents, portfolio_events_1.PortfolioEvents],
    })
], WebsocketModule);


/***/ }),

/***/ "@langchain/core/messages":
/*!*******************************************!*\
  !*** external "@langchain/core/messages" ***!
  \*******************************************/
/***/ ((module) => {

module.exports = require("@langchain/core/messages");

/***/ }),

/***/ "@langchain/openai":
/*!************************************!*\
  !*** external "@langchain/openai" ***!
  \************************************/
/***/ ((module) => {

module.exports = require("@langchain/openai");

/***/ }),

/***/ "@nestjs/axios":
/*!********************************!*\
  !*** external "@nestjs/axios" ***!
  \********************************/
/***/ ((module) => {

module.exports = require("@nestjs/axios");

/***/ }),

/***/ "@nestjs/bullmq":
/*!*********************************!*\
  !*** external "@nestjs/bullmq" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@nestjs/bullmq");

/***/ }),

/***/ "@nestjs/common":
/*!*********************************!*\
  !*** external "@nestjs/common" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),

/***/ "@nestjs/config":
/*!*********************************!*\
  !*** external "@nestjs/config" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),

/***/ "@nestjs/core":
/*!*******************************!*\
  !*** external "@nestjs/core" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),

/***/ "@nestjs/jwt":
/*!******************************!*\
  !*** external "@nestjs/jwt" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("@nestjs/jwt");

/***/ }),

/***/ "@nestjs/passport":
/*!***********************************!*\
  !*** external "@nestjs/passport" ***!
  \***********************************/
/***/ ((module) => {

module.exports = require("@nestjs/passport");

/***/ }),

/***/ "@nestjs/platform-socket.io":
/*!*********************************************!*\
  !*** external "@nestjs/platform-socket.io" ***!
  \*********************************************/
/***/ ((module) => {

module.exports = require("@nestjs/platform-socket.io");

/***/ }),

/***/ "@nestjs/schedule":
/*!***********************************!*\
  !*** external "@nestjs/schedule" ***!
  \***********************************/
/***/ ((module) => {

module.exports = require("@nestjs/schedule");

/***/ }),

/***/ "@nestjs/swagger":
/*!**********************************!*\
  !*** external "@nestjs/swagger" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("@nestjs/swagger");

/***/ }),

/***/ "@nestjs/terminus":
/*!***********************************!*\
  !*** external "@nestjs/terminus" ***!
  \***********************************/
/***/ ((module) => {

module.exports = require("@nestjs/terminus");

/***/ }),

/***/ "@nestjs/websockets":
/*!*************************************!*\
  !*** external "@nestjs/websockets" ***!
  \*************************************/
/***/ ((module) => {

module.exports = require("@nestjs/websockets");

/***/ }),

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ "bcrypt":
/*!*************************!*\
  !*** external "bcrypt" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("bcrypt");

/***/ }),

/***/ "class-validator":
/*!**********************************!*\
  !*** external "class-validator" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),

/***/ "compression":
/*!******************************!*\
  !*** external "compression" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("compression");

/***/ }),

/***/ "cors":
/*!***********************!*\
  !*** external "cors" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("cors");

/***/ }),

/***/ "express-rate-limit":
/*!*************************************!*\
  !*** external "express-rate-limit" ***!
  \*************************************/
/***/ ((module) => {

module.exports = require("express-rate-limit");

/***/ }),

/***/ "helmet":
/*!*************************!*\
  !*** external "helmet" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("helmet");

/***/ }),

/***/ "ioredis":
/*!**************************!*\
  !*** external "ioredis" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("ioredis");

/***/ }),

/***/ "passport-jwt":
/*!*******************************!*\
  !*** external "passport-jwt" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("passport-jwt");

/***/ }),

/***/ "rxjs":
/*!***********************!*\
  !*** external "rxjs" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("rxjs");

/***/ }),

/***/ "rxjs/operators":
/*!*********************************!*\
  !*** external "rxjs/operators" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("rxjs/operators");

/***/ }),

/***/ "socket.io":
/*!****************************!*\
  !*** external "socket.io" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("socket.io");

/***/ }),

/***/ "winston":
/*!**************************!*\
  !*** external "winston" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("winston");

/***/ }),

/***/ "zod":
/*!**********************!*\
  !*** external "zod" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("zod");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/main.ts");
/******/ 	
/******/ })()
;