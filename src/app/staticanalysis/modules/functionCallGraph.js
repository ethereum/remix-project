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

function analyseCallGraph (cg, funcName, context, nodeCheck) {
  return analyseCallGraphInternal(cg, funcName, context, (a, b) => a || b, nodeCheck, {})
}

function analyseCallGraphInternal (cg, funcName, context, combinator, nodeCheck, visited) {
  var current = resolveCallGraphSymbol(cg, funcName)

  if (current === undefined || visited[funcName] === true) return true
  visited[funcName] = true

  return combinator(current.node.relevantNodes.reduce((acc, val) => combinator(acc, nodeCheck(val, context)), false),
                        current.calls.reduce((acc, val) => combinator(acc, analyseCallGraphInternal(cg, val, context, combinator, nodeCheck, visited)), false))
}

function resolveCallGraphSymbol (cg, funcName) {
  return resolveCallGraphSymbolInternal(cg, funcName, false)
}

function resolveCallGraphSymbolInternal (cg, funcName, silent) {
  var current
  if (funcName.includes('.')) {
    var parts = funcName.split('.')
    var contractPart = parts[0]
    var functionPart = parts[1]
    var currentContract = cg[contractPart]
    if (!(currentContract === undefined)) {
      current = currentContract.functions[funcName]
       // resolve inheritance hierarchy
      if (current === undefined) {
        // resolve inheritance lookup in linearized fashion
        var inheritsFromNames = currentContract.contract.inheritsFrom.reverse()
        for (var i = 0; i < inheritsFromNames.length; i++) {
          var res = resolveCallGraphSymbolInternal(cg, inheritsFromNames[i] + '.' + functionPart, true)
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
