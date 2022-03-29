export interface FuncABI {
    name: string,
    type: string,
    inputs: { name: string, type: string }[],
    stateMutability: string,
    payable: boolean,
    constant: any
}

export interface ContractData {
    name: string,
    contract: any,
    compiler: any,
    abi: FuncABI[],
    bytecodeObject: any,
    bytecodeLinkReferences: any,
    object: any,
    deployedBytecode: any,
    getConstructorInterface: () => any,
    getConstructorInputs: () => any,
    isOverSizeLimit: () => boolean,
    metadata: any
}