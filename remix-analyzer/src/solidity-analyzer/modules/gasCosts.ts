import { default as category } from './categories'
import { default as algorithm } from './algorithmCategories'
import  AbstractAst from './abstractAstView'
import { ModuleAlgorithm, ModuleCategory, ReportObj, CompilationResult, CompiledContractObj, CompiledContract, VisitFunction, AnalyzerModule} from './../../types'

type VisitedContract = {
  name: string
  object: CompiledContract
  file: string
}

export default class gasCosts implements AnalyzerModule {
  name: string = 'Gas costs: '
  description: string = 'Warn if the gas requirements of functions are too high.'
  category: ModuleCategory = category.GAS
  algorithm: ModuleAlgorithm = algorithm.EXACT

  abstractAst: AbstractAst = new AbstractAst()
  visit: VisitFunction = this.abstractAst.build_visit((node: any) => false)
  
  report (compilationResults: CompilationResult): ReportObj[] {
    const report: ReportObj[] = []
    this.visitContracts(compilationResults.contracts, (contract: VisitedContract) => {
      if (
        !contract.object.evm.gasEstimates ||
        !contract.object.evm.gasEstimates.external
      ) {
        return
      }
      const fallback: string = contract.object.evm.gasEstimates.external['']
      if (fallback !== undefined) {
        if (fallback === null || parseInt(fallback) >= 2100 || fallback === 'infinite') {
          report.push({
            warning: `Fallback function of contract ${contract.name} requires too much gas (${fallback}). 
            If the fallback function requires more than 2300 gas, the contract cannot receive Ether.`
          })
        }
      }

      for (var functionName in contract.object.evm.gasEstimates.external) {
        if (functionName === '') {
          continue
        }
        const gas: string = contract.object.evm.gasEstimates.external[functionName]
        const gasString: string = gas === null ? 'unknown or not constant' : 'high: ' + gas
        if (gas === null || parseInt(gas) >= 3000000 || gas === 'infinite') {
          report.push({
            warning: `Gas requirement of function ${contract.name}.${functionName} ${gasString}. 
            If the gas requirement of a function is higher than the block gas limit, it cannot be executed.
            Please avoid loops in your functions or actions that modify large areas of storage
            (this includes clearing or copying arrays in storage)`
          })
        }
      }
    })
    return report
  }

  /**
  * call the given @arg cb (function) for all the contracts. Uses last compilation result
  * stop visiting when cb return true
  * @param {Function} cb    - callback
  */
  // @TODO has been copied from remix-ide repo ! should fix that soon !
  private visitContracts (contracts: CompiledContractObj | undefined, cb: ((contract: VisitedContract) => void | undefined)): void {
    for (let file in contracts) {
      for (let name in contracts[file]) {
        if (cb({ name: name, object: contracts[file][name], file: file })) return
      }
    }
  }
}
