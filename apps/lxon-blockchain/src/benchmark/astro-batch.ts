import { generateAstroWallet, signAstroTransaction, verifyAstroSignature } from '../wallet/astro-wallet';

export interface BatchVerificationResult {
  total: number;
  valid: number;
  invalid: number;
  durationMs: number;
  perSignatureUs: number;
}

export async function runBatchARCBenchmark(count: number = 1000): Promise<BatchVerificationResult> {
  const wallets = Array.from({ length: count }, () => generateAstroWallet());
  const message = new Uint8Array(32);
  
  const signatures: Array<{
    classicalPublicKey: Uint8Array;
    arcPublicKey: Uint8Array;
    classicalSigHex: string;
    arcSigma: Uint8Array;
  }> = [];
  
  for (const wallet of wallets) {
    const sig = signAstroTransaction(wallet, message);
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
    const result = verifyAstroSignature(
      sig.classicalPublicKey,
      sig.arcPublicKey,
      message,
      sig.classicalSigHex,
      sig.arcSigma,
      0x04
    );
    if (result) valid++;
    else invalid++;
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

export async function runBatchARCSimulation(): Promise<void> {
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
