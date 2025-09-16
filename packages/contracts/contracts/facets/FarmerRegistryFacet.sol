// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/IFarmerRegistry.sol";

contract FarmerRegistryFacet is IFarmerRegistry, AccessControl, ReentrancyGuard {
    // Role definitions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant FARMER_ROLE = keccak256("FARMER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant MEDIATOR_ROLE = keccak256("MEDIATOR_ROLE");

    // Storage
    mapping(address => UserProfile) private userProfiles;
    mapping(address => bool) private registeredFarmers;
    address[] private allFarmers;
    address[] private verifiedFarmers;
    
    // Profile picture and bio length limits
    uint256 public constant MAX_NAME_LENGTH = 100;
    uint256 public constant MAX_BIO_LENGTH = 1000;
    uint256 public constant MAX_IPFS_HASH_LENGTH = 100;
    
    // Custom errors
    error FarmerNotRegistered();
    error FarmerAlreadyRegistered();
    error FarmerAlreadyVerified();
    error InvalidAddress();
    error StringTooLong();
    error OnlyVerifier();
    error OnlyFarmer();

    // Modifiers
    modifier onlyVerifier() {
        if (!hasRole(VERIFIER_ROLE, msg.sender)) {
            revert OnlyVerifier();
        }
        _;
    }

    modifier onlyRegisteredFarmer() {
        if (!registeredFarmers[msg.sender]) {
            revert FarmerNotRegistered();
        }
        _;
    }

    modifier validAddress(address addr) {
        if (addr == address(0)) {
            revert InvalidAddress();
        }
        _;
    }

    modifier validStringLength(string memory str, uint256 maxLength) {
        if (bytes(str).length > maxLength) {
            revert StringTooLong();
        }
        _;
    }

    constructor() {
        // Grant the contract deployer all roles initially
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
        _grantRole(FARMER_ROLE, msg.sender);
        _grantRole(MEDIATOR_ROLE, msg.sender);
    }

    /**
     * @dev Register a new farmer with profile information
     * @param name Farmer's display name
     * @param bio Short biography or description
     * @param profilePictureHash IPFS hash of profile picture
     */
    function registerFarmer(
        string memory name,
        string memory bio,
        string memory profilePictureHash
    ) 
        external 
        validStringLength(name, MAX_NAME_LENGTH)
        validStringLength(bio, MAX_BIO_LENGTH)
        validStringLength(profilePictureHash, MAX_IPFS_HASH_LENGTH)
    {
        if (registeredFarmers[msg.sender]) {
            revert FarmerAlreadyRegistered();
        }

        // Create new user profile
        UserProfile storage profile = userProfiles[msg.sender];
        profile.name = name;
        profile.bio = bio;
        profile.profilePictureHash = profilePictureHash;
        profile.reputationScore = 100; // Starting reputation
        profile.isVerified = false;
        profile.dateJoined = block.timestamp;

        // Mark as registered and add to farmers list
        registeredFarmers[msg.sender] = true;
        allFarmers.push(msg.sender);

        // Grant farmer role
        _grantRole(FARMER_ROLE, msg.sender);

        emit FarmerRegistered(msg.sender, name, block.timestamp);
    }

    /**
     * @dev Verify a farmer (only callable by verifiers)
     * @param farmer Address of farmer to verify
     */
    function verifyFarmer(address farmer) 
        external 
        onlyVerifier 
        validAddress(farmer)
        nonReentrant
    {
        if (!registeredFarmers[farmer]) {
            revert FarmerNotRegistered();
        }

        UserProfile storage profile = userProfiles[farmer];
        if (profile.isVerified) {
            revert FarmerAlreadyVerified();
        }

        profile.isVerified = true;
        verifiedFarmers.push(farmer);

        emit FarmerVerified(farmer, msg.sender, block.timestamp);
    }

    /**
     * @dev Update farmer's profile (only by the farmer themselves)
     * @param name New display name
     * @param bio New biography
     * @param profilePictureHash New IPFS hash for profile picture
     */
    function updateProfile(
        string memory name,
        string memory bio,
        string memory profilePictureHash
    ) 
        external 
        onlyRegisteredFarmer
        validStringLength(name, MAX_NAME_LENGTH)
        validStringLength(bio, MAX_BIO_LENGTH)
        validStringLength(profilePictureHash, MAX_IPFS_HASH_LENGTH)
    {
        UserProfile storage profile = userProfiles[msg.sender];
        profile.name = name;
        profile.bio = bio;
        profile.profilePictureHash = profilePictureHash;

        emit ProfileUpdated(msg.sender, name, bio, profilePictureHash);
    }

    /**
     * @dev Award verification badge to a farmer
     * @param farmer Address of farmer
     * @param badgeName Name of the badge to award
     */
    function addVerificationBadge(
        address farmer,
        string memory badgeName
    ) 
        external 
        onlyVerifier 
        validAddress(farmer)
        validStringLength(badgeName, MAX_NAME_LENGTH)
    {
        if (!registeredFarmers[farmer]) {
            revert FarmerNotRegistered();
        }

        UserProfile storage profile = userProfiles[farmer];
        profile.verifiedBadges.push(badgeName);

        emit BadgeAwarded(farmer, badgeName, msg.sender);
    }

    /**
     * @dev Update farmer's reputation score
     * @param farmer Address of farmer
     * @param newScore New reputation score
     */
    function updateReputationScore(
        address farmer,
        uint256 newScore
    ) 
        external 
        onlyRole(MEDIATOR_ROLE)
        validAddress(farmer)
    {
        if (!registeredFarmers[farmer]) {
            revert FarmerNotRegistered();
        }

        UserProfile storage profile = userProfiles[farmer];
        uint256 oldScore = profile.reputationScore;
        profile.reputationScore = newScore;

        emit ReputationUpdated(farmer, oldScore, newScore);
    }

    // View functions

    /**
     * @dev Check if farmer is verified
     * @param farmer Address to check
     * @return bool verification status
     */
    function isVerified(address farmer) external view returns (bool) {
        if (!registeredFarmers[farmer]) {
            return false;
        }
        return userProfiles[farmer].isVerified;
    }

    /**
     * @dev Get complete user profile
     * @param user Address of user
     * @return UserProfile struct with all profile data
     */
    function getUserProfile(address user) 
        external 
        view 
        returns (UserProfile memory) 
    {
        if (!registeredFarmers[user]) {
            revert FarmerNotRegistered();
        }
        return userProfiles[user];
    }

    /**
     * @dev Get farmer's reputation score
     * @param farmer Address of farmer
     * @return uint256 reputation score
     */
    function getReputationScore(address farmer) 
        external 
        view 
        returns (uint256) 
    {
        if (!registeredFarmers[farmer]) {
            return 0;
        }
        return userProfiles[farmer].reputationScore;
    }

    /**
     * @dev Get batches created by farmer
     * @param farmer Address of farmer
     * @return uint256[] array of batch IDs
     */
    function getFarmerBatches(address farmer) 
        external 
        view 
        returns (uint256[] memory) 
    {
        if (!registeredFarmers[farmer]) {
            revert FarmerNotRegistered();
        }
        return userProfiles[farmer].batchesCreated;
    }

    /**
     * @dev Get list of unverified farmers
     * @return address[] array of pending farmer addresses
     */
    function getPendingFarmers() external view returns (address[] memory) {
        // Count pending farmers first
        uint256 pendingCount = 0;
        for (uint256 i = 0; i < allFarmers.length; i++) {
            if (!userProfiles[allFarmers[i]].isVerified) {
                pendingCount++;
            }
        }

        // Create array of pending farmers
        address[] memory pending = new address[](pendingCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < allFarmers.length; i++) {
            if (!userProfiles[allFarmers[i]].isVerified) {
                pending[currentIndex] = allFarmers[i];
                currentIndex++;
            }
        }

        return pending;
    }

    /**
     * @dev Get list of verified farmers
     * @return address[] array of verified farmer addresses
     */
    function getVerifiedFarmers() external view returns (address[] memory) {
        return verifiedFarmers;
    }

    /**
     * @dev Get total number of registered farmers
     * @return uint256 total farmer count
     */
    function getFarmerCount() external view returns (uint256) {
        return allFarmers.length;
    }

    /**
     * @dev Get number of verified farmers
     * @return uint256 verified farmer count
     */
    function getVerifiedFarmerCount() external view returns (uint256) {
        return verifiedFarmers.length;
    }

    /**
     * @dev Check if address is a registered farmer
     * @param farmer Address to check
     * @return bool registration status
     */
    function isRegisteredFarmer(address farmer) external view returns (bool) {
        return registeredFarmers[farmer];
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