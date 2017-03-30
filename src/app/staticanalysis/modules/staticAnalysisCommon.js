'use strict'

var utils = require('../../utils')

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
  INLINEASSEMBLY: 'InlineAssembly'
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
  CONSTANTFUNCTIONTYPE: '^function \\(.*\\).* constant',
  REFTYPE: '( storage )|(mapping\\()|(\\[\\])',
  FUNCTIONSIGNATURE: '^function \\(([^\\(]*)\\)'
}

var basicFunctionTypes = {
  SEND: buildFunctionSignature([basicTypes.UINT], [basicTypes.BOOL], false),
  CALL: buildFunctionSignature([], [basicTypes.BOOL], true),
  DELEGATECALL: buildFunctionSignature([], [basicTypes.BOOL], false)
}

var lowLevelCallTypes = {
  CALL: { ident: 'call', type: basicFunctionTypes.CALL },
  CALLCODE: { ident: 'callcode', type: basicFunctionTypes.CALL },
  DELEGATECALL: { ident: 'delegatecall', type: basicFunctionTypes.DELEGATECALL },
  SEND: { ident: 'send', type: basicFunctionTypes.SEND }
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

function getFunctionCallType (func) {
  if (!(isExternalDirectCall(func) || isThisLocalCall(func) || isLocalCall(func))) throw new Error('staticAnalysisCommon.js: not function call Node')
  if (isExternalDirectCall(func)) return func.attributes.type
  return findFirstSubNodeLTR(func, exactMatch(nodeTypes.IDENTIFIER)).attributes.type
}

function getEffectedVariableName (effectNode) {
  if (!isEffect(effectNode)) throw new Error('staticAnalysisCommon.js: not an effect Node')
  return findFirstSubNodeLTR(effectNode, exactMatch(nodeTypes.IDENTIFIER)).attributes.value
}

function getLocalCallName (localCallNode) {
  if (!isLocalCall(localCallNode)) throw new Error('staticAnalysisCommon.js: not an local call Node')
  return localCallNode.children[0].attributes.value
}

function getThisLocalCallName (localCallNode) {
  if (!isThisLocalCall(localCallNode)) throw new Error('staticAnalysisCommon.js: not an this local call Node')
  return localCallNode.attributes.value
}

function getExternalDirectCallContractName (extDirectCall) {
  if (!isExternalDirectCall(extDirectCall)) throw new Error('staticAnalysisCommon.js: not an external direct call Node')
  return extDirectCall.children[0].attributes.type.replace(new RegExp(basicRegex.CONTRACTTYPE), '')
}

function getExternalDirectCallMemberName (extDirectCall) {
  if (!isExternalDirectCall(extDirectCall)) throw new Error('staticAnalysisCommon.js: not an external direct call Node')
  return extDirectCall.attributes.member_name
}

function getContractName (contract) {
  if (!isContractDefinition(contract)) throw new Error('staticAnalysisCommon.js: not an contractDefinition Node')
  return contract.attributes.name
}

function getFunctionDefinitionName (funcDef) {
  if (!isFunctionDefinition(funcDef)) throw new Error('staticAnalysisCommon.js: not an functionDefinition Node')
  return funcDef.attributes.name
}

function getInheritsFromName (inheritsNode) {
  if (!isInheritanceSpecifier(inheritsNode)) throw new Error('staticAnalysisCommon.js: not an InheritanceSpecifier node Node')
  return inheritsNode.children[0].attributes.name
}

function getDeclaredVariableName (varDeclNode) {
  if (!isVariableDeclaration(varDeclNode)) throw new Error('staticAnalysisCommon.js: not an variable declaration')
  return varDeclNode.attributes.name
}

function getStateVariableDeclarationsFormContractNode (contractNode) {
  if (!isContractDefinition(contractNode)) throw new Error('staticAnalysisCommon.js: not an contract definition declaration')
  return contractNode.children.filter((el) => isVariableDeclaration(el))
}

function getFunctionOrModifierDefinitionParameterPart (funcNode) {
  if (!isFunctionDefinition(funcNode) && !isModifierDefinition(funcNode)) throw new Error('staticAnalysisCommon.js: not an function definition')
  return funcNode.children[0]
}

function getFunctionCallTypeParameterType (func) {
  return new RegExp(basicRegex.FUNCTIONSIGNATURE).exec(getFunctionCallType(func))[1]
}

function getFullQualifiedFunctionCallIdent (contract, func) {
  if (isLocalCall(func)) return getContractName(contract) + '.' + getLocalCallName(func) + '(' + getFunctionCallTypeParameterType(func) + ')'
  else if (isThisLocalCall(func)) return getContractName(contract) + '.' + getThisLocalCallName(func) + '(' + getFunctionCallTypeParameterType(func) + ')'
  else if (isExternalDirectCall(func)) return getExternalDirectCallContractName(func) + '.' + getExternalDirectCallMemberName(func) + '(' + getFunctionCallTypeParameterType(func) + ')'
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

// #################### Complex Node Identification

function isStorageVariableDeclaration (node) {
  return isVariableDeclaration(node) && expressionType(node, basicRegex.REFTYPE)
}

function isInteraction (node) {
  return isLLCall(node) || isLLSend(node) || isExternalDirectCall(node)
}

function isEffect (node) {
  return isAssignment(node) || isPlusPlusUnaryOperation(node) || isMinusMinusUnaryOperation(node) || isInlineAssembly(node)
}

function isWriteOnStateVariable (effectNode, stateVariables) {
  return isEffect(effectNode) && !isInlineAssembly(effectNode) && isStateVariable(getEffectedVariableName(effectNode), stateVariables)
}

function isStateVariable (name, stateVariables) {
  return stateVariables.some((item) => name === getDeclaredVariableName(item))
}

function isConstantFunction (node) {
  return isFunctionDefinition(node) && node.attributes.constant === true
}

function isCallToNonConstLocalFunction (node) {
  return isLocalCall(node) && !expressionType(node.children[0], basicRegex.CONSTANTFUNCTIONTYPE)
}

function isExternalDirectCall (node) {
  return isMemberAccess(node, basicRegex.EXTERNALFUNCTIONTYPE, undefined, basicRegex.CONTRACTTYPE, undefined) && !isThisLocalCall(node)
}

// usage of now special variable
function isNowAccess (node) {
  return nodeType(node, exactMatch(nodeTypes.IDENTIFIER)) &&
        expressionType(node, exactMatch(basicTypes.UINT)) &&
        name(node, exactMatch('now'))
}

function isPlusPlusUnaryOperation (node) {
  return nodeType(node, exactMatch(nodeTypes.UNARYOPERATION)) && operator(node, exactMatch(utils.escapeRegExp('++')))
}

function isMinusMinusUnaryOperation (node) {
  return nodeType(node, exactMatch(nodeTypes.UNARYOPERATION)) && operator(node, exactMatch('--'))
}

function isFullyImplementedContract (node) {
  return nodeType(node, exactMatch(nodeTypes.CONTRACTDEFINITION)) && node.attributes.fullyImplemented === true
}

// usage of block timestamp
function isBlockTimestampAccess (node) {
  return isSpecialVariableAccess(node, specialVariables.BLOCKTIMESTAMP)
}

function isSpecialVariableAccess (node, varType) {
  return isMemberAccess(node, varType.type, varType.obj, varType.obj, varType.member)
}

function isThisLocalCall (node) {
  return isMemberAccess(node, basicRegex.FUNCTIONTYPE, exactMatch('this'), basicRegex.CONTRACTTYPE, undefined)
}

function isLocalCall (node) {
  return nodeType(node, exactMatch(nodeTypes.FUNCTIONCALL)) &&
        minNrOfChildren(node, 1) &&
        nodeType(node.children[0], exactMatch(nodeTypes.IDENTIFIER)) &&
        expressionType(node.children[0], basicRegex.FUNCTIONTYPE) &&
        !expressionType(node.children[0], basicRegex.EXTERNALFUNCTIONTYPE) &&
        nrOfChildren(node.children[0], 0)
}

function isLowLevelCall (node) {
  return isLLCall(node) ||
          isLLCallcode(node) ||
          isLLDelegatecall(node) ||
          isLLSend(node)
}

function isLLSend (node) {
  return isMemberAccess(node,
          exactMatch(utils.escapeRegExp(lowLevelCallTypes.SEND.type)),
          undefined, exactMatch(basicTypes.ADDRESS), exactMatch(lowLevelCallTypes.SEND.ident))
}

function isLLCall (node) {
  return isMemberAccess(node,
          exactMatch(utils.escapeRegExp(lowLevelCallTypes.CALL.type)),
          undefined, exactMatch(basicTypes.ADDRESS), exactMatch(lowLevelCallTypes.CALL.ident))
}

function isLLCallcode (node) {
  return isMemberAccess(node,
          exactMatch(utils.escapeRegExp(lowLevelCallTypes.CALLCODE.type)),
          undefined, exactMatch(basicTypes.ADDRESS), exactMatch(lowLevelCallTypes.CALLCODE.ident))
}

function isLLDelegatecall (node) {
  return isMemberAccess(node,
          exactMatch(utils.escapeRegExp(lowLevelCallTypes.DELEGATECALL.type)),
          undefined, exactMatch(basicTypes.ADDRESS), exactMatch(lowLevelCallTypes.DELEGATECALL.ident))
}

function isMemberAccess (node, retType, accessor, accessorType, memberName) {
  return nodeType(node, exactMatch(nodeTypes.MEMBERACCESS)) &&
        expressionType(node, retType) &&
        name(node, memberName) &&
        nrOfChildren(node, 1) &&
        name(node.children[0], accessor) &&
        expressionType(node.children[0], accessorType)
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
 *  CAUTION: only needed in low level call signature or message-calls (other contracts, this.)
 */
function buildFunctionSignature (paramTypes, returnTypes, isPayable) {
  return 'function (' + utils.concatWithSeperator(paramTypes, ',') + ')' + ((isPayable) ? ' payable' : '') + ((returnTypes.length) ? ' returns (' + utils.concatWithSeperator(returnTypes, ',') + ')' : '')
}

function findFirstSubNodeLTR (node, type) {
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
  getFunctionCallType: getFunctionCallType,
  getContractName: getContractName,
  getEffectedVariableName: getEffectedVariableName,
  getDeclaredVariableName: getDeclaredVariableName,
  getLocalCallName: getLocalCallName,
  getInheritsFromName: getInheritsFromName,
  getExternalDirectCallContractName: getExternalDirectCallContractName,
  getExternalDirectCallMemberName: getExternalDirectCallMemberName,
  getFunctionDefinitionName: getFunctionDefinitionName,
  getFunctionCallTypeParameterType: getFunctionCallTypeParameterType,
  getFullQualifiedFunctionCallIdent: getFullQualifiedFunctionCallIdent,
  getFullQuallyfiedFuncDefinitionIdent: getFullQuallyfiedFuncDefinitionIdent,
  getStateVariableDeclarationsFormContractNode: getStateVariableDeclarationsFormContractNode,
  getFunctionOrModifierDefinitionParameterPart: getFunctionOrModifierDefinitionParameterPart,

  // #################### Complex Node Identification
  isInteraction: isInteraction,
  isEffect: isEffect,
  isNowAccess: isNowAccess,
  isBlockTimestampAccess: isBlockTimestampAccess,
  isThisLocalCall: isThisLocalCall,
  isLocalCall: isLocalCall,
  isWriteOnStateVariable: isWriteOnStateVariable,
  isStateVariable: isStateVariable,
  isLowLevelCall: isLowLevelCall,
  isLowLevelCallInst: isLLCall,
  isLowLevelCallcodeInst: isLLCallcode,
  isLowLevelDelegatecallInst: isLLDelegatecall,
  isLowLevelSendInst: isLLSend,
  isExternalDirectCall: isExternalDirectCall,
  isFullyImplementedContract: isFullyImplementedContract,
  isCallToNonConstLocalFunction: isCallToNonConstLocalFunction,

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

  // #################### Constants
  nodeTypes: nodeTypes,
  basicTypes: basicTypes,
  basicFunctionTypes: basicFunctionTypes,
  lowLevelCallTypes: lowLevelCallTypes,
  specialVariables: specialVariables,
  helpers: {
    nrOfChildren: nrOfChildren,
    expressionType: expressionType,
    nodeType: nodeType,
    name: name,
    buildFunctionSignature: buildFunctionSignature
  }
}
