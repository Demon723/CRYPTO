import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { DynamicModule, Global, Module } from '@nestjs/common';
import Redis from 'ioredis';
import { QueueOptions } from 'bullmq';

export interface BullConfigOptions {
  connection: Redis;
  defaultJobOptions?: QueueOptions['defaultJobOptions'];
}

@Injectable()
export class BullConfigService {
  private readonly connection: Redis;
  private readonly defaultJobOptions: QueueOptions['defaultJobOptions'];

  constructor(options: BullConfigOptions) {
    this.connection = options.connection;
    this.defaultJobOptions = options.defaultJobOptions;
  }

  getConnection(): Redis {
    return this.connection;
  }

  getDefaultJobOptions(): QueueOptions['defaultJobOptions'] {
    return this.defaultJobOptions;
  }
}

const DEFAULT_BULL_OPTIONS: BullConfigOptions = {
  connection: new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  }),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: {
      count: 100,
      age: 24 * 3600,
    },
    removeOnFail: {
      count: 50,
      age: 7 * 24 * 3600,
    },
  },
};

@Global()
@Module({})
export class BullConfigModule {
  static register(options?: BullConfigOptions): DynamicModule {
    return {
      module: BullConfigModule,
      imports: [],
      providers: [
        {
          provide: BullConfigService,
          useFactory: () => new BullConfigService(options || DEFAULT_BULL_OPTIONS),
        },
      ],
      exports: [BullConfigService],
    };
  }
}
