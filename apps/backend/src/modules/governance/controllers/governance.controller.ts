import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { GovernanceService } from '../services/governance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUserId } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../../common/enums';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProposalStatus, VoteType } from '../entities/governance.entity';

@ApiTags('Governance')
@Controller('governance')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GovernanceController {
  constructor(private readonly governanceService: GovernanceService) {}

  @Get('proposals')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get active governance proposals' })
  @ApiQuery({ name: 'status', required: false, enum: ProposalStatus })
  @ApiResponse({ status: 200, description: 'Proposals retrieved' })
  getProposals(@CurrentUserId() userId: string, @Query('status') status?: ProposalStatus) {
    return this.governanceService.getProposals(userId, status);
  }

  @Post('proposals/vote')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Vote on a proposal' })
  @ApiResponse({ status: 200, description: 'Vote cast successfully' })
  vote(
    @CurrentUserId() userId: string,
    @Body() body: { proposalId: string; voteType: VoteType },
  ) {
    return this.governanceService.vote(userId, body.proposalId, body.voteType);
  }

  @Post('proposals')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Create a new governance proposal' })
  @ApiResponse({ status: 201, description: 'Proposal created' })
  createProposal(@CurrentUserId() userId: string, @Body() body: {
    title: string;
    description: string;
    type: string;
  }) {
    return this.governanceService.createProposal(userId, body);
  }

  @Get('voting-power')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get user voting power' })
  @ApiResponse({ status: 200, description: 'Voting power retrieved' })
  getVotingPower(@CurrentUserId() userId: string) {
    return this.governanceService.getUserVotingPower(userId);
  }
}
