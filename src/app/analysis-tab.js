var yo = require('yo-yo')

module.exports = analysisTab

function analysisTab () {
  return yo`
    <div id="staticanalysisView">
      <p> This tab provides support for <b>formal verification</b> of Solidity contracts.<br>
        This feature is still in development and thus also not yet well documented,
        but you can find some information
        <a href="http://solidity.readthedocs.io/en/latest/security-considerations.html#formal-verification">here</a>.
        The compiler generates input to be verified
        (or report errors). Please paste the text below into
        <a href="http://why3.lri.fr/try/">http://why3.lri.fr/try/</a>
        to actually perform the verification.
        We plan to support direct integration in the future.
      </p>
      <textarea id="formalVerificationInput" readonly="readonly"></textarea>
      <div id="formalVerificationErrors"></div>
    </div>
  `
}
