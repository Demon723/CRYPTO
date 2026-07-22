import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/modules/prisma.module';
import { LoggerModule } from '../common/modules/logger.module';
import { AuthModule } from '../auth/auth.module';
import { WatchlistService } from './services/watchlist.service';
import { WatchlistController } from './controllers/watchlist.controller';

@Module({
  imports: [PrismaModule, LoggerModule, AuthModule],
  controllers: [WatchlistController],
  providers: [WatchlistService],
  exports: [WatchlistService],
})
export class WatchlistModule {}
