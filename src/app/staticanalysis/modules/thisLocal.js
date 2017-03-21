var name = 'this on local'
var desc = 'Invocation of local functions via this'
var categories = require('./categories')
var common = require('./staticAnalysisCommon')

function thisLocal () {
  this.warningNodes = []
}

thisLocal.prototype.visit = function (node) {
  if (common.isThisLocalCall(node)) this.warningNodes.push(node)
}

thisLocal.prototype.report = function (compilationResults) {
  this.warningNowNodes = []
  return this.warningNodes.map(function (item, i) {
    return {
      warning: `use of "this" for local functions: never use this to call local functions, it only consumes more gas than normal local calls.`,
      location: item.src,
      more: 'http://solidity.readthedocs.io/en/develop/control-structures.html#external-function-calls'
    }
  })
}

module.exports = {
  name: name,
  description: desc,
  category: categories.GAS,
  Module: thisLocal
}
