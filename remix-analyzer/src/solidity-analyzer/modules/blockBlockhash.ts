import { default as category } from './categories'
import { isBlockBlockHashAccess } from './staticAnalysisCommon'
import { default as algorithm } from './algorithmCategories'

export class blockBlockhash {
  warningNodes: any[] = []
  name = 'Block.blockhash usage: '
  desc = 'Semantics maybe unclear'
  categories = category.SECURITY
  algorithm = algorithm.EXACT
  Module = this

  visit (node) {
    if (isBlockBlockHashAccess(node)) this.warningNodes.push(node)
  }

  report (compilationResults) {
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

