import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;
  private readonly subscriber: Redis;
  private redisEnabled = false;

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    
    // Only attempt Redis connection if REDIS_URL is set
    if (!redisUrl) {
      this.logger.warn('REDIS_URL not set - Redis features will be disabled');
      this.client = null as any;
      this.subscriber = null as any;
      this.redisEnabled = false;
      return;
    }

    this.logger.log(`REDIS_URL environment variable: SET`);
    this.logger.log(`REDIS_URL value: ${redisUrl.substring(0, 20)}...`);
    
    const redisConfig = { url: redisUrl };

    this.logger.log(`Redis config: ${JSON.stringify(redisConfig)}`);

    try {
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
      this.redisEnabled = true;
    } catch (error) {
      this.logger.error('Failed to initialize Redis client', error);
      this.client = null as any;
      this.subscriber = null as any;
      this.redisEnabled = false;
    }
  }

  async onModuleInit() {
    if (!this.redisEnabled) {
      this.logger.warn('Redis is disabled - skipping initialization');
      return;
    }
    try {
      await this.client.ping();
      await this.subscriber.ping();
      this.logger.log('Redis initialized successfully');
    } catch (error) {
      this.logger.warn('Redis connection failed: Redis features will be disabled', error);
    }
  }

  async onModuleDestroy() {
    if (!this.redisEnabled) {
      return;
    }
    await this.client.quit();
    await this.subscriber.quit();
    this.logger.log('Redis connections closed');
  }

  getClient(): Redis {
    if (!this.redisEnabled) {
      throw new Error('Redis is not enabled');
    }
    return this.client;
  }

  getSubscriber(): Redis {
    if (!this.redisEnabled) {
      throw new Error('Redis is not enabled');
    }
    return this.subscriber;
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redisEnabled) return null;
    const value = await this.client.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    if (!this.redisEnabled) return;
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, serialized);
    } else {
      await this.client.set(key, serialized);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.redisEnabled) return;
    await this.client.del(key);
  }

  async delPattern(pattern: string): Promise<number> {
    if (!this.redisEnabled) return 0;
    const keys = await this.client.keys(pattern);
    if (keys.length === 0) return 0;
    return this.client.del(keys);
  }

  async exists(key: string): Promise<boolean> {
    if (!this.redisEnabled) return false;
    return (await this.client.exists(key)) === 1;
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    if (!this.redisEnabled) return;
    await this.client.expire(key, ttlSeconds);
  }

  async ttl(key: string): Promise<number> {
    if (!this.redisEnabled) return -1;
    return this.client.ttl(key);
  }

  async publish(channel: string, message: string): Promise<number> {
    if (!this.redisEnabled) return 0;
    return this.client.publish(channel, message);
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    if (!this.redisEnabled) return;
    await this.subscriber.subscribe(channel);
    this.subscriber.on('message', (ch, msg) => {
      if (ch === channel) callback(msg);
    });
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    if (!this.redisEnabled) {
      return { status: 'disabled', timestamp: new Date().toISOString() };
    }
    const pong = await this.client.ping();
    return { status: pong === 'PONG' ? 'healthy' : 'unhealthy', timestamp: new Date().toISOString() };
  }

  async incr(key: string): Promise<number> {
    if (!this.redisEnabled) return 0;
    return this.client.incr(key);
  }

  async decr(key: string): Promise<number> {
    if (!this.redisEnabled) return 0;
    return this.client.decr(key);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    if (!this.redisEnabled) return {};
    return this.client.hgetall(key);
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    if (!this.redisEnabled) return 0;
    return this.client.hset(key, field, value);
  }

  async hdel(key: string, field: string): Promise<number> {
    if (!this.redisEnabled) return 0;
    return this.client.hdel(key, field);
  }
}
