import { default as category } from './categories'
import { isNowAccess, isBlockTimestampAccess } from './staticAnalysisCommon'
import { default as algorithm } from './algorithmCategories'

export default class blockTimestamp  {
  warningNowNodes: any[] = []
  warningblockTimestampNodes: any[] = []
  name = 'Block timestamp: '
  desc = 'Semantics maybe unclear'
  categories = category.SECURITY
  algorithm = algorithm.EXACT

  visit (node) {
    if (isNowAccess(node)) this.warningNowNodes.push(node)
    else if (isBlockTimestampAccess(node)) this.warningblockTimestampNodes.push(node)
  }

  report (compilationResults) {
    return this.warningNowNodes.map((item, i) => {
      return {
        warning: `use of "now": "now" does not mean current time. Now is an alias for block.timestamp. 
                  Block.timestamp can be influenced by miners to a certain degree, be careful.`,
        location: item.src,
        more: 'http://solidity.readthedocs.io/en/develop/frequently-asked-questions.html#are-timestamps-now-block-timestamp-reliable'
      }
    }).concat(this.warningblockTimestampNodes.map((item, i) => {
      return {
        warning: `use of "block.timestamp": "block.timestamp" can be influenced by miners to a certain degree. 
                  That means that a miner can "choose" the block.timestamp, to a certain degree, to change the outcome of a transaction in the mined block.`,
        location: item.src,
        more: 'http://solidity.readthedocs.io/en/develop/frequently-asked-questions.html#are-timestamps-now-block-timestamp-reliable'
      }
    }))
  }
}
