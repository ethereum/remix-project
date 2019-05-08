/* global */
'use strict'

var $ = require('jquery')
var yo = require('yo-yo')
var ethJSUtil = require('ethereumjs-util')
var BN = ethJSUtil.BN
var helper = require('./lib/helper')
var copyToClipboard = require('./app/ui/copy-to-clipboard')
var css = require('./universal-dapp-styles')
var MultiParamManager = require('./multiParamManager')
var remixLib = require('remix-lib')
var typeConversion = remixLib.execution.typeConversion
var txExecution = remixLib.execution.txExecution
var txFormat = remixLib.execution.txFormat

var executionContext = require('./execution-context')

var confirmDialog = require('./app/execution/confirmDialog')
var modalCustom = require('./app/ui/modal-dialog-custom')
var modalDialog = require('./app/ui/modaldialog')
var TreeView = require('./app/ui/TreeView')

function UniversalDAppUI (udapp, registry) {
  this.udapp = udapp
  this.registry = registry

  this.compilerData = {contractsDetails: {}}
  this._deps = {
    compilersartefacts: registry.get('compilersartefacts').api
  }
}

function decodeResponseToTreeView (response, fnabi) {
  var treeView = new TreeView({
    extractData: (item, parent, key) => {
      var ret = {}
      if (BN.isBN(item)) {
        ret.self = item.toString(10)
        ret.children = []
      } else {
        ret = treeView.extractDataDefault(item, parent, key)
      }
      return ret
    }
  })
  return treeView.render(txFormat.decodeResponse(response, fnabi))
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
    <div class="${css.title} alert alert-secondary">
      <button class="btn ${css.titleExpander}" onclick="${(e) => { toggleClass(e) }}"><i class="fas fa-angle-right" aria-hidden="true"></i></button>
      <div class="input-group ${css.nameNbuts}">
        <div class="${css.titleText} input-group-prepend"><span class="input-group-text ${css.spanTitleText}"> ${contractName} at ${shortAddress} (${context})</span></div>
        <div class="btn-group">
          <button class="btn p-2 btn-secondary">${copyToClipboard(() => address)}</button>
        </div>
      </div>
  </div>`

  var close = yo`<button class="${css.udappClose} p-2 btn btn-secondary" onclick=${remove}><i class="${css.closeIcon} fas fa-times" aria-hidden="true"></i></button>`
  title.querySelector('.btn-group').appendChild(close)

  var contractActionsWrapper = yo`
  <div class="${css.cActionsWrapper}">
  </div>`

  function remove () {
    instance.remove()
    // @TODO perhaps add a callack here to warn the caller that the instance has been removed
  }

  function toggleClass (e) {
    $(instance).toggleClass(`${css.hidesub}`)
    // e.currentTarget.querySelector('i')
    e.currentTarget.querySelector('i').classList.toggle(`fa-angle-right`)
    e.currentTarget.querySelector('i').classList.toggle(`fa-angle-down`)
  }

  instance.appendChild(title)
  instance.appendChild(contractActionsWrapper)

  // Add the fallback function
  var fallback = self.udapp.getFallbackInterface(contractABI)
  if (fallback) {
    contractActionsWrapper.appendChild(this.getCallButton({
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
    contractActionsWrapper.appendChild(this.getCallButton({
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
    var logMsg
    if (!args.funABI.constant) {
      logMsg = `transact to ${args.contractName}.${(args.funABI.name) ? args.funABI.name : '(fallback)'}`
    } else {
      logMsg = `call to ${args.contractName}.${(args.funABI.name) ? args.funABI.name : '(fallback)'}`
    }

    var value = inputsValues

    var confirmationCb = (network, tx, gasEstimation, continueTxExecution, cancelCb) => {
      if (network.name !== 'Main') {
        return continueTxExecution(null)
      }
      var amount = executionContext.web3().fromWei(typeConversion.toInt(tx.value), 'ether')
      var content = confirmDialog(tx, amount, gasEstimation, self.udapp,
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
            self.udapp._deps.config.setUnpersistedProperty('doNotShowTransactionConfirmationAgain', content.querySelector('input#confirmsetting').checked)
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
    }

    var continueCb = (error, continueTxExecution, cancelCb) => {
      if (error) {
        var msg = typeof error !== 'string' ? error.message : error
        modalDialog('Gas estimation failed', yo`<div>Gas estimation errored with the following message (see below).
        The transaction execution will likely fail. Do you want to force sending? <br>
        ${msg}
        </div>`,
          {
            label: 'Send Transaction',
            fn: () => {
              continueTxExecution()
            }}, {
              label: 'Cancel Transaction',
              fn: () => {
                cancelCb()
              }
            })
      } else {
        continueTxExecution()
      }
    }

    var outputCb = (decoded) => {
      outputOverride.innerHTML = ''
      outputOverride.appendChild(decoded)
    }

    var promptCb = (okCb, cancelCb) => {
      modalCustom.promptPassphrase('Passphrase requested', 'Personal mode is enabled. Please provide passphrase of account', '', okCb, cancelCb)
    }

    // contractsDetails is used to resolve libraries
    txFormat.buildData(args.contractName, args.contractAbi, {}, false, args.funABI, args.funABI.type !== 'fallback' ? value : '', (error, data) => {
      if (!error) {
        if (!args.funABI.constant) {
          self.registry.get('logCallback').api(`${logMsg} pending ... `)
        } else {
          self.registry.get('logCallback').api(`${logMsg}`)
        }
        if (args.funABI.type === 'fallback') data.dataHex = value
        self.udapp.callFunction(args.address, data, args.funABI, confirmationCb, continueCb, promptCb, (error, txResult) => {
          if (!error) {
            var isVM = executionContext.isVM()
            if (isVM) {
              var vmError = txExecution.checkVMError(txResult)
              if (vmError.error) {
                self.registry.get('logCallback').api(`${logMsg} errored: ${vmError.message} `)
                return
              }
            }
            if (lookupOnly) {
              var decoded = decodeResponseToTreeView(executionContext.isVM() ? txResult.result.vm.return : ethJSUtil.toBuffer(txResult.result), args.funABI)
              outputCb(decoded)
            }
          } else {
            self.registry.get('logCallback').api(`${logMsg} errored: ${error} `)
          }
        })
      } else {
        self.registry.get('logCallback').api(`${logMsg} errored: ${error} `)
      }
    }, (msg) => {
      self.registry.get('logCallback').api(msg)
    }, (data, runTxCallback) => {
      // called for libraries deployment
      self.udapp.runTx(data, confirmationCb, runTxCallback)
    })
  }

  var multiParamManager = new MultiParamManager(lookupOnly, args.funABI, (valArray, inputsValues, domEl) => {
    clickButton(valArray, inputsValues, domEl)
  }, self.udapp.getInputs(args.funABI))

  var contractActionsContainer = yo`<div class="${css.contractActionsContainer}" >${multiParamManager.render()}</div>`
  contractActionsContainer.appendChild(outputOverride)

  return contractActionsContainer
}

module.exports = UniversalDAppUI
