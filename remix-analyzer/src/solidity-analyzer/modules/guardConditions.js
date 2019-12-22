const name = 'Guard Conditions: '
const desc = 'Use require and appropriately'
const categories = require('./categories')
const common = require('./staticAnalysisCommon')
const algo = require('./algorithmCategories')

function guardConditions () {
  this.guards = []
}

guardConditions.prototype.visit = function (node) {
  if (common.isRequireCall(node) || common.isAssertCall(node)) this.guards.push(node)
}

guardConditions.prototype.report = function (compilationResults) {
  if (this.guards.length > 0) {
    return [{
      warning: 'Use assert(x) if you never ever want x to be false, not in any circumstance (apart from a bug in your code). Use require(x) if x can be false, due to e.g. invalid input or a failing external component.',
      more: 'http://solidity.readthedocs.io/en/develop/control-structures.html#error-handling-assert-require-revert-and-exceptions'
    }]
  }
  return []
}

module.exports = {
  name: name,
  description: desc,
  category: categories.MISC,
  algorithm: algo.EXACT,
  Module: guardConditions
}
