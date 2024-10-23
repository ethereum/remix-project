type ChainInfo = {
  id: number;
  name: string;
};

type HardFork =
  | 'berlin'
  | 'byzantium'
  | 'cancun'
  | 'constantinople'
  | 'homestead'
  | 'istanbul'
  | 'london'
  | 'paris'
  | 'petersburg'
  | 'shanghai'
  | 'spuriousDragon'
  | 'tangarineWhistle';

export const evmMap: Map<HardFork, { chainId: ChainInfo[] }> = new Map([
  ['berlin', {
    chainId: [
      { id: 1, name: "Ethereum Mainnet" },
      { id: 5, name: "Goerli" },
      { id: 11155111, name: "Sepolia" }
    ]
  }],
  ['byzantium', {
    chainId: [
      { id: 1, name: "Ethereum Mainnet" }
    ]
  }],
  ['cancun', {
    chainId: [
      { id: 1, name: "Ethereum Mainnet" },
      { id: 5, name: "Goerli" },
      { id: 11155111, name: "Sepolia" },
    ]
  }],
  ['constantinople', {
    chainId: [
      { id: 1, name: "Ethereum Mainnet" },
      { id: 5, name: "Goerli" },
      { id: 11155111, name: "Sepolia" }
    ]
  }],
  ['homestead', {
    chainId: [
      { id: 1, name: "Ethereum Mainnet" },
      { id: 5, name: "Goerli" },
      { id: 11155111, name: "Sepolia" }
    ]
  }],
  ['istanbul', {
    chainId: [
      { id: 1, name: "Ethereum Mainnet" },
      { id: 5, name: "Goerli" },
      { id: 11155111, name: "Sepolia" }
    ]
  }],
  ['london', {
    chainId: [
      { id: 1, name: "Ethereum Mainnet" },
      { id: 5, name: "Goerli" },
      { id: 10, name: "Optimism" },
      { id: 25, name: "Cronos Mainnet" },
      { id: 30, name: "Rootstock Mainnet" },
      { id: 56, name: "BNB Smart Chain Mainnet" },
      { id: 100, name: "Gnosis Chain" },
      { id: 137, name: "Polygon Mainnet" },
      { id: 250, name: "Fantom Opera" },
      { id: 1280, name: "HALO Mainnet" },
      { id: 42161, name: "Arbitrum One" },
      { id: 42220, name: "Celo Mainnet" }
    ]
  }],
  ['paris', {
    chainId: [
      { id: 1, name: "Ethereum Mainnet" },
      { id: 5, name: "Goerli" },
      { id: 10, name: "Optimism" },
      { id: 30, name: "Rootstock Mainnet" },
      { id: 56, name: "BNB Smart Chain Mainnet" },
      { id: 100, name: "Gnosis Chain" },
      { id: 137, name: "Polygon Mainnet" },
      { id: 300, name: "zkSync Sepolia Testnet" },
      { id: 302, name: "zkSync Era Testnet" },
      { id: 314, name: "Filecoin - Mainnet" },
      { id: 324, name: "zkSync Mainnet" },
      { id: 369, name: "PulseChain" },
      { id: 388, name: "HALO Mainnet" },
      { id: 1101, name: "Polygon zkEVM" },
      { id: 1284, name: "Moonbeam" },
      { id: 2000, name: "Dogechain Mainnet" },
      { id: 42220, name: "Celo Mainnet" },
      { id: 42161, name: "Arbitrum One" },
      { id: 42170, name: "Arbitrum Nova" },
      { id: 44787, name: "Celo Alfajores Testnet" },
      { id: 59144, name: "Linea Mainnet" },
      { id: 59141, name: "Linea Testnet" },
      { id: 11155111, name: "Sepolia" },
      { id: 11155420, name: "Optimism Sepolia Testnet" },
      { id: 1666600000, name: "Harmony Mainnet Shard 0" }
    ]
  }],
  ['petersburg', {
    chainId: [
      { id: 1, name: "Ethereum Mainnet" },
      { id: 5, name: "Goerli" },
      { id: 11155111, name: "Sepolia" }
    ]
  }],
  ['shanghai', {
    chainId: [
      { id: 1, name: "Ethereum Mainnet" },
      { id: 5, name: "Goerli" },
      { id: 11155111, name: "Sepolia" }
    ]
  }],
  ['spuriousDragon', {
    chainId: [
      { id: 1, name: "Ethereum Mainnet" }
    ]
  }],
  ['tangarineWhistle', {
    chainId: [
      { id: 1, name: "Ethereum Mainnet" }
    ]
  }]
])

export function getCompatibleChains(fork: HardFork): ChainInfo[] {
  const forkData = evmMap.get(fork);
  return forkData ? forkData.chainId : [];
}

export function isChainCompatible(fork: HardFork, chainId: number): boolean {
  const compatibleChains = getCompatibleChains(fork);
  return compatibleChains.some(chain => chain.id === chainId);
}

export function isChainCompatibleWithAnyFork(chainId: number, forks: HardFork[]): boolean {
  return forks.some(fork => isChainCompatible(fork, chainId));
}
