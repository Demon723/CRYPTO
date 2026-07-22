import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/modules/prisma.module';
import { HttpModule } from '../common/modules/http.module';
import { LoggerModule } from '../common/modules/logger.module';
import { AuthModule } from '../auth/auth.module';
import { WalletsService } from './services/wallets.service';
import { EmbeddedWalletService } from './services/embedded-wallet.service';
import { WalletsController } from './controllers/wallets.controller';

@Module({
  imports: [PrismaModule, HttpModule, LoggerModule, AuthModule],
  controllers: [WalletsController],
  providers: [WalletsService, EmbeddedWalletService],
  exports: [WalletsService],
})
export class WalletsModule {}
