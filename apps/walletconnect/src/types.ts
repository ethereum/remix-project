export interface RequestArguments {
	readonly method: string
	readonly params?: readonly unknown[] | object
  readonly id?: string
}

export interface EIP1193Provider {
	request: <T>(args: RequestArguments) => Promise<T>
  sendAsync: <T>(args: RequestArguments, callback:(error, response)=>void) => Promise<T>
	on: (event: string, listener: (event: unknown) => void) => void
	removeListener: (event: string, listener: (event: unknown) => void) => void
}