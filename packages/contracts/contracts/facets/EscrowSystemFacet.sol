// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../libraries/LibDiamond.sol";

/**
 * @title EscrowSystemFacet
 * @dev Handles secure payment escrow and dispute resolution for marketplace transactions
 */
contract EscrowSystemFacet {
    
    struct Purchase {
        uint256 batchId;
        address buyer;
        address seller;
        uint256 amount;
        uint256 timestamp;
        PurchaseStatus status;
        uint256 confirmationDeadline;
        DisputeInfo dispute;
    }
    
    struct DisputeInfo {
        bool isDisputed;
        uint256 disputeTimestamp;
        address[] arbitrators;
        mapping(address => Vote) votes;
        uint256 votesFor;
        uint256 votesAgainst;
        bool resolved;
        address winner;
    }
    
    struct Vote {
        bool hasVoted;
        bool voteFor; // true = buyer, false = seller
        string evidence;
    }
    
    enum PurchaseStatus {
        Active,
        Confirmed,
        Disputed,
        Resolved,
        Cancelled
    }
    
    // Storage
    bytes32 constant ESCROW_STORAGE_POSITION = keccak256("escrow.system.storage");
    
    struct EscrowStorage {
        mapping(uint256 => Purchase) purchases;
        mapping(address => uint256[]) userPurchases;
        mapping(address => uint256[]) userSales;
        uint256 purchaseCounter;
        uint256 disputeFee; // Percentage (e.g., 500 = 5%)
        uint256 confirmationPeriod; // In seconds (e.g., 30 days)
        address[] availableArbitrators;
        mapping(address => bool) isArbitrator;
        mapping(address => uint256) arbitratorReputation;
    }
    
    function escrowStorage() internal pure returns (EscrowStorage storage es) {
        bytes32 position = ESCROW_STORAGE_POSITION;
        assembly {
            es.slot := position
        }
    }
    
    // Events
    event PurchaseCreated(uint256 indexed purchaseId, uint256 indexed batchId, address indexed buyer, address seller, uint256 amount);
    event PurchaseConfirmed(uint256 indexed purchaseId, address indexed buyer);
    event DisputeRaised(uint256 indexed purchaseId, address indexed buyer);
    event ArbitratorAssigned(uint256 indexed purchaseId, address indexed arbitrator);
    event VoteCast(uint256 indexed purchaseId, address indexed arbitrator, bool voteFor);
    event DisputeResolved(uint256 indexed purchaseId, address indexed winner, uint256 amount);
    event FundsReleased(uint256 indexed purchaseId, address indexed recipient, uint256 amount);
    
    modifier onlyDiamondOwner() {
        LibDiamond.enforceIsContractOwner();
        _;
    }
    
    modifier onlyArbitrator() {
        EscrowStorage storage es = escrowStorage();
        require(es.isArbitrator[msg.sender], "Not an authorized arbitrator");
        _;
    }
    
    /**
     * @dev Initialize the escrow system with default parameters
     */
    function initializeEscrow() external onlyDiamondOwner {
        EscrowStorage storage es = escrowStorage();
        es.disputeFee = 300; // 3%
        es.confirmationPeriod = 30 days;
    }
    
    /**
     * @dev Create a new purchase with escrow
     */
    function createPurchase(
        uint256 batchId,
        address seller
    ) external payable returns (uint256 purchaseId) {
        require(msg.value > 0, "Purchase amount must be greater than 0");
        require(seller != msg.sender, "Cannot purchase from yourself");
        
        EscrowStorage storage es = escrowStorage();
        purchaseId = es.purchaseCounter++;
        
        Purchase storage purchase = es.purchases[purchaseId];
        purchase.batchId = batchId;
        purchase.buyer = msg.sender;
        purchase.seller = seller;
        purchase.amount = msg.value;
        purchase.timestamp = block.timestamp;
        purchase.status = PurchaseStatus.Active;
        purchase.confirmationDeadline = block.timestamp + es.confirmationPeriod;
        
        es.userPurchases[msg.sender].push(purchaseId);
        es.userSales[seller].push(purchaseId);
        
        emit PurchaseCreated(purchaseId, batchId, msg.sender, seller, msg.value);
    }
    
    /**
     * @dev Buyer confirms receipt of goods
     */
    function confirmPurchase(uint256 purchaseId) external {
        EscrowStorage storage es = escrowStorage();
        Purchase storage purchase = es.purchases[purchaseId];
        
        require(purchase.buyer == msg.sender, "Only buyer can confirm");
        require(purchase.status == PurchaseStatus.Active, "Purchase not active");
        require(!purchase.dispute.isDisputed, "Purchase is disputed");
        
        purchase.status = PurchaseStatus.Confirmed;
        
        // Release funds to seller
        uint256 amount = purchase.amount;
        (bool success, ) = purchase.seller.call{value: amount}("");
        require(success, "Transfer to seller failed");
        
        emit PurchaseConfirmed(purchaseId, msg.sender);
        emit FundsReleased(purchaseId, purchase.seller, amount);
    }
    
    /**
     * @dev Auto-release funds if confirmation period expires without dispute
     */
    function autoRelease(uint256 purchaseId) external {
        EscrowStorage storage es = escrowStorage();
        Purchase storage purchase = es.purchases[purchaseId];
        
        require(purchase.status == PurchaseStatus.Active, "Purchase not active");
        require(block.timestamp > purchase.confirmationDeadline, "Confirmation period not expired");
        require(!purchase.dispute.isDisputed, "Purchase is disputed");
        
        purchase.status = PurchaseStatus.Confirmed;
        
        // Release funds to seller
        uint256 amount = purchase.amount;
        (bool success, ) = purchase.seller.call{value: amount}("");
        require(success, "Transfer to seller failed");
        
        emit FundsReleased(purchaseId, purchase.seller, amount);
    }
    
    // View functions
    function getPurchase(uint256 purchaseId) external view returns (
        uint256 batchId,
        address buyer,
        address seller,
        uint256 amount,
        uint256 timestamp,
        PurchaseStatus status,
        uint256 confirmationDeadline,
        bool isDisputed
    ) {
        Purchase storage purchase = escrowStorage().purchases[purchaseId];
        return (
            purchase.batchId,
            purchase.buyer,
            purchase.seller,
            purchase.amount,
            purchase.timestamp,
            purchase.status,
            purchase.confirmationDeadline,
            purchase.dispute.isDisputed
        );
    }
    
    function getUserPurchases(address user) external view returns (uint256[] memory) {
        return escrowStorage().userPurchases[user];
    }
    
    function getUserSales(address user) external view returns (uint256[] memory) {
        return escrowStorage().userSales[user];
    }
}