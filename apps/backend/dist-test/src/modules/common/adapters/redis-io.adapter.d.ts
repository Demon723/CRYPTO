import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';
export declare class RedisIoAdapter extends IoAdapter {
    private readonly httpServer;
    private readonly logger;
    private readonly pubClient;
    private readonly subClient;
    constructor(httpServer: unknown);
    create(port: number, options?: ServerOptions): Server;
}
