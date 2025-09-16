// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

/**
 * @title ISpicePassport
 * @dev Interface for digital passport creation and management
 */
interface ISpicePassport {
    struct PassportData {
        uint256 batchId;
        address owner;
        string spiceType;
        uint256 totalWeight; // in grams
        uint256 dateCreated;
        bool isLocked;
        string harvestHash; // IPFS hash for harvest data
        string[] processingHashes; // IPFS hashes for processing steps
        string packageHash; // IPFS hash for packaging data
        uint8 status; // 0: IN_PROGRESS, 1: LOCKED, 2: WITHDRAWN
    }
    
    // Events
    event PassportCreated(
        uint256 indexed batchId,
        address indexed farmer,
        string spiceType,
        string harvestHash
    );
    
    event ProcessingStepAdded(
        uint256 indexed batchId,
        uint256 stepIndex,
        string processingHash
    );
    
    event PassportLocked(uint256 indexed batchId);
    event PassportWithdrawn(uint256 indexed batchId);
    
    // Core functions
    function createPassport(
        string memory spiceType,
        uint256 totalWeight,
        string memory harvestHash
    ) external returns (uint256 batchId);
    
    function addProcessingStep(
        uint256 batchId,
        string memory processingHash
    ) external;
    
    function lockPassport(uint256 batchId) external;
    
    function withdrawPassport(uint256 batchId) external;
    
    function transferPassport(uint256 batchId, address newOwner) external;
    
    // View functions
    function getPassport(uint256 batchId) external view returns (PassportData memory);
    function isPassportOwner(uint256 batchId, address user) external view returns (bool);
    function getPassportsByOwner(address owner) external view returns (uint256[] memory);
    function getTotalPassports() external view returns (uint256);
}