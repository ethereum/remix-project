import { default as category } from './categories'
import { isInlineAssembly } from './staticAnalysisCommon'
import { default as algorithm } from './algorithmCategories'

export default class inlineAssembly {
  inlineAssNodes: any[] = []
  name = 'Inline assembly: '
  desc = 'Use of Inline Assembly'
  categories = category.SECURITY
  algorithm = algorithm.EXACT
  Module = this

  visit (node) {
    if (isInlineAssembly(node)) this.inlineAssNodes.push(node)
  }

  report (compilationResults) {
    return this.inlineAssNodes.map((node) => {
      return {
        warning: `CAUTION: The Contract uses inline assembly, this is only advised in rare cases. 
                  Additionally static analysis modules do not parse inline Assembly, this can lead to wrong analysis results.`,
        location: node.src,
        more: 'http://solidity.readthedocs.io/en/develop/assembly.html#solidity-assembly'
      }
    })
  }
}
