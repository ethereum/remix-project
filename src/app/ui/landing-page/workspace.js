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
        appManager.ensureActivated('udapp')
        appManager.ensureActivated('solidityStaticAnalysis')
        appManager.ensureActivated('solidityUnitTesting')
      }, () => {}),
    new Workspace(
      'Vyper',
      'Vyper is a contract-oriented, pythonic programming language that targets the Ethereum Virtual Machine (EVM)',
      true,
      () => {
        appManager.ensureActivated('vyper')
        appManager.ensureActivated('udapp')
      }, () => {}),
    new Workspace(
      'Lexon',
      'Lexon is a language modelling legal contracts that compiles down to ethereum smart contracts',
      true,
      () => {
        appManager.ensureActivated('lexon')
        appManager.ensureActivated('udapp')
      }, () => {}),
    new Workspace('Debugger', 'Debug transactions with remix', false, () => {
      appManager.ensureActivated('debugger')
    }, () => {}),
    new Workspace('Pipeline', '', false, () => {
      appManager.ensureActivated('solidity')
      appManager.ensureActivated('pipeline')
      appManager.ensureActivated('udapp')
    })
  ]
}
