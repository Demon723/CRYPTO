// @ts-nocheck
import { Test, TestingModule } from '@nestjs/testing';
import { MEVResistantExecutorService } from '../../src/modules/transactions/services/mev-resistant-executor.service';
import { PrismaService } from '../../src/modules/common/modules/prisma.service';

describe('MEVResistantExecutorService', () => {
  let service: MEVResistantExecutorService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MEVResistantExecutorService,
        {
          provide: PrismaService,
          useValue: {
            order: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
            },
            orderMatch: {
              create: jest.fn(),
            },
          } as any,
        },
      ],
    }).compile();

    service = moduleRef.get<MEVResistantExecutorService>(MEVResistantExecutorService);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should submit an order with commit-reveal', async () => {
    jest.spyOn(prismaService.order, 'create').mockResolvedValue({
      id: 'order-1',
      userId: 'user-1',
      chain: 'ETHEREUM',
      side: 'BUY',
      type: 'LIMIT',
      price: 100,
      amount: 1,
      filledAmount: 0,
      remainingAmount: 1,
      status: 'PENDING',
      commitHash: '0xabc',
      revealed: false,
      mevProtected: true,
      batchId: 'batch-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const result = await service.submitOrder(
      {
        chain: 'ETHEREUM',
        side: 'BUY',
        type: 'LIMIT',
        price: 100,
        amount: 1,
        commitHash: '0xabc',
        mevProtected: true,
      },
      'user-1',
    );

    expect(result.accepted).toBe(true);
    expect(result.order.id).toBe('order-1');
  });

  it('should reject order without commit hash when commit-reveal is enabled', async () => {
    const result = await service.submitOrder(
      {
        chain: 'ETHEREUM',
        side: 'BUY',
        type: 'LIMIT',
        price: 100,
        amount: 1,
      },
      'user-1',
    );

    expect(result.accepted).toBe(false);
    expect(result.reason).toContain('Commit-reveal');
  });

  it('should reveal an order with valid secret', async () => {
    const createdAt = new Date();
    const side = 'BUY';
    const price = 100;
    const amount = 1;
    const secret = 'secret123';
    const data = `order-1${side}${price}${amount}${createdAt.getTime()}${secret}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    const computedHash = `0x${Math.abs(hash).toString(16).padStart(64, '0')}`;

    const mockOrder = {
      id: 'order-1',
      userId: 'user-1',
      chain: 'ETHEREUM',
      side,
      type: 'LIMIT',
      price,
      amount,
      filledAmount: 0,
      remainingAmount: 1,
      status: 'PENDING',
      commitHash: computedHash,
      revealed: false,
      mevProtected: true,
      batchId: 'batch-1',
      createdAt,
      updatedAt: createdAt,
    };

    jest.spyOn(prismaService.order, 'create').mockResolvedValue(mockOrder as any);
    jest.spyOn(prismaService.order, 'update').mockResolvedValue({
      id: 'order-1',
      revealed: true,
    } as any);

    await service.submitOrder(
      {
        chain: 'ETHEREUM',
        side: 'BUY',
        type: 'LIMIT',
        price: 100,
        amount: 1,
        commitHash: computedHash,
        mevProtected: true,
      },
      'user-1',
    );

    const result = await service.revealOrder({ orderId: 'order-1', secret });
    expect(result.revealed).toBe(true);
  });

  it('should reject reveal for unknown order', async () => {
    const result = await service.revealOrder({ orderId: 'unknown', secret: 'secret' });
    expect(result.revealed).toBe(false);
    expect(result.reason).toBe('Order not found');
  });

  it('should cancel an order', async () => {
    jest.spyOn(prismaService.order, 'findFirst').mockResolvedValue({
      id: 'order-1',
      userId: 'user-1',
      status: 'OPEN',
    } as any);
    jest.spyOn(prismaService.order, 'update').mockResolvedValue({
      id: 'order-1',
      status: 'CANCELLED',
    } as any);

    const result = await service.cancelOrder('order-1', 'user-1');
    expect(result.cancelled).toBe(true);
  });

  it('should get order book', async () => {
    jest.spyOn(prismaService.order, 'findMany').mockResolvedValue([
      {
        id: 'order-1',
        userId: 'user-1',
        chain: 'ETHEREUM',
        side: 'BUY',
        type: 'LIMIT',
        price: 100,
        amount: 1,
        filledAmount: 0,
        remainingAmount: 1,
        status: 'OPEN',
        revealed: true,
        mevProtected: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ] as any);

    const book = await service.getOrderBook('ETHEREUM');
    expect(book.bids.length).toBeGreaterThan(0);
  });
});
