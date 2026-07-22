import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../common/modules/prisma.module';
import { RedisModule } from '../common/modules/redis.module';
import { LoggerModule } from '../common/modules/logger.module';
import { AuthModule } from '../auth/auth.module';
import { DeveloperApiService } from './services/developer-api.service';
import { DeveloperApiController } from './controllers/developer-api.controller';
import { ApiKeyAuthGuard } from './guards/api-key-auth.guard';

@Module({
  imports: [PrismaModule, RedisModule, LoggerModule, AuthModule, PassportModule],
  controllers: [DeveloperApiController],
  providers: [DeveloperApiService, ApiKeyAuthGuard],
  exports: [DeveloperApiService, ApiKeyAuthGuard],
})
export class DeveloperApiModule {}
