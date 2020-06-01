import { default as category } from './categories'
import { isThisLocalCall } from './staticAnalysisCommon'
import { default as algorithm } from './algorithmCategories'
import { AnalyzerModule, ModuleAlgorithm, ModuleCategory, ReportObj, CompilationResult, MemberAccessAstNode, SupportedVersion} from './../../types'

export default class thisLocal implements AnalyzerModule {
  warningNodes: MemberAccessAstNode[] = []
  name: string = `This on local calls: `
  description: string = `Invocation of local functions via 'this'`
  category: ModuleCategory = category.GAS
  algorithm: ModuleAlgorithm = algorithm.EXACT
  version: SupportedVersion = {
    start: '0.4.12'
  }

  visit (node: MemberAccessAstNode): void {
    if (node.nodeType === 'MemberAccess' && isThisLocalCall(node)) this.warningNodes.push(node)
  }

  report (compilationResults: CompilationResult): ReportObj[] {
    return this.warningNodes.map(function (item, i) {
      return {
        warning: `Use of "this" for local functions: Never use "this" to call functions in the same contract, it only consumes more gas than normal local calls.`,
        location: item.src,
        more: 'http://solidity.readthedocs.io/en/develop/control-structures.html#external-function-calls'
      }
    })
  }
}
