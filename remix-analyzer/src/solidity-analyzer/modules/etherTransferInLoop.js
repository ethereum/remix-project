var name = 'Ether transfer in a loop: '
var desc = 'Avoid transferring Ether to multiple addresses in a loop'
var categories = require('./categories')
var common = require('./staticAnalysisCommon')

function etherTransferInLoop () {
  this.relevantNodes = []
}

etherTransferInLoop.prototype.visit = function (node) {
  if (common.isLoop(node)) {
    var loopBlockStartIndex = common.getLoopBlockStartIndex()
    var transferNodes = node.children[loopBlockStartIndex].children.filter(node => (common.isExpressionStatement(node) && common.isTransfer(node)))
    if (transferNodes.length > 0) {
      this.relevantNodes.push(...transferNodes)
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
