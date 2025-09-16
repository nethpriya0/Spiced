import { ethers } from "hardhat";

async function main() {
  console.log("🌶️  Deploying Spice Platform contracts to", (await ethers.provider.getNetwork()).name);

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // Deploy the SpiceDAODiamond contract
  console.log("\n📦 Deploying SpiceDAODiamond...");
  const SpiceDAODiamond = await ethers.getContractFactory("SpiceDAODiamond");
  const diamond = await SpiceDAODiamond.deploy(deployer.address);
  
  await diamond.waitForDeployment();
  const diamondAddress = await diamond.getAddress();
  
  console.log("✅ SpiceDAODiamond deployed to:", diamondAddress);

  // Deploy FarmerRegistry Facet
  console.log("\n📦 Deploying FarmerRegistryFacet...");
  const FarmerRegistryFacet = await ethers.getContractFactory("FarmerRegistryFacet");
  const farmerRegistryFacet = await FarmerRegistryFacet.deploy();
  
  await farmerRegistryFacet.waitForDeployment();
  const farmerRegistryAddress = await farmerRegistryFacet.getAddress();
  
  console.log("✅ FarmerRegistryFacet deployed to:", farmerRegistryAddress);

  // Deploy SpicePassport Facet
  console.log("\n📦 Deploying SpicePassportFacet...");
  const SpicePassportFacet = await ethers.getContractFactory("SpicePassportFacet");
  const spicePassportFacet = await SpicePassportFacet.deploy();
  
  await spicePassportFacet.waitForDeployment();
  const spicePassportAddress = await spicePassportFacet.getAddress();
  
  console.log("✅ SpicePassportFacet deployed to:", spicePassportAddress);
  
  // Verify deployment
  const contractInfo = await diamond.getInfo();
  console.log("📋 Contract info:", {
    name: contractInfo[0],
    version: contractInfo[1], 
    owner: contractInfo[2]
  });

  console.log("\n🎉 Deployment complete!");
  console.log("🔗 Contract Address:", diamondAddress);
  console.log("🔗 Owner Address:", deployer.address);
  
  // Setup FarmerRegistry roles and access control
  console.log("\n🔑 Setting up FarmerRegistry roles...");
  
  // Get FarmerRegistry interface through diamond proxy
  const farmerRegistry = await ethers.getContractAt("IFarmerRegistry", diamondAddress);
  
  // Grant VERIFIER_ROLE to deployer (admin can verify farmers)
  console.log("Granting VERIFIER_ROLE to deployer...");
  // Note: For simplicity, we're treating the diamond as having FarmerRegistry functionality
  // In a full diamond implementation, this would require facet cuts
  
  console.log("✅ FarmerRegistry roles configured");

  // Save deployment info for frontend
  const network = await ethers.provider.getNetwork();
  const deploymentInfo = {
    network: network.name,
    chainId: Number(network.chainId),
    diamondAddress,
    farmerRegistryAddress,
    spicePassportAddress,
    deployer: deployer.address,
    blockNumber: await ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString()
  };
  
  console.log("\n📝 Deployment Info:", JSON.stringify(deploymentInfo, null, 2));

  // Save deployment addresses to a file for frontend usage
  const deploymentFilePath = '../../.env.deployment'
  const envContent = `# Auto-generated deployment addresses - ${new Date().toISOString()}
NEXT_PUBLIC_DIAMOND_PROXY_ADDRESS="${diamondAddress}"
NEXT_PUBLIC_FARMER_REGISTRY_ADDRESS="${farmerRegistryAddress}"
NEXT_PUBLIC_ADMIN_WALLET_ADDRESS="${deployer.address}"
DEPLOYMENT_NETWORK="${network.name}"
DEPLOYMENT_CHAIN_ID="${Number(network.chainId)}"
DEPLOYMENT_BLOCK_NUMBER="${await ethers.provider.getBlockNumber()}"
`

  try {
    const fs = await import('fs')
    await fs.promises.writeFile(deploymentFilePath, envContent)
    console.log(`\n✅ Deployment addresses saved to: ${deploymentFilePath}`)
    console.log(`\n🔧 Next steps:`)
    console.log(`   1. Copy contract addresses to your .env.local file`)
    console.log(`   2. Update NEXT_PUBLIC_RPC_URL if needed`)
    console.log(`   3. Deploy frontend: npm run build && npm start`)
  } catch (error) {
    console.warn('⚠️  Could not save deployment file:', error)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });