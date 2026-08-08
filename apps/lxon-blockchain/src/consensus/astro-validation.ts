import {
  ASTRO_PHASES,
  getCurrentPhase,
  getCurrentSignatureAlgorithm,
} from '../astro-config';
import type { AstroAlgorithmId } from '../crypto/encode';
import type { Transaction } from '../block-stm';

export interface AstroBlockValidationResult {
  valid: boolean;
  reason?: string;
  phase: number;
}

export function validateAstroBlock(
  blockTime: number,
  genesisTime: number,
  astroDeadlineHeight: number,
  currentHeight: number,
  transactions: Transaction[]
): AstroBlockValidationResult {
  const phase = getCurrentPhase(genesisTime, blockTime);
  const { classicalId, arcId } = getCurrentSignatureAlgorithm(blockTime);

  if (currentHeight > astroDeadlineHeight) {
    for (const tx of transactions) {
      const proof = tx.astroProof;
      if (!proof) {
        return { valid: false, reason: 'Missing astro proof after deadline', phase };
      }
      if (proof.algorithmId !== arcId) {
        return {
          valid: false,
          reason: `Deprecated ARC algorithm ${proof.algorithmId}, expected ${arcId}`,
          phase,
        };
      }
      if (phase >= 2 && proof.classicalSig.length > 0) {
        return { valid: false, reason: 'ECDSA deprecated in astro-only phase', phase };
      }
    }
  }

  return { valid: true, phase };
}

export function validateAstroTransaction(
  tx: Transaction,
  phase: number,
  algorithmId: AstroAlgorithmId
): boolean {
  const proof = tx.astroProof;
  if (!proof) {
    return phase === 0;
  }

  if (proof.algorithmId !== algorithmId) {
    return false;
  }

  if (phase >= 2 && proof.classicalSig.length > 0) {
    return false;
  }

  return true;
}

export function getAstroDeadlineHeight(blocksPerYear: number): number {
  return blocksPerYear * 20;
}
