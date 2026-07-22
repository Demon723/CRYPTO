"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const client_2 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
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
            role: client_2.UserRole.SUPER_ADMIN,
            isActive: true,
        },
    });
    console.log('Admin user created:', admin.email);
    const sampleWallets = [
        {
            userId: admin.id,
            address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
            chain: client_2.Chain.ETHEREUM,
            label: 'Vitalik Wallet',
            type: 'EOA',
            isActive: true,
        },
        {
            userId: admin.id,
            address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
            chain: client_2.Chain.ETHEREUM,
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
            plan: client_2.SubscriptionPlan.FREE,
            status: 'ACTIVE',
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            aiQueryLimit: 10,
            aiQueriesUsed: 0,
            features: {
                aiQueriesPerDay: 10,
                maxWallets: 3,
                maxAlerts: 5,
                advancedAnalytics: false,
                apiAccess: false,
                prioritySupport: false,
                whiteLabel: false,
            },
        },
    });
    console.log('Sample subscription created');
    await prisma.token.createMany({
        data: [
            {
                address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                chain: client_2.Chain.ETHEREUM,
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
                chain: client_2.Chain.ETHEREUM,
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
        skipDuplicates: true,
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
//# sourceMappingURL=seed.js.map