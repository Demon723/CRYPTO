"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AiService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../../common/modules/prisma.service");
const http_service_1 = require("../../common/modules/http.service");
const openai_1 = require("@langchain/openai");
const messages_1 = require("@langchain/core/messages");
const conversation_service_1 = require("./conversation.service");
const logger_service_1 = require("../../common/modules/logger.service");
let AiService = AiService_1 = class AiService {
    constructor(configService, prisma, httpService, conversationService) {
        this.configService = configService;
        this.prisma = prisma;
        this.httpService = httpService;
        this.conversationService = conversationService;
        this.logger = new logger_service_1.LoggerService(AiService_1.name);
        this.chatModel = new openai_1.ChatOpenAI({
            apiKey: this.configService.get('OPENAI_API_KEY'),
            modelName: this.configService.get('OPENAI_MODEL', 'gpt-4-turbo-preview'),
            temperature: 0.7,
            streaming: true,
        });
    }
    async chat(userId, message, chatId, context) {
        const conversation = await this.conversationService.getOrCreateConversation(userId, chatId);
        const systemPrompt = this.buildSystemPrompt(context);
        const messages = await this.conversationService.getRecentMessages(conversation.id, 20);
        const chatHistory = messages.map((m) => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
        }));
        const fullMessages = [
            new messages_1.SystemMessage(systemPrompt),
            ...chatHistory.map((m) => m.role === 'user' ? new messages_1.HumanMessage(m.content) : new messages_1.AIMessage(m.content)),
            new messages_1.HumanMessage(message),
        ];
        const response = await this.chatModel.invoke(fullMessages);
        await this.conversationService.addMessage(conversation.id, 'user', message);
        await this.conversationService.addMessage(conversation.id, 'assistant', response.content);
        return {
            chatId: conversation.id,
            response: response.content,
        };
    }
    async streamChat(userId, message, chatId, onToken, context) {
        const conversation = await this.conversationService.getOrCreateConversation(userId, chatId);
        const systemPrompt = this.buildSystemPrompt(context);
        const messages = await this.conversationService.getRecentMessages(conversation.id, 20);
        const chatHistory = messages.map((m) => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
        }));
        const fullMessages = [
            new messages_1.SystemMessage(systemPrompt),
            ...chatHistory.map((m) => m.role === 'user' ? new messages_1.HumanMessage(m.content) : new messages_1.AIMessage(m.content)),
            new messages_1.HumanMessage(message),
        ];
        let fullResponse = '';
        await this.chatModel.invoke(fullMessages, {
            callbacks: [
                {
                    handleLLMNewToken: async (token) => {
                        fullResponse += token;
                        if (onToken)
                            onToken(token);
                    },
                },
            ],
        });
        await this.conversationService.addMessage(conversation.id, 'user', message);
        await this.conversationService.addMessage(conversation.id, 'assistant', fullResponse);
        return {
            chatId: conversation.id,
            response: fullResponse,
        };
    }
    async analyzePortfolio(userId) {
        const wallets = await this.prisma.wallet.findMany({
            where: { userId, isActive: true },
            include: {
                balances: true,
            },
        });
        const totalValueUsd = wallets.reduce((sum, w) => {
            return (sum +
                w.balances.reduce((balSum, b) => balSum + parseFloat(b.balanceUsd?.toString() || '0'), 0));
        }, 0);
        const portfolioData = {
            totalWallets: wallets.length,
            totalValueUsd: totalValueUsd.toFixed(2),
            topTokens: wallets
                .flatMap((w) => w.balances)
                .sort((a, b) => parseFloat(b.balanceUsd?.toString() || '0') - parseFloat(a.balanceUsd?.toString() || '0'))
                .slice(0, 10)
                .map((b) => ({
                symbol: b.symbol,
                name: b.name,
                balance: b.balance,
                valueUsd: b.balanceUsd?.toString(),
                change24h: b.change24h?.toString(),
            })),
        };
        const prompt = `Analyze this crypto portfolio and provide insights:
${JSON.stringify(portfolioData, null, 2)}

Provide:
1. Overall portfolio health assessment
2. Diversification analysis
3. Risk assessment
4. Top 3 recommendations
5. Any red flags`;
        const response = await this.chatModel.invoke([
            new messages_1.SystemMessage('You are a crypto portfolio analyst. Provide concise, actionable insights.'),
            new messages_1.HumanMessage(prompt),
        ]);
        return {
            portfolio: portfolioData,
            analysis: response.content,
        };
    }
    async explainTransaction(userId, transactionHash) {
        const transaction = await this.prisma.transaction.findFirst({
            where: { userId, hash: transactionHash },
            include: { wallet: true },
        });
        if (!transaction) {
            throw new common_1.BadRequestException('Transaction not found');
        }
        const prompt = `Explain this blockchain transaction in plain English:
${JSON.stringify(transaction, null, 2)}

Provide:
1. What happened
2. Why it matters
3. Risk level (low/medium/high)
4. Any security concerns`;
        const response = await this.chatModel.invoke([
            new messages_1.SystemMessage('You are a crypto transaction analyst. Explain complex transactions simply.'),
            new messages_1.HumanMessage(prompt),
        ]);
        return {
            transaction,
            explanation: response.content,
        };
    }
    async detectScam(address, chain) {
        const prompt = `Analyze this crypto address for potential scam indicators:
Address: ${address}
Chain: ${chain}

Check for:
1. Known scam patterns
2. Suspicious contract behavior
3. High-risk indicators
4. Provide a risk score (1-10) and recommendation`;
        const response = await this.chatModel.invoke([
            new messages_1.SystemMessage('You are a crypto security analyst specializing in scam detection. Be thorough but concise.'),
            new messages_1.HumanMessage(prompt),
        ]);
        return {
            address,
            chain,
            analysis: response.content,
        };
    }
    buildSystemPrompt(context) {
        let prompt = `You are Synex, an intelligent crypto operating system assistant.

You help users with:
- Portfolio analysis and management
- Transaction explanations
- Token research and analysis
- Scam detection
- Market insights
- Smart contract analysis
- DeFi strategies

Always provide accurate, helpful information. If you don't know something, say so.
Never provide financial advice. Always remind users to do their own research (DYOR).
Be concise but thorough. Use markdown formatting for readability.`;
        if (context?.chain) {
            prompt += `\n\nCurrent chain context: ${context.chain}`;
        }
        if (context?.walletAddress) {
            prompt += `\nCurrent wallet: ${context.walletAddress}`;
        }
        return prompt;
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService, typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, http_service_1.HttpService,
        conversation_service_1.ConversationService])
], AiService);
//# sourceMappingURL=ai.service.js.map