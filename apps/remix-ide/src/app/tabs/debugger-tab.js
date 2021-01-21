import toaster from '../ui/tooltip'
import { DebuggerUI } from '@remix-ui/debugger-ui' // eslint-disable-line
import { DebuggerApiMixin } from '@remixproject/debugger-plugin'
import { ViewPlugin } from '@remixproject/engine-web'
import * as packageJson from '../../../../../package.json'
import React from 'react' // eslint-disable-line
import ReactDOM from 'react-dom'
import modalDialogCustom from '../ui/modal-dialog-custom'
const yo = require('yo-yo')
const css = require('./styles/debugger-tab-styles')
import bleach from '../../lib/bleach'

const profile = {
  name: 'debugger',
  displayName: 'Debugger',
  methods: ['debug', 'getTrace'],
  events: [],
  icon: 'assets/img/debuggerLogo.webp',
  description: 'Debug transactions',
  kind: 'debugging',
  location: 'sidePanel',
  documentation: 'https://remix-ide.readthedocs.io/en/latest/debugger.html',
  version: packageJson.version
}

export class DebuggerTab extends DebuggerApiMixin(ViewPlugin) {
  constructor () {
    super(profile)
    this.el = null
    this.initDebuggerApi()
  }

  render () {
    if (this.el) return this.el

    this.el = yo`
      <div class="${css.debuggerTabView}" id="debugView">
        <div id="debugger" class="${css.debugger}"></div>
      </div>`

    this.on('fetchAndCompile', 'compiling', (settings) => {
      toaster(yo`<div><b>Recompiling and debugging with params</b><pre class="text-left">${JSON.stringify(settings, null, '\t')}</pre></div>`)
    })

    this.on('fetchAndCompile', 'compilationFailed', (data) => {
      toaster(yo`<div><b>Compilation failed...</b> continuing <i>without</i> source code debugging.</div>`)
    })

    this.on('fetchAndCompile', 'notFound', (contractAddress) => {
      toaster(yo`<div><b>Contract ${contractAddress} not found in source code repository</b> continuing <i>without</i> source code debugging.</div>`)
    })

    this.on('fetchAndCompile', 'usingLocalCompilation', (contractAddress) => {
      toaster(yo`<div><b>Using compilation result from Solidity module</b></div>`)
    })

    this.on('fetchAndCompile', 'sourceVerificationNotAvailable', () => {
      toaster(yo`<div><b>Source verification plugin not activated or not available.</b> continuing <i>without</i> source code debugging.</div>`)
    })

    this.renderComponent()

    return this.el
  }

  showMessage (title, message) {
    try {
      modalDialogCustom.alert(title, bleach.sanitize(message))
    } catch (e) {
      console.log(e)
    }
  }

  renderComponent () {
    ReactDOM.render(
      <DebuggerUI debuggerAPI={this} />
      , this.el)
  }
}
