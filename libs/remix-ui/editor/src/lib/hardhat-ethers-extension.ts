export const hardhatEthersExtension = 
`
interface Libraries {
    [libraryName: string]: string;
}

interface FactoryOptions {
    signer?: Signer;
    libraries?: Libraries;
}

export declare function getContractFactory(name: string, signer?: Signer): Promise<ContractFactory>;

export declare function getContractFactory(name: string, factoryOptions: FactoryOptions): Promise<ContractFactory>;

export declare function getContractFactory(abi: any[], bytecode: utils.BytesLike, signer?: Signer): Promise<ContractFactory>;

export declare function getContractAt(name: string, address: string, signer?: Signer): Promise<Contract>;

export declare function getContractAt(abi: any[], address: string, signer?: Signer): Promise<Contract>;

export declare function getSigners() => Promise<Signer[]>;

export declare function getSigner(address: string) => Promise<Signer>;

export declare function getImpersonatedSigner(address: string) => Promise<Signer>;

export declare function getContractFactoryFromArtifact(artifact: Artifact, signer?: Signer): Promise<ContractFactory>;

export declare function getContractFactoryFromArtifact(artifact: Artifact, factoryOptions: FactoryOptions): Promise<ContractFactory>;

export declare function getContractAtFromArtifact(artifact: Artifact, address: string, signer?: Signer): Promise<Contract>;
`

