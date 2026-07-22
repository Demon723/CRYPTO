import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/modules/prisma.module';
import { HttpModule } from '../common/modules/http.module';
import { LoggerModule } from '../common/modules/logger.module';
import { AuthModule } from '../auth/auth.module';
import { WalletsModule } from '../wallets/wallets.module';
import { TransactionsService } from './services/transactions.service';
import { TransactionExecutorService } from './services/transaction-executor.service';
import { TransactionsController } from './controllers/transactions.controller';

@Module({
  imports: [PrismaModule, HttpModule, LoggerModule, AuthModule, WalletsModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionExecutorService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
