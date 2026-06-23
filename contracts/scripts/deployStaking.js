const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying SignalStaking with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  const SignalStaking = await ethers.getContractFactory("SignalStaking");
  const staking = await SignalStaking.deploy();
  await staking.waitForDeployment();

  const address = await staking.getAddress();
  console.log("\nSignalStaking deployed to:", address);
  console.log("Add to frontend .env:\n  VITE_STAKING_CONTRACT=" + address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
