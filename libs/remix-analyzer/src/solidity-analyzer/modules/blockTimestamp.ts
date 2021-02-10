import category from './categories'
import { isNowAccess, isBlockTimestampAccess, getCompilerVersion } from './staticAnalysisCommon'
import algorithm from './algorithmCategories'
import {
  AnalyzerModule, ModuleAlgorithm, ModuleCategory, ReportObj, CompilationResult, IdentifierAstNode,
  MemberAccessAstNode, SupportedVersion
} from './../../types'

export default class blockTimestamp implements AnalyzerModule {
  warningNowNodes: IdentifierAstNode[] = []
  warningblockTimestampNodes: MemberAccessAstNode[] = []
  name = 'Block timestamp: '
  description = 'Can be influenced by miners'
  category: ModuleCategory = category.SECURITY
  algorithm: ModuleAlgorithm = algorithm.EXACT
  version: SupportedVersion = {
    start: '0.4.12'
  }

  visit (node: IdentifierAstNode | MemberAccessAstNode): void {
    if (node.nodeType === 'Identifier' && isNowAccess(node)) this.warningNowNodes.push(node)
    else if (node.nodeType === 'MemberAccess' && isBlockTimestampAccess(node)) this.warningblockTimestampNodes.push(node)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  report (compilationResults: CompilationResult): ReportObj[] {
    const version = getCompilerVersion(compilationResults.contracts)
    return this.warningNowNodes.map((item, i) => {
      return {
        warning: `Use of "now": "now" does not mean current time. "now" is an alias for "block.timestamp". 
                  "block.timestamp" can be influenced by miners to a certain degree, be careful.`,
        location: item.src,
        more: `https://solidity.readthedocs.io/en/${version}/units-and-global-variables.html?highlight=block.timestamp#block-and-transaction-properties`
      }
    }).concat(this.warningblockTimestampNodes.map((item) => {
      return {
        warning: `Use of "block.timestamp": "block.timestamp" can be influenced by miners to a certain degree. 
                  That means that a miner can "choose" the block.timestamp, to a certain degree, to change the outcome of a transaction in the mined block.`,
        location: item.src,
        more: `https://solidity.readthedocs.io/en/${version}/units-and-global-variables.html?highlight=block.timestamp#block-and-transaction-properties`
      }
    }))
  }
}
