// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ITrap
 * @notice Interface for Drosera trap contracts
 * @dev All traps must implement this interface
 */
interface ITrap {
    /**
     * @notice Collect data from the blockchain
     * @dev Called by Drosera operators to gather on-chain data
     * @return Encoded data to be analyzed
     */
    function collect() external view returns (bytes memory);

    /**
     * @notice Determine if the trap should respond based on collected data
     * @dev Called by Drosera operators with collected data
     * @param data Array of collected data from operators
     * @return shouldRespond Boolean indicating if response should be triggered
     * @return callData Encoded function call data for the response contract
     */
    function shouldRespond(bytes[] calldata data) 
        external 
        view 
        returns (bool shouldRespond, bytes memory callData);
}
