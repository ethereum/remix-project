var yo = require('yo-yo')
var css = require('./styles/debugger-tab-styles')

function debuggerTab (api = {}, events = {}, opts = {}) {
  var el = yo`
    <div class="${css.debuggerTabView} "id="debugView">
      <div id="debugger" class="${css.debugger}"></div>
    </div>`
  return { render () { return el } }
}

module.exports = debuggerTab
