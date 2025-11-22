require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { sendOnChainAlert } = require('./alertSender');
const { startBlockMonitor } = require('./blockMonitor');

const app = express();
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    config: {
      rpcUrl: process.env.RPC_URL,
      alertVault: process.env.ALERT_VAULT_ADDRESS || 'not deployed',
      whaleThreshold: `$${process.env.WHALE_THRESHOLD_USD || 100000}`,
      port: process.env.PORT || 3001
    }
  });
});

// Get current monitoring status
app.get('/status', (req, res) => {
  res.json({
    monitoring: process.env.ALERT_VAULT_ADDRESS && process.env.ALERT_VAULT_ADDRESS !== '0x...',
    message: process.env.ALERT_VAULT_ADDRESS && process.env.ALERT_VAULT_ADDRESS !== '0x...' 
      ? 'Blockchain monitoring active' 
      : 'Deploy AlertVault contract first, then update .env and restart'
  });
});

// Manual alert endpoint (for testing)
app.post('/api/alert', async (req, res) => {
  try {
    const { wallet, usdValue, surgeType } = req.body;
    
    if (!wallet || !usdValue) {
      return res.status(400).json({ error: 'wallet and usdValue required' });
    }

    console.log(`📤 Received manual alert request`);
    console.log(`   Wallet: ${wallet}`);
    console.log(`   Value: $${usdValue}`);
    console.log(`   Type: ${surgeType || 1}`);
    
    const tx = await sendOnChainAlert(wallet, usdValue, surgeType || 1);
    return res.json({ 
      success: true, 
      txHash: tx.hash,
      message: 'Alert sent to blockchain'
    });
    
  } catch (err) {
    console.error('❌ Error sending alert:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Start server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('🐋 OBIE - Whale Surge Detection Backend');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`📡 RPC Endpoint: ${process.env.RPC_URL}`);
  console.log(`💰 Whale Threshold: $${process.env.WHALE_THRESHOLD_USD || 100000}`);
  console.log('');
  
  // Check if AlertVault is deployed
  if (process.env.ALERT_VAULT_ADDRESS && process.env.ALERT_VAULT_ADDRESS !== '0x...') {
    console.log(`✅ AlertVault deployed at: ${process.env.ALERT_VAULT_ADDRESS}`);
    console.log('👀 Starting blockchain monitor...');
    console.log('');
    startBlockMonitor();
  } else {
    console.log('⚠️  AlertVault not deployed yet');
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. Deploy AlertVault.sol to Hoodi testnet');
    console.log('   2. Update ALERT_VAULT_ADDRESS in .env file');
    console.log('   3. Restart this backend');
    console.log('');
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});
