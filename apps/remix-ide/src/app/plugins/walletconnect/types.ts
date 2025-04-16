export interface RequestArguments {
	readonly method: string
	readonly params?: readonly unknown[] | object
  readonly id?: number
}

export type Chain = {
  chainId: number
  name: string
  currency: string
  explorerUrl: string
  rpcUrl: string
}