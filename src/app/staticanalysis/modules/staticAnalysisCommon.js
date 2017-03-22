'use strict'

var utils = require('../../utils')

var nodeTypes = {
  IDENTIFIER: 'Identifier',
  MEMBERACCESS: 'MemberAccess',
  FUNCTIONCALL: 'FunctionCall'
}

var basicTypes = {
  UINT: 'uint256',
  BOOL: 'bool',
  ADDRESS: 'address',
  BYTES32: 'bytes32'
}

var basicRegex = {
  CONTRACTTYPE: '^contract ',
  FUNCTIONTYPE: '^function \\('
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

// usage of now special variable
function isNowAccess (node) {
  return nodeType(node, nodeTypes.IDENTIFIER) &&
        expressionType(node, basicTypes.UINT) &&
        name(node, 'now')
}

// usage of block timestamp
function isBlockTimestampAccess (node) {
  return isSpecialVariableAccess(node, specialVariables.BLOCKTIMESTAMP)
}

function isSpecialVariableAccess (node, varType) {
  return isMemberAccess(node, varType.type, varType.obj, varType.obj, varType.member)
}

function isThisLocalCall (node) {
  return isMemberAccess(node, basicRegex.FUNCTIONTYPE, 'this', basicRegex.CONTRACTTYPE, undefined)
}

function isLowLevelCall (node) {
  return isLLCall(node) ||
          isLLCallcode(node) ||
          isLLDelegatecall(node) ||
          isLLSend(node)
}

function isLLSend (node) {
  return isMemberAccess(node,
          utils.escapeRegExp(lowLevelCallTypes.SEND.type),
          undefined, basicTypes.ADDRESS, lowLevelCallTypes.SEND.ident)
}

function isLLCall (node) {
  return isMemberAccess(node,
          utils.escapeRegExp(lowLevelCallTypes.CALL.type),
          undefined, basicTypes.ADDRESS, lowLevelCallTypes.CALL.ident)
}

function isLLCallcode (node) {
  return isMemberAccess(node,
          utils.escapeRegExp(lowLevelCallTypes.CALLCODE.type),
          undefined, basicTypes.ADDRESS, lowLevelCallTypes.CALLCODE.ident)
}

function isLLDelegatecall (node) {
  return isMemberAccess(node,
          utils.escapeRegExp(lowLevelCallTypes.DELEGATECALL.type),
          undefined, basicTypes.ADDRESS, lowLevelCallTypes.DELEGATECALL.ident)
}

function isMemberAccess (node, retType, accessor, accessorType, memberName) {
  return nodeType(node, nodeTypes.MEMBERACCESS) &&
        expressionType(node, retType) &&
        name(node, memberName) &&
        nrOfChildren(node, 1) &&
        name(node.children[0], accessor) &&
        expressionType(node.children[0], accessorType)
}

function nrOfChildren (node, nr) {
  return (node && (nr === undefined || nr === null)) || (node && node.children && node.children.length === nr)
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

module.exports = {
  isNowAccess: isNowAccess,
  isBlockTimestampAccess: isBlockTimestampAccess,
  isThisLocalCall: isThisLocalCall,
  isLowLevelCall: isLowLevelCall,
  isLowLevelCallInst: isLLCall,
  isLowLevelCallcodeInst: isLLCallcode,
  isLowLevelDelegatecallInst: isLLDelegatecall,
  isLowLevelSendInst: isLLSend,
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
