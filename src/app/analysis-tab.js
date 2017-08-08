var yo = require('yo-yo')

// -------------- styling ----------------------
var csjs = require('csjs-inject')
var styleGuide = require('./style-guide')
var styles = styleGuide()

var css = csjs`
  .analysisTabView {
    padding: 2%;
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

function analysisTab (container, appAPI, events, opts) {
  var el = yo`
    <div class="${css.analysisTabView} "id="staticanalysisView">
    </div>
  `
  container.appendChild(el)
}
