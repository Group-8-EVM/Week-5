import { viem } from "hardhat";
import { parseEther } from "viem";

const BET_PRICE = "0.09";
const BET_FEE = "0.01";
const TOKEN_RATIO = 1n;

async function main() {
  console.log("Deploying contract");
  const contract = await viem.deployContract("Lottery", [
    "LotteryToken",
    "LT0",
    TOKEN_RATIO,
    parseEther(BET_PRICE),
    parseEther(BET_FEE),
  ]);
  const contractAddress = contract.address;
  const tokenAddress = await contract.read.paymentToken();
  console.log("Lottery contract deployed to: ", contractAddress);
  console.log("Token contract deployed to: ", tokenAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
