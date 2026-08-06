import { Global, Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule implements OnModuleInit {
  private readonly logger = new Logger(RedisModule.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    this.logger.log(`=== REDIS MODULE INITIALIZATION ===`);
    this.logger.log(`REDIS_URL environment variable: ${redisUrl ? 'SET' : 'NOT SET'}`);
    if (redisUrl) {
      this.logger.log(`REDIS_URL value (first 30 chars): ${redisUrl.substring(0, 30)}...`);
    }
    this.logger.log(`REDIS_HOST: ${this.configService.get<string>('REDIS_HOST') || 'NOT SET'}`);
    this.logger.log(`REDIS_PORT: ${this.configService.get<number>('REDIS_PORT') || 'NOT SET'}`);
    this.logger.log(`REDIS_PASSWORD: ${this.configService.get<string>('REDIS_PASSWORD') ? 'SET' : 'NOT SET'}`);
    this.logger.log(`REDIS_DB: ${this.configService.get<number>('REDIS_DB') || 'NOT SET'}`);
    this.logger.log(`====================================`);
  }
}
