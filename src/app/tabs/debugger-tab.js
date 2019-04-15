var yo = require('yo-yo')
var css = require('./styles/debugger-tab-styles')

var DebuggerUI = require('../debugger/debuggerUI')

import { BaseApi } from 'remix-plugin'

const profile = {
  name: 'debugger',
  displayName: 'Debugger',
  methods: [],
  events: [],
  icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB3aWR0aD0iMTc5MiIgaGVpZ2h0PSIxNzkyIiB2aWV3Qm94PSIwIDAgMTc5MiAxNzkyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xNjk2IDk2MHEwIDI2LTE5IDQ1dC00NSAxOWgtMjI0cTAgMTcxLTY3IDI5MGwyMDggMjA5cTE5IDE5IDE5IDQ1dC0xOSA0NXEtMTggMTktNDUgMTl0LTQ1LTE5bC0xOTgtMTk3cS01IDUtMTUgMTN0LTQyIDI4LjUtNjUgMzYuNS04MiAyOS05NyAxM3YtODk2aC0xMjh2ODk2cS01MSAwLTEwMS41LTEzLjV0LTg3LTMzLTY2LTM5LTQzLjUtMzIuNWwtMTUtMTQtMTgzIDIwN3EtMjAgMjEtNDggMjEtMjQgMC00My0xNi0xOS0xOC0yMC41LTQ0LjV0MTUuNS00Ni41bDIwMi0yMjdxLTU4LTExNC01OC0yNzRoLTIyNHEtMjYgMC00NS0xOXQtMTktNDUgMTktNDUgNDUtMTloMjI0di0yOTRsLTE3My0xNzNxLTE5LTE5LTE5LTQ1dDE5LTQ1IDQ1LTE5IDQ1IDE5bDE3MyAxNzNoODQ0bDE3My0xNzNxMTktMTkgNDUtMTl0NDUgMTkgMTkgNDUtMTkgNDVsLTE3MyAxNzN2Mjk0aDIyNHEyNiAwIDQ1IDE5dDE5IDQ1em0tNDgwLTU3NmgtNjQwcTAtMTMzIDkzLjUtMjI2LjV0MjI2LjUtOTMuNSAyMjYuNSA5My41IDkzLjUgMjI2LjV6Ii8+PC9zdmc+',
  description: 'Debug transactions',
  kind: 'debugging',
  location: 'swapPanel'
}

class DebuggerTab extends BaseApi {

  constructor () {
    super(profile)
    this.el = null
  }

  render () {
    if (this.el) return this.el

    this.el = yo`
      <div class="${css.debuggerTabView}" id="debugView">
        <div id="debugger" class="${css.debugger}"></div>
      </div>`

    this.debuggerUI = new DebuggerUI(this.el.querySelector('#debugger'))
    return this.el
  }

  debugger () {
    return this.debuggerUI
  }
}

module.exports = DebuggerTab
