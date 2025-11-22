#!/bin/bash

# Deploy AlertVault to Hoodi Testnet
# Usage: ./scripts/deploy_alertvault.sh

set -e

echo "╔═══════════════════════════════════════════════════════╗"
echo "║     Deploying AlertVault to Hoodi Testnet            ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Check if private key is set
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY environment variable not set"
    echo "Usage: PRIVATE_KEY=0x... ./scripts/deploy_alertvault.sh"
    exit 1
fi

# RPC URL
RPC_URL="https://eth-hoodi.g.alchemy.com/v2/6rtLdAW8i0XoClsT8xIsi"

echo "📡 RPC Endpoint: $RPC_URL"
echo "🔨 Compiling contracts..."
forge build

echo ""
echo "🚀 Deploying AlertVault..."
forge create src/AlertVault.sol:AlertVault \
  --rpc-url "$RPC_URL" \
  --private-key "$PRIVATE_KEY"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Copy the deployed contract address"
echo "   2. Update backend/.env: ALERT_VAULT_ADDRESS=0x..."
echo "   3. Restart backend: cd backend && npm start"
echo ""
