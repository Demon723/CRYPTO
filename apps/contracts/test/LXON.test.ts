import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { LXON } from '../typechain-types';

describe('LXON Token', function () {
  let lxon: LXON;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const TOTAL_SUPPLY = ethers.parseEther('1000000000');

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const LXONFactory = await ethers.getContractFactory('LXON');
    lxon = await LXONFactory.deploy();
    await lxon.waitForDeployment();
  });

  describe('Deployment', function () {
    it('Should set the correct name and symbol', async function () {
      expect(await lxon.name()).to.equal('LXON');
      expect(await lxon.symbol()).to.equal('LXON');
    });

    it('Should mint total supply to deployer', async function () {
      const deployerAddress = await owner.getAddress();
      expect(await lxon.balanceOf(deployerAddress)).to.equal(TOTAL_SUPPLY);
      expect(await lxon.totalSupply()).to.equal(TOTAL_SUPPLY);
    });

    it('Should set the deployer as owner', async function () {
      expect(await lxon.owner()).to.equal(await owner.getAddress());
    });
  });

  describe('Minting', function () {
    it('Should allow owner to mint new tokens', async function () {
      const mintAmount = ethers.parseEther('1000000');
      await expect(lxon.mint(user1.address, mintAmount))
        .to.emit(lxon, 'Minted')
        .withArgs(user1.address, mintAmount);

      expect(await lxon.balanceOf(user1.address)).to.equal(mintAmount);
    });

    it('Should reject minting above max supply', async function () {
      const maxSupply = await lxon.MAX_SUPPLY();
      const currentSupply = await lxon.totalSupply();
      const excessMint = maxSupply - currentSupply + 1n;

      await expect(lxon.mint(user1.address, excessMint)).to.be.revertedWith('exceeds max supply');
    });

    it('Should reject minting from non-owner', async function () {
      const mintAmount = ethers.parseEther('1000');
      await expect(lxon.connect(user1).mint(user2.address, mintAmount)).to.be.reverted;
    });
  });

  describe('Burning', function () {
    it('Should allow users to burn their tokens', async function () {
      const burnAmount = ethers.parseEther('1000');
      await lxon.transfer(user1.address, burnAmount);
      await expect(lxon.connect(user1).burn(burnAmount))
        .to.emit(lxon, 'Burned')
        .withArgs(user1.address, burnAmount);

      expect(await lxon.balanceOf(user1.address)).to.equal(0);
    });
  });

  describe('Pausable', function () {
    it('Should allow owner to pause and unpause', async function () {
      await expect(lxon.pause()).to.emit(lxon, 'Paused').withArgs(await owner.getAddress());
      await expect(lxon.unpause()).to.emit(lxon, 'Unpaused').withArgs(await owner.getAddress());
    });

    it('Should reject transfers when paused', async function () {
      await lxon.pause();
      const transferAmount = ethers.parseEther('1000');
      await expect(lxon.transfer(user1.address, transferAmount)).to.be.reverted;
    });
  });

  describe('Voting', function () {
    it('Should track votes correctly', async function () {
      const delegateAmount = ethers.parseEther('100000');
      await lxon.transfer(user1.address, delegateAmount);
      await lxon.connect(user1).transfer(user1.address, delegateAmount);

      const votes = await lxon.getVotes(user1.address);
      expect(votes).to.equal(delegateAmount);
    });
  });
});
