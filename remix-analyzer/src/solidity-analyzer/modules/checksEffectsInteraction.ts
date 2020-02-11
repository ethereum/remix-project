import { default as category } from './categories'
import { isInteraction, isEffect, isLocalCallGraphRelevantNode, getFullQuallyfiedFuncDefinitionIdent,
  isWriteOnStateVariable, isStorageVariableDeclaration, getFullQualifiedFunctionCallIdent } from './staticAnalysisCommon'
import { default as algorithm } from './algorithmCategories'
import { buildGlobalFuncCallGraph, resolveCallGraphSymbol, analyseCallGraph } from './functionCallGraph'
import  AbstractAst from './abstractAstView'

export default class checksEffectsInteraction {
  
  name = 'Check effects: '
  desc = 'Avoid potential reentrancy bugs'
  categories = category.SECURITY
  algorithm = algorithm.HEURISTIC
  Module = this

  abstractAst = new AbstractAst()

  visit = this.abstractAst.build_visit((node) => isInteraction(node) || isEffect(node) || isLocalCallGraphRelevantNode(node))

  report = this.abstractAst.build_report(this._report)
    
  private _report (contracts, multipleContractsWithSameName) {
    const warnings: any = []
    const hasModifiers = contracts.some((item) => item.modifiers.length > 0)
    const callGraph = buildGlobalFuncCallGraph(contracts)
    contracts.forEach((contract) => {
      contract.functions.forEach((func) => {
        func.changesState = this.checkIfChangesState(
                              getFullQuallyfiedFuncDefinitionIdent(
                                contract.node, 
                                func.node, 
                                func.parameters
                              ),
                              this.getContext(
                                callGraph, 
                                contract, 
                                func)
                              )
      })
      contract.functions.forEach((func) => {
        if (this.isPotentialVulnerableFunction(func, this.getContext(callGraph, contract, func))) {
          const funcName = getFullQuallyfiedFuncDefinitionIdent(contract.node, func.node, func.parameters)
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

  private getContext (callGraph, currentContract, func) {
    return { callGraph: callGraph, currentContract: currentContract, stateVariables: this.getStateVariables(currentContract, func) }
  }

  private getStateVariables (contract, func) {
    return contract.stateVariables.concat(func.localVariables.filter(isStorageVariableDeclaration))
  }

  private isPotentialVulnerableFunction (func, context) {
    let isPotentialVulnerable = false
    let interaction = false
    func.relevantNodes.forEach((node) => {
      if (isInteraction(node)) {
        interaction = true
      } else if (interaction && (isWriteOnStateVariable(node, context.stateVariables) || this.isLocalCallWithStateChange(node, context))) {
        isPotentialVulnerable = true
      }
    })
    return isPotentialVulnerable
  }

  private isLocalCallWithStateChange (node, context) {
    if (isLocalCallGraphRelevantNode(node)) {
      const func = resolveCallGraphSymbol(context.callGraph, getFullQualifiedFunctionCallIdent(context.currentContract.node, node))
      return !func || (func && func.node.changesState)
    }
    return false
  }

  private checkIfChangesState (startFuncName, context) {
    return analyseCallGraph(context.callGraph, startFuncName, context, (node, context) => isWriteOnStateVariable(node, context.stateVariables))
  }
}

