// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AlertVault
 * @notice Simple on-chain storage for whale surge alerts
 * @dev This contract receives and stores alerts from the backend when whale surges are detected
 */
contract AlertVault {
    // Event emitted when an alert is logged
    event AlertLogged(
        bytes32 indexed alertId, 
        address indexed wallet, 
        uint8 indexed alertType, 
        uint256 usdValue, 
        address reporter
    );

    // Alert data structure
    struct Alert {
        bytes32 id;
        address wallet;
        uint8 alertType;      // 1 = Capital Surge, 2 = Velocity Surge, 3 = Group Surge
        uint256 usdValue;     // USD value with 18 decimals (e.g., 100000 * 1e18)
        address reporter;     // Address that sent the alert
        uint256 timestamp;    // Block timestamp
    }

    // Mapping of alert ID to alert data
    mapping(bytes32 => Alert) public alerts;

    /**
     * @notice Log a new whale surge alert
     * @param alertId Unique identifier for this alert
     * @param wallet The wallet address that triggered the surge
     * @param alertType Type of surge (1=Capital, 2=Velocity, 3=Group)
     * @param usdValue The USD value associated with the surge
     */
    function alert(
        bytes32 alertId, 
        address wallet, 
        uint8 alertType, 
        uint256 usdValue
    ) external {
        // Prevent duplicate alerts
        require(alerts[alertId].timestamp == 0, "ALREADY_RECORDED");
        
        // Store alert
        alerts[alertId] = Alert({
            id: alertId,
            wallet: wallet,
            alertType: alertType,
            usdValue: usdValue,
            reporter: msg.sender,
            timestamp: block.timestamp
        });
        
        // Emit event for indexing
        emit AlertLogged(alertId, wallet, alertType, usdValue, msg.sender);
    }

    /**
     * @notice Get alert details by ID
     * @param alertId The alert identifier
     * @return Alert struct with all details
     */
    function getAlert(bytes32 alertId) external view returns (Alert memory) {
        return alerts[alertId];
    }
}
