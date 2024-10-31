export type ChainInfo = {
  id: number | string
  name: string
}

export type HardFork =
  | 'cancun'
  | 'shanghai'
  | 'paris'
  | 'london'
  | 'berlin'
  | 'istanbul'
  | 'petersburg'
  | 'constantinople'
  | 'byzantium'
  | 'spuriousDragon'
  | 'tangerineWhistle'
  | 'homestead'

export const evmMap: Map<HardFork, { chainId: ChainInfo[], minCompilerVersion: string }> = new Map([
  ['cancun', {
    chainId: [
      { id: 1, name: "Ethereum Mainnet" },
      { id: 5, name: "Goerli" },
      { id: 10, name: "Optimism" },
      { id: 56, name: "BNB Smart Chain Mainnet" },
      { id: 100, name: "Gnosis Chain" },
      { id: 137, name: "Polygon Mainnet" },
      { id: 250, name: "Fantom Opera" },
      { id: 300, name: "zkSync Era Mainnet" },
      { id: 42161, name: "Arbitrum One" },
      { id: 42170, name: "Arbitrum Nova" },
      { id: 43114, name: "Avalanche C-Chain" },
      { id: 59144, name: "Linea Mainnet" },
      { id: 59141, name: "Linea Testnet" },
      { id: 421614, name: "Arbitrum Sepolia" },
      { id: 534352, name: "Scroll" },
      { id: 11155111, name: "Sepolia" }
    ],
    minCompilerVersion: "0.8.24"
  }],
  ['shanghai', {
    chainId: [
      { id: 1, name: "Ethereum Mainnet" },
      { id: 5, name: "Goerli" },
      { id: 10, name: "Optimism" },
      { id: 30, name: "Rootstock Mainnet" },
      { id: 56, name: "BNB Smart Chain Mainnet" },
      { id: 100, name: "Gnosis Chain" },
      { id: 137, name: "Polygon Mainnet" },
      { id: 250, name: "Fantom Opera" },
      { id: 300, name: "zkSync Era Mainnet" },
      { id: 302, name: "zkSync Era Testnet" },
      { id: 314, name: "Filecoin - Mainnet" },
      { id: 324, name: "zkSync Era Mainnet" },
      { id: 369, name: "PulseChain" },
      { id: 388, name: "HALO Mainnet" },
      { id: 1101, name: "Polygon zkEVM" },
      { id: 1088, name: "Metis Andromeda Mainnet" },
      { id: 1284, name: "Moonbeam" },
      { id: 2000, name: "Dogechain Mainnet" },
      { id: 42161, name: "Arbitrum One" },
      { id: 42170, name: "Arbitrum Nova" },
      { id: 59144, name: "Linea Mainnet" },
      { id: 59141, name: "Linea Testnet" },
      { id: 59902, name: "Metis Sepolia Testnet" },
      { id: 421614, name: "Arbitrum Sepolia" },
      { id: 11155111, name: "Sepolia" },
      { id: 11155420, name: "Optimism Sepolia Testnet" },
      { id: 1666600000, name: "Harmony Mainnet Shard 0" }
    ],
    minCompilerVersion: "0.8.20"
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
      { id: 250, name: "Fantom Opera" },
      { id: 300, name: "zkSync Era Mainnet" },
      { id: 302, name: "zkSync Era Testnet" },
      { id: 314, name: "Filecoin - Mainnet" },
      { id: 324, name: "zkSync Era Mainnet" },
      { id: 369, name: "PulseChain" },
      { id: 388, name: "HALO Mainnet" },
      { id: 1088, name: "Metis Andromeda Mainnet" },
      { id: 1101, name: "Polygon zkEVM" },
      { id: 1284, name: "Moonbeam" },
      { id: 2000, name: "Dogechain Mainnet" },
      { id: 42220, name: "Celo Mainnet" },
      { id: 42161, name: "Arbitrum One" },
      { id: 42170, name: "Arbitrum Nova" },
      { id: 44787, name: "Celo Alfajores Testnet" },
      { id: 59144, name: "Linea Mainnet" },
      { id: 59141, name: "Linea Testnet" },
      { id: 59902, name: "Metis Sepolia Testnet" },
      { id: 421614, name: "Arbitrum Sepolia" },
      { id: 11155111, name: "Sepolia" },
      { id: 11155420, name: "Optimism Sepolia Testnet" },
      { id: 1666600000, name: "Harmony Mainnet Shard 0" }
    ],
    minCompilerVersion: "0.8.18"
  }],
  ['london', {
    chainId: [
      { id: 1, name: "Ethereum Mainnet" },
      { id: 5, name: "Goerli" },
      { id: 10, name: "Optimism" },
      { id: 25, name: "Cronos Mainnet" },
      { id: 30, name: "Rootstock Mainnet" },
      { id: 56, name: "BNB Smart Chain Mainnet" },
      { id: 137, name: "Polygon Mainnet" },
      { id: 250, name: "Fantom Opera" },
      { id: 1280, name: "HALO Mainnet" },
      { id: 42161, name: "Arbitrum One" },
      { id: 42170, name: "Arbitrum Nova" },
      { id: 42220, name: "Celo Mainnet" },
      { id: 59144, name: "Linea Mainnet" },
      { id: 59141, name: "Linea Testnet" },
      { id: 11155111, name: "Sepolia" },
    ],
    minCompilerVersion: "0.8.7"
  }],
  ['berlin', {
    chainId: [
      { id: 1, name: "Ethereum Mainnet" },
      { id: 5, name: "Goerli" },
      { id: 10, name: "Optimism" },
      { id: 25, name: "Cronos Mainnet" },
      { id: 30, name: "Rootstock Mainnet" },
      { id: 56, name: "BNB Smart Chain Mainnet" },
      { id: 137, name: "Polygon Mainnet" },
      { id: 250, name: "Fantom Opera" },
      { id: 1280, name: "HALO Mainnet" },
      { id: 42161, name: "Arbitrum One" },
      { id: 42170, name: "Arbitrum Nova" },
      { id: 42220, name: "Celo Mainnet" },
      { id: 59144, name: "Linea Mainnet" },
      { id: 59141, name: "Linea Testnet" },
      { id: 11155111, name: "Sepolia" }
    ],
    minCompilerVersion: "0.8.5"
  }],
  ['istanbul', {
    chainId: [
      { id: 1, name: "Ethereum Mainnet" },
      { id: 5, name: "Goerli" },
      { id: 10, name: "Optimism" },
      { id: 25, name: "Cronos Mainnet" },
      { id: 30, name: "Rootstock Mainnet" },
      { id: 56, name: "BNB Smart Chain Mainnet" },
      { id: 137, name: "Polygon Mainnet" },
      { id: 250, name: "Fantom Opera" },
      { id: 1280, name: "HALO Mainnet" },
      { id: 42161, name: "Arbitrum One" },
      { id: 42170, name: "Arbitrum Nova" },
      { id: 42220, name: "Celo Mainnet" },
      { id: 59144, name: "Linea Mainnet" },
      { id: 59141, name: "Linea Testnet" },
      { id: 11155111, name: "Sepolia" }
    ],
    minCompilerVersion: "0.5.14"
  }],
  ['petersburg', {
    chainId: [
      { id: 1, name: "Ethereum Mainnet" },
      { id: 5, name: "Goerli" },
      { id: 11155111, name: "Sepolia" }
    ],
    minCompilerVersion: "0.5.5"
  }],
  ['constantinople', {
    chainId: [
      { id: 1, name: "Ethereum Mainnet" },
      { id: 5, name: "Goerli" },
      { id: 11155111, name: "Sepolia" }
    ],
    minCompilerVersion: "0.5.5"
  }],
  ['byzantium', {
    chainId: [
      { id: 1, name: "Ethereum Mainnet" }
    ],
    minCompilerVersion: "0.4.21"
  }],
  ['spuriousDragon', {
    chainId: [
      { id: 1, name: "Ethereum Mainnet" }
    ],
    minCompilerVersion: "0.4.9"
  }],
  ['tangerineWhistle', {
    chainId: [
      { id: 1, name: "Ethereum Mainnet" }
    ],
    minCompilerVersion: "0.4.0"
  }],
  ['homestead', {
    chainId: [
      { id: 1, name: "Ethereum Mainnet" },
      { id: 5, name: "Goerli" },
      { id: 11155111, name: "Sepolia" }
    ],
    minCompilerVersion: "0.1.2"
  }],
])

export function getCompatibleChains(fork: HardFork): ChainInfo[] {
  const forkData = evmMap.get(fork)
  return forkData ? forkData.chainId : []
}

export function isChainCompatible(fork: HardFork, chainId: number): boolean {
  const compatibleChains = getCompatibleChains(fork)
  return compatibleChains.some(chain => chain.id === chainId)
}

export function isChainCompatibleWithAnyFork(chainId: number, forks: HardFork[]): boolean {
  return forks.some(fork => isChainCompatible(fork, chainId))
}

export function getCompatibleChain(fork: HardFork, chainId: number): ChainInfo | undefined {
  const compatibleChains = getCompatibleChains(fork)
  console.log('fork in getCompatibleChain', fork)
  console.log('compatibleChains', compatibleChains)
  return compatibleChains.find(chain => chain.id === chainId)
}
