import { default as category } from './categories'
import { default as algorithm } from './algorithmCategories'
import { isTxOriginAccess, getCompilerVersion } from './staticAnalysisCommon'
import { AnalyzerModule, ModuleAlgorithm, ModuleCategory, ReportObj, CompilationResult, MemberAccessAstNode, SupportedVersion} from './../../types'

export default class txOrigin implements AnalyzerModule {
  txOriginNodes: MemberAccessAstNode[] = []
  name: string = `Transaction origin: `
  description: string = `'tx.origin' used`
  category: ModuleCategory = category.SECURITY
  algorithm: ModuleAlgorithm = algorithm.EXACT
  version: SupportedVersion = {
    start: '0.4.12'
  }

  visit (node: MemberAccessAstNode): void {
    if (isTxOriginAccess(node)) this.txOriginNodes.push(node)
    
  }

  report (compilationResults: CompilationResult): ReportObj[] {
    const version = getCompilerVersion(compilationResults.contracts)
    return this.txOriginNodes.map((item, i) => {
      return {
        warning: `Use of tx.origin: "tx.origin" is useful only in very exceptional cases. 
                  If you use it for authentication, you usually want to replace it by "msg.sender", because otherwise any contract you call can act on your behalf.`,
        location: item.src,
        more: `https://solidity.readthedocs.io/en/${version}/security-considerations.html#tx-origin`
      }
    })
  }
}
