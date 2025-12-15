// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title TradeAgreement
 * @dev Smart contract for recording trade agreements on blockchain
 * @notice This contract does NOT handle payments - it only records agreement data
 * All payments are handled via traditional FIAT escrow systems
 */
contract TradeAgreement {
    enum TradeStatus {
        Initiated,
        PaymentReceived,
        Production,
        QualityCheck,
        Shipped,
        InTransit,
        Delivered,
        Confirmed,
        Completed,
        Disputed,
        Cancelled
    }

    struct Trade {
        address buyer;
        address supplier;
        string tradeId;
        uint256 amount;
        string currency;
        string terms;
        TradeStatus status;
        uint256 createdAt;
        uint256 updatedAt;
        bool deliveryConfirmed;
        bool qualityApproved;
    }

    Trade public trade;
    address public owner;
    
    mapping(uint256 => string) public milestones;
    uint256 public milestoneCount;

    event TradeInitiated(
        string indexed tradeId,
        address buyer,
        address supplier,
        uint256 amount,
        uint256 timestamp
    );
    
    event StatusUpdated(
        string indexed tradeId,
        TradeStatus newStatus,
        string description,
        uint256 timestamp
    );
    
    event MilestoneRecorded(
        string indexed tradeId,
        uint256 milestoneId,
        string description,
        uint256 timestamp
    );
    
    event DeliveryConfirmed(
        string indexed tradeId,
        address confirmedBy,
        uint256 timestamp
    );
    
    event QualityApproved(
        string indexed tradeId,
        address approvedBy,
        uint256 timestamp
    );
    
    event TradeCompleted(
        string indexed tradeId,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyParticipant() {
        require(
            msg.sender == trade.buyer || 
            msg.sender == trade.supplier || 
            msg.sender == owner,
            "Only trade participants can call this function"
        );
        _;
    }

    constructor(
        address _buyer,
        address _supplier,
        string memory _tradeId,
        uint256 _amount,
        string memory _currency,
        string memory _terms
    ) {
        require(_buyer != address(0), "Invalid buyer address");
        require(_supplier != address(0), "Invalid supplier address");
        require(bytes(_tradeId).length > 0, "Trade ID required");
        
        owner = msg.sender;
        
        trade = Trade({
            buyer: _buyer,
            supplier: _supplier,
            tradeId: _tradeId,
            amount: _amount,
            currency: _currency,
            terms: _terms,
            status: TradeStatus.Initiated,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            deliveryConfirmed: false,
            qualityApproved: false
        });

        emit TradeInitiated(_tradeId, _buyer, _supplier, _amount, block.timestamp);
    }

    function updateStatus(TradeStatus _status, string memory _description) 
        external 
        onlyParticipant 
    {
        trade.status = _status;
        trade.updatedAt = block.timestamp;
        
        emit StatusUpdated(trade.tradeId, _status, _description, block.timestamp);
    }

    function recordMilestone(string memory _description) 
        external 
        onlyParticipant 
        returns (uint256) 
    {
        milestoneCount++;
        milestones[milestoneCount] = _description;
        
        emit MilestoneRecorded(
            trade.tradeId, 
            milestoneCount, 
            _description, 
            block.timestamp
        );
        
        return milestoneCount;
    }

    function confirmDelivery() external {
        require(
            msg.sender == trade.buyer || msg.sender == owner,
            "Only buyer can confirm delivery"
        );
        require(!trade.deliveryConfirmed, "Delivery already confirmed");
        
        trade.deliveryConfirmed = true;
        trade.status = TradeStatus.Delivered;
        trade.updatedAt = block.timestamp;
        
        emit DeliveryConfirmed(trade.tradeId, msg.sender, block.timestamp);
        
        _checkCompletion();
    }

    function approveQuality() external {
        require(
            msg.sender == trade.buyer || msg.sender == owner,
            "Only buyer can approve quality"
        );
        require(!trade.qualityApproved, "Quality already approved");
        
        trade.qualityApproved = true;
        trade.updatedAt = block.timestamp;
        
        emit QualityApproved(trade.tradeId, msg.sender, block.timestamp);
        
        _checkCompletion();
    }

    function _checkCompletion() internal {
        if (trade.deliveryConfirmed && trade.qualityApproved) {
            trade.status = TradeStatus.Completed;
            trade.updatedAt = block.timestamp;
            
            emit TradeCompleted(trade.tradeId, block.timestamp);
        }
    }

    function getTradeDetails() external view returns (
        address buyer,
        address supplier,
        string memory tradeId,
        uint256 amount,
        string memory currency,
        TradeStatus status,
        uint256 createdAt,
        bool deliveryConfirmed,
        bool qualityApproved
    ) {
        return (
            trade.buyer,
            trade.supplier,
            trade.tradeId,
            trade.amount,
            trade.currency,
            trade.status,
            trade.createdAt,
            trade.deliveryConfirmed,
            trade.qualityApproved
        );
    }

    function getMilestone(uint256 _id) external view returns (string memory) {
        require(_id > 0 && _id <= milestoneCount, "Invalid milestone ID");
        return milestones[_id];
    }
}
