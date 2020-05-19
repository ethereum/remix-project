import { default as category } from './categories'
import { default as algorithm } from './algorithmCategories'
import { getFunctionDefinitionName, helpers, isVariableTurnedIntoGetter } from './staticAnalysisCommon'
import { ModuleAlgorithm, ModuleCategory, ReportObj, CompilationResult, CompiledContract, AnalyzerModule, 
  FunctionDefinitionAstNode, VariableDeclarationAstNode, CompiledContractObj } from './../../types'

export default class gasCosts implements AnalyzerModule {
  name: string = `Gas costs: `
  description: string = `Too high gas requirement of functions`
  category: ModuleCategory = category.GAS
  algorithm: ModuleAlgorithm = algorithm.EXACT

  warningNodes: any[] = []
  visit (node: FunctionDefinitionAstNode | VariableDeclarationAstNode): void {
    if ((node.nodeType === 'FunctionDefinition' && node.kind !== 'constructor' && node.implemented) || 
    (node.nodeType === 'VariableDeclaration' && isVariableTurnedIntoGetter(node))) 
      this.warningNodes.push(node)
  }
  
  report (compilationResults: CompilationResult): ReportObj[] {
    const report: ReportObj[] = []
    const methodsWithSignature: Record<string, string>[] =  this.warningNodes.map(node => {
      let signature: string;
      if(node.nodeType === 'FunctionDefinition'){
        const functionName: string = getFunctionDefinitionName(node)
        signature = helpers.buildAbiSignature(functionName, this.getSplittedTypeDesc(node, compilationResults.contracts))
      }
      else 
        signature = node.name + '()'
      
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
          if(methodGas && methodGas.isInfinite) {
            if(methodGas.isFallback) {
              report.push({
                warning: `Fallback function of contract ${contractName} requires too much gas (${methodGas.msg}). 
                If the fallback function requires more than 2300 gas, the contract cannot receive Ether.`,
                location: method.src
              })
            } else {
              report.push({
                warning: `Gas requirement of function ${contractName}.${method.name} ${methodGas.msg}. 
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

  // To create the method signature similar to contract.evm.gasEstimates.external object
  // For address payable, return address 
  private getSplittedTypeDesc(node: FunctionDefinitionAstNode, contracts: CompiledContractObj): string[] {
    return node.parameters.parameters.map((varNode, varIndex) => {
      let finalTypeString;
      const typeString = varNode.typeDescriptions.typeString
      if(typeString.includes('struct')) {
        const paramsCount = node.parameters.parameters.length
        const fnName = node.name
        for (const filename in contracts) {
          for (const contractName in contracts[filename]) {
            const methodABI = contracts[filename][contractName].abi
              .find(e => e.name === fnName && e.inputs?.length && 
                  e.inputs[varIndex]['type'].includes('tuple') && 
                  e.inputs[varIndex]['internalType'] === typeString)
            if(methodABI && methodABI.inputs) {
              const inputs = methodABI.inputs[varIndex]
              let typeStr = this.getTypeStringFromComponents(inputs['components'])
              finalTypeString = typeStr + inputs['type'].replace('tuple', '')
            }
          }
        }
      } else 
        finalTypeString = typeString.split(' ')[0]
      return finalTypeString
    })
  }

  private getTypeStringFromComponents(components: any[]) {
    let typeString = '('
    for(var i=0; i < components.length; i++) {
      const param = components[i]
      if(param.type.includes('tuple') && param.components && param.components.length > 0){
        typeString = typeString + this.getTypeStringFromComponents(param.components)
        typeString = typeString + param.type.replace('tuple', '')
      }
      else
        typeString = typeString + param.type

      if(i !== components.length - 1)
        typeString = typeString + ','
    }
    typeString = typeString + ')'
    return typeString
  }


  private checkMethodGas(contract: CompiledContract, methodSignature: string): Record<string, any> | undefined {
    if(contract.evm && contract.evm.gasEstimates && contract.evm.gasEstimates.external) {
      if(methodSignature === '()') {
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
        const gasString: string = gas === null ? 'unknown or not constant' : 'high: ' + gas
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
