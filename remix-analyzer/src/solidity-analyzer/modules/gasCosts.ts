import { default as category } from './categories'
import { default as algorithm } from './algorithmCategories'
import { getFunctionDefinitionName, helpers, getType } from './staticAnalysisCommon'
import { ModuleAlgorithm, ModuleCategory, ReportObj, CompilationResult, CompiledContractObj, CompiledContract, VisitFunction, AnalyzerModule, FunctionDefinitionAstNode} from './../../types'

interface VisitedContract {
  name: string
  object: CompiledContract
  file: string
}

export default class gasCosts implements AnalyzerModule {
  name: string = `Gas costs: `
  description: string = `Too high gas requirement of functions`
  category: ModuleCategory = category.GAS
  algorithm: ModuleAlgorithm = algorithm.EXACT

  warningNodes: FunctionDefinitionAstNode[] = []
  visit (node: FunctionDefinitionAstNode): void {
    if (node.nodeType === 'FunctionDefinition' && node.kind !== 'constructor') this.warningNodes.push(node)
  }
  
  report (compilationResults: CompilationResult): ReportObj[] {
    const report: ReportObj[] = []

    const methodsWithSignature =  this.warningNodes.map(node => {
      return {
        name: node.name,
        src: node.src,
        signature: helpers.buildAbiSignature(getFunctionDefinitionName(node), node.parameters.parameters.map(node => node.typeDescriptions.typeString.split(' ')[0]))
      }
    })
    for (const method of methodsWithSignature) {
      for (const contractName in compilationResults.contracts['test.sol']) {
        const contract = compilationResults.contracts['test.sol'][contractName]
        const methodGas: any = this.checkMethodGas(contract, method.signature)
        if(methodGas.isInfinite) {
          if(methodGas.isFallback) {
            report.push({
              warning: `Fallback function of contract ${contractName} requires too much gas (${methodGas.msg}). 
              If the fallback function requires more than 2300 gas, the contract cannot receive Ether.`
            })
          } else {
            report.push({
              warning: `Gas requirement of function ${contractName}.${method.name} ${methodGas.msg}. 
              If the gas requirement of a function is higher than the block gas limit, it cannot be executed.
              Please avoid loops in your functions or actions that modify large areas of storage
              (this includes clearing or copying arrays in storage)`
            })
          } 
        }
      }
    }
    return report
  }

  private checkMethodGas(contract: any, methodSignature: string) {
    if(methodSignature === '()') {
      const fallback: string = contract.evm.gasEstimates.external['']
        if (fallback !== undefined && (fallback === null || parseInt(fallback) >= 2100 || fallback === 'infinite')) {
          return {
            isInfinite: true,
            isFallback: true,
            msg: fallback
          }
        } else {
          return {
            isInfinite: false
          }
        }
    } else {
      const gas: string = contract.evm.gasEstimates.external[methodSignature]
      const gasString: string = gas === null ? 'unknown or not constant' : 'high: ' + gas
      if (gas === null || parseInt(gas) >= 3000000 || gas === 'infinite') {
        return {
          isInfinite: true,
          msg: gasString
        }
      } else {
        return {
          isInfinite: false
        }
      }
    }
  }   
}
