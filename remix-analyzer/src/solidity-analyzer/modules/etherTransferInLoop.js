const name = 'Ether transfer in a loop: '
const desc = 'Avoid transferring Ether to multiple addresses in a loop'
const categories = require('./categories')
const common = require('./staticAnalysisCommon')

function etherTransferInLoop () {
  this.relevantNodes = []
}

etherTransferInLoop.prototype.visit = function (node) {
  if (common.isLoop(node)) {
    let transferNodes = []
    const loopBlockStartIndex = common.getLoopBlockStartIndex(node)
    if (common.isBlock(node.children[loopBlockStartIndex])) {
      transferNodes = node.children[loopBlockStartIndex].children
      .filter(child => (common.isExpressionStatement(child) &&
                    child.children[0].name === 'FunctionCall' &&
                    common.isTransfer(child.children[0].children[0])))
      if (transferNodes.length > 0) {
        this.relevantNodes.push(...transferNodes)
      }
    }
  }
}

etherTransferInLoop.prototype.report = function (compilationResults) {
  return this.relevantNodes.map((node) => {
    return {
      warning: 'Ether payout should not be done in a loop: Due to the block gas limit, transactions can only consume a certain amount of gas. The number of iterations in a loop can grow beyond the block gas limit which can cause the complete contract to be stalled at a certain point. If required then make sure that number of iterations are low and you trust each address involved.',
      location: node.src,
      more: 'https://solidity.readthedocs.io/en/latest/security-considerations.html#gas-limit-and-loops'
    }
  })
}

module.exports = {
  name: name,
  description: desc,
  category: categories.GAS,
  Module: etherTransferInLoop
}
