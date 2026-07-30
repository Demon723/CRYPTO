import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TerminusModule } from '@nestjs/terminus';
import { BullModule } from '@nestjs/bullmq';

import { PrismaModule } from './modules/common/modules/prisma.module';
// import { RedisModule } from './modules/common/modules/redis.module';
import { LoggerModule } from './modules/common/modules/logger.module';
import { HttpModule } from './modules/common/modules/http.module';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WalletsModule } from './modules/wallets/wallets.module';
import { PortfolioModule } from './modules/portfolio/portfolio.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { AiModule } from './modules/ai/ai.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { TokensModule } from './modules/tokens/tokens.module';
import { NftsModule } from './modules/nfts/nfts.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { HealthModule } from './modules/health/health.module';
import { GovernanceModule } from './modules/governance/governance.module';
import { StakingModule } from './modules/staking/staking.module';
import { ScannerModule } from './modules/scanner/scanner.module';
import { ReferralModule } from './modules/referral/referral.module';
import { WatchlistModule } from './modules/watchlist/watchlist.module';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { DeveloperApiModule } from './modules/developer-api/developer-api.module';
import { DeploymentsModule } from './modules/deployments/deployments.module';

import { BullConfigService } from './modules/common/services/bull-config.service';
import { configValidationSchema } from './modules/common/config.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validate: (config) => configValidationSchema.parse(config),
    }),

    ScheduleModule.forRoot(),
    TerminusModule,

    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
      },
    }),

    PrismaModule,
    // RedisModule,
    LoggerModule,
    HttpModule,

    AuthModule,
    UsersModule,
    WalletsModule,
    PortfolioModule,
    TransactionsModule,
    AiModule,
    AlertsModule,
    NotificationsModule,
    SubscriptionsModule,
    PaymentsModule,
    TokensModule,
    NftsModule,
    AnalyticsModule,
    HealthModule,
    GovernanceModule,
    StakingModule,
    DeveloperApiModule,
    ScannerModule,
    ReferralModule,
    WatchlistModule,
    WebsocketModule,
    DeploymentsModule,  ],
})
export class AppModule {}
