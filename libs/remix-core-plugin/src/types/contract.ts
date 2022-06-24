export interface FuncABI {
    name: string,
    type: string,
    inputs: { name: string, type: string }[],
    stateMutability: string,
    payable?: boolean,
    constant?: any
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

export interface ContractABI {
    [key: string]: {
        abi: ({
            inputs: never[];
            stateMutability: string;
            type: string;
            anonymous?: undefined;
            name?: undefined;
            outputs?: undefined;
        } | {
            anonymous: boolean;
            inputs: {
                indexed: boolean;
                internalType: string;
                name: string;
                type: string;
            }[];
            name: string;
            type: string;
            stateMutability?: undefined;
            outputs?: undefined;
        } | {
            inputs: {
                internalType: string;
                name: string;
                type: string;
            }[];
            name: string;
            outputs: {
                internalType: string;
                name: string;
                type: string;
            }[];
            stateMutability: string;
            type: string;
            anonymous?: undefined;
        })[];
        devdoc: {
            kind: string;
            methods: {
                [key: string]: {
                    [key: string]: string
                }
            };
            version: number;
        };
        evm: any
        metadata: string;
        storageLayout: {
            storage: {
                astId: number;
                contract: string;
                label: string;
                offset: number;
                slot: string;
                type: string;
            }[];
            types: {
                [key: string]: {
                    base: string;
                    encoding: string;
                    label: string;
                    numberOfBytes: string;
                    members?: {
                        astId: number;
                        contract: string;
                        label: string;
                        offset: number;
                        slot: string;
                        type: string;
                    }[];
                };
            };
        };
        userdoc: {
            kind: string;
            methods: any;
            version: number;
        };
    };
}

export type DeployOption = {
    initializeInputs: string,
    inputs: {
      inputs: {
        internalType?: string,
        name: string,
        type: string
      }[],
      name: "initialize",
      outputs?: any[],
      stateMutability: string,
      type: string,
      payable?: boolean,
      constant?: any
    }
  }
