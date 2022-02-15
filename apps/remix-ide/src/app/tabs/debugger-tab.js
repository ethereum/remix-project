import { DebuggerUI } from '@remix-ui/debugger-ui' // eslint-disable-line
import { DebuggerApiMixin } from '@remixproject/debugger-plugin' // eslint-disable-line
import { ViewPlugin } from '@remixproject/engine-web'
import * as packageJson from '../../../../../package.json'
import React from 'react' // eslint-disable-line
import * as remixBleach from '../../lib/remixBleach'
import { compilationFinishedToastMsg, compilingToastMsg, localCompilationToastMsg, notFoundToastMsg, sourceVerificationNotAvailableToastMsg } from '@remix-ui/helper'
const css = require('./styles/debugger-tab-styles')

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
    this.el = document.createElement('div')
    this.el.setAttribute('id', 'debugView')
    this.el.classList.add(css.debuggerTabView)
    this.initDebuggerApi()
  }

  render () {
    this.on('fetchAndCompile', 'compiling', (settings) => {
      settings = JSON.stringify(settings, null, '\t')
      this.call('notification', 'toast', compilingToastMsg(settings))
    })

    this.on('fetchAndCompile', 'compilationFailed', (data) => {
      this.call('notification', 'toast', compilationFinishedToastMsg())
    })

    this.on('fetchAndCompile', 'notFound', (contractAddress) => {
      this.call('notification', 'toast', notFoundToastMsg(contractAddress))
    })

    this.on('fetchAndCompile', 'usingLocalCompilation', (contractAddress) => {
      this.call('notification', 'toast', localCompilationToastMsg())
    })

    this.on('fetchAndCompile', 'sourceVerificationNotAvailable', () => {
      this.call('notification', 'toast', sourceVerificationNotAvailableToastMsg())
    })
    return <div className={css.debuggerTabView} id='debugView'><DebuggerUI debuggerAPI={this} /></div>
  }

  showMessage (title, message) {
    try {
      this.call('notification', 'alert', {
        id: 'debuggerTabShowMessage',
        title,
        message: remixBleach.sanitize(message)
      })
    } catch (e) {
      console.log(e)
    }
  }

}
