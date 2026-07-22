import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/modules/prisma.module';
import { HttpModule } from '../common/modules/http.module';
import { LoggerModule } from '../common/modules/logger.module';
import { AuthModule } from '../auth/auth.module';
import { TokensService } from './services/tokens.service';
import { TokenUtilityService } from './services/token-utility.service';
import { TokensController } from './controllers/tokens.controller';

@Module({
  imports: [PrismaModule, HttpModule, LoggerModule, AuthModule],
  controllers: [TokensController],
  providers: [TokensService, TokenUtilityService],
  exports: [TokensService],
})
export class TokensModule {}
