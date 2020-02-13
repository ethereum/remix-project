import { default as category } from './categories'
import { isThisLocalCall } from './staticAnalysisCommon'
import { default as algorithm } from './algorithmCategories'
import { AnalyzerModule, ModuleAlgorithm, ModuleCategory, ReportObj, AstNodeLegacy, CompilationResult} from './../../types'

export default class thisLocal implements AnalyzerModule {
  warningNodes: AstNodeLegacy[] = []
  name: string = 'This on local calls: '
  description: string = 'Invocation of local functions via this'
  category: ModuleCategory = category.GAS
  algorithm: ModuleAlgorithm = algorithm.EXACT

  visit (node: AstNodeLegacy): void {
    if (isThisLocalCall(node)) this.warningNodes.push(node)
  }

  report (compilationResults: CompilationResult): ReportObj[] {
    return this.warningNodes.map(function (item, i) {
      return {
        warning: 'Use of "this" for local functions: Never use this to call functions in the same contract, it only consumes more gas than normal local calls.',
        location: item.src,
        more: 'http://solidity.readthedocs.io/en/develop/control-structures.html#external-function-calls'
      }
    })
  }
}
