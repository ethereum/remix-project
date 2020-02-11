import { default as category } from './categories'
import { getFunctionDefinitionName, helpers, getDeclaredVariableName, getDeclaredVariableType } from './staticAnalysisCommon'
import { default as algorithm } from './algorithmCategories'
import  AbstractAst from './abstractAstView'

export default class erc20Decimals {
  name = 'ERC20: '
  desc = 'Decimal should be uint8'
  categories = category.ERC
  algorithm = algorithm.EXACT
  Module = this

  abstractAst = new AbstractAst()
  visit = this.abstractAst.build_visit((node) => false)
  report = this.abstractAst.build_report(this._report)

  private _report (contracts, multipleContractsWithSameName) {
    const warnings: any = []

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

  private isERC20 (funSignatures) {
    return funSignatures.includes('totalSupply()') &&
          funSignatures.includes('balanceOf(address)') &&
          funSignatures.includes('transfer(address,uint256)') &&
          funSignatures.includes('transferFrom(address,address,uint256)') &&
          funSignatures.includes('approve(address,uint256)') &&
          funSignatures.includes('allowance(address,address)')
  }
}

