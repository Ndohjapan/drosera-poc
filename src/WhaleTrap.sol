// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ITrap} from "./interfaces/ITrap.sol";

/**
 * @title WhaleTrap
 * @notice Drosera trap for detecting whale surge activity
 * @dev Implements ITrap interface required by Drosera
 * @dev Stateless design - no constructor or state variables allowed by Drosera
 */
contract WhaleTrap is ITrap {
    /**
     * @notice Collect on-chain data for analysis
     * @dev For POC, returns empty - actual metrics passed via shouldRespond
     * @return bytes Empty payload
     */
    function collect() external view returns (bytes memory) {
        // For POC: Drosera node will pass actual metrics directly to shouldRespond
        // In production, this could gather on-chain state
        return "";
    }

    /**
     * @notice Determine if trap should respond to detected activity
     * @dev Called by Drosera node with collected data
     * @param data Array of collected data (expects wallet, usdValue, surgeType)
     * @return shouldRespond Whether to trigger response
     * @return responsePayload Data to pass to response contract
     */
    function shouldRespond(bytes[] calldata data) external view returns (bool, bytes memory) {
        if (data.length == 0) {
            return (false, "");
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
}
