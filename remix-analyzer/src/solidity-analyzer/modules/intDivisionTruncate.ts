import { default as category } from './categories'
import { isIntDivision } from './staticAnalysisCommon'
import { default as algorithm } from './algorithmCategories'

export default class intDivitionTruncate {
  warningNodes: any[] = []
  name = 'Data Trucated: '
  desc = 'Division on int/uint values truncates the result.'
  categories = category.MISC
  algorithm = algorithm.EXACT

  visit (node) {
    if (isIntDivision(node)) this.warningNodes.push(node)
  }

  report (compilationResults) {
    return this.warningNodes.map((item, i) => {
      return {
        warning: 'Division of integer values yields an integer value again. That means e.g. 10 / 100 = 0 instead of 0.1 since the result is an integer again. This does not hold for division of (only) literal values since those yield rational constants.',
        location: item.src
      }
    })
  }
}
