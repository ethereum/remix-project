'use strict'

var common = require('./staticAnalysisCommon')

function buildLocalFuncCallGraphInternal (functions, nodeFilter, extractNodeIdent, extractFuncDefIdent) {
  var callGraph = {}
  functions.forEach((func) => {
    var calls = func.relevantNodes
      .filter(nodeFilter)
      .map(extractNodeIdent)
      .filter((name) => name !== extractFuncDefIdent(func)) // filter self recursive call

    callGraph[extractFuncDefIdent(func)] = { node: func, calls: calls }
  })

  return callGraph
}

/**
 * Builds a function call graph for the current contracts.
 * Example Contract call graph:
 *
 * {
 *  "KingOfTheEtherThrone": {
 *    "contracts": {...},                                        // Contract node as defined in abstractAstView.js
 *    "functions": {
 *      "KingOfTheEtherThrone.claimThrone(string memory)": {    // function in KingOfEtherThrone
 *        "node": {...},                                        // function node as defined in abstractAstView.js
 *        "calls": {                                            // list of full qualified function names which are called form this function
 *        }
 *      }
 *    }
 *  },
 *  "foo": {
 *    "contract": {...},           // Contract node as definded in abstractAstView.js
 *    "functions": {}             // map from full qualified function name to func node
 *  }
 * }
 *
 * @contracts {list contracts} Expects as input the contract structure defined in abstractAstView.js
 * @return {map (string -> Contract Call Graph)} returns map from contract name to contract call graph
 */
function buildGlobalFuncCallGraph (contracts) {
  var callGraph = {}
  contracts.forEach((contract) => {
    var filterNodes = (node) => { return common.isLocalCallGraphRelevantNode(node) || common.isExternalDirectCall(node) }
    var getNodeIdent = (node) => { return common.getFullQualifiedFunctionCallIdent(contract.node, node) }
    var getFunDefIdent = (funcDef) => { return common.getFullQuallyfiedFuncDefinitionIdent(contract.node, funcDef.node, funcDef.parameters) }

    callGraph[common.getContractName(contract.node)] = { contract: contract, functions: buildLocalFuncCallGraphInternal(contract.functions, filterNodes, getNodeIdent, getFunDefIdent) }
  })

  return callGraph
}

/**
 * Walks through the call graph from a defined starting function, true if nodeCheck holds for every relevant node in the callgraph
 * @callGraph {callGraph} As returned by buildGlobalFuncCallGraph
 * @funcName {string} full qualified name of the starting function
 * @context {Object} provides additional context information that can be used by the nodeCheck function
 * @nodeCheck {(ASTNode, context) -> bool} applied on every relevant node in the call graph
 * @return {bool} returns map from contract name to contract call graph
 */
function analyseCallGraph (callGraph, funcName, context, nodeCheck) {
  return analyseCallGraphInternal(callGraph, funcName, context, (a, b) => a || b, nodeCheck, {})
}

function analyseCallGraphInternal (callGraph, funcName, context, combinator, nodeCheck, visited) {
  var current = resolveCallGraphSymbol(callGraph, funcName)

  if (current === undefined || visited[funcName] === true) return true
  visited[funcName] = true

  return combinator(current.node.relevantNodes.reduce((acc, val) => combinator(acc, nodeCheck(val, context)), false),
                        current.calls.reduce((acc, val) => combinator(acc, analyseCallGraphInternal(callGraph, val, context, combinator, nodeCheck, visited)), false))
}

function resolveCallGraphSymbol (callGraph, funcName) {
  return resolveCallGraphSymbolInternal(callGraph, funcName, false)
}

function resolveCallGraphSymbolInternal (callGraph, funcName, silent) {
  var current
  if (funcName.includes('.')) {
    var parts = funcName.split('.')
    var contractPart = parts[0]
    var functionPart = parts[1]
    var currentContract = callGraph[contractPart]
    if (!(currentContract === undefined)) {
      current = currentContract.functions[funcName]
       // resolve inheritance hierarchy
      if (current === undefined) {
        // resolve inheritance lookup in linearized fashion
        var inheritsFromNames = currentContract.contract.inheritsFrom.reverse()
        for (var i = 0; i < inheritsFromNames.length; i++) {
          var res = resolveCallGraphSymbolInternal(callGraph, inheritsFromNames[i] + '.' + functionPart, true)
          if (!(res === undefined)) return res
        }
      }
    } else {
      if (!silent) console.log(`static analysis functionCallGraph.js: Contract ${contractPart} not found in function call graph.`)
    }
  } else {
    throw new Error('functionCallGraph.js: function does not have full qualified name.')
  }
  if (current === undefined && !silent) console.log(`static analysis functionCallGraph.js: ${funcName} not found in function call graph.`)
  return current
}

module.exports = {
  analyseCallGraph: analyseCallGraph,
  buildGlobalFuncCallGraph: buildGlobalFuncCallGraph,
  resolveCallGraphSymbol: resolveCallGraphSymbol
}
