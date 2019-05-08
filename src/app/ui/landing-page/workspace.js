let globalRegistry = require('../../../global/registry')

export class Workspace {
  constructor (title, description, isMain, activate, deactivate) {
    this.title = title
    this.description = description
    this.isMain = isMain
    this.activate = activate
    this.deactivate = deactivate
  }
}

export const defaultWorkspaces = (appManager) => {
  return [
    new Workspace(
      'Solidity',
      'Writing smart contracts. It is used for implementing smart contracts on various blockchain platforms',
      true,
      () => {
        appManager.ensureActivated('solidity')
        appManager.ensureActivated('run')
        appManager.ensureActivated('solidityStaticAnalysis')
        appManager.ensureActivated('solidityUnitTesting')
        globalRegistry.get('verticalicon').api.select('solidity')
      }, () => {}),
    new Workspace(
      'Vyper',
      'Vyper is a contract-oriented, pythonic programming language that targets the Ethereum Virtual Machine (EVM)',
      true,
      () => {
        appManager.ensureActivated('vyper')
        appManager.ensureActivated('run')
        globalRegistry.get('verticalicon').api.select('vyper')
      }, () => {}),
    new Workspace('Debugger', 'Debug transactions with remix', false, () => {
      appManager.ensureActivated('debugger')
    }, () => {}),
    new Workspace('Pipeline', '', false, () => {
      appManager.ensureActivated('solidity')
      appManager.ensureActivated('pipeline')
      appManager.ensureActivated('run')
    })
  ]
}
