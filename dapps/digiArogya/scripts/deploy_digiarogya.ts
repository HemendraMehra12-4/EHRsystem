import { ethers } from "hardhat"

async function main() {
  const initialSupply = ethers.parseEther('10000.0')
  const DigiArogya  = await ethers.getContractFactory("EHRmain")
  const deploy = await DigiArogya.deploy()
  console.log("Contract deploy at: %s", await deploy.getAddress());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
