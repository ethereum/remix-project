import category from './categories'
import algorithm from './algorithmCategories'
import { getFunctionDefinitionName, helpers, isVariableTurnedIntoGetter, getMethodParamsSplittedTypeDesc } from './staticAnalysisCommon'
import {
  ModuleAlgorithm, ModuleCategory, ReportObj, CompilationResult, CompiledContract, AnalyzerModule,
  FunctionDefinitionAstNode, VariableDeclarationAstNode, SupportedVersion
} from './../../types'

export default class gasCosts implements AnalyzerModule {
  name = 'Gas costs: '
  description = 'Too high gas requirement of functions'
  category: ModuleCategory = category.GAS
  algorithm: ModuleAlgorithm = algorithm.EXACT
  version: SupportedVersion = {
    start: '0.4.12'
  }

  warningNodes: any[] = []
  visit (node: FunctionDefinitionAstNode | VariableDeclarationAstNode): void {
    if ((node.nodeType === 'FunctionDefinition' && node.kind !== 'constructor' && node.implemented) ||
    (node.nodeType === 'VariableDeclaration' && isVariableTurnedIntoGetter(node))) { this.warningNodes.push(node) }
  }

  report (compilationResults: CompilationResult): ReportObj[] {
    const report: ReportObj[] = []
    const methodsWithSignature: Record<string, string>[] = this.warningNodes.map(node => {
      let signature: string
      if (node.nodeType === 'FunctionDefinition') {
        const functionName: string = getFunctionDefinitionName(node)
        signature = helpers.buildAbiSignature(functionName, getMethodParamsSplittedTypeDesc(node, compilationResults.contracts))
      } else { signature = node.name + '()' }

      return {
        name: node.name,
        src: node.src,
        signature: signature
      }
    })
    for (const method of methodsWithSignature) {
      for (const filename in compilationResults.contracts) {
        for (const contractName in compilationResults.contracts[filename]) {
          const contract: CompiledContract = compilationResults.contracts[filename][contractName]
          const methodGas: Record<string, any> | undefined = this.checkMethodGas(contract, method.signature)
          if (methodGas && methodGas.isInfinite) {
            if (methodGas.isFallback) {
              report.push({
                warning: `Fallback function of contract ${contractName} requires too much gas (${methodGas.msg}). 
                If the fallback function requires more than 2300 gas, the contract cannot receive Ether.`,
                location: method.src
              })
            } else {
              report.push({
                warning: `Gas requirement of function ${contractName}.${method.name} ${methodGas.msg}: 
                If the gas requirement of a function is higher than the block gas limit, it cannot be executed.
                Please avoid loops in your functions or actions that modify large areas of storage
                (this includes clearing or copying arrays in storage)`,
                location: method.src
              })
            }
          } else continue
        }
      }
    }
    return report
  }

  private checkMethodGas (contract: CompiledContract, methodSignature: string): Record<string, any> | undefined {
    if (contract.evm && contract.evm.gasEstimates && contract.evm.gasEstimates.external) {
      if (methodSignature === '()') {
        const fallback: string = contract.evm.gasEstimates.external['']
        if (fallback !== undefined && (fallback === null || parseInt(fallback) >= 2100 || fallback === 'infinite')) {
          return {
            isInfinite: true,
            isFallback: true,
            msg: fallback
          }
        }
      } else {
        const gas: string = contract.evm.gasEstimates.external[methodSignature]
        const gasString: string = gas === null ? 'unknown or not constant' : 'is ' + gas
        if (gas === null || parseInt(gas) >= 3000000 || gas === 'infinite') {
          return {
            isInfinite: true,
            isFallback: false,
            msg: gasString
          }
        }
      }
    }
  }
}
