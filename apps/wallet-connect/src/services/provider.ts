import { providers } from 'ethers'

import type { Chain } from 'wagmi/chains'
import type { ChainProviderFn } from 'wagmi/'

interface FallbackProviderConfig {
  // The Provider
  provider: any;

  // The priority to favour this Provider; lower values are used first (higher priority)
  priority?: number;

  // Timeout before also triggering the next provider; this does not stop
  // this provider and if its result comes back before a quorum is reached
  // it will be incorporated into the vote
  // - lower values will cause more network traffic but may result in a
  //   faster result.
  stallTimeout?: number;

  // How much this provider contributes to the quorum; sometimes a specific
  // provider may be more reliable or trustworthy than others, but usually
  // this should be left as the default
  weight?: number;
}

export function customProvider<TChain extends Chain = Chain>({
  priority,
  stallTimeout,
  weight,
}: FallbackProviderConfig): ChainProviderFn<
  TChain,
  providers.Web3Provider,
  providers.WebSocketProvider
> {
  return function (chain) {
    return {
      chain: {
        ...chain,
      } as TChain,
      provider: () => {
        const provider = new providers.Web3Provider(
          window.ethereum,
          {
            chainId: chain.id,
            name: chain.network,
            ensAddress: chain.contracts?.ensRegistry?.address,
          }
        )
        return Object.assign(provider, { priority, stallTimeout, weight })
      }
    }
  }
}