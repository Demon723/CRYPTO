import {
  Controller,
  Post,
  Get,
  Query,
  Param,
  UseGuards,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ScannerService } from '../services/scanner.service';
import { AnalyzeContractDto } from '../entities/scanner.entity';
import { Chain } from '../../wallets/entities/wallet.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUserId } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../../common/enums';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Smart Contract Analyzer')
@Controller('scanner')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ScannerController {
  constructor(private readonly scannerService: ScannerService) {}

  @Post('analyze')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Analyze a smart contract for security risks' })
  @ApiQuery({ name: 'includeAiExplanation', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Analysis completed' })
  @ApiResponse({ status: 400, description: 'Invalid contract address' })
  analyzeContract(@CurrentUserId() userId: string, @Body() dto: AnalyzeContractDto) {
    return this.scannerService.analyzeContract(dto);
  }

  @Get('analysis/:address')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get existing contract analysis' })
  @ApiQuery({ name: 'chain', required: true, enum: ['ETHEREUM', 'POLYGON', 'BSC', 'ARBITRUM', 'BASE', 'AVALANCHE'] })
  @ApiResponse({ status: 200, description: 'Analysis retrieved' })
  @ApiResponse({ status: 404, description: 'Analysis not found' })
  getAnalysis(@Param('address') address: string, @Query('chain') chain: Chain) {
    return this.scannerService.getAnalysis(address, chain);
  }

  @Get('recent')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get recent contract analyses' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Recent analyses retrieved' })
  getRecentAnalyses(@Query('limit') limit?: number) {
    return this.scannerService.getRecentAnalyses(limit);
  }
}
