import category from './categories'
import {
  isLowLevelCall, isTransfer, isExternalDirectCall, isEffect, isLocalCallGraphRelevantNode, isSelfdestructCall,
  isDeleteUnaryOperation, isPayableFunction, isConstructor, getFullQuallyfiedFuncDefinitionIdent, hasFunctionBody,
  isConstantFunction, isWriteOnStateVariable, isStorageVariableDeclaration, isCallToNonConstLocalFunction,
  getFullQualifiedFunctionCallIdent
} from './staticAnalysisCommon'
import algorithm from './algorithmCategories'
import { buildGlobalFuncCallGraph, resolveCallGraphSymbol, analyseCallGraph } from './functionCallGraph'
import AbstractAst from './abstractAstView'
import {
  AnalyzerModule, ModuleAlgorithm, ModuleCategory, ReportObj, ContractCallGraph, Context, ContractHLAst,
  FunctionHLAst, VariableDeclarationAstNode, FunctionCallGraph, FunctionCallAstNode, VisitFunction, ReportFunction, SupportedVersion
} from './../../types'

export default class constantFunctions implements AnalyzerModule {
  name = 'Constant/View/Pure functions: '
  description = 'Potentially constant/view/pure functions'
  category: ModuleCategory = category.MISC
  algorithm: ModuleAlgorithm = algorithm.HEURISTIC
  version: SupportedVersion = {
    start: '0.4.12'
  }

  abstractAst: AbstractAst = new AbstractAst()

  visit: VisitFunction = this.abstractAst.build_visit(
    (node: any) => isLowLevelCall(node) ||
              isTransfer(node) ||
              isExternalDirectCall(node) ||
              isEffect(node) ||
              isLocalCallGraphRelevantNode(node) ||
              node.nodeType === 'InlineAssembly' ||
              node.nodeType === 'NewExpression' ||
              isSelfdestructCall(node) ||
              isDeleteUnaryOperation(node)
  )

  report: ReportFunction = this.abstractAst.build_report(this._report.bind(this))

  private _report (contracts: ContractHLAst[], multipleContractsWithSameName: boolean, version: string): ReportObj[] {
    const warnings: ReportObj[] = []
    const hasModifiers: boolean = contracts.some((item) => item.modifiers.length > 0)

    const callGraph: Record<string, ContractCallGraph> = buildGlobalFuncCallGraph(contracts)

    contracts.forEach((contract: ContractHLAst) => {
      contract.functions.forEach((func: FunctionHLAst) => {
        if (isPayableFunction(func.node) || isConstructor(func.node)) {
          func['potentiallyshouldBeConst'] = false
        } else {
          func['potentiallyshouldBeConst'] = this.checkIfShouldBeConstant(
            getFullQuallyfiedFuncDefinitionIdent(
              contract.node,
              func.node,
              func.parameters
            ),
            this.getContext(
              callGraph,
              contract,
              func
            )
          )
        }
      })
      contract.functions.filter((func: FunctionHLAst) => hasFunctionBody(func.node)).forEach((func: FunctionHLAst) => {
        if (isConstantFunction(func.node) !== func['potentiallyshouldBeConst']) {
          const funcName: string = getFullQuallyfiedFuncDefinitionIdent(contract.node, func.node, func.parameters)
          let comments: string = (hasModifiers) ? 'Note: Modifiers are currently not considered by this static analysis.' : ''
          comments += (multipleContractsWithSameName) ? 'Note: Import aliases are currently not supported by this static analysis.' : ''
          if (func['potentiallyshouldBeConst']) {
            warnings.push({
              warning: `${funcName} : Potentially should be constant/view/pure but is not. ${comments}`,
              location: func.node.src,
              more: `https://solidity.readthedocs.io/en/${version}/contracts.html#view-functions`
            })
          } else {
            warnings.push({
              warning: `${funcName} : Is constant but potentially should not be. ${comments}`,
              location: func.node.src,
              more: `https://solidity.readthedocs.io/en/${version}/contracts.html#view-functions`
            })
          }
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

  private checkIfShouldBeConstant (startFuncName: string, context: Context): boolean {
    return !analyseCallGraph(context.callGraph, startFuncName, context, this.isConstBreaker.bind(this))
  }

  private isConstBreaker (node: any, context: Context): boolean {
    return isWriteOnStateVariable(node, context.stateVariables) ||
          isLowLevelCall(node) ||
          isTransfer(node) ||
          this.isCallOnNonConstExternalInterfaceFunction(node, context) ||
          isCallToNonConstLocalFunction(node) ||
          node.nodeType === 'InlineAssembly' ||
          node.nodeType === 'NewExpression' ||
          isSelfdestructCall(node) ||
          isDeleteUnaryOperation(node)
  }

  private isCallOnNonConstExternalInterfaceFunction (node: FunctionCallAstNode, context: Context): boolean {
    if (isExternalDirectCall(node)) {
      const func: FunctionCallGraph | undefined = resolveCallGraphSymbol(context.callGraph, getFullQualifiedFunctionCallIdent(context.currentContract.node, node))
      return !func || (func && !isConstantFunction(func.node.node))
    }
    return false
  }
}
