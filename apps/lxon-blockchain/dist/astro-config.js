"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SIGNATURE_ALGORITHM_LADDER = exports.HASH_ALGORITHM_LADDER = exports.ASTRO_PHASES = void 0;
exports.getCurrentPhase = getCurrentPhase;
exports.getCurrentHashAlgorithm = getCurrentHashAlgorithm;
exports.getCurrentSignatureAlgorithm = getCurrentSignatureAlgorithm;
exports.ASTRO_PHASES = {
    HYBRID_END: 10 * 365 * 24 * 60 * 60,
    TRANSITION_END: 20 * 365 * 24 * 60 * 60,
    ARCV2_START: 50 * 365 * 24 * 60 * 60,
};
exports.HASH_ALGORITHM_LADDER = [
    { era: '2026-2040', algorithm: 'SHA3-256', id: 0x01, security: 128 },
    { era: '2040-2060', algorithm: 'Blake3-256', id: 0x02, security: 128 },
    { era: '2060-2080', algorithm: 'SHA3-512', id: 0x03, security: 256 },
    { era: '2080-2100', algorithm: 'TBD', id: 0xFF, security: 256 },
    { era: '2100+', algorithm: 'TBD', id: 0xFF, security: 512 },
];
exports.SIGNATURE_ALGORITHM_LADDER = [
    { era: '2026-2040', algorithm: 'Hybrid ECDSA+NFS-512', classicalId: 0x01, arcId: 0x04, pubSize: 930, sigSize: 730 },
    { era: '2040-2060', algorithm: 'Hybrid ECDSA+SLS-65', classicalId: 0x01, arcId: 0x03, pubSize: 2000, sigSize: 2400 },
    { era: '2060-2080', algorithm: 'SLS-only', classicalId: 0x00, arcId: 0x03, pubSize: 1952, sigSize: 3293 },
    { era: '2080-2100', algorithm: 'SLS-V', classicalId: 0x00, arcId: 0x02, pubSize: 3500, sigSize: 5000 },
    { era: '2100+', algorithm: 'TBD', classicalId: 0x00, arcId: 0xFF, pubSize: 0, sigSize: 0 },
];
function getCurrentPhase(genesisTime, blockTime) {
    const age = blockTime - genesisTime;
    if (age < exports.ASTRO_PHASES.HYBRID_END)
        return 0;
    if (age < exports.ASTRO_PHASES.TRANSITION_END)
        return 1;
    if (age < exports.ASTRO_PHASES.ARCV2_START)
        return 2;
    return 3;
}
function getCurrentHashAlgorithm(blockTime) {
    const year = blockTime ? new Date(blockTime).getUTCFullYear() : new Date().getUTCFullYear();
    if (year < 2040)
        return 0x01;
    if (year < 2060)
        return 0x02;
    if (year < 2080)
        return 0x03;
    return 0xFF;
}
function getCurrentSignatureAlgorithm(blockTime) {
    const year = blockTime ? new Date(blockTime).getUTCFullYear() : new Date().getUTCFullYear();
    if (year < 2040)
        return { classicalId: 0x01, arcId: 0x04 };
    if (year < 2060)
        return { classicalId: 0x01, arcId: 0x03 };
    if (year < 2080)
        return { classicalId: 0x00, arcId: 0x03 };
    if (year < 2100)
        return { classicalId: 0x00, arcId: 0x02 };
    return { classicalId: 0x00, arcId: 0xFF };
}
