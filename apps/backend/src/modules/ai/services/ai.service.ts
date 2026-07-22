import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/modules/prisma.service';
import { HttpService } from '../../common/modules/http.service';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import { ConversationService } from './conversation.service';
import { LoggerService } from '../../common/modules/logger.service';
import { Chain } from '../../wallets/entities/wallet.entity';


@Injectable()
export class AiService {
  private readonly logger = new LoggerService();
  private readonly chatModel: ChatOpenAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly conversationService: ConversationService,
  ) {
    this.chatModel = new ChatOpenAI({
      openAIApiKey: this.configService.get<string>('OPENAI_API_KEY'),
      modelName: this.configService.get<string>('OPENAI_MODEL', 'gpt-4-turbo-preview'),
      temperature: 0.7,
      streaming: true,
    });
  }

  async chat(userId: string, message: string, chatId?: string, context?: Record<string, unknown>) {
    const conversation = await this.conversationService.getOrCreateConversation(userId, chatId);

    const systemPrompt = this.buildSystemPrompt(context);
    const messages = await this.conversationService.getRecentMessages(conversation.id, 20);
    const chatHistory = messages.map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    }));

    const fullMessages = [
      new SystemMessage(systemPrompt),
      ...chatHistory.map((m) =>
        m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content),
      ),
      new HumanMessage(message),
    ];

    const response = await this.chatModel.invoke(fullMessages);

    await this.conversationService.addMessage(conversation.id, 'user', message);
    await this.conversationService.addMessage(conversation.id, 'assistant', response.content as string);

    return {
      chatId: conversation.id,
      response: response.content as string,
    };
  }

  async streamChat(
    userId: string,
    message: string,
    chatId?: string,
    onToken?: (token: string) => void,
    context?: Record<string, unknown>,
  ) {
    const conversation = await this.conversationService.getOrCreateConversation(userId, chatId);
    const systemPrompt = this.buildSystemPrompt(context);
    const messages = await this.conversationService.getRecentMessages(conversation.id, 20);
    const chatHistory = messages.map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    }));

    const fullMessages = [
      new SystemMessage(systemPrompt),
      ...chatHistory.map((m) =>
        m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content),
      ),
      new HumanMessage(message),
    ];

    let fullResponse = '';

    await this.chatModel.invoke(fullMessages, {
      callbacks: [
        {
          handleLLMNewToken: async (token) => {
            fullResponse += token;
            if (onToken) onToken(token);
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

  async analyzePortfolio(userId: string) {
    const wallets = await this.prisma.wallet.findMany({
      where: { userId, isActive: true },
      include: {
        balances: true,
      },
    });

    const totalValueUsd = wallets.reduce((sum, w) => {
      return (
        sum +
        w.balances.reduce((balSum, b) => balSum + parseFloat(b.balanceUsd?.toString() || '0'), 0)
      );
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
      new SystemMessage('You are a crypto portfolio analyst. Provide concise, actionable insights.'),
      new HumanMessage(prompt),
    ]);

    return {
      portfolio: portfolioData,
      analysis: response.content as string,
    };
  }

  async explainTransaction(userId: string, transactionHash: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { userId, hash: transactionHash },
      include: { wallet: true },
    });

    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    const prompt = `Explain this blockchain transaction in plain English:
${JSON.stringify(transaction, null, 2)}

Provide:
1. What happened
2. Why it matters
3. Risk level (low/medium/high)
4. Any security concerns`;

    const response = await this.chatModel.invoke([
      new SystemMessage('You are a crypto transaction analyst. Explain complex transactions simply.'),
      new HumanMessage(prompt),
    ]);

    return {
      transaction,
      explanation: response.content as string,
    };
  }

  async detectScam(address: string, chain: Chain) {
    const prompt = `Analyze this crypto address for potential scam indicators:
Address: ${address}
Chain: ${chain}

Check for:
1. Known scam patterns
2. Suspicious contract behavior
3. High-risk indicators
4. Provide a risk score (1-10) and recommendation`;

    const response = await this.chatModel.invoke([
      new SystemMessage('You are a crypto security analyst specializing in scam detection. Be thorough but concise.'),
      new HumanMessage(prompt),
    ]);

    return {
      address,
      chain,
      analysis: response.content as string,
    };
  }

  private buildSystemPrompt(context?: Record<string, unknown>): string {
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
}
