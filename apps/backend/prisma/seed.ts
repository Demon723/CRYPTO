import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('admin123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@synex.ai' },
    update: {},
    create: {
      email: 'admin@synex.ai',
      name: 'Admin User',
      emailVerified: true,
      emailVerifiedAt: new Date(),
      password: hashedPassword,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  console.log('Admin user created:', admin.email);

  const sampleWallets = [
    {
      userId: admin.id,
      address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      chain: "ETHEREUM",
      label: 'Vitalik Wallet',
      type: 'EOA',
      isActive: true,
    },
    {
      userId: admin.id,
      address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      chain: "ETHEREUM",
      label: 'Sample ETH Wallet',
      type: 'EOA',
      isActive: true,
    },
  ];

  for (const walletData of sampleWallets) {
    await prisma.wallet.upsert({
      where: {
        userId_address_chain: {
          userId: walletData.userId,
          address: walletData.address,
          chain: walletData.chain,
        },
      },
      update: {},
// @ts-ignore
      create: walletData,
    });
  }

  console.log('Sample wallets created');

  await prisma.subscription.upsert({
    where: { id: 'free-subscription' },
    update: {},
    create: {
      id: 'free-subscription',
      userId: admin.id,
      plan: "FREE",
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      aiQueryLimit: 10,
      aiQueriesUsed: 0,
      features: JSON.stringify({
        aiQueriesPerDay: 10,
        maxWallets: 3,
        maxAlerts: 5,
        advancedAnalytics: false,
        apiAccess: false,
        prioritySupport: false,
        whiteLabel: false,
      }),
    },
  });

  console.log('Sample subscription created');

  await prisma.token.createMany({
    data: [
      {
        address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        chain: "ETHEREUM",
        symbol: 'WETH',
        name: 'Wrapped Ether',
        decimals: 18,
        logoUrl: 'https://ethereum.org/favicon.ico',
        totalSupply: '1200000000000000000000000',
        priceUsd: 2500,
        change24h: 2.5,
        volumeUsd24h: 100000000,
        marketCapUsd: 30000000000,
        liquidityUsd: 500000000,
        isVerified: true,
        lastUpdated: new Date(),
      },
      {
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        chain: "ETHEREUM",
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        logoUrl: 'https://ethereum.org/favicon.ico',
        totalSupply: '25000000000000000000000000',
        priceUsd: 1,
        change24h: 0.01,
        volumeUsd24h: 5000000000,
        marketCapUsd: 25000000000,
        liquidityUsd: 1000000000,
        isVerified: true,
        lastUpdated: new Date(),
      },
    ],
    // skipDuplicates not supported in SQLite
  });

  console.log('Sample tokens created');

  console.log('Database seeding completed successfully');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
