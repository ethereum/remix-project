const name = 'This on local calls: '
const desc = 'Invocation of local functions via this'
const categories = require('./categories')
const common = require('./staticAnalysisCommon')
const algo = require('./algorithmCategories')

function thisLocal () {
  this.warningNodes = []
}

thisLocal.prototype.visit = function (node) {
  if (common.isThisLocalCall(node)) this.warningNodes.push(node)
}

thisLocal.prototype.report = function (compilationResults) {
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
  category: categories.GAS,
  algorithm: algo.EXACT,
  Module: thisLocal
}
