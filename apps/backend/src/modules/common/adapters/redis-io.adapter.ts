import { Injectable, Logger } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';
import { Redis } from 'ioredis';

@Injectable()
export class RedisIoAdapter extends IoAdapter {
  private readonly logger = new Logger(RedisIoAdapter.name);
  private readonly pubClient: Redis;
  private readonly subClient: Redis;

  constructor() {
    super();
    this.pubClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
    });
    this.subClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
    });
  }

  create(port: number, options?: ServerOptions): Server {
    const server = super.create(port, options);
    this.logger.log(`WebSocket server created on port ${port}`);
    return server;
  }
}
