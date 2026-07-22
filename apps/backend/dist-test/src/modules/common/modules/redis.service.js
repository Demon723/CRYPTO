"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
const config_1 = require("@nestjs/config");
let RedisService = RedisService_1 = class RedisService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(RedisService_1.name);
        this.client = new ioredis_1.Redis({
            host: this.configService.get('REDIS_HOST', 'localhost'),
            port: this.configService.get('REDIS_PORT', 6379),
            password: this.configService.get('REDIS_PASSWORD') || undefined,
            db: this.configService.get('REDIS_DB', 0),
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                this.logger.warn(`Redis connection retry attempt ${times}, delaying ${delay}ms`);
                return delay;
            },
            keepAlive: true,
        });
        this.subscriber = new ioredis_1.Redis({
            host: this.configService.get('REDIS_HOST', 'localhost'),
            port: this.configService.get('REDIS_PORT', 6379),
            password: this.configService.get('REDIS_PASSWORD') || undefined,
            db: this.configService.get('REDIS_DB', 0),
            maxRetriesPerRequest: null,
        });
        this.client.on('error', (err) => this.logger.error('Redis client error', err));
        this.client.on('connect', () => this.logger.log('Redis client connected'));
        this.subscriber.on('error', (err) => this.logger.error('Redis subscriber error', err));
        this.subscriber.on('connect', () => this.logger.log('Redis subscriber connected'));
    }
    async onModuleInit() {
        await this.client.ping();
        await this.subscriber.ping();
        this.logger.log('Redis initialized successfully');
    }
    async onModuleDestroy() {
        await this.client.quit();
        await this.subscriber.quit();
        this.logger.log('Redis connections closed');
    }
    getClient() {
        return this.client;
    }
    getSubscriber() {
        return this.subscriber;
    }
    async get(key) {
        const value = await this.client.get(key);
        if (!value)
            return null;
        try {
            return JSON.parse(value);
        }
        catch {
            return value;
        }
    }
    async set(key, value, ttlSeconds) {
        const serialized = typeof value === 'string' ? value : JSON.stringify(value);
        if (ttlSeconds) {
            await this.client.setex(key, ttlSeconds, serialized);
        }
        else {
            await this.client.set(key, serialized);
        }
    }
    async del(key) {
        await this.client.del(key);
    }
    async delPattern(pattern) {
        const keys = await this.client.keys(pattern);
        if (keys.length === 0)
            return 0;
        return this.client.del(keys);
    }
    async exists(key) {
        return (await this.client.exists(key)) === 1;
    }
    async expire(key, ttlSeconds) {
        await this.client.expire(key, ttlSeconds);
    }
    async ttl(key) {
        return this.client.ttl(key);
    }
    async publish(channel, message) {
        return this.client.publish(channel, message);
    }
    async subscribe(channel, callback) {
        await this.subscriber.subscribe(channel);
        this.subscriber.on('message', (ch, msg) => {
            if (ch === channel)
                callback(msg);
        });
    }
    async healthCheck() {
        const pong = await this.client.ping();
        return { status: pong === 'PONG' ? 'healthy' : 'unhealthy', timestamp: new Date().toISOString() };
    }
    async incr(key) {
        return this.client.incr(key);
    }
    async decr(key) {
        return this.client.decr(key);
    }
    async hgetall(key) {
        return this.client.hgetall(key);
    }
    async hset(key, field, value) {
        return this.client.hset(key, field, value);
    }
    async hdel(key, field) {
        return this.client.hdel(key, field);
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map