import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SpicePassportFacet } from "../typechain-types";

describe("SpicePassport Facet", function () {
  async function deploySpicePassportFixture() {
    // Get test accounts
    const [owner, farmer, verifier, other] = await ethers.getSigners();

    // Deploy SpicePassportFacet
    const SpicePassportFacet = await ethers.getContractFactory("SpicePassportFacet");
    const spicePassportFacet = await SpicePassportFacet.deploy();
    await spicePassportFacet.waitForDeployment();

    // Grant necessary roles
    const FARMER_ROLE = await spicePassportFacet.FARMER_ROLE();
    const VERIFIER_ROLE = await spicePassportFacet.VERIFIER_ROLE();
    
    await spicePassportFacet.grantRole(FARMER_ROLE, farmer.address);
    await spicePassportFacet.grantRole(VERIFIER_ROLE, verifier.address);

    return {
      spicePassportFacet,
      owner,
      farmer,
      verifier,
      other,
      FARMER_ROLE,
      VERIFIER_ROLE
    };
  }

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      const { spicePassportFacet } = await loadFixture(deploySpicePassportFixture);
      expect(await spicePassportFacet.getTotalPassports()).to.equal(0);
    });

    it("Should set up roles correctly", async function () {
      const { spicePassportFacet, farmer, FARMER_ROLE } = await loadFixture(deploySpicePassportFixture);
      expect(await spicePassportFacet.hasRole(FARMER_ROLE, farmer.address)).to.be.true;
    });
  });

  describe("Creating Passports", function () {
    it("Should create passport with harvest data", async function () {
      const { spicePassportFacet, farmer } = await loadFixture(deploySpicePassportFixture);
      
      const spiceType = "Ceylon Cinnamon";
      const totalWeight = 2500; // 2.5kg in grams
      const harvestHash = "ipfs://QmHarvestHash123";

      await expect(
        spicePassportFacet.connect(farmer).createPassport(spiceType, totalWeight, harvestHash)
      )
        .to.emit(spicePassportFacet, "PassportCreated")
        .withArgs(1, farmer.address, spiceType, harvestHash);

      const passport = await spicePassportFacet.getPassport(1);
      expect(passport.batchId).to.equal(1);
      expect(passport.owner).to.equal(farmer.address);
      expect(passport.spiceType).to.equal(spiceType);
      expect(passport.totalWeight).to.equal(totalWeight);
      expect(passport.harvestHash).to.equal(harvestHash);
      expect(passport.status).to.equal(0); // IN_PROGRESS
      expect(passport.isLocked).to.be.false;
    });

    it("Should increment batch ID for multiple passports", async function () {
      const { spicePassportFacet, farmer } = await loadFixture(deploySpicePassportFixture);
      
      await spicePassportFacet.connect(farmer).createPassport(
        "Ceylon Cinnamon", 
        2500, 
        "ipfs://hash1"
      );
      
      await spicePassportFacet.connect(farmer).createPassport(
        "Ceylon Cardamom", 
        1000, 
        "ipfs://hash2"
      );

      const passport1 = await spicePassportFacet.getPassport(1);
      const passport2 = await spicePassportFacet.getPassport(2);
      
      expect(passport1.batchId).to.equal(1);
      expect(passport2.batchId).to.equal(2);
      expect(await spicePassportFacet.getTotalPassports()).to.equal(2);
    });

    it("Should only allow verified farmers to create passports", async function () {
      const { spicePassportFacet, other } = await loadFixture(deploySpicePassportFixture);
      
      await expect(
        spicePassportFacet.connect(other).createPassport(
          "Ceylon Cinnamon", 
          2500, 
          "ipfs://hash"
        )
      ).to.be.revertedWithCustomError(spicePassportFacet, "OnlyVerifiedFarmer");
    });

    it("Should validate weight constraints", async function () {
      const { spicePassportFacet, farmer } = await loadFixture(deploySpicePassportFixture);
      
      // Weight too low
      await expect(
        spicePassportFacet.connect(farmer).createPassport(
          "Ceylon Cinnamon", 
          0, 
          "ipfs://hash"
        )
      ).to.be.revertedWithCustomError(spicePassportFacet, "InvalidWeight");

      // Weight too high
      await expect(
        spicePassportFacet.connect(farmer).createPassport(
          "Ceylon Cinnamon", 
          20_000_000, // 20,000kg (over limit)
          "ipfs://hash"
        )
      ).to.be.revertedWithCustomError(spicePassportFacet, "InvalidWeight");
    });

    it("Should validate string lengths", async function () {
      const { spicePassportFacet, farmer } = await loadFixture(deploySpicePassportFixture);
      
      // Empty spice type
      await expect(
        spicePassportFacet.connect(farmer).createPassport(
          "", 
          2500, 
          "ipfs://hash"
        )
      ).to.be.revertedWithCustomError(spicePassportFacet, "EmptyString");

      // Spice type too long
      const longSpiceType = "A".repeat(51); // Over 50 character limit
      await expect(
        spicePassportFacet.connect(farmer).createPassport(
          longSpiceType, 
          2500, 
          "ipfs://hash"
        )
      ).to.be.revertedWithCustomError(spicePassportFacet, "StringTooLong");
    });
  });

  describe("Processing Steps", function () {
    it("Should add processing step to passport", async function () {
      const { spicePassportFacet, farmer } = await loadFixture(deploySpicePassportFixture);
      
      // Create passport first
      await spicePassportFacet.connect(farmer).createPassport(
        "Ceylon Cinnamon", 
        2500, 
        "ipfs://harvest"
      );

      const processingHash = "ipfs://processing123";
      
      await expect(
        spicePassportFacet.connect(farmer).addProcessingStep(1, processingHash)
      )
        .to.emit(spicePassportFacet, "ProcessingStepAdded")
        .withArgs(1, 0, processingHash);

      const passport = await spicePassportFacet.getPassport(1);
      expect(passport.processingHashes).to.have.lengthOf(1);
      expect(passport.processingHashes[0]).to.equal(processingHash);
    });

    it("Should only allow owner to add processing steps", async function () {
      const { spicePassportFacet, farmer, other } = await loadFixture(deploySpicePassportFixture);
      
      await spicePassportFacet.connect(farmer).createPassport(
        "Ceylon Cinnamon", 
        2500, 
        "ipfs://harvest"
      );

      await expect(
        spicePassportFacet.connect(other).addProcessingStep(1, "ipfs://processing")
      ).to.be.revertedWithCustomError(spicePassportFacet, "OnlyPassportOwner");
    });

    it("Should not allow adding steps to locked passport", async function () {
      const { spicePassportFacet, farmer } = await loadFixture(deploySpicePassportFixture);
      
      await spicePassportFacet.connect(farmer).createPassport(
        "Ceylon Cinnamon", 
        2500, 
        "ipfs://harvest"
      );
      
      // Lock the passport
      await spicePassportFacet.connect(farmer).lockPassport(1);

      await expect(
        spicePassportFacet.connect(farmer).addProcessingStep(1, "ipfs://processing")
      ).to.be.revertedWithCustomError(spicePassportFacet, "PassportAlreadyLocked");
    });
  });

  describe("Passport Locking", function () {
    it("Should lock passport and update status", async function () {
      const { spicePassportFacet, farmer } = await loadFixture(deploySpicePassportFixture);
      
      await spicePassportFacet.connect(farmer).createPassport(
        "Ceylon Cinnamon", 
        2500, 
        "ipfs://harvest"
      );

      await expect(
        spicePassportFacet.connect(farmer).lockPassport(1)
      ).to.emit(spicePassportFacet, "PassportLocked").withArgs(1);

      const passport = await spicePassportFacet.getPassport(1);
      expect(passport.isLocked).to.be.true;
      expect(passport.status).to.equal(1); // LOCKED
    });

    it("Should not allow double locking", async function () {
      const { spicePassportFacet, farmer } = await loadFixture(deploySpicePassportFixture);
      
      await spicePassportFacet.connect(farmer).createPassport(
        "Ceylon Cinnamon", 
        2500, 
        "ipfs://harvest"
      );
      
      await spicePassportFacet.connect(farmer).lockPassport(1);

      await expect(
        spicePassportFacet.connect(farmer).lockPassport(1)
      ).to.be.revertedWithCustomError(spicePassportFacet, "PassportAlreadyLocked");
    });
  });

  describe("Passport Withdrawal", function () {
    it("Should withdraw passport and update status", async function () {
      const { spicePassportFacet, farmer } = await loadFixture(deploySpicePassportFixture);
      
      await spicePassportFacet.connect(farmer).createPassport(
        "Ceylon Cinnamon", 
        2500, 
        "ipfs://harvest"
      );

      await expect(
        spicePassportFacet.connect(farmer).withdrawPassport(1)
      ).to.emit(spicePassportFacet, "PassportWithdrawn").withArgs(1);

      const passport = await spicePassportFacet.getPassport(1);
      expect(passport.status).to.equal(2); // WITHDRAWN
    });
  });

  describe("Owner Functions", function () {
    it("Should return correct passport ownership", async function () {
      const { spicePassportFacet, farmer, other } = await loadFixture(deploySpicePassportFixture);
      
      await spicePassportFacet.connect(farmer).createPassport(
        "Ceylon Cinnamon", 
        2500, 
        "ipfs://harvest"
      );

      expect(await spicePassportFacet.isPassportOwner(1, farmer.address)).to.be.true;
      expect(await spicePassportFacet.isPassportOwner(1, other.address)).to.be.false;
    });

    it("Should return passports by owner", async function () {
      const { spicePassportFacet, farmer } = await loadFixture(deploySpicePassportFixture);
      
      await spicePassportFacet.connect(farmer).createPassport(
        "Ceylon Cinnamon", 
        2500, 
        "ipfs://harvest1"
      );
      
      await spicePassportFacet.connect(farmer).createPassport(
        "Ceylon Cardamom", 
        1000, 
        "ipfs://harvest2"
      );

      const farmerPassports = await spicePassportFacet.getPassportsByOwner(farmer.address);
      expect(farmerPassports).to.have.lengthOf(2);
      expect(farmerPassports[0]).to.equal(1);
      expect(farmerPassports[1]).to.equal(2);
    });
  });

  describe("Query Functions", function () {
    it("Should get passports by status", async function () {
      const { spicePassportFacet, farmer } = await loadFixture(deploySpicePassportFixture);
      
      // Create two passports
      await spicePassportFacet.connect(farmer).createPassport(
        "Ceylon Cinnamon", 
        2500, 
        "ipfs://harvest1"
      );
      
      await spicePassportFacet.connect(farmer).createPassport(
        "Ceylon Cardamom", 
        1000, 
        "ipfs://harvest2"
      );

      // Lock one passport
      await spicePassportFacet.connect(farmer).lockPassport(1);

      // Query by status
      const inProgressPassports = await spicePassportFacet.getPassportsByStatus(0); // IN_PROGRESS
      const lockedPassports = await spicePassportFacet.getPassportsByStatus(1); // LOCKED

      expect(inProgressPassports).to.have.lengthOf(1);
      expect(inProgressPassports[0]).to.equal(2);
      
      expect(lockedPassports).to.have.lengthOf(1);
      expect(lockedPassports[0]).to.equal(1);
    });

    it("Should handle non-existent passport queries gracefully", async function () {
      const { spicePassportFacet, farmer } = await loadFixture(deploySpicePassportFixture);
      
      await expect(
        spicePassportFacet.getPassport(999)
      ).to.be.revertedWithCustomError(spicePassportFacet, "PassportNotExists");

      expect(await spicePassportFacet.isPassportOwner(999, farmer.address)).to.be.false;
    });
  });
});