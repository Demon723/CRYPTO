import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Body,
  HttpCode,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import { TransactionsService } from '../services/transactions.service';
import { TransactionFilter } from '../entities/transaction.entity';
import { Chain } from '../../wallets/entities/wallet.entity';
import { IndexTransactionsDto } from '../dto/transaction.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUserId } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../../common/enums';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ParsePaginationPipe } from '../../common/pipes/parse-pagination.pipe';
import { MEVResistantExecutorService } from '../services/mev-resistant-executor.service';
import {
  SubmitOrderDto,
  RevealOrderDto,
  MatchOrdersQueryDto,
  OrderEntity,
  OrderMatchEntity,
  OrderStatus,
} from '../entities/order.entity';
import { PinBiometricAuthGuard } from '../../common/guards/pin-biometric-auth.guard';
import { TransactionAuthDto } from '../dto/pin-biometric.dto';

@ApiTags('Transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly mevService: MEVResistantExecutorService,
  ) {}

  @Get()
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get transactions for current user with filters' })
  @ApiQuery({ name: 'chain', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, enum: ['TRANSFER', 'SWAP', 'STAKE', 'UNSTAKE', 'MINT', 'BURN', 'APPROVE', 'CONTRACT_CALL', 'BRIDGE', 'NFT_TRANSFER'] })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'CONFIRMED', 'FAILED', 'DROPPED'] })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @UsePipes(ParsePaginationPipe)
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getUserTransactions(
    @CurrentUserId() userId: string,
    @Query() filters: TransactionFilter,
  ) {
    return this.transactionsService.getUserTransactions({ ...filters, userId });
  }

  @Get('stats')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get transaction statistics for current user' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Transaction stats retrieved' })
  getStats(@CurrentUserId() userId: string, @Query() query: { startDate?: string; endDate?: string }) {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;
    return this.transactionsService.getTransactionStats(userId, startDate, endDate);
  }

  @Get(':hash')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get transaction details by hash' })
  @ApiResponse({ status: 200, description: 'Transaction retrieved' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  getTransaction(@CurrentUserId() userId: string, @Param('hash') hash: string) {
    return this.transactionsService.getTransactionByHash(userId, hash);
  }

  @Post('index/:walletAddress/:chain')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Index transactions from a blockchain address (admin only)' })
  @ApiResponse({ status: 200, description: 'Transactions indexed' })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  indexTransactions(
    @CurrentUserId() userId: string,
    @Param('walletAddress') walletAddress: string,
    @Param('chain') chain: string,
  ) {
    const dto = new IndexTransactionsDto();
    dto.walletAddress = walletAddress;
    dto.chain = chain;
    return this.transactionsService.indexTransactionsFromAddress(userId, dto.walletAddress, chain as Chain);
  }

  @Post('orders')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UseGuards(PinBiometricAuthGuard)
  @ApiOperation({ summary: 'Submit a MEV-resistant order into the batch auction' })
  @ApiResponse({ status: 201, description: 'Order submitted' })
  @ApiResponse({ status: 400, description: 'Invalid order parameters' })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async submitOrder(@CurrentUserId() userId: string, @Body() dto: SubmitOrderDto & TransactionAuthDto) {
    // PIN/biometric verification is handled by the guard
    // The guard adds verifiedPin or verifiedBiometric to the request
    return this.mevService.submitOrder(dto, userId);
  }

  @Post('orders/reveal')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UseGuards(PinBiometricAuthGuard)
  @ApiOperation({ summary: 'Reveal a commit-reveal order' })
  @ApiResponse({ status: 200, description: 'Order revealed' })
  @ApiResponse({ status: 400, description: 'Reveal failed' })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async revealOrder(@Body() dto: RevealOrderDto & TransactionAuthDto) {
    return this.mevService.revealOrder(dto);
  }

  @Get('orders/book/:chain')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get MEV-resistant order book for a chain' })
  @ApiResponse({ status: 200, description: 'Order book retrieved' })
  getOrderBook(@Param('chain') chain: string) {
    return this.mevService.getOrderBook(chain as Chain);
  }

  @Post('orders/match/:chain')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Trigger batch order matching for a chain (admin only)' })
  @ApiResponse({ status: 200, description: 'Matching complete' })
  async matchOrders(@Param('chain') chain: string) {
    const matches = await this.mevService.matchOrders(chain as Chain);
    return { matches, count: matches.length };
  }

  @Get('orders')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get current user orders' })
  @ApiQuery({ name: 'chain', required: false, type: String })
  @ApiQuery({ name: 'side', required: false, enum: ['BUY', 'SELL'] })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'OPEN', 'PARTIALLY_FILLED', 'FILLED', 'CANCELLED', 'EXPIRED', 'REJECTED'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @UsePipes(ParsePaginationPipe)
  @ApiResponse({ status: 200, description: 'Orders retrieved' })
  async getUserOrders(
    @CurrentUserId() userId: string,
    @Query() query: MatchOrdersQueryDto & { page?: number; limit?: number },
  ) {
    return this.mevService.getUserOrders(userId, query);
  }

  @Delete('orders/:orderId')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UseGuards(PinBiometricAuthGuard)
  @ApiOperation({ summary: 'Cancel an open order' })
  @ApiResponse({ status: 200, description: 'Order cancelled' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async cancelOrder(@CurrentUserId() userId: string, @Param('orderId') orderId: string, @Body() dto: TransactionAuthDto) {
    return this.mevService.cancelOrder(orderId, userId);
  }

  @Get('orders/batches')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get batch auction history' })
  @ApiResponse({ status: 200, description: 'Batch history retrieved' })
  getBatchHistory(@Query('limit') limit?: number) {
    return this.mevService.getBatchHistory(limit || 10);
  }
}
