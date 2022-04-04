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

export interface ContractAST {
    id: number,
    absolutePath: string,
    exportedSymbols: {
        [key: string]: number[]
    },
    license: string,
    nodeType: string,
    src: string,
    nodes: {
        id: number,
        literals: string[],
        nodeType: string,
        src: string,
        absolutePath?: string,
        file?: string,
        nameLocation?: string,
        scope?: number,
        srcUnit?: number,
        unitAlias?: string,
        symbolAliases?: any[],
        abstract?: boolean,
        baseContracts?: any[],
        contractDependencies?: any[],
        contractKind?: string,
        fullyImplemented?: boolean,
        linearizedBaseContracts?: number[],
        name?: string,
        usedErrors?: any[]
    }[]
}