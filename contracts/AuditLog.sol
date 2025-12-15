// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title AuditLog
 * @dev Immutable audit log for recording all platform actions on blockchain
 * @notice Provides tamper-proof record of all significant events
 */
contract AuditLog {
    struct LogEntry {
        uint256 id;
        string action;
        string transactionId;
        string entityType;
        string entityId;
        string details;
        address actor;
        uint256 timestamp;
    }

    LogEntry[] public logs;
    
    mapping(string => uint256[]) public transactionLogs;
    mapping(address => uint256[]) public actorLogs;
    mapping(string => uint256[]) public actionLogs;
    
    address public owner;
    uint256 public logCount;

    event LogRecorded(
        uint256 indexed logId,
        string action,
        string transactionId,
        string entityType,
        address indexed actor,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Record an action in the audit log
     * @param _action Type of action performed
     * @param _transactionId Associated transaction ID
     * @param _entityType Type of entity (requirement, quotation, etc.)
     * @param _entityId ID of the entity
     * @param _details Additional details as JSON string
     */
    function recordAction(
        string memory _action,
        string memory _transactionId,
        string memory _entityType,
        string memory _entityId,
        string memory _details
    ) external returns (uint256) {
        logCount++;
        
        LogEntry memory newLog = LogEntry({
            id: logCount,
            action: _action,
            transactionId: _transactionId,
            entityType: _entityType,
            entityId: _entityId,
            details: _details,
            actor: msg.sender,
            timestamp: block.timestamp
        });

        logs.push(newLog);
        
        if (bytes(_transactionId).length > 0) {
            transactionLogs[_transactionId].push(logCount);
        }
        actorLogs[msg.sender].push(logCount);
        actionLogs[_action].push(logCount);

        emit LogRecorded(
            logCount,
            _action,
            _transactionId,
            _entityType,
            msg.sender,
            block.timestamp
        );

        return logCount;
    }

    /**
     * @dev Get a specific log entry
     * @param _logId ID of the log entry
     */
    function getLogEntry(uint256 _logId) external view returns (
        uint256 id,
        string memory action,
        string memory transactionId,
        string memory entityType,
        string memory entityId,
        string memory details,
        address actor,
        uint256 timestamp
    ) {
        require(_logId > 0 && _logId <= logCount, "Invalid log ID");
        LogEntry memory log = logs[_logId - 1];
        return (
            log.id,
            log.action,
            log.transactionId,
            log.entityType,
            log.entityId,
            log.details,
            log.actor,
            log.timestamp
        );
    }

    /**
     * @dev Get total log count
     */
    function getLogCount() external view returns (uint256) {
        return logCount;
    }

    /**
     * @dev Get all log IDs for a transaction
     * @param _transactionId Transaction ID
     */
    function getTransactionLogIds(string memory _transactionId) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return transactionLogs[_transactionId];
    }

    /**
     * @dev Get all log IDs for an actor
     * @param _actor Actor address
     */
    function getActorLogIds(address _actor) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return actorLogs[_actor];
    }

    /**
     * @dev Get all log IDs for an action type
     * @param _action Action type
     */
    function getActionLogIds(string memory _action) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return actionLogs[_action];
    }

    /**
     * @dev Get logs in a range (pagination)
     * @param _start Start index (1-indexed)
     * @param _count Number of entries to return
     */
    function getLogsRange(uint256 _start, uint256 _count) 
        external 
        view 
        returns (LogEntry[] memory) 
    {
        require(_start > 0, "Start must be greater than 0");
        require(_start <= logCount, "Start exceeds log count");
        
        uint256 end = _start + _count - 1;
        if (end > logCount) {
            end = logCount;
        }
        
        uint256 resultCount = end - _start + 1;
        LogEntry[] memory result = new LogEntry[](resultCount);
        
        for (uint256 i = 0; i < resultCount; i++) {
            result[i] = logs[_start - 1 + i];
        }
        
        return result;
    }
}
