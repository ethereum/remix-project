var name = 'Result not used: '
var desc = 'The result of an operation was not used.'
var categories = require('./categories')
var common = require('./staticAnalysisCommon')
var algo = require('./algorithmCategories')

function assignAndCompare () {
  this.warningNodes = []
}

assignAndCompare.prototype.visit = function (node) {
  if (common.isSubScopeWithTopLevelUnAssignedBinOp(node)) common.getUnAssignedTopLevelBinOps(node).forEach((n) => this.warningNodes.push(n))
}

assignAndCompare.prototype.report = function (compilationResults) {
  return this.warningNodes.map(function (item, i) {
    return {
      warning: 'A binary operation yields a value that is not used in the following. This is often caused by confusing assignment (=) and comparison (==).',
      location: item.src
    }
  })
}

module.exports = {
  name: name,
  description: desc,
  category: categories.MISC,
  algorithm: algo.EXACT,
  Module: assignAndCompare
}
