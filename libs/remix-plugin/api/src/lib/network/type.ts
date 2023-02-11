/** @deprecated: current version in Remix IDE. To improve to match standard JSON RPC methods */
export interface CustomNetwork {
  id?: string
  name: string
  url: string
}

/** @deprecated: current version in Remix IDE. To improve to match standard JSON RPC methods */
export type NetworkProvider = 'vm' | 'injected' | 'web3'

export type Network =
  | { id: '1', name: 'Main' }
  | { id: '2', name: 'Morden (deprecated)' }
  | { id: '3', name: 'Ropsten' }
  | { id: '4', name: 'Rinkeby' }
  | { id: '5', name: 'Goerli' }
  | { id: '42', name: 'Kovan' }