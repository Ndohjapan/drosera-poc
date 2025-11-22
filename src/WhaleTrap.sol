// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/ITrap.sol";

/**
 * @title WhaleTrap
 * @notice Drosera trap for detecting whale surge activity
 * @dev Implements ITrap interface required by Drosera
 */
contract WhaleTrap is ITrap {
    // Configuration
    address public responseContract;   // AlertVault contract address
    uint256 public whaleUsdThreshold;  // USD threshold with 18 decimals (e.g., 100000 * 1e18)

    /**
     * @param _responseContract Address of AlertVault contract
     * @param _whaleUsdThreshold USD threshold for whale classification
     */
    constructor(address _responseContract, uint256 _whaleUsdThreshold) {
        responseContract = _responseContract;
        whaleUsdThreshold = _whaleUsdThreshold;
    }

    /**
     * @notice Collect on-chain data for analysis
     * @dev For POC, returns empty - actual metrics passed via shouldRespond
     * @return bytes Empty payload
     */
    function collect() external view returns (bytes memory) {
        // For POC: Drosera node will pass actual metrics directly to shouldRespond
        // In production, this could gather on-chain state
        return abi.encode(address(0));
    }

    /**
     * @notice Determine if trap should respond to detected activity
     * @dev Called by Drosera node with collected data
     * @param data Array of collected data (expects wallet, usdValue, surgeType)
     * @return shouldRespond Whether to trigger response
     * @return responsePayload Data to pass to response contract
     */
    function shouldRespond(bytes[] calldata data) external pure returns (bool, bytes memory) {
        if (data.length == 0) {
            return (false, bytes(""));
        }

        // Decode: data[0] => (address wallet, uint256 usdValue, uint8 surgeType)
        (address wallet, uint256 usdValue, uint8 surgeType) = abi.decode(
            data[0], 
            (address, uint256, uint8)
        );

        // surgeType: 1 = Capital Surge, 2 = Velocity Surge, 3 = Group Surge
        // For POC: trust off-chain detection logic, always respond when called
        // In production: could add additional on-chain validation
        
        bytes memory payload = abi.encode(wallet, usdValue, surgeType);
        return (true, payload);
    }

    /**
     * @notice Update whale threshold (only for testing)
     * @param _newThreshold New USD threshold value
     */
    function updateThreshold(uint256 _newThreshold) external {
        whaleUsdThreshold = _newThreshold;
    }
}
