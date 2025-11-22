# 🐋 OBIE Whale Surge Detection - POC Submission

**Submitted by**: Ndohjapan  
**GitHub**: https://github.com/Ndohjapan/drosera-poc  
**Wallet**: `0xc93bf33438c9c636fc49cafe1086c2c424507a15`

---

## 📌 Executive Summary

This POC implements a **Capital Surge Detection System** for the Drosera Network that monitors the Hoodi testnet in real-time and detects when whale wallets receive unusually large capital inflows (>$100k in 1 hour).

---

## ✅ What Was Built

### 1. **Smart Contracts**
- ✅ **AlertVault.sol** - On-chain alert storage
- ✅ **WhaleTrap.sol** - Drosera trap implementation (stateless, ITrap compliant)

### 2. **Backend System**
- ✅ Real-time blockchain monitoring (5-second polling)
- ✅ Capital surge detection algorithm
- ✅ Automatic alert sending to AlertVault contract
- ✅ Express API for manual testing

### 3. **Drosera Integration**
- ✅ Trap deployed and registered with Drosera network
- ✅ Configured with response contract and function
- ✅ Private trap with whitelist security

---

## 🚀 Deployed Contracts (Hoodi Testnet)

| Component | Address | Transaction |
|-----------|---------|-------------|
| **AlertVault** | `0x8053f1B795668E4Fd5CBe95E0841839bF2900414` | [0x5ff33b...](https://hoodi.etherscan.io/tx/0x5ff33b56394f983bbe0fd9a0520eb998ce20ceaaa95ed4af390208519e0bdb35) |
| **WhaleTrap** | `0x1a389eaa28058eb5FA906F97F495E69e527507b1` | [0x98e825...](https://hoodi.etherscan.io/tx/0x98e825a7cc98fc75ec7ebde62b07a1b1b8450c853aa17b931cff5b7f0aac24d5) |
| **Test Alert** | - | [0xf93540...](https://hoodi.etherscan.io/tx/0xf9354052be989db85cd245f5ec36b9c836d90be3341e3e302f7aaa86964ac5e1) |

---

## 🎯 Technical Implementation

### Detection Logic
**Capital Surge (Type 1)**: Monitors all incoming transactions and tracks wallet balances. When a wallet receives more than $100,000 USD equivalent in a 1-hour rolling window, the system:

1. Generates a unique alert ID
2. Sends transaction to AlertVault contract
3. Logs the event on-chain with wallet address, USD value, and surge type

### Architecture
```
Hoodi Blockchain
    ↓
Backend Monitor (Node.js + Ethers.js)
    ↓ (detects surge)
AlertVault Contract (Solidity)
    ↓ (emits event)
Drosera Network (indexes & responds)
```

### Key Features
- ✅ **Stateless trap design** (no constructor, no storage)
- ✅ **View/Pure function compliance** with ITrap interface
- ✅ **Anti-spam protection** (unique alert IDs prevent duplicates)
- ✅ **Configurable thresholds** via environment variables
- ✅ **Real-time monitoring** with automatic retry logic

---

## 📊 Testing Evidence

### 1. Backend Running
```bash
🚀 Server running on port 3001
✅ AlertVault deployed at: 0x8053f1B795668E4Fd5CBe95E0841839bF2900414
👀 Starting blockchain monitor...
📦 New blocks detected: 1673389 to 1673389 (1 blocks)
```

### 2. Manual Alert Test (Successful)
```json
{
  "success": true,
  "txHash": "0xf9354052be989db85cd245f5ec36b9c836d90be3341e3e302f7aaa86964ac5e1",
  "message": "Alert sent to blockchain"
}
```

### 3. Drosera Deployment (Successful)
```
✅ User has an active Drosera subscription.
Response function verified ✅
Transaction Hash: 0x98e825a7cc98fc75ec7ebde62b07a1b1b8450c853aa17b931cff5b7f0aac24d5
Trap address: 0x1a389eaa28058eb5FA906F97F495E69e527507b1
```

---

## 🔍 How to Verify

### Check AlertVault Contract
```bash
cast call 0x8053f1B795668E4Fd5CBe95E0841839bF2900414 \
  "alertCount()(uint256)" \
  --rpc-url https://eth-hoodi.g.alchemy.com/v2/6rtLdAW8i0XoClsT8xIsi
```

### Query Drosera for Trap Status
```bash
drosera traps list
```

### Test Backend Health
```bash
curl http://YOUR_VPS_IP:3001/health
```

---

## 📁 Repository Structure
```
drosera-poc/
├── src/
│   ├── AlertVault.sol          # Alert storage contract
│   ├── WhaleTrap.sol            # Drosera trap
│   └── interfaces/ITrap.sol     # ITrap interface
├── backend/
│   ├── index.js                 # Express server
│   ├── blockMonitor.js          # Blockchain monitoring
│   └── alertSender.js           # Alert sender
├── drosera.toml                 # Trap configuration
├── foundry.toml                 # Foundry config
├── README.md                    # Full documentation
└── SUBMISSION.md                # This file
```

---

## 🎓 What I Learned

1. **Solidity Constraints**: Drosera traps must be stateless (no constructor, no storage variables)
2. **Function Modifiers**: `collect()` must be `view`, `shouldRespond()` must be `pure`
3. **Error Handling**: Handling empty data during dry-run tests
4. **Blockchain Monitoring**: Polling vs WebSocket trade-offs
5. **Gas Optimization**: Efficient alert ID generation using keccak256

---

## 🚧 Future Enhancements

- [ ] **Velocity Surge Detection** (Option B) - Track transaction frequency
- [ ] **Group Surge Detection** (Option C) - Detect coordinated whale activity
- [ ] **Price Oracle Integration** - Real-time ETH/USD conversion
- [ ] **Database Persistence** - Historical whale tracking
- [ ] **Notification System** - Discord/Telegram alerts
- [ ] **Dashboard** - Grafana visualization

---

## 📞 Contact

- **GitHub**: [@Ndohjapan](https://github.com/Ndohjapan)
- **Repository**: https://github.com/Ndohjapan/drosera-poc
- **Wallet**: `0xc93bf33438c9c636fc49cafe1086c2c424507a15`

---

## 🙏 Acknowledgments

Thank you to the Drosera team for the opportunity to build on this innovative platform. This POC demonstrates a working whale detection system that can be expanded to protect DeFi protocols from coordinated attacks.

**Ready to catch whales! 🐋**