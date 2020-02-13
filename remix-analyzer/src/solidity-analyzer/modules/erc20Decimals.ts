import { default as category } from './categories'
import { getFunctionDefinitionName, helpers, getDeclaredVariableName, getDeclaredVariableType } from './staticAnalysisCommon'
import { default as algorithm } from './algorithmCategories'
import  AbstractAst from './abstractAstView'
import { AnalyzerModule, ModuleAlgorithm, ModuleCategory, ReportObj, AstNodeLegacy, CompilationResult} from './../../types'

export default class erc20Decimals implements AnalyzerModule {
  name: string = 'ERC20: '
  description: string = 'Decimal should be uint8'
  category: ModuleCategory = category.ERC
  algorithm: ModuleAlgorithm = algorithm.EXACT

  abstractAst: AbstractAst = new AbstractAst()
  visit = this.abstractAst.build_visit((node: AstNodeLegacy) => false)
  report = this.abstractAst.build_report(this._report.bind(this))

  private _report (contracts, multipleContractsWithSameName): ReportObj[] {
    const warnings: ReportObj[] = []

    contracts.forEach((contract) => {
      const contractAbiSignatures = contract.functions.map((f) => helpers.buildAbiSignature(getFunctionDefinitionName(f.node), f.parameters))

      if (this.isERC20(contractAbiSignatures)) {
        const decimalsVar = contract.stateVariables.filter((stateVar) => getDeclaredVariableName(stateVar) === 'decimals' && (getDeclaredVariableType(stateVar) !== 'uint8' || stateVar.attributes.visibility !== 'public'))
        const decimalsFun = contract.functions.filter((f) => getFunctionDefinitionName(f.node) === 'decimals' &&
                                                            (
                                                              (f.returns.length === 0 || f.returns.length > 1) ||
                                                              (f.returns.length === 1 && (f.returns[0].type !== 'uint8' || f.node.attributes.visibility !== 'public'))
                                                            )
                                                    )

        if (decimalsVar.length > 0 || decimalsFun.length > 0) {
          warnings.push({
            warning: 'ERC20 Contracts decimals function should have uint8 as return type',
            location: null,
            more: ' https://eips.ethereum.org/EIPS/eip-20'
          })
        }
      }
    })

    return warnings
  }

  private isERC20 (funSignatures: string[]): boolean {
    return funSignatures.includes('totalSupply()') &&
          funSignatures.includes('balanceOf(address)') &&
          funSignatures.includes('transfer(address,uint256)') &&
          funSignatures.includes('transferFrom(address,address,uint256)') &&
          funSignatures.includes('approve(address,uint256)') &&
          funSignatures.includes('allowance(address,address)')
  }
}

