var yo = require('yo-yo')

// -------------- styling ----------------------
var csjs = require('csjs-inject')
var styleGuide = require('./style-guide')
var styles = styleGuide()

var css = csjs`
  .analysisTabView {
    padding: 2%;
    margin-top: 1em;
    padding-bottom: 3em;
  }
  .infoBox extends ${styles.infoTextBox} {
    margin-bottom: 1em;
  }
  .textBox extends ${styles.textBoxL} {
    margin-bottom: 1em;
  }
`

module.exports = analysisTab

function analysisTab () {
  return yo`
    <div class="${css.analysisTabView} "id="staticanalysisView">
    </div>
  `
}
