import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/modules/prisma.module';
import { HttpModule } from '../common/modules/http.module';
import { LoggerModule } from '../common/modules/logger.module';
import { AuthModule } from '../auth/auth.module';
import { NftsService } from './services/nfts.service';
import { NftsController } from './controllers/nfts.controller';

@Module({
  imports: [PrismaModule, HttpModule, LoggerModule, AuthModule],
  controllers: [NftsController],
  providers: [NftsService],
  exports: [NftsService],
})
export class NftsModule {}
