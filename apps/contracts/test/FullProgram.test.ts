/**
 * LXON Full-Program Integration Test Suite
 * Uses the centralised deployAll fixture via Hardhat loadFixture() so every
 * it() block gets a clean, snapshot-isolated state with zero redeploy cost.
 */

import { expect } from 'chai';
import { ethers } from 'hardhat';
import { loadFixture, time } from '@nomicfoundation/hardhat-network-helpers';
import {
  deployAll,
  TOTAL_SUPPLY,
  MAX_SUPPLY,
  STAKE_AMOUNT,
  USER_ALLOCATION,
  LOCK_PERIOD,
} from './fixtures';

const day = (n: number) => n * 24 * 60 * 60;

// ── LXON Token Layer ──────────────────────────────────────────────────────────

describe('Full Program - LXON Token', function () {
  it('deploys with correct name, symbol and initial supply', async function () {
    const { lxon, owner } = await loadFixture(deployAll);
    expect(await lxon.name()).to.equal('LXON');
    expect(await lxon.symbol()).to.equal('LXON');
    expect(await lxon.totalSupply()).to.equal(TOTAL_SUPPLY);
    expect(await lxon.MAX_SUPPLY()).to.equal(MAX_SUPPLY);
    expect(await lxon.owner()).to.equal(owner.address);
  });

  it('owner holds less than total supply after funding', async function () {
    const { lxon } = await loadFixture(deployAll);
    const ownerBal = await lxon.balanceOf((await ethers.getSigners())[0].address);
    expect(ownerBal).to.be.lt(TOTAL_SUPPLY);
  });

  it('owner can mint up to MAX_SUPPLY', async function () {
    const { lxon, user1 } = await loadFixture(deployAll);
    const remaining = MAX_SUPPLY - (await lxon.totalSupply());
    await expect(lxon.mint(user1.address, remaining)).to.emit(lxon, 'EmissionMinted');
    expect(await lxon.totalSupply()).to.equal(MAX_SUPPLY);
  });

  it('reverts mint that would exceed MAX_SUPPLY', async function () {
    const { lxon, user1 } = await loadFixture(deployAll);
    const remaining = MAX_SUPPLY - (await lxon.totalSupply());
    await expect(lxon.mint(user1.address, remaining + 1n)).to.be.revertedWith('LXON: exceeds max supply');
  });

  it('non-owner cannot mint', async function () {
    const { lxon, user1, user2 } = await loadFixture(deployAll);
    await expect(lxon.connect(user1).mint(user2.address, ethers.parseEther('1'))).to.be.reverted;
  });

  it('user can burn own tokens and emits Burned', async function () {
    const { lxon, user1 } = await loadFixture(deployAll);
    const burnAmt = ethers.parseEther('500');
    await expect(lxon.connect(user1).burn(burnAmt))
      .to.emit(lxon, 'Burned')
      .withArgs(user1.address, burnAmt);
    expect(await lxon.balanceOf(user1.address)).to.equal(USER_ALLOCATION - burnAmt);
  });

  it('pause blocks transfers; unpause restores them', async function () {
    const { lxon, owner, user1, user2 } = await loadFixture(deployAll);
    await lxon.connect(owner).pause();
    await expect(lxon.connect(user1).transfer(user2.address, ethers.parseEther('1'))).to.be.reverted;
    await lxon.connect(owner).unpause();
    await expect(lxon.connect(user1).transfer(user2.address, ethers.parseEther('1'))).not.to.be.reverted;
  });

  it('distributeRevenue mints and emits RevenueDistributed', async function () {
    const { lxon, owner } = await loadFixture(deployAll);
    await expect(lxon.connect(owner).distributeRevenue(ethers.parseEther('1000')))
      .to.emit(lxon, 'RevenueDistributed');
  });

  it('payStorageRent clears evictable flag', async function () {
    const { lxon, owner, user1 } = await loadFixture(deployAll);
    await lxon.connect(owner).updateStateSize(user1.address, 0);
    await lxon.connect(user1).payStorageRent(ethers.parseEther('0.1'));
    const { evictable } = await lxon.checkStorageRent(user1.address);
    expect(evictable).to.equal(false);
  });

  it('evictState removes account state', async function () {
    const { lxon, owner, user1 } = await loadFixture(deployAll);
    await lxon.connect(owner).updateStateSize(user1.address, 0);
    await expect(lxon.connect(owner).evictState(user1.address)).to.emit(lxon, 'StateEvicted');
  });
});

// ── LXONStaking Layer ────────────────────────────────────────────────────────

describe('Full Program - LXONStaking', function () {
  it('staking contract holds pre-seeded reward pool', async function () {
    const { staking } = await loadFixture(deployAll);
    expect(await staking.rewardPool()).to.be.gt(0n);
  });

  it('user1 stakes STANDARD tier and emits Staked', async function () {
    const { lxon, staking, user1 } = await loadFixture(deployAll);
    await lxon.connect(user1).approve(await staking.getAddress(), STAKE_AMOUNT);
    await expect(staking.connect(user1).stake(STAKE_AMOUNT, 0))
      .to.emit(staking, 'Staked')
      .withArgs(user1.address, STAKE_AMOUNT, 0, 0);
    expect(await staking.totalStaked(user1.address)).to.equal(STAKE_AMOUNT);
  });

  it('user1 stakes PREMIUM tier and receives LP token', async function () {
    const { lxon, staking, user1 } = await loadFixture(deployAll);
    await lxon.connect(user1).approve(await staking.getAddress(), STAKE_AMOUNT);
    await expect(staking.connect(user1).stake(STAKE_AMOUNT, 1))
      .to.emit(staking, 'LPSecurityTokenIssued');
  });

  it('rejects stake below minimum', async function () {
    const { lxon, staking, user1 } = await loadFixture(deployAll);
    const tooSmall = ethers.parseEther('10');
    await lxon.connect(user1).approve(await staking.getAddress(), tooSmall);
    await expect(staking.connect(user1).stake(tooSmall, 0)).to.be.revertedWith('Below minimum stake');
  });

  it('rejects stake without approval', async function () {
    const { staking, user1 } = await loadFixture(deployAll);
    await expect(staking.connect(user1).stake(STAKE_AMOUNT, 0)).to.be.reverted;
  });

  it('unstake after lock period returns full principal with no penalty', async function () {
    const { lxon, staking, user1 } = await loadFixture(deployAll);
    await lxon.connect(user1).approve(await staking.getAddress(), STAKE_AMOUNT);
    await staking.connect(user1).stake(STAKE_AMOUNT, 0);
    await time.increase(LOCK_PERIOD + 1);
    await expect(staking.connect(user1).unstake(0))
      .to.emit(staking, 'Unstaked')
      .withArgs(user1.address, STAKE_AMOUNT, 0);
  });

  it('early unstake applies 10 percent penalty', async function () {
    const { lxon, staking, user1 } = await loadFixture(deployAll);
    await lxon.connect(user1).approve(await staking.getAddress(), STAKE_AMOUNT);
    await staking.connect(user1).stake(STAKE_AMOUNT, 0);
    await time.increase(day(15));
    const penalty = (STAKE_AMOUNT * 10n) / 100n;
    await expect(staking.connect(user1).unstake(0))
      .to.emit(staking, 'Unstaked')
      .withArgs(user1.address, STAKE_AMOUNT - penalty, penalty);
  });

  it('three concurrent stakers tracked in totalStakedAmount', async function () {
    const { lxon, staking, user1, user2, user3 } = await loadFixture(deployAll);
    for (const u of [user1, user2, user3]) {
      await lxon.connect(u).approve(await staking.getAddress(), STAKE_AMOUNT);
      await staking.connect(u).stake(STAKE_AMOUNT, 0);
    }
    expect(await staking.totalStakedAmount()).to.equal(STAKE_AMOUNT * 3n);
  });

  it('claimReward emits RewardClaimed after one year', async function () {
    const { lxon, staking, user1 } = await loadFixture(deployAll);
    await lxon.connect(user1).approve(await staking.getAddress(), STAKE_AMOUNT);
    await staking.connect(user1).stake(STAKE_AMOUNT, 0);
    await time.increase(day(365));
    await expect(staking.connect(user1).claimReward(0)).to.emit(staking, 'RewardClaimed');
  });

  it('owner can slash within 1000 bps ceiling', async function () {
    const { lxon, staking, owner, user1 } = await loadFixture(deployAll);
    await lxon.connect(user1).approve(await staking.getAddress(), USER_ALLOCATION);
    await expect(staking.connect(owner).applySlash(user1.address, 500, 1))
      .to.emit(staking, 'SlashApplied');
  });

  it('slash above 1000 bps reverts', async function () {
    const { staking, owner, user1 } = await loadFixture(deployAll);
    await expect(staking.connect(owner).applySlash(user1.address, 1001, 1))
      .to.be.revertedWith('Penalty too high');
  });
});

// ── LXONGovernance Layer ─────────────────────────────────────────────────────

describe('Full Program - LXONGovernance', function () {
  it('governance and timelock have correct references', async function () {
    const { governance, timelock, lxon } = await loadFixture(deployAll);
    expect(await governance.lxonToken()).to.equal(await lxon.getAddress());
    expect(await governance.timelock()).to.equal(await timelock.getAddress());
  });

  it('proposal threshold is 100k LXON', async function () {
    const { governance } = await loadFixture(deployAll);
    expect(await governance.proposalThreshold()).to.equal(ethers.parseEther('100000'));
  });

  it('quorum is 10M LXON', async function () {
    const { governance } = await loadFixture(deployAll);
    expect(await governance.quorum(0)).to.equal(ethers.parseEther('10000000'));
  });

  it('voting delay is 1 day', async function () {
    const { governance } = await loadFixture(deployAll);
    expect(await governance.votingDelay()).to.equal(day(1));
  });

  it('voting period is 7 days', async function () {
    const { governance } = await loadFixture(deployAll);
    expect(await governance.votingPeriod()).to.equal(day(7));
  });

  it('clock is live and advances', async function () {
    const { governance } = await loadFixture(deployAll);
    const before = await governance.clock();
    await time.increase(100);
    expect(await governance.clock()).to.be.gte(before);
  });

  it('contract name is LXONGovernance', async function () {
    const { governance } = await loadFixture(deployAll);
    expect(await governance.name()).to.equal('LXONGovernance');
  });
});

// ── Cross-Contract Integration ────────────────────────────────────────────────

describe('Full Program - Cross-Contract Integration', function () {
  it('stake -> claimReward -> unstake -> burn: complete user lifecycle', async function () {
    const { lxon, staking, user1 } = await loadFixture(deployAll);

    await lxon.connect(user1).approve(await staking.getAddress(), STAKE_AMOUNT);
    await staking.connect(user1).stake(STAKE_AMOUNT, 0);

    await time.increase(day(365));

    await expect(staking.connect(user1).claimReward(0)).to.emit(staking, 'RewardClaimed');
    await staking.connect(user1).unstake(0);

    const bal = await lxon.balanceOf(user1.address);
    if (bal > 0n) {
      await expect(lxon.connect(user1).burn(bal)).to.emit(lxon, 'Burned');
    }
    expect(await staking.totalStaked(user1.address)).to.equal(0n);
  });

  it('token pause propagates: stake fails while paused, succeeds after unpause', async function () {
    const { lxon, staking, owner, user1 } = await loadFixture(deployAll);
    await lxon.connect(owner).pause();
    await expect(staking.connect(user1).stake(STAKE_AMOUNT, 0)).to.be.reverted;
    await lxon.connect(owner).unpause();
    await lxon.connect(user1).approve(await staking.getAddress(), STAKE_AMOUNT);
    await expect(staking.connect(user1).stake(STAKE_AMOUNT, 0)).not.to.be.reverted;
  });

  it('three concurrent stakers with mixed amounts: totalStakedAmount is correct', async function () {
    const { lxon, staking, user1, user2, user3 } = await loadFixture(deployAll);
    const amounts: [typeof user1, bigint][] = [
      [user1, STAKE_AMOUNT],
      [user2, STAKE_AMOUNT * 2n],
      [user3, STAKE_AMOUNT * 3n],
    ];
    for (const [u, amt] of amounts) {
      await lxon.connect(u).approve(await staking.getAddress(), amt);
      await staking.connect(u).stake(amt, 0);
    }
    expect(await staking.totalStakedAmount()).to.equal(STAKE_AMOUNT * 6n);
  });

  it('mint -> transfer -> PREMIUM stake -> verify LP token on-chain', async function () {
    const { lxon, staking, governance, owner, user1 } = await loadFixture(deployAll);
    await lxon.connect(owner).mint(owner.address, ethers.parseEther('1000000'));
    await lxon.connect(owner).transfer(user1.address, ethers.parseEther('500000'));

    const largeStake = ethers.parseEther('50000');
    await lxon.connect(user1).approve(await staking.getAddress(), largeStake);
    await staking.connect(user1).stake(largeStake, 1);

    expect(await governance.clock()).to.be.gt(0n);
    const lpToken = await staking.lpSecurityTokens(0);
    expect(lpToken.holder).to.equal(user1.address);
    expect(lpToken.amount).to.equal(largeStake);
  });

  it('storage rent eviction does not affect staked balance', async function () {
    const { lxon, staking, owner, user1 } = await loadFixture(deployAll);
    await lxon.connect(user1).approve(await staking.getAddress(), STAKE_AMOUNT);
    await staking.connect(user1).stake(STAKE_AMOUNT, 0);
    await lxon.connect(owner).updateStateSize(user1.address, 0);
    await lxon.connect(owner).evictState(user1.address);
    expect(await staking.totalStaked(user1.address)).to.equal(STAKE_AMOUNT);
  });

  it('staking and governance coexist after token mint to cap', async function () {
    const { lxon, staking, governance, owner, user1 } = await loadFixture(deployAll);
    const remaining = MAX_SUPPLY - (await lxon.totalSupply());
    await lxon.connect(owner).mint(owner.address, remaining);
    expect(await lxon.totalSupply()).to.equal(MAX_SUPPLY);
    // Staking still functional
    await lxon.connect(user1).approve(await staking.getAddress(), STAKE_AMOUNT);
    await expect(staking.connect(user1).stake(STAKE_AMOUNT, 0)).not.to.be.reverted;
    // Governance still live
    expect(await governance.clock()).to.be.gt(0n);
  });
});
