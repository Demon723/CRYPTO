# LXON Security Design

**Document v0.1 — July 2026**

> This document defines the security architecture for the LXON token and the LXON platform.
> It is a design specification, not a deployment record. No contracts have been audited or
> deployed to a live network.

---

## 1. Security Objectives

1. **Immutable supply cap** — MAX_SUPPLY cannot be increased after deployment.
2. **No single-key control** — no EOA or single entity can mint, pause, or burn tokens unilaterally.
3. **Governance-gated privileged operations** — mint, burn, and parameter changes require timelocked DAO approval.
4. **Censorship resistance** — transfers cannot be halted by any party after deployment.
5. **Verifiable inference trust** — AI outputs delivered through the x402 layer carry cryptographic attestation or zk proof references.
6. **Infrastructure hardening** — backend, caching, database, and frontend layers resist common attack vectors (injection, replay, MITM, DoS).

---

## 2. Host Chain Selection

LXON is an ERC-20 token. Its consensus security is entirely inherited from the chain it
deploys to. There is no mechanism to add "more hashrate" or "more validators" to an ERC-20.
The security design therefore optimizes for **choosing the strongest host chain** and
**maximizing the quality of the token contract itself**.

### 2.1 Deployment Hierarchy

| Priority | Chain | Rationale |
|----------|-------|-----------|
| **Primary** | **Ethereum L1** | ~1M validators, ~$100B+ staked ETH, highest economic security in the EVM ecosystem. Canonical LXON token and governance live here. |
| **Secondary** | **Base** | OP Stack rollup inheriting Ethereum security via 7-day fraud-proof window. Lower gas costs make it the preferred chain for x402 agent micropayments. |
| **Tertiary** | **Polygon PoS** | Accepted for ecosystem compatibility; ~100 validators, ~$500M economic security. |
| **Future (conditional)** | **LXON app-chain via EigenLayer** | If Milestone 4 thresholds are met, ETH stakers opt-in to secure an LXON-branded app-chain without unbonding. This "rents" Ethereum's economic security rather than trying to replicate it. |

### 2.2 Why Not "10x" Any Chain

No new chain has ever exceeded Bitcoin's 17-year accumulated security, and none likely ever
will. The concept of "10x hash security" is physically incoherent for a token that does not
run its own consensus. LXON's security ceiling is **Ethereum L1's economic security** —
approximately $100B+ in staked ETH backing finality. That is the maximum achievable. Any
claim otherwise is misleading.

---

## 3. Smart Contract Security

### 3.1 Current Contract Assessment (`LXON.sol`)

| Parameter | Current Value | Risk Level |
|-----------|--------------|------------|
| Owner mint | `onlyOwner`, up to MAX_SUPPLY | **Critical** |
| Owner pause | `onlyOwner`, pauses ALL transfers | **Critical** |
| Owner burnFrom | `onlyOwner`, burns any address | **High** |
| Initial distribution | 100% to deployer (`msg.sender`) | **High** |
| Access control | Single `Ownable` address | **High** |
| Library quality | OpenZeppelin 5.x | **Low** (audited primitives) |
| Audit status | None | **Critical** |
| Deployment status | Undeployed | N/A |

**Current security rating: 2.5/10.** Suitable only as a prototype. Unsafe for mainnet with real funds.

### 3.2 Hardened Contract Design

The hardened design removes all single-key control and replaces it with role-based access
controlled by an immutable `TimelockController`.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/governance/TimelockController.sol";

contract LXON is ERC20Votes, ERC20Burnable, AccessControl {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    TimelockController public immutable timelock;
    address public immutable governance;

    event EmissionMinted(uint256 amount);
    event TreasuryBurned(address indexed account, uint256 amount);

    modifier onlyGovernance() {
        require(msg.sender == address(timelock) || msg.sender == governance,
                "LXON: only governance");
        _;
    }

    constructor(
        address _governance,
        uint256 timelockDelay
    ) ERC20("LXON", "LXON") {
        governance = _governance;

        // Timelock: 48h delay, proposer+executor = governance, no minimum delay
        timelock = new TimelockController(
            timelockDelay,
            _governance,
            _governance,
            _governance,
            false
        );

        // Zero initial supply — emission starts via governance
        _grantRole(DEFAULT_ADMIN_ROLE, _governance);
        _grantRole(MINTER_ROLE, address(timelock));
        _grantRole(BURNER_ROLE, address(timelock));
    }

    // Mint only via timelock — no owner, no EOA
    function mintEmission(uint256 amount) external onlyGovernance {
        require(totalSupply() + amount <= MAX_SUPPLY, "LXON: exceeds max supply");
        _mint(address(this), amount);
        emit EmissionMinted(amount);
    }

    // Anyone can burn their own tokens
    function burn(uint256 amount) public override {
        super.burn(amount);
    }

    // Governance-timelock can burn treasury surplus
    function burnFromGovernance(address account, uint256 amount) external onlyGovernance {
        _burn(account, amount);
        emit TreasuryBurned(account, amount);
    }

    // No pause function — transfers cannot be halted
    // No owner — AccessControl replaces Ownable
}
```

### 3.3 Hardening Checklist

| Item | Action | Status |
|------|--------|--------|
| Remove `onlyOwner` mint | Replace with `mintEmission()` callable only by `TimelockController` | Planned |
| Remove `onlyOwner` pause | Delete `Pausable` extension entirely; no kill switch | Planned |
| Remove `onlyOwner` burnFrom | Replace with `burnFromGovernance()` callable only by `TimelockController`; keep public `burn()` | Planned |
| Zero initial mint | Constructor mints 0; emission via governance only | Planned |
| Role-based access | Replace `Ownable` with OpenZeppelin `AccessControl` | Planned |
| TimelockController | 48h delay on all privileged operations | Planned |
| Immutable references | `timelock` and `governance` addresses set at deployment, never changeable | Planned |
| Multisig deployment | Deploy via Gnosis Safe (3/5 threshold) | Planned |
| Etherscan verification | Source published immediately on deployment | Planned |
| External audit | Minimum one external audit before mainnet | Planned |
| Bug bounty | Live on Immunefi or equivalent at deployment | Planned |
| Slither static analysis | Run pre-deploy; zero high/medium findings required | Planned |
| 100% test coverage | `solidity-coverage` branch/line coverage for token, staking, governance | Planned |

---

## 4. Consensus & Finality Security

### 4.1 Inherited Security Model

LXON does not run its own consensus. Its security is the security of its host chain.

| Chain | Consensus | Validators | Staked Value | Finality | Attack Cost (approx) |
|-------|-----------|------------|--------------|----------|----------------------|
| Ethereum L1 | Proof of Stake (Casper) | ~1M | ~$100B+ | 64 blocks (~12–15 min) | >$100B in staked ETH at risk |
| Base | OP Stack (inherits L1) | ~100 sequencers | Inherits L1 | 7-day fraud-proof window | Same as Ethereum via L1 |
| Polygon PoS | Proof of Stake | ~100 | ~$500M | 200 blocks (~3 min) | ~$500M |
| BSC | Proof of Staked Authority | ~41 | ~$2B | ~3 seconds | ~$2B |

**Design decision:** Canonical LXON and governance live on **Ethereum L1**. Base is the
preferred chain for x402 agent micropayments due to lower gas costs and x402 ecosystem
compatibility, but the governance token is bridged from L1, not duplicated.

### 4.2 Future: EigenLayer Restaking (Conditional)

If the DAO votes to authorize an LXON app-chain (post-Milestone 4), EigenLayer restaking
allows ETH stakers to opt-in to secure the new chain without unbonding from Ethereum. This
provides the app-chain with Ethereum's economic security without requiring a new validator
set to accumulate billions in staked capital.

**Security property:** An attacker would need to corrupt a large fraction of Ethereum's
active staked ETH to attack the LXON app-chain — the same attack cost as attacking Ethereum
itself. This is the strongest achievable security model for a non-sovereign chain.

---

## 5. Verifiable Inference Security

The x402 layer delivers AI outputs from external providers. The security requirement is
**cryptographic assurance that the output corresponds to the claimed inputs and model**.

### 5.1 Provider Trust Models

| Provider | Mechanism | Trust Assumption | LXON Integration |
|----------|-----------|-----------------|-------------------|
| **OpenGradient** | PIPE inference mempool + tFHE encrypted compute | TEE hardware attestation; MPC key management | Active API; primary provider for Milestone 1 |
| **Ritual** | TEE-based inference with on-chain attestation; Celestia DA | TEE hardware root of trust | Fallback provider |
| **Gensyn** | Gradient-match proof-of-learning | Decentralized compute marketplace; no single operator | Testnet only; pending mainnet |
| **OpenAI (fallback)** | Standard HTTPS API | Trust provider entirely | Non-verifiable mode; explicit user warning required |

### 5.2 Attestation Requirements

Every verifiable inference response must include:

1. **Provider identity** — on-chain address or verified DID of the inference provider.
2. **Input commitment** — hash of the input data (contract address, analysis parameters).
3. **Output commitment** — hash of the AI-generated output.
4. **Attestation quote** — TEE attestation (e.g., Intel TDX, NVIDIA H100 CC quote) OR zk proof reference.
5. **Timestamp** — block height or UTC timestamp of inference execution.
6. **Model identifier** — versioned hash of the model used (Sentient OML-style fingerprinting, deferred).

If any field is missing, the backend MUST flag the result as **non-verifiable** and require
explicit user acknowledgment before delivery.

### 5.3 Dispute & Fallback

- If a provider returns an attestation that fails verification, the result is rejected and
  the user is not charged (or charged a reduced fallback fee).
- If all verifiable providers are unavailable, the system falls back to a standard AI
  provider with **mandatory user warning**: "This result is NOT cryptographically verifiable."
- Repeated provider failures trigger a `ProviderHealthCheck` that temporarily removes the
  provider from the rotation.

---

## 6. x402 Payment Security

### 6.1 Threat Model

| Threat | Mitigation |
|--------|------------|
| **Double-spend / double-billing** | Idempotent request keys (`requestId = hash(method + path + body + nonce)`); Redis caches fulfillment for 24h; duplicate payments refunded or rejected. |
| **Replay attack** | Nonce + timestamp in payment spec; backend rejects payments older than 5 minutes or with reused nonces. |
| **Front-running** | x402 payment and inference are atomic in the PIPE architecture (Phase 3 of blueprint); for Milestone 1, inference is pre-executed before block construction where possible. |
| **Payment amount manipulation** | Backend computes fee server-side; client cannot modify the payment spec without invalidating the request hash. |
| **Settlement failure** | Backend verifies on-chain transaction before fulfilling; if settlement fails, 402 is re-issued with fresh payment spec. |
| **Unauthorized access** | No API keys; wallet signature required for every payment. Rate limiting per wallet address. |

### 6.2 Supported Assets & Risk

| Asset | Chain | Risk |
|-------|-------|------|
| **USDC** | Base (primary) | Low — regulated stablecoin, high liquidity, standard x402 asset. |
| **LXON** | Ethereum L1 / Base | Medium — native token utility, but requires liquidity depth to avoid slippage on agent payments. Accept LXOM only after DEX pool is live and liquid. |

---

## 7. Backend & Infrastructure Security

### 7.1 API Security

| Control | Implementation |
|---------|---------------|
| **Rate limiting** | `@nestjs/throttler` — 100 req/min per IP, 20 req/min per wallet address for x402 endpoints. |
| **Security headers** | Helmet.js — CSP, HSTS, X-Frame-Options, X-Content-Type-Options. |
| **Input validation** | `class-validator` + `class-transformer` on all DTOs. |
| **SQL injection** | Prisma ORM — parameterized queries only; no raw SQL in application code. |
| **XSS** | React auto-escaping + DOMPurify on any user-generated content rendered in frontend. |
| **CSRF** | SameSite cookies + CSRF tokens for session-based endpoints; wallet signatures for x402 endpoints. |
| **CORS** | Whitelist `lxon.ai` domain + localhost for development. |
| **Authentication** | JWT access tokens (15min) + refresh tokens (7d, HTTP-only cookies). |
| **Secrets management** | Environment variables via `@nestjs/config`; never committed. Production secrets in vault. |

### 7.2 Data Security

| Layer | Control |
|-------|---------|
| **PostgreSQL** | Encrypted at rest (AES-256); parameterized queries via Prisma; connection pooling; daily backups to encrypted S3. |
| **Redis** | AUTH password required; TLS in production; key expiry (TTL) on all cached data; no persistent storage. |
| **x402 cache** | Payment fulfillment cached for 24h to prevent re-billing; keyed by `requestId`. |
| **Agent memory** | Encrypted at rest (AES-256-GCM); user-specific key derivation; never logs raw embeddings. |

### 7.3 Frontend Security

| Control | Implementation |
|---------|---------------|
| **Wallet security** | Wagmi + RainbowKit — private keys never leave the wallet extension; no key import in frontend. |
| **Session management** | JWT in HTTP-only cookies; XSS-resistant token storage. |
| **Content Security Policy** | Restricts script sources to `self` + approved CDNs; blocks inline scripts. |
| **Dependency auditing** | `pnpm audit` in CI; `@typescript-eslint/no-unsafe-*` rules enabled. |

### 7.4 CI/CD & Supply Chain

| Control | Implementation |
|---------|---------------|
| **Dependency pinning** | `pnpm-lock.yaml` committed; `pnpm install --frozen-lockfile` in CI. |
| **GitHub Actions** | Lint → test → build → deploy pipeline; secrets in GitHub Actions vault. |
| **Artifact signing** | Docker images signed with Sigstore/cosign; GitHub release artifacts signed. |
| **Branch protection** | `main` branch requires PR review + passing CI; no direct pushes. |
| **Secret scanning** | GitHub secret scanning + `gitleaks` pre-commit hook. |

---

## 8. Monitoring & Incident Response

### 8.1 Monitoring

| Signal | Tool | Threshold |
|--------|------|-----------|
| Contract events | The Graph subgraph + custom indexer | Alert on `Minted`, `Burned`, `Paused` (should never fire post-hardening). |
| x402 payment failures | Backend metrics (Prometheus) | Alert if failure rate > 1% over 5 min. |
| Provider health | `ProviderHealthCheck` service | Alert if attestation verification fails > 3x in 10 min. |
| Backend errors | Sentry / custom error tracking | Alert on 5xx rate > 0.1%. |
| Gas spikes | Base/Ethereum gas tracker | Alert if gas > 100 gwei for 5 consecutive blocks. |

### 8.2 Incident Response

| Incident | Response | Authority |
|----------|----------|-----------|
| **Contract vulnerability discovered** | Pause via multisig emergency pause (48h timelock); patch + redeploy; user communication | Gnosis Safe multisig (3/5) |
| **x402 provider compromise** | Remove provider from rotation; fallback to secondary provider; investigate via attestation logs | Backend ops team + DAO notification |
| **Backend breach** | Rotate secrets; redeploy from clean image; audit access logs; notify users if data exposure | Backend ops team |
| **Governance attack** | Timelock provides 48h warning window; community can veto via social consensus + emergency multisig | DAO + Gnosis Safe multisig |

---

## 9. Security Rating (Post-Hardening Target)

| Dimension | Current | Post-Hardening Target |
|-----------|---------|----------------------|
| Contract permissions | 2/10 (single owner) | 8/10 (multisig + timelock + roles) |
| Audit coverage | 0/10 (none) | 7/10 (1 external audit + bug bounty) |
| Host chain security | N/A (undeployed) | 9/10 (Ethereum L1) |
| Infrastructure | 5/10 (scaffold) | 8/10 (rate limiting, Helmet, Prisma, encrypted backups) |
| Monitoring | 3/10 (basic health checks) | 7/10 (events, provider health, error tracking) |
| Incident response | 1/10 (none defined) | 6/10 (documented playbooks + multisig emergency) |
| **Overall** | **2.5/10** | **7.5/10** |

**7.5/10 is the realistic ceiling for an ERC-20 token on Ethereum L1 with external audit and
proper hardening.** Achieving "10x Bitcoin hash security" is not a meaningful security metric
for a token contract; Bitcoin's security model (Proof of Work hashrate) does not apply to
EVM smart contracts. The correct comparison is **economic security of the host chain**, and
Ethereum L1's ~$100B staked security is the highest achievable in the EVM ecosystem.

---

## 10. References

- OpenZeppelin Security Considerations: https://docs.openzeppelin.com/contracts/security
- Ethereum PoS Security Model: https://blog.ethereum.org/2023/03/27/eras-finality-overview
- x402 Protocol Specification: https://github.com/404-decimal/x402
- OpenGradient Security Model: https://docs.opengradient.ai/security
- Optimistic TEE-Rollups (arXiv:2512.20176): https://arxiv.org/abs/2512.20176
