// @ts-nocheck
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/modules/prisma.service';
import { HttpService } from '../../common/modules/http.service';
import { SmartContractAnalysis, Finding, PermissionAnalysis, OwnershipAnalysis, AnalyzeContractDto } from '../entities/scanner.entity';
import { Chain } from '../../wallets/entities/wallet.entity';
import { AiService } from '../../ai/services/ai.service';
import { LoggerService } from '../../common/modules/logger.service';

@Injectable()
export class ScannerService {
  private readonly logger = new LoggerService();

  private readonly explorerUrls: Record<Chain, string> = {
    [Chain.ETHEREUM]: 'https://api.etherscan.io/api',
    [Chain.POLYGON]: 'https://api.polygonscan.com/api',
    [Chain.BSC]: 'https://api.bscscan.com/api',
    [Chain.ARBITRUM]: 'https://api.arbiscan.io/api',
    [Chain.BASE]: 'https://api.basescan.org/api',
    [Chain.AVALANCHE]: 'https://api.snowtrace.io/api',
    [Chain.LXON]: 'https://explorer.lxonevm.com/api',
  };

  private readonly apiKeys: Record<Chain, string | undefined> = {
    [Chain.ETHEREUM]: process.env.ETHERSCAN_API_KEY,
    [Chain.POLYGON]: process.env.POLYGONSCAN_API_KEY,
    [Chain.BSC]: process.env.BSCSCAN_API_KEY,
    [Chain.ARBITRUM]: process.env.ARBISCAN_API_KEY,
    [Chain.BASE]: process.env.BASESCAN_API_KEY,
    [Chain.AVALANCHE]: process.env.SNOWTRACE_API_KEY,
    [Chain.LXON]: process.env.LXONSCAN_API_KEY,
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly aiService: AiService,
  ) {}

  async analyzeContract(dto: AnalyzeContractDto): Promise<SmartContractAnalysis> {
    const normalizedAddress = dto.address.toLowerCase();
    const chain = dto.chain as Chain;

    let analysis = await this.prisma.token.findFirst({
      where: { address: normalizedAddress },
    });

    if (!analysis) {
      analysis = await this.prisma.token.create({
        data: {
          address: normalizedAddress,
          chain,
          symbol: 'UNKNOWN',
          name: 'Unknown Contract',
          decimals: 18,
          lastUpdated: new Date(),
        },
      });
    }

    const contractInfo = await this.fetchContractInfo(normalizedAddress, chain);
    const findings = await this.performStaticAnalysis(normalizedAddress, chain, contractInfo);
    const permissions = await this.analyzePermissions(normalizedAddress, chain, contractInfo);
    const ownership = await this.analyzeOwnership(normalizedAddress, chain, contractInfo);
    const riskScore = this.calculateRiskScore(findings, permissions, ownership);
    const riskLevel = this.getRiskLevel(riskScore);
    const summary = this.generateSummary(findings, riskLevel);

    let aiExplanation;
    if (dto.includeAiExplanation) {
      try {
        aiExplanation = await this.aiService.detectScam(normalizedAddress, chain);
      } catch (error) {
        this.logger.warn(`AI explanation failed: ${error.message}`, 'ScannerService');
      }
    }

    const updated = await this.prisma.token.update({
      where: { address: normalizedAddress },
      data: {
        riskScore,
        riskFactors: {
          findings,
          permissions,
          ownership,
          summary,
        },
        lastUpdated: new Date(),
      },
    });

    return {
      id: updated.id,
      address: updated.address,
      chain: updated.chain,
      contractName: contractInfo.contractName,
      compilerVersion: contractInfo.compilerVersion,
      optimizationEnabled: contractInfo.optimizationEnabled,
      isVerified: contractInfo.isVerified,
      riskScore,
      riskLevel,
      summary,
      findings,
      permissions,
      ownership,
      aiExplanation,
      analyzedAt: new Date(),
      createdAt: updated.createdAt,
    };
  }

  async getAnalysis(address: string, chain: Chain): Promise<SmartContractAnalysis | null> {
    const normalizedAddress = address.toLowerCase();

    const analysis = await this.prisma.token.findFirst({
      where: { address: normalizedAddress, chain },
    });

    if (!analysis || !analysis.riskFactors) {
      return null;
    }

    const riskFactors = analysis.riskFactors as {
      findings: Finding[];
      permissions: PermissionAnalysis;
      ownership: OwnershipAnalysis;
      summary: string;
    };

    return {
      id: analysis.id,
      address: analysis.address,
      chain: analysis.chain,
      contractName: analysis.name,
      isVerified: analysis.isVerified,
      riskScore: analysis.riskScore || 0,
      riskLevel: this.getRiskLevel(analysis.riskScore || 0),
      summary: riskFactors.summary,
      findings: riskFactors.findings,
      permissions: riskFactors.permissions,
      ownership: riskFactors.ownership,
      analyzedAt: analysis.lastUpdated,
      createdAt: analysis.createdAt,
    };
  }

  async getRecentAnalyses(limit = 20): Promise<SmartContractAnalysis[]> {
    const analyses = await this.prisma.token.findMany({
      where: { riskScore: { not: null } },
      orderBy: { lastUpdated: 'desc' },
      take: limit,
    });

    return analyses.map((a) => {
      const riskFactors = a.riskFactors as {
        findings: Finding[];
        permissions: PermissionAnalysis;
        ownership: OwnershipAnalysis;
        summary: string;
      } || { findings: [], permissions: {} as PermissionAnalysis, ownership: {} as OwnershipAnalysis, summary: '' };

      return {
        id: a.id,
        address: a.address,
        chain: a.chain,
        contractName: a.name,
        isVerified: a.isVerified,
        riskScore: a.riskScore || 0,
        riskLevel: this.getRiskLevel(a.riskScore || 0),
        summary: riskFactors.summary,
        findings: riskFactors.findings,
        permissions: riskFactors.permissions,
        ownership: riskFactors.ownership,
        analyzedAt: a.lastUpdated,
        createdAt: a.createdAt,
      };
    });
  }

  private async fetchContractInfo(address: string, chain: Chain) {
    const baseUrl = this.explorerUrls[chain];
    const apiKey = this.apiKeys[chain];

    if (!apiKey || !baseUrl) {
      return {
        contractName: 'Unknown',
        compilerVersion: 'Unknown',
        optimizationEnabled: false,
        isVerified: false,
        sourceCode: '',
        abi: null,
      };
    }

    try {
      const response = await this.httpService
        .getAxiosInstance()
        .get(baseUrl, {
          params: {
            module: 'contract',
            action: 'getsourcecode',
            address,
            apikey: apiKey,
          },
        });

      const result = response.data.result[0];

      return {
        contractName: result?.ContractName || 'Unknown',
        compilerVersion: result?.CompilerVersion || 'Unknown',
        optimizationEnabled: result?.OptimizationUsed === '1',
        isVerified: result?.SourceCode && result.SourceCode.trim() !== '',
        sourceCode: result?.SourceCode || '',
        abi: result?.ABI,
      };
    } catch (error) {
      this.logger.warn(`Failed to fetch contract info: ${error.message}`, 'ScannerService');
      return {
        contractName: 'Unknown',
        compilerVersion: 'Unknown',
        optimizationEnabled: false,
        isVerified: false,
        sourceCode: '',
        abi: null,
      };
    }
  }

  private async performStaticAnalysis(address: string, chain: Chain, contractInfo: Record<string, unknown>): Promise<Finding[]> {
    const findings: Finding[] = [];
    const sourceCode = (contractInfo.sourceCode as string) || '';

    if (!contractInfo.isVerified) {
      findings.push({
        category: 'Verification',
        severity: 'high',
        title: 'Contract Not Verified',
        description: 'The smart contract source code is not verified on the block explorer.',
        recommendation: 'Only interact with verified contracts. Unverified contracts may contain hidden malicious code.',
      });
    }

    const highRiskPatterns = [
      { pattern: /selfdestruct|suicide/i, title: 'Selfdestruct Function', severity: 'critical' as const, desc: 'Contract contains selfdestruct functionality.' },
      { pattern: /delegatecall/i, title: 'Delegatecall Usage', severity: 'high' as const, desc: 'Contract uses delegatecall which can be dangerous.' },
      { pattern: /tx\.origin/i, title: 'tx.origin Usage', severity: 'high' as const, desc: 'Contract uses tx.origin for authorization, which is vulnerable to phishing.' },
      { pattern: /function\s+setOwner|function\s+transferOwnership|function\s+renounceOwnership/i, title: 'Ownership Functions', severity: 'medium' as const, desc: 'Contract contains ownership transfer functions.' },
      { pattern: /mint\s*\(/i, title: 'Mint Function', severity: 'medium' as const, desc: 'Contract has minting capabilities.' },
      { pattern: /pause\s*\(|unpause\s*\(/i, title: 'Pausable Functions', severity: 'low' as const, desc: 'Contract has pausable functionality.' },
      { pattern: /blacklist|exclude|whitelist/i, title: 'Blacklist/Whitelist', severity: 'medium' as const, desc: 'Contract may have address restrictions.' },
      { pattern: /onlyOwner|onlyAdmin/i, title: 'Access Control', severity: 'low' as const, desc: 'Contract uses owner/admin access control.' },
    ];

    for (const { pattern, title, severity, desc } of highRiskPatterns) {
      if (pattern.test(sourceCode)) {
        findings.push({
          category: 'Code Analysis',
          severity,
          title,
          description: desc,
          recommendation: this.getRecommendation(title),
        });
      }
    }

    return findings;
  }

  private async analyzePermissions(address: string, chain: Chain, contractInfo: Record<string, unknown>): Promise<PermissionAnalysis> {
    const sourceCode = (contractInfo.sourceCode as string) || '';
    const abi = contractInfo.abi as Record<string, unknown>[] | null;

    return {
      owner: 'Unknown',
      canMint: /mint\s*\(/i.test(sourceCode),
      canBurn: /burn\s*\(/i.test(sourceCode),
      canPause: /pause\s*\(/i.test(sourceCode),
      canBlacklist: /blacklist|exclude/i.test(sourceCode),
      canUpgrade: /upgrade|upgradeTo/i.test(sourceCode),
      hasProxy: /delegatecall|eip-1822|transparent|uups/i.test(sourceCode),
      transferRestricted: /onlyOwner|onlyAdmin|require.*approved/i.test(sourceCode),
    };
  }

  private async analyzeOwnership(address: string, chain: Chain, contractInfo: Record<string, unknown>): Promise<OwnershipAnalysis> {
    const sourceCode = (contractInfo.sourceCode as string) || '';

    return {
      currentOwner: 'Unknown',
      isOwnershipRenounced: /renounceOwnership|transferOwnership.*zero|owner\s*=\s*address\(0\)/i.test(sourceCode),
      ownershipRenouncedAt: undefined,
      previousOwners: [],
      timelockEnabled: /timelock|delay|minDelay/i.test(sourceCode),
      timelockDelay: undefined,
    };
  }

  private calculateRiskScore(findings: Finding[], permissions: PermissionAnalysis, ownership: OwnershipAnalysis): number {
    let score = 0;

    const severityWeights: Record<string, number> = {
      low: 10,
      medium: 25,
      high: 50,
      critical: 100,
    };

    for (const finding of findings) {
      score += severityWeights[finding.severity] || 0;
    }

    if (permissions.canMint) score += 15;
    if (permissions.canPause) score += 10;
    if (permissions.canBlacklist) score += 20;
    if (permissions.hasProxy) score += 25;
    if (permissions.transferRestricted) score += 15;

    if (!ownership.isOwnershipRenounced) score += 20;
    if (!ownership.timelockEnabled) score += 10;

    return Math.min(100, Math.max(0, score));
  }

  private getRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (score < 30) return 'LOW';
    if (score < 60) return 'MEDIUM';
    if (score < 80) return 'HIGH';
    return 'CRITICAL';
  }

  private generateSummary(findings: Finding[], riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): string {
    const criticalCount = findings.filter((f) => f.severity === 'critical').length;
    const highCount = findings.filter((f) => f.severity === 'high').length;
    const mediumCount = findings.filter((f) => f.severity === 'medium').length;

    let summary = `Risk Level: ${riskLevel}. `;
    summary += `Found ${findings.length} issues (${criticalCount} critical, ${highCount} high, ${mediumCount} medium). `;

    if (riskLevel === 'CRITICAL') {
      summary += 'This contract has critical security issues. Do not interact.';
    } else if (riskLevel === 'HIGH') {
      summary += 'This contract has high-risk issues. Exercise extreme caution.';
    } else if (riskLevel === 'MEDIUM') {
      summary += 'This contract has medium-risk issues. Proceed with caution.';
    } else {
      summary += 'This contract appears relatively safe based on static analysis.';
    }

    return summary;
  }

  private getRecommendation(title: string): string {
    const recommendations: Record<string, string> = {
      'Selfdestruct Function': 'Avoid interacting with contracts that can self-destruct. This can lead to complete loss of funds.',
      'Delegatecall Usage': 'Ensure delegatecall is used safely with proper input validation and trusted contracts only.',
      'tx.origin Usage': 'Contracts using tx.origin are vulnerable to phishing attacks. Use msg.sender instead.',
      'Ownership Functions': 'Verify ownership is renounced or controlled by a multisig/timelock.',
      'Mint Function': 'Check minting capabilities. Unlimited minting can lead to inflation.',
      'Pausable Functions': 'Ensure pause functionality is used responsibly and not to lock funds.',
      'Blacklist/Whitelist': 'Review address restriction mechanisms. Ensure they are transparent and fair.',
    };

    return recommendations[title] || 'Review this finding carefully before interacting with the contract.';
  }
}
