import { getStateVariableDeclarationsFormContractNode,
  getInheritsFromName, getContractName,
  getFunctionOrModifierDefinitionParameterPart, getType, getDeclaredVariableName,
  getFunctionDefinitionReturnParameterPart } from './staticAnalysisCommon'
import { AstWalker } from 'remix-astwalker'
import { CommonAstNode, FunctionDefinitionAstNode, ParameterListAstNode, ModifierDefinitionAstNode, ContractHLAst, VariableDeclarationStatementAstNode, VariableDeclarationAstNode, FunctionHLAst } from 'types'

export default class abstractAstView {
  contracts: ContractHLAst[] = []
  currentContractIndex: number = -1
  currentFunctionIndex: number = -1
  currentModifierIndex: number = -1
  isFunctionNotModifier: boolean = false
  /*
    file1: contract c{}
    file2: import "file1" as x; contract c{}
    therefore we have two contracts with the same name c. At the moment this is not handled because alias name "x" is not
    available in the current AST implementation thus can not be resolved.
    Additionally the fullQuallified function names e.g. [contractName].[functionName](param1Type, param2Type, ... ) must be prefixed to
    fully support this and when inheritance is resolved it must include alias resolving e.g x.c = file1.c
  */
  multipleContractsWithSameName: boolean = false


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
  build_visit (relevantNodeFilter: Function): Function {
    var that = this
    return function (node: any) {
      if (node.nodeType === "ContractDefinition") {
        that.setCurrentContract(that, {
          node: node,
          functions: [],
          relevantNodes: [],
          modifiers: [],
          inheritsFrom: [],
          stateVariables: getStateVariableDeclarationsFormContractNode(node)
        })
      } else if (node.nodeType === "InheritanceSpecifier") {
        const currentContract = that.getCurrentContract(that)
        const inheritsFromName = getInheritsFromName(node)
        currentContract.inheritsFrom.push(inheritsFromName)
      } else if (node.nodeType === "FunctionDefinition") {
        that.setCurrentFunction(that, {
          node: node,
          relevantNodes: [],
          modifierInvocations: [],
          localVariables: that.getLocalVariables(node),
          parameters: that.getLocalParameters(node),
          returns: that.getReturnParameters(node)
        })
        // push back relevant nodes to their the current fn if any
        that.getCurrentContract(that).relevantNodes.map((item) => {
          if (item.referencedDeclaration === node.id) {
            that.getCurrentFunction(that).relevantNodes.push(item.node)
          }
        })
      } else if (node.nodeType === "ModifierDefinition") {
        that.setCurrentModifier(that, {
          node: node,
          relevantNodes: [],
          localVariables: that.getLocalVariables(node),
          parameters: that.getLocalParameters(node)
        })
      } else if (node.nodeType === "ModifierInvocation") {
        if (!that.isFunctionNotModifier) throw new Error('abstractAstView.js: Found modifier invocation outside of function scope.')
        that.getCurrentFunction(that).modifierInvocations.push(node)
      } else if (relevantNodeFilter(node)) {
        let scope: any = (that.isFunctionNotModifier) ? that.getCurrentFunction(that) : that.getCurrentModifier(that)
        if (scope) {
          scope.relevantNodes.push(node)
        } else {
          scope = that.getCurrentContract(that) // if we are not in a function scope, add the node to the contract scope
          if (scope && node.referencedDeclaration) {
            scope.relevantNodes.push({ referencedDeclaration: node.referencedDeclaration, node: node })
          }
        }
      }
    }
  }

  build_report (wrap: Function): Function {
    const that: abstractAstView = this
    return function (compilationResult) {
      that.resolveStateVariablesInHierarchy(that.contracts)
      return wrap(that.contracts, that.multipleContractsWithSameName)
    }
  }

  private resolveStateVariablesInHierarchy (contracts: ContractHLAst[]): void {
    contracts.map((c) => {
      this.resolveStateVariablesInHierarchyForContract(c, contracts)
    })
  }

  private resolveStateVariablesInHierarchyForContract (currentContract: ContractHLAst, contracts: ContractHLAst[]): void {
    currentContract.inheritsFrom.map((inheritsFromName) => {
      // add variables from inherited contracts
      const inheritsFrom = contracts.find((contract) => getContractName(contract.node) === inheritsFromName)
      if (inheritsFrom) {
        currentContract.stateVariables = currentContract.stateVariables.concat(inheritsFrom.stateVariables)
      } else {
        console.log('abstractAstView.js: could not find contract defintion inherited from ' + inheritsFromName)
      }
    })
  }

  private setCurrentContract (that: abstractAstView, contract: ContractHLAst): void {
    const name: string = getContractName(contract.node)
    if (that.contracts.map((c) => getContractName(c.node)).filter((n) => n === name).length > 0) {
      console.log('abstractAstView.js: two or more contracts with the same name dectected, import aliases not supported at the moment')
      that.multipleContractsWithSameName = true
    }
    that.currentContractIndex = (that.contracts.push(contract) - 1)
  }

  private setCurrentFunction (that: abstractAstView, func: FunctionHLAst): void {
    that.isFunctionNotModifier = true
    that.currentFunctionIndex = (that.getCurrentContract(that).functions.push(func) - 1)
  }

  private setCurrentModifier (that, modi): void {
    that.isFunctionNotModifier = false
    that.currentModifierIndex = (that.getCurrentContract(that).modifiers.push(modi) - 1)
  }

  private getCurrentContract (that: abstractAstView): ContractHLAst {
    return that.contracts[that.currentContractIndex]
  }

  private getCurrentFunction (that: abstractAstView): FunctionHLAst {
    return that.getCurrentContract(that).functions[that.currentFunctionIndex]
  }

  private getCurrentModifier (that:abstractAstView) {
    return that.getCurrentContract(that).modifiers[that.currentModifierIndex]
  }

  private getLocalParameters (funcNode: FunctionDefinitionAstNode | ModifierDefinitionAstNode): string[] {
    return getFunctionOrModifierDefinitionParameterPart(funcNode).parameters.map(getType)
  }

  private getReturnParameters (funcNode: FunctionDefinitionAstNode): Record<string, string>[] {
    return this.getLocalVariables(getFunctionDefinitionReturnParameterPart(funcNode)).map((n) => {
      return {
        type: getType(n),
        name: getDeclaredVariableName(n)
      }
    })
  }

  private getLocalVariables (funcNode: ParameterListAstNode): VariableDeclarationAstNode[] {
    const locals: VariableDeclarationAstNode[] = []
    new AstWalker().walk(funcNode, {'*': function (node) {
      if (node.nodeType === "VariableDeclaration") locals.push(node)
      return true
    }})
    return locals
  }
}
