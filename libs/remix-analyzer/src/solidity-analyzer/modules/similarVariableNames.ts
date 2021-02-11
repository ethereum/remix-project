import category from './categories'
import { getDeclaredVariableName, getFullQuallyfiedFuncDefinitionIdent } from './staticAnalysisCommon'
import algorithm from './algorithmCategories'
import AbstractAst from './abstractAstView'
import { get } from 'fast-levenshtein'
import { util } from '@remix-project/remix-lib'
import { AstWalker } from '@remix-project/remix-astwalker'
import { AnalyzerModule, ModuleAlgorithm, ModuleCategory, ReportObj, ContractHLAst, FunctionHLAst, VariableDeclarationAstNode, VisitFunction, ReportFunction, SupportedVersion } from './../../types'

interface SimilarRecord {
  var1: string
  var2: string
  distance: number
}

export default class similarVariableNames implements AnalyzerModule {
  name = 'Similar variable names: '
  description = 'Variable names are too similar'
  category: ModuleCategory = category.MISC
  algorithm: ModuleAlgorithm = algorithm.EXACT
  version: SupportedVersion = {
    start: '0.4.12'
  }

  abstractAst:AbstractAst = new AbstractAst()

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  visit: VisitFunction = this.abstractAst.build_visit((node: any) => false)

  report: ReportFunction = this.abstractAst.build_report(this._report.bind(this))

  private _report (contracts: ContractHLAst[], multipleContractsWithSameName: boolean, version: string): ReportObj[] {
    const warnings: ReportObj[] = []
    const hasModifiers: boolean = contracts.some((item) => item.modifiers.length > 0)

    contracts.forEach((contract) => {
      contract.functions.forEach((func) => {
        const funcName: string = getFullQuallyfiedFuncDefinitionIdent(contract.node, func.node, func.parameters)
        let hasModifiersComments = ''
        if (hasModifiers) {
          hasModifiersComments = 'Note: Modifiers are currently not considered by this static analysis.'
        }
        let multipleContractsWithSameNameComments = ''
        if (multipleContractsWithSameName) {
          multipleContractsWithSameNameComments = 'Note: Import aliases are currently not supported by this static analysis.'
        }
        const vars: string[] = this.getFunctionVariables(contract, func).map(getDeclaredVariableName)
        this.findSimilarVarNames(vars).map((sim) => {
          // check if function is implemented
          if (func.node.implemented) {
            const astWalker = new AstWalker()
            const functionBody: any = func.node.body
            // Walk through all statements of function
            astWalker.walk(functionBody, (node) => {
              // check if these is an identifier node which is one of the tracked similar variables
              if ((node.nodeType === 'Identifier' || node.nodeType === 'VariableDeclaration') &&
                    (node.name === sim.var1 || node.name === sim.var2)) {
                warnings.push({
                  warning: `${funcName} : Variables have very similar names "${sim.var1}" and "${sim.var2}". ${hasModifiersComments} ${multipleContractsWithSameNameComments}`,
                  location: node.src
                })
              }
              return true
            })
          }
        })
      })
    })
    return warnings
  }

  private findSimilarVarNames (vars: string[]): SimilarRecord[] {
    const similar: SimilarRecord[] = []
    const comb: Record<string, boolean> = {}
    vars.map((varName1: string) => vars.map((varName2: string) => {
      if (varName1.length > 1 && varName2.length > 1 &&
        varName2 !== varName1 && !this.isCommonPrefixedVersion(varName1, varName2) &&
        !this.isCommonNrSuffixVersion(varName1, varName2) &&
        !(comb[varName1 + ';' + varName2] || comb[varName2 + ';' + varName1])) {
        comb[varName1 + ';' + varName2] = true
        const distance: number = get(varName1, varName2)
        if (distance <= 2) similar.push({ var1: varName1, var2: varName2, distance: distance })
      }
    }))
    return similar
  }

  private isCommonPrefixedVersion (varName1: string, varName2: string): boolean {
    return (varName1.startsWith('_') && varName1.slice(1) === varName2) || (varName2.startsWith('_') && varName2.slice(1) === varName1)
  }

  private isCommonNrSuffixVersion (varName1: string, varName2: string): boolean {
    const ref: string = '^' + util.escapeRegExp(varName1.slice(0, -1)) + '[0-9]*$'
    return varName2.match(ref) != null
  }

  private getFunctionVariables (contract: ContractHLAst, func: FunctionHLAst): VariableDeclarationAstNode[] {
    return contract.stateVariables.concat(func.localVariables)
  }
}
