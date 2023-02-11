import { StatusEvents } from '@remixproject/plugin-utils';
import { NetworkProvider, Network, CustomNetwork } from './type';

/** @deprecated: current version in Remix IDE. To improve to match standard JSON RPC methods */
export interface INetwork {
  events: {
    providerChanged: (provider: NetworkProvider) => void
  } & StatusEvents
  methods: {
    getNetworkProvider(): NetworkProvider
    detectNetwork(): Network | Partial<CustomNetwork>
    getEndpoint(): string
    addNetwork(network: CustomNetwork): void
    removeNetwork(name: string): void
  }
}