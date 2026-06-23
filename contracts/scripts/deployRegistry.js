const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying WalletRegistry with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  const WalletRegistry = await ethers.getContractFactory("WalletRegistry");
  const registry = await WalletRegistry.deploy();
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log("\nWalletRegistry deployed to:", address);
  console.log("Add to frontend .env:\n  VITE_REGISTRY_CONTRACT=" + address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
