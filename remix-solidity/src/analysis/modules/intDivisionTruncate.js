var name = 'Data Trucated: '
var desc = 'Division on int/uint values truncates the result.'
var categories = require('./categories')
var common = require('./staticAnalysisCommon')

function intDivitionTruncate () {
  this.warningNodes = []
}

intDivitionTruncate.prototype.visit = function (node) {
  if (common.isIntDivision(node)) this.warningNodes.push(node)
}

intDivitionTruncate.prototype.report = function (compilationResults) {
  return this.warningNodes.map(function (item, i) {
    return {
      warning: 'Division of integer values yields an integer value again. That means eg. a / 100 = 0 instead of 0.a since the result is an integer again. This does not hold for division of (only) literal values since those yield rational constants.',
      location: item.src
    }
  })
}

module.exports = {
  name: name,
  description: desc,
  category: categories.MISC,
  Module: intDivitionTruncate
}
