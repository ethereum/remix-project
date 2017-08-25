'use strict'

var utils = require('../../../lib/utils')

var nodeTypes = {
  IDENTIFIER: 'Identifier',
  MEMBERACCESS: 'MemberAccess',
  FUNCTIONCALL: 'FunctionCall',
  FUNCTIONDEFINITION: 'FunctionDefinition',
  VARIABLEDECLARATION: 'VariableDeclaration',
  ASSIGNMENT: 'Assignment',
  CONTRACTDEFINITION: 'ContractDefinition',
  UNARYOPERATION: 'UnaryOperation',
  EXPRESSIONSTATEMENT: 'ExpressionStatement',
  MODIFIERDEFINITION: 'ModifierDefinition',
  MODIFIERINVOCATION: 'ModifierInvocation',
  INHERITANCESPECIFIER: 'InheritanceSpecifier',
  USERDEFINEDTYPENAME: 'UserDefinedTypeName',
  INLINEASSEMBLY: 'InlineAssembly',
  BLOCK: 'Block',
  NEWEXPRESSION: 'NewExpression'
}

var basicTypes = {
  UINT: 'uint256',
  BOOL: 'bool',
  ADDRESS: 'address',
  BYTES32: 'bytes32'
}

var basicRegex = {
  CONTRACTTYPE: '^contract ',
  FUNCTIONTYPE: '^function \\(',
  EXTERNALFUNCTIONTYPE: '^function \\(.*\\).* external',
  CONSTANTFUNCTIONTYPE: '^function \\(.*\\).* (constant|view|pure)',
  REFTYPE: '( storage )|(mapping\\()|(\\[\\])',
  FUNCTIONSIGNATURE: '^function \\(([^\\(]*)\\)',
  LIBRARYTYPE: '^type\\(library (.*)\\)'
}

var basicFunctionTypes = {
  SEND: buildFunctionSignature([basicTypes.UINT], [basicTypes.BOOL], false),
  CALL: buildFunctionSignature([], [basicTypes.BOOL], true),
  DELEGATECALL: buildFunctionSignature([], [basicTypes.BOOL], false),
  TRANSFER: buildFunctionSignature([basicTypes.UINT], [], false)
}

var builtinFunctions = {
  'keccak256()': true,
  'sha3()': true,
  'sha256()': true,
  'ripemd160()': true,
  'ecrecover(bytes32,uint8,bytes32,bytes32)': true,
  'addmod(uint256,uint256,uint256)': true,
  'mulmod(uint256,uint256,uint256)': true,
  'selfdestruct(address)': true,
  'revert()': true,
  'assert(bool)': true,
  'require(bool)': true
}

var lowLevelCallTypes = {
  CALL: { ident: 'call', type: basicFunctionTypes.CALL },
  CALLCODE: { ident: 'callcode', type: basicFunctionTypes.CALL },
  DELEGATECALL: { ident: 'delegatecall', type: basicFunctionTypes.DELEGATECALL },
  SEND: { ident: 'send', type: basicFunctionTypes.SEND },
  TRANSFER: { ident: 'transfer', type: basicFunctionTypes.TRANSFER }
}

var specialVariables = {
  BLOCKTIMESTAMP: { obj: 'block', member: 'timestamp', type: basicTypes.UINT },
  BLOCKHASH: {
    obj: 'block',
    member: 'blockhash',
    type: buildFunctionSignature([basicTypes.UINT], [basicTypes.BYTES32], false)
  }
}

// #################### Trivial Getters

function getType (node) {
  return node.attributes.type
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
  if (!isEffect(effectNode) || isInlineAssembly(effectNode)) throw new Error('staticAnalysisCommon.js: not an effect Node or inline assembly')
  return findFirstSubNodeLTR(effectNode, exactMatch(nodeTypes.IDENTIFIER)).attributes.value
}

/**
 * Returns the identifier of a local call, Throws on wrong node.
 * Example: f(103) => f
 * @localCallNode {ASTNode} Function call node
 * @return {string} name of the function called
 */
function getLocalCallName (localCallNode) {
  if (!isLocalCall(localCallNode)) throw new Error('staticAnalysisCommon.js: not an local call Node')
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
function getContractName (contract) {
  if (!isContractDefinition(contract)) throw new Error('staticAnalysisCommon.js: not an contractDefinition Node')
  return contract.attributes.name
}

/**
 * Returns the name of a function definition, Throws on wrong node.
 * Example:
 *   func foo(uint bla) { => foo
 * @funcDef {ASTNode} Function Definition node
 * @return {string} name of a function defined
 */
function getFunctionDefinitionName (funcDef) {
  if (!isFunctionDefinition(funcDef)) throw new Error('staticAnalysisCommon.js: not an functionDefinition Node')
  return funcDef.attributes.name
}

/**
 * Returns the identifier of an inheritance specifier, Throws on wrong node.
 * Example:
 *   contract KingOfTheEtherThrone is b { => b
 * @func {ASTNode} Inheritance specifier
 * @return {string} name of contract inherited from
 */
function getInheritsFromName (inheritsNode) {
  if (!isInheritanceSpecifier(inheritsNode)) throw new Error('staticAnalysisCommon.js: not an InheritanceSpecifier node Node')
  return inheritsNode.children[0].attributes.name
}

/**
 * Returns the identifier of a variable definition, Throws on wrong node.
 * Example:
 *   var x = 10; => x
 * @varDeclNode {ASTNode} Variable declaration node
 * @return {string} variable name
 */
function getDeclaredVariableName (varDeclNode) {
  if (!isVariableDeclaration(varDeclNode)) throw new Error('staticAnalysisCommon.js: not an variable declaration')
  return varDeclNode.attributes.name
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
function getStateVariableDeclarationsFormContractNode (contractNode) {
  if (!isContractDefinition(contractNode)) throw new Error('staticAnalysisCommon.js: not an contract definition declaration')
  if (!contractNode.children) return []
  return contractNode.children.filter((el) => isVariableDeclaration(el))
}

/**
 * Returns parameter node for a function or modifier definition, Throws on wrong node.
 * Example:
 * function bar(uint a, uint b) => uint a, uint b
 * @funcNode {ASTNode} Contract Definition node
 * @return {parameterlist node} parameterlist node
 */
function getFunctionOrModifierDefinitionParameterPart (funcNode) {
  if (!isFunctionDefinition(funcNode) && !isModifierDefinition(funcNode)) throw new Error('staticAnalysisCommon.js: not an function definition')
  return funcNode.children[0]
}

/**
 * Extracts the parameter types for a function type signature
 * Example:
 * function(uint a, uint b) returns (bool) => uint a, uint b
 * @func {ASTNode} function call node
 * @return {string} parameter signature
 */
function getFunctionCallTypeParameterType (func) {
  return new RegExp(basicRegex.FUNCTIONSIGNATURE).exec(getFunctionCallType(func))[1]
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
  return new RegExp(basicRegex.LIBRARYTYPE).exec(funcCall.children[0].attributes.type)[1]
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
  if (!isLibraryCall(funcCall)) throw new Error('staticAnalysisCommon.js: not an library call Node')
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
  return getContractName(contract) + '.' + getFunctionDefinitionName(func) + '(' + utils.concatWithSeperator(paramTypes, ',') + ')'
}

// #################### Trivial Node Identification

function isFunctionDefinition (node) {
  return nodeType(node, exactMatch(nodeTypes.FUNCTIONDEFINITION))
}

function isModifierDefinition (node) {
  return nodeType(node, exactMatch(nodeTypes.MODIFIERDEFINITION))
}

function isModifierInvocation (node) {
  return nodeType(node, exactMatch(nodeTypes.MODIFIERINVOCATION))
}

function isVariableDeclaration (node) {
  return nodeType(node, exactMatch(nodeTypes.VARIABLEDECLARATION))
}

function isInheritanceSpecifier (node) {
  return nodeType(node, exactMatch(nodeTypes.INHERITANCESPECIFIER))
}

function isAssignment (node) {
  return nodeType(node, exactMatch(nodeTypes.ASSIGNMENT))
}

function isContractDefinition (node) {
  return nodeType(node, exactMatch(nodeTypes.CONTRACTDEFINITION))
}

function isInlineAssembly (node) {
  return nodeType(node, exactMatch(nodeTypes.INLINEASSEMBLY))
}

function isNewExpression (node) {
  return nodeType(node, exactMatch(nodeTypes.NEWEXPRESSION))
}

// #################### Complex Node Identification

/**
 * True if function defintion has function body
 * @funcNode {ASTNode} function defintion node
 * @return {bool}
 */
function hasFunctionBody (funcNode) {
  return findFirstSubNodeLTR(funcNode, exactMatch(nodeTypes.BLOCK)) != null
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
  return isLocalCall(node) && builtinFunctions[getLocalCallName(node) + '(' + getFunctionCallTypeParameterType(node) + ')'] === true
}

/**
 * True if is storage variable declaration
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isStorageVariableDeclaration (node) {
  return isVariableDeclaration(node) && expressionType(node, basicRegex.REFTYPE)
}

/**
 * True if is interaction with external contract (change in context, no delegate calls) (send, call of other contracts)
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isInteraction (node) {
  return isLLCall(node) || isLLSend(node) || isExternalDirectCall(node) || isTransfer(node)
}

/**
 * True if node changes state of a variable or is inline assembly (does not include check if it is a global state change, on a state variable)
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isEffect (node) {
  return isAssignment(node) || isPlusPlusUnaryOperation(node) || isMinusMinusUnaryOperation(node) || isInlineAssembly(node)
}

/**
 * True if node changes state of a variable or is inline assembly (Checks if variable is a state variable via provided list)
 * @node {ASTNode} some AstNode
 * @node {list Variable declaration} state variable declaration currently in scope
 * @return {bool}
 */
function isWriteOnStateVariable (effectNode, stateVariables) {
  return isInlineAssembly(effectNode) || (isEffect(effectNode) && isStateVariable(getEffectedVariableName(effectNode), stateVariables))
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
function isConstantFunction (node) {
  return isFunctionDefinition(node) && (
    node.attributes.constant === true ||
    node.attributes.stateMutability === 'view' ||
    node.attributes.stateMutability === 'pure'
  )
}

/**
 * True if unary increment operation
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isPlusPlusUnaryOperation (node) {
  return nodeType(node, exactMatch(nodeTypes.UNARYOPERATION)) && operator(node, exactMatch(utils.escapeRegExp('++')))
}

/**
 * True if unary decrement operation
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isMinusMinusUnaryOperation (node) {
  return nodeType(node, exactMatch(nodeTypes.UNARYOPERATION)) && operator(node, exactMatch(utils.escapeRegExp('--')))
}

/**
 * True if all functions on a contract are implemented
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isFullyImplementedContract (node) {
  return nodeType(node, exactMatch(nodeTypes.CONTRACTDEFINITION)) && node.attributes.fullyImplemented === true
}

/**
 * True if it is a library contract defintion
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isLibrary (node) {
  return nodeType(node, exactMatch(nodeTypes.CONTRACTDEFINITION)) && node.attributes.isLibrary === true
}

/**
 * True if it is a local call to non const function
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isCallToNonConstLocalFunction (node) {
  return isLocalCall(node) && !expressionType(node.children[0], basicRegex.CONSTANTFUNCTIONTYPE)
}

/**
 * True if it is a call to a library
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isLibraryCall (node) {
  return isMemberAccess(node, basicRegex.FUNCTIONTYPE, undefined, basicRegex.LIBRARYTYPE, undefined)
}

/**
 * True if it is an external call via defined interface (not low level call)
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isExternalDirectCall (node) {
  return isMemberAccess(node, basicRegex.EXTERNALFUNCTIONTYPE, undefined, basicRegex.CONTRACTTYPE, undefined) && !isThisLocalCall(node) && !isSuperLocalCall(node)
}

/**
 * True if access to block.timestamp via now alias
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isNowAccess (node) {
  return nodeType(node, exactMatch(nodeTypes.IDENTIFIER)) &&
        expressionType(node, exactMatch(basicTypes.UINT)) &&
        name(node, exactMatch('now'))
}

/**
 * True if access to block.timestamp
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isBlockTimestampAccess (node) {
  return isSpecialVariableAccess(node, specialVariables.BLOCKTIMESTAMP)
}

/**
 * True if access to block.blockhash
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isBlockBlockHashAccess (node) {
  return isSpecialVariableAccess(node, specialVariables.BLOCKHASH)
}

/**
 * True if call to local function via this keyword
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isThisLocalCall (node) {
  return isMemberAccess(node, basicRegex.FUNCTIONTYPE, exactMatch('this'), basicRegex.CONTRACTTYPE, undefined)
}

/**
 * True if access to local function via super keyword
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isSuperLocalCall (node) {
  return isMemberAccess(node, basicRegex.FUNCTIONTYPE, exactMatch('super'), basicRegex.CONTRACTTYPE, undefined)
}

/**
 * True if call to local function
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isLocalCall (node) {
  return nodeType(node, exactMatch(nodeTypes.FUNCTIONCALL)) &&
        minNrOfChildren(node, 1) &&
        nodeType(node.children[0], exactMatch(nodeTypes.IDENTIFIER)) &&
        expressionType(node.children[0], basicRegex.FUNCTIONTYPE) &&
        !expressionType(node.children[0], basicRegex.EXTERNALFUNCTIONTYPE) &&
        nrOfChildren(node.children[0], 0)
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
          isLLSend(node)
}

/**
 * True if low level send
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isLLSend (node) {
  return isMemberAccess(node,
          exactMatch(utils.escapeRegExp(lowLevelCallTypes.SEND.type)),
          undefined, exactMatch(basicTypes.ADDRESS), exactMatch(lowLevelCallTypes.SEND.ident))
}

/**
 * True if low level call
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isLLCall (node) {
  return isMemberAccess(node,
          exactMatch(utils.escapeRegExp(lowLevelCallTypes.CALL.type)),
          undefined, exactMatch(basicTypes.ADDRESS), exactMatch(lowLevelCallTypes.CALL.ident))
}

/**
 * True if low level callcode
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isLLCallcode (node) {
  return isMemberAccess(node,
          exactMatch(utils.escapeRegExp(lowLevelCallTypes.CALLCODE.type)),
          undefined, exactMatch(basicTypes.ADDRESS), exactMatch(lowLevelCallTypes.CALLCODE.ident))
}

/**
 * True if low level delegatecall
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isLLDelegatecall (node) {
  return isMemberAccess(node,
          exactMatch(utils.escapeRegExp(lowLevelCallTypes.DELEGATECALL.type)),
          undefined, exactMatch(basicTypes.ADDRESS), exactMatch(lowLevelCallTypes.DELEGATECALL.ident))
}

/**
 * True if transfer call
 * @node {ASTNode} some AstNode
 * @return {bool}
 */
function isTransfer (node) {
  return isMemberAccess(node,
          exactMatch(utils.escapeRegExp(lowLevelCallTypes.TRANSFER.type)),
          undefined, exactMatch(basicTypes.ADDRESS), exactMatch(lowLevelCallTypes.TRANSFER.ident))
}

// #################### Complex Node Identification - Private

function isMemberAccess (node, retType, accessor, accessorType, memberName) {
  return nodeType(node, exactMatch(nodeTypes.MEMBERACCESS)) &&
        expressionType(node, retType) &&
        name(node, memberName) &&
        nrOfChildren(node, 1) &&
        name(node.children[0], accessor) &&
        expressionType(node.children[0], accessorType)
}

function isSpecialVariableAccess (node, varType) {
  return isMemberAccess(node, exactMatch(utils.escapeRegExp(varType.type)), varType.obj, varType.obj, varType.member)
}

// #################### Node Identification Primitives

function nrOfChildren (node, nr) {
  return (node && (nr === undefined || nr === null)) || (node && nr === 0 && !node.children) || (node && node.children && node.children.length === nr)
}

function minNrOfChildren (node, nr) {
  return (node && (nr === undefined || nr === null)) || (node && nr === 0 && !node.children) || (node && node.children && node.children.length >= nr)
}

function expressionType (node, typeRegex) {
  return (node && !typeRegex) || (node && node.attributes && new RegExp(typeRegex).test(node.attributes.type))
}

function nodeType (node, typeRegex) {
  return (node && !typeRegex) || (node && new RegExp(typeRegex).test(node.name))
}

function name (node, nameRegex) {
  var regex = new RegExp(nameRegex)
  return (node && !nameRegex) || (node && node.attributes && (regex.test(node.attributes.value) || regex.test(node.attributes.member_name)))
}

function operator (node, opRegex) {
  return (node && !opRegex) || (node && new RegExp(opRegex).test(node.attributes.operator))
}

// #################### Helpers

function exactMatch (regexStr) {
  return '^' + regexStr + '$'
}

/**
 * Builds an function signature as used in the AST of the solc-json AST
 * @param {Array} paramTypes
 *  list of parameter type names
 * @param {Array} returnTypes
 *  list of return type names
 * @return {Boolean} isPayable
 */
function buildFunctionSignature (paramTypes, returnTypes, isPayable) {
  return 'function (' + utils.concatWithSeperator(paramTypes, ',') + ')' + ((isPayable) ? ' payable' : '') + ((returnTypes.length) ? ' returns (' + utils.concatWithSeperator(returnTypes, ',') + ')' : '')
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
    var item = node.children[i]
    if (nodeType(item, type)) return item
    else {
      var res = findFirstSubNodeLTR(item, type)
      if (res) return res
    }
  }
  return null
}

module.exports = {
  // #################### Trivial Getters
  getType: getType,
  // #################### Complex Getters
  getThisLocalCallName: getThisLocalCallName,
  getSuperLocalCallName: getSuperLocalCallName,
  getFunctionCallType: getFunctionCallType,
  getContractName: getContractName,
  getEffectedVariableName: getEffectedVariableName,
  getDeclaredVariableName: getDeclaredVariableName,
  getLocalCallName: getLocalCallName,
  getInheritsFromName: getInheritsFromName,
  getExternalDirectCallContractName: getExternalDirectCallContractName,
  getThisLocalCallContractName: getThisLocalCallContractName,
  getExternalDirectCallMemberName: getExternalDirectCallMemberName,
  getFunctionDefinitionName: getFunctionDefinitionName,
  getFunctionCallTypeParameterType: getFunctionCallTypeParameterType,
  getLibraryCallContractName: getLibraryCallContractName,
  getLibraryCallMemberName: getLibraryCallMemberName,
  getFullQualifiedFunctionCallIdent: getFullQualifiedFunctionCallIdent,
  getFullQuallyfiedFuncDefinitionIdent: getFullQuallyfiedFuncDefinitionIdent,
  getStateVariableDeclarationsFormContractNode: getStateVariableDeclarationsFormContractNode,
  getFunctionOrModifierDefinitionParameterPart: getFunctionOrModifierDefinitionParameterPart,

  // #################### Complex Node Identification
  hasFunctionBody: hasFunctionBody,
  isInteraction: isInteraction,
  isEffect: isEffect,
  isNowAccess: isNowAccess,
  isBlockTimestampAccess: isBlockTimestampAccess,
  isBlockBlockHashAccess: isBlockBlockHashAccess,
  isThisLocalCall: isThisLocalCall,
  isSuperLocalCall: isSuperLocalCall,
  isLibraryCall: isLibraryCall,
  isLocalCallGraphRelevantNode: isLocalCallGraphRelevantNode,
  isLocalCall: isLocalCall,
  isWriteOnStateVariable: isWriteOnStateVariable,
  isStateVariable: isStateVariable,
  isTransfer: isTransfer,
  isLowLevelCall: isLowLevelCall,
  isLowLevelCallInst: isLLCall,
  isLowLevelCallcodeInst: isLLCallcode,
  isLowLevelDelegatecallInst: isLLDelegatecall,
  isLowLevelSendInst: isLLSend,
  isExternalDirectCall: isExternalDirectCall,
  isFullyImplementedContract: isFullyImplementedContract,
  isLibrary: isLibrary,
  isCallToNonConstLocalFunction: isCallToNonConstLocalFunction,
  isPlusPlusUnaryOperation: isPlusPlusUnaryOperation,
  isMinusMinusUnaryOperation: isMinusMinusUnaryOperation,
  isBuiltinFunctionCall: isBuiltinFunctionCall,

  // #################### Trivial Node Identification
  isFunctionDefinition: isFunctionDefinition,
  isModifierDefinition: isModifierDefinition,
  isInheritanceSpecifier: isInheritanceSpecifier,
  isModifierInvocation: isModifierInvocation,
  isVariableDeclaration: isVariableDeclaration,
  isStorageVariableDeclaration: isStorageVariableDeclaration,
  isAssignment: isAssignment,
  isContractDefinition: isContractDefinition,
  isConstantFunction: isConstantFunction,
  isInlineAssembly: isInlineAssembly,
  isNewExpression: isNewExpression,

  // #################### Constants
  nodeTypes: nodeTypes,
  basicTypes: basicTypes,
  basicFunctionTypes: basicFunctionTypes,
  lowLevelCallTypes: lowLevelCallTypes,
  specialVariables: specialVariables,
  helpers: {
    nrOfChildren: nrOfChildren,
    minNrOfChildren: minNrOfChildren,
    expressionType: expressionType,
    nodeType: nodeType,
    name: name,
    operator: operator,
    buildFunctionSignature: buildFunctionSignature
  }
}
