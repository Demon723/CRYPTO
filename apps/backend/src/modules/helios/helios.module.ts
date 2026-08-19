import { Module } from '@nestjs/common';
import { HeliosController } from './controllers/helios.controller';
import { HeliosService } from './services/helios.service';

@Module({
  controllers: [HeliosController],
  providers: [HeliosService],
  exports: [HeliosService],
})
export class HeliosModule {}
