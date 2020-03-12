'use strict'

import { FunctionDefinitionAstNode, ModifierDefinitionAstNode, ParameterListAstNode, ForStatementAstNode, WhileStatementAstNode, VariableDeclarationAstNode, ContractDefinitionAstNode, InheritanceSpecifierAstNode, MemberAccessAstNode, BinaryOperationAstNode, FunctionCallAstNode, ExpressionStatementAstNode, UnaryOperationAstNode, IdentifierAstNode, MappingAstNode, IndexAccessAstNode, UserDefinedTypeNameAstNode, BlockAstNode, AssignmentAstNode, InlineAssemblyAstNode, IfStatementAstNode } from "types"
import { util } from 'remix-lib'

const nodeTypes = {
  SOURCEUNIT: 'SourceUnit',
  PRAGMADIRECTIVE: 'PragmaDirective',
  IMPORTDIRECTIVE: 'ImportDirective',
  CONTRACTDEFINITION: 'ContractDefinition',
  INHERITANCESPECIFIER: 'InheritanceSpecifier',
  USINGFORDIRECTIVE: 'UsingForDirective',
  STRUCTDEFINITION: 'StructDefinition',
  ENUMDEFINITION: 'EnumDefinition',
  ENUMVALUE: 'EnumValue',
  PARAMETERLIST: 'ParameterList',
  OVERRIDESPECIFIER: 'OverrideSpecifier',
  FUNCTIONDEFINITION: 'FunctionDefinition',
  VARIABLEDECLARATION: 'VariableDeclaration',
  MODIFIERDEFINITION: 'ModifierDefinition',
  MODIFIERINVOCATION: 'ModifierInvocation',
  EVENTDEFINITION: 'EventDefinition',
  ELEMENTARYTYPENAME: 'ElementaryTypeName',
  USERDEFINEDTYPENAME: 'UserDefinedTypeName',
  FUNCTIONTYPENAME: 'FunctionTypeName',
  MAPPING: 'Mapping',
  ARRAYTYPENAME: 'ArrayTypeName',
  INLINEASSEMBLY: 'InlineAssembly', 
  BLOCK: 'Block',
  PLACEHOLDERSTATEMENT: 'PlaceholderStatement', 
  IFSTATEMENT: 'IfStatement',
  TRYCATCHCLAUSE: 'TryCatchClause', 
  TRYSTATEMENT: 'TryStatement', 
  WHILESTATEMENT: 'WhileStatement',
  DOWHILESTATEMENT: 'DoWhileStatement',
  FORSTATEMENT: 'ForStatement',
  CONTINUE: 'Continue', 
  BREAK: 'Break', 
  RETURN: 'Return', 
  THROW: 'Throw', 
  EMITSTATEMENT: 'EmitStatement', 
  VARIABLEDECLARATIONSTATEMENT: 'VariableDeclarationStatement', 
  EXPRESSIONSTATEMENT: 'ExpressionStatement',
  CONDITIONAL: 'Conditional', 
  ASSIGNMENT: 'Assignment',
  TUPLEEXPRESSION: 'TupleExpression', 
  UNARYOPERATION: 'UnaryOperation',
  BINARYOPERATION: 'BinaryOperation',
  FUNCTIONCALL: 'FunctionCall',
  FUNCTIONCALLOPTIONS: 'FunctionCallOptions',
  NEWEXPRESSION: 'NewExpression', 
  MEMBERACCESS: 'MemberAccess', 
  INDEXACCESS: 'IndexAccess', 
  INDEXRANGEACCESS: 'IndexRangeAccess', 
  ELEMENTARYTYPENAMEEXPRESSION: 'ElementaryTypeNameExpression', 
  LITERAL: 'Literal', 
  IDENTIFIER: 'Identifier',
  STRUCTUREDDOCUMENTATION: 'StructuredDocumentation'
}

const basicTypes = {
  UINT: 'uint256',
  BOOL: 'bool',
  ADDRESS: 'address',
  PAYABLE_ADDRESS: 'address payable',
  BYTES32: 'bytes32',
  STRING_MEM: 'string memory',
  BYTES_MEM: 'bytes memory',
  BYTES4: 'bytes4'
}

const basicRegex = {
  CONTRACTTYPE: '^contract ',
  FUNCTIONTYPE: '^function \\(',
  EXTERNALFUNCTIONTYPE: '^function \\(.*\\).* external',
  CONSTANTFUNCTIONTYPE: '^function \\(.*\\).* (view|pure)',
  REFTYPE: '(storage)|(mapping\\()|(\\[\\])',
  FUNCTIONSIGNATURE: '^function \\(([^\\(]*)\\)',
  LIBRARYTYPE: '^type\\(library (.*)\\)'
}

const basicFunctionTypes = {
  SEND: buildFunctionSignature([basicTypes.UINT], [basicTypes.BOOL], false),
  CALL: buildFunctionSignature([basicTypes.BYTES_MEM], [basicTypes.BOOL, basicTypes.BYTES_MEM], true),
  DELEGATECALL: buildFunctionSignature([basicTypes.BYTES_MEM], [basicTypes.BOOL, basicTypes.BYTES_MEM], false),
  TRANSFER: buildFunctionSignature([basicTypes.UINT], [], false)
}

const builtinFunctions = {
  'keccak256()': true,
  'sha3()': true,
  'sha256()': true,
  'ripemd160()': true,
  'ecrecover(bytes32,uint8,bytes32,bytes32)': true,
  'addmod(uint256,uint256,uint256)': true,
  'mulmod(uint256,uint256,uint256)': true,
  'selfdestruct(address)': true,
  'selfdestruct(address payable)': true,
  'revert()': true,
  'revert(string memory)': true,
  'assert(bool)': true,
  'require(bool)': true,
  'require(bool,string memory)': true,
  'gasleft()': true,
  'blockhash(uint256)': true,
  'address(address)': true
}

const lowLevelCallTypes = {
  CALL: { ident: 'call', type: basicFunctionTypes.CALL },
  DELEGATECALL: { ident: 'delegatecall', type: basicFunctionTypes.DELEGATECALL },
  SEND: { ident: 'send', type: basicFunctionTypes.SEND },
  TRANSFER: { ident: 'transfer', type: basicFunctionTypes.TRANSFER }
}

const specialVariables = {
  BLOCKTIMESTAMP: { obj: 'block', member: 'timestamp', type: basicTypes.UINT },
  BLOCKHASH: {
    obj: 'block',
    member: 'blockhash',
    type: buildFunctionSignature([basicTypes.UINT], [basicTypes.BYTES32], false)
  }
}

const abiNamespace = {
  ENCODE: {
    obj: 'abi',
    member: 'encode',
    type: buildFunctionSignature([], [basicTypes.BYTES_MEM], false, 'pure')
  },
  ENCODEPACKED: {
    obj: 'abi',
    member: 'encodePacked',
    type: buildFunctionSignature([], [basicTypes.BYTES_MEM], false, 'pure')
  },
  ENCODE_SELECT: {
    obj: 'abi',
    member: 'encodeWithSelector',
    type: buildFunctionSignature([basicTypes.BYTES4], [basicTypes.BYTES_MEM], false, 'pure')
  },
  ENCODE_SIG: {
    obj: 'abi',
    member: 'encodeWithSignature',
    type: buildFunctionSignature([basicTypes.STRING_MEM], [basicTypes.BYTES_MEM], false, 'pure')
  }
}

// #################### Trivial Getters

function getType (node: any): string {
  return node.typeDescriptions.typeString
}

// #################### Complex Getters

/**
 * Returns the type parameter of function call AST nodes. Throws if not a function call node
 * @func {ASTNode} Function call node
 * @return {string} type of function call
 */
function getFunctionCallType (func: FunctionCallAstNode): string {
  return getType(func.expression)
}

/**
 * Get the variable name written to by a effect node, except for inline assembly because there is no information to find out where we write to. Trows if not a effect node or is inlineassmbly.
 * Example: x = 10; => x
 * @effectNode {ASTNode} Assignmnet node
 * @return {string} variable name written to
 */
function getEffectedVariableName (effectNode: AssignmentAstNode | UnaryOperationAstNode) {
  if (!isEffect(effectNode)) throw new Error('staticAnalysisCommon.js: not an effect Node')
  if(effectNode.nodeType === 'Assignment' || effectNode.nodeType === 'UnaryOperation') {
    const IdentNode = findFirstSubNodeLTR(effectNode, exactMatch(nodeTypes.IDENTIFIER))
    return IdentNode.name
  }
}

// developed keeping identifier node search in mind

function findFirstSubNodeLTR (node, type) {
  if(node.nodeType && nodeType(node, type))
    return node

  else if(node.nodeType && nodeType(node, exactMatch('Assignment')))
    return findFirstSubNodeLTR(node.leftHandSide, type)

  else if(node.nodeType && nodeType(node, exactMatch('MemberAccess')))
    return findFirstSubNodeLTR(node.expression, type)
  
  else if(node.nodeType && nodeType(node, exactMatch('IndexAccess')))
    return findFirstSubNodeLTR(node.baseExpression, type)
  
  else if(node.nodeType && nodeType(node, exactMatch('UnaryOperation')))
  return findFirstSubNodeLTR(node.subExpression, type)
}

/**
 * Returns the identifier of a local call, Throws on wrong node.
 * Example: f(103) => f
 * @localCallNode {ASTNode} Function call node
 * @return {string} name of the function called
 */
function getLocalCallName (localCallNode: FunctionCallAstNode): string {
  if (!isLocalCall(localCallNode) && !isAbiNamespaceCall(localCallNode)) throw new Error('staticAnalysisCommon.js: not an local call Node')
  return localCallNode.expression.name
}

/**
 * Returns the identifier of a this local call, Throws on wrong node.
 * Example: this.f(103) => f
 * @localCallNode {ASTNode} Function call node
 * @return {string} name of the function called
 */
function getThisLocalCallName (thisLocalCallNode: FunctionCallAstNode): string {
  if (!isThisLocalCall(thisLocalCallNode.expression)) throw new Error('staticAnalysisCommon.js: not an this local call Node')
  return thisLocalCallNode.expression.memberName
}

/**
 * Returns the identifier of a super local call, Throws on wrong node.
 * Example: super.f(103) => f
 * @localCallNode {ASTNode} Function call node
 * @return {string} name of the function called
 */
function getSuperLocalCallName (superLocalCallNode: FunctionCallAstNode): string {
  if (!isSuperLocalCall(superLocalCallNode.expression)) throw new Error('staticAnalysisCommon.js: not an super local call Node')
  return superLocalCallNode.expression.memberName
}

/**
 * Returns the contract type of a external direct call, Throws on wrong node.
 * Example:
 *  foo x = foo(0xdeadbeef...);
 *  x.f(103) => foo
 * @extDirectCall {ASTNode} Function call node
 * @return {string} name of the contract the function is defined in
 */
function getExternalDirectCallContractName (extDirectCall: FunctionCallAstNode): string {
  if (!isExternalDirectCall(extDirectCall.expression)) throw new Error('staticAnalysisCommon.js: not an external direct call Node')
  return extDirectCall.expression.expression.typeDescriptions.typeString.replace(new RegExp(basicRegex.CONTRACTTYPE), '')
}

/**
 * Returns the name of the contract of a this local call (current contract), Throws on wrong node.
 * Example:
 * Contract foo {
 *    ...
 *    this.f(103) => foo
 *    ...
 * @thisLocalCall {ASTNode} Function call node
 * @return {string} name of the contract the function is defined in
 */
function getThisLocalCallContractName (thisLocalCall: FunctionCallAstNode): string {
  if (!isThisLocalCall(thisLocalCall.expression)) throw new Error('staticAnalysisCommon.js: not an this local call Node')
  return thisLocalCall.expression.expression.typeDescriptions.typeString.replace(new RegExp(basicRegex.CONTRACTTYPE), '')
}

/**
 * Returns the function identifier of a external direct call, Throws on wrong node.
 * Example:
 *  foo x = foo(0xdeadbeef...);
 *  x.f(103) => f
 * @extDirectCall {ASTNode} Function call node
 * @return {string} name of the function called
 */
function getExternalDirectCallMemberName (extDirectCall: FunctionCallAstNode): string {
  if (!isExternalDirectCall(extDirectCall.expression)) throw new Error('staticAnalysisCommon.js: not an external direct call Node')
  return extDirectCall.expression.memberName
}

/**
 * Returns the name of a contract, Throws on wrong node.
 * Example:
 *   Contract foo { => foo
 * @contract {ASTNode} Contract Definition node
 * @return {string} name of a contract defined
 */
function getContractName (contract: ContractDefinitionAstNode): string {
  return contract.name
}

/**
 * Returns the name of a function definition, Throws on wrong node.
 * Example:
 *   func foo(uint bla) { => foo
 * @funcDef {ASTNode} Function Definition node
 * @return {string} name of a function defined
 */
function getFunctionDefinitionName (funcDef: FunctionDefinitionAstNode): string {
  // if (!isFunctionDefinition(funcDef)) throw new Error('staticAnalysisCommon.js: not an functionDefinition Node')
  return funcDef.name
}

/**
 * Returns the identifier of an inheritance specifier, Throws on wrong node.
 * Example:
 *   contract KingOfTheEtherThrone is b { => b
 * @func {ASTNode} Inheritance specifier
 * @return {string} name of contract inherited from
 */
function getInheritsFromName (inheritsNode: InheritanceSpecifierAstNode): string {
  return inheritsNode.baseName.name
}

/**
 * Returns the identifier of a variable definition, Throws on wrong node.
 * Example:
 *   var x = 10; => x
 * @varDeclNode {ASTNode} Variable declaration node
 * @return {string} variable name
 */
function getDeclaredVariableName (varDeclNode: VariableDeclarationAstNode): string {
  return varDeclNode.name
}

/**
 * Returns the type of a variable definition, Throws on wrong node.
 * Example:
 *   var x = 10; => x
 * @varDeclNode {ASTNode} Variable declaration node
 * @return {string} variable type
 */
function getDeclaredVariableType (varDeclNode: VariableDeclarationAstNode): string {
  return varDeclNode.typeName.name
}

/**
 * Returns state variable declaration nodes for a contract, Throws on wrong node.
 * Example:
 * contract foo {
 *     ...
 *   var y = true;
 *   var x = 10; => [y,x]
 * @contractNode {ASTNode} Contract Definition node
 * @return {list variable declaration} state variable node list
 */
function getStateVariableDeclarationsFromContractNode (contractNode: ContractDefinitionAstNode): VariableDeclarationAstNode[] {
  return contractNode.nodes.filter(el => el.nodeType === "VariableDeclaration")
}

/**
 * Returns parameter node for a function or modifier definition, Throws on wrong node.
 * Example:
 * function bar(uint a, uint b) => uint a, uint b
 * @funcNode {ASTNode} Contract Definition node
 * @return {parameterlist node} parameterlist node
 */
function getFunctionOrModifierDefinitionParameterPart (funcNode: FunctionDefinitionAstNode | ModifierDefinitionAstNode): ParameterListAstNode {
  // if (!isFunctionDefinition(funcNode) && !isModifierDefinition(funcNode)) throw new Error('staticAnalysisCommon.js: not a function definition')
  return funcNode.parameters
}

/**
 * Returns return parameter node for a function or modifier definition, Throws on wrong node.
 * Example:
 * function bar(uint a, uint b) returns (bool a, bool b) => bool a, bool b
 * @funcNode {ASTNode} Contract Definition node
 * @return {parameterlist node} parameterlist node
 */
function getFunctionDefinitionReturnParameterPart (funcNode: FunctionDefinitionAstNode): ParameterListAstNode {
  return funcNode.returnParameters
}

/**
 * Extracts the parameter types for a function type signature
 * Example:
 * function(uint a, uint b) returns (bool) => uint a, uint b
 * @func {ASTNode} function call node
 * @return {string} parameter signature
 */
function getFunctionCallTypeParameterType (func: FunctionCallAstNode): string | undefined {
  const type = getFunctionCallType(func)
  if (type.startsWith('function (')) {
    let paramTypes = ''
    let openPar = 1
    for (let x = 10; x < type.length; x++) {
      const c = type.charAt(x)
      if (c === '(') openPar++
      else if (c === ')') openPar--

      if (openPar === 0) return paramTypes

      paramTypes += c
    }
  } else {
    throw new Error('staticAnalysisCommon.js: cannot extract parameter types from function call')
  }
}

/**
 * Returns the name of the library called, Throws on wrong node.
 * Example:
 *  library set{...}
 *  contract foo {
 *    ...
 *    function () { set.union() => set}
 * @funcCall {ASTNode} function call node
 * @return {string} name of the lib defined
 */
function getLibraryCallContractName (node: FunctionCallAstNode): string | undefined {
  if (!isLibraryCall(node.expression)) throw new Error('staticAnalysisCommon.js: not an this library call Node')
  const types: RegExpExecArray | null = new RegExp(basicRegex.LIBRARYTYPE).exec(node.expression.expression.typeDescriptions.typeString)
  if(types)
    return types[1]
}

/**
 * Returns the name of the function of a library call, Throws on wrong node.
 * Example:
 *  library set{...}
 *  contract foo {
 *    ...
 *    function () { set.union() => uinion}
 * @func {ASTNode} function call node
 * @return {string} name of function called on the library
 */
function getLibraryCallMemberName (funcCall: FunctionCallAstNode): string {
  // if (!isLibraryCall(funcCall)) throw new Error('staticAnalysisCommon.js: not an library call Node')
  return funcCall.expression.memberName
}

/**
 * Returns full qualified name for a function call, Throws on wrong node.
 * Example:
 *  contract foo {
 *    ...
 *    function bar(uint b) { }
 *    function baz() {
 *      bar(10) => foo.bar(uint)
 * @func {ASTNode} function call node
 * @func {ASTNode} contract defintion
 * @return {string} full qualified identifier for the function call
 */
function getFullQualifiedFunctionCallIdent (contract: ContractDefinitionAstNode, func: FunctionCallAstNode): string {
  if (isLocalCall(func)) return getContractName(contract) + '.' + getLocalCallName(func) + '(' + getFunctionCallTypeParameterType(func) + ')'
  else if (isThisLocalCall(func.expression)) return getThisLocalCallContractName(func) + '.' + getThisLocalCallName(func) + '(' + getFunctionCallTypeParameterType(func) + ')'
  else if (isSuperLocalCall(func.expression)) return getContractName(contract) + '.' + getSuperLocalCallName(func) + '(' + getFunctionCallTypeParameterType(func) + ')'
  else if (isExternalDirectCall(func.expression)) return getExternalDirectCallContractName(func) + '.' + getExternalDirectCallMemberName(func) + '(' + getFunctionCallTypeParameterType(func) + ')'
  else if (isLibraryCall(func.expression)) return getLibraryCallContractName(func.expression) + '.' + getLibraryCallMemberName(func) + '(' + getFunctionCallTypeParameterType(func) + ')'
  else throw new Error('staticAnalysisCommon.js: Can not get function name from non function call node')
}

function getFullQuallyfiedFuncDefinitionIdent (contract: ContractDefinitionAstNode, func: FunctionDefinitionAstNode, paramTypes: any[]): string {
  return getContractName(contract) + '.' + getFunctionDefinitionName(func) + '(' + util.concatWithSeperator(paramTypes, ',') + ')'
}

function getUnAssignedTopLevelBinOps (subScope: BlockAstNode | IfStatementAstNode | WhileStatementAstNode | ForStatementAstNode): ExpressionStatementAstNode[] {
  let result: ExpressionStatementAstNode[] = []
  if(subScope.nodeType === 'Block')
    result = subScope.statements.filter(isBinaryOpInExpression)
  // for 'without braces' loops
  else if (subScope && subScope.nodeType && isSubScopeStatement(subScope)) {
    if (subScope.nodeType === 'IfStatement'){
      if((subScope.trueBody.nodeType === "ExpressionStatement" && isBinaryOpInExpression(subScope.trueBody)))
        result.push(subScope.trueBody) 
      if (subScope.falseBody.nodeType === "ExpressionStatement" && isBinaryOpInExpression(subScope.falseBody))
        result.push(subScope.falseBody) 
    }
    else {
      if(subScope.body.nodeType === "ExpressionStatement" && isBinaryOpInExpression(subScope.body))
        result.push(subScope.body)
    }
  }
  return result 
}

// function getLoopBlockStartIndex (node: ForStatementAstNode | WhileStatementAstNode): 3|1 {
//     return node.nodeType === "ForStatement" ? 3 : 1
// }

// #################### Trivial Node Identification

function isStatement (node: any): boolean {
  return nodeType(node, 'Statement$') || node.nodeType === "Block" || node.nodeType === "Return"
}

/**
 * True if is binaryop
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
// function isBinaryOperation (node) {
//   return nodeType(node, exactMatch(nodeTypes.BINARYOPERATION))
// }

// #################### Complex Node Identification

/**
 * True if function defintion has function body
 * @funcNode {ASTNode} function defintion node
 * @return {bool}
 */
function hasFunctionBody (funcNode: FunctionDefinitionAstNode): boolean {
  return funcNode.body !== null
}

/**
 * True if node is a delete instruction of a dynamic array
 * @node {ASTNode} node to check for
 * @return {bool}
 */
function isDeleteOfDynamicArray (node: UnaryOperationAstNode): boolean {
  return isDeleteUnaryOperation(node) && isDynamicArrayAccess(node.subExpression)
}

/**
 * True if node is node is a ref to a dynamic array
 * @node {ASTNode} node to check for
 * @return {bool}
 */
function isDynamicArrayAccess (node: IdentifierAstNode): boolean {
  return getType(node).endsWith('[] storage ref') || typeDescription(node, 'bytes storage ref') || typeDescription(node, 'string storage ref')
}

/**
 * True if node accesses 'length' member of dynamic array
 * @node {ASTNode} node to check for
 * @return {bool}
 */
function isDynamicArrayLengthAccess (node: MemberAccessAstNode): boolean {
  return (node.memberName === 'length') && // accessing 'length' member
  node.expression['typeDescriptions']['typeString'].indexOf('[]') !== -1 // member is accessed from dynamic array, notice [] without any number
}

/**
 * True if node is a delete instruction for an element from a dynamic array
 * @node {ASTNode} node to check for
 * @return {bool}
 */
function isDeleteFromDynamicArray (node: UnaryOperationAstNode): boolean {
  return isDeleteUnaryOperation(node) && node.subExpression.nodeType === 'IndexAccess'
}

/**
 * True if node is the access of an index
 * @node {ASTNode} node to check for
 * @return {bool}
 */
// function isIndexAccess (node) {
//   return node && node.name === 'IndexAccess'
// }

/**
 * True if node is the access of a mapping index
 * @node {ASTNode} node to check for
 * @return {bool}
 */
function isMappingIndexAccess (node: IndexAccessAstNode): boolean {
  return node.typeDescriptions.typeString.startsWith('mapping')
}

/**
 * True if call to code within the current contracts context including (delegate) library call
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isLocalCallGraphRelevantNode (node: FunctionCallAstNode): boolean {
  return ((isLocalCall(node) || isSuperLocalCall(node.expression) || isLibraryCall(node.expression)) && !isBuiltinFunctionCall(node))
}

/**
 * True if is builtin function like assert, sha3, erecover, ...
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isBuiltinFunctionCall (node: FunctionCallAstNode): boolean {
  // console.log('isBuiltinFunctionCall isLocalCall', isLocalCall(node))
  // console.log('isBuiltinFunctionCall getLocalCallName', getLocalCallName(node))
  // console.log('isBuiltinFunctionCall getFunctionCallTypeParameterType', getFunctionCallTypeParameterType(node))
  return (node.nodeType === 'FunctionCall' && isLocalCall(node) && builtinFunctions[getLocalCallName(node) + '(' + getFunctionCallTypeParameterType(node) + ')'] === true) || isAbiNamespaceCall(node)
}

/**
 * True if is builtin function like assert, sha3, erecover, ...
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isAbiNamespaceCall (node: FunctionCallAstNode): boolean {
  return Object.keys(abiNamespace).some((key) => abiNamespace.hasOwnProperty(key) && node.expression && isSpecialVariableAccess(node.expression, abiNamespace[key]))
}

/**
 * True if node is a call to selfdestruct
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isSelfdestructCall (node: FunctionCallAstNode): boolean {
  return isBuiltinFunctionCall(node) && getLocalCallName(node) === 'selfdestruct'
}

/**
 * True if node is a call to builtin assert(bool)
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isAssertCall (node: FunctionCallAstNode): boolean {
  return isBuiltinFunctionCall(node) && getLocalCallName(node) === 'assert'
}

/**
 * True if node is a call to builtin require(bool)
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isRequireCall (node: FunctionCallAstNode): boolean  {
  return isBuiltinFunctionCall(node) && getLocalCallName(node) === 'require'
}

/**
 * True if is storage variable declaration
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isStorageVariableDeclaration (node: VariableDeclarationAstNode): boolean {
  // console.log('storage variable----------', new RegExp(basicRegex.REFTYPE).test(node.typeDescriptions.typeIdentifier))
  return node.storageLocation === 'storage' && new RegExp(basicRegex.REFTYPE).test(node.typeDescriptions.typeIdentifier)
}

/**
 * True if is interaction with external contract (change in context, no delegate calls) (send, call of other contracts)
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isInteraction (node: MemberAccessAstNode): boolean {
  return isLLCall(node) || isLLSend(node) || isExternalDirectCall(node) || isTransfer(node)
}

/**
 * True if node changes state of a variable or is inline assembly (does not include check if it is a global state change, on a state variable)
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isEffect (node: AssignmentAstNode | UnaryOperationAstNode | InlineAssemblyAstNode): boolean {
  return node.nodeType === "Assignment" || 
        (node.nodeType === "UnaryOperation" && (isPlusPlusUnaryOperation(node) || isMinusMinusUnaryOperation(node))) || 
        node.nodeType === "InlineAssembly"
}

/**
 * True if node changes state of a variable or is inline assembly (Checks if variable is a state variable via provided list)
 * @node {ASTNode} some AstNode
 * @node {list Variable declaration} state variable declaration currently in scope
 * @return {bool}
 */
function isWriteOnStateVariable (effectNode: AssignmentAstNode | InlineAssemblyAstNode | UnaryOperationAstNode, stateVariables: VariableDeclarationAstNode[]) {
  return effectNode.nodeType === "InlineAssembly" || (isEffect(effectNode) && isStateVariable(getEffectedVariableName(effectNode), stateVariables))
}

/**
 * True if there is a variable with name, name in stateVariables
 * @node {ASTNode} some AstNode
 * @node {list Variable declaration} state variable declaration currently in scope
 * @return {bool}
 */
function isStateVariable (name: string, stateVariables: VariableDeclarationAstNode[]): boolean {
  return stateVariables.some((item: VariableDeclarationAstNode) => item.stateVariable && name === getDeclaredVariableName(item))
}

/**
 * True if is function defintion that is flaged as constant
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isConstantFunction (node: FunctionDefinitionAstNode): boolean {
  return node.stateMutability === 'view' || node.stateMutability === 'pure'
}

/**
 * True if is function defintion has payable modifier
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isPayableFunction (node: FunctionDefinitionAstNode): boolean {
  return node.stateMutability === 'payable'
}

/**
 * True if is constructor
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isConstructor (node: FunctionDefinitionAstNode): boolean {
  return node.kind === "constructor"
}

/**
 * True if node is integer division that truncates (not only int literals since those yield a rational value)
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isIntDivision (node: BinaryOperationAstNode): boolean {
  return operator(node, exactMatch(util.escapeRegExp('/'))) && typeDescription(node.rightExpression, util.escapeRegExp('int'))
}

/**
 * True if is block / SubScope has top level binops (e.g. that are not assigned to anything, most of the time confused compare instead of assign)
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isSubScopeWithTopLevelUnAssignedBinOp (node: BlockAstNode | IfStatementAstNode | WhileStatementAstNode | ForStatementAstNode): boolean | undefined {
  if(node.nodeType === 'Block')
    return node.statements.some(isBinaryOpInExpression)
  // for 'without braces' loops
  else if (node && node.nodeType && isSubScopeStatement(node)) {
    if (node.nodeType === 'IfStatement')
      return (node.trueBody && node.trueBody.nodeType === "ExpressionStatement" && isBinaryOpInExpression(node.trueBody)) || 
          (node.falseBody && node.falseBody.nodeType === "ExpressionStatement" && isBinaryOpInExpression(node.falseBody))
    else 
      return node.body && node.body.nodeType === "ExpressionStatement" && isBinaryOpInExpression(node.body)
  } 
}

function isSubScopeStatement (node: IfStatementAstNode | WhileStatementAstNode | ForStatementAstNode): boolean {
  if(node.nodeType === 'IfStatement')
    return (node.trueBody && node.trueBody.nodeType && !nodeType(node.trueBody, exactMatch(nodeTypes.BLOCK))) ||
        (node.falseBody && node.falseBody.nodeType && !nodeType(node.falseBody, exactMatch(nodeTypes.BLOCK)))
  else      
    return node.body && node.body.nodeType && !nodeType(node.body, exactMatch(nodeTypes.BLOCK))
}

/**
 * True if binary operation inside of expression statement
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isBinaryOpInExpression (node: ExpressionStatementAstNode): boolean {
  return node.nodeType === "ExpressionStatement" && node.expression.nodeType === "BinaryOperation"
}

/**
 * True if unary increment operation
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isPlusPlusUnaryOperation (node: UnaryOperationAstNode): boolean {
  return node.operator === '++'
}

/**
 * True if unary delete operation
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isDeleteUnaryOperation (node: UnaryOperationAstNode): boolean {
  return node.operator === 'delete'
}

/**
 * True if unary decrement operation
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isMinusMinusUnaryOperation (node: UnaryOperationAstNode): boolean {
  return node.operator === '--'
}

/**
 * True if all functions on a contract are implemented
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isFullyImplementedContract (node: ContractDefinitionAstNode): boolean {
  return node.fullyImplemented === true
}

/**
 * True if it is a library contract defintion
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isLibrary (node: ContractDefinitionAstNode): boolean {
  return node.contractKind === 'library'
}

/**
 * True if it is a local call to non const function
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isCallToNonConstLocalFunction (node: FunctionCallAstNode): boolean {
  return isLocalCall(node) && !expressionTypeDescription(node, basicRegex.CONSTANTFUNCTIONTYPE)
}

/**
 * True if it is a call to a library
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isLibraryCall (node: MemberAccessAstNode): boolean {
  return isMemberAccess(node, basicRegex.FUNCTIONTYPE, undefined, basicRegex.LIBRARYTYPE, undefined)
}

/**
 * True if it is an external call via defined interface (not low level call)
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isExternalDirectCall (node: MemberAccessAstNode): boolean {
  return isMemberAccess(node, basicRegex.EXTERNALFUNCTIONTYPE, undefined, basicRegex.CONTRACTTYPE, undefined) && !isThisLocalCall(node) && !isSuperLocalCall(node)
}

/**
 * True if access to block.timestamp via now alias
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isNowAccess (node: IdentifierAstNode): boolean {
  return node.name === "now" && typeDescription(node, exactMatch(basicTypes.UINT))
}

/**
 * True if access to block.timestamp via now alias
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isTxOriginAccess (node: MemberAccessAstNode): boolean {
  return isMemberAccess(node, 'address', 'tx', 'tx', 'origin')
}

/**
 * True if access to block.timestamp
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isBlockTimestampAccess (node: MemberAccessAstNode): boolean {
  return isSpecialVariableAccess(node, specialVariables.BLOCKTIMESTAMP)
}

/**
 * True if access to block.blockhash
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isBlockBlockHashAccess (node: FunctionCallAstNode): boolean {
  return isBuiltinFunctionCall(node) && getLocalCallName(node) === 'blockhash'
}

/**
 * True if call to local function via this keyword
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isThisLocalCall (node: MemberAccessAstNode): boolean {
  return isMemberAccess(node, basicRegex.FUNCTIONTYPE, exactMatch('this'), basicRegex.CONTRACTTYPE, undefined)
}

/**
 * True if access to local function via super keyword
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isSuperLocalCall (node: MemberAccessAstNode): boolean {
  return isMemberAccess(node, basicRegex.FUNCTIONTYPE, exactMatch('super'), basicRegex.CONTRACTTYPE, undefined)
}

/**
 * True if call to local function
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isLocalCall (node: FunctionCallAstNode): boolean {
  return node.nodeType === 'FunctionCall' && 
        node.kind === 'functionCall' && 
        node.expression.nodeType === 'Identifier' &&
        expressionTypeDescription(node, basicRegex.FUNCTIONTYPE) &&
        !expressionTypeDescription(node, basicRegex.EXTERNALFUNCTIONTYPE)
}

/**
 * True if low level call (send, call, delegatecall, callcode)
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isLowLevelCall (node: MemberAccessAstNode): boolean {
  return isLLCall(node) ||
          isLLDelegatecall(node) ||
          isLLSend(node)
}

/**
 * True if low level send (solidity >= 0.5)
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
// function isLLSend050 (node: MemberAccessAstNode): boolean {
//   return isMemberAccess(node,
//           exactMatch(util.escapeRegExp(lowLevelCallTypes.SEND.type)),
//           undefined, exactMatch(basicTypes.PAYABLE_ADDRESS), exactMatch(lowLevelCallTypes.SEND.ident))
// }

/**
 * True if low level send (solidity < 0.5)
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isLLSend (node: MemberAccessAstNode): boolean {
  return isMemberAccess(node,
          exactMatch(util.escapeRegExp(lowLevelCallTypes.SEND.type)),
          undefined, exactMatch(basicTypes.PAYABLE_ADDRESS), exactMatch(lowLevelCallTypes.SEND.ident))
}

/**
 * True if low level call
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isLLCall (node: MemberAccessAstNode): boolean {
  return isMemberAccess(node,
          exactMatch(util.escapeRegExp(lowLevelCallTypes.CALL.type)),
          undefined, exactMatch(basicTypes.ADDRESS), exactMatch(lowLevelCallTypes.CALL.ident))
}

/**
 * True if low level payable call (solidity >= 0.5)
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
// function isLLCall050 (node: MemberAccessAstNode): boolean {
//   return isMemberAccess(node,
//           exactMatch(util.escapeRegExp(lowLevelCallTypes['CALL-v0.5'].type)),
//           undefined, exactMatch(basicTypes.PAYABLE_ADDRESS), exactMatch(lowLevelCallTypes['CALL-v0.5'].ident))
// }

/**
 * True if low level callcode
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
// function isLLCallcode (node: MemberAccessAstNode): boolean {
//   return isMemberAccess(node,
//           exactMatch(util.escapeRegExp(lowLevelCallTypes.CALLCODE.type)),
//           undefined, exactMatch(basicTypes.ADDRESS), exactMatch(lowLevelCallTypes.CALLCODE.ident))
// }

/**
 * True if low level delegatecall
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isLLDelegatecall (node: MemberAccessAstNode): boolean {
  return isMemberAccess(node,
          exactMatch(util.escapeRegExp(lowLevelCallTypes.DELEGATECALL.type)),
          undefined, matches(basicTypes.PAYABLE_ADDRESS, basicTypes.ADDRESS), exactMatch(lowLevelCallTypes.DELEGATECALL.ident))
}

/**
 * True if low level delegatecall (solidity >= 0.5)
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
// function isLLDelegatecall050 (node: MemberAccessAstNode): boolean {
//   return isMemberAccess(node,
//           exactMatch(util.escapeRegExp(lowLevelCallTypes.DELEGATECALL.type)),
//           undefined, matches(basicTypes.PAYABLE_ADDRESS, basicTypes.ADDRESS), exactMatch(lowLevelCallTypes.DELEGATECALL.ident))
// }

/**
 * True if transfer call
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isTransfer (node: MemberAccessAstNode): boolean {
  return isMemberAccess(node,
          exactMatch(util.escapeRegExp(lowLevelCallTypes.TRANSFER.type)),
          undefined, matches(basicTypes.ADDRESS, basicTypes.PAYABLE_ADDRESS), exactMatch(lowLevelCallTypes.TRANSFER.ident))
}

function isStringToBytesConversion (node: FunctionCallAstNode): boolean {
  return isExplicitCast(node, util.escapeRegExp('string *'), util.escapeRegExp('bytes'))
}

function isExplicitCast (node: FunctionCallAstNode, castFromType: string, castToType: string): boolean {
  return node.kind === "typeConversion" && 
        nodeType(node.expression, exactMatch(nodeTypes.ELEMENTARYTYPENAMEEXPRESSION)) && node.expression.typeName.name === castToType &&
        nodeType(node.arguments[0], exactMatch(nodeTypes.IDENTIFIER)) && typeDescription(node.arguments[0], castFromType)
}

function isBytesLengthCheck (node: MemberAccessAstNode): boolean {
  return isMemberAccess(node, exactMatch(util.escapeRegExp(basicTypes.UINT)), undefined, util.escapeRegExp('bytes *'), 'length')
}

/**
 * True if it is a loop
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
// function isLoop (node) {
//   return nodeType(node, exactMatch(nodeTypes.FORSTATEMENT)) ||
//           nodeType(node, exactMatch(nodeTypes.WHILESTATEMENT)) ||
//           nodeType(node, exactMatch(nodeTypes.DOWHILESTATEMENT))
// }

/**
 * True if it is a 'for' loop
 * @node {ASTNode} some AstNode
 * @return {bool}
 * TODO: This should be removed once for loop iterates Over dynamic array fixed
 */
// function isForLoop (node) {
//   return nodeType(node, exactMatch(nodeTypes.FORSTATEMENT))
// }

// #################### Complex Node Identification - Private

function isMemberAccess (node: MemberAccessAstNode, retType: string, accessor: string| undefined, accessorType: string, memberName: string | undefined): boolean {
  if(node && nodeType(node, exactMatch('MemberAccess'))) {
    const nodeTypeDef: boolean = typeDescription(node, retType)
    // console.log('MemberAccess typeDef ->',nodeTypeDef)
    const nodeMemName: boolean = memName(node, memberName)
    // console.log('MemberAccess nodeMemName ->',nodeMemName)
    const nodeExpMemName: boolean = memName(node.expression, accessor)
    // console.log('MemberAccess nodeExpMemName ->',nodeExpMemName)
    const nodeExpTypeDef: boolean = expressionTypeDescription(node, accessorType)
    // console.log('MemberAccess nodeExpTypeDef ->',nodeExpTypeDef)
    return nodeTypeDef && nodeMemName && nodeExpTypeDef && nodeExpMemName
  } else return false
}

function isSpecialVariableAccess (node: MemberAccessAstNode, varType: any): boolean {
  return isMemberAccess(node, exactMatch(util.escapeRegExp(varType.type)), varType.obj, varType.obj, varType.member)
}

// #################### Node Identification Primitives

// function nrOfChildren (node, nr) {
//   return (node && (nr === undefined || nr === null)) || (node && nr === 0 && !node.children) || (node && node.children && node.children.length === nr)
// }

// function minNrOfChildren (node, nr) {
//   return (node && (nr === undefined || nr === null)) || (node && nr === 0 && !node.children) || (node && node.children && node.children.length >= nr)
// }

// function expressionType (node, typeRegex) {
//   return  new RegExp(typeRegex).test(node.expression.typeDescriptions.typeString)
// }

function expressionTypeDescription (node: any, typeRegex: string): boolean {
  return  new RegExp(typeRegex).test(node.expression.typeDescriptions.typeString)
}

function typeDescription (node: any, typeRegex: string): boolean {
  return  new RegExp(typeRegex).test(node.typeDescriptions.typeString)
}

function nodeType (node: any, typeRegex: string) {
  return new RegExp(typeRegex).test(node.nodeType)
}

function nodeTypeIn (node: any, typeRegex: string[]){
  return typeRegex.some((typeRegex) => nodeType (node, typeRegex))
}

function memName (node: any, memNameRegex: any) {
  // const regex = new RegExp(memNameRegex)
  return (node && !memNameRegex) || new RegExp(memNameRegex).test(node.name) || new RegExp(memNameRegex).test(node.memberName)
}

function operator (node, opRegex) {
  return new RegExp(opRegex).test(node.operator)
}

// #################### Helpers

function exactMatch (regexStr) {
  return '^' + regexStr + '$'
}

function matches (...fnArgs) {
  const args: any[] = []
  for (let k = 0; k < fnArgs.length; k++) {
    args.push(fnArgs[k])
  }
  return '(' + args.join('|') + ')'
}

/**
 * Builds an function signature as used in the AST of the solc-json AST
 * @param {Array} paramTypes
 *  list of parameter type names
 * @param {Array} returnTypes
 *  list of return type names
 * @return {Boolean} isPayable
 */
function buildFunctionSignature (paramTypes: any[], returnTypes: any[], isPayable: boolean, additionalMods?: any): string {
  return 'function (' + util.concatWithSeperator(paramTypes, ',') + ')' + ((isPayable) ? ' payable' : '') + ((additionalMods) ? ' ' + additionalMods : '') + ((returnTypes.length) ? ' returns (' + util.concatWithSeperator(returnTypes, ',') + ')' : '')
}

function buildAbiSignature (funName: string, paramTypes: any[]): string {
  return funName + '(' + util.concatWithSeperator(paramTypes, ',') + ')'
}

// /**
//  * Finds first node of a certain type under a specific node.
//  * @node {AstNode} node to start form
//  * @type {String} Type the ast node should have
//  * @return {AstNode} null or node found
//  */
// function findFirstSubNodeLTR (node, type) {
//   if (!node || !node.children) return null
//   for (let i = 0; i < node.children.length; ++i) {
//     const item = node.children[i]
//     if (nodeType(item, type)) return item
//     else {
//       const res = findFirstSubNodeLTR(item, type)
//       if (res) return res
//     }
//   }
//   return null
// }

const helpers = {
  // nrOfChildren,
  // minNrOfChildren,
  expressionTypeDescription,
  nodeType,
  memName,
  operator,
  buildFunctionSignature,
  buildAbiSignature
}

export {
  // #################### Trivial Getters
  getType,
  // #################### Complex Getters
  getThisLocalCallName,
  getSuperLocalCallName,
  getFunctionCallType,
  getContractName,
  getEffectedVariableName,
  getDeclaredVariableName,
  getDeclaredVariableType,
  getLocalCallName,
  getInheritsFromName,
  getExternalDirectCallContractName,
  getThisLocalCallContractName,
  getExternalDirectCallMemberName,
  getFunctionDefinitionName,
  getFunctionCallTypeParameterType,
  getLibraryCallContractName,
  getLibraryCallMemberName,
  getFullQualifiedFunctionCallIdent,
  getFullQuallyfiedFuncDefinitionIdent,
  getStateVariableDeclarationsFromContractNode,
  getFunctionOrModifierDefinitionParameterPart,
  getFunctionDefinitionReturnParameterPart,
  getUnAssignedTopLevelBinOps,
  // getLoopBlockStartIndex,

  // #################### Complex Node Identification
  isDeleteOfDynamicArray,
  isDeleteFromDynamicArray,
  isAbiNamespaceCall,
  isSpecialVariableAccess,
  isDynamicArrayAccess,
  isDynamicArrayLengthAccess,
  // isIndexAccess,
  isMappingIndexAccess,
  isSubScopeWithTopLevelUnAssignedBinOp,
  hasFunctionBody,
  isInteraction,
  isEffect,
  isTxOriginAccess,
  isNowAccess,
  isBlockTimestampAccess,
  isBlockBlockHashAccess,
  isThisLocalCall,
  isSuperLocalCall,
  isLibraryCall,
  isLocalCallGraphRelevantNode,
  isLocalCall,
  isWriteOnStateVariable,
  isStateVariable,
  isTransfer,
  isLowLevelCall,
  isLLCall,
  // isLLCallcode as isLowLevelCallcodeInst,
  isLLDelegatecall,
  isLLSend,
  isExternalDirectCall,
  isFullyImplementedContract,
  isLibrary,
  isCallToNonConstLocalFunction,
  isPlusPlusUnaryOperation,
  isMinusMinusUnaryOperation,
  isBuiltinFunctionCall,
  isSelfdestructCall,
  isAssertCall,
  isRequireCall,
  isIntDivision,
  isStringToBytesConversion,
  isBytesLengthCheck,
  // isForLoop,

  // #################### Trivial Node Identification
  isDeleteUnaryOperation,
  // isFunctionDefinition,
  // isModifierDefinition,
  // isInheritanceSpecifier,
  // isModifierInvocation,
  // isVariableDeclaration,
  isStorageVariableDeclaration,
  // isAssignment,
  // isContractDefinition,
  isConstantFunction,
  isPayableFunction,
  isConstructor,
  // isInlineAssembly,
  // isNewExpression,
  // isReturn,
  isStatement,
  // isExpressionStatement,
  // isBlock,
  // isBinaryOperation,

  // #################### Constants
  nodeTypes,
  basicTypes,
  basicFunctionTypes,
  lowLevelCallTypes,
  specialVariables,
  helpers
}
