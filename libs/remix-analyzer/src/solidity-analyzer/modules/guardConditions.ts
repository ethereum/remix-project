import { default as category } from './categories'
import { isRequireCall, isAssertCall } from './staticAnalysisCommon'
import { default as algorithm } from './algorithmCategories'
import { AnalyzerModule, ModuleAlgorithm, ModuleCategory, ReportObj, CompilationResult, FunctionCallAstNode, SupportedVersion} from './../../types'

export default class guardConditions implements AnalyzerModule {
  guards: FunctionCallAstNode[] = []
  name = `Guard conditions: `
  description = `Ensure appropriate use of require/assert`
  category: ModuleCategory = category.MISC
  algorithm: ModuleAlgorithm = algorithm.EXACT
  version: SupportedVersion = {
    start: '0.4.12'
  }

  visit (node: FunctionCallAstNode): void {
    if (isRequireCall(node) || isAssertCall(node)) this.guards.push(node)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  report (compilationResults: CompilationResult): ReportObj[] {
    return this.guards.map((node) => {
      return {
        warning: `Use "assert(x)" if you never ever want x to be false, not in any circumstance (apart from a bug in your code). Use "require(x)" if x can be false, due to e.g. invalid input or a failing external component.`,
        location: node.src,
        more: 'http://solidity.readthedocs.io/en/develop/control-structures.html#error-handling-assert-require-revert-and-exceptions'
      }
    })
  }
}
