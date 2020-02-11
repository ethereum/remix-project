import { default as category } from './categories'
import { isThisLocalCall } from './staticAnalysisCommon'
import { default as algorithm } from './algorithmCategories'

export default class thisLocal {
  warningNodes: any[] = []
  name = 'This on local calls: '
  desc = 'Invocation of local functions via this'
  categories = category.GAS
  algorithm = algorithm.EXACT
  Module = this

  visit (node) {
    if (isThisLocalCall(node)) this.warningNodes.push(node)
  }

  report (compilationResults) {
    return this.warningNodes.map(function (item, i) {
      return {
        warning: 'Use of "this" for local functions: Never use this to call functions in the same contract, it only consumes more gas than normal local calls.',
        location: item.src,
        more: 'http://solidity.readthedocs.io/en/develop/control-structures.html#external-function-calls'
      }
    })
  }
}
