#!/bin/bash

# Script to install Drosera contracts interface
# This is a fallback if forge install fails due to authentication

echo "📦 Installing Drosera ITrap interface..."

# Create directories
mkdir -p lib/drosera-contracts/src/interfaces

# Download ITrap.sol directly from GitHub
echo "⬇️  Downloading ITrap.sol..."
curl -L -o lib/drosera-contracts/src/interfaces/ITrap.sol \
  https://raw.githubusercontent.com/drosera-network/drosera-contracts/main/src/interfaces/ITrap.sol

# Check if download was successful
if [ -f "lib/drosera-contracts/src/interfaces/ITrap.sol" ]; then
    echo "✅ ITrap.sol downloaded successfully!"
    echo "📁 Location: lib/drosera-contracts/src/interfaces/ITrap.sol"
else
    echo "❌ Download failed. Using local interface instead."
    echo "ℹ️  The project includes a local ITrap interface in src/interfaces/"
fi

echo ""
echo "🔨 Now run: forge build"
