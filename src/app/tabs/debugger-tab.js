var yo = require('yo-yo')
var css = require('./styles/debugger-tab-styles')

var DebuggerUI = require('../debugger/debuggerUI')

class DebuggerTab {
  constructor () {
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
