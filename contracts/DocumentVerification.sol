// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title DocumentVerification
 * @dev Smart contract for document hash verification on blockchain
 * @notice Documents are hashed off-chain and only the hash is stored on-chain
 */
contract DocumentVerification {
    struct Document {
        bytes32 documentHash;
        string documentType;
        string transactionId;
        address registeredBy;
        uint256 registeredAt;
        bool exists;
    }

    mapping(bytes32 => Document) public documents;
    mapping(string => bytes32[]) public transactionDocuments;
    
    address public owner;
    uint256 public documentCount;

    event DocumentRegistered(
        bytes32 indexed documentHash,
        string documentType,
        string transactionId,
        address registeredBy,
        uint256 timestamp
    );

    event DocumentVerified(
        bytes32 indexed documentHash,
        address verifier,
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
     * @dev Register a document hash on the blockchain
     * @param _documentHash SHA-256 hash of the document
     * @param _documentType Type of document (invoice, certificate, etc.)
     * @param _transactionId Associated transaction ID
     */
    function registerDocument(
        bytes32 _documentHash,
        string memory _documentType,
        string memory _transactionId
    ) external {
        require(_documentHash != bytes32(0), "Invalid document hash");
        require(!documents[_documentHash].exists, "Document already registered");
        require(bytes(_documentType).length > 0, "Document type required");
        require(bytes(_transactionId).length > 0, "Transaction ID required");

        documents[_documentHash] = Document({
            documentHash: _documentHash,
            documentType: _documentType,
            transactionId: _transactionId,
            registeredBy: msg.sender,
            registeredAt: block.timestamp,
            exists: true
        });

        transactionDocuments[_transactionId].push(_documentHash);
        documentCount++;

        emit DocumentRegistered(
            _documentHash,
            _documentType,
            _transactionId,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @dev Verify if a document hash exists and get its details
     * @param _documentHash Hash to verify
     */
    function verifyDocument(bytes32 _documentHash) external view returns (
        bool exists,
        string memory documentType,
        string memory transactionId,
        address registeredBy,
        uint256 registeredAt
    ) {
        Document memory doc = documents[_documentHash];
        return (
            doc.exists,
            doc.documentType,
            doc.transactionId,
            doc.registeredBy,
            doc.registeredAt
        );
    }

    /**
     * @dev Check if a document hash is registered
     * @param _documentHash Hash to check
     */
    function isDocumentRegistered(bytes32 _documentHash) external view returns (bool) {
        return documents[_documentHash].exists;
    }

    /**
     * @dev Get all document hashes for a transaction
     * @param _transactionId Transaction ID
     */
    function getTransactionDocuments(string memory _transactionId) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        return transactionDocuments[_transactionId];
    }

    /**
     * @dev Get document count for a transaction
     * @param _transactionId Transaction ID
     */
    function getTransactionDocumentCount(string memory _transactionId) 
        external 
        view 
        returns (uint256) 
    {
        return transactionDocuments[_transactionId].length;
    }

    /**
     * @dev Emit verification event (for audit purposes)
     * @param _documentHash Hash being verified
     */
    function emitVerification(bytes32 _documentHash) external {
        require(documents[_documentHash].exists, "Document not registered");
        emit DocumentVerified(_documentHash, msg.sender, block.timestamp);
    }
}
