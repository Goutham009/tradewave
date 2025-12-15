// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title EscrowRecord
 * @dev Smart contract for recording escrow status on blockchain
 * @notice This contract does NOT hold funds - it only records escrow events
 * All actual fund management is handled via traditional FIAT escrow systems
 */
contract EscrowRecord {
    enum EscrowStatus {
        Pending,
        FundsHeld,
        ConditionsMet,
        Released,
        Disputed,
        Refunded
    }

    struct EscrowInfo {
        string transactionId;
        uint256 amount;
        string currency;
        address buyer;
        address supplier;
        EscrowStatus status;
        uint256 createdAt;
        uint256 heldAt;
        uint256 releasedAt;
        bool deliveryConfirmed;
        bool qualityApproved;
        bool documentsVerified;
    }

    EscrowInfo public escrow;
    address public owner;

    mapping(uint256 => string) public conditions;
    mapping(uint256 => bool) public conditionMet;
    uint256 public conditionCount;

    event EscrowCreated(
        string indexed transactionId,
        uint256 amount,
        string currency,
        address buyer,
        address supplier,
        uint256 timestamp
    );

    event FundsHeldRecorded(
        string indexed transactionId,
        uint256 amount,
        uint256 timestamp
    );

    event ConditionAdded(
        string indexed transactionId,
        uint256 conditionId,
        string description,
        uint256 timestamp
    );

    event ConditionMet(
        string indexed transactionId,
        uint256 conditionId,
        string description,
        address markedBy,
        uint256 timestamp
    );

    event FundsReleasedRecorded(
        string indexed transactionId,
        uint256 amount,
        uint256 timestamp
    );

    event DisputeRecorded(
        string indexed transactionId,
        string reason,
        address raisedBy,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyParticipant() {
        require(
            msg.sender == escrow.buyer || 
            msg.sender == escrow.supplier || 
            msg.sender == owner,
            "Only participants can call this function"
        );
        _;
    }

    constructor(
        string memory _transactionId,
        uint256 _amount,
        string memory _currency,
        address _buyer,
        address _supplier
    ) {
        require(bytes(_transactionId).length > 0, "Transaction ID required");
        require(_amount > 0, "Amount must be greater than 0");
        require(_buyer != address(0), "Invalid buyer address");
        require(_supplier != address(0), "Invalid supplier address");

        owner = msg.sender;

        escrow = EscrowInfo({
            transactionId: _transactionId,
            amount: _amount,
            currency: _currency,
            buyer: _buyer,
            supplier: _supplier,
            status: EscrowStatus.Pending,
            createdAt: block.timestamp,
            heldAt: 0,
            releasedAt: 0,
            deliveryConfirmed: false,
            qualityApproved: false,
            documentsVerified: false
        });

        emit EscrowCreated(
            _transactionId,
            _amount,
            _currency,
            _buyer,
            _supplier,
            block.timestamp
        );
    }

    function recordFundsHeld() external onlyOwner {
        require(escrow.status == EscrowStatus.Pending, "Funds already held");
        
        escrow.status = EscrowStatus.FundsHeld;
        escrow.heldAt = block.timestamp;

        emit FundsHeldRecorded(
            escrow.transactionId,
            escrow.amount,
            block.timestamp
        );
    }

    function addCondition(string memory _description) external onlyOwner returns (uint256) {
        conditionCount++;
        conditions[conditionCount] = _description;
        conditionMet[conditionCount] = false;

        emit ConditionAdded(
            escrow.transactionId,
            conditionCount,
            _description,
            block.timestamp
        );

        return conditionCount;
    }

    function markConditionMet(uint256 _conditionId) external onlyParticipant {
        require(_conditionId > 0 && _conditionId <= conditionCount, "Invalid condition ID");
        require(!conditionMet[_conditionId], "Condition already met");

        conditionMet[_conditionId] = true;

        emit ConditionMet(
            escrow.transactionId,
            _conditionId,
            conditions[_conditionId],
            msg.sender,
            block.timestamp
        );

        _checkAllConditions();
    }

    function confirmDelivery() external {
        require(
            msg.sender == escrow.buyer || msg.sender == owner,
            "Only buyer can confirm delivery"
        );
        escrow.deliveryConfirmed = true;
        _checkAllConditions();
    }

    function approveQuality() external {
        require(
            msg.sender == escrow.buyer || msg.sender == owner,
            "Only buyer can approve quality"
        );
        escrow.qualityApproved = true;
        _checkAllConditions();
    }

    function verifyDocuments() external onlyOwner {
        escrow.documentsVerified = true;
        _checkAllConditions();
    }

    function _checkAllConditions() internal {
        bool allConditionsMet = true;
        
        for (uint256 i = 1; i <= conditionCount; i++) {
            if (!conditionMet[i]) {
                allConditionsMet = false;
                break;
            }
        }

        if (allConditionsMet && 
            escrow.deliveryConfirmed && 
            escrow.qualityApproved && 
            escrow.documentsVerified) {
            escrow.status = EscrowStatus.ConditionsMet;
        }
    }

    function recordRelease() external onlyOwner {
        require(
            escrow.status == EscrowStatus.ConditionsMet || 
            escrow.status == EscrowStatus.FundsHeld,
            "Cannot release in current status"
        );

        escrow.status = EscrowStatus.Released;
        escrow.releasedAt = block.timestamp;

        emit FundsReleasedRecorded(
            escrow.transactionId,
            escrow.amount,
            block.timestamp
        );
    }

    function recordDispute(string memory _reason) external onlyParticipant {
        require(
            escrow.status != EscrowStatus.Released && 
            escrow.status != EscrowStatus.Refunded,
            "Cannot dispute after release/refund"
        );

        escrow.status = EscrowStatus.Disputed;

        emit DisputeRecorded(
            escrow.transactionId,
            _reason,
            msg.sender,
            block.timestamp
        );
    }

    function getEscrowDetails() external view returns (
        string memory transactionId,
        uint256 amount,
        string memory currency,
        EscrowStatus status,
        uint256 createdAt,
        uint256 heldAt,
        uint256 releasedAt,
        bool deliveryConfirmed,
        bool qualityApproved,
        bool documentsVerified
    ) {
        return (
            escrow.transactionId,
            escrow.amount,
            escrow.currency,
            escrow.status,
            escrow.createdAt,
            escrow.heldAt,
            escrow.releasedAt,
            escrow.deliveryConfirmed,
            escrow.qualityApproved,
            escrow.documentsVerified
        );
    }

    function getCondition(uint256 _id) external view returns (
        string memory description,
        bool isMet
    ) {
        require(_id > 0 && _id <= conditionCount, "Invalid condition ID");
        return (conditions[_id], conditionMet[_id]);
    }
}
