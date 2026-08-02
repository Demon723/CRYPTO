import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '../common/modules/http.module';
import { PrismaModule } from '../common/modules/prisma.module';
import { LoggerModule } from '../common/modules/logger.module';
import { RedisModule } from '../common/modules/redis.module';

import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { AuthController } from './controllers/auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TransactionAuthService } from '../common/services/transaction-auth.service';

@Module({
  imports: [
    PrismaModule,
    LoggerModule,
    HttpModule,
    RedisModule,
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenService, JwtStrategy, GoogleStrategy, JwtAuthGuard, TransactionAuthService],
  exports: [AuthService, TokenService, JwtAuthGuard, TransactionAuthService],
})
export class AuthModule {}
