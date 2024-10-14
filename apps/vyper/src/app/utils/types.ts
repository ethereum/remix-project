import { CompilationResult, ABIDescription } from '@remixproject/plugin-api'

export type VyperCompilationError = {
  status: 'failed'
  column?: number
  line?: number
  message: string
  error_type: string
}

export type VyperCompilationOutput = VyperCompilationResultWrapper | VyperCompilationError

export type VyperCompilationErrorsWrapper = {
  status: 'failed'
  errors: VyperCompilationError[]
}

export type VyperCompilationResultWrapper = {
  status: 'success'
  contractName: string
  compileResult: VyperCompilationResult
}

export type VyperCompilationResult = {
  contractName: string
  abi: any,
  bytecode: any,
  runtimeBytecode: any,
  ir: string,
  methodIdentifiers: any,
  version?: string,
  evmVersion?: string
  optimized?: boolean
}

export type VyperCompilationResultType = {
  buildDependencies: any
  compilers: [
    contractTypes: [],
    name: string,
    settings: {
      optimize: boolean
      outputSelection: {
        ['fileName']: {
          ['contractName']: string[]
        }
      }
      version: string
    }
  ]
  contractTypes: {
    ['fileName']: {
      abi: any[]
      ast: {
        name: string,
        children: any[]
        classification: number
        col_offset: number
        end_col_offset: number
        end_lineno: number
        lineno: number
        src: {
          length: number
          jump_code: string
        }
      }
      contractName: string
      deploymentBytecode: {
        bytecode: string
      }
      dev_messages: any
      devdoc: {
        methods: any
      }
      pcmap: any
      runtimeBytecode: {
        bytecode: string
      }
      sourceId: string
      sourcemap: string
      userdoc: {
        methods: any
      }
    }
  }
  deployments: any
  manifest: string
  meta: any
  sources: {
    ['fileName'] : {
      checksum: any
      content: string
      imports: string[]
      references: []
      urls: []
    }
  }

}

export interface PackageManifest {
  title: string;
  description: string;
  type: TypeEnum;
  required: string[];
  version: string;
  properties: PackageManifestProperties;
  definitions: Definitions;
}

export interface Definitions {
  packageMeta: ByteString;
  contractType: ByteString;
  contractInstance: ContractInstance;
  byteString: ByteString;
  bytecodeObject: BytecodeObject;
  linkReference: LinkReference;
  linkValue: LinkValue;
  identifier: ByteString;
  contractInstanceName: ByteString;
  deployment: Deployment;
  packageContractInstanceName: ByteString;
  compilerInformation: CompilerInformation;
  address: Address;
  transactionHash: Address;
  blockHash: Address;
  contentURI: ByteString;
}

export interface Address {
  title: string;
  description: string;
  allOf: AllOf[];
}

export interface AllOf {
  ref?: string;
  minLength?: number;
  maxLength?: number;
}

export interface ByteStringProperties {
  contractName?: ByteString;
  deploymentBytecode?: Meta;
  runtimeBytecode?: Meta;
  abi?: ByteString;
  natspec?: ByteString;
  compiler?: Meta;
  authors?: ByteString;
  license?: ByteString;
  description?: ByteString;
  keywords?: ByteString;
  links?: Links;
}

export interface ByteString {
  title: string;
  description?: string;
  type: TypeEnum;
  pattern?: string;
  format?: string;
  items?: Items;
  properties?: ByteStringProperties;
  patternProperties?: { [key: string]: Meta };
}

export interface Meta {
  ref: string;
}

export interface Links {
  title: string;
  descriptions: string;
  type: TypeEnum;
  additionalProperties: AdditionalProperties;
}

export interface AdditionalProperties {
  type: TypeEnum;
  format: string;
}

export type TypeEnum = "string" | "array" | "object";

export interface Items {
  ref?: string;
  type?: TypeEnum;
}

export interface BytecodeObject {
  title: string
  type: TypeEnum
  offsets: number[]
  anyOf: BytecodeObjectAnyOf[]
  properties: BytecodeObjectProperties
  bytecode: string
  linkReferences?: { offset?: any; length?: number; name?: string}[]
}

export interface BytecodeObjectAnyOf {
  required: string[];
}

export interface BytecodeObjectProperties {
  bytecode: Meta;
  linkReferences: Link;
  linkDependencies: Link;
}

export interface Link {
  type: TypeEnum;
  items: Meta;
}

export interface CompilerInformation {
  title: string;
  description: string;
  type: TypeEnum;
  required: string[];
  properties: CompilerInformationProperties;
}

export interface CompilerInformationProperties {
  name: Name;
  version: Name;
  settings: Name;
}

export interface Name {
  description: string;
  type: TypeEnum;
}

export interface ContractInstance {
  title: string;
  description: string;
  type: TypeEnum;
  required: string[];
  properties: ContractInstanceProperties;
}

export interface ContractInstanceProperties {
  contractType: ByteString;
  address: Meta;
  transaction: Meta;
  block: Meta;
  runtimeBytecode: Meta;
  compiler: Meta;
  linkDependencies: ByteString;
}

export interface Deployment {
  title: string;
  type: TypeEnum;
  patternProperties: DeploymentPatternProperties;
}

export interface DeploymentPatternProperties {
  aZAZAZAZ09_0254$: Meta;
}

export interface LinkReference {
  title: string;
  description: string;
  type: TypeEnum;
  required: string[];
  properties: LinkReferenceProperties;
}

export interface LinkReferenceProperties {
  offsets: Offsets;
  length: Length;
  name: Meta;
}

export interface Length {
  type: string;
  minimum: number;
}

export interface Offsets {
  type: TypeEnum;
  items: Length;
}

export interface LinkValue {
  title: string;
  description: string;
  type: TypeEnum;
  required: string[];
  properties: LinkValueProperties;
  oneOf: OneOf[];
}

export interface OneOf {
  properties: OneOfProperties;
}

export interface OneOfProperties {
  type: TypeClass;
  value: PurpleValue;
}

export interface TypeClass {
  enum: string[];
}

export interface PurpleValue {
  ref?: string;
  anyOf?: Meta[];
}

export interface LinkValueProperties {
  offsets: Offsets;
  type: Name;
  value: FluffyValue;
}

export interface FluffyValue {
  description: string;
}

export interface PackageManifestProperties {
  manifestVersion: ManifestVersion;
  packageName: ByteString;
  meta: Meta;
  version: Version;
  sources: Sources;
  contractTypes: ByteString;
  deployments: ByteString;
  buildDependencies: BuildDependencies;
}

export interface BuildDependencies {
  title: string;
  type: TypeEnum;
  patternProperties: BuildDependenciesPatternProperties;
}

export interface BuildDependenciesPatternProperties {
  aZAZ090254$: Meta;
}

export interface ManifestVersion {
  type: TypeEnum;
  title: string;
  description: string;
  default: string;
  enum: string[];
}

export interface Sources {
  title: string;
  type: TypeEnum;
  patternProperties: SourcesPatternProperties;
}

export interface SourcesPatternProperties {
  empty: Empty;
}

export interface Empty {
  anyOf: AnyOf[];
}

export interface AnyOf {
  title?: string;
  type?: TypeEnum;
  ref?: string;
}

export interface Version {
  title: string;
  type: TypeEnum;
}

export type CompileFormat = {
  contractTypes: {
    abi?: ABI[]
    ast?: AST
    contractName?: string
    depolymentBytecode?: BytecodeObject
    devMessages?: { [key: string]: string }
    devdoc?: Devdoc
    methodIdentifiers?: { [key: string]: string }
    pcmap?: any
    runtimeBytecode?: BytecodeObject
    sourceId?: string
    sourcemap?: string
    userdoc?: { [key: string]: string }
  }
  manifest?: string
  sources?: {
    [fileName: string]: {
      content: string
      urls?: string[]
      references?: string[]
      imports?: string[]
      checksum?: { [key: string]: string }
    }
  }
}

export type Devdoc = {
  methods: any
}

export type ETHPM3Format = {
  manifest: 'ethpm/3'
  name: string
  version: string
  meta: Record<string, any>
  buildDependencies: Record<string, any>
  sources: {
    [fileName: string]: {
      content: string
      checksum?: {
        keccak256: string
        hash: string
      }
      type?: any
      license?: string
    }
  }
  compilers: CompilerInformationObject[]
  contractTypes: {
    contractName: string
    sourceId?: string
    depolymentBytecode: {
      bytecode: string
      linkReferences: {
        offset: any
        length: number
        name?: string
      }
      linkDependencies?: { offsets: number[]}
    }
    runtimeBytecode: {
      bytecode: string
      linkReferences: {
        offset: any
        length: number
        name?: string
      }
      linkDependencies?: LinkValueObject
    }
    abi: ABI[]
    ast: AST
    userDoc?: {
      methods: any
      notice: string
    }
    devDoc?: {
      methods: any,
      author: string
      details: string
      title: string
      license: string
  }
}
deployments: {
  [contractName: string]: ContractInstanceObject
}

}

export type CompilerInformationObject = {
  name: string
  version: string
  settings?: {
    optimizer: {
      enabled: boolean
      runs: number
    }
    outputSelection: {
      [fileName: string]: {
        [contractName: string]: string[]
      }
    }
  },
  contractTypes?: string[]
}

export type LinkValueObject = {
  offsets: number[]
  type: string
  value: string
}

export type PackageMetaDataObject = {
  authors?: string[]
  description?: string
  keywords?: string[]
  license?: string
  links?: {
    [key: string]: string
  }
}

export type ContractInstanceObject = {
  contractType: string
  address: string
  transaction?: string
  block?: string
  runtimeBytecode?: BytecodeObject
  compiler?: string
  linkDependencies?: LinkValueObject
}

export type ASTSrc = {
  jumpCode: string;
  length: number;
}

export type Child = {
  astType: string;
  children: Child[];
  classification: number;
  colOffset: number;
  endColOffset: number;
  endLineno: number;
  lineno: number;
  name?: string;
  src: ChildSrc;
  docStr?: Child;
}

export type ChildSrc = {
  jumpCode: string;
  length: number;
  start: number;
}

export type AST = {
  astType: string;
  children: Child[];
  classification: number;
  colOffset: number;
  endColOffset: number;
  endLineno: number;
  lineno: number;
  name: string;
  src: ASTSrc;
}

export type ABI = {
  anonymous?: boolean;
  inputs: any[];
  name?: string;
  type: any
  stateMutability?: any;
  outputs?: any[];
}
