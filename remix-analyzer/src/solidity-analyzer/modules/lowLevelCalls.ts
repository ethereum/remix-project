import { default as category } from './categories'
import { isLowLevelCallInst, isLowLevelCallInst050, isLowLevelCallcodeInst, isLowLevelDelegatecallInst,
  isLowLevelSendInst, isLowLevelSendInst050, isLLDelegatecallInst050, lowLevelCallTypes } from './staticAnalysisCommon'
import { default as algorithm } from './algorithmCategories'
import { AnalyzerModule, ModuleAlgorithm, ModuleCategory, ReportObj, CompilationResult, MemberAccessAstNode} from './../../types'

interface llcNode {
  node: MemberAccessAstNode
  type: {
    ident: string,
    type: string
  }
}

export default class lowLevelCalls implements AnalyzerModule {
  llcNodes: llcNode[] = []
  name: string = 'Low level calls: '
  description: string = 'Semantics maybe unclear'
  category: ModuleCategory = category.SECURITY
  algorithm: ModuleAlgorithm = algorithm.EXACT

  visit (node : MemberAccessAstNode): void {
    if (isLowLevelCallInst(node)) {
      this.llcNodes.push({node: node, type: lowLevelCallTypes.CALL})
    } else if (isLowLevelCallInst050(node)) {
      this.llcNodes.push({node: node, type: lowLevelCallTypes.CALL})
    } else if (isLowLevelCallcodeInst(node)) {
      this.llcNodes.push({node: node, type: lowLevelCallTypes.CALLCODE})
    } else if (isLowLevelDelegatecallInst(node)) {
      this.llcNodes.push({node: node, type: lowLevelCallTypes.DELEGATECALL})
    } else if (isLowLevelSendInst(node)) {
      this.llcNodes.push({node: node, type: lowLevelCallTypes.SEND})
    } else if (isLowLevelSendInst050(node)) {
      this.llcNodes.push({node: node, type: lowLevelCallTypes.SEND})
    } else if (isLLDelegatecallInst050(node)) {
      this.llcNodes.push({node: node, type: lowLevelCallTypes.DELEGATECALL})
    }
  }

  report (compilationResults: CompilationResult): ReportObj[] {
    return this.llcNodes.map((item, i) => {
      let text = ''
      let morehref: any = null
      switch (item.type) {
        case lowLevelCallTypes.CALL:
          text = `use of "call":  the use of low level "call" should be avoided whenever possible. 
                  It can lead to unexpected behavior if return value is not handled properly. 
                  Please use Direct Calls via specifying the called contract's interface.`
          morehref = 'http://solidity.readthedocs.io/en/develop/control-structures.html?#external-function-calls'
          // http://solidity.readthedocs.io/en/develop/frequently-asked-questions.html?#why-is-the-low-level-function-call-less-favorable-than-instantiating-a-contract-with-a-variable-contractb-b-and-executing-its-functions-b-dosomething
          break
        case lowLevelCallTypes.CALLCODE:
          text = `use of "callcode":  the use of low level "callcode" should be avoided whenever possible. 
                  External code that is called can change the state of the calling contract and send ether from the caller's balance. 
                  If this is wanted behaviour use the Solidity library feature if possible.`
          morehref = 'http://solidity.readthedocs.io/en/develop/contracts.html#libraries'
          break
        case lowLevelCallTypes.DELEGATECALL:
          text = `use of "delegatecall": the use of low level "delegatecall" should be avoided whenever possible. 
                  External code that is called can change the state of the calling contract and send ether from the caller's balance. 
                  If this is wanted behaviour use the Solidity library feature if possible.`
          morehref = 'http://solidity.readthedocs.io/en/develop/contracts.html#libraries'
          break
        case lowLevelCallTypes.SEND:
          text = `use of "send": "send" does not throw an exception when not successful, make sure you deal with the failure case accordingly. 
                  Use "transfer" whenever failure of the ether transfer should rollback the whole transaction. 
                  Note: if you "send/transfer" ether to a contract the fallback function is called, the callees fallback function is very limited due to the limited amount of gas provided by "send/transfer". 
                  No state changes are possible but the callee can log the event or revert the transfer. "send/transfer" is syntactic sugar for a "call" to the fallback function with 2300 gas and a specified ether value.`
          morehref = 'http://solidity.readthedocs.io/en/develop/security-considerations.html#sending-and-receiving-ether'
          break
      }
      return { warning: text, more: morehref, location: item.node.src }
    })
  }
}

