import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/modules/prisma.service';
import { LoggerService } from '../../common/modules/logger.service';

@Injectable()
export class ConversationService {
  private readonly logger = new LoggerService();

  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateConversation(userId: string, chatId?: string) {
    if (chatId) {
      const conversation = await this.prisma.chat.findFirst({
        where: { id: chatId, userId },
      });
      if (conversation) {
        return conversation;
      }
    }

    return this.prisma.chat.create({
      data: {
        userId,
        title: 'New Conversation',
        isActive: true,
      },
    });
  }

  async getConversation(userId: string, chatId: string) {
    const conversation = await this.prisma.chat.findFirst({
      where: { id: chatId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 50,
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  async getUserConversations(userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
      this.prisma.chat.findMany({
        where: { userId, isActive: true },
        orderBy: { updatedAt: 'desc' },
        skip: offset,
        take: limit,
        select: {
          id: true,
          title: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { messages: true } },
        },
      }),
      this.prisma.chat.count({ where: { userId, isActive: true } }),
    ]);

    return {
      data: conversations,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async addMessage(chatId: string, role: 'user' | 'assistant' | 'system', content: string) {
    const message = await this.prisma.message.create({
      data: {
        chatId,
        role,
        content,
      },
    } as any);

    await this.prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async getRecentMessages(chatId: string, limit = 20) {
    return this.prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async deleteConversation(userId: string, chatId: string) {
    const conversation = await this.prisma.chat.findFirst({
      where: { id: chatId, userId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    await this.prisma.chat.update({
      where: { id: chatId },
      data: { isActive: false },
    });

    this.logger.log(`Conversation deleted: ${chatId}`, 'ConversationService');
  }

  async updateConversationTitle(userId: string, chatId: string, title: string) {
    const conversation = await this.prisma.chat.findFirst({
      where: { id: chatId, userId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return this.prisma.chat.update({
      where: { id: chatId },
      data: { title },
    });
  }
}
