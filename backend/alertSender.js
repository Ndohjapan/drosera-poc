const { ethers } = require('ethers');

// AlertVault contract ABI (only the function we need)
const abi = [
  'function alert(bytes32 alertId, address wallet, uint8 alertType, uint256 usdValue) external',
  'event AlertLogged(bytes32 indexed alertId, address indexed wallet, uint8 indexed alertType, uint256 usdValue, address reporter)'
];

console.log("PRIVATE KEY:", process.env.PRIVATE_KEY);

// Initialize provider and wallet
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

/**
 * Send an alert to the AlertVault contract on-chain
 * @param {string} walletAddress - The whale wallet address
 * @param {number} usdValue - USD value of the surge
 * @param {number} surgeType - Type of surge (1=Capital, 2=Velocity, 3=Group)
 * @returns {Promise<Object>} Transaction object
 */
async function sendOnChainAlert(walletAddress, usdValue, surgeType = 1) {
  try {
    // Create contract instance
    const alertVault = new ethers.Contract(
      process.env.ALERT_VAULT_ADDRESS, 
      abi, 
      wallet
    );

    // Generate unique alert ID using keccak256 hash
    const alertId = ethers.keccak256(
      ethers.toUtf8Bytes(`${walletAddress}|${Date.now()}|${surgeType}`)
    );
    
    // Convert USD value to BigInt with 18 decimals precision
    // Example: 100000 USD -> 100000000000000000000000 (100000 * 10^18)
    const usdValueBigInt = ethers.parseUnits(usdValue.toFixed(2), 18);
    
    console.log('');
    console.log('📤 Sending alert to AlertVault contract...');
    console.log(`   Contract: ${process.env.ALERT_VAULT_ADDRESS}`);
    console.log(`   Alert ID: ${alertId}`);
    console.log(`   Wallet: ${walletAddress}`);
    console.log(`   USD Value: $${usdValue.toFixed(2)}`);
    console.log(`   Surge Type: ${getSurgeTypeName(surgeType)}`);
    
    // Send transaction to blockchain
    const tx = await alertVault.alert(alertId, walletAddress, surgeType, usdValueBigInt);
    console.log(`   TX Hash: ${tx.hash}`);
    console.log('   ⏳ Waiting for confirmation...');
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    console.log(`   ✅ Alert confirmed in block ${receipt.blockNumber}`);
    console.log('');
    
    return tx;
    
  } catch (error) {
    console.error('❌ Failed to send alert:', error.message);
    throw error;
  }
}

/**
 * Get human-readable surge type name
 * @param {number} surgeType - Surge type code
 * @returns {string} Surge type name
 */
function getSurgeTypeName(surgeType) {
  const types = {
    1: 'Capital Surge',
    2: 'Velocity Surge',
    3: 'Group Surge'
  };
  return types[surgeType] || 'Unknown';
}

module.exports = { sendOnChainAlert };
