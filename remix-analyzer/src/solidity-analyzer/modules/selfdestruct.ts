import { default as category } from './categories'
import { isStatement, isSelfdestructCall } from './staticAnalysisCommon'
import { default as algorithm } from './algorithmCategories'
import  AbstractAst from './abstractAstView'

export default class selfdestruct {
  name = 'Selfdestruct: '
  desc = 'Be aware of caller contracts.'
  categories = category.SECURITY
  algorithm = algorithm.HEURISTIC
  Module = this

  abstractAst = new AbstractAst()

  visit = this.abstractAst.build_visit(
    (node) => isStatement(node) ||
              isSelfdestructCall(node)
  )

  report = this.abstractAst.build_report(this._report)
  private _report (contracts, multipleContractsWithSameName) {
    const warnings: any[] = []

    contracts.forEach((contract) => {
      contract.functions.forEach((func) => {
        let hasSelf = false
        func.relevantNodes.forEach((node) => {
          if (isSelfdestructCall(node)) {
            warnings.push({
              warning: 'Use of selfdestruct: can block calling contracts unexpectedly. Be especially careful if this contract is planned to be used by other contracts (i.e. library contracts, interactions). Selfdestruction of the callee contract can leave callers in an inoperable state.',
              location: node.src,
              more: 'https://paritytech.io/blog/security-alert.html'
            })
            hasSelf = true
          }
          if (isStatement(node) && hasSelf) {
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
}
