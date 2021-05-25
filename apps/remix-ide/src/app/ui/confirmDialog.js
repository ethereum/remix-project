var yo = require('yo-yo')
var csjs = require('csjs-inject')
const copyToClipboard = require('./copy-to-clipboard')

var css = csjs`
  .txInfoBox {
  }
  .wrapword {
    white-space: pre-wrap;       /* Since CSS 2.1 */
    white-space: -moz-pre-wrap;  /* Mozilla, since 1999 */
    white-space: -pre-wrap;      /* Opera 4-6 */
    white-space: -o-pre-wrap;    /* Opera 7 */
    word-wrap: break-word;       /* Internet Explorer 5.5+ */
  }
`

// TODO: self is not actually used and can be removed
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
      <div>You are about to create a transaction on the Main Network. Confirm the details to send the info to your provider.
        <br>The provider for many users is MetaMask. The provider will ask you to sign the transaction before it is sent to the Main Network.</div>
      <div class="mt-3 ${css.txInfoBox}">
        <div>
          <span class="text-dark mr-2">From:</span>
          <span>${tx.from}</span>
        </div>
        <div>
          <span class="text-dark mr-2">To:</span>
          <span>${tx.to ? tx.to : '(Contract Creation)'}</span>
        </div>
        <div>
          <span class="text-dark mr-2">Amount:</span>
          <span>${amount} Ether</span>
        </div>
        <div>
          <span class="text-dark mr-2">Gas estimation:</span>
          <span>${gasEstimation}</span>
        </div>
        <div>
          <span class="text-dark mr-2">Gas limit:</span>
          <span>${tx.gas}</span>
        </div>
        <div>
          <span class="text-dark mr-2">Max transaction fee:</span>
          <span id='txfee'></span>
        </div>
        <div class="d-flex align-items-center my-1">
          <span class="text-dark mr-2">Gas price:</span>
          <input class="form-control mr-1" style='width: 40px; height: 28px;'id='gasprice' oninput=${onGasPriceChange} />
          <span>Gwei (visit <a target='_blank' href='https://ethgasstation.info'>ethgasstation.info</a> for current gas price info.)</span>
        </div>
        <div class="d-flex align-items-center">
          <span class="text-dark mr-2 mb-3">Data:</span>
          <pre class=${css.wrapword}>${tx.data && tx.data.length > 50 ? tx.data.substring(0, 49) + '...' : tx.data} ${copyToClipboard(() => { return tx.data })}</pre>
        </div>
      </div>
      <div class="d-flex py-1 align-items-center custom-control custom-checkbox ${css.checkbox}">
        <input class="form-check-input custom-control-input" id='confirmsetting' type="checkbox">
        <label class="m-0 form-check-label custom-control-label">Do not show this warning again.</label>
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
