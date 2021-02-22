import category from './categories'
import { isIntDivision } from './staticAnalysisCommon'
import algorithm from './algorithmCategories'
import { AnalyzerModule, ModuleAlgorithm, ModuleCategory, ReportObj, CompilationResult, BinaryOperationAstNode, SupportedVersion } from './../../types'

export default class intDivisionTruncate implements AnalyzerModule {
  warningNodes: BinaryOperationAstNode[] = []
  name = 'Data truncated: '
  description = 'Division on int/uint values truncates the result'
  category: ModuleCategory = category.MISC
  algorithm: ModuleAlgorithm = algorithm.EXACT
  version: SupportedVersion = {
    start: '0.4.12'
  }

  visit (node: BinaryOperationAstNode): void {
    if (isIntDivision(node)) this.warningNodes.push(node)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  report (compilationResults: CompilationResult): ReportObj[] {
    return this.warningNodes.map((item) => {
      return {
        warning: 'Division of integer values yields an integer value again. That means e.g. 10 / 100 = 0 instead of 0.1 since the result is an integer again. This does not hold for division of (only) literal values since those yield rational constants.',
        location: item.src
      }
    })
  }
}
