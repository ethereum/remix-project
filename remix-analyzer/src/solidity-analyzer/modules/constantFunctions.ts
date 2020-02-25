import { default as category } from './categories'
import { isLowLevelCall, isTransfer, isExternalDirectCall, isEffect, isLocalCallGraphRelevantNode, 
  isSelfdestructCall, isDeleteUnaryOperation, isPayableFunction,
  isConstructor, getFullQuallyfiedFuncDefinitionIdent, hasFunctionBody, isConstantFunction, isWriteOnStateVariable,
  isStorageVariableDeclaration, isCallToNonConstLocalFunction, getFullQualifiedFunctionCallIdent} from './staticAnalysisCommon'
import { default as algorithm } from './algorithmCategories'
import { buildGlobalFuncCallGraph, resolveCallGraphSymbol, analyseCallGraph } from './functionCallGraph'
import  AbstractAst from './abstractAstView'
import { AnalyzerModule, ModuleAlgorithm, ModuleCategory, ReportObj, AstNodeLegacy, CompilationResult, CommonAstNode} from './../../types'

export default class constantFunctions implements AnalyzerModule {
  name: string = 'Constant functions: '
  description: string = 'Check for potentially constant functions'
  category: ModuleCategory = category.MISC
  algorithm: ModuleAlgorithm = algorithm.HEURISTIC

  abstractAst: AbstractAst = new AbstractAst()

  visit = this.abstractAst.build_visit(
    (node: CommonAstNode) => isLowLevelCall(node) ||
              isTransfer(node) ||
              isExternalDirectCall(node) ||
              isEffect(node) ||
              isLocalCallGraphRelevantNode(node) ||
              node.nodeType === "InlineAssembly" ||
              node.nodeType === "NewExpression" ||
              isSelfdestructCall(node) ||
              isDeleteUnaryOperation(node)
  )

  report = this.abstractAst.build_report(this._report.bind(this))

  private _report (contracts, multipleContractsWithSameName): ReportObj[] {
    const warnings: ReportObj[] = []
    const hasModifiers = contracts.some((item) => item.modifiers.length > 0)

    const callGraph = buildGlobalFuncCallGraph(contracts)

    contracts.forEach((contract) => {
      contract.functions.forEach((func) => {
        if (isPayableFunction(func.node) || isConstructor(func.node)) {
          func.potentiallyshouldBeConst = false
        } else {
          func.potentiallyshouldBeConst = this.checkIfShouldBeConstant(
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

      contract.functions.filter((func) => hasFunctionBody(func.node)).forEach((func) => {
        if (isConstantFunction(func.node) !== func.potentiallyshouldBeConst) {
          const funcName = getFullQuallyfiedFuncDefinitionIdent(contract.node, func.node, func.parameters)
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

  private getContext (callGraph, currentContract, func) {
    return { callGraph: callGraph, currentContract: currentContract, stateVariables: this.getStateVariables(currentContract, func) }
  }

  private getStateVariables (contract, func) {
    return contract.stateVariables.concat(func.localVariables.filter(isStorageVariableDeclaration))
  }

  private checkIfShouldBeConstant (startFuncName, context) {
    return !analyseCallGraph(context.callGraph, startFuncName, context, this.isConstBreaker.bind(this))
  }

  private isConstBreaker (node, context) {
    return isWriteOnStateVariable(node, context.stateVariables) ||
          isLowLevelCall(node) ||
          isTransfer(node) ||
          this.isCallOnNonConstExternalInterfaceFunction(node, context) ||
          isCallToNonConstLocalFunction(node) ||
          node.nodeType === "InlineAssembly" ||
          node.nodeType === "NewExpression" ||
          isSelfdestructCall(node) ||
          isDeleteUnaryOperation(node)
  }

  private isCallOnNonConstExternalInterfaceFunction (node, context) {
    if (isExternalDirectCall(node)) {
      const func = resolveCallGraphSymbol(context.callGraph, getFullQualifiedFunctionCallIdent(context.currentContract, node))
      return !func || (func && !isConstantFunction(func.node.node))
    }
    return false
  }
}
