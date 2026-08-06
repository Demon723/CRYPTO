import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;
  private readonly subscriber: Redis;

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    
    this.logger.log(`REDIS_URL environment variable: ${redisUrl ? 'SET' : 'NOT SET'}`);
    if (redisUrl) {
      this.logger.log(`REDIS_URL value: ${redisUrl.substring(0, 20)}...`);
    }
    
    const redisConfig = redisUrl 
      ? { url: redisUrl }
      : {
          host: this.configService.get<string>('REDIS_HOST', 'localhost'),
          port: this.configService.get<number>('REDIS_PORT', 6379),
          password: this.configService.get<string>('REDIS_PASSWORD') || undefined,
          db: this.configService.get<number>('REDIS_DB', 0),
        };

    this.logger.log(`Redis config: ${JSON.stringify(redisConfig)}`);

    this.client = new Redis({
      ...redisConfig,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        this.logger.warn(`Redis connection retry attempt ${times}, delaying ${delay}ms`);
        return delay;
      },
      keepAlive: 30000,
    });

    this.subscriber = new Redis({
      ...redisConfig,
      maxRetriesPerRequest: null,
    });

    this.client.on('error', (err) => this.logger.error('Redis client error', err));
    this.client.on('connect', () => this.logger.log('Redis client connected'));
    this.subscriber.on('error', (err) => this.logger.error('Redis subscriber error', err));
    this.subscriber.on('connect', () => this.logger.log('Redis subscriber connected'));
  }

  async onModuleInit() {
    try {
    await this.client.ping();
    await this.subscriber.ping();
    this.logger.log('Redis initialized successfully');
    } catch (error) {
    this.logger.warn('Redis connection failed: Redis features will be disabled', error);
    }
  }

  async onModuleDestroy() {
    await this.client.quit();
    await this.subscriber.quit();
    this.logger.log('Redis connections closed');
  }

  getClient(): Redis {
    return this.client;
  }

  getSubscriber(): Redis {
    return this.subscriber;
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, serialized);
    } else {
      await this.client.set(key, serialized);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async delPattern(pattern: string): Promise<number> {
    const keys = await this.client.keys(pattern);
    if (keys.length === 0) return 0;
    return this.client.del(keys);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.client.expire(key, ttlSeconds);
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  async publish(channel: string, message: string): Promise<number> {
    return this.client.publish(channel, message);
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    await this.subscriber.subscribe(channel);
    this.subscriber.on('message', (ch, msg) => {
      if (ch === channel) callback(msg);
    });
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const pong = await this.client.ping();
    return { status: pong === 'PONG' ? 'healthy' : 'unhealthy', timestamp: new Date().toISOString() };
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async decr(key: string): Promise<number> {
    return this.client.decr(key);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return this.client.hgetall(key);
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    return this.client.hset(key, field, value);
  }

  async hdel(key: string, field: string): Promise<number> {
    return this.client.hdel(key, field);
  }
}
