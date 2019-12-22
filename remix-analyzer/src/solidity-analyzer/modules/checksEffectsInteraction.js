const name = 'Check effects: '
const desc = 'Avoid potential reentrancy bugs'
const categories = require('./categories')
const common = require('./staticAnalysisCommon')
const fcallGraph = require('./functionCallGraph')
const AbstractAst = require('./abstractAstView')
const algo = require('./algorithmCategories')

function checksEffectsInteraction () {
  this.abstractAst = new AbstractAst()
  this.visit = this.abstractAst.build_visit(
    (node) => common.isInteraction(node) || common.isEffect(node) || common.isLocalCallGraphRelevantNode(node)
  )

  this.report = this.abstractAst.build_report(report)
}

checksEffectsInteraction.prototype.visit = function () { throw new Error('checksEffectsInteraction.js no visit function set upon construction') }

checksEffectsInteraction.prototype.report = function () { throw new Error('checksEffectsInteraction.js no report function set upon construction') }

function report (contracts, multipleContractsWithSameName) {
  const warnings = []
  const hasModifiers = contracts.some((item) => item.modifiers.length > 0)

  const callGraph = fcallGraph.buildGlobalFuncCallGraph(contracts)

  contracts.forEach((contract) => {
    contract.functions.forEach((func) => {
      func.changesState = checkIfChangesState(common.getFullQuallyfiedFuncDefinitionIdent(contract.node, func.node, func.parameters),
                                                                                  getContext(callGraph, contract, func))
    })

    contract.functions.forEach((func) => {
      if (isPotentialVulnerableFunction(func, getContext(callGraph, contract, func))) {
        const funcName = common.getFullQuallyfiedFuncDefinitionIdent(contract.node, func.node, func.parameters)
        let comments = (hasModifiers) ? 'Note: Modifiers are currently not considered by this static analysis.' : ''
        comments += (multipleContractsWithSameName) ? 'Note: Import aliases are currently not supported by this static analysis.' : ''
        warnings.push({
          warning: `Potential Violation of Checks-Effects-Interaction pattern in ${funcName}: Could potentially lead to re-entrancy vulnerability. ${comments}`,
          location: func.src,
          more: 'http://solidity.readthedocs.io/en/develop/security-considerations.html#re-entrancy'
        })
      }
    })
  })

  return warnings
}

function getContext (callGraph, currentContract, func) {
  return { callGraph: callGraph, currentContract: currentContract, stateVariables: getStateVariables(currentContract, func) }
}

function getStateVariables (contract, func) {
  return contract.stateVariables.concat(func.localVariables.filter(common.isStorageVariableDeclaration))
}

function isPotentialVulnerableFunction (func, context) {
  let isPotentialVulnerable = false
  let interaction = false
  func.relevantNodes.forEach((node) => {
    if (common.isInteraction(node)) {
      interaction = true
    } else if (interaction && (common.isWriteOnStateVariable(node, context.stateVariables) || isLocalCallWithStateChange(node, context))) {
      isPotentialVulnerable = true
    }
  })
  return isPotentialVulnerable
}

function isLocalCallWithStateChange (node, context) {
  if (common.isLocalCallGraphRelevantNode(node)) {
    const func = fcallGraph.resolveCallGraphSymbol(context.callGraph, common.getFullQualifiedFunctionCallIdent(context.currentContract.node, node))
    return !func || (func && func.node.changesState)
  }
  return false
}

function checkIfChangesState (startFuncName, context) {
  return fcallGraph.analyseCallGraph(context.callGraph, startFuncName, context, (node, context) => common.isWriteOnStateVariable(node, context.stateVariables))
}

module.exports = {
  name: name,
  description: desc,
  category: categories.SECURITY,
  algorithm: algo.HEURISTIC,
  Module: checksEffectsInteraction
}
