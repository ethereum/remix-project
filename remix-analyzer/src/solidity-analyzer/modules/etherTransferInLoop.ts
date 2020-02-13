import { default as category } from './categories'
import { default as algorithm } from './algorithmCategories'
import { isLoop, isBlock, getLoopBlockStartIndex, isExpressionStatement, isTransfer } from './staticAnalysisCommon'
import { AnalyzerModule, ModuleAlgorithm, ModuleCategory, ReportObj, AstNodeLegacy, CompilationResult} from './../../types'

export default class etherTransferInLoop implements AnalyzerModule {
  relevantNodes: AstNodeLegacy[] = []
  name: string = 'Ether transfer in a loop: '
  description: string = 'Avoid transferring Ether to multiple addresses in a loop'
  category: ModuleCategory = category.GAS
  algorithm: ModuleAlgorithm = algorithm.EXACT
  
  visit (node: AstNodeLegacy): void {
    if (isLoop(node)) {
      let transferNodes: AstNodeLegacy[] = []
      const loopBlockStartIndex: number | undefined = getLoopBlockStartIndex(node)
      if (loopBlockStartIndex && node.children && isBlock(node.children[loopBlockStartIndex])) {
        const childrenNodes: AstNodeLegacy[] | undefined = node.children[loopBlockStartIndex].children
        if(childrenNodes)  
          transferNodes = childrenNodes.filter(child => (
                            isExpressionStatement(child) && 
                            child.children &&
                            child.children[0].name === 'FunctionCall' &&
                            child.children[0].children &&
                            isTransfer(child.children[0].children[0])
                            )
                          )
        if (transferNodes.length > 0) {
          this.relevantNodes.push(...transferNodes)
        }
      }
    }
  }

  report (compilationResults: CompilationResult): ReportObj[] {
    return this.relevantNodes.map((node) => {
      return {
        warning: 'Ether payout should not be done in a loop: Due to the block gas limit, transactions can only consume a certain amount of gas. The number of iterations in a loop can grow beyond the block gas limit which can cause the complete contract to be stalled at a certain point. If required then make sure that number of iterations are low and you trust each address involved.',
        location: node.src,
        more: 'https://solidity.readthedocs.io/en/latest/security-considerations.html#gas-limit-and-loops'
      }
    })
  }
}
