var yo = require('yo-yo')

// -------------- styling ----------------------
var csjs = require('csjs-inject')
var styleGuide = require('./style-guide')
var styles = styleGuide()

var css = csjs`
  .analysisTabView {
    padding: 2%;
    margin-top: 1em;
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
      <div class="${css.infoBox}">
        This tab provides support for <b>formal verification</b> of Solidity contracts.<br>
        This feature is still in development and thus also not yet well documented,
        but you can find some information
        <a href="http://solidity.readthedocs.io/en/latest/security-considerations.html#formal-verification">here</a>.
        The compiler generates input to be verified
        (or report errors). Please paste the text below into
        <a href="http://why3.lri.fr/try/">http://why3.lri.fr/try/</a>
        to actually perform the verification.
        We plan to support direct integration in the future.
      </div>
      <textarea class="${css.textBox}" id="formalVerificationInput" readonly="readonly"></textarea>
      <div id="formalVerificationErrors"></div>
    </div>
  `
}
