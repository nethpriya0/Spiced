import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { FarmerRegistryFacet } from "../typechain-types";

describe("FarmerRegistry", function () {
  async function deployFarmerRegistryFixture() {
    const [owner, farmer, verifier, otherAccount] = await ethers.getSigners();

    const FarmerRegistryFacet = await ethers.getContractFactory("FarmerRegistryFacet");
    const farmerRegistry = await FarmerRegistryFacet.deploy();

    // Grant verifier role to verifier account
    const VERIFIER_ROLE = await farmerRegistry.VERIFIER_ROLE();
    await farmerRegistry.grantRole(VERIFIER_ROLE, verifier.address);

    return { farmerRegistry, owner, farmer, verifier, otherAccount, VERIFIER_ROLE };
  }

  describe("Deployment", function () {
    it("Should set the right roles", async function () {
      const { farmerRegistry, owner, VERIFIER_ROLE } = await loadFixture(deployFarmerRegistryFixture);

      expect(await farmerRegistry.hasRole(await farmerRegistry.DEFAULT_ADMIN_ROLE(), owner.address)).to.equal(true);
      expect(await farmerRegistry.hasRole(await farmerRegistry.ADMIN_ROLE(), owner.address)).to.equal(true);
      expect(await farmerRegistry.hasRole(VERIFIER_ROLE, owner.address)).to.equal(true);
    });

    it("Should start with zero farmers", async function () {
      const { farmerRegistry } = await loadFixture(deployFarmerRegistryFixture);

      expect(await farmerRegistry.getFarmerCount()).to.equal(0);
      expect(await farmerRegistry.getVerifiedFarmerCount()).to.equal(0);
    });
  });

  describe("Farmer Registration", function () {
    it("Should register a farmer successfully", async function () {
      const { farmerRegistry, farmer } = await loadFixture(deployFarmerRegistryFixture);

      await expect(
        farmerRegistry.connect(farmer).registerFarmer(
          "John Farmer",
          "Organic spice grower from Kerala",
          "QmTestHash123"
        )
      ).to.emit(farmerRegistry, "FarmerRegistered")
        .withArgs(farmer.address, "John Farmer", await ethers.provider.getBlock('latest').then(b => b!.timestamp + 1));

      expect(await farmerRegistry.getFarmerCount()).to.equal(1);
      expect(await farmerRegistry.isRegisteredFarmer(farmer.address)).to.equal(true);
      expect(await farmerRegistry.isVerified(farmer.address)).to.equal(false);
    });

    it("Should not allow duplicate registration", async function () {
      const { farmerRegistry, farmer } = await loadFixture(deployFarmerRegistryFixture);

      await farmerRegistry.connect(farmer).registerFarmer(
        "John Farmer",
        "Organic spice grower",
        "QmTestHash123"
      );

      await expect(
        farmerRegistry.connect(farmer).registerFarmer(
          "John Farmer Updated",
          "Updated bio",
          "QmTestHash456"
        )
      ).to.be.revertedWithCustomError(farmerRegistry, "FarmerAlreadyRegistered");
    });

    it("Should reject registration with invalid string lengths", async function () {
      const { farmerRegistry, farmer } = await loadFixture(deployFarmerRegistryFixture);

      const longString = "a".repeat(1001);

      await expect(
        farmerRegistry.connect(farmer).registerFarmer(
          longString, // Too long name
          "Valid bio",
          "QmTestHash123"
        )
      ).to.be.revertedWithCustomError(farmerRegistry, "StringTooLong");

      await expect(
        farmerRegistry.connect(farmer).registerFarmer(
          "Valid name",
          longString, // Too long bio
          "QmTestHash123"
        )
      ).to.be.revertedWithCustomError(farmerRegistry, "StringTooLong");
    });
  });

  describe("Farmer Verification", function () {
    it("Should verify farmer when called by verifier", async function () {
      const { farmerRegistry, farmer, verifier } = await loadFixture(deployFarmerRegistryFixture);

      // Register farmer first
      await farmerRegistry.connect(farmer).registerFarmer(
        "John Farmer",
        "Organic spice grower",
        "QmTestHash123"
      );

      // Verify farmer
      await expect(
        farmerRegistry.connect(verifier).verifyFarmer(farmer.address)
      ).to.emit(farmerRegistry, "FarmerVerified")
        .withArgs(farmer.address, verifier.address, await ethers.provider.getBlock('latest').then(b => b!.timestamp + 1));

      expect(await farmerRegistry.isVerified(farmer.address)).to.equal(true);
      expect(await farmerRegistry.getVerifiedFarmerCount()).to.equal(1);
    });

    it("Should reject verification by non-verifier", async function () {
      const { farmerRegistry, farmer, otherAccount } = await loadFixture(deployFarmerRegistryFixture);

      await farmerRegistry.connect(farmer).registerFarmer(
        "John Farmer",
        "Organic spice grower",
        "QmTestHash123"
      );

      await expect(
        farmerRegistry.connect(otherAccount).verifyFarmer(farmer.address)
      ).to.be.revertedWithCustomError(farmerRegistry, "OnlyVerifier");
    });

    it("Should not verify unregistered farmer", async function () {
      const { farmerRegistry, verifier, otherAccount } = await loadFixture(deployFarmerRegistryFixture);

      await expect(
        farmerRegistry.connect(verifier).verifyFarmer(otherAccount.address)
      ).to.be.revertedWithCustomError(farmerRegistry, "FarmerNotRegistered");
    });

    it("Should not verify already verified farmer", async function () {
      const { farmerRegistry, farmer, verifier } = await loadFixture(deployFarmerRegistryFixture);

      await farmerRegistry.connect(farmer).registerFarmer(
        "John Farmer",
        "Organic spice grower",
        "QmTestHash123"
      );

      await farmerRegistry.connect(verifier).verifyFarmer(farmer.address);

      await expect(
        farmerRegistry.connect(verifier).verifyFarmer(farmer.address)
      ).to.be.revertedWithCustomError(farmerRegistry, "FarmerAlreadyVerified");
    });
  });

  describe("Profile Management", function () {
    it("Should allow farmer to update their profile", async function () {
      const { farmerRegistry, farmer } = await loadFixture(deployFarmerRegistryFixture);

      await farmerRegistry.connect(farmer).registerFarmer(
        "John Farmer",
        "Organic spice grower",
        "QmTestHash123"
      );

      await expect(
        farmerRegistry.connect(farmer).updateProfile(
          "John Updated",
          "Updated bio",
          "QmNewHash456"
        )
      ).to.emit(farmerRegistry, "ProfileUpdated")
        .withArgs(farmer.address, "John Updated", "Updated bio", "QmNewHash456");

      const profile = await farmerRegistry.getUserProfile(farmer.address);
      expect(profile.name).to.equal("John Updated");
      expect(profile.bio).to.equal("Updated bio");
      expect(profile.profilePictureHash).to.equal("QmNewHash456");
    });

    it("Should not allow non-farmers to update profiles", async function () {
      const { farmerRegistry, otherAccount } = await loadFixture(deployFarmerRegistryFixture);

      await expect(
        farmerRegistry.connect(otherAccount).updateProfile(
          "Fake Name",
          "Fake bio",
          "QmFakeHash"
        )
      ).to.be.revertedWithCustomError(farmerRegistry, "FarmerNotRegistered");
    });
  });

  describe("Badge Management", function () {
    it("Should allow verifier to award badges", async function () {
      const { farmerRegistry, farmer, verifier } = await loadFixture(deployFarmerRegistryFixture);

      await farmerRegistry.connect(farmer).registerFarmer(
        "John Farmer",
        "Organic spice grower",
        "QmTestHash123"
      );

      await expect(
        farmerRegistry.connect(verifier).addVerificationBadge(
          farmer.address,
          "Organic Certified"
        )
      ).to.emit(farmerRegistry, "BadgeAwarded")
        .withArgs(farmer.address, "Organic Certified", verifier.address);

      const profile = await farmerRegistry.getUserProfile(farmer.address);
      expect(profile.verifiedBadges[0]).to.equal("Organic Certified");
    });
  });

  describe("Data Queries", function () {
    it("Should return pending farmers correctly", async function () {
      const { farmerRegistry, farmer, verifier, otherAccount } = await loadFixture(deployFarmerRegistryFixture);

      // Register two farmers
      await farmerRegistry.connect(farmer).registerFarmer(
        "John Farmer",
        "Organic spice grower",
        "QmTestHash123"
      );

      await farmerRegistry.connect(otherAccount).registerFarmer(
        "Jane Farmer",
        "Spice trader",
        "QmTestHash456"
      );

      // Verify one farmer
      await farmerRegistry.connect(verifier).verifyFarmer(farmer.address);

      // Check pending farmers (should only include unverified one)
      const pendingFarmers = await farmerRegistry.getPendingFarmers();
      expect(pendingFarmers.length).to.equal(1);
      expect(pendingFarmers[0]).to.equal(otherAccount.address);
    });

    it("Should return verified farmers correctly", async function () {
      const { farmerRegistry, farmer, verifier } = await loadFixture(deployFarmerRegistryFixture);

      await farmerRegistry.connect(farmer).registerFarmer(
        "John Farmer",
        "Organic spice grower",
        "QmTestHash123"
      );

      await farmerRegistry.connect(verifier).verifyFarmer(farmer.address);

      const verifiedFarmers = await farmerRegistry.getVerifiedFarmers();
      expect(verifiedFarmers.length).to.equal(1);
      expect(verifiedFarmers[0]).to.equal(farmer.address);
    });
  });

  describe("Access Control", function () {
    it("Should allow admin to grant roles", async function () {
      const { farmerRegistry, owner, otherAccount, VERIFIER_ROLE } = await loadFixture(deployFarmerRegistryFixture);

      await farmerRegistry.connect(owner).grantRole(VERIFIER_ROLE, otherAccount.address);
      expect(await farmerRegistry.hasRole(VERIFIER_ROLE, otherAccount.address)).to.equal(true);
    });

    it("Should allow admin to revoke roles", async function () {
      const { farmerRegistry, owner, verifier, VERIFIER_ROLE } = await loadFixture(deployFarmerRegistryFixture);

      await farmerRegistry.connect(owner).revokeRole(VERIFIER_ROLE, verifier.address);
      expect(await farmerRegistry.hasRole(VERIFIER_ROLE, verifier.address)).to.equal(false);
    });
  });
});