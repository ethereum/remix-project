import { EditorContextListener } from '@remix-project/core-plugin'
import { Plugin } from '@remixproject/engine'
import { Profile } from '@remixproject/plugin-utils'
import { MainPanel } from '../components/main-panel'
const EventManager = require('../../lib/events')

const profile:Profile = {
  name: 'mainview',
  description: 'main panel'
}
export class MainViewReact extends Plugin {
  fileManager: Plugin
  event: any
  tabProxy: Plugin
  editor: Plugin
  mainPanel: MainPanel
  terminal: Plugin
  appManager: Plugin
  contextualListener: EditorContextListener
  constructor (contextualListener, editor, mainPanel, fileManager, appManager, terminal) {
    super(profile)
    this.fileManager = fileManager
    this.event = new EventManager()
    this.editor = editor
    this.terminal = terminal
    this.appManager = appManager
    this.mainPanel = mainPanel
    this.contextualListener = contextualListener
  }
}
