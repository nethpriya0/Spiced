import { expect } from "chai";
import { ethers } from "hardhat";
import { SpiceDAODiamond } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("SpiceDAODiamond", function () {
  let diamond: SpiceDAODiamond;
  let owner: HardhatEthersSigner;
  let addr1: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    
    const SpiceDAODiamond = await ethers.getContractFactory("SpiceDAODiamond");
    diamond = await SpiceDAODiamond.deploy(owner.address);
    await diamond.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await diamond.owner()).to.equal(owner.address);
    });

    it("Should emit DiamondCreated event", async function () {
      const SpiceDAODiamond = await ethers.getContractFactory("SpiceDAODiamond");
      const deployTransaction = SpiceDAODiamond.deploy(owner.address);
      
      await expect(deployTransaction)
        .to.emit(await deployTransaction, "DiamondCreated")
        .withArgs(owner.address, "Spice Platform Diamond");
    });

    it("Should return correct contract info", async function () {
      const info = await diamond.getInfo();
      expect(info[0]).to.equal("Spice Platform Diamond");
      expect(info[1]).to.equal("1.0.0");
      expect(info[2]).to.equal(owner.address);
    });
  });

  describe("Ownership", function () {
    it("Should allow owner to transfer ownership", async function () {
      await diamond.transferOwnership(addr1.address);
      expect(await diamond.owner()).to.equal(addr1.address);
    });

    it("Should prevent non-owners from transferring ownership", async function () {
      await expect(diamond.connect(addr1).transferOwnership(addr1.address))
        .to.be.reverted;
    });
  });

  describe("Diamond Proxy (Placeholder)", function () {
    it("Should revert on fallback function calls", async function () {
      await expect(
        owner.sendTransaction({
          to: await diamond.getAddress(),
          data: "0x12345678" // random function selector
        })
      ).to.be.revertedWith("Diamond proxy not yet implemented");
    });
  });
});