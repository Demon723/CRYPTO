import { Test, TestingModule } from '@nestjs/testing';
import { TransactionBuilderService } from '../../src/modules/ai/services/transaction-builder.service';

describe('TransactionBuilderService', () => {
  let service: TransactionBuilderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransactionBuilderService],
    }).compile();

    service = module.get<TransactionBuilderService>(TransactionBuilderService);
  });

  it('should parse send intent', async () => {
    const result = await service.parseNaturalLanguage('send 0.1 ETH to 0x742d35cc6634c0532925a3b844bc9e7595f2bd38');
    expect(result.action).toBe('send');
    expect(result.amount).toBe('0.1 eth');
    expect(result.toAddress).toBe('0x742d35cc6634c0532925a3b844bc9e7595f2bd38');
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('should parse swap intent', async () => {
    const result = await service.parseNaturalLanguage('swap 1 ETH for USDC');
    expect(result.action).toBe('swap');
    expect(result.amount).toBe('1 eth');
    expect(result.token).toBe('USDC');
  });

  it('should parse stake intent', async () => {
    const result = await service.parseNaturalLanguage('stake 1000 LXON');
    expect(result.action).toBe('stake');
    expect(result.amount).toBe('1000 lxon');
  });

  it('should parse bridge intent', async () => {
    const result = await service.parseNaturalLanguage('bridge 0.5 ETH from Ethereum to Polygon');
    expect(result.action).toBe('bridge');
    expect(result.amount).toBe('0.5 eth');
    expect(result.fromChain).toBe('ETHEREUM');
    expect(result.toChain).toBe('POLYGON');
  });

  it('should return unknown for unrecognized intent', async () => {
    const result = await service.parseNaturalLanguage('hello world');
    expect(result.action).toBe('unknown');
    expect(result.confidence).toBe(0);
  });
});
