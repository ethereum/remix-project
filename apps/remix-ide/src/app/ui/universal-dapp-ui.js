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
var remixLib = require('@remix-project/remix-lib')
var txFormat = remixLib.execution.txFormat
const txHelper = remixLib.execution.txHelper
var TreeView = require('./TreeView')
var txCallBacks = require('./sendTxCallbacks')
const _paq = window._paq = window._paq || []

function UniversalDAppUI (blockchain, logCallback) {
  this.blockchain = blockchain
  this.logCallback = logCallback
  this.compilerData = { contractsDetails: {} }
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
  var noInstances = document.querySelector('[data-id="deployAndRunNoInstanceText"]')
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
  const self = this
  address = (address.slice(0, 2) === '0x' ? '' : '0x') + address.toString('hex')
  address = ethJSUtil.toChecksumAddress(address)
  var instance = yo`<div class="instance run-instance border-dark ${css.instance} ${css.hidesub}" id="instance${address}" data-shared="universalDappUiInstance"></div>`
  const context = this.blockchain.context()

  var shortAddress = helper.shortenAddress(address)
  var title = yo`
    <div class="${css.title} alert alert-secondary">
      <button data-id="universalDappUiTitleExpander" class="btn ${css.titleExpander}" onclick="${(e) => { toggleClass(e) }}">
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
      class="${css.udappClose} mr-1 p-1 btn btn-secondary align-items-center"
      data-id="universalDappUiUdappClose"
      onclick=${remove}
      title="Remove from the list"
    >
      <i class="${css.closeIcon} fas fa-times" aria-hidden="true"></i>
    </button>`
  title.querySelector('.btn-group').appendChild(close)

  var contractActionsWrapper = yo`
    <div class="${css.cActionsWrapper}" data-id="universalDappUiContractActionWrapper">
    </div>
  `

  function remove () {
    instance.remove()
    // @TODO perhaps add a callack here to warn the caller that the instance has been removed
  }

  function toggleClass (e) {
    $(instance).toggleClass(`${css.hidesub} bg-light`)
    // e.currentTarget.querySelector('i')
    e.currentTarget.querySelector('i').classList.toggle('fa-angle-right')
    e.currentTarget.querySelector('i').classList.toggle('fa-angle-down')
  }

  instance.appendChild(title)
  instance.appendChild(contractActionsWrapper)

  $.each(contractABI, (i, funABI) => {
    if (funABI.type !== 'function') {
      return
    }
    // @todo getData cannot be used with overloaded functions
    contractActionsWrapper.appendChild(this.getCallButton({
      funABI: funABI,
      address: address,
      contractABI: contractABI,
      contractName: contractName
    }))
  })

  const calldataInput = yo`
    <input id="deployAndRunLLTxCalldata" class="${css.calldataInput} form-control" title="The Calldata to send to fallback function of the contract.">
  `
  const llIError = yo`
    <label id="deployAndRunLLTxError" class="text-danger my-2"></label>
  `
  // constract LLInteractions elements
  const lowLevelInteracions = yo`
    <div class="d-flex flex-column">
      <div class="d-flex flex-row justify-content-between mt-2">
        <div class="py-2 border-top d-flex justify-content-start flex-grow-1">
          Low level interactions
        </div>
        <a
          href="https://solidity.readthedocs.io/en/v0.6.2/contracts.html#receive-ether-function"
          title="check out docs for using 'receive'/'fallback'"
          target="_blank"
        >
          <i aria-hidden="true" class="fas fa-info my-2 mr-1"></i>
        </a>
      </div>
      <div class="d-flex flex-column align-items-start">
        <label class="">CALLDATA</label>
        <div class="d-flex justify-content-end w-100 align-items-center">
          ${calldataInput}
          <button id="deployAndRunLLTxSendTransaction" data-id="pluginManagerSettingsDeployAndRunLLTxSendTransaction" class="${css.instanceButton} p-0 w-50 btn border-warning text-warning" title="Send data to contract." onclick=${() => sendData()}>Transact</button>
        </div>
      </div>
      <div>
        ${llIError}
      </div>
    </div>
  `

  function sendData () {
    function setLLIError (text) {
      llIError.innerText = text
    }

    setLLIError('')
    const fallback = txHelper.getFallbackInterface(contractABI)
    const receive = txHelper.getReceiveInterface(contractABI)
    const args = {
      funABI: fallback || receive,
      address: address,
      contractName: contractName,
      contractABI: contractABI
    }
    const amount = document.querySelector('#value').value
    if (amount !== '0') {
      // check for numeric and receive/fallback
      if (!helper.isNumeric(amount)) {
        return setLLIError('Value to send should be a number')
      } else if (!receive && !(fallback && fallback.stateMutability === 'payable')) {
        return setLLIError("In order to receive Ether transfer the contract should have either 'receive' or payable 'fallback' function")
      }
    }
    let calldata = calldataInput.value
    if (calldata) {
      if (calldata.length < 4 && helper.is0XPrefixed(calldata)) {
        return setLLIError('The calldata should be a valid hexadecimal value with size of at least one byte.')
      } else {
        if (helper.is0XPrefixed(calldata)) {
          calldata = calldata.substr(2, calldata.length)
        }
        if (!helper.isHexadecimal(calldata)) {
          return setLLIError('The calldata should be a valid hexadecimal value.')
        }
      }
      if (!fallback) {
        return setLLIError("'Fallback' function is not defined")
      }
    }

    if (!receive && !fallback) return setLLIError('Both \'receive\' and \'fallback\' functions are not defined')

    // we have to put the right function ABI:
    // if receive is defined and that there is no calldata => receive function is called
    // if fallback is defined => fallback function is called
    if (receive && !calldata) args.funABI = receive
    else if (fallback) args.funABI = fallback

    if (!args.funABI) return setLLIError('Please define a \'Fallback\' function to send calldata and a either \'Receive\' or payable \'Fallback\' to send ethers')
    self.runTransaction(false, args, null, calldataInput.value, null)
  }

  contractActionsWrapper.appendChild(lowLevelInteracions)
  return instance
}

// TODO this is used by renderInstance when a new instance is displayed.
// this returns a DOM element.
UniversalDAppUI.prototype.getCallButton = function (args) {
  const self = this
  var outputOverride = yo`<div class=${css.value}></div>` // show return value
  const isConstant = args.funABI.constant !== undefined ? args.funABI.constant : false
  const lookupOnly = args.funABI.stateMutability === 'view' || args.funABI.stateMutability === 'pure' || isConstant
  const multiParamManager = new MultiParamManager(
    lookupOnly,
    args.funABI,
    (valArray, inputsValues) => self.runTransaction(lookupOnly, args, valArray, inputsValues, outputOverride),
    self.blockchain.getInputs(args.funABI)
  )

  const contractActionsContainer = yo`<div class="${css.contractActionsContainer}" >${multiParamManager.render()}</div>`
  contractActionsContainer.appendChild(outputOverride)

  return contractActionsContainer
}

UniversalDAppUI.prototype.runTransaction = function (lookupOnly, args, valArr, inputsValues, outputOverride) {
  const functionName = args.funABI.type === 'function' ? args.funABI.name : `(${args.funABI.type})`
  const logMsg = `${lookupOnly ? 'call' : 'transact'} to ${args.contractName}.${functionName}`

  const callbacksInContext = txCallBacks.getCallBacksWithContext(this, this.blockchain)

  const outputCb = (returnValue) => {
    if (outputOverride) {
      const decoded = decodeResponseToTreeView(returnValue, args.funABI)
      outputOverride.innerHTML = ''
      outputOverride.appendChild(decoded)
    }
  }
  _paq.push(['trackEvent', 'udapp', lookupOnly ? 'call' : args.funABI.type !== 'fallback' ? 'lowLevelInteracions' : 'transact'])
  const params = args.funABI.type !== 'fallback' ? inputsValues : ''
  this.blockchain.runOrCallContractMethod(
    args.contractName,
    args.contractAbi,
    args.funABI,
    inputsValues,
    args.address,
    params,
    lookupOnly,
    logMsg,
    this.logCallback,
    outputCb,
    callbacksInContext.confirmationCb.bind(callbacksInContext),
    callbacksInContext.continueCb.bind(callbacksInContext),
    callbacksInContext.promptCb.bind(callbacksInContext))
}

module.exports = UniversalDAppUI
