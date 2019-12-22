const name = 'Result not used: '
const desc = 'The result of an operation was not used.'
const categories = require('./categories')
const common = require('./staticAnalysisCommon')
const algo = require('./algorithmCategories')

function assignAndCompare () {
  this.warningNodes = []
}

assignAndCompare.prototype.visit = function (node) {
  if (common.isSubScopeWithTopLevelUnAssignedBinOp(node)) common.getUnAssignedTopLevelBinOps(node).forEach((n) => this.warningNodes.push(n))
}

assignAndCompare.prototype.report = function (compilationResults) {
  return this.warningNodes.map((item, i) => {
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
