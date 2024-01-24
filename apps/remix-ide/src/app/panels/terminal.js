/* global Node, requestAnimationFrame */   // eslint-disable-line
import React from 'react' // eslint-disable-line
import { useState } from 'react';
import { RemixUiTerminal } from '@remix-ui/terminal' // eslint-disable-line
import { Plugin } from '@remixproject/engine'
import * as packageJson from '../../../../../package.json'
import { Registry } from '@remix-project/remix-lib'
import { PluginViewWrapper } from '@remix-ui/helper'
import vm from 'vm'
const EventManager = require('../../lib/events')

import { CompilerImports } from '@remix-project/core-plugin' // eslint-disable-line
import { xTerminalAPI, RemixUiXterminals } from '@remix-ui/xterm'
import { CustomTooltip } from '@remix-ui/helper'
import { FormattedMessage } from 'react-intl'
import { ButtonGroup, Dropdown} from 'react-bootstrap'


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
      <div id="remic-ui-terminal-header" className='d-flex flex-row justify-content-between'>
        <div id="remix-ui-terminal-title-left" className='d-flex flex-row p-1'>
          <button
            className={`btn btn-sm btn-secondary mr-2 ${!state.onReady ? ' disable ' : null} ${!state.switchToRemixTerminal ? '' : 'border border-top'}`}
            onClick={() => { 
              this.dispatch({
                api: state.api,
                plugin: state.plugin,
                onReady: state.onReady,
                switchToRemixTerminal: true
              })
            }}
          >
            Output
          </button>
          <button
            className={`btn btn-sm btn-secondary ${state.switchToRemixTerminal ? '' : 'border border-top'}`}
            onClick={() => {
              this.dispatch({
                api: state.api,
                plugin: state.plugin,
                onReady: state.onReady,
                switchToRemixTerminal: false
              })
            }}
          >
            <span className="far fa-terminal border-0 ml-1"></span>
          </button>
        </div>
        <div id="remix-ui-terminal-title-right">
          {!state.switchToRemixTerminal ?
            <div className={`xterm-panel-header-right`}>
              <Dropdown as={ButtonGroup}>
                <button className="btn btn-sm btn-secondary mr-2" onClick={async () => this.xApi.clearTerminal()}>
                  <CustomTooltip tooltipText={<FormattedMessage id='xterm.clear' defaultMessage='Clear terminal' />}>
                    <span className="far fa-ban border-0 p-0 m-0"></span>
                  </CustomTooltip>
                </button>
                <button className="btn btn-sm btn-secondary" onClick={async () => this.xApi.createTerminal()}>
                  <CustomTooltip tooltipText={<FormattedMessage id='xterm.new' defaultMessage='New terminal' />}>
                    <span className="far fa-plus border-0 p-0 m-0"></span>
                  </CustomTooltip>
                </button>
                <Dropdown.Toggle split variant="secondary" id="dropdown-split-basic" />
                <Dropdown.Menu className='custom-dropdown-items remixui_menuwidth'>
                  {state.api.shells && state.api.shells().map((shell, index) => {
                    return (<Dropdown.Item key={index} onClick={async () => await state.api.createTerminal(shell)}>{shell}</Dropdown.Item>)
                  })}
                </Dropdown.Menu>
              </Dropdown>
              <button className="btn ml-2 btn-sm btn-secondary" onClick={state.api.closeTerminal}>
                <CustomTooltip tooltipText={<FormattedMessage id='xterm.close' defaultMessage='Close terminal' />}>
                  <span className="far fa-trash border-0 ml-1"></span>
                </CustomTooltip>
              </button>
            </div> : null
          }
        </div>
      </div>
      { state.switchToRemixTerminal ?
        <RemixUiTerminal
          plugin={state.plugin}
          onReady={state.onReady}
          visible={state.switchToRemixTerminal} // to be removed
        />
        : <RemixUiXterminals
          xTerminalAPI={state.api}
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
      api: this.xApi,
      plugin: this,
      onReady: onReady,
      switchToRemixTerminal: false
    })
  }

  scroll2bottom() {
    setTimeout(function () {
      // do nothing.
    }, 0)
  }
}

module.exports = Terminal
