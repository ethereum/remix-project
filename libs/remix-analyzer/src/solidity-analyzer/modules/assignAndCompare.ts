import { default as category } from './categories'
import { isSubScopeWithTopLevelUnAssignedBinOp, getUnAssignedTopLevelBinOps } from './staticAnalysisCommon'
import { default as algorithm } from './algorithmCategories'
import { AnalyzerModule, ModuleAlgorithm, ModuleCategory, ReportObj, BlockAstNode, IfStatementAstNode, 
  WhileStatementAstNode, ForStatementAstNode, CompilationResult, ExpressionStatementAstNode, SupportedVersion} from './../../types'

export default class assignAndCompare implements AnalyzerModule {
  warningNodes: ExpressionStatementAstNode[] = []
  name: string = `Result not used: `
  description: string = `The result of an operation not used`
  category: ModuleCategory = category.MISC
  algorithm: ModuleAlgorithm = algorithm.EXACT
  version: SupportedVersion = {
    start: '0.4.12'
  }

  visit (node: BlockAstNode | IfStatementAstNode | WhileStatementAstNode | ForStatementAstNode): void {
    if (node?.nodeType && isSubScopeWithTopLevelUnAssignedBinOp(node)) getUnAssignedTopLevelBinOps(node).forEach((n) => this.warningNodes.push(n))
  }

  report (compilationResults: CompilationResult): ReportObj[] {
    return this.warningNodes.map((item, i) => {
      return {
        warning: 'A binary operation yields a value that is not used further. This is often caused by confusing assignment (=) and comparison (==).',
        location: item.src
      }
    })
  }
}
