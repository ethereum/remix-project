import { default as category } from './categories'
import { default as algorithm } from './algorithmCategories'
import { isForLoop, isDynamicArrayLengthAccess, isBinaryOperation } from './staticAnalysisCommon'
import { AnalyzerModule, ModuleAlgorithm, ModuleCategory, ReportObj, AstNodeLegacy, CompilationResult} from './../../types'

export default class forLoopIteratesOverDynamicArray implements AnalyzerModule {
  relevantNodes: AstNodeLegacy[] = []
  name: string = 'For loop iterates over dynamic array: '
  description: string = 'The number of \'for\' loop iterations depends on dynamic array\'s size'
  category: ModuleCategory = category.GAS
  algorithm: ModuleAlgorithm = algorithm.EXACT

  visit (node: AstNodeLegacy): void {
    if (isForLoop(node) && node.children) {
      let conditionChildrenNode: AstNodeLegacy | null = null
      // Access 'condition' node of 'for' loop statement
      const forLoopConditionNode: AstNodeLegacy = node.children[1]
      // Access right side of condition as its children
      if(forLoopConditionNode && forLoopConditionNode.children){
        conditionChildrenNode = forLoopConditionNode.children[1]
      }
      // Check if it is a binary operation. if yes, check if its children node access length of dynamic array
      if (conditionChildrenNode && conditionChildrenNode.children && isBinaryOperation(conditionChildrenNode) && isDynamicArrayLengthAccess(conditionChildrenNode.children[0])) {
        this.relevantNodes.push(node)
      } else if (isDynamicArrayLengthAccess(conditionChildrenNode)) { // else check if condition node itself access length of dynamic array
        this.relevantNodes.push(node)
      }
    }
  }

  report (compilationResults: CompilationResult): ReportObj[] {
    return this.relevantNodes.map((node) => {
      return {
        warning: 'Loops that do not have a fixed number of iterations, for example, loops that depend on storage values, have to be used carefully: Due to the block gas limit, transactions can only consume a certain amount of gas. The number of iterations in a loop can grow beyond the block gas limit which can cause the complete contract to be stalled at a certain point. Additionally, using unbounded loops incurs in a lot of avoidable gas costs. Carefully test how many items at maximum you can pass to such functions to make it successful.',
        location: node.src,
        more: 'http://solidity.readthedocs.io/en/v0.4.24/security-considerations.html#gas-limit-and-loops'
      }
    })
  }
}
