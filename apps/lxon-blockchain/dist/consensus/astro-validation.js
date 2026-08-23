"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAstroBlock = validateAstroBlock;
exports.validateAstroTransaction = validateAstroTransaction;
exports.getAstroDeadlineHeight = getAstroDeadlineHeight;
const astro_config_1 = require("../astro-config");
function validateAstroBlock(blockTime, genesisTime, astroDeadlineHeight, currentHeight, transactions) {
    const phase = (0, astro_config_1.getCurrentPhase)(genesisTime, blockTime);
    const { classicalId, arcId } = (0, astro_config_1.getCurrentSignatureAlgorithm)(blockTime);
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
function validateAstroTransaction(tx, phase, algorithmId) {
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
function getAstroDeadlineHeight(blocksPerYear) {
    return blocksPerYear * 20;
}
