/* global */
'use strict'

var $ = require('jquery')
var yo = require('yo-yo')
var ethJSUtil = require('ethereumjs-util')
var BN = ethJSUtil.BN
var helper = require('../../lib/helper')
var copyToClipboard = require('./copy-to-clipboard')
var css = require('../../universal-dapp-styles')
var MultiParamManager = require('./multiParamManager')
var remixLib = require('remix-lib')
var txFormat = remixLib.execution.txFormat
var txHelper = remixLib.execution.txHelper

var confirmDialog = require('./confirmDialog')
var modalCustom = require('./modal-dialog-custom')
var modalDialog = require('./modaldialog')
var TreeView = require('./TreeView')

function UniversalDAppUI (blockchain, logCallback) {
  this.blockchain = blockchain
  this.logCallback = logCallback
  this.compilerData = {contractsDetails: {}}
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
  const abi = txHelper.sortAbiFunction(contract.abi)
  return this.renderInstanceFromABI(abi, address, contractName)
}

// TODO this function was named before "appendChild".
// this will render an instance: contract name, contract address, and all the public functions
// basically this has to be called for the "atAddress" (line 393) and when a contract creation succeed
// this returns a DOM element
UniversalDAppUI.prototype.renderInstanceFromABI = function (contractABI, address, contractName) {
  address = (address.slice(0, 2) === '0x' ? '' : '0x') + address.toString('hex')
  address = ethJSUtil.toChecksumAddress(address)
  var instance = yo`<div class="instance ${css.instance} ${css.hidesub}" id="instance${address}"></div>`
  const context = this.blockchain.context()

  var shortAddress = helper.shortenAddress(address)
  var title = yo`
    <div class="${css.title} alert alert-secondary p-2">
      <button class="btn ${css.titleExpander}" onclick="${(e) => { toggleClass(e) }}">
        <i class="fas fa-angle-right" aria-hidden="true"></i>
      </button>
      <div class="input-group ${css.nameNbuts}">
        <div class="${css.titleText} input-group-prepend">
          <span class="input-group-text ${css.spanTitleText}">
            ${contractName} at ${shortAddress} (${context})
          </span>
        </div>
        <div class="btn-group">
          <button class="btn p-1 btn-secondary">${copyToClipboard(() => address)}</button>
        </div>
      </div>
    </div>
  `

  var close = yo`
    <button
      class="${css.udappClose} p-1 btn btn-secondary"
      onclick=${remove}
      title="Remove from the list"
    >
      <i class="${css.closeIcon} fas fa-times" aria-hidden="true"></i>
    </button>`
  title.querySelector('.btn-group').appendChild(close)

  var contractActionsWrapper = yo`
    <div class="${css.cActionsWrapper}">
    </div>
  `

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
  const fallback = txHelper.getFallbackInterface(contractABI)

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

UniversalDAppUI.prototype.getConfirmationCb = function (modalDialog, confirmDialog) {
  const confirmationCb = (network, tx, gasEstimation, continueTxExecution, cancelCb) => {
    if (network.name !== 'Main') {
      return continueTxExecution(null)
    }
    const amount = this.blockchain.fromWei(tx.value, true, 'ether')
    const content = confirmDialog(tx, amount, gasEstimation, null, this.blockchain.determineGasFees(tx), this.blockchain.determineGasPrice)

    modalDialog('Confirm transaction', content,
      {
        label: 'Confirm',
        fn: () => {
          this.config.setUnpersistedProperty('doNotShowTransactionConfirmationAgain', content.querySelector('input#confirmsetting').checked)
          // TODO: check if this is check is still valid given the refactor
          if (!content.gasPriceStatus) {
            cancelCb('Given gas price is not correct')
          } else {
            var gasPrice = this.blockchain.toWei(content.querySelector('#gasprice').value, 'gwei')
            continueTxExecution(gasPrice)
          }
        }
      }, {
        label: 'Cancel',
        fn: () => {
          return cancelCb('Transaction canceled by user.')
        }
      }
    )
  }

  return confirmationCb
}

// TODO this is used by renderInstance when a new instance is displayed.
// this returns a DOM element.
UniversalDAppUI.prototype.getCallButton = function (args) {
  let self = this
  // args.funABI, args.address [fun only]
  // args.contractName [constr only]
  const lookupOnly = args.funABI.stateMutability === 'view' || args.funABI.stateMutability === 'pure' || args.funABI.constant

  var outputOverride = yo`<div class=${css.value}></div>` // show return value

  function clickButton (valArr, inputsValues) {
    let logMsg
    if (!lookupOnly) {
      logMsg = `call to ${args.contractName}.${(args.funABI.name) ? args.funABI.name : '(fallback)'}`
    } else {
      logMsg = `transact to ${args.contractName}.${(args.funABI.name) ? args.funABI.name : '(fallback)'}`
    }

    const confirmationCb = self.getConfirmationCb(modalDialog, confirmDialog)
    const continueCb = (error, continueTxExecution, cancelCb) => {
      if (error) {
        const msg = typeof error !== 'string' ? error.message : error
        modalDialog(
          'Gas estimation failed',
          yo`
            <div>Gas estimation errored with the following message (see below).
            The transaction execution will likely fail. Do you want to force sending? <br>${msg}</div>
          `,
          {
            label: 'Send Transaction',
            fn: () => continueTxExecution()
          },
          {
            label: 'Cancel Transaction',
            fn: () => cancelCb()
          }
        )
      } else {
        continueTxExecution()
      }
    }

    const outputCb = (returnValue) => {
      const decoded = decodeResponseToTreeView(returnValue, args.funABI)
      outputOverride.innerHTML = ''
      outputOverride.appendChild(decoded)
    }

    const promptCb = (okCb, cancelCb) => {
      modalCustom.promptPassphrase('Passphrase requested', 'Personal mode is enabled. Please provide passphrase of account', '', okCb, cancelCb)
    }

    const callType = args.funABI.type !== 'fallback' ? inputsValues : ''
    self.blockchain.runOrCallContractMethod(args.contractName, args.contractAbi, args.funABI, inputsValues, args.address, callType, lookupOnly, logMsg, self.logCallback, outputCb, confirmationCb, continueCb, promptCb)
  }

  let inputs = ''
  if (args.funABI.inputs) {
    inputs = txHelper.inputParametersDeclarationToString(args.funABI.inputs)
  }

  const multiParamManager = new MultiParamManager(lookupOnly, args.funABI, (valArray, inputsValues, domEl) => {
    clickButton(valArray, inputsValues, domEl)
  }, inputs)

  const contractActionsContainer = yo`<div class="${css.contractActionsContainer}" >${multiParamManager.render()}</div>`
  contractActionsContainer.appendChild(outputOverride)

  return contractActionsContainer
}

module.exports = UniversalDAppUI
