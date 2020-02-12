import { default as category } from './categories'
import { isLoop, isBlock, getLoopBlockStartIndex, isExpressionStatement, isTransfer } from './staticAnalysisCommon'

export default class etherTransferInLoop {
  relevantNodes: any[] = []
  name = 'Ether transfer in a loop: '
  desc = 'Avoid transferring Ether to multiple addresses in a loop'
  category = category.GAS
  
  visit (node) {
    if (isLoop(node)) {
      let transferNodes = []
      const loopBlockStartIndex = getLoopBlockStartIndex(node)
      if (loopBlockStartIndex && isBlock(node.children[loopBlockStartIndex])) {
        transferNodes = node.children[loopBlockStartIndex].children
        .filter(child => (isExpressionStatement(child) &&
                      child.children[0].name === 'FunctionCall' &&
                      isTransfer(child.children[0].children[0])))
        if (transferNodes.length > 0) {
          this.relevantNodes.push(...transferNodes)
        }
      }
    }
  }

  report (compilationResults) {
    return this.relevantNodes.map((node) => {
      return {
        warning: 'Ether payout should not be done in a loop: Due to the block gas limit, transactions can only consume a certain amount of gas. The number of iterations in a loop can grow beyond the block gas limit which can cause the complete contract to be stalled at a certain point. If required then make sure that number of iterations are low and you trust each address involved.',
        location: node.src,
        more: 'https://solidity.readthedocs.io/en/latest/security-considerations.html#gas-limit-and-loops'
      }
    })
  }
}
