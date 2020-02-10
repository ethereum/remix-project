import { default as category } from './categories'
import { isDeleteOfDynamicArray } from './staticAnalysisCommon'
import { default as algorithm } from './algorithmCategories'

export class deleteDynamicArrays {
  rel: any = []
  name = 'Delete on dynamic Array: '
  desc = 'Use require and appropriately'
  categories = category.GAS
  algorithm = algorithm.EXACT
  Module = this

  visit (node) {
    if (isDeleteOfDynamicArray(node)) this.rel.push(node)
  }

  report (compilationResults) {
    return this.rel.map((node) => {
      return {
        warning: 'The “delete” operation when applied to a dynamically sized array in Solidity generates code to delete each of the elements contained. If the array is large, this operation can surpass the block gas limit and raise an OOG exception. Also nested dynamically sized objects can produce the same results.',
        location: node.src,
        more: 'http://solidity.readthedocs.io/en/latest/types.html?highlight=array#delete'
      }
    })
  }
}
