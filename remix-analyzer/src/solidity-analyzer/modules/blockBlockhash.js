const name = 'Block.blockhash usage: '
const desc = 'Semantics maybe unclear'
const categories = require('./categories')
const common = require('./staticAnalysisCommon')
const algo = require('./algorithmCategories')

function blockBlockhash () {
  this.warningNodes = []
}

blockBlockhash.prototype.visit = function (node) {
  if (common.isBlockBlockHashAccess(node)) this.warningNodes.push(node)
}

blockBlockhash.prototype.report = function (compilationResults) {
  return this.warningNodes.map((item, i) => {
    return {
      warning: `use of "block.blockhash": "block.blockhash" is used to access the last 256 block hashes. 
                A miner computes the block hash by "summing up" the information in the current block mined. 
                By "summing up" the information in a clever way a miner can try to influence the outcome of a transaction in the current block. 
                This is especially easy if there are only a small number of equally likely outcomes.`,
      location: item.src
    }
  })
}

module.exports = {
  name: name,
  description: desc,
  category: categories.SECURITY,
  algorithm: algo.EXACT,
  Module: blockBlockhash
}

