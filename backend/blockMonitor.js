const { ethers } = require('ethers');
const { sendOnChainAlert } = require('./alertSender');

// Initialize provider
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// Configuration
const WHALE_THRESHOLD = parseFloat(process.env.WHALE_THRESHOLD_USD) || 100000;
const MIN_TX_VALUE = parseFloat(process.env.MIN_TX_VALUE_USD) || 10000;
const ETH_PRICE_USD = parseFloat(process.env.ETH_PRICE_USD) || 2000;
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL_MS) || 5000;

// In-memory storage for wallet activity tracking
// In production, use Redis or database
const walletActivity = new Map();

/**
 * Start monitoring the blockchain for whale activity
 */
async function startBlockMonitor() {
  try {
    // Get starting block number
    let lastProcessedBlock = await provider.getBlockNumber();
    console.log(`✅ Blockchain monitor started`);
    console.log(`   Starting from block: ${lastProcessedBlock}`);
    console.log(`   Polling interval: ${POLL_INTERVAL}ms`);
    console.log(`   Whale threshold: $${WHALE_THRESHOLD.toLocaleString()}`);
    console.log(`   Min transaction: $${MIN_TX_VALUE.toLocaleString()}`);
    console.log(`   ETH price: $${ETH_PRICE_USD}`);
    console.log('');
    
    // Poll for new blocks
    setInterval(async () => {
      try {
        const currentBlock = await provider.getBlockNumber();
        
        // Check if there are new blocks
        if (currentBlock > lastProcessedBlock) {
          const blockCount = currentBlock - lastProcessedBlock;
          console.log(`📦 New blocks detected: ${lastProcessedBlock + 1} to ${currentBlock} (${blockCount} blocks)`);
          
          // Process each new block
          for (let blockNum = lastProcessedBlock + 1; blockNum <= currentBlock; blockNum++) {
            await processBlock(blockNum);
          }
          
          lastProcessedBlock = currentBlock;
        }
        
      } catch (error) {
        console.error('❌ Error in block monitor loop:', error.message);
      }
    }, POLL_INTERVAL);
    
  } catch (error) {
    console.error('❌ Failed to start block monitor:', error.message);
    console.log('🔄 Retrying in 10 seconds...');
    setTimeout(startBlockMonitor, 10000);
  }
}

/**
 * Process a single block and all its transactions
 * @param {number} blockNumber - Block number to process
 */
async function processBlock(blockNumber) {
  try {
    // Fetch block with all transactions
    const block = await provider.getBlock(blockNumber, true);
    
    if (!block || !block.transactions || block.transactions.length === 0) {
      console.log(`   └─ Block ${blockNumber}: No transactions`);
      return;
    }
    
    console.log(`   └─ Block ${blockNumber}: ${block.transactions.length} transactions`);
    
    // Process each transaction in the block
    for (const tx of block.transactions) {
      await processTransaction(tx);
    }
    
  } catch (error) {
    console.error(`   ❌ Error processing block ${blockNumber}:`, error.message);
  }
}

/**
 * Process a single transaction and check for whale activity
 * @param {Object} tx - Transaction object
 */
async function processTransaction(tx) {
  try {
    // Skip if no value transferred or no recipient
    if (!tx.value || tx.value === 0n || !tx.to) {
      return;
    }
    
    // Convert Wei to ETH to USD
    const valueEth = parseFloat(ethers.formatEther(tx.value));
    const valueUsd = valueEth * ETH_PRICE_USD;
    
    // Only track large transactions
    if (valueUsd < MIN_TX_VALUE) {
      return;
    }
    
    console.log(`      💰 Large transfer: $${valueUsd.toFixed(2)} → ${tx.to.substring(0, 10)}...`);
    
    // Update wallet activity tracking
    await updateWalletActivity(tx.to, valueUsd, tx.hash);
    
  } catch (error) {
    console.error('      ❌ Error processing transaction:', error.message);
  }
}

/**
 * Update wallet activity and check for surge detection
 * @param {string} address - Wallet address
 * @param {number} valueUsd - Transaction value in USD
 * @param {string} txHash - Transaction hash
 */
async function updateWalletActivity(address, valueUsd, txHash) {
  const walletAddress = address.toLowerCase();
  
  // Initialize wallet activity if not exists
  if (!walletActivity.has(walletAddress)) {
    walletActivity.set(walletAddress, {
      totalReceived: 0,
      transactionCount: 0,
      recentTransactions: [],
      lastAlert: 0  // Timestamp of last alert to prevent spam
    });
  }
  
  const activity = walletActivity.get(walletAddress);
  
  // Add this transaction to recent history
  activity.recentTransactions.push({
    value: valueUsd,
    timestamp: Date.now(),
    txHash: txHash
  });
  
  // Update totals
  activity.totalReceived += valueUsd;
  activity.transactionCount += 1;
  
  // Clean old transactions (keep only last 1 hour)
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  activity.recentTransactions = activity.recentTransactions.filter(
    t => t.timestamp > oneHourAgo
  );
  
  // Calculate total received in last hour
  const hourlyTotal = activity.recentTransactions.reduce(
    (sum, t) => sum + t.value, 
    0
  );
  
  // CAPITAL SURGE DETECTION
  // Trigger alert if wallet received more than threshold in 1 hour
  if (hourlyTotal >= WHALE_THRESHOLD) {
    // Prevent alert spam (only alert once per hour per wallet)
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    if (activity.lastAlert < oneHourAgo) {
      console.log('');
      console.log('🚨 ═══════════════════════════════════════════════════');
      console.log('🚨 CAPITAL SURGE DETECTED!');
      console.log('🚨 ═══════════════════════════════════════════════════');
      console.log(`   Wallet: ${walletAddress}`);
      console.log(`   Received in 1 hour: $${hourlyTotal.toFixed(2)}`);
      console.log(`   Transaction count: ${activity.recentTransactions.length}`);
      console.log(`   Threshold: $${WHALE_THRESHOLD.toLocaleString()}`);
      console.log('');
      
      try {
        // Send alert to blockchain
        await sendOnChainAlert(walletAddress, hourlyTotal, 1); // Type 1 = Capital Surge
        
        // Update last alert timestamp
        activity.lastAlert = Date.now();
        
      } catch (error) {
        console.error('❌ Failed to send alert for surge:', error.message);
      }
    } else {
      console.log(`      ⏭️  Surge detected for ${walletAddress} but alert recently sent, skipping`);
    }
  }
  
  // Save updated activity
  walletActivity.set(walletAddress, activity);
  
  // Clean up old wallet data (prevent memory leak)
  // Remove wallets with no activity in last 24 hours
  const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
  for (const [addr, act] of walletActivity.entries()) {
    if (act.recentTransactions.length === 0 || 
        act.recentTransactions[act.recentTransactions.length - 1].timestamp < twentyFourHoursAgo) {
      walletActivity.delete(addr);
    }
  }
}

module.exports = { startBlockMonitor };
