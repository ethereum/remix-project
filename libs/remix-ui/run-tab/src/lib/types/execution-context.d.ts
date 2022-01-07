import Web3 from 'web3'

export class ExecutionContext {
    event: any;
    executionContext: any;
    lastBlock: any;
    blockGasLimitDefault: number;
    blockGasLimit: number;
    currentFork: string;
    mainNetGenesisHash: string;
    customNetWorks: {};
    blocks: {};
    latestBlockNumber: number;
    txs: {};
    customWeb3: {};
    init(config: any): void;
    askPermission(): void;
    getProvider(): any;
    getCurrentFork(): string;
    isVM(): boolean;
    setWeb3(context: any, web3: any): void;
    web3(): any;
    detectNetwork(callback: any): void;
    removeProvider(name: any): void;
    addProvider(network: any): void;
    internalWeb3(): any;
    blankWeb3(): Web3;
    setContext(context: any, endPointUrl: any, confirmCb: any, infoCb: any): void;
    executionContextChange(value: any, endPointUrl: any, confirmCb: any, infoCb: any, cb: any): Promise<any>;
    currentblockGasLimit(): number;
    stopListenOnLastBlock(): void;
    // eslint-disable-next-line no-undef
    listenOnLastBlockId: NodeJS.Timer;
    _updateChainContext(): Promise<void>;
    listenOnLastBlock(): void;
    setProviderFromEndpoint(endpoint: any, value: any, cb: any): void;
    txDetailsLink(network: any, hash: any): any;
}
