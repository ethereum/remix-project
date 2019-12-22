const name = 'Selfdestruct: '
const desc = 'Be aware of caller contracts.'
const categories = require('./categories')
const common = require('./staticAnalysisCommon')
const AbstractAst = require('./abstractAstView')
const algo = require('./algorithmCategories')

function selfdestruct () {
  this.abstractAst = new AbstractAst()

  this.visit = this.abstractAst.build_visit(
    (node) => common.isStatement(node) ||
              common.isSelfdestructCall(node)
  )

  this.report = this.abstractAst.build_report(report)
}

selfdestruct.prototype.visit = function () { throw new Error('selfdestruct.js no visit function set upon construction') }

selfdestruct.prototype.report = function () { throw new Error('selfdestruct.js no report function set upon construction') }

function report (contracts, multipleContractsWithSameName) {
  const warnings = []

  contracts.forEach((contract) => {
    contract.functions.forEach((func) => {
      let hasSelf = false
      func.relevantNodes.forEach((node) => {
        if (common.isSelfdestructCall(node)) {
          warnings.push({
            warning: 'Use of selfdestruct: can block calling contracts unexpectedly. Be especially careful if this contract is planned to be used by other contracts (i.e. library contracts, interactions). Selfdestruction of the callee contract can leave callers in an inoperable state.',
            location: node.src,
            more: 'https://paritytech.io/blog/security-alert.html'
          })
          hasSelf = true
        }
        if (common.isStatement(node) && hasSelf) {
          warnings.push({
            warning: 'Use of selfdestruct: No code after selfdestruct is executed. Selfdestruct is a terminal.',
            location: node.src,
            more: 'http://solidity.readthedocs.io/en/develop/introduction-to-smart-contracts.html#self-destruct'
          })
          hasSelf = false
        }
      })
    })
  })

  return warnings
}

module.exports = {
  name: name,
  description: desc,
  category: categories.SECURITY,
  algorithm: algo.HEURISTIC,
  Module: selfdestruct
}
