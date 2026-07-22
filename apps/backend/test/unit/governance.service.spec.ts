import { Test, TestingModule } from '@nestjs/testing';
import { GovernanceService } from '../../src/modules/governance/services/governance.service';
import { PrismaService } from '../../src/modules/common/modules/prisma.service';
import { StakingService } from '../../src/modules/staking/services/staking.service';

describe('GovernanceService', () => {
  let service: GovernanceService;
  let prismaService: PrismaService;
  let stakingService: StakingService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        GovernanceService,
        {
          provide: PrismaService,
          useValue: {
            governanceVote: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
            },
            stakingPosition: {
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: StakingService,
          useValue: {
            calculateVotingPower: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get<GovernanceService>(GovernanceService);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
    stakingService = moduleRef.get<StakingService>(StakingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get proposals', async () => {
    const mockVotes = [
      {
        id: '1',
        proposalId: 'proposal-1',
        userId: 'user-1',
        choice: 'FOR',
        votingPower: '1000',
        createdAt: new Date(),
        user: { name: 'User', email: 'user@example.com' },
      },
    ];

    jest.spyOn(prismaService.governanceVote, 'findMany').mockResolvedValue(mockVotes as any);

    const result = await service.getProposals();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should cast a vote', async () => {
    const mockVote = {
      id: '1',
      userId: 'user-id',
      proposalId: 'proposal-1',
      choice: 'FOR',
      votingPower: '1000',
      createdAt: new Date(),
    };

    jest.spyOn(prismaService.governanceVote, 'findFirst').mockResolvedValue(null);
    jest.spyOn(prismaService.governanceVote, 'create').mockResolvedValue(mockVote as any);

    const result = await service.castVote('user-id', {
      proposalId: 'proposal-1',
      choice: 'FOR',
    });

    expect(result).toBeDefined();
    expect(result.proposalId).toBe('proposal-1');
  });
});
