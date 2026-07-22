import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../common/modules/prisma.service';
import { HttpService } from '../../common/modules/http.service';
import { ConversationService } from './conversation.service';
import { Chain } from '../../wallets/entities/wallet.entity';
export declare class AiService {
    private readonly configService;
    private readonly prisma;
    private readonly httpService;
    private readonly conversationService;
    private readonly logger;
    private readonly chatModel;
    constructor(configService: ConfigService, prisma: PrismaService, httpService: HttpService, conversationService: ConversationService);
    chat(userId: string, message: string, chatId?: string, context?: Record<string, unknown>): Promise<{
        chatId: any;
        response: string;
    }>;
    streamChat(userId: string, message: string, chatId?: string, onToken?: (token: string) => void, context?: Record<string, unknown>): Promise<{
        chatId: any;
        response: string;
    }>;
    analyzePortfolio(userId: string): Promise<{
        portfolio: {
            totalWallets: any;
            totalValueUsd: any;
            topTokens: any;
        };
        analysis: string;
    }>;
    explainTransaction(userId: string, transactionHash: string): Promise<{
        transaction: any;
        explanation: string;
    }>;
    detectScam(address: string, chain: Chain): Promise<{
        address: string;
        chain: Chain;
        analysis: string;
    }>;
    private buildSystemPrompt;
}
