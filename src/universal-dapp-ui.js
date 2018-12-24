/* global */
'use strict'

var $ = require('jquery')
var yo = require('yo-yo')
var helper = require('./lib/helper')
var copyToClipboard = require('./app/ui/copy-to-clipboard')
var css = require('./universal-dapp-styles')
var MultiParamManager = require('./multiParamManager')
var remixLib = require('remix-lib')
var typeConversion = remixLib.execution.typeConversion

var executionContext = require('./execution-context')

var modalDialog = require('./app/ui/modaldialog')
var confirmDialog = require('./app/execution/confirmDialog')

function UniversalDAppUI (udapp, opts = {}) {
  this.udapp = udapp
}

UniversalDAppUI.prototype.renderInstance = function (contract, address, contractName) {
  var noInstances = document.querySelector('[class^="noInstancesText"]')
  if (noInstances) {
    noInstances.parentNode.removeChild(noInstances)
  }
  var abi = this.udapp.getABI(contract)
  return this.renderInstanceFromABI(abi, address, contractName)
}

// TODO this function was named before "appendChild".
// this will render an instance: contract name, contract address, and all the public functions
// basically this has to be called for the "atAddress" (line 393) and when a contract creation succeed
// this returns a DOM element
UniversalDAppUI.prototype.renderInstanceFromABI = function (contractABI, address, contractName) {
  var self = this
  address = (address.slice(0, 2) === '0x' ? '' : '0x') + address.toString('hex')
  var instance = yo`<div class="instance ${css.instance} ${css.hidesub}" id="instance${address}"></div>`
  var context = self.udapp.context()

  var shortAddress = helper.shortenAddress(address)
  var title = yo`
    <div class="${css.title}" onclick=${toggleClass}>
    <div class="${css.titleText}"> ${contractName} at ${shortAddress} (${context}) </div>
    ${copyToClipboard(() => address)}
  </div>`

  var close = yo`<div class="${css.udappClose}" onclick=${remove}><i class="${css.closeIcon} fa fa-close" aria-hidden="true"></i></div>`
  title.appendChild(close)

  function remove () {
    instance.remove()
    // @TODO perhaps add a callack here to warn the caller that the instance has been removed
  }

  function toggleClass () {
    $(instance).toggleClass(`${css.hidesub}`)
  }

  instance.appendChild(title)

  // Add the fallback function
  var fallback = self.udapp.getFallbackInterface(contractABI)
  if (fallback) {
    instance.appendChild(this.getCallButton({
      funABI: fallback,
      address: address,
      contractAbi: contractABI,
      contractName: contractName
    }))
  }

  $.each(contractABI, (i, funABI) => {
    if (funABI.type !== 'function') {
      return
    }
    // @todo getData cannot be used with overloaded functions
    instance.appendChild(this.getCallButton({
      funABI: funABI,
      address: address,
      contractAbi: contractABI,
      contractName: contractName
    }))
  })

  return instance
}

// TODO this is used by renderInstance when a new instance is displayed.
// this returns a DOM element.
UniversalDAppUI.prototype.getCallButton = function (args) {
  var self = this
  // args.funABI, args.address [fun only]
  // args.contractName [constr only]
  var lookupOnly = args.funABI.constant

  var outputOverride = yo`<div class=${css.value}></div>` // show return value

  function clickButton (valArr, inputsValues) {
    self.udapp.call(true, args, inputsValues, lookupOnly,

      (network, tx, gasEstimation, continueTxExecution, cancelCb) => {
        if (network.name !== 'Main') {
          return continueTxExecution(null)
        }
        var amount = executionContext.web3().fromWei(typeConversion.toInt(tx.value), 'ether')
        var content = confirmDialog(tx, amount, gasEstimation, self,
          (gasPrice, cb) => {
            let txFeeText, priceStatus
            // TODO: this try catch feels like an anti pattern, can/should be
            // removed, but for now keeping the original logic
            try {
              var fee = executionContext.web3().toBigNumber(tx.gas).mul(executionContext.web3().toBigNumber(executionContext.web3().toWei(gasPrice.toString(10), 'gwei')))
              txFeeText = ' ' + executionContext.web3().fromWei(fee.toString(10), 'ether') + ' Ether'
              priceStatus = true
            } catch (e) {
              txFeeText = ' Please fix this issue before sending any transaction. ' + e.message
              priceStatus = false
            }
            cb(txFeeText, priceStatus)
          },
          (cb) => {
            executionContext.web3().eth.getGasPrice((error, gasPrice) => {
              var warnMessage = ' Please fix this issue before sending any transaction. '
              if (error) {
                return cb('Unable to retrieve the current network gas price.' + warnMessage + error)
              }
              try {
                var gasPriceValue = executionContext.web3().fromWei(gasPrice.toString(10), 'gwei')
                cb(null, gasPriceValue)
              } catch (e) {
                cb(warnMessage + e.message, null, false)
              }
            })
          }
        )
        modalDialog('Confirm transaction', content,
          { label: 'Confirm',
            fn: () => {
              self._deps.config.setUnpersistedProperty('doNotShowTransactionConfirmationAgain', content.querySelector('input#confirmsetting').checked)
              // TODO: check if this is check is still valid given the refactor
              if (!content.gasPriceStatus) {
                cancelCb('Given gas price is not correct')
              } else {
                var gasPrice = executionContext.web3().toWei(content.querySelector('#gasprice').value, 'gwei')
                continueTxExecution(gasPrice)
              }
            }}, {
              label: 'Cancel',
              fn: () => {
                return cancelCb('Transaction canceled by user.')
              }
            })
      },

      (decoded) => {
        outputOverride.innerHTML = ''
        outputOverride.appendChild(decoded)
      }
    )
  }

  var multiParamManager = new MultiParamManager(lookupOnly, args.funABI, (valArray, inputsValues, domEl) => {
    clickButton(valArray, inputsValues, domEl)
  }, self.udapp.getInputs(args.funABI))

  var contractActionsContainer = yo`<div class="${css.contractActionsContainer}" >${multiParamManager.render()}</div>`
  contractActionsContainer.appendChild(outputOverride)

  return contractActionsContainer
}

module.exports = UniversalDAppUI
