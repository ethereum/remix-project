var yo = require('yo-yo')
var csjs = require('csjs-inject')
const copyToClipboard = require('./copy-to-clipboard')
const Web3 = require('web3')

var css = csjs`
  #confirmsetting {
    z-index: 1;
  }
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

function confirmDialog (tx, network, amount, gasEstimation, newGasPriceCb, initialParamsCb) {
  const onGasPriceChange = function () {
    var gasPrice = el.querySelector('#gasprice').value
    newGasPriceCb(gasPrice, (txFeeText, priceStatus) => {
      el.querySelector('#txfee').innerHTML = txFeeText
      el.gasPriceStatus = priceStatus
      el.txFee = { gasPrice }
    })
  }

  const onMaxFeeChange = function () {
    var maxFee = el.querySelector('#maxfee').value
    var confirmBtn = document.querySelector('#modal-footer-ok')
    var maxPriorityFee = el.querySelector('#maxpriorityfee').value
    if (parseInt(network.lastBlock.baseFeePerGas, 16) > Web3.utils.toWei(maxFee, 'Gwei')) {
      el.querySelector('#txfee').innerHTML = 'Transaction is invalid. Max fee should not be less than Base fee'
      el.gasPriceStatus = false
      confirmBtn.hidden = true
      return
    } else {
      el.gasPriceStatus = true
      confirmBtn.hidden = false
    }

    newGasPriceCb(maxFee, (txFeeText, priceStatus) => {
      el.querySelector('#txfee').innerHTML = txFeeText
      if (priceStatus) {
        confirmBtn.hidden = false
      } else {
        confirmBtn.hidden = true
      }
      el.gasPriceStatus = priceStatus
      el.txFee = { maxFee, maxPriorityFee, baseFeePerGas: network.lastBlock.baseFeePerGas }
    })
  }

  const el = yo`
    <div>
      <div class="text-dark">You are about to create a transaction on ${network.name} Network. Confirm the details to send the info to your provider.
        <br>The provider for many users is MetaMask. The provider will ask you to sign the transaction before it is sent to ${network.name} Network.
      </div>
      <div class="mt-3 ${css.txInfoBox}">
        <div>
          <span class="text-dark mr-2">From:</span>
          <span>${tx.from}</span>
        </div>
        <div>
          <span class="text-dark mr-2">To:</span>
          <span>${tx.to ? tx.to : '(Contract Creation)'}</span>
        </div>
        <div class="d-flex align-items-center">
          <span class="text-dark mr-2">Data:</span>
          <pre class="${css.wrapword} mb-0">${tx.data && tx.data.length > 50 ? tx.data.substring(0, 49) + '...' : tx.data} ${copyToClipboard(() => { return tx.data })}</pre>
        </div>
        <div class="mb-3">
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
        ${
          network.lastBlock.baseFeePerGas ? yo`
          <div class="align-items-center my-1" title="Represents the part of the tx fee that goes to the miner.">
            <div class='d-flex'>
              <span class="text-dark mr-2 text-nowrap">Max Priority fee:</span>
              <input class="form-control mr-1 text-right" style='height: 1.2rem; width: 6rem;' value="1" id='maxpriorityfee' />
              <span title="visit https://ethgasstation.info for current gas price info.">Gwei</span>
            </div>            
          </div>
          <div class="align-items-center my-1" title="Represents the maximum amount of fee that you will pay for this transaction. The minimun needs to be set to base fee.">
            <div class='d-flex'>
              <span class="text-dark mr-2 text-nowrap">Max fee (Not less than base fee ${Web3.utils.fromWei(Web3.utils.toBN(parseInt(network.lastBlock.baseFeePerGas, 16)), 'Gwei')} Gwei):</span>
              <input class="form-control mr-1 text-right" style='height: 1.2rem; width: 6rem;' id='maxfee' oninput=${onMaxFeeChange} />
              <span>Gwei</span>
              <span class="text-dark ml-2"></span>
            </div>
          </div>`
            : yo`<div class="d-flex align-items-center my-1">
            <span class="text-dark mr-2 text-nowrap">Gas price:</span>
            <input class="form-control mr-1 text-right" style='width: 40px; height: 28px;' id='gasprice' oninput=${onGasPriceChange} />
            <span>Gwei (visit <a target='_blank' href='https://ethgasstation.info'>ethgasstation.info</a> for current gas price info.)</span>
          </div>`
        }
        <div class="mb-3">
          <span class="text-dark mr-2">Max transaction fee:</span>
          <span class="text-warning" id='txfee'></span>
        </div>
      </div>
      <div class="d-flex py-1 align-items-center custom-control custom-checkbox ${css.checkbox}">
        <input class="form-check-input custom-control-input" id="confirmsetting" type="checkbox">
        <label class="m-0 form-check-label custom-control-label" for="confirmsetting">Do not show this warning again.</label>
      </div>
    </div>
  `

  initialParamsCb((txFeeText, gasPriceValue, gasPriceStatus) => {
    if (txFeeText) {
      el.querySelector('#txfee').innerHTML = txFeeText
    }
    if (el.querySelector('#gasprice') && gasPriceValue) {
      el.querySelector('#gasprice').value = gasPriceValue
      onGasPriceChange()
    }
    if (el.querySelector('#maxfee') && network && network.lastBlock && network.lastBlock.baseFeePerGas) {
      el.querySelector('#maxfee').value = Web3.utils.fromWei(Web3.utils.toBN(parseInt(network.lastBlock.baseFeePerGas, 16)), 'Gwei')
      onMaxFeeChange()
    }
    if (gasPriceStatus !== undefined) {
      el.gasPriceStatus = gasPriceStatus
    }
  })

  return el
}

module.exports = confirmDialog
