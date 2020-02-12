import { default as category } from './categories'
import { isDeleteFromDynamicArray, isMappingIndexAccess } from './staticAnalysisCommon'

export default class deleteFromDynamicArray {
  relevantNodes: any[] = []
  name = 'Delete from dynamic Array: '
  desc = 'Using delete on an array leaves a gap'
  categories = category.MISC

  visit (node) {
    if (isDeleteFromDynamicArray(node) && !isMappingIndexAccess(node.children[0])) this.relevantNodes.push(node)
  }

  report (compilationResults) {
    return this.relevantNodes.map((node) => {
      return {
        warning: 'Using delete on an array leaves a gap. The length of the array remains the same. If you want to remove the empty position you need to shift items manually and update the length property.\n',
        location: node.src,
        more: 'https://github.com/miguelmota/solidity-idiosyncrasies'
      }
    })
  }
}
