import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/modules/prisma.module';
import { HttpModule } from '../common/modules/http.module';
import { LoggerModule } from '../common/modules/logger.module';
import { AuthModule } from '../auth/auth.module';
import { AiModule } from '../ai/ai.module';
import { ScannerService } from './services/scanner.service';
import { ScannerController } from './controllers/scanner.controller';

@Module({
  imports: [PrismaModule, HttpModule, LoggerModule, AuthModule, AiModule],
  controllers: [ScannerController],
  providers: [ScannerService],
  exports: [ScannerService],
})
export class ScannerModule {}
