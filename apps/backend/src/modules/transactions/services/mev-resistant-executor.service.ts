import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/modules/prisma.service';
import { Chain } from '../../wallets/entities/wallet.entity';
import { TransactionRequest, TransactionResult } from './transaction-executor.service';

export interface MEVProtectionResult {
  protected: boolean;
  reason: string;
  sanitizedTx?: TransactionRequest;
}

export interface OrderBookEntry {
  id: string;
  side: 'buy' | 'sell';
  price: number;
  amount: number;
  timestamp: number;
  userId: string;
}

export interface MEVResistantOrder {
  id: string;
  userId: string;
  side: 'buy' | 'sell';
  price: number;
  amount: number;
  type: 'limit' | 'market';
  createdAt: number;
  commitHash?: string;
  revealed?: boolean;
}

@Injectable()
export class MEVResistantExecutorService {
  private readonly logger = new Logger(MEVResistantExecutorService.name);
  private orderBook: Map<string, OrderBookEntry[]> = new Map();
  private pendingOrders: Map<string, MEVResistantOrder> = new Map();
  private commitRevealEnabled: boolean = true;

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  enableCommitReveal(enabled: boolean): void {
    this.commitRevealEnabled = enabled;
  }

  async submitOrder(order: MEVResistantOrder): Promise<{ accepted: boolean; reason: string }> {
    if (this.commitRevealEnabled && !order.commitHash) {
      return { accepted: false, reason: 'Commit-reveal scheme required: provide commitHash' };
    }

    if (order.price <= 0) {
      return { accepted: false, reason: 'Invalid price' };
    }

    if (order.amount <= 0) {
      return { accepted: false, reason: 'Invalid amount' };
    }

    const mevCheck = this._detectMEVPattern(order);
    if (mevCheck.protected) {
      this.logger.warn(`MEV pattern detected for order ${order.id}: ${mevCheck.reason}`);
      return { accepted: false, reason: `MEV protection: ${mevCheck.reason}` };
    }

    const entry: OrderBookEntry = {
      id: order.id,
      side: order.side,
      price: order.price,
      amount: order.amount,
      timestamp: order.createdAt,
      userId: order.userId,
    };

    const chainKey = 'default';
    if (!this.orderBook.has(chainKey)) {
      this.orderBook.set(chainKey, []);
    }

    this.orderBook.get(chainKey)!.push(entry);
    this.pendingOrders.set(order.id, order);

    return { accepted: true, reason: 'Order accepted' };
  }

  async revealOrder(orderId: string, secret: string): Promise<{ revealed: boolean; reason: string }> {
    const order = this.pendingOrders.get(orderId);
    if (!order) {
      return { revealed: false, reason: 'Order not found' };
    }

    if (order.revealed) {
      return { revealed: false, reason: 'Order already revealed' };
    }

    const expectedCommit = this._computeCommitHash(order, secret);
    if (order.commitHash && order.commitHash !== expectedCommit) {
      return { revealed: false, reason: 'Commit hash mismatch - order rejected' };
    }

    order.revealed = true;
    return { revealed: true, reason: 'Order revealed successfully' };
  }

  async matchOrders(chain: Chain): Promise<Array<{ buyOrder: MEVResistantOrder; sellOrder: MEVResistantOrder; price: number; amount: number }>> {
    const chainKey = chain as string;
    const entries = this.orderBook.get(chainKey) || [];

    const buyOrders = entries
      .filter(e => e.side === 'buy')
      .sort((a, b) => b.price - a.price);

    const sellOrders = entries
      .filter(e => e.side === 'sell')
      .sort((a, b) => a.price - b.price);

    const matches: Array<{ buyOrder: MEVResistantOrder; sellOrder: MEVResistantOrder; price: number; amount: number }> = [];

    let buyIdx = 0;
    let sellIdx = 0;

    while (buyIdx < buyOrders.length && sellIdx < sellOrders.length) {
      const buy = buyOrders[buyIdx];
      const sell = sellOrders[sellIdx];

      if (buy.price >= sell.price) {
        const matchPrice = sell.price;
        const matchAmount = Math.min(buy.amount, sell.amount);

        matches.push({
          buyOrder: this.pendingOrders.get(buy.id) || {} as MEVResistantOrder,
          sellOrder: this.pendingOrders.get(sell.id) || {} as MEVResistantOrder,
          price: matchPrice,
          amount: matchAmount,
        });

        buyOrders[buyIdx].amount -= matchAmount;
        sellOrders[sellIdx].amount -= matchAmount;

        if (buyOrders[buyIdx].amount <= 0) buyIdx++;
        if (sellOrders[sellIdx].amount <= 0) sellIdx++;
      } else {
        break;
      }
    }

    return matches;
  }

  private _detectMEVPattern(order: MEVResistantOrder): MEVProtectionResult {
    const chainKey = 'default';
    const entries = this.orderBook.get(chainKey) || [];

    const sameUserRecent = entries.filter(
      e => e.userId === order.userId && Math.abs(e.timestamp - order.createdAt) < 5000,
    );

    if (sameUserRecent.length > 3) {
      return {
        protected: true,
        reason: 'High-frequency order pattern detected - possible MEV bot',
      };
    }

    const samePriceOpposite = entries.filter(
      e => e.price === order.price && e.side !== order.side && Math.abs(e.timestamp - order.createdAt) < 1000,
    );

    if (samePriceOpposite.length > 0) {
      return {
        protected: true,
        reason: 'Sandwich attack pattern detected - same price opposite side within 1 second',
      };
    }

    return { protected: false, reason: 'No MEV patterns detected' };
  }

  private _computeCommitHash(order: MEVResistantOrder, secret: string): string {
    const data = `${order.id}${order.side}${order.price}${order.amount}${order.createdAt}${secret}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `0x${Math.abs(hash).toString(16).padStart(64, '0')}`;
  }

  getOrderBook(chain: Chain): OrderBookEntry[] {
    return this.orderBook.get(chain as string) || [];
  }

  getPendingOrders(): MEVResistantOrder[] {
    return Array.from(this.pendingOrders.values());
  }
}