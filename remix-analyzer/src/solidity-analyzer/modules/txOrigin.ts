import { default as category } from './categories'
import { default as algorithm } from './algorithmCategories'
import { AnalyzerModule, ModuleAlgorithm, ModuleCategory, ReportObj, AstNodeLegacy, CompilationResult} from './../../types'

export default class txOrigin implements AnalyzerModule {
  txOriginNodes: AstNodeLegacy[] = []
  name: string = 'Transaction origin: '
  description: string = 'Warn if tx.origin is used'
  category: ModuleCategory = category.SECURITY
  algorithm: ModuleAlgorithm = algorithm.EXACT

  visit (node: AstNodeLegacy): void {
    if (node.name === 'MemberAccess' && node.attributes &&
    node.attributes.member_name === 'origin' &&
    (node.attributes.type === 'address' || node.attributes.type === 'address payable') &&
    node.children && node.children.length && node.children[0].attributes &&
    node.children[0].attributes.type === 'tx' &&
    node.children[0].attributes.value === 'tx') {
      this.txOriginNodes.push(node)
    }
  }

  report (compilationResults: CompilationResult): ReportObj[] {
    return this.txOriginNodes.map((item, i) => {
      return {
        warning: `Use of tx.origin: "tx.origin" is useful only in very exceptional cases. 
                  If you use it for authentication, you usually want to replace it by "msg.sender", because otherwise any contract you call can act on your behalf.`,
        location: item.src
      }
    })
  }
}
