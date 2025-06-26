// contracts/scripts/deploy-main.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const tokenAddress = "0xc214a458456003FAAd6d06749E8609b066EB3495"; // 🔁 Replace with actual SkillBridgeToken address
  const nftAddress = "0x168C88A3A87F93C14274218d5F461bD1218fa646";   // 🔁 Replace with actual SkillBridgeNFT address

  const Main = await ethers.getContractFactory("SkillBridgeMain");

  const mainContract = await Main.deploy(tokenAddress, nftAddress, deployer.address); // Pass owner
  await mainContract.waitForDeployment();

  console.log("✅ SkillBridgeMain deployed to:", await mainContract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
