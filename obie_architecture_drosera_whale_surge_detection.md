# OBIE Architecture — Whale Surge Detection (Version 1.0)

## Overview
This document describes the full architecture for the On-Chain Behaviour Intelligence Engine (OBIE) focused on the Whale Surge Detection Trap for the Drosera Hoodi testnet. It covers components, data flows, interfaces, deployments, security, scaling, observability, and sample snippets to bootstrap the POC.

---

## High-level goals
- Real-time detection of whale surges (Options A, B, C combined) on the Hoodi simulated chain.
- Dynamic discovery of new whales (automatic promotion/demotion logic).
- Simple on-chain alert response contract (emits event and stores minimal record).
- Deployable as a Drosera Trap (foundry template) and integrable with a Drosera node.

---

## System Components
1. **Node / Ingest Layer** (Hoodi node)
   - Websocket/RPC(s) to Hoodi testnet via Contabo VPS or local node.
   - Responsibilities: stream new blocks, transactions, logs, internal txs.

2. **Event Normalizer** (Node.js service)
   - Consumes raw chain events and normalizes to a unified event schema.
   - Outputs JSON events to processing queue.

3. **Processing & Detection Engine** (Node.js + Worker pool)
   - Computes wallet metrics (balance, velocity, token exposure).
   - Maintains sliding windows per wallet (e.g., 5m, 1h, 24h).
   - Runs detection rules for surge types A/B/C.
   - Promotes wallets to `whale` status based on dynamic rules.

4. **State Store**
   - Fast key-value (Redis) for sliding windows and ephemeral state.
   - PostgreSQL for durable wallet profiles, alerts, and audit logs.

5. **Response Controller** (Express API)
   - Decides when to call Drosera CLI or on-chain response contract for alerts.
   - Sends signed transactions using node wallet to `DiscordTrap`-style response contract.

6. **On-chain Alert Contract** (Solidity)
   - Simple contract that accepts an alert (emits event, stores compact record).
   - Deployed on Hoodi testnet; trap contract will `collect()` sensed data and `shouldRespond()` will instruct responding address.

7. **Drosera Trap (Foundry)**
   - Trap contract implementing ITrap interface.
   - Collects recent metrics via call to `ResponseContract` or via encoded payload.
   - ShouldRespond logic encodes conditions per Drosera spec.

8. **Ops / Monitoring**
   - Grafana + Prometheus for metrics.
   - ELK or Loki for logs.
   - Alerts to Discord / Telegram / Webhooks.

9. **Management UI (optional)**
   - Simple dashboard to visualize whale list, triggers, and history.

---

## Data Flow (sequence)
1. Chain -> websocket/RPC -> Event Normalizer.
2. Event Normalizer -> Redis stream (or Kafka) -> Processing Workers.
3. Workers update sliding windows in Redis and push to Postgres for durable records.
4. Detection rule fires -> Worker creates an Alert object -> Response Controller signs and sends a transaction to the Alert contract OR calls `drosera apply` with private key to register a trap response.
5. Alert contract emits event -> Drosera network sees sealed response -> Cadet/Captain badge eligibility recorded off-chain/on-chain per Drosera flow.
6. Notification channel receives webhook + dashboard updated.

---

## Data Models
### WalletProfile (Postgres)
- address (pk)
- is_whale boolean
- net_worth_usd numeric
- last_promoted_at timestamp
- last_demoted_at timestamp
- velocity_1m numeric
- velocity_1h numeric
- velocity_24h numeric
- reputation_score int
- metadata jsonb

### Alert (Postgres)
- id (pk)
- wallet_address
- type (WHALER_SURGE / VELOCITY_SURGE / GROUP_SURGE)
- severity (LOW/MED/HIGH/CRITICAL)
- metric_snapshot jsonb
- tx_hash optional
- created_at timestamp

---

## Detection Rules (pseudo)
1. Capital Surge (A): if incoming_value_usd_in_window >= A_THRESHOLD → alert
2. Velocity Surge (B): if tx_count_in_window >= B_TX_THRESHOLD OR moved_value_usd_in_window >= B_VALUE_THRESHOLD → alert
3. Group Surge (C): if count(distinct_whales_interacting_with_protocol) >= C_THRESHOLD within WINDOW → alert
4. Promotion to Whale: if net_worth_usd >= WHALE_NETWORTH_PERCENTILE or percent_increase_24h >= PROMOTION_RATE → mark whale

Parameters are configurable via environment or DB.

---

## Key Interfaces & API
### Event Normalizer -> Processing (internal queue)
- JSON event schema: { event_id, block_number, tx_hash, from, to, value_wei, token_address, token_symbol, usd_value, timestamp }

### Processing -> Response Controller
- POST /alerts { wallet, type, severity, metrics, recommended_action }

### Response Controller -> On-chain
- Creates and signs tx calling AlertContract.alert(wallet, type, metadataHash)

---

## Solidity Contracts (brief)
1. `AlertVault.sol` (on-chain responder)
- function alert(bytes32 alertId, address wallet, uint8 alertType, string calldata metaCid) external;
- event AlertLogged(bytes32 indexed alertId, address indexed wallet, uint8 alertType, string metaCid);

2. `WhaleTrap.sol` (implements ITrap)
- function collect() external view returns(bytes memory) { return abi.encode(latestMetrics...); }
- function shouldRespond(bytes[] calldata data) external pure returns (bool, bytes memory) { /* decode and decide */ }

(Full contract templates will be generated after architecture approval.)

---

## Deployment & Dev Flow (commands)
- `forge init -t drosera-network/trap-foundry-template`
- `bun install`
- `forge build`
- Edit `src/WhaleTrap.sol` and `drosera.toml`
- `DROSERA_PRIVATE_KEY=... drosera apply`

Node / Backend
- `git clone <repo>`
- `npm ci`
- `cp .env.example .env` and fill keys (RPC, DB, REDIS, PRIVATE_KEY)
- `npm run dev`

---

## Operations & Monitoring
- Metrics: events/sec, alerts/sec, avg processing latency, queue lag, redis memory usage
- Traces: instrument workers with OpenTelemetry
- Logs: structured JSON for parsing in Loki/ELK
- Healthchecks: /health endpoint, node process restart policy

---

## Testing Plan
- Unit tests for detection logic (node mocha/jest)
- Integration tests: local Hardhat/Hoodi fork deploy of contracts and run simulated whale txs
- End-to-end: deploy to Hoodi testnet, simulate whale surge, verify alert contract emission and Drosera response

---

## Security Notes
- Keep private keys off repo; use Vault or environment with restricted access.
- Rate-limit any automatic on-chain responses to avoid accidental spamming.
- Audit Solidity contracts (even the simple alert contract) before mainnet.

---

## Next steps (recommended immediate actions)
1. Provision Contabo VPS and spin up Hoodi node (or use Ankr Hoodi RPC). Add RPC to .env.
2. Scaffold trap using Foundry template and create `WhaleTrap.sol` file.
3. Implement basic event ingestion -> detection -> alert loop locally using Hoodi testnet.
4. Deploy `AlertVault.sol` to Hoodi and wire Response Controller.

---

## Appendix: sample env variables
```
RPC_URL=https://hoodi-rpc.example
PRIVATE_KEY=0x...
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgres://user:pass@localhost:5432/obie
WHALE_THRESHOLD_USD=100000
PROMOTION_PERCENTAGE=300
WINDOW_MINUTES=60
```


---

End of Architecture Document.

