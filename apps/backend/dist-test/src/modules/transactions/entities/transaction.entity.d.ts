export declare enum TransactionType {
    TRANSFER = "TRANSFER",
    SWAP = "SWAP",
    STAKE = "STAKE",
    UNSTAKE = "UNSTAKE",
    MINT = "MINT",
    BURN = "BURN",
    APPROVE = "APPROVE",
    CONTRACT_CALL = "CONTRACT_CALL",
    BRIDGE = "BRIDGE",
    NFT_TRANSFER = "NFT_TRANSFER"
}
export declare enum TransactionStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    FAILED = "FAILED",
    DROPPED = "DROPPED"
}
export interface TransactionEntity {
    id: string;
    userId: string;
    walletId?: string;
    hash: string;
    chain: string;
    type: TransactionType;
    fromAddress: string;
    toAddress?: string;
    value: string;
    valueUsd?: string;
    gasUsed?: string;
    gasPrice?: string;
    feeUsd?: string;
    blockNumber?: number;
    status: TransactionStatus;
    timestamp: Date;
    decodedFunction?: string;
    contractAddress?: string;
    tokenSymbol?: string;
    metadata?: Record<string, unknown>;
    createdAt: Date;
}
export interface TransactionFilter {
    userId: string;
    chain?: string;
    type?: TransactionType;
    status?: TransactionStatus;
    fromAddress?: string;
    toAddress?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
}
