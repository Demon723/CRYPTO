import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { SynexStaking, LXON } from '../typechain-types';

describe('SynexStaking', function () {
  let staking: SynexStaking;
  let lxon: LXON;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const STAKE_AMOUNT = ethers.parseEther('1000');
  const REWARD_AMOUNT = ethers.parseEther('500');

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    const LXONFactory = await ethers.getContractFactory('LXON');
    lxon = await LXONFactory.deploy();
    await lxon.waitForDeployment();

    const StakingFactory = await ethers.getContractFactory('SynexStaking');
    staking = await StakingFactory.deploy(await lxon.getAddress(), await lxon.getAddress());
    await staking.waitForDeployment();

    // Transfer tokens to users
    await lxon.transfer(user1.address, ethers.parseEther('10000'));
    await lxon.transfer(user2.address, ethers.parseEther('10000'));
  });

  describe('Deployment', function () {
    it('Should set the correct staking and reward tokens', async function () {
      expect(await staking.stakingToken()).to.equal(await lxon.getAddress());
      expect(await staking.rewardToken()).to.equal(await lxon.getAddress());
    });

    it('Should set the deployer as owner', async function () {
      expect(await staking.owner()).to.equal(await owner.getAddress());
    });
  });

  describe('Staking', function () {
    it('Should allow users to stake tokens', async function () {
      await lxon.connect(user1).approve(await staking.getAddress(), STAKE_AMOUNT);
      await expect(staking.connect(user1).stake(STAKE_AMOUNT, 0))
        .to.emit(staking, 'Staked')
        .withArgs(user1.address, STAKE_AMOUNT, 0, 0);

      expect(await staking.totalStaked(user1.address)).to.equal(STAKE_AMOUNT);
      expect(await staking.totalStakedAmount()).to.equal(STAKE_AMOUNT);
    });

    it('Should reject staking 0 tokens', async function () {
      await expect(staking.connect(user1).stake(0, 0)).to.be.revertedWith('Below minimum stake');
    });

    it('Should reject staking without approval', async function () {
      await expect(staking.connect(user1).stake(STAKE_AMOUNT, 0)).to.be.reverted;
    });
  });

  describe('Unstaking', function () {
    beforeEach(async function () {
      await lxon.connect(user1).approve(await staking.getAddress(), STAKE_AMOUNT);
      await staking.connect(user1).stake(STAKE_AMOUNT, 0);
    });

    it('Should allow unstaking after lock period', async function () {
      await ethers.provider.send('evm_increaseTime', [31 * 24 * 60 * 60]);
      await ethers.provider.send('evm_mine', []);

      await expect(staking.connect(user1).unstake(0))
        .to.emit(staking, 'Unstaked')
        .withArgs(user1.address, STAKE_AMOUNT, 0);

      expect(await staking.totalStaked(user1.address)).to.equal(0);
    });

    it('Should apply penalty for early unstake', async function () {
      await ethers.provider.send('evm_increaseTime', [15 * 24 * 60 * 60]);
      await ethers.provider.send('evm_mine', []);

      const penalty = (STAKE_AMOUNT * 10n) / 100n;
      const expectedReturn = STAKE_AMOUNT - penalty;

      await expect(staking.connect(user1).unstake(0))
        .to.emit(staking, 'Unstaked')
        .withArgs(user1.address, expectedReturn, penalty);
    });
  });

  describe('Rewards', function () {
    beforeEach(async function () {
      await lxon.connect(user1).approve(await staking.getAddress(), STAKE_AMOUNT);
      await staking.connect(user1).stake(STAKE_AMOUNT, 0);
      
      // Fund reward pool
      await lxon.connect(owner).transfer(await staking.getAddress(), REWARD_AMOUNT);
      await lxon.connect(owner).approve(await staking.getAddress(), REWARD_AMOUNT);
      await staking.fundRewardPool(REWARD_AMOUNT);
    });

    it('Should allow claiming rewards', async function () {
      await ethers.provider.send('evm_increaseTime', [365 * 24 * 60 * 60]);
      await ethers.provider.send('evm_mine', []);

      await expect(staking.connect(user1).claimReward(0))
        .to.emit(staking, 'RewardClaimed');
    });
  });
});
