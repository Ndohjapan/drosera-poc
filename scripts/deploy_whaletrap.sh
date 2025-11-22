#!/bin/bash

# Deploy WhaleTrap via Drosera
# Usage: ./scripts/deploy_whaletrap.sh <ALERT_VAULT_ADDRESS>

set -e

if [ -z "$1" ]; then
    echo "❌ Error: AlertVault address required"
    echo "Usage: ./scripts/deploy_whaletrap.sh 0xYOUR_ALERTVAULT_ADDRESS"
    exit 1
fi

ALERT_VAULT_ADDRESS=$1
WHALE_THRESHOLD="100000000000000000000000"  # 100,000 USD with 18 decimals

echo "╔═══════════════════════════════════════════════════════╗"
echo "║     Deploying WhaleTrap via Drosera                   ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
echo "📋 Configuration:"
echo "   AlertVault: $ALERT_VAULT_ADDRESS"
echo "   Threshold: \$100,000 USD"
echo ""

# Update drosera.toml
echo "📝 Updating drosera.toml..."
cat >> drosera.toml << EOF

[traps.whale_surge_detector]
path = "out/WhaleTrap.sol/WhaleTrap.json"
response_contract = "$ALERT_VAULT_ADDRESS"
response_function = "alert(bytes32,address,uint8,uint256)"
cooldown_period_blocks = 33
min_number_of_operators = 1
max_number_of_operators = 2
block_sample_size = 10
private_trap = true
whitelist = ["0xc93bf33438c9c636fc49cafe1086c2c424507a15"]
EOF

echo "✅ drosera.toml updated"
echo ""

# Build contracts
echo "🔨 Building contracts..."
forge build

echo ""
echo "🚀 Deploying via Drosera..."
echo "   Run: drosera apply"
echo ""
