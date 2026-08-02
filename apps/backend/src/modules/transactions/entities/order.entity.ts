export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum OrderType {
  LIMIT = 'LIMIT',
  MARKET = 'MARKET',
  STOP_LIMIT = 'STOP_LIMIT',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  OPEN = 'OPEN',
  PARTIALLY_FILLED = 'PARTIALLY_FILLED',
  FILLED = 'FILLED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  REJECTED = 'REJECTED',
}

export interface OrderEntity {
  id: string;
  userId: string;
  walletId?: string;
  chain: string;
  side: OrderSide;
  type: OrderType;
  price: number;
  amount: number;
  filledAmount: number;
  remainingAmount: number;
  status: OrderStatus;
  commitHash?: string;
  revealed: boolean;
  mevProtected: boolean;
  batchId?: string;
  metadata?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderMatchEntity {
  id: string;
  buyOrderId: string;
  sellOrderId: string;
  chain: string;
  price: number;
  amount: number;
  fee: number;
  status: OrderStatus;
  executedAt?: Date;
  batchId: string;
  metadata?: string;
  createdAt: Date;
}

export interface SubmitOrderDto {
  walletId?: string;
  chain: string;
  side: OrderSide;
  type: OrderType;
  price: number;
  amount: number;
  commitHash?: string;
  mevProtected?: boolean;
  stopPrice?: number;
}

export interface RevealOrderDto {
  orderId: string;
  secret: string;
}

export interface MatchOrdersQueryDto {
  chain?: string;
  batchId?: string;
  side?: OrderSide;
  status?: OrderStatus;
  page?: number;
  limit?: number;
}
