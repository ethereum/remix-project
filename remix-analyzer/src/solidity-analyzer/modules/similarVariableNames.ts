import { default as category } from './categories'
import { getDeclaredVariableName, getFullQuallyfiedFuncDefinitionIdent } from './staticAnalysisCommon'
import { default as algorithm } from './algorithmCategories'
import  AbstractAst from './abstractAstView'
import { get } from 'fast-levenshtein'
import { util } from 'remix-lib'
import { AnalyzerModule, ModuleAlgorithm, ModuleCategory, ReportObj, AstNodeLegacy, CompilationResult} from './../../types'

export default class similarVariableNames implements AnalyzerModule {
  name: string = 'Similar variable names: '
  description: string = 'Check if variable names are too similar'
  category: ModuleCategory = category.MISC
  algorithm: ModuleAlgorithm = algorithm.EXACT

  abstractAst:AbstractAst = new AbstractAst()

  visit = this.abstractAst.build_visit((node: AstNodeLegacy) => false)

  report = this.abstractAst.build_report(this._report.bind(this))

  private _report (contracts, multipleContractsWithSameName): ReportObj[] {
    const warnings: ReportObj[] = []
    const hasModifiers = contracts.some((item) => item.modifiers.length > 0)

    contracts.forEach((contract) => {
      contract.functions.forEach((func) => {
        const funcName = getFullQuallyfiedFuncDefinitionIdent(contract.node, func.node, func.parameters)
        let hasModifiersComments = ''
        if (hasModifiers) {
          hasModifiersComments = 'Note: Modifiers are currently not considered by this static analysis.'
        }
        let multipleContractsWithSameNameComments = ''
        if (multipleContractsWithSameName) {
          multipleContractsWithSameNameComments = 'Note: Import aliases are currently not supported by this static analysis.'
        }

        const vars = this.getFunctionVariables(contract, func).map(getDeclaredVariableName)

        this.findSimilarVarNames(vars).map((sim) => {
          warnings.push({
            warning: `${funcName} : Variables have very similar names ${sim.var1} and ${sim.var2}. ${hasModifiersComments} ${multipleContractsWithSameNameComments}`,
            location: func.src
          })
        })
      })
    })

    return warnings
  }

  private findSimilarVarNames (vars: string[]): Record<string, any>[] {
    const similar: Record<string, any>[] = []
    const comb: Record<string, boolean> = {}
    vars.map((varName1) => vars.map((varName2) => {
      if (varName1.length > 1 && varName2.length > 1 && varName2 !== varName1 && !this.isCommonPrefixedVersion(varName1, varName2) && !this.isCommonNrSuffixVersion(varName1, varName2) && !(comb[varName1 + ';' + varName2] || comb[varName2 + ';' + varName1])) {
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

  private getFunctionVariables (contract, func) {
    return contract.stateVariables.concat(func.localVariables)
  }
}
