import { default as category } from './categories'
import { isReturn, isAssignment, hasFunctionBody, getFullQuallyfiedFuncDefinitionIdent, getEffectedVariableName } from './staticAnalysisCommon'
import { default as algorithm } from './algorithmCategories'
import  AbstractAst from './abstractAstView'

export default class noReturn {
  name = 'no return: '
  desc = 'Function with return type is not returning'
  categories = category.MISC
  algorithm = algorithm.EXACT
  Module = this

  abstractAst = new AbstractAst()

  visit = this.abstractAst.build_visit(
    (node) => isReturn(node) || isAssignment(node)
  )

  report = this.abstractAst.build_report(this._report)
  private _report (contracts, multipleContractsWithSameName) {
    const warnings: any[] = []

    contracts.forEach((contract) => {
      contract.functions.filter((func) => hasFunctionBody(func.node)).forEach((func) => {
        const funcName = getFullQuallyfiedFuncDefinitionIdent(contract.node, func.node, func.parameters)
        if (this.hasNamedAndUnnamedReturns(func)) {
          warnings.push({
            warning: `${funcName}: Mixing of named and unnamed return parameters is not advised.`,
            location: func.src
          })
        } else if (this.shouldReturn(func) && !(this.hasReturnStatement(func) || (this.hasNamedReturns(func) && this.hasAssignToAllNamedReturns(func)))) {
          warnings.push({
            warning: `${funcName}: Defines a return type but never explicitly returns a value.`,
            location: func.src
          })
        }
      })
    })

    return warnings
  }

  private shouldReturn (func) {
    return func.returns.length > 0
  }

  private hasReturnStatement (func) {
    return func.relevantNodes.filter(isReturn).length > 0
  }

  private hasAssignToAllNamedReturns (func) {
    const namedReturns = func.returns.filter((n) => n.name.length > 0).map((n) => n.name)
    const assignedVars = func.relevantNodes.filter(isAssignment).map(getEffectedVariableName)
    const diff = namedReturns.filter(e => !assignedVars.includes(e))
    return diff.length === 0
  }

  private hasNamedReturns (func) {
    return func.returns.filter((n) => n.name.length > 0).length > 0
  }

  private hasNamedAndUnnamedReturns (func) {
    return func.returns.filter((n) => n.name.length === 0).length > 0 &&
            this.hasNamedReturns(func)
  }
}
