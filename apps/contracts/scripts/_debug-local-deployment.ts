import { ethers } from 'hardhat';

async function main() {
  const addr = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  const code = await ethers.provider.getCode(addr);
  console.log('Code length:', code.length);
  console.log('Code prefix:', code.slice(0, 120));

  const token = await ethers.getContractAt('LXONNativeToken', addr);
  try {
    const supply = await token.totalSupply();
    console.log('totalSupply:', supply.toString());
  } catch (e: any) {
    console.log('totalSupply error:', e.message);
  }

  try {
    const raw = await ethers.provider.call({ to: addr, data: '0x18160ddd' });
    console.log('raw totalSupply:', raw);
  } catch (e: any) {
    console.log('raw totalSupply error:', e.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
