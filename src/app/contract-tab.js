var yo = require('yo-yo')

// -------------- styling ----------------------
var csjs = require('csjs-inject')
var styleGuide = require('./style-guide')
var styles = styleGuide()

var css = csjs`
  .contractTabView {
    padding: 2%;
  }
  .crow {
    margin-top: 1em;
    display: flex;
  }
  .col1 extends ${styles.titleL} {
    width: 30%;
    float: left;
    align-self: center;
  }
  .col1_1 extends ${styles.titleM} {
    width: 30%;
    float: left;
    align-self: center;
  }
  .col2 extends ${styles.textBoxL}{
    width: 70%;
    height: 7px;
    float: left;
    padding: .8em;
  }
  .select extends ${styles.dropdown} {
    width: 70%;
    float: left;
    text-align: center;
  }
  .contract {
    display: block;
    margin: 4em 0 2em 0;
  }
`

module.exports = contractTab

function contractTab () {
  return yo`
    <div class="${css.contractTabView}" id="envView">
      <div class="${css.crow}">
        <div id="selectExEnv" class="${css.col1_1}">
          Execution environment
        </div>
        <select id="selectExEnvOptions" class="${css.select}">
          <option id="vm-mode"
            title="Execution environment does not connect to any node, everything is local and in memory only."
            value="vm"
            checked name="executionContext">
            JavaScript VM
          </option>
          <option id="injected-mode"
            title="Execution environment has been provided by Mist or similar provider."
            value="injected"
            checked name="executionContext">
            Injected Web3
          </option>
          <option id="web3-mode"
            title="Execution environment connects to node at localhost (or via IPC if available), transactions will be sent to the network and can cause loss of money or worse!
            If this page is served via https and you access your node via http, it might not work. In this case, try cloning the repository and serving it via http."
            value="web3"
            name="executionContext">
            Web3 Provider
          </option>
        </select>
      </div>
      <div class="${css.crow}">
        <div class="${css.col1_1}">Transaction origin</div>
        <select name="txorigin" class="${css.select}" id="txorigin"></select>
      </div>
      <div class="${css.crow}">
        <div class="${css.col1_1}">Transaction gas limit</div>
        <input type="number" class="${css.col2}" id="gasLimit" value="3000000">
      </div>
      <div class="${css.crow} hide">
      <div class="${css.col1_1}">Gas Price</div>
        <input type="number" class="${css.col2}" id="gasPrice" value="0">
      </div>
      <div class="${css.crow}">
        <div class="${css.col1_1}"> Value</div>
        <input type="text" class="${css.col2}" id="value" value="0" title="(e.g. .7 ether ...)">
      </div>
      <div id="output" class="${css.contract}"></div>
    </div>
  `
}
