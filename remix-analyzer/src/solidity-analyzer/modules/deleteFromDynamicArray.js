const name = 'Delete from dynamic Array: '
const desc = 'Using delete on an array leaves a gap'
const categories = require('./categories')
const common = require('./staticAnalysisCommon')

function deleteFromDynamicArray () {
  this.relevantNodes = []
}

deleteFromDynamicArray.prototype.visit = function (node) {
  if (common.isDeleteFromDynamicArray(node) && !common.isMappingIndexAccess(node.children[0])) this.relevantNodes.push(node)
}

deleteFromDynamicArray.prototype.report = function (compilationResults) {
  return this.relevantNodes.map((node) => {
    return {
      warning: 'Using delete on an array leaves a gap. The length of the array remains the same. If you want to remove the empty position you need to shift items manually and update the length property.\n',
      location: node.src,
      more: 'https://github.com/miguelmota/solidity-idiosyncrasies'
    }
  })
}

module.exports = {
  name: name,
  description: desc,
  category: categories.MISC,
  Module: deleteFromDynamicArray
}
