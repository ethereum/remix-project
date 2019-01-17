var csjs = require('csjs-inject')

const css = csjs`
  .analysisTabView {
    padding: 2%;
    padding-bottom: 3em;
    display: flex;
    flex-direction: column;
  }
`

module.exports = css
