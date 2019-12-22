const name = 'ERC20: '
const desc = 'Decimal should be uint8'
const categories = require('./categories')
const common = require('./staticAnalysisCommon')
const AbstractAst = require('./abstractAstView')
const algo = require('./algorithmCategories')

function erc20Decimals () {
  this.abstractAst = new AbstractAst()
  this.visit = this.abstractAst.build_visit(
    (node) => false
  )
  this.report = this.abstractAst.build_report(report)
}

erc20Decimals.prototype.visit = function () { throw new Error('erc20Decimals.js no visit function set upon construction') }

erc20Decimals.prototype.report = function () { throw new Error('erc20Decimals.js no report function set upon construction') }

function report (contracts, multipleContractsWithSameName) {
  const warnings = []

  contracts.forEach((contract) => {
    const contractAbiSignatures = contract.functions.map((f) => common.helpers.buildAbiSignature(common.getFunctionDefinitionName(f.node), f.parameters))

    if (isERC20(contractAbiSignatures)) {
      const decimalsVar = contract.stateVariables.filter((stateVar) => common.getDeclaredVariableName(stateVar) === 'decimals' && (common.getDeclaredVariableType(stateVar) !== 'uint8' || stateVar.attributes.visibility !== 'public'))
      const decimalsFun = contract.functions.filter((f) => common.getFunctionDefinitionName(f.node) === 'decimals' &&
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

function isERC20 (funSignatures) {
  return funSignatures.includes('totalSupply()') &&
         funSignatures.includes('balanceOf(address)') &&
         funSignatures.includes('transfer(address,uint256)') &&
         funSignatures.includes('transferFrom(address,address,uint256)') &&
         funSignatures.includes('approve(address,uint256)') &&
         funSignatures.includes('allowance(address,address)')
}

module.exports = {
  name: name,
  description: desc,
  category: categories.ERC,
  algorithm: algo.EXACT,
  Module: erc20Decimals
}
