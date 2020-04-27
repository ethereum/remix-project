const yo = require('yo-yo')
const remixLib = require('remix-lib')
const css = require('./styles/debugger-tab-styles')
import toaster from '../ui/tooltip'
const DebuggerUI = require('./debugger/debuggerUI')
import { ViewPlugin } from '@remixproject/engine'
import * as packageJson from '../../../package.json'

const profile = {
  name: 'debugger',
  displayName: 'Debugger',
  methods: ['debug', 'getTrace'],
  events: [],
  icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB3aWR0aD0iMTc5MiIgaGVpZ2h0PSIxNzkyIiB2aWV3Qm94PSIwIDAgMTc5MiAxNzkyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xNjk2IDk2MHEwIDI2LTE5IDQ1dC00NSAxOWgtMjI0cTAgMTcxLTY3IDI5MGwyMDggMjA5cTE5IDE5IDE5IDQ1dC0xOSA0NXEtMTggMTktNDUgMTl0LTQ1LTE5bC0xOTgtMTk3cS01IDUtMTUgMTN0LTQyIDI4LjUtNjUgMzYuNS04MiAyOS05NyAxM3YtODk2aC0xMjh2ODk2cS01MSAwLTEwMS41LTEzLjV0LTg3LTMzLTY2LTM5LTQzLjUtMzIuNWwtMTUtMTQtMTgzIDIwN3EtMjAgMjEtNDggMjEtMjQgMC00My0xNi0xOS0xOC0yMC41LTQ0LjV0MTUuNS00Ni41bDIwMi0yMjdxLTU4LTExNC01OC0yNzRoLTIyNHEtMjYgMC00NS0xOXQtMTktNDUgMTktNDUgNDUtMTloMjI0di0yOTRsLTE3My0xNzNxLTE5LTE5LTE5LTQ1dDE5LTQ1IDQ1LTE5IDQ1IDE5bDE3MyAxNzNoODQ0bDE3My0xNzNxMTktMTkgNDUtMTl0NDUgMTkgMTkgNDUtMTkgNDVsLTE3MyAxNzN2Mjk0aDIyNHEyNiAwIDQ1IDE5dDE5IDQ1em0tNDgwLTU3NmgtNjQwcTAtMTMzIDkzLjUtMjI2LjV0MjI2LjUtOTMuNSAyMjYuNSA5My41IDkzLjUgMjI2LjV6Ii8+PC9zdmc+',
  description: 'Debug transactions',
  kind: 'debugging',
  location: 'sidePanel',
  documentation: 'https://remix-ide.readthedocs.io/en/latest/debugger.html',
  version: packageJson.version
}

class DebuggerTab extends ViewPlugin {

  constructor (blockchain) {
    super(profile)
    this.el = null
    this.blockchain = blockchain
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

    this.debuggerUI = new DebuggerUI(
      this.el.querySelector('#debugger'),
      this.blockchain,
      (address, receipt) => {
        const target = (address && remixLib.helpers.trace.isContractCreation(address)) ? receipt.contractAddress : address
        return this.call('fetchAndCompile', 'resolve', target || receipt.contractAddress || receipt.to, '.debug', this.blockchain.web3())
      })

    this.call('manager', 'activatePlugin', 'source-verification')
    // this.call('manager', 'activatePlugin', 'udapp')

    return this.el
  }

  debug (hash) {
    if (this.debuggerUI) this.debuggerUI.debug(hash)
  }

  getTrace (hash) {
    return this.debuggerUI.getTrace(hash)
  }

  debugger () {
    return this.debuggerUI
  }
}

module.exports = DebuggerTab
