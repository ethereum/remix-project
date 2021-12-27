import { Plugin } from '@remixproject/engine'

export class MainView {
  fileManager: Plugin
  constructor (contextualListener, editor, mainPanel, fileManager, appManager, terminal) {
    this.fileManager = fileManager
  }
}
