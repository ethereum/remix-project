export = VMProvider;
declare class VMProvider {
    constructor(executionContext: any);
    executionContext: any;
    getAccounts(cb: any): void;
    resetEnvironment(): Promise<void>;
    accounts: any;
    RemixSimulatorProvider: any;
    web3: any;
    createVMAccount(newAccount: any): string;
    newAccount(_passwordPromptCb: any, cb: any): void;
    getBalanceInEther(address: any): Promise<string>;
    getGasPrice(cb: any): void;
    signMessage(message: any, account: any, _passphrase: any, cb: any): void;
    getProvider(): string;
}
