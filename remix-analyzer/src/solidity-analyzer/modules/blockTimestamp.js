const name = 'Block timestamp: '
const desc = 'Semantics maybe unclear'
const categories = require('./categories')
const common = require('./staticAnalysisCommon')
const algo = require('./algorithmCategories')

function blockTimestamp () {
  this.warningNowNodes = []
  this.warningblockTimestampNodes = []
}

blockTimestamp.prototype.visit = function (node) {
  if (common.isNowAccess(node)) this.warningNowNodes.push(node)
  else if (common.isBlockTimestampAccess(node)) this.warningblockTimestampNodes.push(node)
}

blockTimestamp.prototype.report = function (compilationResults) {
  return this.warningNowNodes.map((item, i) => {
    return {
      warning: `use of "now": "now" does not mean current time. Now is an alias for block.timestamp. 
                Block.timestamp can be influenced by miners to a certain degree, be careful.`,
      location: item.src,
      more: 'http://solidity.readthedocs.io/en/develop/frequently-asked-questions.html#are-timestamps-now-block-timestamp-reliable'
    }
  }).concat(this.warningblockTimestampNodes.map((item, i) => {
    return {
      warning: `use of "block.timestamp": "block.timestamp" can be influenced by miners to a certain degree. 
                That means that a miner can "choose" the block.timestamp, to a certain degree, to change the outcome of a transaction in the mined block.`,
      location: item.src,
      more: 'http://solidity.readthedocs.io/en/develop/frequently-asked-questions.html#are-timestamps-now-block-timestamp-reliable'
    }
  }))
}

module.exports = {
  name: name,
  description: desc,
  category: categories.SECURITY,
  algorithm: algo.EXACT,
  Module: blockTimestamp
}

