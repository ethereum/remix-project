import category from './categories'
import { isThisLocalCall, getCompilerVersion } from './staticAnalysisCommon'
import algorithm from './algorithmCategories'
import { AnalyzerModule, ModuleAlgorithm, ModuleCategory, ReportObj, CompilationResult, MemberAccessAstNode, SupportedVersion } from './../../types'

export default class thisLocal implements AnalyzerModule {
  warningNodes: MemberAccessAstNode[] = []
  name = 'This on local calls: '
  description = 'Invocation of local functions via \'this\''
  category: ModuleCategory = category.GAS
  algorithm: ModuleAlgorithm = algorithm.EXACT
  version: SupportedVersion = {
    start: '0.4.12'
  }

  visit (node: MemberAccessAstNode): void {
    if (node.nodeType === 'MemberAccess' && isThisLocalCall(node)) this.warningNodes.push(node)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  report (compilationResults: CompilationResult): ReportObj[] {
    const version = getCompilerVersion(compilationResults.contracts)
    return this.warningNodes.map(function (item, i) {
      return {
        warning: 'Use of "this" for local functions: Never use "this" to call functions in the same contract, it only consumes more gas than normal local calls.',
        location: item.src,
        more: `https://solidity.readthedocs.io/en/${version}/control-structures.html#external-function-calls`
      }
    })
  }
}
