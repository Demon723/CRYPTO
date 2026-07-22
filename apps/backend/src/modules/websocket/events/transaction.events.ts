import { Injectable } from '@nestjs/common';
import { WebsocketGateway } from '../websocket.gateway';

@Injectable()
export class TransactionEvents {
  constructor(private readonly websocketGateway: WebsocketGateway) {}

  async broadcastTransactionCreated(userId: string, transaction: any) {
    await this.websocketGateway.sendToUser(userId, 'transaction:created', {
      type: 'TRANSACTION_CREATED',
      data: transaction,
      timestamp: new Date().toISOString(),
    });
  }

  async broadcastTransactionConfirmed(userId: string, transaction: any) {
    await this.websocketGateway.sendToUser(userId, 'transaction:confirmed', {
      type: 'TRANSACTION_CONFIRMED',
      data: transaction,
      timestamp: new Date().toISOString(),
    });
  }

  async broadcastTransactionFailed(userId: string, transaction: any) {
    await this.websocketGateway.sendToUser(userId, 'transaction:failed', {
      type: 'TRANSACTION_FAILED',
      data: transaction,
      timestamp: new Date().toISOString(),
    });
  }
}
