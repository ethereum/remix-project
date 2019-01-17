var csjs = require('csjs-inject')
var styles = require('../../ui/styles-guide/theme-chooser').chooser()

const css = csjs`
  .debuggerTabView {
    padding: 2%;
  }
  .debugger {
    margin-bottom: 1%;
    ${styles.rightPanel.debuggerTab.box_Debugger}
  }
`

module.exports = css
