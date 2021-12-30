import { Plugin } from '@remixproject/engine'
import { Profile } from '@remixproject/plugin-utils'
import { EventEmitter } from 'events'
import { TabProxy } from './tab-proxy'
const EventManager = require('../../lib/events')

const profile: Profile = {
  name: 'layout',
  description: 'layout'
}

interface panelState {
  active: boolean
  plugin: Plugin
}
interface panels {
  tabs: panelState
  editor: panelState
  main: panelState
  terminal: panelState
}

export class Layout extends Plugin {
  event: any
  panels: panels
  constructor() {
    super(profile)
    this.event = new EventEmitter()
  }

  onActivation(): void {
    console.log('layout plugin activated')
    this.on('fileManager', 'currentFileChanged', () => {
      console.log('layout plugin currentFileChanged')
      this.panels.editor.active = true
      this.panels.main.active = false
      this.event.emit('change', null)
    })
    this.on('tabs', 'openFile', () => {
      console.log('layout plugin currentFileChanged')
      this.panels.editor.active = true
      this.panels.main.active = false
      this.event.emit('change', null)
    })
    this.on('tabs', 'switchApp', (name: string) => {
      console.log('layout plugin switchApp', name)
      this.call('mainPanel', 'showContent', name)
      this.panels.editor.active = false
      this.panels.main.active = true
      this.event.emit('change', null)
    })
    this.on('tabs', 'closeApp', (name: string) => {
      console.log('layout plugin closeapp', name)
      this.panels.editor.active = true
      this.panels.main.active = false
      this.event.emit('change', null)
    })
    this.on('tabs', 'tabCountChanged', (count) => {
      // if (!count) this.editor.displayEmptyReadOnlySession()
    })
  }
}
