import category from './categories'
import algorithm from './algorithmCategories'
import { isDeleteFromDynamicArray, isMappingIndexAccess } from './staticAnalysisCommon'
import { AnalyzerModule, ModuleAlgorithm, ModuleCategory, ReportObj, CompilationResult, UnaryOperationAstNode, SupportedVersion } from './../../types'

export default class deleteFromDynamicArray implements AnalyzerModule {
  relevantNodes: UnaryOperationAstNode[] = []
  name = 'Delete from dynamic array: '
  description = '\'delete\' leaves a gap in array'
  category: ModuleCategory = category.MISC
  algorithm: ModuleAlgorithm = algorithm.EXACT
  version: SupportedVersion = {
    start: '0.4.12'
  }

  visit (node: UnaryOperationAstNode): void {
    if (isDeleteFromDynamicArray(node) && !isMappingIndexAccess(node.subExpression)) this.relevantNodes.push(node)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  report (compilationResults: CompilationResult): ReportObj[] {
    return this.relevantNodes.map((node) => {
      return {
        warning: 'Using "delete" on an array leaves a gap. The length of the array remains the same. If you want to remove the empty position you need to shift items manually and update the "length" property.',
        location: node.src,
        more: 'https://github.com/miguelmota/solidity-idiosyncrasies#examples'
      }
    })
  }
}
