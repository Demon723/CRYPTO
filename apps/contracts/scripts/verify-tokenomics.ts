import { ethers } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

function passFail(ok: boolean): string {
  return ok ? 'PASS' : 'FAIL';
}

async function main() {
  console.log('Verifying Enhanced LXON Tokenomics on Sepolia Testnet...\n');

  const deploymentPath = path.join(__dirname, '..', 'deployments', 'sepolia.json');
  if (!fs.existsSync(deploymentPath)) {
    console.error('Deployment file not found. Please deploy first.');
    process.exit(1);
  }

  const deploymentAddresses = JSON.parse(fs.readFileSync(deploymentPath, 'utf8')) as {
    lxonToken?: string;
    buybackBurn?: string;
    deployer?: string;
    governance?: string;
  };

  if (!deploymentAddresses.lxonToken) {
    console.error('lxonToken missing from deployment file.');
    process.exit(1);
  }

  console.log('Contract Addresses:');
  console.log('  LXON Token:', deploymentAddresses.lxonToken);
  if (deploymentAddresses.buybackBurn) {
    console.log('  Buyback:', deploymentAddresses.buybackBurn);
  }
  console.log();

  const [signer] = await ethers.getSigners();
  const token = await ethers.getContractAt('LXONNativeToken', deploymentAddresses.lxonToken);
  const results: boolean[] = [];

  console.log('Verification 1: Emission Parameters');
  const dailyEmission = await token.DAILY_EMISSION_INITIAL();
  const declineRate = await token.EMISSION_DECLINE_RATE();
  const duration = await token.EMISSION_DURATION();

  const emissionPass = dailyEmission === ethers.parseEther('5000');
  const declinePass = declineRate === ethers.parseEther('100');
  const durationPass = duration === BigInt(10 * 365 * 24 * 60 * 60);
  results.push(emissionPass, declinePass, durationPass);

  console.log('  Initial Daily Emission:', ethers.formatEther(dailyEmission), 'LXON');
  console.log('  Expected: 5,000 LXON');
  console.log('  Status:', passFail(emissionPass));

  console.log('  Emission Decline Rate:', ethers.formatEther(declineRate), 'LXON/day');
  console.log('  Expected: 100 LXON/day');
  console.log('  Status:', passFail(declinePass));

  console.log('  Emission Duration:', Number(duration) / (24 * 60 * 60), 'days');
  console.log('  Expected: 3650 days (10 years)');
  console.log('  Status:', passFail(durationPass));
  console.log();

  console.log('Verification 2: Transaction Burn Fee');
  const burnFee = await token.transferBurnFee();
  const burnFeePercent = (burnFee * 100n) / 1000n;
  const burnPass = burnFee === 10n;
  results.push(burnPass);

  console.log('  Burn Fee:', burnFee.toString(), '/ 1000');
  console.log('  Percentage:', burnFeePercent.toString(), '%');
  console.log('  Expected: 1%');
  console.log('  Status:', passFail(burnPass));
  console.log();

  console.log('Verification 3: Tiered Staking Configuration');
  const expectedTiers: Record<number, { lock: bigint; rate: bigint; multiplier: bigint }> = {
    1: { lock: BigInt(30 * 24 * 60 * 60), rate: 5n, multiplier: 100n },
    2: { lock: BigInt(90 * 24 * 60 * 60), rate: 8n, multiplier: 150n },
    3: { lock: BigInt(180 * 24 * 60 * 60), rate: 12n, multiplier: 200n },
    4: { lock: BigInt(365 * 24 * 60 * 60), rate: 18n, multiplier: 300n }
  };

  let tiersPass = true;
  for (let tier = 1; tier <= 4; tier++) {
    const tierConfig = await token.tierConfigs(tier);
    const expected = expectedTiers[tier];
    const ok =
      tierConfig.lockPeriod === expected.lock &&
      tierConfig.rewardRate === expected.rate &&
      tierConfig.multiplier === expected.multiplier;
    tiersPass = tiersPass && ok;
    console.log(`  Tier ${tier}:`);
    console.log('    Lock Period:', Number(tierConfig.lockPeriod) / (24 * 60 * 60), 'days');
    console.log('    Reward Rate:', tierConfig.rewardRate.toString(), '%');
    console.log('    Multiplier:', (Number(tierConfig.multiplier) / 100).toFixed(1), 'x');
    console.log('    Status:', passFail(ok));
  }
  results.push(tiersPass);
  console.log();

  console.log('Verification 4: Buyback Configuration');
  let buybackPass = true; // Optional for now
  if (!deploymentAddresses.buybackBurn) {
    console.log('  Status: SKIPPED (buyback not deployed - requires separate deployment)');
  } else {
    const buybackContract = await ethers.getContractAt(
      'LXONBuybackBurn',
      deploymentAddresses.buybackBurn
    );
    const buybackThreshold = await buybackContract.buybackThreshold();
    const buybackPercentage = await buybackContract.buybackPercentage();
    const buybackEnabled = await buybackContract.buybackEnabled();
    const treasury = await buybackContract.treasury();

    const thresholdPass = buybackThreshold === ethers.parseEther('0.01');
    const percentagePass = buybackPercentage === 10n;
    const enabledPass = buybackEnabled === true;
    buybackPass = thresholdPass && percentagePass && enabledPass;
    results.push(thresholdPass, percentagePass, enabledPass);

    console.log('  Buyback Threshold:', ethers.formatEther(buybackThreshold), 'ETH');
    console.log('  Expected: 0.01 ETH');
    console.log('  Status:', passFail(thresholdPass));

    console.log('  Buyback Percentage:', buybackPercentage.toString(), '%');
    console.log('  Expected: 10%');
    console.log('  Status:', passFail(percentagePass));

    console.log('  Buyback Enabled:', buybackEnabled);
    console.log('  Expected: true');
    console.log('  Status:', passFail(enabledPass));

    console.log('  Treasury:', treasury);
  }
  console.log();

  console.log('Verification 5: Mint Authorities');
  const mintAuthority = await token.mintAuthority();
  const mintPass = mintAuthority.toLowerCase() === signer.address.toLowerCase();
  results.push(mintPass);

  console.log('  Mint Authority:', mintAuthority);
  console.log('  Deployer:', signer.address);
  console.log('  Status:', passFail(mintPass));
  console.log();

  console.log('Verification 6: Token Supply');
  const totalSupply = await token.totalSupply();
  const maxSupply = await token.MAX_SUPPLY();
  const totalEmitted = await token.totalEmitted();
  const totalBurned = await token.totalBurned();
  const supplyPass = maxSupply === ethers.parseEther('1000000000');
  results.push(supplyPass);

  console.log('  Total Supply:', ethers.formatEther(totalSupply), 'LXON');
  console.log('  Max Supply:', ethers.formatEther(maxSupply), 'LXON');
  console.log('  Total Emitted:', ethers.formatEther(totalEmitted), 'LXON');
  console.log('  Total Burned:', ethers.formatEther(totalBurned), 'LXON');
  console.log('  Status:', passFail(supplyPass));
  console.log();

  const allPass = results.every(Boolean);
  console.log('Tokenomics Verification Summary');
  console.log('Emission Parameters:', passFail(emissionPass && declinePass && durationPass));
  console.log('Transaction Burn Fee:', passFail(burnPass));
  console.log('Tiered Staking:', passFail(tiersPass));
  console.log('Buyback Mechanism:', passFail(buybackPass));
  console.log('Mint Authorities:', passFail(mintPass));
  console.log('Token Supply:', passFail(supplyPass));
  console.log();

  if (!allPass) {
    throw new Error('One or more tokenomics checks failed.');
  }

  console.log('All tokenomics enhancements verified successfully.');
  console.log();
  console.log('Manual follow-ups:');
  console.log('  1. Test actual transfers to verify burn fee');
  console.log('  2. Test staking with each tier');
  console.log('  3. Test staking tier upgrades');
  console.log('  4. Fund treasury with WETH and test buyback execution');
  console.log('  5. Monitor emission over time');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
