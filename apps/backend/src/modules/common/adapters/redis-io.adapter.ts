import { Injectable, Logger } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server } from 'socket.io';

@Injectable()
export class RedisIoAdapter extends IoAdapter {
  private readonly logger = new Logger(RedisIoAdapter.name);
  private readonly pubClient: any;
  private readonly subClient: any;

  constructor() {
    super();
    this.pubClient = null as any;
    this.subClient = null as any;
  }
}
