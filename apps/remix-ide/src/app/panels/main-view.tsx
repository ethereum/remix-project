import { EditorContextListener } from '@remix-project/core-plugin'
import { Plugin } from '@remixproject/engine'
import { MainPanel } from '../components/main-panel'
const EventManager = require('../../lib/events')
export class MainView {
  fileManager: Plugin
  event: any
  tabProxy: Plugin
  editor: Plugin
  mainPanel: MainPanel
  terminal: Plugin
  appManager: Plugin
  contextualListener: EditorContextListener
  constructor (contextualListener, editor, mainPanel, fileManager, appManager, terminal) {
    this.fileManager = fileManager
    this.event = new EventManager()
    this.editor = editor
    this.terminal = terminal
    this.appManager = appManager
    this.mainPanel = mainPanel
    this.contextualListener = contextualListener
  }
}
