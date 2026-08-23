"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runBatchARCBenchmark = runBatchARCBenchmark;
exports.runBatchARCSimulation = runBatchARCSimulation;
const astro_wallet_1 = require("../wallet/astro-wallet");
async function runBatchARCBenchmark(count = 1000) {
    const wallets = Array.from({ length: count }, () => (0, astro_wallet_1.generateAstroWallet)());
    const message = new Uint8Array(32);
    const signatures = [];
    for (const wallet of wallets) {
        const sig = (0, astro_wallet_1.signAstroTransaction)(wallet, message);
        signatures.push({
            classicalPublicKey: wallet.astroKeypair.classicalPublicKey,
            arcPublicKey: wallet.astroKeypair.arcPublicKey,
            classicalSigHex: Buffer.from(sig.classicalSig).toString('hex'),
            arcSigma: sig.arcSigma,
        });
    }
    const start = process.hrtime.bigint();
    let valid = 0;
    let invalid = 0;
    for (const sig of signatures) {
        const result = (0, astro_wallet_1.verifyAstroSignature)(sig.classicalPublicKey, sig.arcPublicKey, message, sig.classicalSigHex, sig.arcSigma, 0x04);
        if (result)
            valid++;
        else
            invalid++;
    }
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;
    const perSignatureUs = durationMs / count * 1000;
    return {
        total: count,
        valid,
        invalid,
        durationMs,
        perSignatureUs,
    };
}
async function runBatchARCSimulation() {
    console.log('================================================================');
    console.log('BENCHMARK: Batch ARC Signature Verification');
    console.log('================================================================');
    const counts = [100, 500, 1000, 5000];
    for (const count of counts) {
        const result = await runBatchARCBenchmark(count);
        console.log(`\nBatch size: ${result.total}`);
        console.log(`  Valid: ${result.valid}, Invalid: ${result.invalid}`);
        console.log(`  Duration: ${result.durationMs.toFixed(2)} ms`);
        console.log(`  Per signature: ${result.perSignatureUs.toFixed(2)} µs`);
    }
}
runBatchARCSimulation();
