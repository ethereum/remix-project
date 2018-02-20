var executionContext = require('../../execution-context')
var typeConversion = require('../../lib/typeConversion')
var yo = require('yo-yo')
var csjs = require('csjs-inject')
var remixLib = require('remix-lib')
var styleGuide = remixLib.ui.styleGuide
var styles = styleGuide()

var css = csjs`
  .txInfoBox {
    ${styles.rightPanel.compileTab.box_CompileContainer};  // add askToConfirmTXContainer to Remix and then replace this styling
  }
  .wrapword {
    white-space: pre-wrap;       /* Since CSS 2.1 */
    white-space: -moz-pre-wrap;  /* Mozilla, since 1999 */
    white-space: -pre-wrap;      /* Opera 4-6 */
    white-space: -o-pre-wrap;    /* Opera 7 */
    word-wrap: break-word;       /* Internet Explorer 5.5+ */
  }
`

function confirmDialog (tx, gasEstimation, self) {
  var amount = executionContext.web3().fromWei(typeConversion.toInt(tx.value), 'ether')
  var input = yo`<input id='confirmsetting' type="checkbox">`
  var el = yo`
  <div>
    <div>You are creating a transaction on the main network. Click confirm if you are sure to continue.</div>
    <div class=${css.txInfoBox}>
      <div>From: ${tx.from}</div>
      <div>To: ${tx.to ? tx.to : '(Contract Creation)'}</div>
      <div>Amount: ${amount} Ether</div>
      <div>Gas estimation: ${gasEstimation}</div>
      <div>Gas limit: ${tx.gas}</div>
      <div>Gas price: <input id='gasprice' oninput=${gasPriceChanged} /> Gwei <span> (visit <a target='_blank' href='https://ethgasstation.info'>ethgasstation.info</a> to get more info about gas price)</span></div>
      <div>Max transaction fee:<span id='txfee'></span></div>
      <div>Data:</div>
      <pre class=${css.wrapword}>${tx.data}</pre>
    </div>
    <div class=${css.checkbox}>
      ${input}
      <i class="fa fa-exclamation-triangle" aria-hidden="true"></i> Do not ask for confirmation again. (the setting will not be persisted for the next page reload)
    </div>
  </div>
  `

  var warnMessage = ' Please fix this issue before sending any transaction. '
  function gasPriceChanged () {
    try {
      var gasPrice = el.querySelector('#gasprice').value
      var fee = executionContext.web3().toBigNumber(tx.gas).mul(executionContext.web3().toBigNumber(executionContext.web3().toWei(gasPrice.toString(10), 'gwei')))
      el.querySelector('#txfee').innerHTML = ' ' + executionContext.web3().fromWei(fee.toString(10), 'ether') + ' Ether'
      el.gasPriceStatus = true
    } catch (e) {
      el.querySelector('#txfee').innerHTML = warnMessage + e.message
      el.gasPriceStatus = false
    }
  }

  executionContext.web3().eth.getGasPrice((error, gasPrice) => {
    if (error) {
      el.querySelector('#txfee').innerHTML = 'Unable to retrieve the current network gas price.' + warnMessage + error
    } else {
      try {
        el.querySelector('#gasprice').value = executionContext.web3().fromWei(gasPrice.toString(10), 'gwei')
        gasPriceChanged()
      } catch (e) {
        el.querySelector('#txfee').innerHTML = warnMessage + e.message
        el.gasPriceStatus = false
      }
    }
  })
  return el
}

module.exports = confirmDialog
