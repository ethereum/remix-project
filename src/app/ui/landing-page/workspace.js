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
    new Workspace('Solidity', '', () => {
      appManager.ensureActivated('solidity')
      appManager.ensureActivated('run')
      appManager.ensureActivated('solidityStaticAnalysis')
      appManager.ensureActivated('solidityUnitTesting')
    }, () => {}),
    new Workspace('Vyper', '', () => {
      appManager.ensureActivated('vyper')
      appManager.ensureActivated('run')
    }, () => {}),
    new Workspace('Pipeline', '', () => {
      appManager.ensureActivated('solidity')
      appManager.ensureActivated('run')
      appManager.ensureActivated('pipeline')
    }, () => {}),
    new Workspace('Debugger', '', () => {
      appManager.ensureActivated('debugger')
    }, () => {})
  ]
}
