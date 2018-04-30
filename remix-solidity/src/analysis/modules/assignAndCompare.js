var name = 'Assign or Compare: '
var desc = 'Assign and compare operators can be confusing.'
var categories = require('./categories')
var common = require('./staticAnalysisCommon')

function assignAndCompare () {
  this.warningNodes = []
}

assignAndCompare.prototype.visit = function (node) {
  if (common.isBlockWithTopLevelUnAssignedBinOp(node)) this.warningNodes.push(node)
}

assignAndCompare.prototype.report = function (compilationResults) {
  return this.warningNodes.map(function (item, i) {
    return {
      warning: 'Use of "this" for local functions: Never use this to call functions in the same contract, it only consumes more gas than normal local calls.',
      location: item.src,
      more: 'http://solidity.readthedocs.io/en/develop/control-structures.html#external-function-calls'
    }
  })
}

module.exports = {
  name: name,
  description: desc,
  category: categories.MISC,
  Module: assignAndCompare
}
