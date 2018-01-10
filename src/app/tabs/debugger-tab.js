var yo = require('yo-yo')
// -------------- styling ----------------------
var csjs = require('csjs-inject')
var styleGuide = require('remix-lib').ui.themeChooser
var styles = styleGuide.chooser()

var css = csjs`
  .debuggerTabView {
    padding: 2%;
  }
  .debugger {
    margin-bottom: 1%;
    ${styles.rightPanel.debuggerTab.box_Debugger}
  }
`

module.exports = debuggerTab

function debuggerTab (container, appAPI, events, opts) {
  var el = yo`
    <div class="${css.debuggerTabView} "id="debugView">
      <div id="debugger" class="${css.debugger}"></div>
    </div>`
  container.appendChild(el)
  return el
}
