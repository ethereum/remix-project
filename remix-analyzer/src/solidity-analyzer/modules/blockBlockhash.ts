import { default as category } from './categories'
import { isBlockBlockHashAccess } from './staticAnalysisCommon'
import { default as algorithm } from './algorithmCategories'
import { AnalyzerModule, ModuleAlgorithm, ModuleCategory, ReportObj, AstNodeLegacy, CompilationResult} from './../../types'

export default class blockBlockhash implements AnalyzerModule {
  warningNodes: AstNodeLegacy[] = []
  name: string = 'Block.blockhash usage: '
  description: string = 'Semantics maybe unclear'
  category: ModuleCategory = category.SECURITY
  algorithm: ModuleAlgorithm = algorithm.EXACT

  visit (node: AstNodeLegacy): void {
    if (isBlockBlockHashAccess(node)) this.warningNodes.push(node)
  }

  report (compilationResults: CompilationResult): ReportObj[] {
    return this.warningNodes.map((item, i) => {
      return {
        warning: `use of "block.blockhash": "block.blockhash" is used to access the last 256 block hashes. 
                  A miner computes the block hash by "summing up" the information in the current block mined. 
                  By "summing up" the information in a clever way a miner can try to influence the outcome of a transaction in the current block. 
                  This is especially easy if there are only a small number of equally likely outcomes.`,
        location: item.src
      }
    })
  }
}

