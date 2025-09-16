// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/extensions/AccessControlEnumerable.sol";

/**
 * @title SpiceEscrowFacet
 * @notice Handles secure escrow transactions for spice marketplace
 * @dev Diamond facet for escrow functionality with dispute resolution
 */
contract SpiceEscrowFacet is ReentrancyGuard, AccessControlEnumerable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ARBITRATOR_ROLE = keccak256("ARBITRATOR_ROLE");

    enum EscrowStatus { PENDING, CONFIRMED, DISPUTED, RESOLVED, REFUNDED }
    enum DisputeVote { BUYER, SELLER }

    struct Escrow {
        uint256 escrowId;
        address buyer;
        address seller;
        string batchId;
        uint256 amount;
        EscrowStatus status;
        uint256 createdAt;
        uint256 confirmDeadline;
        address[] arbitrators;
        bool disputed;
    }

    struct DisputeInfo {
        uint256 escrowId;
        string evidence;
        mapping(address => DisputeVote) votes;
        mapping(address => bool) hasVoted;
        uint256 buyerVotes;
        uint256 sellerVotes;
        bool resolved;
        uint256 resolvedAt;
        DisputeVote winner;
    }

    // Storage
    mapping(uint256 => Escrow) public escrows;
    mapping(uint256 => DisputeInfo) public disputes;
    mapping(address => uint256[]) public buyerEscrows;
    mapping(address => uint256[]) public sellerEscrows;
    
    uint256 public nextEscrowId = 1;
    uint256 public arbitrationFee = 0.001 ether; // 0.001 ETH
    uint256 public defaultConfirmationPeriod = 30 days;
    
    // Events
    event EscrowCreated(uint256 indexed escrowId, address indexed buyer, address indexed seller, string batchId, uint256 amount);
    event EscrowConfirmed(uint256 indexed escrowId, address indexed buyer);
    event EscrowDisputed(uint256 indexed escrowId, address indexed initiator, address[] arbitrators);
    event DisputeResolved(uint256 indexed escrowId, uint8 winner, uint256 winnerVotes);
    event FundsReleased(uint256 indexed escrowId, address indexed recipient, uint256 amount);
    event ArbitrationFeePaid(uint256 indexed escrowId, uint256 feeAmount, address[] arbitrators);

    // Custom errors
    error EscrowNotFound(uint256 escrowId);
    error UnauthorizedAction(address caller, string action);
    error InvalidEscrowStatus(uint256 escrowId, EscrowStatus current, EscrowStatus required);
    error InsufficientFunds(uint256 required, uint256 provided);
    error InvalidInput(string parameter, string reason);
    error DisputePeriodExpired(uint256 escrowId);
    error AlreadyVoted(address arbitrator, uint256 escrowId);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @notice Create a new escrow transaction
     * @param seller Address of the seller
     * @param batchId Unique identifier for the spice batch
     * @param confirmationPeriod Time in seconds for buyer to confirm delivery
     * @return escrowId The ID of the created escrow
     */
    function createEscrow(
        address seller,
        string calldata batchId,
        uint256 confirmationPeriod
    ) external payable nonReentrant returns (uint256 escrowId) {
        if (seller == address(0)) revert InvalidInput("seller", "cannot be zero address");
        if (bytes(batchId).length == 0) revert InvalidInput("batchId", "cannot be empty");
        if (msg.value == 0) revert InsufficientFunds(1, 0);
        if (confirmationPeriod < 1 days || confirmationPeriod > 365 days) {
            revert InvalidInput("confirmationPeriod", "must be between 1 and 365 days");
        }

        escrowId = nextEscrowId++;
        
        escrows[escrowId] = Escrow({
            escrowId: escrowId,
            buyer: msg.sender,
            seller: seller,
            batchId: batchId,
            amount: msg.value,
            status: EscrowStatus.PENDING,
            createdAt: block.timestamp,
            confirmDeadline: block.timestamp + confirmationPeriod,
            arbitrators: new address[](0),
            disputed: false
        });

        buyerEscrows[msg.sender].push(escrowId);
        sellerEscrows[seller].push(escrowId);

        emit EscrowCreated(escrowId, msg.sender, seller, batchId, msg.value);
    }

    /**
     * @notice Confirm delivery and release funds to seller
     * @param escrowId ID of the escrow to confirm
     */
    function confirmDelivery(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        
        if (escrow.escrowId == 0) revert EscrowNotFound(escrowId);
        if (escrow.buyer != msg.sender) revert UnauthorizedAction(msg.sender, "confirm delivery");
        if (escrow.status != EscrowStatus.PENDING) {
            revert InvalidEscrowStatus(escrowId, escrow.status, EscrowStatus.PENDING);
        }

        escrow.status = EscrowStatus.CONFIRMED;
        
        // Release funds to seller
        (bool success, ) = escrow.seller.call{value: escrow.amount}("");
        require(success, "Failed to transfer funds to seller");

        emit EscrowConfirmed(escrowId, msg.sender);
        emit FundsReleased(escrowId, escrow.seller, escrow.amount);
    }

    /**
     * @notice Initiate a dispute for an escrow
     * @param escrowId ID of the escrow to dispute
     * @param evidence Description of the dispute evidence
     */
    function initiateDispute(uint256 escrowId, string calldata evidence) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        
        if (escrow.escrowId == 0) revert EscrowNotFound(escrowId);
        if (escrow.buyer != msg.sender && escrow.seller != msg.sender) {
            revert UnauthorizedAction(msg.sender, "initiate dispute");
        }
        if (escrow.status != EscrowStatus.PENDING) {
            revert InvalidEscrowStatus(escrowId, escrow.status, EscrowStatus.PENDING);
        }
        if (block.timestamp > escrow.confirmDeadline) {
            revert DisputePeriodExpired(escrowId);
        }
        if (bytes(evidence).length == 0) revert InvalidInput("evidence", "cannot be empty");

        escrow.status = EscrowStatus.DISPUTED;
        escrow.disputed = true;
        
        // Select arbitrators (simplified - in production would be more sophisticated)
        address[] memory arbitrators = selectArbitrators(escrow.buyer, escrow.seller);
        escrow.arbitrators = arbitrators;
        
        // Initialize dispute
        DisputeInfo storage dispute = disputes[escrowId];
        dispute.escrowId = escrowId;
        dispute.evidence = evidence;
        dispute.resolved = false;

        emit EscrowDisputed(escrowId, msg.sender, arbitrators);
    }

    /**
     * @notice Vote on a dispute (arbitrators only)
     * @param escrowId ID of the disputed escrow
     * @param vote Vote for buyer (0) or seller (1)
     */
    function voteOnDispute(uint256 escrowId, uint8 vote) external {
        Escrow storage escrow = escrows[escrowId];
        DisputeInfo storage dispute = disputes[escrowId];
        
        if (escrow.escrowId == 0) revert EscrowNotFound(escrowId);
        if (escrow.status != EscrowStatus.DISPUTED) {
            revert InvalidEscrowStatus(escrowId, escrow.status, EscrowStatus.DISPUTED);
        }
        if (!_isArbitrator(msg.sender, escrow.arbitrators)) {
            revert UnauthorizedAction(msg.sender, "vote on dispute");
        }
        if (dispute.hasVoted[msg.sender]) revert AlreadyVoted(msg.sender, escrowId);
        if (vote > 1) revert InvalidInput("vote", "must be 0 (buyer) or 1 (seller)");

        DisputeVote voteChoice = vote == 0 ? DisputeVote.BUYER : DisputeVote.SELLER;
        dispute.votes[msg.sender] = voteChoice;
        dispute.hasVoted[msg.sender] = true;

        if (voteChoice == DisputeVote.BUYER) {
            dispute.buyerVotes++;
        } else {
            dispute.sellerVotes++;
        }

        // Auto-resolve if majority reached
        uint256 totalArbitrators = escrow.arbitrators.length;
        uint256 majorityThreshold = (totalArbitrators / 2) + 1;
        
        if (dispute.buyerVotes >= majorityThreshold || dispute.sellerVotes >= majorityThreshold) {
            _resolveDispute(escrowId);
        }
    }

    /**
     * @notice Resolve dispute after voting period
     * @param escrowId ID of the disputed escrow
     */
    function resolveDispute(uint256 escrowId) external {
        if (!hasRole(ADMIN_ROLE, msg.sender)) {
            revert UnauthorizedAction(msg.sender, "resolve dispute");
        }
        _resolveDispute(escrowId);
    }

    /**
     * @notice Claim funds after confirmation period expires
     * @param escrowId ID of the escrow
     */
    function claimExpiredFunds(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        
        if (escrow.escrowId == 0) revert EscrowNotFound(escrowId);
        if (escrow.seller != msg.sender) revert UnauthorizedAction(msg.sender, "claim expired funds");
        if (escrow.status != EscrowStatus.PENDING) {
            revert InvalidEscrowStatus(escrowId, escrow.status, EscrowStatus.PENDING);
        }
        if (block.timestamp <= escrow.confirmDeadline) {
            revert InvalidInput("timestamp", "confirmation period not expired");
        }

        escrow.status = EscrowStatus.CONFIRMED;
        
        // Release funds to seller
        (bool success, ) = escrow.seller.call{value: escrow.amount}("");
        require(success, "Failed to transfer funds to seller");

        emit FundsReleased(escrowId, escrow.seller, escrow.amount);
    }

    /**
     * @notice Get escrow details
     */
    function getEscrow(uint256 escrowId) external view returns (
        uint256, address, address, string memory, uint256, uint8, uint256, uint256, address[] memory, bool
    ) {
        Escrow storage escrow = escrows[escrowId];
        if (escrow.escrowId == 0) revert EscrowNotFound(escrowId);
        
        return (
            escrow.escrowId,
            escrow.buyer,
            escrow.seller,
            escrow.batchId,
            escrow.amount,
            uint8(escrow.status),
            escrow.createdAt,
            escrow.confirmDeadline,
            escrow.arbitrators,
            escrow.disputed
        );
    }

    /**
     * @notice Get escrows by buyer address
     */
    function getEscrowsByBuyer(address buyer) external view returns (uint256[] memory) {
        return buyerEscrows[buyer];
    }

    /**
     * @notice Get escrows by seller address
     */
    function getEscrowsBySeller(address seller) external view returns (uint256[] memory) {
        return sellerEscrows[seller];
    }

    /**
     * @notice Get dispute votes for an escrow
     */
    function getDisputeVotes(uint256 escrowId) external view returns (
        address[] memory arbitrators,
        uint8[] memory votes,
        uint256[] memory timestamps
    ) {
        Escrow storage escrow = escrows[escrowId];
        if (escrow.escrowId == 0) revert EscrowNotFound(escrowId);
        
        address[] memory arbList = escrow.arbitrators;
        uint8[] memory voteList = new uint8[](arbList.length);
        uint256[] memory timestampList = new uint256[](arbList.length);
        
        DisputeInfo storage dispute = disputes[escrowId];
        
        for (uint256 i = 0; i < arbList.length; i++) {
            if (dispute.hasVoted[arbList[i]]) {
                voteList[i] = uint8(dispute.votes[arbList[i]]);
                timestampList[i] = block.timestamp; // Simplified - would store actual vote timestamp
            }
        }
        
        return (arbList, voteList, timestampList);
    }

    /**
     * @notice Check if dispute can be initiated
     */
    function canInitiateDispute(uint256 escrowId) external view returns (bool) {
        Escrow storage escrow = escrows[escrowId];
        return escrow.escrowId != 0 && 
               escrow.status == EscrowStatus.PENDING && 
               block.timestamp <= escrow.confirmDeadline;
    }

    /**
     * @notice Check if expired funds can be claimed
     */
    function canClaimExpiredFunds(uint256 escrowId) external view returns (bool) {
        Escrow storage escrow = escrows[escrowId];
        return escrow.escrowId != 0 && 
               escrow.status == EscrowStatus.PENDING && 
               block.timestamp > escrow.confirmDeadline;
    }

    /**
     * @notice Get current arbitration fee
     */
    function getArbitrationFee() external view returns (uint256) {
        return arbitrationFee;
    }

    /**
     * @notice Get total number of escrows
     */
    function getTotalEscrows() external view returns (uint256) {
        return nextEscrowId - 1;
    }

    /**
     * @notice Set arbitration fee (admin only)
     */
    function setArbitrationFee(uint256 newFee) external onlyRole(ADMIN_ROLE) {
        arbitrationFee = newFee;
    }

    /**
     * @notice Set default confirmation period (admin only)
     */
    function setConfirmationPeriod(uint256 newPeriod) external onlyRole(ADMIN_ROLE) {
        if (newPeriod < 1 days || newPeriod > 365 days) {
            revert InvalidInput("confirmationPeriod", "must be between 1 and 365 days");
        }
        defaultConfirmationPeriod = newPeriod;
    }

    /**
     * @notice Select arbitrators for a dispute (simplified implementation)
     */
    function selectArbitrators(address buyer, address seller) public view returns (address[] memory) {
        // Simplified arbitrator selection - in production would be more sophisticated
        address[] memory arbitrators = new address[](3);
        
        // Get all addresses with ARBITRATOR_ROLE
        // For now, return admin as default arbitrator
        if (getRoleMemberCount(ADMIN_ROLE) > 0) {
            arbitrators[0] = getRoleMember(ADMIN_ROLE, 0);
            arbitrators[1] = getRoleMember(ADMIN_ROLE, 0); // Simplified
            arbitrators[2] = getRoleMember(ADMIN_ROLE, 0); // Simplified
        } else {
            // Fallback if no admins
            arbitrators[0] = msg.sender;
            arbitrators[1] = msg.sender;
            arbitrators[2] = msg.sender;
        }
        
        return arbitrators;
    }

    /**
     * @dev Resolve dispute based on votes
     */
    function _resolveDispute(uint256 escrowId) internal {
        Escrow storage escrow = escrows[escrowId];
        DisputeInfo storage dispute = disputes[escrowId];
        
        if (dispute.resolved) return;
        
        DisputeVote winner;
        uint256 winnerVotes;
        address recipient;
        
        if (dispute.buyerVotes > dispute.sellerVotes) {
            winner = DisputeVote.BUYER;
            winnerVotes = dispute.buyerVotes;
            recipient = escrow.buyer;
            escrow.status = EscrowStatus.REFUNDED;
        } else {
            winner = DisputeVote.SELLER;
            winnerVotes = dispute.sellerVotes;
            recipient = escrow.seller;
            escrow.status = EscrowStatus.RESOLVED;
        }
        
        dispute.winner = winner;
        dispute.resolved = true;
        dispute.resolvedAt = block.timestamp;
        
        // Release funds to winner
        (bool success, ) = recipient.call{value: escrow.amount}("");
        require(success, "Failed to transfer funds");
        
        emit DisputeResolved(escrowId, uint8(winner), winnerVotes);
        emit FundsReleased(escrowId, recipient, escrow.amount);
    }

    /**
     * @dev Check if address is an arbitrator for the escrow
     */
    function _isArbitrator(address addr, address[] memory arbitrators) internal pure returns (bool) {
        for (uint256 i = 0; i < arbitrators.length; i++) {
            if (arbitrators[i] == addr) return true;
        }
        return false;
    }

    /**
     * @notice Emergency withdrawal (admin only)
     */
    function emergencyWithdraw() external onlyRole(ADMIN_ROLE) {
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success, "Emergency withdrawal failed");
    }
}