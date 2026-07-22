import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Sse,
} from '@nestjs/common';
import { AiService } from '../services/ai.service';
import { TransactionBuilderService } from '../services/transaction-builder.service';
import { ConversationService } from '../services/conversation.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUserId } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../../common/enums';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ParsePaginationPipe } from '../../common/pipes/parse-pagination.pipe';
import { Chain } from '../../wallets/entities/wallet.entity';

@ApiTags('AI')
@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly conversationService: ConversationService,
    private readonly transactionBuilderService: TransactionBuilderService,
  ) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Send a message to AI assistant' })
  @ApiResponse({ status: 200, description: 'AI response generated' })
  async chat(
    @CurrentUserId() userId: string,
    @Body() body: { message: string; chatId?: string; context?: Record<string, unknown> },
  ) {
    return this.aiService.chat(userId, body.message, body.chatId, body.context);
  }

  @Sse('chat/stream')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Stream AI chat responses (Server-Sent Events)' })
  @ApiResponse({ status: 200, description: 'Streaming AI response', content: { 'text/event-stream': {} } })
  streamChat(
    @CurrentUserId() userId: string,
    @Body() body: { message: string; chatId?: string; context?: Record<string, unknown> },
  ) {
    return new Promise<AsyncIterable<string>>((resolve) => {
      const tokens: string[] = [];
      this.aiService.streamChat(userId, body.message, body.chatId, (token) => {
        tokens.push(token);
      }, body.context);
      resolve({
        async *[Symbol.asyncIterator]() {
          for (const token of tokens) {
            yield `data: ${token}\n\n`;
          }
          yield 'data: [DONE]\n\n';
        },
      });
    });
  }

  @Get('conversations')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UsePipes(ParsePaginationPipe)
  @ApiOperation({ summary: 'Get user conversation history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Conversations retrieved' })
  getConversations(@CurrentUserId() userId: string, @Query() query: { page: number; limit: number }) {
    return this.conversationService.getUserConversations(userId, query.page, query.limit);
  }

  @Get('conversations/:chatId')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get specific conversation with messages' })
  @ApiResponse({ status: 200, description: 'Conversation retrieved' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  getConversation(@CurrentUserId() userId: string, @Param('chatId') chatId: string) {
    return this.conversationService.getConversation(userId, chatId);
  }

  @Delete('conversations/:chatId')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete conversation' })
  @ApiResponse({ status: 200, description: 'Conversation deleted' })
  deleteConversation(@CurrentUserId() userId: string, @Param('chatId') chatId: string) {
    return this.conversationService.deleteConversation(userId, chatId);
  }

  @Post('analyze-portfolio')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'AI-powered portfolio analysis' })
  @ApiResponse({ status: 200, description: 'Portfolio analysis generated' })
  analyzePortfolio(@CurrentUserId() userId: string) {
    return this.aiService.analyzePortfolio(userId);
  }

  @Post('explain-transaction/:hash')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'AI explanation of a transaction' })
  @ApiResponse({ status: 200, description: 'Transaction explanation generated' })
  explainTransaction(@CurrentUserId() userId: string, @Param('hash') hash: string) {
    return this.aiService.explainTransaction(userId, hash);
  }

  @Post('detect-scam')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'AI scam detection for an address' })
  @ApiResponse({ status: 200, description: 'Scam analysis generated' })
  detectScam(@Body() body: { address: string; chain: Chain }) {
    return this.aiService.detectScam(body.address, body.chain);
  }

  @Post('transaction/intent')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Parse natural language transaction intent' })
  @ApiResponse({ status: 200, description: 'Transaction intent parsed' })
  parseTransactionIntent(@CurrentUserId() userId: string, @Body() body: { message: string }) {
    return this.transactionBuilderService.parseNaturalLanguage(body.message);
  }

  @Post('transaction/build')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Build transaction from natural language' })
  @ApiResponse({ status: 200, description: 'Transaction preview generated' })
  async buildTransaction(@CurrentUserId() userId: string, @Body() body: { message: string }) {
    const intent = await this.transactionBuilderService.parseNaturalLanguage(body.message);
    return this.transactionBuilderService.buildTransaction(userId, intent);
  }
}
