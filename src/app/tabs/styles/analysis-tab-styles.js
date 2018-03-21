// -------------- styling ----------------------
var csjs = require('csjs-inject')
var styleGuide = require('../../ui/styles-guide/theme-chooser')
var styles = styleGuide.chooser()

var css = csjs`
  .analysisTabView {
    padding: 2%;
    padding-bottom: 3em;
    display: flex;
    flex-direction: column;
  }
  #staticanalysisView {
    display: block;
  }
  .infoBox  {
    ${styles.infoTextBox}
    margin-bottom: 1em;
  }
  .textBox  {
    ${styles.textBoxL}
    margin-bottom: 1em;
  }
`

module.exports = css
