export interface AnalyzerModule {
    name: string,
    description: string,
    category: ModuleCategory
    algorithm: ModuleAlgorithm
    visit: Function
    report: Function
}

export interface ModuleAlgorithm {
    hasFalsePositives: boolean,
    hasFalseNegatives: boolean,
    id: string
}

export interface ModuleCategory {
    displayName: string,
    id: string
}

export interface ReportObj {
    warning: string,
    location?: string | null,
    more?: string
}

export interface CompilationResult {
    error?:  CompilationError,
    /** not present if no errors/warnings were encountered */
    errors?: CompilationError[]
    /** This contains the file-level outputs. In can be limited/filtered by the outputSelection settings */
    sources?: {
      [contractName: string]: CompilationSource
    }
    /** This contains the contract-level outputs. It can be limited/filtered by the outputSelection settings */
    contracts?: {
      /** If the language used has no contract names, this field should equal to an empty string. */
      [fileName: string]: {
        [contract: string]: CompiledContract
      }
    }
  }

/////////////////////////////////////////////
///////////// Specfic AST Nodes /////////////
/////////////////////////////////////////////

export interface SourceUnitAstNode {
  id: number
  nodeType: 'SourceUnit'
  src: string
  absolutePath: string
  exportedSymbols: Object
  nodes: Array<AstNode>
}

export interface PragmaDirectiveAstNode {
  id: number
  nodeType: 'PragmaDirective'
  src: string
  literals?: Array<string>
}

export interface ImportDirectiveAstNode {
  id: number
  nodeType: 'ImportDirective'
  src: string
  absolutePath: string
  file: string
  scope: number
  sourceUnit: number
  symbolAliases: Array<string>
}

export interface ContractDefinitionAstNode {
  id: number
  nodeType: 'ContractDefinition'
  src: string
  name: string
  documentation: Object
  contractKind: 'interface' | 'contract' | 'library'
  abstract: string
  fullyImplemented: Object
  linearizedBaseContracts: Object
  baseContracts: Object
  contractDependencies: Object
  nodes: Array<AstNode>
  scope: number
}

export interface InheritanceSpecifierAstNode {
  id: number
  nodeType: 'InheritanceSpecifier'
  src: string
  baseName: string
  arguments: Object
}

export interface UsingForDirectiveAstNode {
  id: number
  nodeType: 'UsingForDirective'
  src: string
  libraryName: Object
  typeName: Object
}

export interface StructDefinitionAstNode {
  id: number
  nodeType: 'StructDefinition'
  src: string
  name: string
  visibility: string
  canonicalName: string
  members: Object
  scope: number
}

export interface EnumDefinitionAstNode {
  id: number
  nodeType: 'EnumDefinition'
  src: string
  name: string
  canonicalName: string
  members: Object
}

export interface EnumValueAstNode {
  id: number
  nodeType: 'EnumValue'
  src: string
  name: string
}

export interface ParameterListAstNode {
  id: number
  nodeType: 'ParameterList'
  src: string
  parameters: Object
}

export interface OverrideSpecifierAstNode {
  id: number
  nodeType: 'OverrideSpecifier'
  src: string
  overrides: Object
}

export interface FunctionDefinitionAstNode {
  id: number
  nodeType: 'FunctionDefinition'
  src: string
  name: string
  documentation: Object
  kind: string
  stateMutability: string
  visibility: string
  virtual: boolean
  overrides: Object
  parameters: Object
  returnParameters: Object
  modifiers: Object
  body: Object
  implemented: boolean
  scope: number
  functionSelector?: string
  baseFunctions?: Object
}

export interface VariableDeclarationAstNode {
  id: number
  nodeType: 'VariableDeclaration'
  src: string
  name: string
  typeName: Object
  constant: boolean
  stateVariable: boolean
  storageLocation: 'storage' | 'memory' | 'calldata' | 'default'
  overrides: Object
  visibility: string
  value: Object
  scope: number
  typeDescriptions: Object
  functionSelector?: string
  indexed?: boolean
  baseFunctions?: Object
}

export interface ModifierDefinitionAstNode {
  id: number
  nodeType: 'ModifierDefinition'
  src: string
  name: string
  documentation: Object
  visibility: string
  parameters: Object
  virtual: boolean
  overrides: Object
  body: Object
  baseModifiers?: Object
}

export interface ModifierInvocationAstNode {
  id: number
  nodeType: 'ModifierInvocation'
  src: string
  modifierName: Object
  arguments: Object
}

export interface EventDefinitionAstNode {
  id: number
  nodeType: 'EventDefinition'
  src: string
  name: string
  documentation: Object
  parameters: Object
  anonymous: boolean
}

export interface ElementaryTypeNameAstNode {
  id: number
  nodeType: 'ElementaryTypeName'
  src: string
  name: string
  typeDescriptions: Object
  stateMutability?: string
}

export interface UserDefinedTypeNameAstNode {
  id: number
  nodeType: 'UserDefinedTypeName'
  src: string
  name: string
  referencedDeclaration: number
  contractScope: number
  typeDescriptions: Object
}

export interface FunctionTypeNameAstNode {
  id: number
  nodeType: 'FunctionTypeName'
  src: string
  name: string
  visibility: string
  stateMutability: string
  parameterTypes: Object
  returnParameterTypes: Object
  typeDescriptions: Object
}

export interface MappingAstNode {
  id: number
  nodeType: 'Mapping'
  src: string
  keyType: Object
  valueType: Object
  typeDescriptions: Object
}

export interface ArrayTypeNameAstNode {
  id: number
  nodeType: 'ArrayTypeName'
  src: string
  baseType: Object
  length: Object
  typeDescriptions: Object
}

export interface InlineAssemblyAstNode {
  id: number
  nodeType: 'InlineAssembly'
  src: string
  AST: Object
  externalReferences: Object
  evmVersion: string
}

export interface BlockAstNode {
  id: number
  nodeType: 'Block'
  src: string
  statements: Object
}

export interface PlaceholderStatementAstNode {
  id: number
  nodeType: 'PlaceholderStatement'
  src: string
}

export interface IfStatementAstNode {
  id: number
  nodeType: 'IfStatement'
  src: string
  condition: Object
  trueBody: Object
  falseBody: Object
}

export interface TryCatchClauseAstNode {
  id: number
  nodeType: 'TryCatchClause'
  src: string
  errorName: string
  parameters: Object
  block: Object
}

export interface TryStatementAstNode {
  id: number
  nodeType: 'TryStatement'
  src: string
  externalCall: Object
  clauses: Object
}

export interface WhileStatementAstNode {
  id: number
  nodeType: 'WhileStatement' | 'DoWhileStatement'
  src: string
  condition: Object
  body: Object
}

export interface ForStatementAstNode {
  id: number
  nodeType: 'ForStatement'
  src: string
  initializationExpression: Object
  condition: Object
  loopExpression: Object
  body: Object
}

export interface ContinueAstNode {
  id: number
  nodeType: 'Continue'
  src: string
}

export interface BreakAstNode {
  id: number
  nodeType: 'Break'
  src: string
}

export interface ReturnAstNode {
  id: number
  nodeType: 'Return'
  src: string
  expression: Object
  functionReturnParameters: Object
}

export interface ThrowAstNode {
  id: number
  nodeType: 'Throw'
  src: string
}

export interface EmitStatementAstNode {
  id: number
  nodeType: 'EmitStatement'
  src: string
  eventCall: Object
}

export interface VariableDeclarationStatementAstNode {
  id: number
  nodeType: 'VariableDeclarationStatement'
  src: string
  assignments: Object
  declarations: Object
  initialValue: Object
}

export interface ExpressionStatementAstNode {
  id: number
  nodeType: 'ExpressionStatement'
  src: string
  expression: Object
}

interface ExpressionAttributes {
  typeDescriptions: Object
  isConstant: boolean
  isPure: boolean
  isLValue: boolean
  lValueRequested: boolean
  argumentTypes: Object
}

export interface ConditionalAstNode extends ExpressionAttributes {
  id: number
  nodeType: 'Conditional'
  src: string
  condition: Object
  trueExpression: Object
  falseExpression: Object
}

export interface AssignmentAstNode extends ExpressionAttributes {
  id: number
  nodeType: 'Assignment'
  src: string
  operator: string
  leftHandSide: Object
  rightHandSide: Object
}

export interface TupleExpressionAstNode extends ExpressionAttributes {
  id: number
  nodeType: 'TupleExpression'
  src: string
  isInlineArray: boolean
  components: Object
}

export interface UnaryOperationAstNode extends ExpressionAttributes {
  id: number
  nodeType: 'UnaryOperation'
  src: string
  prefix: boolean
  operator: string
  subExpression: Object
}

export interface BinaryOperationAstNode extends ExpressionAttributes {
  id: number
  nodeType: 'BinaryOperation'
  src: string
  operator: string
  leftExpression: Object
  rightExpression: Object
  commonType: Object
}

export interface FunctionCallAstNode extends ExpressionAttributes {
  id: number
  nodeType: 'FunctionCall'
  src: string
  expression: Object
  names: Object
  arguments: Object
  tryCall: boolean
  kind: 'functionCall' | 'typeConversion' | 'structConstructorCall'
}

export interface FunctionCallOptionsAstNode extends ExpressionAttributes {
  id: number
  nodeType: 'FunctionCallOptions'
  src: string
  expression: Object
  names: Object
  options: Object
}

export interface NewExpressionAstNode extends ExpressionAttributes {
  id: number
  nodeType: 'NewExpression'
  src: string
  typeName: Object
}

export interface MemberAccessAstNode extends ExpressionAttributes {
  id: number
  nodeType: 'MemberAccess'
  src: string
  memberName: string
  expression: Object
  referencedDeclaration: Object
}

export interface IndexAccessAstNode extends ExpressionAttributes {
  id: number
  nodeType: 'IndexAccess'
  src: string
  baseExpression: Object
  indexExpression: Object
}

export interface IndexRangeAccessAstNode extends ExpressionAttributes {
  id: number
  nodeType: 'IndexRangeAccess'
  src: string
  baseExpression: Object
  startExpression: Object
  endExpression: Object
}

export interface ElementaryTypeNameExpressionAstNode extends ExpressionAttributes {
  id: number
  nodeType: 'ElementaryTypeNameExpression'
  src: string
  typeName: Object
}

export interface LiteralAstNode extends ExpressionAttributes {
  id: number
  nodeType: 'Literal'
  src: string
  kind: 'number' | 'string' | 'bool'
  value: string
  hexValue: string
  subdenomination: Object
}

export interface IdentifierAstNode {
  id: number
  nodeType: 'Identifier'
  src: string
  name: string
  referencedDeclaration: Object
  overloadedDeclarations: Object
  typeDescriptions: Object
  argumentTypes: Object
}

export interface StructuredDocumentationAstNode {
  id: number
  nodeType: 'StructuredDocumentation'
  src: string
  text: string
}
 
 
  ///////////
  // ERROR //
  ///////////
  
  export interface CompilationError {
    /** Location within the source file */
    sourceLocation?: {
      file: string
      start: number
      end: number
    }
    /** Error type */
    type?: CompilationErrorType
    /** Component where the error originated, such as "general", "ewasm", etc. */
    component?: 'general' | 'ewasm' | string
    severity?: 'error' | 'warning'
    message?: string
    mode?: 'panic'
    /** the message formatted with source location */
    formattedMessage?: string
  }
  
  type CompilationErrorType =
    | 'JSONError'
    | 'IOError'
    | 'ParserError'
    | 'DocstringParsingError'
    | 'SyntaxError'
    | 'DeclarationError'
    | 'TypeError'
    | 'UnimplementedFeatureError'
    | 'InternalCompilerError'
    | 'Exception'
    | 'CompilerError'
    | 'FatalError'
    | 'Warning'
  
  ////////////
  // SOURCE //
  ////////////
  export interface CompilationSource {
    /** Identifier of the source (used in source maps) */
    id: number
    /** The AST object */
    ast: AstNode
    /** The legacy AST object */
    legacyAST: AstNodeLegacy
  }
  
  /////////
  // AST //
  /////////
  export interface AstNode {
    absolutePath?: string
    exportedSymbols?: Object
    id: number
    nodeType: string
    nodes?: Array<AstNode>
    src: string
    literals?: Array<string>
    file?: string
    scope?: number
    sourceUnit?: number
    symbolAliases?: Array<string>
    [x: string]: any
  }
  
  export interface AstNodeLegacy {
    id: number
    name: string
    src: string
    children?: Array<AstNodeLegacy>
    attributes?: AstNodeAtt
  }
  
  export interface AstNodeAtt {
    operator?: string
    string?: null
    type?: string
    value?: string
    constant?: boolean
    name?: string
    public?: boolean
    exportedSymbols?: Object
    argumentTypes?: null
    absolutePath?: string
    [x: string]: any
  }
  
  //////////////
  // CONTRACT //
  //////////////
  export interface CompiledContract {
    /** The Ethereum Contract ABI. If empty, it is represented as an empty array. */
    abi: ABIDescription[]
    // See the Metadata Output documentation (serialised JSON string)
    metadata: string
    /** User documentation (natural specification) */
    userdoc: UserDocumentation
    /** Developer documentation (natural specification) */
    devdoc: DeveloperDocumentation
    /** Intermediate representation (string) */
    ir: string
    /** EVM-related outputs */
    evm: {
      assembly: string
      legacyAssembly: {}
      /** Bytecode and related details. */
      bytecode: BytecodeObject
      deployedBytecode: BytecodeObject
      /** The list of function hashes */
      methodIdentifiers: {
        [functionIdentifier: string]: string
      }
      // Function gas estimates
      gasEstimates: {
        creation: {
          codeDepositCost: string
          executionCost: 'infinite' | string
          totalCost: 'infinite' | string
        }
        external: {
          [functionIdentifier: string]: string
        }
        internal: {
          [functionIdentifier: string]: 'infinite' | string
        }
      }
    }
    /** eWASM related outputs */
    ewasm: {
      /** S-expressions format */
      wast: string
      /** Binary format (hex string) */
      wasm: string
    }
  }
  
  /////////
  // ABI //
  /////////
  export type ABIDescription = FunctionDescription | EventDescription
  
  export interface FunctionDescription {
    /** Type of the method. default is 'function' */
    type?: 'function' | 'constructor' | 'fallback' | 'receive'
    /** The name of the function. Constructor and fallback function never have name */
    name?: string
    /** List of parameters of the method. Fallback function doesn’t have inputs. */
    inputs?: ABIParameter[]
    /** List of the outputs parameters for the method, if any */
    outputs?: ABIParameter[]
    /** State mutability of the method */
    stateMutability: 'pure' | 'view' | 'nonpayable' | 'payable'
    /** true if function accepts Ether, false otherwise. Default is false */
    payable?: boolean
    /** true if function is either pure or view, false otherwise. Default is false  */
    constant?: boolean
  }
  
  export interface EventDescription {
    type: 'event'
    name: string
    inputs: ABIParameter &
      {
        /** true if the field is part of the log’s topics, false if it one of the log’s data segment. */
        indexed: boolean
      }[]
    /** true if the event was declared as anonymous. */
    anonymous: boolean
  }
  
  export interface ABIParameter {
    /** The name of the parameter */
    name: string
    /** The canonical type of the parameter */
    type: ABITypeParameter
    /** Used for tuple types */
    components?: ABIParameter[]
  }
  
  export type ABITypeParameter =
    | 'uint'
    | 'uint[]' // TODO : add <M>
    | 'int'
    | 'int[]' // TODO : add <M>
    | 'address'
    | 'address[]'
    | 'bool'
    | 'bool[]'
    | 'fixed'
    | 'fixed[]' // TODO : add <M>
    | 'ufixed'
    | 'ufixed[]' // TODO : add <M>
    | 'bytes'
    | 'bytes[]' // TODO : add <M>
    | 'function'
    | 'function[]'
    | 'tuple'
    | 'tuple[]'
    | string // Fallback

///////////////////////////
  // NATURAL SPECIFICATION //
  ///////////////////////////
  
  // Userdoc
  export interface UserDocumentation {
    methods: UserMethodList
    notice: string
  }
  
  export type UserMethodList = {
    [functionIdentifier: string]: UserMethodDoc
  } & {
    'constructor'?: string
  }
  export interface UserMethodDoc {
    notice: string
  }
  
  // Devdoc
  export interface DeveloperDocumentation {
    author: string
    title: string
    details: string
    methods: DevMethodList
  }
  
  export interface DevMethodList {
    [functionIdentifier: string]: DevMethodDoc
  }
  
  export interface DevMethodDoc {
    author: string
    details: string
    return: string
    params: {
      [param: string]: string
    }
  }
  
  //////////////
  // BYTECODE //
  //////////////
  export interface BytecodeObject {
    /** The bytecode as a hex string. */
    object: string
    /** Opcodes list */
    opcodes: string
    /** The source mapping as a string. See the source mapping definition. */
    sourceMap: string
    /** If given, this is an unlinked object. */
    linkReferences?: {
      [contractName: string]: {
        /** Byte offsets into the bytecode. */
        [library: string]: { start: number; length: number }[]
      }
    }
  }