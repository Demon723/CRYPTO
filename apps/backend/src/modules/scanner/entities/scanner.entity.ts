export interface SmartContractAnalysis {
  id: string;
  address: string;
  chain: string;
  contractName?: string;
  compilerVersion?: string;
  optimizationEnabled?: boolean;
  isVerified: boolean;
  riskScore: number;
  riskLevel: RiskLevel;
  summary: string;
  findings: Finding[];
  permissions: PermissionAnalysis;
  ownership: OwnershipAnalysis;
  tokenomics?: TokenomicsAnalysis;
  aiExplanation?: string;
  analyzedAt: Date;
  createdAt: Date;
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface Finding {
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  lineNumber?: number;
  source?: string;
}

export interface PermissionAnalysis {
  owner: string;
  canMint: boolean;
  canBurn: boolean;
  canPause: boolean;
  canBlacklist: boolean;
  canUpgrade: boolean;
  hasProxy: boolean;
  maxSupply?: string;
  transferRestricted: boolean;
}

export interface OwnershipAnalysis {
  currentOwner: string;
  isOwnershipRenounced: boolean;
  ownershipRenouncedAt?: Date;
  previousOwners: string[];
  timelockEnabled: boolean;
  timelockDelay?: number;
}

export interface TokenomicsAnalysis {
  totalSupply: string;
  circulatingSupply: string;
  maxSupply?: string;
  tokenAllocation: Array<{ address: string; percentage: number; label?: string }>;
  isMintable: boolean;
  isBurnable: boolean;
  hasDeflationaryMechanism: boolean;
}

export interface AnalyzeContractDto {
  address: string;
  chain: string;
  includeAiExplanation?: boolean;
}
