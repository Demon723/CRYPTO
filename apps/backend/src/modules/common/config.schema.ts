import { z } from 'zod';

export const configValidationSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().positive().default(4000),
  API_PREFIX: z.string().default('api/v1'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  DATABASE_URL: z.string().url().default('postgresql://postgres:postgres@localhost:5432/cryptomind?schema=public'),
  DIRECT_URL: z.string().url().default('postgresql://postgres:postgres@localhost:5432/cryptomind?schema=public'),

  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().positive().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().min(0).default(0),

  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  OPENAI_API_KEY: z.string().startsWith('sk-').optional(),
  OPENAI_MODEL: z.string().default('gpt-4-turbo-preview'),

  WALLETCONNECT_PROJECT_ID: z.string().optional(),

  ETHEREUM_RPC_URL: z.string().url().optional(),
  POLYGON_RPC_URL: z.string().url().optional(),
  BSC_RPC_URL: z.string().url().optional(),
  ARBITRUM_RPC_URL: z.string().url().optional(),
  BASE_RPC_URL: z.string().url().optional(),
  AVALANCHE_RPC_URL: z.string().url().optional(),
  LXON_RPC_URL: z.string().url().optional(),

  ETHERSCAN_API_KEY: z.string().optional(),
  BSCSCAN_API_KEY: z.string().optional(),
  POLYGONSCAN_API_KEY: z.string().optional(),
  ARBISCAN_API_KEY: z.string().optional(),
  BASESCAN_API_KEY: z.string().optional(),
  SNOWTRACE_API_KEY: z.string().optional(),
  LXONSCAN_API_KEY: z.string().optional(),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().positive().default(587),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().default('Synex <noreply@synex.ai>'),

  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().default('us-east-1'),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),

  IPFS_GATEWAY: z.string().url().default('https://ipfs.io/ipfs/'),

  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  ADMIN_EMAILS: z.string().default('admin@synex.ai'),

  BCRYPT_ROUNDS: z.coerce.number().positive().default(12),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().positive().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().positive().default(100),
  SESSION_SECRET: z.string().min(1),

  FRONTEND_URL: z.string().url().default('http://localhost:3000'),

  PLATFORM_TOKEN_ADDRESS: z.string().optional(),
  PLATFORM_TOKEN_SYMBOL: z.string().default('LXON'),

  GOVERNANCE_VOTING_PERIOD_DAYS: z.coerce.number().positive().default(7),
  GOVERNANCE_QUORUM_PERCENTAGE: z.coerce.number().positive().default(10),

  STAKING_REWARD_RATE: z.coerce.number().positive().default(12),
  STAKING_LOCK_PERIOD_DAYS: z.coerce.number().positive().default(30),

  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

export type ConfigType = z.infer<typeof configValidationSchema>;
