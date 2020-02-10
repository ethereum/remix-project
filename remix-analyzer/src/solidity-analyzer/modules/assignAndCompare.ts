import { default as category } from './categories'
import { isSubScopeWithTopLevelUnAssignedBinOp, getUnAssignedTopLevelBinOps } from './staticAnalysisCommon'
import { default as algorithm } from './algorithmCategories'

export class assignAndCompare {
  warningNodes: any[] = []
  name = 'Result not used: '
  description = 'The result of an operation was not used.'
  category = category.MISC
  algorithm = algorithm.EXACT
  Module = this

  visit (node) {
    if (isSubScopeWithTopLevelUnAssignedBinOp(node)) getUnAssignedTopLevelBinOps(node).forEach((n) => this.warningNodes.push(n))
  }

  report (compilationResults) {
    return this.warningNodes.map((item, i) => {
      return {
        warning: 'A binary operation yields a value that is not used in the following. This is often caused by confusing assignment (=) and comparison (==).',
        location: item.src
      }
    })
  }
}
