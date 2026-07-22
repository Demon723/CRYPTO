import { Injectable, BadRequestException } from '@nestjs/common';
import { Chain } from '../../wallets/entities/wallet.entity';

export interface ParsedIntent {
  action: 'send' | 'swap' | 'stake' | 'bridge' | 'unknown';
  fromChain?: Chain;
  toChain?: Chain;
  fromAddress?: string;
  toAddress?: string;
  amount?: string;
  token?: string;
  confidence: number;
}

@Injectable()
export class TransactionBuilderService {
  async parseNaturalLanguage(input: string): Promise<ParsedIntent> {
    const lower = input.toLowerCase().trim();

    // Detect send intent: "send 0.1 ETH to 0x..." or "transfer 500 USDC to vitalik"
    const sendMatch = lower.match(/send\s+([0-9.,]+\s*[a-zA-Z]*)\s+(?:to\s+)?(.+)/);
    if (sendMatch) {
      return {
        action: 'send',
        amount: sendMatch[1].trim(),
        toAddress: this.extractAddress(sendMatch[2]),
        confidence: 0.8,
      };
    }

    // Detect swap intent: "swap 1 ETH for USDC"
    const swapMatch = lower.match(/swap\s+([0-9.,]+\s*[a-zA-Z]*)\s+(?:for|to)\s+([a-zA-Z]+)/i);
    if (swapMatch) {
      return {
        action: 'swap',
        amount: swapMatch[1].trim(),
        token: swapMatch[2].trim().toUpperCase(),
        confidence: 0.7,
      };
    }

    // Detect stake intent: "stake 1000 LXON"
    const stakeMatch = lower.match(/stake\s+([0-9.,]+\s*[a-zA-Z]*)/i);
    if (stakeMatch) {
      return {
        action: 'stake',
        amount: stakeMatch[1].trim(),
        confidence: 0.7,
      };
    }

    // Detect bridge intent: "bridge 0.5 ETH from Ethereum to Polygon"
    const bridgeMatch = lower.match(/bridge\s+([0-9.,]+\s*[a-zA-Z]*)\s+from\s+(\w+)\s+to\s+(\w+)/i);
    if (bridgeMatch) {
      return {
        action: 'bridge',
        amount: bridgeMatch[1].trim(),
        fromChain: this.normalizeChain(bridgeMatch[2]),
        toChain: this.normalizeChain(bridgeMatch[3]),
        confidence: 0.6,
      };
    }

    return {
      action: 'unknown',
      confidence: 0,
    };
  }

  async buildTransaction(userId: string, intent: ParsedIntent): Promise<{
    preview: Record<string, unknown>;
    requiresConfirmation: boolean;
    warnings: string[];
  }> {
    if (intent.action === 'unknown') {
      throw new BadRequestException('Could not understand transaction intent. Try: "Send 0.1 ETH to 0x..."');
    }

    const preview: Record<string, unknown> = {
      action: intent.action,
      confidence: intent.confidence,
      requiresConfirmation: intent.confidence < 0.9,
      estimatedGas: '0.002 ETH',
    };

    const warnings: string[] = [];

    if (intent.confidence < 0.9) {
      warnings.push('Low confidence parsing. Please review the transaction details carefully.');
    }

    if (intent.action === 'send') {
      preview.amount = intent.amount || '0';
      preview.to = intent.toAddress || 'unknown';
      preview.token = intent.token || 'ETH';
    } else if (intent.action === 'swap') {
      preview.fromAmount = intent.amount || '0';
      preview.toToken = intent.token || 'UNKNOWN';
    } else if (intent.action === 'stake') {
      preview.amount = intent.amount || '0';
      preview.token = 'LXON';
    } else if (intent.action === 'bridge') {
      preview.amount = intent.amount || '0';
      preview.fromChain = intent.fromChain || 'ETHEREUM';
      preview.toChain = intent.toChain || 'UNKNOWN';
    }

    return { preview, requiresConfirmation: intent.confidence < 0.9, warnings };
  }

  private extractAddress(text: string): string | undefined {
    const ethAddress = text.match(/0x[a-fA-F0-9]{40}/);
    if (ethAddress) return ethAddress[0];
    return text.trim();
  }

  private normalizeChain(name: string): Chain | undefined {
    const map: Record<string, Chain> = {
      ethereum: Chain.ETHEREUM,
      polygon: Chain.POLYGON,
      bsc: Chain.BSC,
      arbitrum: Chain.ARBITRUM,
      base: Chain.BASE,
      avalanche: Chain.AVALANCHE,
      lxon: Chain.LXON,
    };
    return map[name.toLowerCase()];
  }
}
