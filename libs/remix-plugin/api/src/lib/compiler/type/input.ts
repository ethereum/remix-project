export interface CompilationInput {
  /** Source code language */
  language: 'Solidity' | 'Vyper' | 'lll' | 'assembly' | 'yul'
  sources: SourcesInput
  settings?: CompilerSettings
  outputSelection?: CompilerOutputSelection
}

export interface CondensedCompilationInput {
  language: 'Solidity' | 'Vyper' | 'lll' | 'assembly' | 'yul'
  optimize: boolean
  /** e.g: 0.6.8+commit.0bbfe453 */
  version: string
  evmVersion?: 'istanbul' | 'petersburg' | 'constantinople' | 'byzantium' | 'spuriousDragon' | 'tangerineWhistle' | 'homestead'
}

/////////////
// SOURCES //
/////////////

export interface SourceInputUrls {
  /** Hash of the source file. It is used to verify the retrieved content imported via URLs */
  keccak256?: string
  /**
   * URL(s) to the source file.
   * URL(s) should be imported in this order and the result checked against the
   * keccak256 hash (if available). If the hash doesn't match or none of the
   * URL(s) result in success, an error should be raised.
   */
  urls: string[]
}
export interface SourceInputContent {
  /** Hash of the source file. */
  keccak256?: string
  /** Literal contents of the source file */
  content: string
}

export interface SourcesInput {
  [contractName: string]: SourceInputContent | SourceInputUrls
}

//////////////
// SETTINGS //
//////////////
export interface CompilerSettings {
  /** Sorted list of remappings */
  remappings?: string[]
  /** Optimizer settings */
  optimizer?: Partial<CompilerOptimizer>
  /** Version of the EVM to compile for. Affects type checking and code generation */
  evmVersion:
    | 'homestead'
    | 'tangerineWhistle'
    | 'spuriousDragon'
    | 'byzantium'
    | 'constantinople'
  /** Metadata settings */
  metadata?: CompilerMetadata
  /** Addresses of the libraries. If not all libraries are given here, it can result in unlinked objects whose output data is different. */
  libraries: CompilerLibraries
}

export interface CompilerOptimizer {
  /** disabled by default */
  enable: boolean
  /**
   * Optimize for how many times you intend to run the code.
   * Lower values will optimize more for initial deployment cost, higher values will optimize more for high-frequency usage.
   */
  runs: number
}

export interface CompilerMetadata {
  /** Use only literal content and not URLs (false by default) */
  useLiteralContent: boolean
}

/**
 * The top level key is the the name of the source file where the library is used.
 * If remappings are used, this source file should match the global path after remappings were applied.
 * If this key is an empty string, that refers to a global level.
 */
export interface CompilerLibraries {
  [contractName: string]: {
    [libName: string]: string
  }
}

//////////////////////
// OUTPUT SELECTION //
//////////////////////
export type OutputType =
  | 'abi'
  | 'ast'
  | 'devdoc'
  | 'userdoc'
  | 'metadata'
  | 'ir'
  | 'evm.assembly'
  | 'evm.legacyAssembly'
  | 'evm.bytecode.object'
  | 'evm.bytecode.opcodes'
  | 'evm.bytecode.sourceMap'
  | 'evm.bytecode.linkReferences'
  | 'evm.deployedBytecode'
  | 'evm.methodIdentifiers'
  | 'evm.gasEstimates'
  | 'ewasm.wast'
  | 'ewasm.wasm'
/**
 * The following can be used to select desired outputs.
 * If this field is omitted, then the compiler loads and does type checking, but will not generate any outputs apart from errors.
 * The first level key is the file name and the second is the contract name, where empty contract name refers to the file itself,
 * while the star refers to all of the contracts.
 * Note that using a using `evm`, `evm.bytecode`, `ewasm`, etc. will select every
 * target part of that output. Additionally, `*` can be used as a wildcard to request everything.
 */
export interface CompilerOutputSelection {
  [file: string]: {
    [contract: string]: OutputType[]
  }
}