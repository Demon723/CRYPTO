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
var RedisIoAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisIoAdapter = void 0;
const common_1 = require("@nestjs/common");
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
const ioredis_1 = require("ioredis");
let RedisIoAdapter = RedisIoAdapter_1 = class RedisIoAdapter extends platform_socket_io_1.IoAdapter {
    constructor(httpServer) {
        super(httpServer);
        this.httpServer = httpServer;
        this.logger = new common_1.Logger(RedisIoAdapter_1.name);
        this.pubClient = new ioredis_1.Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
            password: process.env.REDIS_PASSWORD || undefined,
        });
        this.subClient = new ioredis_1.Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
            password: process.env.REDIS_PASSWORD || undefined,
        });
        this.pubClient.on('error', (err) => this.logger.error('Redis pub client error', err));
        this.subClient.on('error', (err) => this.logger.error('Redis sub client error', err));
    }
    create(port, options) {
        const server = super.create(port, {
            ...options,
            adapter: {
                pubClient: this.pubClient,
                subClient: this.subClient,
            },
        });
        server.on('connection', (socket) => {
            this.logger.debug(`Client connected: ${socket.id}`);
        });
        server.on('disconnect', (socket) => {
            this.logger.debug(`Client disconnected: ${socket.id}`);
        });
        return server;
    }
};
exports.RedisIoAdapter = RedisIoAdapter;
exports.RedisIoAdapter = RedisIoAdapter = RedisIoAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object])
], RedisIoAdapter);
//# sourceMappingURL=redis-io.adapter.js.map