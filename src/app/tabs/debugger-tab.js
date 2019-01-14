var yo = require('yo-yo')
var csjs = require('csjs-inject')

var DebuggerUI = require('../debugger/debuggerUI')

var globalRegistry = require('../../global/registry')
var EventManager = require('../../lib/events')
var styles = require('../ui/styles-guide/theme-chooser').chooser()

const css = csjs`
  .debuggerTabView {
    padding: 2%;
  }
  .debugger {
    margin-bottom: 1%;
    ${styles.rightPanel.debuggerTab.box_Debugger}
  }
`

class DebuggerTab {
  constructor (localRegistry) {
    const self = this
    self.event = new EventManager()
    self._view = { el: null }
    self.data = {}
    self._components = {}
    self._components.registry = localRegistry || globalRegistry
  }

  profile () {
    return {
      name: 'debugger',
      methods: [],
      events: [],
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB3aWR0aD0iMTc5MiIgaGVpZ2h0PSIxNzkyIiB2aWV3Qm94PSIwIDAgMTc5MiAxNzkyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xNjk2IDk2MHEwIDI2LTE5IDQ1dC00NSAxOWgtMjI0cTAgMTcxLTY3IDI5MGwyMDggMjA5cTE5IDE5IDE5IDQ1dC0xOSA0NXEtMTggMTktNDUgMTl0LTQ1LTE5bC0xOTgtMTk3cS01IDUtMTUgMTN0LTQyIDI4LjUtNjUgMzYuNS04MiAyOS05NyAxM3YtODk2aC0xMjh2ODk2cS01MSAwLTEwMS41LTEzLjV0LTg3LTMzLTY2LTM5LTQzLjUtMzIuNWwtMTUtMTQtMTgzIDIwN3EtMjAgMjEtNDggMjEtMjQgMC00My0xNi0xOS0xOC0yMC41LTQ0LjV0MTUuNS00Ni41bDIwMi0yMjdxLTU4LTExNC01OC0yNzRoLTIyNHEtMjYgMC00NS0xOXQtMTktNDUgMTktNDUgNDUtMTloMjI0di0yOTRsLTE3My0xNzNxLTE5LTE5LTE5LTQ1dDE5LTQ1IDQ1LTE5IDQ1IDE5bDE3MyAxNzNoODQ0bDE3My0xNzNxMTktMTkgNDUtMTl0NDUgMTkgMTkgNDUtMTkgNDVsLTE3MyAxNzN2Mjk0aDIyNHEyNiAwIDQ1IDE5dDE5IDQ1em0tNDgwLTU3NmgtNjQwcTAtMTMzIDkzLjUtMjI2LjV0MjI2LjUtOTMuNSAyMjYuNSA5My41IDkzLjUgMjI2LjV6Ii8+PC9zdmc+',
      description: 'debug transactions'
    }
  }

  render () {
    const self = this
    if (self._view.el) return self._view.el

    self._view.el = yo`
      <div class="${css.debuggerTabView}" id="debugView">
        <div id="debugger" class="${css.debugger}"></div>
      </div>`

    this.debuggerUI = new DebuggerUI(self._view.el.querySelector('#debugger'))
    return self._view.el
  }

  debugger () {
    return this.debuggerUI
  }
}

module.exports = DebuggerTab
