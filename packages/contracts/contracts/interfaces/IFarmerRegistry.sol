// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IFarmerRegistry {
    struct UserProfile {
        string name;
        string bio;
        string profilePictureHash; // IPFS hash
        uint256 reputationScore;
        bool isVerified;
        string[] verifiedBadges;
        uint256 dateJoined;
        uint256[] batchesCreated;
        uint256[] batchesPurchased;
        uint256[] disputesInvolvedIn;
    }

    // Events
    event FarmerRegistered(
        address indexed farmer, 
        string name,
        uint256 dateJoined
    );
    
    event FarmerVerified(
        address indexed farmer, 
        address indexed verifier,
        uint256 timestamp
    );
    
    event ProfileUpdated(
        address indexed farmer,
        string name,
        string bio,
        string profilePictureHash
    );
    
    event ReputationUpdated(
        address indexed farmer, 
        uint256 oldScore,
        uint256 newScore
    );

    event BadgeAwarded(
        address indexed farmer,
        string badgeName,
        address indexed verifier
    );

    // Core functions
    function registerFarmer(
        string memory name,
        string memory bio,
        string memory profilePictureHash
    ) external;

    function verifyFarmer(address farmer) external;

    function updateProfile(
        string memory name,
        string memory bio,
        string memory profilePictureHash
    ) external;

    function addVerificationBadge(
        address farmer,
        string memory badgeName
    ) external;

    function updateReputationScore(
        address farmer,
        uint256 newScore
    ) external;

    // View functions
    function isVerified(address farmer) external view returns (bool);
    
    function getUserProfile(address user) 
        external 
        view 
        returns (UserProfile memory);
    
    function getReputationScore(address farmer) 
        external 
        view 
        returns (uint256);
    
    function getFarmerBatches(address farmer) 
        external 
        view 
        returns (uint256[] memory);

    function getPendingFarmers() 
        external 
        view 
        returns (address[] memory);

    function getVerifiedFarmers()
        external
        view
        returns (address[] memory);

    function getFarmerCount() external view returns (uint256);
    
    function getVerifiedFarmerCount() external view returns (uint256);
}