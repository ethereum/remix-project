import { default as category } from './categories'
import { isDeleteOfDynamicArray } from './staticAnalysisCommon'
import { default as algorithm } from './algorithmCategories'
import { AnalyzerModule, ModuleAlgorithm, ModuleCategory, ReportObj, CompilationResult, UnaryOperationAstNode} from './../../types'

export default class deleteDynamicArrays implements AnalyzerModule {
  rel: UnaryOperationAstNode[] = []
  name: string = `Delete dynamic array: `
  description: string = `Use require/assert to ensure complete deletion`
  category: ModuleCategory = category.GAS
  algorithm: ModuleAlgorithm = algorithm.EXACT

  visit (node: UnaryOperationAstNode): void {
    if (isDeleteOfDynamicArray(node)) this.rel.push(node)
  }

  report (compilationResults: CompilationResult): ReportObj[] {
    return this.rel.map((node) => {
      return {
        warning: `The "delete" operation when applied to a dynamically sized array in Solidity generates code to delete each of the elements contained. If the array is large, this operation can surpass the block gas limit and raise an OOG exception. Also nested dynamically sized objects can produce the same results.`,
        location: node.src,
        more: 'https://solidity.readthedocs.io/en/latest/types.html#delete'
      }
    })
  }
}
