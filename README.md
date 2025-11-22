# OBIE - Whale Surge Detection POC

**On-Chain Behaviour Intelligence Engine for Drosera Network**

A proof-of-concept trap that detects whale activity surges on the Hoodi testnet and logs alerts on-chain via Drosera.

---

## 📋 Overview

This project implements a **Capital Surge Detection** system that:
- ✅ Monitors Hoodi blockchain in real-time
- ✅ Detects when wallets receive large amounts of capital (>$100k in 1 hour)
- ✅ Sends on-chain alerts to AlertVault contract
- ✅ Integrates with Drosera trap system

---

## 🏗️ Project Structure

```
my-drosera-trap/
├── src/
│   ├── AlertVault.sol       # On-chain alert storage contract
│   └── WhaleTrap.sol         # Drosera trap implementation
├── backend/
│   ├── index.js              # Express server
│   ├── blockMonitor.js       # Blockchain monitoring logic
│   ├── alertSender.js        # Send alerts to AlertVault
│   ├── package.json          # Node.js dependencies
│   └── .env.example          # Environment configuration template
├── scripts/
│   └── (deployment scripts)
├── foundry.toml              # Foundry configuration
├── drosera.toml              # Drosera trap configuration
└── README.md                 # This file
```

---

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v18+)
2. **Foundry** (for Solidity compilation and deployment)
3. **Git** (for version control)
4. Hoodi testnet tokens in your wallet
5. VPS with Drosera node running

### Installation Steps

#### 1️⃣ **Clone Repository to Your VPS**

```bash
ssh user@your-vps-ip
cd ~
git clone https://github.com/YOUR_USERNAME/my-drosera-trap.git
cd my-drosera-trap
```

#### 2️⃣ **Install Foundry (if not already installed)**

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

#### 3️⃣ **Install Drosera Contracts (Choose One Method)**

The project now includes a local ITrap interface, so you can skip this step if you encounter issues.

**Method A: Try forge install first (may require auth):**
```bash
forge install drosera-network/drosera-contracts --no-commit
```

**Method B: If Method A fails, use the helper script:**
```bash
chmod +x scripts/install_itrap.sh
./scripts/install_itrap.sh
```

**Method C: Manual download:**
```bash
mkdir -p lib/drosera-contracts/src/interfaces
curl -L -o lib/drosera-contracts/src/interfaces/ITrap.sol \
  https://raw.githubusercontent.com/drosera-network/drosera-contracts/main/src/interfaces/ITrap.sol
```

**Method D: Use local interface (already included):**
The project includes `src/interfaces/ITrap.sol` - no download needed!

#### 4️⃣ **Compile Smart Contracts**

```bash
forge build
```

You should see output like:
```
[⠊] Compiling...
[⠒] Compiling 2 files with 0.8.20
[⠢] Solc 0.8.20 finished in 1.23s
Compiler run successful!
```

#### 5️⃣ **Deploy AlertVault Contract**

Using Foundry:

```bash
forge create src/AlertVault.sol:AlertVault \
  --rpc-url https://eth-hoodi.g.alchemy.com/v2/6rtLdAW8i0XoClsT8xIsi \
  --private-key YOUR_PRIVATE_KEY \
  --broadcast \
  --legacy
```

**Save the deployed contract address!** You'll need it for the next steps.

Example output:
```
Deployer: 0xc93bf33438c9c636fc49cafe1086c2c424507a15
Deployed to: 0x1234567890abcdef1234567890abcdef12345678
Transaction hash: 0xabc...

Deployer: 0xc93BF33438C9c636fC49caFe1086C2C424507A15
Deployed to: 0x8053f1B795668E4Fd5CBe95E0841839bF2900414
Transaction hash: 0x5ff33b56394f983bbe0fd9a0520eb998ce20ceaaa95ed4af390208519e0bdb35

```

#### 6️⃣ **Configure Backend**

```bash
cd backend
npm install
cp .env.example .env
nano .env
```

Update `.env` with:
```env
RPC_URL=https://eth-hoodi.g.alchemy.com/v2/6rtLdAW8i0XoClsT8xIsi
PRIVATE_KEY=0xYOUR_ACTUAL_PRIVATE_KEY
ALERT_VAULT_ADDRESS=0xYOUR_DEPLOYED_ALERTVAULT_ADDRESS
WHALE_THRESHOLD_USD=100000
PORT=3001
```

#### 7️⃣ **Start Backend**

```bash
npm start
```

Expected output:
```
═══════════════════════════════════════════════════════
🐋 OBIE - Whale Surge Detection Backend
═══════════════════════════════════════════════════════
🚀 Server running on port 3001
📊 Health check: http://localhost:3001/health
📡 RPC Endpoint: https://eth-hoodi.g.alchemy.com/v2/...
💰 Whale Threshold: $100000

✅ AlertVault deployed at: 0x1234...
👀 Starting blockchain monitor...

✅ Blockchain monitor started
   Starting from block: 12345
   Polling interval: 5000ms
```

#### 8️⃣ **Test Alert System**

In a new terminal:

```bash
curl -X POST http://localhost:3001/api/alert \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "usdValue": 150000,
    "surgeType": 1
  }'
```

Check the backend logs - you should see the alert being sent to the blockchain!

#### 9️⃣ **Deploy WhaleTrap to Drosera**

Edit `drosera.toml` and add:

```toml
[traps.whale_surge_detector]
path = "out/WhaleTrap.sol/WhaleTrap.json"
response_contract = "0xYOUR_ALERTVAULT_ADDRESS"
response_function = "alert(bytes32,address,uint8,uint256)"
cooldown_period_blocks = 33
min_number_of_operators = 1
max_number_of_operators = 2
block_sample_size = 10
private_trap = true
whitelist = ["0xc93bf33438c9c636fc49cafe1086c2c424507a15"]
```

Deploy WhaleTrap:

```bash
# Build contracts
forge build

# Deploy via Drosera
drosera apply
```

---

## ✅ Deployed Contracts (Hoodi Testnet)

- **AlertVault Contract**: `0x8053f1B795668E4Fd5CBe95E0841839bF2900414`
  - [View on Explorer](https://hoodi.etherscan.io/address/0x8053f1B795668E4Fd5CBe95E0841839bF2900414)
- **WhaleTrap Address**: `0x1a389eaa28058eb5FA906F97F495E69e527507b1`
  - [Deployment Tx](https://hoodi.etherscan.io/tx/0x98e825a7cc98fc75ec7ebde62b07a1b1b8450c853aa17b931cff5b7f0aac24d5)
- **Deployer Wallet**: `0xc93bf33438c9c636fc49cafe1086c2c424507a15`

### Test Alert Transaction
- **Example Alert Tx**: `0xf9354052be989db85cd245f5ec36b9c836d90be3341e3e302f7aaa86964ac5e1`
  - [View on Explorer](https://hoodi.etherscan.io/tx/0xf9354052be989db85cd245f5ec36b9c836d90be3341e3e302f7aaa86964ac5e1)

---

## 🧪 Testing

### Health Check

```bash
curl http://localhost:3001/health
```

### Manual Alert Test

```bash
curl -X POST http://localhost:3001/api/alert \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "usdValue": 200000,
    "surgeType": 1
  }'
```

### Monitor Logs

```bash
# Backend logs
tail -f ~/my-drosera-trap/backend/nohup.out

# Drosera node logs
journalctl -u drosera -f
```

---

## 📊 How It Works

### Detection Flow

```
1. Blockchain produces new block
   ↓
2. Backend polls for new blocks every 5 seconds
   ↓
3. For each transaction in block:
   - Convert value to USD
   - Track wallet activity
   ↓
4. If wallet receives >$100k in 1 hour:
   - Generate unique alert ID
   - Send transaction to AlertVault contract
   ↓
5. AlertVault stores alert on-chain
   - Emits AlertLogged event
   ↓
6. Drosera node indexes the event
```

### Surge Detection Logic

**Capital Surge (Type 1)**: Triggered when a wallet receives more than `WHALE_THRESHOLD_USD` (default $100k) in a 1-hour rolling window.

**Configurable in `.env`:**
- `WHALE_THRESHOLD_USD` - Minimum USD to qualify as surge
- `MIN_TX_VALUE_USD` - Minimum transaction value to track
- `ETH_PRICE_USD` - ETH price for USD conversion
- `POLL_INTERVAL_MS` - How often to check for new blocks

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `RPC_URL` | Hoodi RPC endpoint | Required |
| `PRIVATE_KEY` | Your wallet private key | Required |
| `ALERT_VAULT_ADDRESS` | Deployed AlertVault address | Required |
| `WHALE_THRESHOLD_USD` | USD threshold for surge | 100000 |
| `MIN_TX_VALUE_USD` | Min transaction to track | 10000 |
| `ETH_PRICE_USD` | ETH price for conversion | 2000 |
| `POLL_INTERVAL_MS` | Block polling interval | 5000 |
| `PORT` | Backend server port | 3001 |

---

## 🐛 Troubleshooting

### Backend won't start

**Error**: `Cannot find module 'ethers'`
**Solution**: 
```bash
cd backend
npm install
```

### No blocks detected

**Check RPC connection:**
```bash
curl -X POST https://eth-hoodi.g.alchemy.com/v2/YOUR_KEY \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### Alert transaction fails

**Check:**
1. Wallet has Hoodi testnet tokens
2. `ALERT_VAULT_ADDRESS` is correct
3. `PRIVATE_KEY` is correct and not quoted

### Drosera trap not responding

**Verify:**
1. WhaleTrap deployed successfully
2. `response_contract` in `drosera.toml` matches AlertVault address
3. Your wallet is in the `whitelist`

---

## 📝 API Endpoints

### GET `/health`

Health check and configuration info.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-22T10:30:00.000Z",
  "config": {
    "rpcUrl": "https://eth-hoodi.g.alchemy.com/v2/...",
    "alertVault": "0x1234...",
    "whaleThreshold": "$100000",
    "port": 3001
  }
}
```

### GET `/status`

Monitoring status.

**Response:**
```json
{
  "monitoring": true,
  "message": "Blockchain monitoring active"
}
```

### POST `/api/alert`

Manual alert trigger (for testing).

**Request body:**
```json
{
  "wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "usdValue": 150000,
  "surgeType": 1
}
```

**Response:**
```json
{
  "success": true,
  "txHash": "0xabc123...",
  "message": "Alert sent to blockchain"
}
```

---

## 🔐 Security Notes

- **Never commit `.env` file** - it contains your private key
- Keep `PRIVATE_KEY` secret
- Use separate wallet for testnet
- AlertVault has anti-spam protection (one alert per ID)

---

## 🚧 Future Enhancements

- [ ] Velocity Surge detection (Option B)
- [ ] Group Surge detection (Option C)
- [ ] Real-time price oracle integration
- [ ] Database persistence (PostgreSQL/MongoDB)
- [ ] Redis for distributed state
- [ ] Grafana dashboards
- [ ] Discord/Telegram notifications

---

## 📚 Resources

- [Drosera Documentation](https://docs.drosera.io)
- [Foundry Book](https://book.getfoundry.sh/)
- [Ethers.js Docs](https://docs.ethers.org/v6/)
- [Hoodi Testnet](https://hoodi.drosera.io)

---

## 📄 License

MIT

---

## 👤 Author

Built for Drosera Network Hoodi Testnet

**Wallet**: `0xc93bf33438c9c636fc49cafe1086c2c424507a15`

---

## 🎯 Mission Accomplished

This POC demonstrates:
- ✅ Real-time blockchain monitoring
- ✅ Whale detection algorithms
- ✅ On-chain alert system
- ✅ Drosera trap integration
- ✅ Scalable architecture

**Ready to detect whales! 🐋**
