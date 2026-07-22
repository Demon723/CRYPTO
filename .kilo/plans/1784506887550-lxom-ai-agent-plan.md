# Synex / LXOM — AI-Powered Crypto: First Milestone Plan

## Context

The user wants a "best ever, highly AI-powered crypto currency chain." A research PDF
(`AI Blockchain Architecture Blueprint.pdf`) surveys sovereign AI L1s (Bittensor, Gensyn,
Ritual, NEAR, Morpheus, OpenGradient) and proposes a 4-phase from-scratch L1 (sharded
consensus, TEE/zk verifiable inference, FHE VM, Yuma/dTAO subnet economics, x402/MPP agent
payments, MemSync).

**Reality check (verified against the repo):**
- The repo is **Synex**, a Next.js + NestJS dApp plus Solidity contracts: `LXOM` (ERC-20,
  1B cap, mintable by owner, burnable, pausable, `ERC20Votes`), `SynexStaking`,
  `SynexGovernance`. It is **not** a blockchain. Only ~16.8K LOC is actually committed
  (docs claim 284K).
- The blueprint is a *vision survey*, not a buildable spec. Building Phase 1–3 from scratch
  is a multi-year R&D program (Rust/Go distributed systems, TEE attestation, zk provers,
  FHE VMs) the current TS scaffold cannot contribute to.
- The token is named `LXOM` in code (file `CMAI.sol`); user wrote "LXON/LXOM" — same token.

**Decision (recommended, adopted):** Build the **AI-agent + incentive layer by adopting
existing protocols** rather than building a new L1. Keep LXOM as the native incentive/
governance token. Ship value fast; keep a future app-chain migration as an option, not a
starting gamble. Target existing EVM chains the repo already supports; Base is the natural
primary for x402.

## Goal of this milestone

Prove the thesis with one concrete, shippable vertical slice:
**pay-per-inference AI** — a user/agent pays LXOM (or USDC) via the x402 protocol to run a
verifiable AI task (e.g., smart-contract risk analysis) through an external verifiable-
inference provider, with results settled on-chain. Plus harden LXOM tokenomics so the token
is trustworthy enough to back the network.

## Why LXOM benefits (the user's question)

- **Users:** autonomous AI agents that pay per-call; verifiable (TEE/zk) inference they can
  trust; staking yield for backing AI subnets; on-chain governance via `ERC20Votes`;
  encrypted, portable memory (MemSync-style).
- **Owner/protocol:** real demand sink + fee revenue for LXOM; deflationary buyback-and-burn
  as usage grows; ecosystem moat; fast time-to-market by adopting protocols.
- **Catch:** benefits only materialize after (a) tokenomic hardening and (b) real paid AI
  utility exists. Step 0 + the vertical slice address both.

## Plan (ordered tasks)

### Step 0 — Harden LXOM tokenomics (prerequisite, do first)
Current contract: owner can `mint` freely; full 1B supply preminted to deployer. This kills
trust for a network token.
- [ ] Replace unrestricted `mint` with a **fixed emission schedule**: cap at `MAX_SUPPLY`,
      emission via time-locked/DAO-controlled function (e.g., linear vesting + per-block
      emission) instead of arbitrary owner mint. Keep `burn`/`pause`.
- [ ] Move privileged controls to **`SynexGovernance` (Timelock + Governor)** instead of raw
      `Ownable`. Use existing `ERC20Votes`.
- [ ] Add an **emission/sinks hook** aligned to blueprint Phase 4: staking rewards +
      buyback-and-burn sink (deflationary, AIGENSYN-style 0.5% fee optional later).
- [ ] Write Hardhat tests for vesting/emission/burn/pause and governance handoff.
- [ ] Keep `ERC20Votes` intact (already present) — required for subnet voting later.
- File: `apps/contracts/contracts/CMAI.sol` (rename to `LXOM.sol`), `SynexGovernance.sol`.

### Step 1 — x402 payment server in NestJS backend
- [ ] Implement an HTTP `402 Payment Required` endpoint in `apps/backend` that returns a
      payment spec (chain, address, amount in LXOM/USDC) — adopting the x402 standard
      (Linux Foundation, live on Base/Solana).
- [ ] Agent wallet pays (USDC on Base primary; LXOM accepted optionally) and resubmits signed
      receipt; server fulfills. No API keys/sessions (blueprint Phase 4).
- [ ] Add a `x402` module under `apps/backend/src/modules/` with request/challenge/verify
      flow; reuse existing JWT/auth + Prisma where useful.

### Step 2 — Verifiable AI inference provider integration
- [ ] Integrate an external **verifiable inference** provider (OpenGradient / Gensyn / Ritual
      API) as the "AI subnet" — adopt, do NOT build TEE/zk. Map to blueprint Phase 2/4.
- [ ] Build the first paid AI task: **smart-contract risk analysis** (reuses existing
      `Smart Contract Analyzer` backend module) exposed behind the x402 endpoint.
- [ ] Return inference result + provider attestation/proof reference so output is verifiable.

### Step 3 — Agent wallet + frontend slice
- [ ] Extend existing Wagmi/RainbowKit frontend (`apps/frontend`) with an embedded agent
      wallet that performs x402 payments.
- [ ] Add a minimal UI: "Pay-per-analysis" button → x402 flow → verifiable result.
- [ ] Wire to existing AI Chat / Contract Analyzer pages.

### Step 4 — LXOM staking→subnet allocation (light)
- [ ] Extend `SynexStaking.sol` + staking module so staked LXOM allocates emission weight to
      AI subnets (Bittensor/Morpheus model). Start with a single "Analysis subnet."
- [ ] Document the emission math; no full Yuma consensus yet.

### Step 5 — Validation & docs
- [ ] Deploy LXOM (hardened) + staking to **Base Sepolia**; run x402 flow end-to-end in a
      script/`hardhat` + backend e2e test.
- [ ] Add README section: "AI Agent Payments (x402)" + tokenomics summary.
- [ ] Update `PROJECT_SUMMARY.md` with what shipped vs. deferred.

## Explicitly OUT OF SCOPE (deferred, not now)
- Building a sovereign L1: sharded consensus (NEAR Nightshade), stateless validation,
  on-chain ONNX/PyTorch State Precompiles, Celestia DA, Optimistic TEE-Rollup, zk spot-checks,
  FHE VM, full Yuma/dTAO AMM. Revisit only after the vertical slice has real usage and a
  token economy justifies the cost (then evaluate Cosmos SDK / Avalanche L1 / OP Stack
  app-chain with LXOM as native staking/gas token).

## Risks
- **Token trust:** unhardened owner-mint/premint blocks any serious network → Step 0 is
  mandatory before promotion.
- **Provider dependency:** verifiable inference depends on 3rd-party APIs (OpenGradient etc.);
  mitigate with provider abstraction + fallback.
- **Blueprint reliability:** survey contains aspirational/possibly fabricated figures; treat
  as directional inspiration, validate every claim independently before building on it.
- **Scope creep:** resist jumping to L1 R&D; this milestone must ship a paid AI use case.

## Validation
- `pnpm --filter synex-contracts test` passes (tokenomics + governance).
- Backend x402 endpoint returns 402, accepts payment, fulfills; covered by e2e test.
- End-to-end: frontend agent wallet pays → verifiable contract-analysis result returned.
- Contracts deployed to Base Sepolia; verifies on Etherscan.
- `pnpm lint && pnpm typecheck` clean across workspace.

## Open questions (for user, not blocking Step 0)
1. Primary chain: Base (recommended for x402) vs. Polygon/Ethereum the repo already lists?
2. Payment unit: USDC-only (simplest, blueprint's x402 default) or also accept LXOM?
3. Verifiable-inference provider preference: OpenGradient / Gensyn / Ritual / other?
