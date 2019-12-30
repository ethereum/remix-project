const name = 'Data Trucated: '
const desc = 'Division on int/uint values truncates the result.'
const categories = require('./categories')
const common = require('./staticAnalysisCommon')
const algo = require('./algorithmCategories')

function intDivitionTruncate () {
  this.warningNodes = []
}

intDivitionTruncate.prototype.visit = function (node) {
  if (common.isIntDivision(node)) this.warningNodes.push(node)
}

intDivitionTruncate.prototype.report = function (compilationResults) {
  return this.warningNodes.map((item, i) => {
    return {
      warning: 'Division of integer values yields an integer value again. That means e.g. 10 / 100 = 0 instead of 0.1 since the result is an integer again. This does not hold for division of (only) literal values since those yield rational constants.',
      location: item.src
    }
  })
}

module.exports = {
  name: name,
  description: desc,
  category: categories.MISC,
  algorithm: algo.EXACT,
  Module: intDivitionTruncate
}
