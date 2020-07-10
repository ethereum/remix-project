import { default as category } from './categories'
import { isDeleteOfDynamicArray, getCompilerVersion } from './staticAnalysisCommon'
import { default as algorithm } from './algorithmCategories'
import { AnalyzerModule, ModuleAlgorithm, ModuleCategory, ReportObj, CompilationResult, UnaryOperationAstNode, SupportedVersion} from './../../types'

export default class deleteDynamicArrays implements AnalyzerModule {
  rel: UnaryOperationAstNode[] = []
  name: string = `Delete dynamic array: `
  description: string = `Use require/assert to ensure complete deletion`
  category: ModuleCategory = category.GAS
  algorithm: ModuleAlgorithm = algorithm.EXACT
  version: SupportedVersion = {
    start: '0.4.12'
  }

  visit (node: UnaryOperationAstNode): void {
    if (isDeleteOfDynamicArray(node)) this.rel.push(node)
  }

  report (compilationResults: CompilationResult): ReportObj[] {
    const version = getCompilerVersion(compilationResults.contracts)
    return this.rel.map((node) => {
      return {
        warning: `The "delete" operation when applied to a dynamically sized array in Solidity generates code to delete each of the elements contained. If the array is large, this operation can surpass the block gas limit and raise an OOG exception. Also nested dynamically sized objects can produce the same results.`,
        location: node.src,
        more: `https://solidity.readthedocs.io/en/${version}/types.html#delete`
      }
    })
  }
}
