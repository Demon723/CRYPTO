import { AiService } from '../services/ai.service';
import { ConversationService } from '../services/conversation.service';
import { Chain } from '../../wallets/entities/wallet.entity';
export declare class AiController {
    private readonly aiService;
    private readonly conversationService;
    constructor(aiService: AiService, conversationService: ConversationService);
    chat(userId: string, body: {
        message: string;
        chatId?: string;
        context?: Record<string, unknown>;
    }): Promise<{
        chatId: any;
        response: string;
    }>;
    streamChat(userId: string, body: {
        message: string;
        chatId?: string;
        context?: Record<string, unknown>;
    }): Promise<AsyncIterable<string>>;
    getConversations(userId: string, query: {
        page: number;
        limit: number;
    }): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getConversation(userId: string, chatId: string): Promise<any>;
    deleteConversation(userId: string, chatId: string): Promise<void>;
    analyzePortfolio(userId: string): Promise<{
        portfolio: {
            totalWallets: any;
            totalValueUsd: any;
            topTokens: any;
        };
        analysis: string;
    }>;
    explainTransaction(userId: string, hash: string): Promise<{
        transaction: any;
        explanation: string;
    }>;
    detectScam(body: {
        address: string;
        chain: Chain;
    }): Promise<{
        address: string;
        chain: Chain;
        analysis: string;
    }>;
}
