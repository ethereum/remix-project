import { default as category } from './categories'
import { default as algorithm } from './algorithmCategories'
import { AnalyzerModule, ModuleAlgorithm, ModuleCategory, ReportObj, CompilationResult, InlineAssemblyAstNode} from './../../types'

export default class inlineAssembly implements AnalyzerModule {
  inlineAssNodes: InlineAssemblyAstNode[] = []
  name: string = `Inline assembly: `
  description: string = `Inline assembly used`
  category: ModuleCategory = category.SECURITY
  algorithm: ModuleAlgorithm = algorithm.EXACT

  visit (node: InlineAssemblyAstNode): void {
    if(node.nodeType === 'InlineAssembly') this.inlineAssNodes.push(node)
  }

  report (compilationResults: CompilationResult): ReportObj[] {
    return this.inlineAssNodes.map((node) => {
      return {
        warning: `The Contract uses inline assembly, this is only advised in rare cases. 
                  Additionally static analysis modules do not parse inline Assembly, this can lead to wrong analysis results.`,
        location: node.src,
        more: 'http://solidity.readthedocs.io/en/develop/assembly.html#solidity-assembly'
      }
    })
  }
}
