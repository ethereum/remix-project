import { default as category } from './categories'
import { isRequireCall, isAssertCall } from './staticAnalysisCommon'
import { default as algorithm } from './algorithmCategories'

export default class guardConditions {
  guards: any[] = []
  name = 'Guard Conditions: '
  desc = 'Use require and appropriately'
  categories = category.MISC
  algorithm = algorithm.EXACT
  Module = this

  visit (node) {
    if (isRequireCall(node) || isAssertCall(node)) this.guards.push(node)
  }

  report (compilationResults) {
    if (this.guards.length > 0) {
      return [{
        warning: 'Use assert(x) if you never ever want x to be false, not in any circumstance (apart from a bug in your code). Use require(x) if x can be false, due to e.g. invalid input or a failing external component.',
        more: 'http://solidity.readthedocs.io/en/develop/control-structures.html#error-handling-assert-require-revert-and-exceptions'
      }]
    }
    return []
  }
}
