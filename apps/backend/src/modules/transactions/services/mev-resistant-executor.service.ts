import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/modules/prisma.service';
import { Prisma } from '@prisma/client';
import { Chain } from '../../wallets/entities/wallet.entity';
import { TransactionRequest, TransactionResult } from './transaction-executor.service';
import {
  OrderEntity,
  OrderMatchEntity,
  OrderSide,
  OrderType,
  OrderStatus,
  SubmitOrderDto,
  RevealOrderDto,
} from '../entities/order.entity';

export interface MEVProtectionResult {
  protected: boolean;
  reason: string;
  sanitizedTx?: TransactionRequest;
}

export interface BatchAuctionRound {
  batchId: string;
  startTime: number;
  endTime: number;
  orders: OrderEntity[];
  matches: OrderMatchEntity[];
}

@Injectable()
export class MEVResistantExecutorService {
  private readonly logger = new Logger(MEVResistantExecutorService.name);
  private readonly BATCH_INTERVAL_MS = 5000;
  private readonly MIN_VALIDATORS = 3;
  private readonly MAX_PRICE_DEVIATION = 0.05;
  private readonly COMMIT_REVEAL_DELAY_MS = 3000;

  private pendingOrders: Map<string, OrderEntity> = new Map();
  private currentBatchId: string = '';
  private batchTimer: NodeJS.Timeout | null = null;
  private batchRounds: BatchAuctionRound[] = [];
  private commitRevealEnabled: boolean = true;

  constructor(private readonly prisma: PrismaService) {
    this.startNewBatch();
    this.startBatchScheduler();
  }

  enableCommitReveal(enabled: boolean): void {
    this.commitRevealEnabled = enabled;
  }

  async submitOrder(dto: SubmitOrderDto, userId: string): Promise<{ order: OrderEntity; accepted: boolean; reason: string }> {
    if (dto.amount <= 0) {
      throw new Error('Invalid amount');
    }

    if (dto.type === OrderType.LIMIT && (!dto.price || dto.price <= 0)) {
      throw new Error('Limit orders require a valid price');
    }

    if (this.commitRevealEnabled && !dto.commitHash) {
      return {
        order: {} as OrderEntity,
        accepted: false,
        reason: 'Commit-reveal scheme required: provide commitHash',
      };
    }

    const order = await this.prisma.order.create({
      data: {
        userId,
        walletId: dto.walletId,
        chain: dto.chain,
        side: dto.side,
        type: dto.type,
        price: dto.price,
        amount: dto.amount,
        remainingAmount: dto.amount,
        status: OrderStatus.PENDING,
        commitHash: dto.commitHash,
        mevProtected: dto.mevProtected ?? true,
        batchId: this.currentBatchId,
        metadata: dto.stopPrice ? JSON.stringify({ stopPrice: dto.stopPrice }) : undefined,
      },
    });

    const orderEntity: OrderEntity = {
      id: order.id,
      userId: order.userId,
      walletId: order.walletId || undefined,
      chain: order.chain,
      side: order.side as OrderSide,
      type: order.type as OrderType,
      price: order.price,
      amount: order.amount,
      filledAmount: order.filledAmount,
      remainingAmount: order.remainingAmount,
      status: order.status as OrderStatus,
      commitHash: order.commitHash || undefined,
      revealed: order.revealed,
      mevProtected: order.mevProtected,
      batchId: order.batchId || undefined,
      metadata: order.metadata || undefined,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    this.pendingOrders.set(order.id, orderEntity);

    this.logger.log(`Order ${order.id} submitted to batch ${this.currentBatchId}`);

    return {
      order: orderEntity,
      accepted: true,
      reason: 'Order accepted into batch auction',
    };
  }

  async revealOrder(dto: RevealOrderDto): Promise<{ revealed: boolean; reason: string }> {
    const order = this.pendingOrders.get(dto.orderId);
    if (!order) {
      return { revealed: false, reason: 'Order not found' };
    }

    if (order.revealed) {
      return { revealed: false, reason: 'Order already revealed' };
    }

    const expectedCommit = this._computeCommitHash(order, dto.secret);
    if (order.commitHash && order.commitHash !== expectedCommit) {
      return { revealed: false, reason: 'Commit hash mismatch - order rejected' };
    }

    await this.prisma.order.update({
      where: { id: dto.orderId },
      data: { revealed: true },
    });

    order.revealed = true;

    return { revealed: true, reason: 'Order revealed successfully' };
  }

  async matchOrders(chain: Chain): Promise<OrderMatchEntity[]> {
    const batchId = this.currentBatchId;
    const orders = await this.prisma.order.findMany({
      where: {
        chain,
        status: { in: [OrderStatus.PENDING, OrderStatus.OPEN] },
        batchId,
        mevProtected: true,
        revealed: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const buyOrders = orders
      .filter(o => o.side === 'BUY')
      .sort((a, b) => b.price - a.price);

    const sellOrders = orders
      .filter(o => o.side === 'SELL')
      .sort((a, b) => a.price - b.price);

    const matches: OrderMatchEntity[] = [];
    let buyIdx = 0;
    let sellIdx = 0;

    while (buyIdx < buyOrders.length && sellIdx < sellOrders.length) {
      const buy = buyOrders[buyIdx];
      const sell = sellOrders[sellIdx];

      if (buy.price >= sell.price) {
        const matchPrice = sell.price;
        const matchAmount = Math.min(buy.remainingAmount - buy.filledAmount, sell.remainingAmount - sell.filledAmount);

        if (matchAmount <= 0) {
          buyIdx++;
          sellIdx++;
          continue;
        }

        const match = await this.prisma.orderMatch.create({
          data: {
            buyOrderId: buy.id,
            sellOrderId: sell.id,
            chain,
            price: matchPrice,
            amount: matchAmount,
            fee: matchPrice * matchAmount * 0.001,
            status: OrderStatus.FILLED,
            batchId,
            executedAt: new Date(),
          },
        });

        const updatedBuy = await this.prisma.order.update({
          where: { id: buy.id },
          data: {
            filledAmount: { increment: matchAmount },
            remainingAmount: { decrement: matchAmount },
            status: buy.filledAmount + matchAmount >= buy.amount ? OrderStatus.FILLED : OrderStatus.PARTIALLY_FILLED,
          },
        });

        const updatedSell = await this.prisma.order.update({
          where: { id: sell.id },
          data: {
            filledAmount: { increment: matchAmount },
            remainingAmount: { decrement: matchAmount },
            status: sell.filledAmount + matchAmount >= sell.amount ? OrderStatus.FILLED : OrderStatus.PARTIALLY_FILLED,
          },
        });

        this.pendingOrders.delete(buy.id);
        this.pendingOrders.delete(sell.id);

        if (updatedBuy.status !== OrderStatus.FILLED) {
          this.pendingOrders.set(buy.id, updatedBuy as OrderEntity);
        }
        if (updatedSell.status !== OrderStatus.FILLED) {
          this.pendingOrders.set(sell.id, updatedSell as OrderEntity);
        }

        matches.push({
          id: match.id,
          buyOrderId: match.buyOrderId,
          sellOrderId: match.sellOrderId,
          chain: match.chain,
          price: match.price,
          amount: match.amount,
          fee: match.fee,
          status: match.status as OrderStatus,
          executedAt: match.executedAt || undefined,
          batchId: match.batchId,
          metadata: match.metadata || undefined,
          createdAt: match.createdAt,
        });

        if (updatedBuy.status === OrderStatus.FILLED) buyIdx++;
        if (updatedSell.status === OrderStatus.FILLED) sellIdx++;
      } else {
        break;
      }
    }

    this.logger.log(`Batch ${batchId}: matched ${matches.length} orders on ${chain}`);

    return matches;
  }

  async getOrderBook(chain: Chain): Promise<{ bids: OrderEntity[]; asks: OrderEntity[] }> {
    const [bids, asks] = await Promise.all([
      this.prisma.order.findMany({
        where: { chain, side: 'BUY', status: { in: [OrderStatus.OPEN, OrderStatus.PARTIALLY_FILLED] } },
        orderBy: { price: 'desc' },
      }),
      this.prisma.order.findMany({
        where: { chain, side: 'SELL', status: { in: [OrderStatus.OPEN, OrderStatus.PARTIALLY_FILLED] } },
        orderBy: { price: 'asc' },
      }),
    ]);

    return {
      bids: bids.map(this.mapOrder),
      asks: asks.map(this.mapOrder),
    };
  }

  async getBatchHistory(limit: number = 10): Promise<BatchAuctionRound[]> {
    return this.batchRounds.slice(-limit);
  }

  async getUserOrders(userId: string, filters: { chain?: string; side?: string; status?: string; page?: number; limit?: number }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = { userId };
    if (filters.chain) (where as Prisma.OrderWhereInput).chain = filters.chain;
    if (filters.side) (where as Prisma.OrderWhereInput).side = filters.side;
    if (filters.status) (where as Prisma.OrderWhereInput).status = filters.status;

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.order.count({ where }),
    ]);

    return { data: data.map(this.mapOrder), total, page, limit };
  }

  async cancelOrder(orderId: string, userId: string): Promise<{ cancelled: boolean; reason: string }> {
    const order = await this.prisma.order.findFirst({ where: { id: orderId, userId } });

    if (!order) {
      return { cancelled: false, reason: 'Order not found' };
    }

    if (order.status === OrderStatus.FILLED || order.status === OrderStatus.CANCELLED) {
      return { cancelled: false, reason: `Order already ${order.status.toLowerCase()}` };
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELLED },
    });

    this.pendingOrders.delete(orderId);

    return { cancelled: true, reason: 'Order cancelled successfully' };
  }

  private startNewBatch(): void {
    this.currentBatchId = `batch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.logger.log(`Started new batch: ${this.currentBatchId}`);
  }

  private startBatchScheduler(): void {
    this.batchTimer = setInterval(() => {
      this.finalizeBatch();
      this.startNewBatch();
    }, this.BATCH_INTERVAL_MS);
  }

  private async finalizeBatch(): Promise<void> {
    const batchId = this.currentBatchId;
    this.logger.log(`Finalizing batch: ${batchId}`);

    const round: BatchAuctionRound = {
      batchId,
      startTime: Date.now() - this.BATCH_INTERVAL_MS,
      endTime: Date.now(),
      orders: Array.from(this.pendingOrders.values()).filter(o => o.batchId === batchId),
      matches: [],
    };

    this.batchRounds.push(round);

    if (this.batchRounds.length > 100) {
      this.batchRounds = this.batchRounds.slice(-100);
    }
  }

  private _detectMEVPattern(order: OrderEntity): { protected: boolean; reason: string } {
    const chainKey = order.chain;
    const orders = Array.from(this.pendingOrders.values()).filter(o => o.chain === chainKey);

    const sameUserRecent = orders.filter(
      o => o.userId === order.userId && Math.abs(o.createdAt.getTime() - order.createdAt.getTime()) < 5000,
    );

    if (sameUserRecent.length > 3) {
      return { protected: true, reason: 'High-frequency order pattern detected - possible MEV bot' };
    }

    const oppositeSideSamePrice = orders.filter(
      o => o.price === order.price && o.side !== order.side && Math.abs(o.createdAt.getTime() - order.createdAt.getTime()) < 1000,
    );

    if (oppositeSideSamePrice.length > 0) {
      return { protected: true, reason: 'Sandwich attack pattern detected - same price opposite side within 1 second' };
    }

    const largerOrdersOpposite = orders.filter(
      o => o.side !== order.side && o.amount > order.amount * 10 && Math.abs(o.createdAt.getTime() - order.createdAt.getTime()) < 2000,
    );

    if (largerOrdersOpposite.length > 0) {
      return { protected: true, reason: 'Potential time-bandit attack: large opposite-side order detected' };
    }

    return { protected: false, reason: 'No MEV patterns detected' };
  }

  private _computeCommitHash(order: OrderEntity, secret: string): string {
    const data = `${order.id}${order.side}${order.price}${order.amount}${order.createdAt.getTime()}${secret}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `0x${Math.abs(hash).toString(16).padStart(64, '0')}`;
  }

  private mapOrder(order: unknown): OrderEntity {
    const o = order as any;
    return {
      id: o.id,
      userId: o.userId,
      walletId: o.walletId || undefined,
      chain: o.chain,
      side: o.side as OrderSide,
      type: o.type as OrderType,
      price: o.price,
      amount: o.amount,
      filledAmount: o.filledAmount,
      remainingAmount: o.remainingAmount,
      status: o.status as OrderStatus,
      commitHash: o.commitHash || undefined,
      revealed: o.revealed,
      mevProtected: o.mevProtected,
      batchId: o.batchId || undefined,
      metadata: o.metadata || undefined,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    };
  }
}
