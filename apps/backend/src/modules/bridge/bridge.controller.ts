import { Controller, Post, Get, Body, Param, Request } from '@nestjs/common';
import { BridgeService } from './bridge.service';
import { BridgeTransfer, BridgeChain, BridgeToken, BridgeTransferRequest } from './bridge.types';

@Controller('bridge')
export class BridgeController {
  constructor(private readonly bridgeService: BridgeService) {}

  @Get('chains')
  getSupportedChains(): BridgeChain[] {
    return this.bridgeService.getSupportedChains();
  }

  @Get('tokens')
  getSupportedTokens(): BridgeToken[] {
    return this.bridgeService.getSupportedTokens();
  }

  @Post('transfer')
  async initiateTransfer(
    @Request() req: any,
    @Body() body: BridgeTransferRequest
  ): Promise<BridgeTransfer> {
    const userId = req.user?.id || 'anonymous';
    return this.bridgeService.initiateTransfer({
      fromChainId: body.fromChainId,
      toChainId: body.toChainId,
      tokenSymbol: body.tokenSymbol,
      amount: body.amount,
      recipient: body.recipient,
      sender: userId,
    });
  }

  @Get('transfer/:id')
  async getTransferStatus(@Param('id') id: string): Promise<BridgeTransfer | null> {
    return this.bridgeService.getTransferStatus(id);
  }

  @Get('history/:address')
  async getTransferHistory(@Param('address') address: string): Promise<BridgeTransfer[]> {
    return this.bridgeService.getTransferHistory(address);
  }

  @Post('estimate-fee')
  async estimateFee(
    @Body() body: { fromChainId: number; toChainId: number; amount: string }
  ): Promise<{ fee: string }> {
    const fee = await this.bridgeService.estimateFee(
      body.fromChainId,
      body.toChainId,
      body.amount
    );
    return { fee };
  }
}
