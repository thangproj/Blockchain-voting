const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.deploy();
  await voting.waitForDeployment();

  const address = await voting.getAddress();
  const artifact = await hre.artifacts.readArtifact("Voting");

  const outputPath = path.resolve(__dirname, "../Front-end/frontend/src/contracts/VotingInfo.json");

  const fullInfo = {
    address: address,
    abi: artifact.abi
  };

  fs.writeFileSync(outputPath, JSON.stringify(fullInfo, null, 2));
  console.log("✅ VotingInfo.json (ABI + address) đã được ghi vào frontend.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
