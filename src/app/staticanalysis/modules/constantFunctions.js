var name = 'Constant functions'
var desc = 'Check for potentially constant functions'
var categories = require('./categories')
var common = require('./staticAnalysisCommon')
var callGraph = require('./functionCallGraph')
var AbstractAst = require('./abstractAstView')

function constantFunctions () {
  this.contracts = []

  constantFunctions.prototype.visit = new AbstractAst().builder(
    (node) => common.isLowLevelCall(node) || common.isExternalDirectCall(node) || common.isEffect(node) || common.isLocalCallGraphRelevantNode(node) || common.isInlineAssembly(node),
    this.contracts
  )
}

constantFunctions.prototype.report = function (compilationResults) {
  var warnings = []
  var hasModifiers = this.contracts.some((item) => item.modifiers.length > 0)

  var cg = callGraph.buildGlobalFuncCallGraph(this.contracts)

  this.contracts.forEach((contract) => {
    if (!common.isFullyImplementedContract(contract.node)) return

    contract.functions.forEach((func) => {
      func.potentiallyshouldBeConst = checkIfShouldBeConstant(common.getFullQuallyfiedFuncDefinitionIdent(contract.node, func.node, func.parameters),
                                                              getContext(cg, contract, func))
    })

    contract.functions.forEach((func) => {
      if (common.isConstantFunction(func.node) !== func.potentiallyshouldBeConst) {
        var funcName = common.getFullQuallyfiedFuncDefinitionIdent(contract.node, func.node, func.parameters)
        var comments = (hasModifiers) ? '<br/><i>Note:</i>Modifiers are currently not considered by the this static analysis.' : ''
        if (func.potentiallyshouldBeConst) {
          warnings.push({
            warning: `<i>${funcName}</i>: Potentially should be constant but is not.${comments}`,
            location: func.src,
            more: 'http://solidity.readthedocs.io/en/develop/contracts.html#constant-functions'
          })
        } else {
          warnings.push({
            warning: `<i>${funcName}</i>: Is constant but potentially should not be.${comments}`,
            location: func.src,
            more: 'http://solidity.readthedocs.io/en/develop/contracts.html#constant-functions'
          })
        }
      }
    })
  })

  return warnings
}

function getContext (cg, currentContract, func) {
  return { cg: cg, currentContract: currentContract, stateVariables: getStateVariables(currentContract, func) }
}

function getStateVariables (contract, func) {
  return contract.stateVariables.concat(func.localVariables.filter(common.isStorageVariableDeclaration))
}

function checkIfShouldBeConstant (startFuncName, context) {
  return !callGraph.analyseCallGraph(context.cg, startFuncName, context, isConstBreaker)
}

function isConstBreaker (node, context) {
  return common.isWriteOnStateVariable(node, context.stateVariables) ||
        common.isLowLevelCall(node) ||
        isCallOnNonConstExternalInterfaceFunction(node, context) ||
        common.isCallToNonConstLocalFunction(node) ||
        common.isInlineAssembly(node)
}

function isCallOnNonConstExternalInterfaceFunction (node, context) {
  if (common.isExternalDirectCall(node)) {
    var func = callGraph.resolveCallGraphSymbol(context.cg, common.getFullQualifiedFunctionCallIdent(context.currentContract, node))
    return !func || (func && !common.isConstantFunction(func.node.node))
  }
  return false
}

module.exports = {
  name: name,
  description: desc,
  category: categories.MISC,
  Module: constantFunctions
}
