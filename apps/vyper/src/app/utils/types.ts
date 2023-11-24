import {CompilationResult, ABIDescription} from '@remixproject/plugin-api'

export interface VyperCompilationResult {
  status: 'success'
  bytecode: string
  bytecode_runtime: string
  abi: ABIDescription[]
  ir: string
  method_identifiers: {
    [method: string]: string
  }
}

export interface VyperCompilationError {
  status: 'failed'
  column?: number
  line?: number
  message: string
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
  title:       string;
  description: string;
  type:        TypeEnum;
  required:    string[];
  version:     string;
  properties:  PackageManifestProperties;
  definitions: Definitions;
}

export interface Definitions {
  packageMeta:                 ByteString;
  contractType:                ByteString;
  contractInstance:            ContractInstance;
  byteString:                  ByteString;
  bytecodeObject:              BytecodeObject;
  linkReference:               LinkReference;
  linkValue:                   LinkValue;
  identifier:                  ByteString;
  contractInstanceName:        ByteString;
  deployment:                  Deployment;
  packageContractInstanceName: ByteString;
  compilerInformation:         CompilerInformation;
  address:                     Address;
  transactionHash:             Address;
  blockHash:                   Address;
  contentURI:                  ByteString;
}

export interface Address {
  title:       string;
  description: string;
  allOf:       AllOf[];
}

export interface AllOf {
  ref?:       string;
  minLength?: number;
  maxLength?: number;
}

export interface ByteStringProperties {
  contractName?:       ByteString;
  deploymentBytecode?: Meta;
  runtimeBytecode?:    Meta;
  abi?:                ByteString;
  natspec?:            ByteString;
  compiler?:           Meta;
  authors?:            ByteString;
  license?:            ByteString;
  description?:        ByteString;
  keywords?:           ByteString;
  links?:              Links;
}

export interface ByteString {
  title:              string;
  description?:       string;
  type:               TypeEnum;
  pattern?:           string;
  format?:            string;
  items?:             Items;
  properties?:        ByteStringProperties;
  patternProperties?: { [key: string]: Meta };
}

export interface Meta {
  ref: string;
}

export interface Links {
  title:                string;
  descriptions:         string;
  type:                 TypeEnum;
  additionalProperties: AdditionalProperties;
}

export interface AdditionalProperties {
  type:   TypeEnum;
  format: string;
}

export type TypeEnum = "string" | "array" | "object";

export interface Items {
  ref?:  string;
  type?: TypeEnum;
}

export interface BytecodeObject {
  title:      string;
  type:       TypeEnum;
  anyOf:      BytecodeObjectAnyOf[];
  properties: BytecodeObjectProperties;
}

export interface BytecodeObjectAnyOf {
  required: string[];
}

export interface BytecodeObjectProperties {
  bytecode:         Meta;
  linkReferences:   Link;
  linkDependencies: Link;
}

export interface Link {
  type:  TypeEnum;
  items: Meta;
}

export interface CompilerInformation {
  title:       string;
  description: string;
  type:        TypeEnum;
  required:    string[];
  properties:  CompilerInformationProperties;
}

export interface CompilerInformationProperties {
  name:     Name;
  version:  Name;
  settings: Name;
}

export interface Name {
  description: string;
  type:        TypeEnum;
}

export interface ContractInstance {
  title:       string;
  description: string;
  type:        TypeEnum;
  required:    string[];
  properties:  ContractInstanceProperties;
}

export interface ContractInstanceProperties {
  contractType:     ByteString;
  address:          Meta;
  transaction:      Meta;
  block:            Meta;
  runtimeBytecode:  Meta;
  compiler:         Meta;
  linkDependencies: ByteString;
}

export interface Deployment {
  title:             string;
  type:              TypeEnum;
  patternProperties: DeploymentPatternProperties;
}

export interface DeploymentPatternProperties {
  aZAZAZAZ09_0254$: Meta;
}

export interface LinkReference {
  title:       string;
  description: string;
  type:        TypeEnum;
  required:    string[];
  properties:  LinkReferenceProperties;
}

export interface LinkReferenceProperties {
  offsets: Offsets;
  length:  Length;
  name:    Meta;
}

export interface Length {
  type:    string;
  minimum: number;
}

export interface Offsets {
  type:  TypeEnum;
  items: Length;
}

export interface LinkValue {
  title:       string;
  description: string;
  type:        TypeEnum;
  required:    string[];
  properties:  LinkValueProperties;
  oneOf:       OneOf[];
}

export interface OneOf {
  properties: OneOfProperties;
}

export interface OneOfProperties {
  type:  TypeClass;
  value: PurpleValue;
}

export interface TypeClass {
  enum: string[];
}

export interface PurpleValue {
  ref?:   string;
  anyOf?: Meta[];
}

export interface LinkValueProperties {
  offsets: Offsets;
  type:    Name;
  value:   FluffyValue;
}

export interface FluffyValue {
  description: string;
}

export interface PackageManifestProperties {
  manifestVersion:   ManifestVersion;
  packageName:       ByteString;
  meta:              Meta;
  version:           Version;
  sources:           Sources;
  contractTypes:     ByteString;
  deployments:       ByteString;
  buildDependencies: BuildDependencies;
}

export interface BuildDependencies {
  title:             string;
  type:              TypeEnum;
  patternProperties: BuildDependenciesPatternProperties;
}

export interface BuildDependenciesPatternProperties {
  aZAZ090254$: Meta;
}

export interface ManifestVersion {
  type:        TypeEnum;
  title:       string;
  description: string;
  default:     string;
  enum:        string[];
}

export interface Sources {
  title:             string;
  type:              TypeEnum;
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
  type?:  TypeEnum;
  ref?:   string;
}

export interface Version {
  title: string;
  type:  TypeEnum;
}
