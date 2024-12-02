<script setup lang="ts">
import {
  useAccount,
  useChainId,
  useConnect,
  useDisconnect,
  useReadContract,
  useWriteContract,
  useBalance,
} from "@wagmi/vue";
import Lottery from "../contract/artifacts/contracts/Lottery.sol/Lottery.json";
import LotteryToken from "../contract/artifacts/contracts/LotteryToken.sol/LotteryToken.json";
import { ethers } from "ethers";
import { bigint } from "superstruct";
const {
  address,
  chainId: accountChainId,
  status: accountStatus,
} = useAccount();
const { disconnect } = useDisconnect();
const LotteryAddress = "0x66616ec385150f8f6a5890b82819efeaa6d9fbd2";
const tokenAddress = "0xaf9949452B0C63F3d770723870bd2224778806E9";
const chainId = useChainId();
const { connect, connectors, error, status: connectStatus } = useConnect();
const MAXUINT256 =
  115792089237316195423570985008687907853269984665640564039457584007913129639935n;

const { data: ethBalance } = useBalance({ address, chainId });
const { data: tokenBalance } = useBalance({
  address,
  chainId,
  token: tokenAddress,
});

const { data: ownerAddress } = useReadContract({
  abi: Lottery.abi,
  address: LotteryAddress,
  functionName: "owner",
});

const { data: betsOpen } = useReadContract({
  abi: Lottery.abi,
  address: LotteryAddress,
  functionName: "betsOpen",
});

const { data: prize } = useReadContract({
  abi: Lottery.abi,
  address: LotteryAddress,
  functionName: "prize",
  args: [address],
});
const prizeWithdraw = () => {
  writeContract({
    abi: Lottery.abi,
    address: LotteryAddress,
    functionName: "prizeWithdraw",
    args: [prize.value],
  });
};

const { writeContract } = useWriteContract();

const openBets = () => {
  writeContract({
    abi: Lottery.abi,
    address: LotteryAddress,
    functionName: "openBets",
    args: [BigInt(Math.round(Date.now() / 1000 + 600))],
  });
};

const { data: ownerPool } = useReadContract({
  abi: Lottery.abi,
  address: LotteryAddress,
  functionName: "ownerPool",
});

const ownerWithdraw = () => {
  writeContract({
    abi: Lottery.abi,
    address: LotteryAddress,
    functionName: "ownerWithdraw",
    args: [ownerPool.value],
  });
};

const closeBets = () => {
  writeContract({
    abi: Lottery.abi,
    address: LotteryAddress,
    functionName: "closeLottery",
  });
};

const purchaseValue = ref();
const purchaseTokens = (value: string) => {
  writeContract({
    abi: Lottery.abi,
    address: LotteryAddress,
    functionName: "purchaseTokens",
    value: ethers.parseEther(value),
  });
};
const sellValue = ref();
const sellTokens = (value: string) => {
  writeContract({
    abi: LotteryToken.abi,
    address: tokenAddress,
    functionName: "approve",
    args: [LotteryAddress, MAXUINT256],
  });
  writeContract({
    abi: Lottery.abi,
    address: LotteryAddress,
    functionName: "returnTokens",
    args: [ethers.parseEther(value)],
  });
};
const betOne = () => {
  writeContract({
    abi: LotteryToken.abi,
    address: tokenAddress,
    functionName: "approve",
    args: [LotteryAddress, MAXUINT256],
  });
  writeContract({
    abi: Lottery.abi,
    address: LotteryAddress,
    functionName: "betMany",
    args: [1n],
  });
};
</script>

<template>
  <div>
    <h2>Account</h2>

    <div>
      account: {{ address }}
      <br />
      chainId: {{ chainId }}
      <br />
      status: {{ accountStatus }}
    </div>

    <button
      v-if="accountStatus !== 'disconnected'"
      type="button"
      @click="disconnect()"
    >
      Disconnect
    </button>
  </div>

  <div>
    <h2>Connect</h2>

    <button
      v-for="connector in connectors"
      :key="connector.id"
      type="button"
      @click="connect({ connector, chainId })"
    >
      {{ connector.name }}
    </button>

    <div>
      {{ connectStatus }}
      {{ error?.message }}
    </div>
  </div>

  <div>
    <h2>Balance</h2>
    <div>eth balance: {{ ethBalance?.formatted }}</div>
    <div>token balance: {{ tokenBalance?.formatted }}</div>
    <div>
      <input v-model="purchaseValue" /><button
        @click="purchaseTokens(purchaseValue)"
      >
        purchaseTokens
      </button>
    </div>
    <div>
      <input v-model="sellValue" /><button @click="sellTokens(sellValue)">
        sellTokens
      </button>
    </div>
  </div>

  <div>
    <h2>Lottery</h2>
    <div>
      prize: {{ prize ? ethers.formatEther(prize as bigint) : 0 }}
      <button @click="prizeWithdraw()">claim</button>
    </div>
    <div v-if="ownerAddress === address">
      ownerPool: {{ prize ? ethers.formatEther(ownerPool as bigint) : 0 }}
      <button @click="ownerWithdraw()">ownerWithdraw</button>
    </div>
    <div v-if="betsOpen">
      <button @click="betOne()">betOne</button>
      <button @click="closeBets()">Close</button>
    </div>
    <div v-else>
      <div v-if="ownerAddress === address">
        <button @click="openBets()">Open Bets for next 10 mins</button>
      </div>
      <div v-else>
        <button @click="openBets()" disabled>Open Bets for next 10 mins</button>
        you don't have access
      </div>
    </div>
  </div>
</template>
