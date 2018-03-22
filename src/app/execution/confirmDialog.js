var yo = require('yo-yo')
var csjs = require('csjs-inject')
var styleGuide = require('../ui/styles-guide/theme-chooser')
var styles = styleGuide.chooser()

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

function confirmDialog (tx, amount, gasEstimation, self, newGasPriceCb, initialParamsCb) {
  var onGasPriceChange = function () {
    var gasPrice = el.querySelector('#gasprice').value
    newGasPriceCb(gasPrice, (txFeeText, priceStatus) => {
      el.querySelector('#txfee').innerHTML = txFeeText
      el.gasPriceStatus = priceStatus
    })
  }

  var el = yo`
  <div>
    <div>You are creating a transaction on the main network. Click confirm if you are sure to continue.</div>
    <div class=${css.txInfoBox}>
      <div>From: ${tx.from}</div>
      <div>To: ${tx.to ? tx.to : '(Contract Creation)'}</div>
      <div>Amount: ${amount} Ether</div>
      <div>Gas estimation: ${gasEstimation}</div>
      <div>Gas limit: ${tx.gas}</div>
      <div>Gas price: <input id='gasprice' oninput=${onGasPriceChange} /> Gwei <span> (visit <a target='_blank' href='https://ethgasstation.info'>ethgasstation.info</a> to get more info about gas price)</span></div>
      <div>Max transaction fee:<span id='txfee'></span></div>
      <div>Data:</div>
      <pre class=${css.wrapword}>${tx.data}</pre>
    </div>
    <div class=${css.checkbox}>
      <input id='confirmsetting' type="checkbox">
      <i class="fa fa-exclamation-triangle" aria-hidden="true"></i> Do not ask for confirmation again. (the setting will not be persisted for the next page reload)
    </div>
  </div>
  `

  initialParamsCb((txFeeText, gasPriceValue, gasPriceStatus) => {
    if (txFeeText) {
      el.querySelector('#txfee').innerHTML = txFeeText
    }
    if (gasPriceValue) {
      el.querySelector('#gasprice').value = gasPriceValue
      onGasPriceChange()
    }
    if (gasPriceStatus !== undefined) {
      el.gasPriceStatus = gasPriceStatus
    }
  })

  return el
}

module.exports = confirmDialog
