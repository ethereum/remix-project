import { default as category } from './categories'
import { isInteraction, isEffect, isLocalCallGraphRelevantNode, getFullQuallyfiedFuncDefinitionIdent,
  isWriteOnStateVariable, isStorageVariableDeclaration, getFullQualifiedFunctionCallIdent } from './staticAnalysisCommon'
import { default as algorithm } from './algorithmCategories'
import { buildGlobalFuncCallGraph, resolveCallGraphSymbol, analyseCallGraph } from './functionCallGraph'
import  AbstractAst from './abstractAstView'
import { AnalyzerModule, ModuleAlgorithm, ModuleCategory, ReportObj, ContractHLAst, VariableDeclarationAstNode, FunctionHLAst, ContractCallGraph, Context, FunctionCallAstNode, AssignmentAstNode, UnaryOperationAstNode, InlineAssemblyAstNode} from './../../types'

export default class checksEffectsInteraction implements AnalyzerModule {
  name: string = 'Check effects: '
  description: string = 'Avoid potential reentrancy bugs'
  category: ModuleCategory = category.SECURITY
  algorithm: ModuleAlgorithm = algorithm.HEURISTIC

  abstractAst: AbstractAst = new AbstractAst()

  visit: Function = this.abstractAst.build_visit((node: FunctionCallAstNode | AssignmentAstNode | UnaryOperationAstNode | InlineAssemblyAstNode) => (
          node.nodeType === 'FunctionCall' && (isInteraction(node) || isLocalCallGraphRelevantNode(node))) || 
          ((node.nodeType === 'Assignment' || node.nodeType === 'UnaryOperation' || node.nodeType === 'InlineAssembly') && isEffect(node)))

  report: Function = this.abstractAst.build_report(this._report.bind(this))
    
  private _report (contracts: ContractHLAst[], multipleContractsWithSameName: boolean): ReportObj[] {
    const warnings: ReportObj[] = []
    const hasModifiers: boolean = contracts.some((item) => item.modifiers.length > 0)
    const callGraph: Record<string, ContractCallGraph> = buildGlobalFuncCallGraph(contracts)
    contracts.forEach((contract) => {
      contract.functions.forEach((func) => {
        func['changesState'] = this.checkIfChangesState(
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
            location: func.node['src'],
            more: 'http://solidity.readthedocs.io/en/develop/security-considerations.html#re-entrancy'
          })
        }
      })
    })
    return warnings
  }

  private getContext (callGraph: Record<string, ContractCallGraph>, currentContract: ContractHLAst, func: FunctionHLAst): Context {
    return { callGraph: callGraph, currentContract: currentContract, stateVariables: this.getStateVariables(currentContract, func) }
  }

  private getStateVariables (contract: ContractHLAst, func: FunctionHLAst): VariableDeclarationAstNode[] {
    return contract.stateVariables.concat(func.localVariables.filter(isStorageVariableDeclaration))
  }

  private isPotentialVulnerableFunction (func: FunctionHLAst, context: Context): boolean {
    let isPotentialVulnerable: boolean = false
    let interaction: boolean = false
    func.relevantNodes.forEach((node) => {
      if (isInteraction(node)) {
        interaction = true
      } else if (interaction && (isWriteOnStateVariable(node, context.stateVariables) || this.isLocalCallWithStateChange(node, context))) {
        isPotentialVulnerable = true
      }
    })
    return isPotentialVulnerable
  }

  private isLocalCallWithStateChange (node: FunctionCallAstNode, context: Context): boolean {
    if (isLocalCallGraphRelevantNode(node)) {
      const func = resolveCallGraphSymbol(context.callGraph, getFullQualifiedFunctionCallIdent(context.currentContract.node, node))
      return !func || (func && func.node['changesState'])
    }
    return false
  }

  private checkIfChangesState (startFuncName: string, context: Context): boolean {
    return analyseCallGraph(context.callGraph, startFuncName, context, (node, context) => isWriteOnStateVariable(node, context.stateVariables))
  }
}

