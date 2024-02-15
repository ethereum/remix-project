/* global Node, requestAnimationFrame */   // eslint-disable-line
import React from 'react' // eslint-disable-line
import { useRef } from 'react';
import { RemixUiTerminal } from '@remix-ui/terminal' // eslint-disable-line
import { Plugin } from '@remixproject/engine'
import * as packageJson from '../../../../../package.json'
import { Registry } from '@remix-project/remix-lib'
import { PluginViewWrapper } from '@remix-ui/helper'
import vm from 'vm'
const EventManager = require('../../lib/events')

import { CompilerImports } from '@remix-project/core-plugin' // eslint-disable-line
import { RemixUiXterminals } from '@remix-ui/xterm'
import { TerminalTitle } from './components/terminal-title'

const KONSOLES = []

function register(api) { KONSOLES.push(api) }

const profile = {
  displayName: 'Terminal',
  name: 'terminal',
  methods: ['log', 'logHtml'],
  events: [],
  description: 'Remix IDE terminal',
  version: packageJson.version
}

class Terminal extends Plugin {
  constructor(opts, api) {
    super(profile)
    this.fileImport = new CompilerImports()
    this.event = new EventManager()
    this.globalRegistry = Registry.getInstance()
    this.element = document.createElement('div')
    this.element.setAttribute('class', 'panel')
    this.element.setAttribute('id', 'terminal-view')
    this.element.setAttribute('data-id', 'terminalContainer-view')
    this.eventsDecoder = this.globalRegistry.get('eventsDecoder').api
    this.txListener = this.globalRegistry.get('txlistener').api
    this._deps = {
      fileManager: this.globalRegistry.get('filemanager').api,
      editor: this.globalRegistry.get('editor').api,
      compilersArtefacts: this.globalRegistry.get('compilersartefacts').api,
      offsetToLineColumnConverter: this.globalRegistry.get('offsettolinecolumnconverter').api
    }
    this.commandHelp = {
      'remix.loadgist(id)': 'Load a gist in the file explorer.',
      'remix.loadurl(url)': 'Load the given url in the file explorer. The url can be of type github, swarm, ipfs or raw http',
      'remix.execute(filepath)': 'Run the script specified by file path. If filepath is empty, script currently displayed in the editor is executed.',
      'remix.exeCurrent()': 'Run the script currently displayed in the editor',
      'remix.help()': 'Display this help message'
    }
    this.blockchain = opts.blockchain
    this.vm = vm
    this._api = api
    this._opts = opts
    this.config = this.globalRegistry.get('config').api
    this.version = packageJson.version
    this.data = {
      lineLength: opts.lineLength || 80, // ????
      session: [],
      activeFilters: { commands: {}, input: '' },
      filterFns: {}
    }
    this._view = { el: null, bar: null, input: null, term: null, journal: null, cli: null }
    this._components = {}
    this._commands = {}
    this.commands = {}
    this._JOURNAL = []
    this._jobs = []
    this._INDEX = {}
    this._INDEX.all = []
    this._INDEX.allMain = []
    this._INDEX.commands = {}
    this._INDEX.commandsMain = {}
    // to be implemented by the react component remix-ui-xterminals
    this.xApi = {}
    if (opts.shell) this._shell = opts.shell // ???
    register(this)
    this.event.register('debuggingRequested', async (hash) => {
      // TODO should probably be in the run module
      if (!await this._opts.appManager.isActive('debugger')) await this._opts.appManager.activatePlugin('debugger')
      this.call('menuicons', 'select', 'debugger')
      this.call('debugger', 'debug', hash)
    })
    this.dispatch = null
  }

  onActivation() {
    this.renderComponent()
  }

  onDeactivation() {
    this.off('scriptRunner', 'log')
    this.off('scriptRunner', 'info')
    this.off('scriptRunner', 'warn')
    this.off('scriptRunner', 'error')
  }

  logHtml(html) {
    this.terminalApi.logHtml(html)
  }

  log(message, type) {
    this.terminalApi.log(message, type)
  }

  setDispatch(dispatch) {
    this.dispatch = dispatch
  }

  render() {
    return <div id='terminal-view' className='panel' data-id='terminalContainer-view'><PluginViewWrapper plugin={this} /></div>
  }

  updateComponent(state) {
    return <div className='d-flex flex-column'>
      { <TerminalTitle
        ruiAPI={state.ruiAPI}
        xAPI={state.xAPI}
        onReady={state.onReady}
        plugin={state.plugin}
      >
      </TerminalTitle> }
      { state.switchToRemixTerminal ?
        <RemixUiTerminal
          ruiTerminalAPI={state.ruiAPI}
          plugin={state.plugin}
          onReady={state.onReady}
          visible={state.switchToRemixTerminal} // to be removed
        />
        : <RemixUiXterminals
          xTerminalAPI={state.xAPI}
          plugin={state.plugin}
          visible={true}
          onReady={state.onReady} 
        />
      }
    </div>
  }

  renderComponent() {
    const onReady = (api) => { this.terminalApi = api }
    this.dispatch({
      isOpen: true,
      xAPI: this.xApi,
      ruiAPI: this.ruiApi,
      plugin: this,
      onReady: onReady,
      switchToRemixTerminal: true
    })
  }

  scroll2bottom() {
    setTimeout(function () {
      // do nothing.
    }, 0)
  }
}

module.exports = Terminal
