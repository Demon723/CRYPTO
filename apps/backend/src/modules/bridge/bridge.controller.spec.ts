import { Test, TestingModule } from '@nestjs/testing';
import { BridgeController } from './bridge.controller';
import { BridgeService } from './bridge.service';

describe('BridgeController', () => {
  let controller: BridgeController;
  let service: BridgeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BridgeController],
      providers: [BridgeService],
    }).compile();

    controller = module.get<BridgeController>(BridgeController);
    service = module.get<BridgeService>(BridgeService);
  });

  describe('getSupportedChains', () => {
    it('should return supported chains', () => {
      const chains = controller.getSupportedChains();
      expect(Array.isArray(chains)).toBe(true);
      expect(chains.length).toBeGreaterThan(0);
    });
  });

  describe('getSupportedTokens', () => {
    it('should return supported tokens', () => {
      const tokens = controller.getSupportedTokens();
      expect(Array.isArray(tokens)).toBe(true);
      expect(tokens.length).toBeGreaterThan(0);
    });
  });

  describe('estimateFee', () => {
    it('should estimate fee for valid parameters', async () => {
      const result = await controller.estimateFee({
        fromChainId: 199,
        toChainId: 1,
        amount: '100',
      });
      expect(result.fee).toBeDefined();
      expect(parseFloat(result.fee)).toBeGreaterThan(0);
    });
  });

  describe('initiateTransfer', () => {
    it('should initiate a transfer', async () => {
      const result = await controller.initiateTransfer(
        { user: { id: 'test-user' } } as any,
        {
          fromChainId: 199,
          toChainId: 1,
          tokenSymbol: 'LXON',
          amount: '10',
          recipient: '0x456',
        }
      );
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });
  });

  describe('getTransferStatus', () => {
    it('should return transfer status', async () => {
      const result = await controller.getTransferStatus('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('getTransferHistory', () => {
    it('should return transfer history for address', async () => {
      const result = await controller.getTransferHistory('0x123');
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
