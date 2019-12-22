const name = 'Constant functions: '
const desc = 'Check for potentially constant functions'
const categories = require('./categories')
const common = require('./staticAnalysisCommon')
const fcallGraph = require('./functionCallGraph')
const AbstractAst = require('./abstractAstView')
const algo = require('./algorithmCategories')

function constantFunctions () {
  this.abstractAst = new AbstractAst()

  this.visit = this.abstractAst.build_visit(
    (node) => common.isLowLevelCall(node) ||
              common.isTransfer(node) ||
              common.isExternalDirectCall(node) ||
              common.isEffect(node) ||
              common.isLocalCallGraphRelevantNode(node) ||
              common.isInlineAssembly(node) ||
              common.isNewExpression(node) ||
              common.isSelfdestructCall(node) ||
              common.isDeleteUnaryOperation(node)
  )

  this.report = this.abstractAst.build_report(report)
}

constantFunctions.prototype.visit = function () { throw new Error('constantFunctions.js no visit function set upon construction') }

constantFunctions.prototype.report = function () { throw new Error('constantFunctions.js no report function set upon construction') }

function report (contracts, multipleContractsWithSameName) {
  const warnings = []
  const hasModifiers = contracts.some((item) => item.modifiers.length > 0)

  const callGraph = fcallGraph.buildGlobalFuncCallGraph(contracts)

  contracts.forEach((contract) => {
    contract.functions.forEach((func) => {
      if (common.isPayableFunction(func.node) || common.isConstructor(func.node)) {
        func.potentiallyshouldBeConst = false
      } else {
        func.potentiallyshouldBeConst = checkIfShouldBeConstant(common.getFullQuallyfiedFuncDefinitionIdent(contract.node, func.node, func.parameters),
                                                              getContext(callGraph, contract, func))
      }
    })

    contract.functions.filter((func) => common.hasFunctionBody(func.node)).forEach((func) => {
      if (common.isConstantFunction(func.node) !== func.potentiallyshouldBeConst) {
        const funcName = common.getFullQuallyfiedFuncDefinitionIdent(contract.node, func.node, func.parameters)
        let comments = (hasModifiers) ? 'Note: Modifiers are currently not considered by this static analysis.' : ''
        comments += (multipleContractsWithSameName) ? 'Note: Import aliases are currently not supported by this static analysis.' : ''
        if (func.potentiallyshouldBeConst) {
          warnings.push({
            warning: `${funcName} : Potentially should be constant but is not. ${comments}`,
            location: func.src,
            more: 'http://solidity.readthedocs.io/en/develop/contracts.html#constant-functions'
          })
        } else {
          warnings.push({
            warning: `${funcName} : Is constant but potentially should not be. ${comments}`,
            location: func.src,
            more: 'http://solidity.readthedocs.io/en/develop/contracts.html#constant-functions'
          })
        }
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

function checkIfShouldBeConstant (startFuncName, context) {
  return !fcallGraph.analyseCallGraph(context.callGraph, startFuncName, context, isConstBreaker)
}

function isConstBreaker (node, context) {
  return common.isWriteOnStateVariable(node, context.stateVariables) ||
        common.isLowLevelCall(node) ||
        common.isTransfer(node) ||
        isCallOnNonConstExternalInterfaceFunction(node, context) ||
        common.isCallToNonConstLocalFunction(node) ||
        common.isInlineAssembly(node) ||
        common.isNewExpression(node) ||
        common.isSelfdestructCall(node) ||
        common.isDeleteUnaryOperation(node)
}

function isCallOnNonConstExternalInterfaceFunction (node, context) {
  if (common.isExternalDirectCall(node)) {
    const func = fcallGraph.resolveCallGraphSymbol(context.callGraph, common.getFullQualifiedFunctionCallIdent(context.currentContract, node))
    return !func || (func && !common.isConstantFunction(func.node.node))
  }
  return false
}

module.exports = {
  name: name,
  description: desc,
  category: categories.MISC,
  algorithm: algo.HEURISTIC,
  Module: constantFunctions
}
