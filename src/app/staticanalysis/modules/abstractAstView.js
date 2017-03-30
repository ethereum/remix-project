var common = require('./staticAnalysisCommon')
var AstWalker = require('ethereum-remix').util.AstWalker

function abstractAstView () {
  this.contracts = null
  this.currentContractIndex = null
  this.currentFunctionIndex = null
  this.currentModifierIndex = null
  this.isFunctionNotModifier = false
}

abstractAstView.prototype.builder = function (relevantNodeFilter, contractsOut) {
  this.contracts = contractsOut
  return function (node) {
    if (common.isContractDefinition(node)) {
      setCurrentContract(this, {
        node: node,
        functions: [],
        modifiers: [],
        inheritsFrom: [],
        stateVariables: common.getStateVariableDeclarationsFormContractNode(node)
      })
    } else if (common.isInheritanceSpecifier(node)) {
      var currentContract = getCurrentContract(this)
      var inheritsFromName = common.getInheritsFromName(node)
      currentContract.inheritsFrom.push(inheritsFromName)
      // add variables from inherited contracts
      var inheritsFrom = this.contracts.find((contract) => common.getContractName(contract.node) === inheritsFromName)
      currentContract.stateVariables = currentContract.stateVariables.concat(inheritsFrom.stateVariables)
    } else if (common.isFunctionDefinition(node)) {
      setCurrentFunction(this, {
        node: node,
        relevantNodes: [],
        modifierInvocations: [],
        localVariables: getLocalVariables(node),
        parameters: getLocalParameters(node)
      })
    } else if (common.isModifierDefinition(node)) {
      setCurrentModifier(this, {
        node: node,
        relevantNodes: [],
        localVariables: getLocalVariables(node),
        parameters: getLocalParameters(node)
      })
    } else if (common.isModifierInvocation(node)) {
      if (!this.isFunctionNotModifier) throw new Error('abstractAstView.js: Found modifier invocation outside of function scope.')
      getCurrentFunction(this).modifierInvocations.push(node)
    } else if (relevantNodeFilter(node)) {
      ((this.isFunctionNotModifier) ? getCurrentFunction(this) : getCurrentModifier(this)).relevantNodes.push(node)
    }
  }
}

function setCurrentContract (that, contract) {
  that.currentContractIndex = (that.contracts.push(contract) - 1)
}

function setCurrentFunction (that, func) {
  that.isFunctionNotModifier = true
  that.currentFunctionIndex = (getCurrentContract(that).functions.push(func) - 1)
}

function setCurrentModifier (that, modi) {
  that.isFunctionNotModifier = false
  that.currentModifierIndex = (getCurrentContract(that).modifiers.push(modi) - 1)
}

function getCurrentContract (that) {
  return that.contracts[that.currentContractIndex]
}

function getCurrentFunction (that) {
  return getCurrentContract(that).functions[that.currentFunctionIndex]
}

function getCurrentModifier (that) {
  return getCurrentContract(that).modifiers[that.currentModifierIndex]
}

function getLocalParameters (funcNode) {
  return getLocalVariables(common.getFunctionOrModifierDefinitionParameterPart(funcNode)).map(common.getType)
}

function getLocalVariables (funcNode) {
  var locals = []
  new AstWalker().walk(funcNode, {'*': function (node) {
    if (common.isVariableDeclaration(node)) locals.push(node)
    return true
  }})
  return locals
}

module.exports = abstractAstView
