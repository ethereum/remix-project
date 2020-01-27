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
var txExecution = remixLib.execution.txExecution
var txFormat = remixLib.execution.txFormat
var TreeView = require('./TreeView')

function UniversalDAppUI (udapp, logCallback, executionContext) {
  this.udapp = udapp
  this.logCallback = logCallback
  this.compilerData = {contractsDetails: {}}
  this.executionContext = executionContext
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
  address = ethJSUtil.toChecksumAddress(address)
  var instance = yo`<div class="instance ${css.instance} ${css.hidesub}" id="instance${address}"></div>`
  var context = self.udapp.context()

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
    <input id="deployAndRunLLTxCalldata" class="w-100 m-0" title="The Calldata to send to fallback function of the contract.">
  `
  const llIError = yo`
    <label id="deployAndRunLLTxError" class="text-danger"></label>
  `
  // constract LLInteractions elements
  const lowLevelInteracions = yo`
    <div class="d-flex flex-column">
      <div class="d-flex flex-row justify-content-between mt-2">
        <label class="pt-2 border-top d-flex justify-content-start flex-grow-1">
          Low level interactions with contract
        </label>
        <i aria-hidden="true"
        title="A contract can have at most one receive function, declared using receive() external payable { ... } and one fallback function, declared using fallback () external [payable].
        These functions cannot have arguments, cannot return anything. Receive is executed on a call to the contract with empty calldata on plain Ether transfers (e.g. via .send() or .transfer()).
        If no such function exists, but a payable fallback function exists, the fallback function will be called on a plain Ether transfer. If neither a receive Ether nor a payable fallback function is present, the contract cannot receive Ether through regular transactions and throws an exception. 
        Fallback is executed on a call to the contract if none of the other functions match the given function signature."
        class="fas fa-info text-info my-3 mx-1"></i>
      </div>
      <div class="d-flex flex-column">
        <div class="d-flex justify-content-end m-2 align-items-center">
          <label class="mr-2 m-0">Calldata</label>
          ${calldataInput}
          <button id="deployAndRunLLTxSendTransaction" class="btn btn-sm btn-secondary" title="Send data to contract." onclick=${() => sendData()}>Transact</button>
        </div>
      </div>
      <div>
        ${llIError}
      </div>
    </div>
  `

  function sendData () {
    let error = false
    function setLLIError (text) {
      llIError.innerText = text
      if (text !== '') error = true
    }

    setLLIError('')
    const fallback = self.udapp.getFallbackInterface(contractABI)
    const receive = self.udapp.getReceiveInterface(contractABI)
    const args = {
      funABI: fallback,
      address: address,
      contractName: contractName,
      contractABI: contractABI
    }
    let calldata = calldataInput.value
    const amount = document.querySelector('#value').value
    if (amount !== '0') {
      // check for numeric and receive/fallback
      if (!helper.isNumeric(amount)) {
        setLLIError('Value to send should be a number')
      } else if (!receive && !(fallback && fallback.stateMutability === 'payable')) {
        setLLIError("In order to receive Ether transfer the contract should have either 'receive' or payable 'fallback' function")
      }
    }
    if (calldata) {
      if (calldata.length > 3 && calldata.substr(0, 2) === '0x') {
        if (!helper.isHexadecimal(calldata.substr(2, calldata.length))) {
          setLLIError('the calldata should be a valid hexadecimal value.')
        }
      }
      if (!fallback) {
        setLLIError("'fallback' function is not defined")
      }
    }
    if ((calldata || amount !== '0') && !error) self.runTransaction(false, args, null, calldata, null)
  }

  contractActionsWrapper.appendChild(lowLevelInteracions)
  return instance
}


// TODO this is used by renderInstance when a new instance is displayed.
// this returns a DOM element.
UniversalDAppUI.prototype.getCallButton = function (args) {
  let self = this
  var outputOverride = yo`<div class=${css.value}></div>` // show return value
  const lookupOnly = args.funABI.stateMutability === 'view' || args.funABI.stateMutability === 'pure' || args.funABI.constant
  const multiParamManager = new MultiParamManager(
    lookupOnly,
    args.funABI,
    (valArray, inputsValues) => self.runTransaction(lookupOnly, args, valArray, inputsValues, outputOverride),
    self.udapp.getInputs(args.funABI)
  )

  const contractActionsContainer = yo`<div class="${css.contractActionsContainer}" >${multiParamManager.render()}</div>`
  contractActionsContainer.appendChild(outputOverride)

  return contractActionsContainer
}

UniversalDAppUI.prototype.runTransaction = function (lookupOnly, args, valArr, inputsValues, outputOverride) {
  let self = this
  let logMsg
  if (!lookupOnly) {
    logMsg = `call to ${args.contractName}.${(args.funABI.name) ? args.funABI.name : '(fallback)'}`
  } else {
    logMsg = `transact to ${args.contractName}.${(args.funABI.name) ? args.funABI.name : '(fallback)'}`
  }

  var value = inputsValues

  const outputCb = (decoded) => {
    if (outputOverride) {
      outputOverride.innerHTML = ''
      outputOverride.appendChild(decoded)
    }
  }
  // contractsDetails is used to resolve libraries
  txFormat.buildData(args.contractName, args.contractABI, {}, false, args.funABI, args.funABI.type !== 'fallback' ? value : '', (error, data) => {
    if (!error) {
      if (!lookupOnly) {
        self.logCallback(`${logMsg} pending ... `)
      } else {
        self.logCallback(`${logMsg}`)
      }
      if (args.funABI.type === 'fallback') data.dataHex = value
      self.udapp.callFunction(args.address, data, args.funABI, this.confirmationCb, continueCb, promptCb, (error, txResult) => {
        if (!error) {
          var isVM = self.executionContext.isVM()
          if (isVM) {
            var vmError = txExecution.checkVMError(txResult)
            if (vmError.error) {
              self.logCallback(`${logMsg} errored: ${vmError.message} `)
              return
            }
          }
          if (lookupOnly) {
            const decoded = decodeResponseToTreeView(self.executionContext.isVM() ? txResult.result.execResult.returnValue : ethJSUtil.toBuffer(txResult.result), args.funABI)
            outputCb(decoded)
          }
        } else {
          self.logCallback(`${logMsg} errored: ${error} `)
        }
      })
    } else {
      self.logCallback(`${logMsg} errored: ${error} `)
    }
  }, (msg) => {
    self.logCallback(msg)
  }, (data, runTxCallback) => {
    // called for libraries deployment
    self.udapp.runTx(data, this.confirmationCb, runTxCallback)
  })
}

module.exports = UniversalDAppUI
