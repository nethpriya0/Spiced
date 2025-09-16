// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/ISpicePassport.sol";
import "../interfaces/IFarmerRegistry.sol";

contract SpicePassportFacet is ISpicePassport, AccessControl, ReentrancyGuard {
    // Role definitions (consistent with FarmerRegistry)
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant FARMER_ROLE = keccak256("FARMER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    // Storage
    mapping(uint256 => PassportData) private passports;
    mapping(address => uint256[]) private ownerToPassports;
    mapping(uint256 => bool) private passportExists;
    uint256 private totalPassportCount;
    uint256 private nextBatchId = 1;

    // Constants
    uint256 public constant MAX_SPICE_TYPE_LENGTH = 50;
    uint256 public constant MAX_IPFS_HASH_LENGTH = 100;
    uint256 public constant MAX_WEIGHT = 10_000_000; // 10,000kg in grams
    uint256 public constant MIN_WEIGHT = 1; // 1 gram minimum

    // Custom errors
    error OnlyVerifiedFarmer();
    error OnlyPassportOwner();
    error PassportNotExists();
    error PassportAlreadyLocked();
    error PassportNotLocked();
    error InvalidWeight();
    error StringTooLong();
    error EmptyString();
    error InvalidBatchId();

    // Modifiers
    modifier onlyVerifiedFarmer() {
        // Note: This assumes FarmerRegistry is accessible via diamond proxy
        // In a real implementation, we'd need to access the FarmerRegistry facet
        if (!hasRole(FARMER_ROLE, msg.sender)) {
            revert OnlyVerifiedFarmer();
        }
        _;
    }

    modifier onlyPassportOwner(uint256 batchId) {
        if (!passportExists[batchId] || passports[batchId].owner != msg.sender) {
            revert OnlyPassportOwner();
        }
        _;
    }

    modifier validBatchId(uint256 batchId) {
        if (!passportExists[batchId]) {
            revert PassportNotExists();
        }
        _;
    }

    modifier validWeight(uint256 weight) {
        if (weight < MIN_WEIGHT || weight > MAX_WEIGHT) {
            revert InvalidWeight();
        }
        _;
    }

    modifier validStringLength(string memory str, uint256 maxLength) {
        if (bytes(str).length == 0) {
            revert EmptyString();
        }
        if (bytes(str).length > maxLength) {
            revert StringTooLong();
        }
        _;
    }

    constructor() {
        // Grant the contract deployer all roles initially
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(FARMER_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    /**
     * @dev Create a new digital passport for spice batch
     * @param spiceType Type of spice (e.g., "Ceylon Cinnamon")
     * @param totalWeight Total weight of the batch in grams
     * @param harvestHash IPFS hash containing harvest data
     * @return batchId The unique identifier for the created passport
     */
    function createPassport(
        string memory spiceType,
        uint256 totalWeight,
        string memory harvestHash
    )
        external
        onlyVerifiedFarmer
        nonReentrant
        validStringLength(spiceType, MAX_SPICE_TYPE_LENGTH)
        validStringLength(harvestHash, MAX_IPFS_HASH_LENGTH)
        validWeight(totalWeight)
        returns (uint256 batchId)
    {
        batchId = nextBatchId;
        nextBatchId++;

        // Create passport data
        PassportData storage passport = passports[batchId];
        passport.batchId = batchId;
        passport.owner = msg.sender;
        passport.spiceType = spiceType;
        passport.totalWeight = totalWeight;
        passport.dateCreated = block.timestamp;
        passport.isLocked = false;
        passport.harvestHash = harvestHash;
        passport.status = 0; // IN_PROGRESS

        // Update tracking
        passportExists[batchId] = true;
        ownerToPassports[msg.sender].push(batchId);
        totalPassportCount++;

        emit PassportCreated(batchId, msg.sender, spiceType, harvestHash);

        return batchId;
    }

    /**
     * @dev Add a processing step to an existing passport
     * @param batchId ID of the passport to update
     * @param processingHash IPFS hash containing processing step data
     */
    function addProcessingStep(
        uint256 batchId,
        string memory processingHash
    )
        external
        onlyPassportOwner(batchId)
        validStringLength(processingHash, MAX_IPFS_HASH_LENGTH)
    {
        PassportData storage passport = passports[batchId];
        
        if (passport.isLocked) {
            revert PassportAlreadyLocked();
        }

        passport.processingHashes.push(processingHash);

        emit ProcessingStepAdded(batchId, passport.processingHashes.length - 1, processingHash);
    }

    /**
     * @dev Lock passport to prevent further modifications
     * @param batchId ID of the passport to lock
     */
    function lockPassport(uint256 batchId)
        external
        onlyPassportOwner(batchId)
    {
        PassportData storage passport = passports[batchId];
        
        if (passport.isLocked) {
            revert PassportAlreadyLocked();
        }

        passport.isLocked = true;
        passport.status = 1; // LOCKED

        emit PassportLocked(batchId);
    }

    /**
     * @dev Withdraw passport (mark as withdrawn)
     * @param batchId ID of the passport to withdraw
     */
    function withdrawPassport(uint256 batchId)
        external
        onlyPassportOwner(batchId)
    {
        PassportData storage passport = passports[batchId];
        passport.status = 2; // WITHDRAWN

        emit PassportWithdrawn(batchId);
    }

    /**
     * @dev Transfer passport ownership to another address
     * @param batchId ID of the passport to transfer
     * @param newOwner Address of the new owner
     */
    function transferPassport(uint256 batchId, address newOwner)
        external
        onlyPassportOwner(batchId)
    {
        require(newOwner != address(0), "Invalid new owner address");
        require(newOwner != msg.sender, "Cannot transfer to self");

        PassportData storage passport = passports[batchId];
        address oldOwner = passport.owner;
        passport.owner = newOwner;

        // Update owner mappings
        _removeFromOwnerList(oldOwner, batchId);
        ownerToPassports[newOwner].push(batchId);

        // Note: We could emit a TransferPassport event here if needed
    }

    /**
     * @dev Get complete passport data
     * @param batchId ID of the passport
     * @return PassportData struct with all passport information
     */
    function getPassport(uint256 batchId)
        external
        view
        validBatchId(batchId)
        returns (PassportData memory)
    {
        return passports[batchId];
    }

    /**
     * @dev Check if address owns a specific passport
     * @param batchId ID of the passport
     * @param user Address to check
     * @return bool ownership status
     */
    function isPassportOwner(uint256 batchId, address user)
        external
        view
        returns (bool)
    {
        if (!passportExists[batchId]) {
            return false;
        }
        return passports[batchId].owner == user;
    }

    /**
     * @dev Get all passport IDs owned by an address
     * @param owner Address of the passport owner
     * @return uint256[] array of passport IDs
     */
    function getPassportsByOwner(address owner)
        external
        view
        returns (uint256[] memory)
    {
        return ownerToPassports[owner];
    }

    /**
     * @dev Get total number of passports created
     * @return uint256 total passport count
     */
    function getTotalPassports() external view returns (uint256) {
        return totalPassportCount;
    }

    /**
     * @dev Get passports by status
     * @param status Status to filter by (0: IN_PROGRESS, 1: LOCKED, 2: WITHDRAWN)
     * @return uint256[] array of passport IDs with the specified status
     */
    function getPassportsByStatus(uint8 status)
        external
        view
        returns (uint256[] memory)
    {
        // Count passports with matching status
        uint256 count = 0;
        for (uint256 i = 1; i < nextBatchId; i++) {
            if (passportExists[i] && passports[i].status == status) {
                count++;
            }
        }

        // Populate result array
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 1; i < nextBatchId; i++) {
            if (passportExists[i] && passports[i].status == status) {
                result[index] = i;
                index++;
            }
        }

        return result;
    }

    /**
     * @dev Internal function to remove passport from owner's list
     * @param owner Address of the owner
     * @param batchId ID of the passport to remove
     */
    function _removeFromOwnerList(address owner, uint256 batchId) internal {
        uint256[] storage ownerPassports = ownerToPassports[owner];
        for (uint256 i = 0; i < ownerPassports.length; i++) {
            if (ownerPassports[i] == batchId) {
                // Move last element to current position and pop
                ownerPassports[i] = ownerPassports[ownerPassports.length - 1];
                ownerPassports.pop();
                break;
            }
        }
    }

    // Support for ERC165
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}