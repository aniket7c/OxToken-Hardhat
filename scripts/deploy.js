const hre = require("hardhat");

async function main() {
  const Token = await hre.ethers.getContractFactory("OxToken");
  const token = await Token.deploy(100000000, 50);

  await token.waitForDeployment(); 

  const tokenAddress = await token.getAddress(); 

  console.log(`Token deployed to: ${tokenAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
