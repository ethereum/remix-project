export class Workspace {
  constructor (title, description, activate, deactivate) {
    this.title = title
    this.description = description
    this.activate = activate
    this.deactivate = deactivate
  }
}

export const defaultWorkspaces = (appManager) => {
  return [
    new Workspace('Solidity Basic', '', () => {
      appManager.ensureActivated('solidity')
    }, () => {}),
    new Workspace('Solidity Unit testing', '', () => {
      appManager.ensureActivated('solidity')
      appManager.ensureActivated('solidityUnitTesting')
    }, () => {}),
    new Workspace('Solidity Full Environement', '', () => {
      appManager.ensureActivated('solidity')
      appManager.ensureActivated('run')
      appManager.ensureActivated('solidityStaticAnalysis')
      appManager.ensureActivated('solidityUnitTesting')
    }, () => {}),
    new Workspace('Vyper Basic', '', () => {
      appManager.ensureActivated('vyper')
    }, () => {}),
    new Workspace('Pipeline', '', () => {
      appManager.ensureActivated('solidity')
      appManager.ensureActivated('run')
      appManager.ensureActivated('pipeline')
    }, () => {}),
    new Workspace('Deploy and Run Solidity', '', () => {
      appManager.ensureActivated('solidity')
      appManager.ensureActivated('run')
    }, () => {}),
    new Workspace('Deploy and Run Vyper', '', () => {
      appManager.ensureActivated('vyper')
      appManager.ensureActivated('run')
    }, () => {}),
    new Workspace('Debugger', '', () => {
      appManager.ensureActivated('debugger')
    }, () => {})
  ]
}
