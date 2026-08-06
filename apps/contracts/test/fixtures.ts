/**
 * LXON Full-Program Fixture
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralised fixture factory for ALL Hardhat tests in this workspace.
 * Import deployAll (or any named sub-fixture) and pass it to
 * Hardhat loadFixture() helper to get a snapshot-isolated, gas-efficient
 * test environment.
 *
 * Fixture hierarchy
 * ─────────────────
 *  deployAll                 <- entire protocol stack + funded accounts
 *    deployLXON              <- bare ERC-20 token only
 *    deployStaking           <- token + staking (no governance)
 *    deployGovernance        <- token + timelock + governor
 */

import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import type { LXON, SynexStaking, SynexGovernance } from '../typechain-types';

// Constants
export const TOTAL_SUPPLY    = ethers.parseEther('100000000');
export const MAX_SUPPLY      = ethers.parseEther('1000000000');
export const STAKE_AMOUNT    = ethers.parseEther('1000');
export const REWARD_SEED     = ethers.parseEther('500000');
export const USER_ALLOCATION = ethers.parseEther('100000');
export const LOCK_PERIOD     = 30 * 24 * 60 * 60;
export const TIMELOCK_DELAY  = 1 * 24 * 60 * 60;

// Return types
export interface LXONFixture {
  lxon:     LXON;
  owner:    SignerWithAddress;
  user1:    SignerWithAddress;
  user2:    SignerWithAddress;
  user3:    SignerWithAddress;
  treasury: SignerWithAddress;
}

export interface StakingFixture extends LXONFixture {
  staking: SynexStaking;
}

export interface GovernanceFixture extends LXONFixture {
  governance: SynexGovernance;
  timelock:   any;
}

export interface FullFixture extends StakingFixture, GovernanceFixture {}

// deployLXON
export async function deployLXON(): Promise<LXONFixture> {
  const [owner, user1, user2, user3, treasury] = await ethers.getSigners();
  const F = await ethers.getContractFactory('LXON');
  const lxon = (await F.deploy()) as LXON;
  await lxon.waitForDeployment();
  await lxon.transfer(user1.address, USER_ALLOCATION);
  await lxon.transfer(user2.address, USER_ALLOCATION);
  await lxon.transfer(user3.address, USER_ALLOCATION);
  return { lxon, owner, user1, user2, user3, treasury };
}

// deployStaking
export async function deployStaking(): Promise<StakingFixture> {
  const base = await deployLXON();
  const { lxon, owner } = base;
  const SF = await ethers.getContractFactory('SynexStaking');
  const staking = (await SF.deploy(await lxon.getAddress(), await lxon.getAddress())) as SynexStaking;
  await staking.waitForDeployment();
  await lxon.connect(owner).transfer(await staking.getAddress(), REWARD_SEED);
  await lxon.connect(owner).approve(await staking.getAddress(), REWARD_SEED);
  await staking.connect(owner).fundRewardPool(REWARD_SEED);
  return { ...base, staking };
}

// deployGovernance
export async function deployGovernance(): Promise<GovernanceFixture> {
  const base = await deployLXON();
  const { lxon, owner } = base;
  const TF = await ethers.getContractFactory('TimelockController');
  const timelock = await TF.deploy(TIMELOCK_DELAY, [owner.address], [owner.address], owner.address);
  await timelock.waitForDeployment();
  const GF = await ethers.getContractFactory('SynexGovernance');
  const governance = (await GF.deploy(await timelock.getAddress(), await lxon.getAddress())) as SynexGovernance;
  await governance.waitForDeployment();
  return { ...base, governance, timelock };
}

// deployAll - THE FULL PROGRAM FIXTURE
export async function deployAll(): Promise<FullFixture> {
  const [owner, user1, user2, user3, treasury] = await ethers.getSigners();

  const LF = await ethers.getContractFactory('LXON');
  const lxon = (await LF.deploy()) as LXON;
  await lxon.waitForDeployment();

  const SF = await ethers.getContractFactory('SynexStaking');
  const staking = (await SF.deploy(await lxon.getAddress(), await lxon.getAddress())) as SynexStaking;
  await staking.waitForDeployment();

  const TF = await ethers.getContractFactory('TimelockController');
  const timelock = await TF.deploy(TIMELOCK_DELAY, [owner.address], [owner.address], owner.address);
  await timelock.waitForDeployment();

  const GF = await ethers.getContractFactory('SynexGovernance');
  const governance = (await GF.deploy(await timelock.getAddress(), await lxon.getAddress())) as SynexGovernance;
  await governance.waitForDeployment();

  await lxon.transfer(user1.address, USER_ALLOCATION);
  await lxon.transfer(user2.address, USER_ALLOCATION);
  await lxon.transfer(user3.address, USER_ALLOCATION);

  await lxon.connect(owner).transfer(await staking.getAddress(), REWARD_SEED);
  await lxon.connect(owner).approve(await staking.getAddress(), REWARD_SEED);
  await staking.connect(owner).fundRewardPool(REWARD_SEED);

  return { lxon, staking, governance, timelock, owner, user1, user2, user3, treasury };
}
