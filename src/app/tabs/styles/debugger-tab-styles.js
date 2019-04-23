var csjs = require('csjs-inject')

const css = csjs`
  .debuggerTabView {
    padding: 2%;
  }
  .debugger {
    margin-bottom: 1%;
    width: max-content;
  }
`

module.exports = css
