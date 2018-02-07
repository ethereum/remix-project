var yo = require('yo-yo')
var css = require('./styles/debugger-tab-styles')

function debuggerTab (container) {
  var el = yo`
    <div class="${css.debuggerTabView} "id="debugView">
      <div id="debugger" class="${css.debugger}"></div>
    </div>`
  container.appendChild(el)
  return el
}

module.exports = debuggerTab
