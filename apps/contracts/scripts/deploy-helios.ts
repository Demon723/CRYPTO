import { ethers } from 'hardhat';
import { writeFileSync, mkdirSync } from 'fs';

async function main() {
  console.log('Deploying Helios Protocol...');
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);

  const HeliosTBAccount = await ethers.getContractFactory('HeliosTBAccount');
  const tbaImplementation = await HeliosTBAccount.deploy();
  await tbaImplementation.waitForDeployment();
  const tbaAddress = await tbaImplementation.getAddress();
  console.log('HeliosTBAccount deployed to:', tbaAddress);

  const HeliosChipRegistry = await ethers.getContractFactory('HeliosChipRegistry');
  const chipRegistry = await HeliosChipRegistry.deploy();
  await chipRegistry.waitForDeployment();
  const chipRegistryAddress = await chipRegistry.getAddress();
  console.log('HeliosChipRegistry deployed to:', chipRegistryAddress);

  const HeliosCardRegistry = await ethers.getContractFactory('HeliosCardRegistry');
  const cardRegistry = await HeliosCardRegistry.deploy();
  await cardRegistry.waitForDeployment();
  const cardRegistryAddress = await cardRegistry.getAddress();
  console.log('HeliosCardRegistry deployed to:', cardRegistryAddress);

  const HeliosRenderer = await ethers.getContractFactory('HeliosRenderer');
  const renderer = await HeliosRenderer.deploy();
  await renderer.waitForDeployment();
  const rendererAddress = await renderer.getAddress();
  console.log('HeliosRenderer deployed to:', rendererAddress);

  const HeliosPBTv3 = await ethers.getContractFactory('HeliosPBTv3');
  const pbt = await HeliosPBTv3.deploy(
    chipRegistryAddress,
    cardRegistryAddress,
    tbaAddress,
    rendererAddress
  );
  await pbt.waitForDeployment();
  const pbtAddress = await pbt.getAddress();
  console.log('HeliosPBTv3 deployed to:', pbtAddress);

  const HeliosFactory = await ethers.getContractFactory('HeliosFactory');
  const factory = await HeliosFactory.deploy(
    pbtAddress,
    chipRegistryAddress,
    cardRegistryAddress
  );
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log('HeliosFactory deployed to:', factoryAddress);

  const mintPrice = ethers.parseEther('0.01');
  const maxSupply = 10000;
  await pbt.setMintPrice(mintPrice);
  await pbt.setMaxSupply(maxSupply);

  const network = await ethers.provider.getNetwork();
  const deployment = {
    network: network.name,
    chainId: Number(network.chainId),
    deployer: deployer.address,
    contracts: {
      HeliosPBTv3: pbtAddress,
      HeliosChipRegistry: chipRegistryAddress,
      HeliosCardRegistry: cardRegistryAddress,
      HeliosTBAccount: tbaAddress,
      HeliosRenderer: rendererAddress,
      HeliosFactory: factoryAddress,
    },
    config: { mintPrice: ethers.formatEther(mintPrice), maxSupply },
    deployedAt: new Date().toISOString(),
  };

  const dir = './deployments';
  if (!writeFileSync) mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/${Number(network.chainId)}-helios.json`, JSON.stringify(deployment, null, 2));

  console.log('\n✅ Helios Protocol deployed successfully!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Helios deployment failed:', error);
    process.exit(1);
  });
