import type { AstroAlgorithmId } from '../crypto/encode';
import type { Transaction } from '../block-stm';
export interface AstroBlockValidationResult {
    valid: boolean;
    reason?: string;
    phase: number;
}
export declare function validateAstroBlock(blockTime: number, genesisTime: number, astroDeadlineHeight: number, currentHeight: number, transactions: Transaction[]): AstroBlockValidationResult;
export declare function validateAstroTransaction(tx: Transaction, phase: number, algorithmId: AstroAlgorithmId): boolean;
export declare function getAstroDeadlineHeight(blocksPerYear: number): number;
