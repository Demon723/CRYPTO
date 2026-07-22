import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
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

@ApiTags('Transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

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
}
