import { PrismaService } from '../../../common/modules/prisma.service';
export declare class ConversationService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getOrCreateConversation(userId: string, chatId?: string): Promise<any>;
    getConversation(userId: string, chatId: string): Promise<any>;
    getUserConversations(userId: string, page?: number, limit?: number): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    addMessage(chatId: string, role: 'user' | 'assistant' | 'system', content: string): Promise<any>;
    getRecentMessages(chatId: string, limit?: number): Promise<any>;
    deleteConversation(userId: string, chatId: string): Promise<void>;
    updateConversationTitle(userId: string, chatId: string, title: string): Promise<any>;
}
