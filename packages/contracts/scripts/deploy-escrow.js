const hre = require("hardhat");

async function main() {
  console.log("Deploying SpiceEscrowFacet...");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)));

  // Deploy SpiceEscrowFacet
  const SpiceEscrowFacet = await hre.ethers.getContractFactory("SpiceEscrowFacet");
  const escrowFacet = await SpiceEscrowFacet.deploy();
  
  await escrowFacet.waitForDeployment();
  const escrowAddress = await escrowFacet.getAddress();

  console.log("SpiceEscrowFacet deployed to:", escrowAddress);

  // Verify the contract (optional)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await escrowFacet.deploymentTransaction().wait(6);
    
    try {
      await hre.run("verify:verify", {
        address: escrowAddress,
        constructorArguments: [],
      });
      console.log("Contract verified successfully");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }

  console.log("\n=== Deployment Summary ===");
  console.log("SpiceEscrowFacet:", escrowAddress);
  console.log("\nAdd this to your .env.local:");
  console.log(`NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS="${escrowAddress}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });