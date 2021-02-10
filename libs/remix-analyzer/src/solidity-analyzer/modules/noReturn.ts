import category from './categories'
import { hasFunctionBody, getFullQuallyfiedFuncDefinitionIdent, getEffectedVariableName } from './staticAnalysisCommon'
import algorithm from './algorithmCategories'
import AbstractAst from './abstractAstView'
import {
  AnalyzerModule, ModuleAlgorithm, ModuleCategory, ReportObj, ContractHLAst, FunctionHLAst,
  VisitFunction, ReportFunction, ReturnAstNode, AssignmentAstNode, SupportedVersion
} from './../../types'

export default class noReturn implements AnalyzerModule {
  name = 'No return: '
  description = 'Function with \'returns\' not returning'
  category: ModuleCategory = category.MISC
  algorithm: ModuleAlgorithm = algorithm.EXACT
  version: SupportedVersion = {
    start: '0.4.12'
  }

  abstractAst: AbstractAst = new AbstractAst()

  visit: VisitFunction = this.abstractAst.build_visit(
    (node: ReturnAstNode | AssignmentAstNode) => node.nodeType === 'Return' || node.nodeType === 'Assignment'
  )

  report: ReportFunction = this.abstractAst.build_report(this._report.bind(this))
  private _report (contracts: ContractHLAst[], multipleContractsWithSameName: boolean, version: string): ReportObj[] {
    const warnings: ReportObj[] = []

    contracts.forEach((contract: ContractHLAst) => {
      contract.functions.filter((func: FunctionHLAst) => hasFunctionBody(func.node)).forEach((func: FunctionHLAst) => {
        const funcName: string = getFullQuallyfiedFuncDefinitionIdent(contract.node, func.node, func.parameters)
        if (this.hasNamedAndUnnamedReturns(func)) {
          warnings.push({
            warning: `${funcName}: Mixing of named and unnamed return parameters is not advised.`,
            location: func.node.src
          })
        } else if (this.shouldReturn(func) && !(this.hasReturnStatement(func) || (this.hasNamedReturns(func) && this.hasAssignToAllNamedReturns(func)))) {
          warnings.push({
            warning: `${funcName}: Defines a return type but never explicitly returns a value.`,
            location: func.node.src
          })
        }
      })
    })
    return warnings
  }

  private shouldReturn (func: FunctionHLAst): boolean {
    return func.returns.length > 0
  }

  private hasReturnStatement (func: FunctionHLAst): boolean {
    return func.relevantNodes.filter(n => n.nodeType === 'Return').length > 0
  }

  private hasAssignToAllNamedReturns (func: FunctionHLAst): boolean {
    const namedReturns: string[] = func.returns.filter(n => n.name.length > 0).map((n) => n.name)
    const assignedVars: string[] = func.relevantNodes.filter(n => n.nodeType === 'Assignment').map(getEffectedVariableName)
    const diff: string[] = namedReturns.filter(e => !assignedVars.includes(e))
    return diff.length === 0
  }

  private hasNamedReturns (func: FunctionHLAst): boolean {
    return func.returns.filter((n) => n.name.length > 0).length > 0
  }

  private hasNamedAndUnnamedReturns (func: FunctionHLAst): boolean {
    return func.returns.filter((n) => n.name.length === 0).length > 0 && this.hasNamedReturns(func)
  }
}
