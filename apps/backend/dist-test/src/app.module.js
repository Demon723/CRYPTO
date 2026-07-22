"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const terminus_1 = require("@nestjs/terminus");
const bullmq_1 = require("@nestjs/bullmq");
const prisma_module_1 = require("./modules/common/modules/prisma.module");
const redis_module_1 = require("./modules/common/modules/redis.module");
const logger_module_1 = require("./modules/common/modules/logger.module");
const http_module_1 = require("./modules/common/modules/http.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const wallets_module_1 = require("./modules/wallets/wallets.module");
const portfolio_module_1 = require("./modules/portfolio/portfolio.module");
const transactions_module_1 = require("./modules/transactions/transactions.module");
const ai_module_1 = require("./modules/ai/ai.module");
const alerts_module_1 = require("./modules/alerts/alerts.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const subscriptions_module_1 = require("./modules/subscriptions/subscriptions.module");
const payments_module_1 = require("./modules/payments/payments.module");
const tokens_module_1 = require("./modules/tokens/tokens.module");
const nfts_module_1 = require("./modules/nfts/nfts.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const governance_module_1 = require("./modules/governance/governance.module");
const staking_module_1 = require("./modules/staking/staking.module");
const scanner_module_1 = require("./modules/scanner/scanner.module");
const referral_module_1 = require("./modules/referral/referral.module");
const watchlist_module_1 = require("./modules/watchlist/watchlist.module");
const developer_api_module_1 = require("./modules/developer-api/developer-api.module");
const bull_config_service_1 = require("./modules/common/services/bull-config.service");
const config_schema_1 = require("./modules/common/config.schema");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
                validate: config_schema_1.configValidationSchema,
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                useFactory: () => ({
                    type: 'postgres',
                    url: process.env.DATABASE_URL,
                    autoLoadEntities: true,
                    synchronize: false,
                    logging: process.env.NODE_ENV === 'development',
                }),
            }),
            schedule_1.ScheduleModule.forRoot(),
            terminus_1.TerminusModule,
            bullmq_1.BullModule.forRootAsync({
                useClass: bull_config_service_1.BullConfigService,
            }),
            prisma_module_1.PrismaModule,
            redis_module_1.RedisModule,
            logger_module_1.LoggerModule,
            http_module_1.HttpModule,
            auth_module_1.AuthModule,
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
            governance_module_1.GovernanceModule,
            staking_module_1.StakingModule,
            developer_api_module_1.DeveloperApiModule,
            scanner_module_1.ScannerModule,
            referral_module_1.ReferralModule,
            watchlist_module_1.WatchlistModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map