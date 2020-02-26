'use strict'

import { FunctionDefinitionAstNode, ModifierDefinitionAstNode, ParameterListAstNode, CommonAstNode, ForStatementAstNode, WhileStatementAstNode, VariableDeclarationAstNode, ContractDefinitionAstNode, InheritanceSpecifierAstNode, MemberAccessAstNode, BinaryOperationAstNode, FunctionCallAstNode, ExpressionStatementAstNode, UnaryOperationAstNode, IdentifierAstNode, MappingAstNode, IndexAccessAstNode } from "types"

const remixLib = require('remix-lib')
const util = remixLib.util

const nodeTypes = {
  IDENTIFIER: 'Identifier',
  MEMBERACCESS: 'MemberAccess',
  FUNCTIONCALL: 'FunctionCall',
  FUNCTIONDEFINITION: 'FunctionDefinition',
  VARIABLEDECLARATION: 'VariableDeclaration',
  ASSIGNMENT: 'Assignment',
  CONTRACTDEFINITION: 'ContractDefinition',
  UNARYOPERATION: 'UnaryOperation',
  BINARYOPERATION: 'BinaryOperation',
  EXPRESSIONSTATEMENT: 'ExpressionStatement',
  MODIFIERDEFINITION: 'ModifierDefinition',
  MODIFIERINVOCATION: 'ModifierInvocation',
  INHERITANCESPECIFIER: 'InheritanceSpecifier',
  USERDEFINEDTYPENAME: 'UserDefinedTypeName',
  INLINEASSEMBLY: 'InlineAssembly',
  BLOCK: 'Block',
  NEWEXPRESSION: 'NewExpression',
  RETURN: 'Return',
  IFSTATEMENT: 'IfStatement',
  FORSTATEMENT: 'ForStatement',
  WHILESTATEMENT: 'WhileStatement',
  DOWHILESTATEMENT: 'DoWhileStatement',
  ELEMENTARYTYPENAMEEXPRESSION: 'ElementaryTypeNameExpression'
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
  REFTYPE: '( storage )|(mapping\\()|(\\[\\])',
  FUNCTIONSIGNATURE: '^function \\(([^\\(]*)\\)',
  LIBRARYTYPE: '^type\\(library (.*)\\)'
}

const basicFunctionTypes = {
  SEND: buildFunctionSignature([basicTypes.UINT], [basicTypes.BOOL], false),
  CALL: buildFunctionSignature([], [basicTypes.BOOL], true),
  'CALL-v0.5': buildFunctionSignature([basicTypes.BYTES_MEM], [basicTypes.BOOL, basicTypes.BYTES_MEM], true),
  DELEGATECALL: buildFunctionSignature([], [basicTypes.BOOL], false),
  'DELEGATECALL-v0.5': buildFunctionSignature([basicTypes.BYTES_MEM], [basicTypes.BOOL, basicTypes.BYTES_MEM], false),
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
  'blockhash(uint)': true,
  'address(address)': true
}

const lowLevelCallTypes = {
  CALL: { ident: 'call', type: basicFunctionTypes.CALL },
  'CALL-v0.5': { ident: 'call', type: basicFunctionTypes['CALL-v0.5'] },
  CALLCODE: { ident: 'callcode', type: basicFunctionTypes.CALL },
  DELEGATECALL: { ident: 'delegatecall', type: basicFunctionTypes.DELEGATECALL },
  'DELEGATECALL-v0.5': { ident: 'delegatecall', type: basicFunctionTypes['DELEGATECALL-v0.5'] },
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

function getType (node: CommonAstNode) {
  return node.nodeType
}

// #################### Complex Getters

/**
 * Returns the type parameter of function call AST nodes. Throws if not a function call node
 * @func {ASTNode} Function call node
 * @return {string} type of function call
 */
function getFunctionCallType (func) {
  if (!(isExternalDirectCall(func) || isThisLocalCall(func) || isSuperLocalCall(func) || isLocalCall(func) || isLibraryCall(func))) throw new Error('staticAnalysisCommon.js: not function call Node')
  if (isExternalDirectCall(func) || isThisLocalCall(func) || isSuperLocalCall(func) || isLibraryCall(func)) return func.attributes.type
  return findFirstSubNodeLTR(func, exactMatch(nodeTypes.IDENTIFIER)).attributes.type
}

/**
 * Get the variable name written to by a effect node, except for inline assembly because there is no information to find out where we write to. Trows if not a effect node or is inlineassmbly.
 * Example: x = 10; => x
 * @effectNode {ASTNode} Function call node
 * @return {string} variable name written to
 */
function getEffectedVariableName (effectNode) {
  if (!isEffect(effectNode) || effectNode.nodeType === "InlineAssembly") throw new Error('staticAnalysisCommon.js: not an effect Node or inline assembly')
  return findFirstSubNodeLTR(effectNode, exactMatch(nodeTypes.IDENTIFIER)).attributes.value
}

/**
 * Returns the identifier of a local call, Throws on wrong node.
 * Example: f(103) => f
 * @localCallNode {ASTNode} Function call node
 * @return {string} name of the function called
 */
function getLocalCallName (localCallNode) {
  if (!isLocalCall(localCallNode) && !isAbiNamespaceCall(localCallNode)) throw new Error('staticAnalysisCommon.js: not an local call Node')
  return localCallNode.children[0].attributes.value
}

/**
 * Returns the identifier of a this local call, Throws on wrong node.
 * Example: this.f(103) => f
 * @localCallNode {ASTNode} Function call node
 * @return {string} name of the function called
 */
function getThisLocalCallName (localCallNode) {
  if (!isThisLocalCall(localCallNode)) throw new Error('staticAnalysisCommon.js: not an this local call Node')
  return localCallNode.attributes.value
}

/**
 * Returns the identifier of a super local call, Throws on wrong node.
 * Example: super.f(103) => f
 * @localCallNode {ASTNode} Function call node
 * @return {string} name of the function called
 */
function getSuperLocalCallName (localCallNode) {
  if (!isSuperLocalCall(localCallNode)) throw new Error('staticAnalysisCommon.js: not an super local call Node')
  return localCallNode.attributes.member_name
}

/**
 * Returns the contract type of a external direct call, Throws on wrong node.
 * Example:
 *  foo x = foo(0xdeadbeef...);
 *  x.f(103) => foo
 * @extDirectCall {ASTNode} Function call node
 * @return {string} name of the contract the function is defined in
 */
function getExternalDirectCallContractName (extDirectCall) {
  if (!isExternalDirectCall(extDirectCall)) throw new Error('staticAnalysisCommon.js: not an external direct call Node')
  return extDirectCall.children[0].attributes.type.replace(new RegExp(basicRegex.CONTRACTTYPE), '')
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
function getThisLocalCallContractName (thisLocalCall) {
  if (!isThisLocalCall(thisLocalCall)) throw new Error('staticAnalysisCommon.js: not an this local call Node')
  return thisLocalCall.children[0].attributes.type.replace(new RegExp(basicRegex.CONTRACTTYPE), '')
}

/**
 * Returns the function identifier of a external direct call, Throws on wrong node.
 * Example:
 *  foo x = foo(0xdeadbeef...);
 *  x.f(103) => f
 * @extDirectCall {ASTNode} Function call node
 * @return {string} name of the function called
 */
function getExternalDirectCallMemberName (extDirectCall) {
  if (!isExternalDirectCall(extDirectCall)) throw new Error('staticAnalysisCommon.js: not an external direct call Node')
  return extDirectCall.attributes.member_name
}

/**
 * Returns the name of a contract, Throws on wrong node.
 * Example:
 *   Contract foo { => foo
 * @contract {ASTNode} Contract Definition node
 * @return {string} name of a contract defined
 */
function getContractName (contract: ContractDefinitionAstNode) {
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
function getInheritsFromName (inheritsNode: InheritanceSpecifierAstNode) {
  return inheritsNode.baseName
}

/**
 * Returns the identifier of a variable definition, Throws on wrong node.
 * Example:
 *   var x = 10; => x
 * @varDeclNode {ASTNode} Variable declaration node
 * @return {string} variable name
 */
function getDeclaredVariableName (varDeclNode: VariableDeclarationAstNode) {
  return varDeclNode.name
}

/**
 * Returns the type of a variable definition, Throws on wrong node.
 * Example:
 *   var x = 10; => x
 * @varDeclNode {ASTNode} Variable declaration node
 * @return {string} variable type
 */
function getDeclaredVariableType (varDeclNode: VariableDeclarationAstNode) {
  return varDeclNode.typeName
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
function getStateVariableDeclarationsFormContractNode (contractNode: ContractDefinitionAstNode): CommonAstNode[] {
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
function getFunctionCallTypeParameterType (func) {
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
function getLibraryCallContractName (funcCall) {
  if (!isLibraryCall(funcCall)) throw new Error('staticAnalysisCommon.js: not an this library call Node')
  const types = new RegExp(basicRegex.LIBRARYTYPE).exec(funcCall.children[0].attributes.type)
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
function getLibraryCallMemberName (funcCall) {
  // if (!isLibraryCall(funcCall)) throw new Error('staticAnalysisCommon.js: not an library call Node')
  return funcCall.attributes.member_name
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
function getFullQualifiedFunctionCallIdent (contract, func) {
  if (isLocalCall(func)) return getContractName(contract) + '.' + getLocalCallName(func) + '(' + getFunctionCallTypeParameterType(func) + ')'
  else if (isThisLocalCall(func)) return getThisLocalCallContractName(func) + '.' + getThisLocalCallName(func) + '(' + getFunctionCallTypeParameterType(func) + ')'
  else if (isSuperLocalCall(func)) return getContractName(contract) + '.' + getSuperLocalCallName(func) + '(' + getFunctionCallTypeParameterType(func) + ')'
  else if (isExternalDirectCall(func)) return getExternalDirectCallContractName(func) + '.' + getExternalDirectCallMemberName(func) + '(' + getFunctionCallTypeParameterType(func) + ')'
  else if (isLibraryCall(func)) return getLibraryCallContractName(func) + '.' + getLibraryCallMemberName(func) + '(' + getFunctionCallTypeParameterType(func) + ')'
  else throw new Error('staticAnalysisCommon.js: Can not get function name form non function call node')
}

function getFullQuallyfiedFuncDefinitionIdent (contract, func, paramTypes) {
  return getContractName(contract) + '.' + getFunctionDefinitionName(func) + '(' + util.concatWithSeperator(paramTypes, ',') + ')'
}

function getUnAssignedTopLevelBinOps (subScope) {
  return subScope.children.filter(isBinaryOpInExpression)
}

function getLoopBlockStartIndex (node: ForStatementAstNode | WhileStatementAstNode): 3|1 {
    return node.nodeType === "ForStatement" ? 3 : 1
}

// #################### Trivial Node Identification

function isStatement (node: CommonAstNode) {
  return nodeType(node, 'Statement$') || node.nodeType === "Block" || node.nodeType === "Return"
}

/**
 * True if is binaryop
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isBinaryOperation (node) {
  return nodeType(node, exactMatch(nodeTypes.BINARYOPERATION))
}

// #################### Complex Node Identification

/**
 * True if function defintion has function body
 * @funcNode {ASTNode} function defintion node
 * @return {bool}
 */
function hasFunctionBody (funcNode: FunctionDefinitionAstNode) {
  return funcNode.body != null
}

/**
 * True if node is a delete instruction of a dynamic array
 * @node {ASTNode} node to check for
 * @return {bool}
 */
function isDeleteOfDynamicArray (node: UnaryOperationAstNode) {
  return isDeleteUnaryOperation(node) && isDynamicArrayAccess(node.subExpression)
}

/**
 * True if node is node is a ref to a dynamic array
 * @node {ASTNode} node to check for
 * @return {bool}
 */
function isDynamicArrayAccess (node: IdentifierAstNode) {
  return typeDescription(node, '[] storage ref') || typeDescription(node, 'bytes storage ref') || typeDescription(node, 'string storage ref')
}

/**
 * True if node accesses 'length' member of dynamic array
 * @node {ASTNode} node to check for
 * @return {bool}
 */
function isDynamicArrayLengthAccess (node: MemberAccessAstNode) {
  return (node.memberName === 'length') && // accessing 'length' member
  node.expression['typeDescriptions']['typeString'].indexOf('[]') !== -1 // member is accessed from dynamic array, notice [] without any number
}

/**
 * True if node is a delete instruction for an element from a dynamic array
 * @node {ASTNode} node to check for
 * @return {bool}
 */
function isDeleteFromDynamicArray (node) {
  return isDeleteUnaryOperation(node) && isIndexAccess(node.children[0])
}

/**
 * True if node is the access of an index
 * @node {ASTNode} node to check for
 * @return {bool}
 */
function isIndexAccess (node) {
  return node && node.name === 'IndexAccess'
}

/**
 * True if node is the access of a mapping index
 * @node {ASTNode} node to check for
 * @return {bool}
 */
function isMappingIndexAccess (node) {
  return isIndexAccess(node) && node.children && node.children[0].attributes.type.startsWith('mapping')
}

/**
 * True if call to code within the current contracts context including (delegate) library call
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isLocalCallGraphRelevantNode (node) {
  return ((isLocalCall(node) || isSuperLocalCall(node) || isLibraryCall(node)) && !isBuiltinFunctionCall(node))
}

/**
 * True if is builtin function like assert, sha3, erecover, ...
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isBuiltinFunctionCall (node) {
  return (isLocalCall(node) && builtinFunctions[getLocalCallName(node) + '(' + getFunctionCallTypeParameterType(node) + ')'] === true) || isAbiNamespaceCall(node)
}

/**
 * True if is builtin function like assert, sha3, erecover, ...
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isAbiNamespaceCall (node) {
  return Object.keys(abiNamespace).some((key) => abiNamespace.hasOwnProperty(key) && node.children && node.children[0] && isSpecialVariableAccess(node.children[0], abiNamespace[key]))
}

/**
 * True if node is a call to selfdestruct
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isSelfdestructCall (node) {
  return isBuiltinFunctionCall(node) && getLocalCallName(node) === 'selfdestruct'
}

/**
 * True if node is a call to builtin assert(bool)
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isAssertCall (node) {
  return isBuiltinFunctionCall(node) && getLocalCallName(node) === 'assert'
}

/**
 * True if node is a call to builtin require(bool)
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isRequireCall (node) {
  return isBuiltinFunctionCall(node) && getLocalCallName(node) === 'require'
}

/**
 * True if is storage variable declaration
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isStorageVariableDeclaration (node: VariableDeclarationAstNode): boolean {
  return expressionType(node, basicRegex.REFTYPE)
}

/**
 * True if is interaction with external contract (change in context, no delegate calls) (send, call of other contracts)
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isInteraction (node) {
  return isLLCall(node) || isLLSend(node) || isExternalDirectCall(node) || isTransfer(node) || isLLCall050(node) || isLLSend050(node)
}

/**
 * True if node changes state of a variable or is inline assembly (does not include check if it is a global state change, on a state variable)
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isEffect (node) {
  return node.nodeType === "Assignment" || isPlusPlusUnaryOperation(node) || isMinusMinusUnaryOperation(node) || node.nodeType === "InlineAssembly"
}

/**
 * True if node changes state of a variable or is inline assembly (Checks if variable is a state variable via provided list)
 * @node {ASTNode} some AstNode
 * @node {list Variable declaration} state variable declaration currently in scope
 * @return {bool}
 */
function isWriteOnStateVariable (effectNode, stateVariables) {
  return effectNode.nodeType === "InlineAssembly" || (isEffect(effectNode) && isStateVariable(getEffectedVariableName(effectNode), stateVariables))
}

/**
 * True if there is a variable with name, name in stateVariables
 * @node {ASTNode} some AstNode
 * @node {list Variable declaration} state variable declaration currently in scope
 * @return {bool}
 */
function isStateVariable (name, stateVariables) {
  return stateVariables.some((item) => name === getDeclaredVariableName(item))
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
function isIntDivision (node: BinaryOperationAstNode) {
  return operator(node, exactMatch(util.escapeRegExp('/'))) && typeDescription(node.rightExpression, util.escapeRegExp('int'))
}

/**
 * True if is block / SubScope has top level binops (e.g. that are not assigned to anything, most of the time confused compare instead of assign)
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isSubScopeWithTopLevelUnAssignedBinOp (node) {
  return nodeType(node, exactMatch(nodeTypes.BLOCK)) && node.children && node.children.some(isBinaryOpInExpression) ||
          isSubScopeStatement(node) && node.children && node.children.some(isBinaryOpInExpression) // Second Case for if without braces
}

function isSubScopeStatement (node) {
  return (nodeType(node, exactMatch(nodeTypes.IFSTATEMENT)) ||
            nodeType(node, exactMatch(nodeTypes.FORSTATEMENT)) ||
            nodeType(node, exactMatch(nodeTypes.WHILESTATEMENT)) ||
            nodeType(node, exactMatch(nodeTypes.DOWHILESTATEMENT))) &&
            !nodeType(node.children[1], exactMatch(nodeTypes.BLOCK))
}

/**
 * True if binary operation inside of expression statement
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isBinaryOpInExpression (node: ExpressionStatementAstNode) {
  return node.nodeType === "ExpressionStatement" && node.expression.nodeType === "BinaryOperation"
}

/**
 * True if unary increment operation
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isPlusPlusUnaryOperation (node: UnaryOperationAstNode) {
  return node.operator === '++'
}

/**
 * True if unary delete operation
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isDeleteUnaryOperation (node: UnaryOperationAstNode) {
  return node.operator === 'delete'
}

/**
 * True if unary decrement operation
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isMinusMinusUnaryOperation (node: UnaryOperationAstNode) {
  return node.operator === '--'
}

/**
 * True if all functions on a contract are implemented
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isFullyImplementedContract (node: ContractDefinitionAstNode) {
  return node.fullyImplemented === true
}

/**
 * True if it is a library contract defintion
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isLibrary (node: ContractDefinitionAstNode) {
  return node.contractKind === 'library'
}

/**
 * True if it is a local call to non const function
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isCallToNonConstLocalFunction (node: FunctionCallAstNode) {
  return isLocalCall(node) && !expressionType(node, basicRegex.CONSTANTFUNCTIONTYPE)
}

/**
 * True if it is a call to a library
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isLibraryCall (node: MemberAccessAstNode) {
  return isMemberAccess(node, basicRegex.FUNCTIONTYPE, undefined, basicRegex.LIBRARYTYPE, undefined)
}

/**
 * True if it is an external call via defined interface (not low level call)
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isExternalDirectCall (node: MemberAccessAstNode) {
  return isMemberAccess(node, basicRegex.EXTERNALFUNCTIONTYPE, undefined, basicRegex.CONTRACTTYPE, undefined) && !isThisLocalCall(node) && !isSuperLocalCall(node)
}

/**
 * True if access to block.timestamp via now alias
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isNowAccess (node: IdentifierAstNode) {
  return node.name === "now" && typeDescription(node, exactMatch(basicTypes.UINT))
}

/**
 * True if access to block.timestamp
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isBlockTimestampAccess (node: MemberAccessAstNode) {
  return isSpecialVariableAccess(node, specialVariables.BLOCKTIMESTAMP)
}

/**
 * True if access to block.blockhash
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isBlockBlockHashAccess (node: MemberAccessAstNode) {
  return isSpecialVariableAccess(node, specialVariables.BLOCKHASH) || isBuiltinFunctionCall(node) && getLocalCallName(node) === 'blockhash'
}

/**
 * True if call to local function via this keyword
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isThisLocalCall (node: MemberAccessAstNode) {
  return isMemberAccess(node, basicRegex.FUNCTIONTYPE, exactMatch('this'), basicRegex.CONTRACTTYPE, undefined)
}

/**
 * True if access to local function via super keyword
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isSuperLocalCall (node: MemberAccessAstNode) {
  return isMemberAccess(node, basicRegex.FUNCTIONTYPE, exactMatch('super'), basicRegex.CONTRACTTYPE, undefined)
}

/**
 * True if call to local function
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isLocalCall (node: FunctionCallAstNode) {
  return node.kind === 'functionCall' && 
        node.expression.nodeType === 'Identifier' &&
        expressionTypeDescription(node, basicRegex.FUNCTIONTYPE) &&
        !expressionTypeDescription(node, basicRegex.FUNCTIONTYPE)
}

/**
 * True if low level call (send, call, delegatecall, callcode)
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isLowLevelCall (node) {
  return isLLCall(node) ||
          isLLCallcode(node) ||
          isLLDelegatecall(node) ||
          isLLSend(node) ||
          isLLSend050(node) ||
          isLLCall050(node) ||
          isLLDelegatecall050(node)
}

/**
 * True if low level send (solidity >= 0.5)
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isLLSend050 (node: MemberAccessAstNode) {
  return isMemberAccess(node,
          exactMatch(util.escapeRegExp(lowLevelCallTypes.SEND.type)),
          undefined, exactMatch(basicTypes.PAYABLE_ADDRESS), exactMatch(lowLevelCallTypes.SEND.ident))
}

/**
 * True if low level send (solidity < 0.5)
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isLLSend (node: MemberAccessAstNode) {
  return isMemberAccess(node,
          exactMatch(util.escapeRegExp(lowLevelCallTypes.SEND.type)),
          undefined, exactMatch(basicTypes.ADDRESS), exactMatch(lowLevelCallTypes.SEND.ident))
}

/**
 * True if low level call
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isLLCall (node: MemberAccessAstNode) {
  return isMemberAccess(node,
          exactMatch(util.escapeRegExp(lowLevelCallTypes.CALL.type)),
          undefined, exactMatch(basicTypes.ADDRESS), exactMatch(lowLevelCallTypes.CALL.ident))
}

/**
 * True if low level payable call (solidity >= 0.5)
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isLLCall050 (node: MemberAccessAstNode) {
  return isMemberAccess(node,
          exactMatch(util.escapeRegExp(lowLevelCallTypes['CALL-v0.5'].type)),
          undefined, exactMatch(basicTypes.PAYABLE_ADDRESS), exactMatch(lowLevelCallTypes['CALL-v0.5'].ident))
}

/**
 * True if low level callcode
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isLLCallcode (node: MemberAccessAstNode) {
  return isMemberAccess(node,
          exactMatch(util.escapeRegExp(lowLevelCallTypes.CALLCODE.type)),
          undefined, exactMatch(basicTypes.ADDRESS), exactMatch(lowLevelCallTypes.CALLCODE.ident))
}

/**
 * True if low level delegatecall
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isLLDelegatecall (node: MemberAccessAstNode) {
  return isMemberAccess(node,
          exactMatch(util.escapeRegExp(lowLevelCallTypes.DELEGATECALL.type)),
          undefined, exactMatch(basicTypes.ADDRESS), exactMatch(lowLevelCallTypes.DELEGATECALL.ident))
}

/**
 * True if low level delegatecall (solidity >= 0.5)
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isLLDelegatecall050 (node: MemberAccessAstNode) {
  return isMemberAccess(node,
          exactMatch(util.escapeRegExp(lowLevelCallTypes['DELEGATECALL-v0.5'].type)),
          undefined, matches(basicTypes.PAYABLE_ADDRESS, basicTypes.ADDRESS), exactMatch(lowLevelCallTypes['DELEGATECALL-v0.5'].ident))
}

/**
 * True if transfer call
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isTransfer (node: MemberAccessAstNode) {
  return isMemberAccess(node,
          exactMatch(util.escapeRegExp(lowLevelCallTypes.TRANSFER.type)),
          undefined, matches(basicTypes.ADDRESS, basicTypes.PAYABLE_ADDRESS), exactMatch(lowLevelCallTypes.TRANSFER.ident))
}

function isStringToBytesConversion (node) {
  return isExplicitCast(node, util.escapeRegExp('string *'), util.escapeRegExp('bytes'))
}

function isExplicitCast (node: FunctionCallAstNode, castFromType: string, castToType: string) {
  return node.kind === "typeConversion" && 
        nodeType(node.expression, exactMatch(nodeTypes.ELEMENTARYTYPENAMEEXPRESSION)) && node.expression.typeName.name === castToType &&
        nodeType(node.arguments[0], exactMatch(nodeTypes.IDENTIFIER)) && typeDescription(node.arguments[0], castFromType)
}

function isBytesLengthCheck (node: MemberAccessAstNode) {
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

function isMemberAccess (node: MemberAccessAstNode, retType: string, accessor: string| undefined, accessorType, memberName: string | undefined) {
  return nodeType(node, exactMatch(nodeTypes.MEMBERACCESS)) &&
        expressionType(node, retType) &&
        memName(node, memberName) &&
        memName(node.expression, accessor) &&
        expressionType(node.expression, accessorType)
}

function isSpecialVariableAccess (node: MemberAccessAstNode, varType) {
  return isMemberAccess(node, exactMatch(util.escapeRegExp(varType.type)), varType.obj, varType.obj, varType.member)
}

// #################### Node Identification Primitives

// function nrOfChildren (node, nr) {
//   return (node && (nr === undefined || nr === null)) || (node && nr === 0 && !node.children) || (node && node.children && node.children.length === nr)
// }

// function minNrOfChildren (node, nr) {
//   return (node && (nr === undefined || nr === null)) || (node && nr === 0 && !node.children) || (node && node.children && node.children.length >= nr)
// }

function expressionType (node, typeRegex) {
  return  new RegExp(typeRegex).test(node.expression.typeDescriptions.typeString)
}

function expressionTypeDescription (node, typeRegex) {
  return  new RegExp(typeRegex).test(node.expression.typeDescriptions.typeString)
}

function typeDescription (node, typeRegex) {
  return  new RegExp(typeRegex).test(node.typeDescriptions.typeString)
}

function nodeType (node, typeRegex) {
  return new RegExp(typeRegex).test(node.nodeType)
}

function memName (node, memNameRegex) {
  const regex = new RegExp(memNameRegex)
  return (node && !memNameRegex) || (node && node.attributes && (regex.test(node.attributes.value) || regex.test(node.attributes.member_name)))
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
function buildFunctionSignature (paramTypes, returnTypes, isPayable, additionalMods?) {
  return 'function (' + util.concatWithSeperator(paramTypes, ',') + ')' + ((isPayable) ? ' payable' : '') + ((additionalMods) ? ' ' + additionalMods : '') + ((returnTypes.length) ? ' returns (' + util.concatWithSeperator(returnTypes, ',') + ')' : '')
}

function buildAbiSignature (funName, paramTypes) {
  return funName + '(' + util.concatWithSeperator(paramTypes, ',') + ')'
}

/**
 * Finds first node of a certain type under a specific node.
 * @node {AstNode} node to start form
 * @type {String} Type the ast node should have
 * @return {AstNode} null or node found
 */
function findFirstSubNodeLTR (node, type) {
  if (!node || !node.children) return null
  for (let i = 0; i < node.children.length; ++i) {
    const item = node.children[i]
    if (nodeType(item, type)) return item
    else {
      const res = findFirstSubNodeLTR(item, type)
      if (res) return res
    }
  }
  return null
}

const helpers = {
  // nrOfChildren,
  // minNrOfChildren,
  expressionType,
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
  getStateVariableDeclarationsFormContractNode,
  getFunctionOrModifierDefinitionParameterPart,
  getFunctionDefinitionReturnParameterPart,
  getUnAssignedTopLevelBinOps,
  getLoopBlockStartIndex,

  // #################### Complex Node Identification
  isDeleteOfDynamicArray,
  isDeleteFromDynamicArray,
  isAbiNamespaceCall,
  isSpecialVariableAccess,
  isDynamicArrayAccess,
  isDynamicArrayLengthAccess,
  isIndexAccess,
  isMappingIndexAccess,
  isSubScopeWithTopLevelUnAssignedBinOp,
  hasFunctionBody,
  isInteraction,
  isEffect,
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
  isLLCall as isLowLevelCallInst,
  isLLCall050 as isLowLevelCallInst050,
  isLLSend050 as isLowLevelSendInst050,
  isLLDelegatecall050 as isLLDelegatecallInst050,
  isLLCallcode as isLowLevelCallcodeInst,
  isLLDelegatecall as isLowLevelDelegatecallInst,
  isLLSend as isLowLevelSendInst,
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
  isBinaryOperation,

  // #################### Constants
  nodeTypes,
  basicTypes,
  basicFunctionTypes,
  lowLevelCallTypes,
  specialVariables,
  helpers
}
