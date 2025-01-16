/* global Node, requestAnimationFrame */   // eslint-disable-line
import React from 'react' // eslint-disable-line
import { RemixUiTerminal, RemixUITerminalWrapper } from '@remix-ui/terminal' // eslint-disable-line
import { Plugin } from '@remixproject/engine'
import * as packageJson from '../../../../../package.json'
import { Registry } from '@remix-project/remix-lib'
import { PluginViewWrapper } from '@remix-ui/helper'
import vm from 'vm'
import EventManager from '../../lib/events'

import { CompilerImports } from '@remix-project/core-plugin' // eslint-disable-line
import { RemixUiXterminals } from '@remix-ui/xterm'

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

export default class Terminal extends Plugin {
  fileImport: CompilerImports
  event: any
  globalRegistry: Registry
  element: HTMLDivElement
  eventsDecoder: any
  txListener: any
  _deps: { fileManager: any; editor: any; compilersArtefacts: any; offsetToLineColumnConverter: any }
  commandHelp: { 'remix.loadgist(id)': string; 'remix.loadurl(url)': string; 'remix.execute(filepath)': string; 'remix.exeCurrent()': string; 'remix.help()': string }
  blockchain: any
  vm: typeof vm
  _api: any
  _opts: any
  config: any
  version: string
  data: {
    lineLength: any // ????
    session: any[]; activeFilters: { commands: any; input: string }; filterFns: any
  }
  _view: { el: any; bar: any; input: any; term: any; journal: any; cli: any }
  _components: any
  _commands: any
  commands: any
  _JOURNAL: any[]
  _jobs: any[]
  _INDEX: any
  _shell: any
  dispatch: any
  terminalApi: any
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
    if (opts.shell) this._shell = opts.shell // ???
    register(this)
    this.event.register('debuggingRequested', async (hash: any) => {
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
    this.off('scriptRunnerBridge', 'log')
    this.off('scriptRunnerBridge', 'info')
    this.off('scriptRunnerBridge', 'warn')
    this.off('scriptRunnerBridge', 'error')
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
    return (
      <RemixUITerminalWrapper
        plugin={state.plugin}
        onReady={state.onReady}
        visible={true}
      />)
  }

  renderComponent() {
    const onReady = (api) => { this.terminalApi = api }
    this.dispatch({
      plugin: this,
      onReady: onReady
    })
  }

  scroll2bottom() {
    setTimeout(function () {
      // do nothing.
    }, 0)
  }
}

