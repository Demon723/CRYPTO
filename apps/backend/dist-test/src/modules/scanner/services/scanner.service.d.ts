import { PrismaService } from '../../common/modules/prisma.service';
import { HttpService } from '../../common/modules/http.service';
import { SmartContractAnalysis, AnalyzeContractDto } from '../entities/scanner.entity';
import { Chain } from '../../wallets/entities/wallet.entity';
import { AiService } from '../../ai/services/ai.service';
export declare class ScannerService {
    private readonly prisma;
    private readonly httpService;
    private readonly aiService;
    private readonly logger;
    private readonly explorerUrls;
    private readonly apiKeys;
    constructor(prisma: PrismaService, httpService: HttpService, aiService: AiService);
    analyzeContract(dto: AnalyzeContractDto): Promise<SmartContractAnalysis>;
    getAnalysis(address: string, chain: Chain): Promise<SmartContractAnalysis | null>;
    getRecentAnalyses(limit?: number): Promise<SmartContractAnalysis[]>;
    private fetchContractInfo;
    private performStaticAnalysis;
    private analyzePermissions;
    private analyzeOwnership;
    private calculateRiskScore;
    private getRiskLevel;
    private generateSummary;
    private getRecommendation;
}
