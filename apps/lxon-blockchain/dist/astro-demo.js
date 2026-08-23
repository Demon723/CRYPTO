"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const encode_1 = require("./crypto/encode");
const astro_config_1 = require("./astro-config");
const monad_bft_1 = require("./consensus/monad-bft");
const astro_validation_1 = require("./consensus/astro-validation");
const now = Date.now();
const genesisTime = now - (5 * 365 * 24 * 60 * 60);
const astroSig = {
    version: 1,
    classicalSig: new Uint8Array(64),
    classicalPub: new Uint8Array(33),
    arcSigma: new Uint8Array(666),
    arcPubKey: new Uint8Array(897),
    algorithmId: encode_1.ASTRO_ALGORITHM.NFS512,
    ephemeralPubKey: new Uint8Array(32),
    nonce: 1n,
};
console.log('===== ASTRO-RESISTANT CRYPTOGRAPHY MODULE =====');
console.log(`Genesis Time: ${new Date(genesisTime).toISOString()}`);
console.log(`Current Time: ${new Date(now).toISOString()}`);
console.log('');
console.log('--- Astro Phase Timeline ---');
console.log(`Hybrid Period End: ${astro_config_1.ASTRO_PHASES.HYBRID_END / (365 * 24 * 60 * 60)} years`);
console.log(`Transition Period End: ${astro_config_1.ASTRO_PHASES.TRANSITION_END / (365 * 24 * 60 * 60)} years`);
console.log(`ARC v2 Start: ${astro_config_1.ASTRO_PHASES.ARCV2_START / (365 * 24 * 60 * 60)} years`);
console.log('');
console.log('--- Current Phase ---');
const phase = (0, astro_config_1.getCurrentPhase)(genesisTime, now);
console.log(`Current Phase: ${phase} (0=Hybrid, 1=Transition, 2=Astro-Only, 3=Astro-v2)`);
console.log(`Astro Signature Hash: ${(0, encode_1.hashAstroSignature)(astroSig)}`);
console.log('');
console.log('--- Hash Algorithm Ladder ---');
for (const entry of astro_config_1.HASH_ALGORITHM_LADDER) {
    const current = (0, astro_config_1.getCurrentHashAlgorithm)(now) === entry.id ? ' [CURRENT]' : '';
    console.log(`${entry.era}: ${entry.algorithm} (${entry.security}-bit)${current}`);
}
console.log('');
console.log('--- Signature Algorithm Ladder ---');
for (const entry of astro_config_1.SIGNATURE_ALGORITHM_LADDER) {
    const current = (0, astro_config_1.getCurrentSignatureAlgorithm)(now);
    const isCurrent = current.classicalId === entry.classicalId && current.arcId === entry.arcId;
    const marker = isCurrent ? ' [CURRENT]' : '';
    console.log(`${entry.era}: ${entry.algorithm} (pub=${entry.pubSize}B, sig=${entry.sigSize}B)${marker}`);
}
console.log('');
console.log('--- Astro Consensus Validation ---');
const validators = Array.from({ length: 4 }, (_, i) => `validator-${i}`);
const engine = new monad_bft_1.MonadBFTEngine(validators, 1000000n, genesisTime);
const blockTime = now;
const currentHeight = 1000;
const astroDeadlineHeight = 20 * 365 * 24 * 60 * 60;
const result = engine.validateAstroBlock(blockTime, currentHeight, []);
console.log(`Block validation result: ${result.valid ? 'VALID' : 'INVALID'}`);
console.log(`Phase: ${result.phase}`);
if (result.reason) {
    console.log(`Reason: ${result.reason}`);
}
console.log('');
console.log('--- Astro Transaction Validation ---');
const mockTx = { read_keys: [], astroProof: { ...astroSig, phase } };
const txValid = (0, astro_validation_1.validateAstroTransaction)(mockTx, phase, encode_1.ASTRO_ALGORITHM.NFS512);
console.log(`Transaction with NFS-512 hybrid signature valid for phase ${phase}: ${txValid}`);
