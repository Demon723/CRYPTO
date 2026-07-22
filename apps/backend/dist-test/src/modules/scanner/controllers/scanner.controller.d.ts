import { ScannerService } from '../services/scanner.service';
import { AnalyzeContractDto } from '../entities/scanner.entity';
import { Chain } from '../../wallets/entities/wallet.entity';
export declare class ScannerController {
    private readonly scannerService;
    constructor(scannerService: ScannerService);
    analyzeContract(userId: string, dto: AnalyzeContractDto): Promise<import("../entities/scanner.entity").SmartContractAnalysis>;
    getAnalysis(address: string, chain: Chain): Promise<import("../entities/scanner.entity").SmartContractAnalysis>;
    getRecentAnalyses(limit?: number): Promise<import("../entities/scanner.entity").SmartContractAnalysis[]>;
}
