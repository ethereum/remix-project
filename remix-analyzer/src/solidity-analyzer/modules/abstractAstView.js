const common = require('./staticAnalysisCommon')
const AstWalker = require('remix-lib').AstWalker

function abstractAstView () {
  this.contracts = []
  this.currentContractIndex = null
  this.currentFunctionIndex = null
  this.currentModifierIndex = null
  this.isFunctionNotModifier = false
  /*
    file1: contract c{}
    file2: import "file1" as x; contract c{}
    therefore we have two contracts with the same name c. At the moment this is not handled because alias name "x" is not
    available in the current AST implementation thus can not be resolved.
    Additionally the fullQuallified function names e.g. [contractName].[functionName](param1Type, param2Type, ... ) must be prefixed to
    fully support this and when inheritance is resolved it must include alias resolving e.g x.c = file1.c
  */
  this.multipleContractsWithSameName = false
}

/**
 * Builds a higher level AST view. I creates a list with each contract as an object in it.
 * Example contractsOut:
 *
 * {
 *  "node": {},                     // actual AST Node of the contract
 *  "functions": [
 *    {
 *      "node": {},                // actual AST Node of the function
 *      "relevantNodes": [],       // AST nodes in the function that are relevant for the anlysis of this function
 *      "modifierInvocations": [], // Modifier invocation AST nodes that are applied on this function
 *      "localVariables": [],      // Local variable declaration nodes
 *      "parameters": []           // Parameter types of the function in order of definition
 *      "returns": []              // list of return vars as { type: ... , name: ... }
 *    }
 *  ],
 *  "modifiers": [],              // Modifiers definded by the contract, format similar to functions
 *  "inheritsFrom": [],           // Names of contract this one inherits from in order of definition
 *  "stateVariables": []          // AST nodes of all State variables
 * }
 *
 * @relevantNodeFilter {ASTNode -> bool} function that selects relevant ast nodes for analysis on function level.
 * @contractsOut {list} return list for high level AST view
 * @return {ASTNode -> void} returns a function that can be used as visit function for static analysis modules, to build up a higher level AST view for further analysis.
 */
abstractAstView.prototype.build_visit = function (relevantNodeFilter) {
  var that = this
  return function (node) {
    if (common.isContractDefinition(node)) {
      setCurrentContract(that, {
        node: node,
        functions: [],
        relevantNodes: [],
        modifiers: [],
        inheritsFrom: [],
        stateVariables: common.getStateVariableDeclarationsFormContractNode(node)
      })
    } else if (common.isInheritanceSpecifier(node)) {
      const currentContract = getCurrentContract(that)
      const inheritsFromName = common.getInheritsFromName(node)
      currentContract.inheritsFrom.push(inheritsFromName)
    } else if (common.isFunctionDefinition(node)) {
      setCurrentFunction(that, {
        node: node,
        relevantNodes: [],
        modifierInvocations: [],
        localVariables: getLocalVariables(node),
        parameters: getLocalParameters(node),
        returns: getReturnParameters(node)
      })
      // push back relevant nodes to their the current fn if any
      getCurrentContract(that).relevantNodes.map((item) => {
        if (item.referencedDeclaration === node.id) {
          getCurrentFunction(that).relevantNodes.push(item.node)
        }
      })
    } else if (common.isModifierDefinition(node)) {
      setCurrentModifier(that, {
        node: node,
        relevantNodes: [],
        localVariables: getLocalVariables(node),
        parameters: getLocalParameters(node)
      })
    } else if (common.isModifierInvocation(node)) {
      if (!that.isFunctionNotModifier) throw new Error('abstractAstView.js: Found modifier invocation outside of function scope.')
      getCurrentFunction(that).modifierInvocations.push(node)
    } else if (relevantNodeFilter(node)) {
      let scope = (that.isFunctionNotModifier) ? getCurrentFunction(that) : getCurrentModifier(that)
      if (scope) {
        scope.relevantNodes.push(node)
      } else {
        scope = getCurrentContract(that) // if we are not in a function scope, add the node to the contract scope
        if (scope && node.children[0] && node.children[0].attributes && node.children[0].attributes.referencedDeclaration) {
          scope.relevantNodes.push({ referencedDeclaration: node.children[0].attributes.referencedDeclaration, node: node })
        }
      }
    }
  }
}

abstractAstView.prototype.build_report = function (wrap) {
  var that = this
  return function (compilationResult) {
    resolveStateVariablesInHierarchy(that.contracts)
    return wrap(that.contracts, that.multipleContractsWithSameName)
  }
}

function resolveStateVariablesInHierarchy (contracts) {
  contracts.map((c) => {
    resolveStateVariablesInHierarchyForContract(c, contracts)
  })
}

function resolveStateVariablesInHierarchyForContract (currentContract, contracts) {
  currentContract.inheritsFrom.map((inheritsFromName) => {
    // add variables from inherited contracts
    const inheritsFrom = contracts.find((contract) => common.getContractName(contract.node) === inheritsFromName)
    if (inheritsFrom) {
      currentContract.stateVariables = currentContract.stateVariables.concat(inheritsFrom.stateVariables)
    } else {
      console.log('abstractAstView.js: could not find contract defintion inherited from ' + inheritsFromName)
    }
  })
}

function setCurrentContract (that, contract) {
  const name = common.getContractName(contract.node)
  if (that.contracts.map((c) => common.getContractName(c.node)).filter((n) => n === name).length > 0) {
    console.log('abstractAstView.js: two or more contracts with the same name dectected, import aliases not supported at the moment')
    that.multipleContractsWithSameName = true
  }
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

function getReturnParameters (funcNode) {
  return getLocalVariables(common.getFunctionOrModifierDefinitionReturnParameterPart(funcNode)).map((n) => {
    return {
      type: common.getType(n),
      name: common.getDeclaredVariableName(n)
    }
  })
}

function getLocalVariables (funcNode) {
  const locals = []
  new AstWalker().walk(funcNode, {'*': function (node) {
    if (common.isVariableDeclaration(node)) locals.push(node)
    return true
  }})
  return locals
}

module.exports = abstractAstView
