import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/modules/prisma.service';

@Injectable()
export class WebsocketGateway implements OnModuleInit, OnModuleDestroy {
  private server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    this.server = new Server({
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
      },
    });

    this.server.use(async (socket: Socket, next) => {
      try {
        const token = socket.handshake.auth.token?.replace('Bearer ', '');
        if (!token) {
          return next(new Error('Authentication required'));
        }
        const payload = await this.jwtService.verifyAsync(token);
        socket.data.userId = payload.sub;
        next();
      } catch {
        next(new Error('Invalid token'));
      }
    });

    this.server.on('connection', (socket: Socket) => {
      const userId = socket.data.userId;
      console.log(`User connected: ${userId}`);

      socket.join(`user:${userId}`);

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${userId}`);
      });
    });
  }

  onModuleDestroy() {
    if (this.server) {
      this.server.close();
    }
  }

  async sendToUser(userId: string, event: string, data: Record<string, unknown>) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  async broadcastToAll(event: string, data: Record<string, unknown>) {
    this.server.emit(event, data);
  }
}
