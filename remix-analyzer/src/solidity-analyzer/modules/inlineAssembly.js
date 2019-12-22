const name = 'Inline assembly: '
const desc = 'Use of Inline Assembly'
const categories = require('./categories')
const common = require('./staticAnalysisCommon')
const algo = require('./algorithmCategories')

function inlineAssembly () {
  this.inlineAssNodes = []
}

inlineAssembly.prototype.visit = function (node) {
  if (common.isInlineAssembly(node)) this.inlineAssNodes.push(node)
}

inlineAssembly.prototype.report = function (compilationResults) {
  return this.inlineAssNodes.map((node) => {
    return {
      warning: `CAUTION: The Contract uses inline assembly, this is only advised in rare cases. 
                Additionally static analysis modules do not parse inline Assembly, this can lead to wrong analysis results.`,
      location: node.src,
      more: 'http://solidity.readthedocs.io/en/develop/assembly.html#solidity-assembly'
    }
  })
}

module.exports = {
  name: name,
  description: desc,
  category: categories.SECURITY,
  algorithm: algo.EXACT,
  Module: inlineAssembly
}
