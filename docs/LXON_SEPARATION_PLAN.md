# LXON Full Separation Plan from SYNEX

## Overview
Separate LXON blockchain components from SYNEX into an independent project with its own repository, deployment, and API communication layer.

## Current LXON Components in SYNEX

### 1. LXON Blockchain Engine
- **Location**: `/apps/lxon-blockchain/`
- **Components**:
  - Block-STM implementation
  - Asynchronous storage
  - zkVM proving pipeline
  - Consensus mechanisms (Monad-BFT, Narwhal mempool)
  - Tail-fork defense

### 2. LXON Smart Contracts
- **Location**: `/apps/contracts/contracts/LXON.sol`
- **Features**: Token staking, governance, rewards

### 3. Backend Dependencies
- **Services with LXON references**:
  - `transaction-builder.service.ts`
  - `token-utility.service.ts`
  - `transactions.service.ts`
  - `wallets.service.ts`
  - `referral.service.ts`
  - `scanner.service.ts`
  - `analytics.service.ts`
  - `governance.service.ts`
  - `tokens.service.ts`

### 4. Frontend Dependencies
- **Pages with LXON references**:
  - `/staking/page.tsx`
  - `/tokens/page.tsx`
  - `/referrals/page.tsx`
  - `/transactions/page.tsx`
  - `/wallets/page.tsx`
  - `/governance/page.tsx`
  - `/scanner/page.tsx`
  - `/page.tsx` (landing page)

## Separation Strategy

### Phase 1: Create LXON Independent Repository

#### 1.1 Repository Structure
```
lxon/
├── apps/
│   ├── blockchain/          # From apps/lxon-blockchain
│   ├── contracts/          # From apps/contracts (LXON.sol)
│   ├── api/                # New LXON API service
│   └── explorer/           # New LXON blockchain explorer
├── packages/
│   └── shared/             # Shared utilities
├── infrastructure/
│   └── docker/
└── package.json
```

#### 1.2 Initialize LXON Repository
```bash
# Create new GitHub repository: Demon723/LXON
# Initialize with monorepo structure
# Set up pnpm workspaces
```

### Phase 2: Move LXON Components

#### 2.1 Move Blockchain Engine
- Copy `/apps/lxon-blockchain/` → `lxon/apps/blockchain/`
- Update package.json references
- Update import paths
- Test blockchain functionality independently

#### 2.2 Move Smart Contracts
- Copy `/apps/contracts/contracts/LXON.sol` → `lxon/apps/contracts/`
- Copy related test files
- Update deployment scripts
- Test contract compilation and deployment

#### 2.3 Create LXON API Service
- Create NestJS API service for LXON blockchain
- Endpoints:
  - `POST /blocks` - Submit new blocks
  - `GET /blocks/:hash` - Get block by hash
  - `GET /transactions/:hash` - Get transaction
  - `POST /transactions` - Submit transaction
  - `GET /status` - Blockchain status
  - `GET /validators` - Validator information
  - `GET /staking` - Staking information
- WebSocket support for real-time updates

#### 2.4 Create LXON Explorer (Optional)
- Next.js frontend for blockchain exploration
- Block explorer UI
- Transaction viewer
- Validator dashboard
- Staking interface

### Phase 3: Remove LXON from SYNEX

#### 3.1 Backend Cleanup
- Remove LXON-specific code from services
- Replace direct LXON calls with API calls to LXON service
- Update configuration to point to LXON API
- Remove LXON environment variables
- Update database schema if needed

#### 3.2 Frontend Cleanup
- Remove LXON-specific UI components
- Replace LXON blockchain calls with API calls
- Remove LXON pages or redirect to LXON explorer
- Update environment variables
- Remove LXON references from navigation

#### 3.3 Dependency Cleanup
- Remove LXON-related packages from package.json
- Clean up unused imports
- Remove LXON test fixtures
- Update documentation

### Phase 4: API Communication Layer

#### 4.1 SYNEX → LXON Communication
```typescript
// SYNEX backend service to call LXON API
class LXONApiClient {
  private baseURL: string;
  
  constructor() {
    this.baseURL = process.env.LXON_API_URL;
  }
  
  async submitTransaction(txData: TransactionData) {
    return axios.post(`${this.baseURL}/transactions`, txData);
  }
  
  async getBlock(hash: string) {
    return axios.get(`${this.baseURL}/blocks/${hash}`);
  }
  
  async getStakingInfo(address: string) {
    return axios.get(`${this.baseURL}/staking/${address}`);
  }
}
```

#### 4.2 Environment Variables
**SYNEX Backend:**
```bash
LXON_API_URL=https://lxon-api.yourdomain.com
LXON_WS_URL=wss://lxon-api.yourdomain.com
```

**LXON API:**
```bash
SYNEX_API_URL=https://synex-api.yourdomain.com/api/v1
SYNEX_API_KEY=<shared_secret>
```

#### 4.3 Authentication
- Use API keys for service-to-service communication
- Implement rate limiting
- Add request signing for security

### Phase 5: Independent Deployment

#### 5.1 LXON Deployment Architecture
```
LXON Project
├── LXON API Service (NestJS)
├── LXON Blockchain Engine (Node.js)
├── PostgreSQL (blocks, transactions)
└── Redis (caching, pub/sub)
```

#### 5.2 Deployment Steps
1. Create deployment project for LXON
2. Deploy LXON API service
3. Deploy LXON blockchain engine
4. Configure databases
5. Set up environment variables
6. Test API endpoints
7. Configure CORS for SYNEX

#### 5.3 Alternative Deployment Options
- Deploy LXON API to cloud provider of choice
- Deploy blockchain engine to infrastructure of choice
- Configure cross-platform communication

### Phase 6: Testing & Migration

#### 6.1 Testing Checklist
- [ ] LXON blockchain works independently
- [ ] LXON API responds correctly
- [ ] SYNEX can call LXON API
- [ ] Staking functionality works via API
- [ ] Token operations work via API
- [ ] Governance functions work via API
- [ ] Frontend displays LXON data correctly
- [ ] No LXON dependencies remain in SYNEX

#### 6.2 Migration Strategy
1. Deploy LXON independently
2. Configure SYNEX to use LXON API
3. Test in staging environment
4. Migrate production traffic
5. Monitor for issues
6. Remove old LXON code from SYNEX

## Benefits of Separation

### For LXON
- Independent development and deployment
- Focused blockchain development
- Own community and contributors
- Separate governance
- Custom deployment options

### For SYNEX
- Cleaner codebase
- Reduced complexity
- Faster development cycles
- Better separation of concerns
- Easier to maintain

### For Both
- Clear API boundaries
- Independent scaling
- Better testing
- Modular architecture
- Future flexibility

## Risks & Mitigation

### Risk 1: API Latency
**Mitigation**: Use caching, optimize API calls, consider edge deployment

### Risk 2: Data Consistency
**Mitigation**: Implement proper error handling, retries, and data validation

### Risk 3: Deployment Complexity
**Mitigation**: Use CI/CD automation, proper monitoring, gradual rollout

### Risk 4: Breaking Changes
**Mitigation**: Version APIs, maintain backward compatibility, communicate changes

## Timeline Estimate

- **Phase 1**: 1 day (repository setup)
- **Phase 2**: 2-3 days (moving components)
- **Phase 3**: 2-3 days (removing dependencies)
- **Phase 4**: 1-2 days (API communication)
- **Phase 5**: 1-2 days (deployment)
- **Phase 6**: 2-3 days (testing & migration)

**Total**: 9-14 days

## Next Steps

1. **Approve separation plan** - Confirm this approach
2. **Create LXON repository** - Initialize new GitHub repo
3. **Start Phase 1** - Begin repository setup
4. **Execute phases sequentially** - Follow the plan
5. **Test thoroughly** - Ensure both systems work independently
6. **Monitor post-migration** - Watch for issues

## Rollback Plan

If separation causes critical issues:
1. Keep SYNEX with LXON code as backup
2. Revert API calls to direct LXON usage
3. Re-deploy previous version
4. Investigate and fix issues
5. Retry separation when ready
