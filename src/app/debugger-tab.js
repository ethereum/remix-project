var yo = require('yo-yo')

// -------------- styling ----------------------
var csjs = require('csjs-inject')

var css = csjs`
  .debuggerTabView {
    padding: 2%;
  }
`

module.exports = debuggerTab

function debuggerTab () {
  return yo` <div class="${css.debuggerTabView} "id="debugView"><div id="debugger"></div></div>`
}
