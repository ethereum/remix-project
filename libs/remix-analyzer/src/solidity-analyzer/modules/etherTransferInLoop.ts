import category from './categories'
import algorithm from './algorithmCategories'
import { isLoop, isTransfer, getCompilerVersion } from './staticAnalysisCommon'
import {
  AnalyzerModule, ModuleAlgorithm, ModuleCategory, ReportObj, CompilationResult, ForStatementAstNode,
  WhileStatementAstNode, ExpressionStatementAstNode, SupportedVersion
} from './../../types'

export default class etherTransferInLoop implements AnalyzerModule {
  relevantNodes: ExpressionStatementAstNode[] = []
  name = 'Ether transfer in loop: '
  description = 'Transferring Ether in a for/while/do-while loop'
  category: ModuleCategory = category.GAS
  algorithm: ModuleAlgorithm = algorithm.EXACT
  version: SupportedVersion = {
    start: '0.4.12'
  }

  visit (node: ForStatementAstNode | WhileStatementAstNode): void {
    let transferNodes: ExpressionStatementAstNode[] = []
    if (isLoop(node)) {
      if (node.body && node.body.nodeType === 'Block') {
        transferNodes = node.body.statements.filter(child =>
          (child.nodeType === 'ExpressionStatement' &&
                          child.expression.nodeType === 'FunctionCall' &&
                          isTransfer(child.expression.expression)))
      } else if (node.body && node.body.nodeType === 'ExpressionStatement' && node.body.expression.nodeType === 'FunctionCall' && isTransfer(node.body.expression.expression)) { transferNodes.push(node.body) }
      // When loop body is described without braces
      if (transferNodes.length > 0) {
        this.relevantNodes.push(...transferNodes)
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  report (compilationResults: CompilationResult): ReportObj[] {
    const version = getCompilerVersion(compilationResults.contracts)
    return this.relevantNodes.map((node) => {
      return {
        warning: 'Ether payout should not be done in a loop: Due to the block gas limit, transactions can only consume a certain amount of gas. The number of iterations in a loop can grow beyond the block gas limit which can cause the complete contract to be stalled at a certain point. If required then make sure that number of iterations are low and you trust each address involved.',
        location: node.src,
        more: `https://solidity.readthedocs.io/en/${version}/security-considerations.html#gas-limit-and-loops`
      }
    })
  }
}
