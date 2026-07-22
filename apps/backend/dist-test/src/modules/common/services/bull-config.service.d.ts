import { ConfigurableModuleClass, DynamicModule } from '@nestjs/common';
import Redis from 'ioredis';
import { QueueOptions } from 'bullmq';
export interface BullConfigOptions {
    connection: Redis;
    defaultJobOptions?: QueueOptions['defaultJobOptions'];
}
export declare class BullConfigService {
    private readonly connection;
    private readonly defaultJobOptions;
    constructor(options: BullConfigOptions);
    getConnection(): Redis;
    getDefaultJobOptions(): QueueOptions['defaultJobOptions'];
}
export declare class BullConfigModule extends ConfigurableModuleClass<BullConfigOptions> {
    static register(options?: BullConfigOptions): DynamicModule;
}
