import {AbstractVerifier} from '../Verifiers/AbstractVerifier'

export interface VerifiedContract {
  name: string
  address: string
  chainId: string
  date: Date
  verifier: AbstractVerifier
  status: string
  receipt?: string
}

interface Currency {
  name: string
  symbol: string
  decimals: number
}
// types for https://chainid.network/chains.json (i.e. https://github.com/ethereum-lists/chains)
export interface Chain {
  name: string
  title?: string
  chainId: number
  shortName?: string
  network?: string
  networkId?: number
  nativeCurrency?: Currency
  rpc: Array<string>
  faucets?: string[]
  infoURL?: string
}
