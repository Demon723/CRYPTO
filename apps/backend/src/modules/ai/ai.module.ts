import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/modules/prisma.module';
import { HttpModule } from '../common/modules/http.module';
import { LoggerModule } from '../common/modules/logger.module';
import { AuthModule } from '../auth/auth.module';
import { WalletsModule } from '../wallets/wallets.module';
import { AiService } from './services/ai.service';
import { TransactionBuilderService } from './services/transaction-builder.service';
import { ConversationService } from './services/conversation.service';
import { AiController } from './controllers/ai.controller';

@Module({
  imports: [PrismaModule, HttpModule, LoggerModule, AuthModule, WalletsModule],
  controllers: [AiController],
  providers: [AiService, ConversationService, TransactionBuilderService],
  exports: [AiService, ConversationService, TransactionBuilderService],
})
export class AiModule {}
