export = NodeProvider;
declare class NodeProvider {
    constructor(executionContext: any, config: any);
    executionContext: any;
    config: any;
    getAccounts(cb: any): any;
    newAccount(passwordPromptCb: any, cb: any): any;
    resetEnvironment(): Promise<void>;
    getBalanceInEther(address: any): Promise<string>;
    getGasPrice(cb: any): void;
    signMessage(message: any, account: any, passphrase: any, cb: any): void;
    getProvider(): any;
}
