var yo = require('yo-yo')

// -------------- styling ----------------------
var csjs = require('csjs-inject')
var remix = require('ethereum-remix')
var styleGuide = remix.ui.styleGuide
var styles = styleGuide()

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

module.exports = analysisTab

function analysisTab (container, appAPI, events, opts) {
  var el = yo`
    <div class="${css.analysisTabView} "id="staticanalysisView">
    </div>
  `
  container.appendChild(el)
}
