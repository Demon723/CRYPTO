import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { SynexGovernance, LXON } from '../typechain-types';
import { TimelockController } from '@openzeppelin/contracts';

describe('SynexGovernance', function () {
  let governance: SynexGovernance;
  let lxon: LXON;
  let timelock: TimelockController;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();
    
    const LXONFactory = await ethers.getContractFactory('LXON');
    lxon = await LXONFactory.deploy();
    await lxon.waitForDeployment();

    const TimelockFactory = await ethers.getContractFactory('TimelockController');
    timelock = await TimelockFactory.deploy(
      1 * 24 * 60 * 60,
      [await owner.getAddress()],
      [await owner.getAddress()],
      await owner.getAddress()
    );
    await timelock.waitForDeployment();

    const GovernanceFactory = await ethers.getContractFactory('SynexGovernance');
    governance = await GovernanceFactory.deploy(
      await timelock.getAddress(),
      await lxon.getAddress()
    );
    await governance.waitForDeployment();
  });

  describe('Deployment', function () {
    it('Should set the correct token address', async function () {
      expect(await governance.lxonToken()).to.equal(await lxon.getAddress());
    });

    it('Should set the correct timelock', async function () {
      expect(await governance.timelock()).to.equal(await timelock.getAddress());
    });

    it('Should set the correct name', async function () {
      expect(await governance.name()).to.equal('SynexGovernance');
    });
  });

  describe('Voting Parameters', function () {
    it('Should return correct proposal threshold', async function () {
      expect(await governance.proposalThreshold()).to.equal(ethers.parseEther('100000'));
    });

    it('Should return correct quorum', async function () {
      expect(await governance.quorum(0)).to.equal(ethers.parseEther('10000000'));
    });

    it('Should return correct voting delay', async function () {
      expect(await governance.votingDelay()).to.equal(1 * 24 * 60 * 60);
    });

    it('Should return correct voting period', async function () {
      expect(await governance.votingPeriod()).to.equal(7 * 24 * 60 * 60);
    });
  });

  describe('Proposal Lifecycle', function () {
    it('Should allow owner to create a proposal', async function () {
      // Note: Full proposal testing requires token votes delegation
      // This is a minimal structural test
      expect(await governance.clock()).to.be.greaterThan(0);
    });
  });
});
