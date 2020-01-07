/* global */
'use strict'

const $ = require('jquery')
const yo = require('yo-yo')
const ethJSUtil = require('ethereumjs-util')
const BN = ethJSUtil.BN
const helper = require('../../lib/helper')
const copyToClipboard = require('./copy-to-clipboard')
const css = require('../../universal-dapp-styles')
const MultiParamManager = require('./multiParamManager')
const remixLib = require('remix-lib')
const txFormat = remixLib.execution.txFormat
const txHelper = remixLib.execution.txHelper

const confirmDialog = require('./confirmDialog')
const modalCustom = require('./modal-dialog-custom')
const modalDialog = require('./modaldialog')
const TreeView = require('./TreeView')

function decodeResponseToTreeView (response, fnabi) {
  const treeView = new TreeView({
    extractData: (item, parent, key) => {
      let ret = {}
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

class UniversalDAppUI {

  constructor (blockchain, logCallback) {
    this.blockchain = blockchain
    this.logCallback = logCallback
    this.compilerData = { contractsDetails: {} }
  }

  renderInstance (contract, address, contractName) {
    const noInstances = document.querySelector('[class^="noInstancesText"]')
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
  renderInstanceFromABI (contractABI, address, contractName) {
    address = (address.slice(0, 2) === '0x' ? '' : '0x') + address.toString('hex')
    address = ethJSUtil.toChecksumAddress(address)
    const instance = yo`<div class="instance ${css.instance} ${css.hidesub}" id="instance${address}"></div>`
    const context = (this.blockchain.getProvider() === 'vm' ? 'memory' : 'blockchain')

    function toggleClass (e) {
      $(instance).toggleClass(`${css.hidesub}`)
      // e.currentTarget.querySelector('i')
      e.currentTarget.querySelector('i').classList.toggle(`fa-angle-right`)
      e.currentTarget.querySelector('i').classList.toggle(`fa-angle-down`)
    }

    const shortAddress = helper.shortenAddress(address)
    const title = yo`
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

    const close = yo`
    <button
      class="${css.udappClose} p-1 btn btn-secondary"
      onclick=${() => { instance.remove() }}
      title="Remove from the list"
    >
      <i class="${css.closeIcon} fas fa-times" aria-hidden="true"></i>
    </button>`
    title.querySelector('.btn-group').appendChild(close)

    const contractActionsWrapper = yo`
    <div class="${css.cActionsWrapper}">
    </div>
  `

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

  getConfirmationCb (modalDialog, confirmDialog) {
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
              const gasPrice = this.blockchain.toWei(content.querySelector('#gasprice').value, 'gwei')
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
  getCallButton (args) {
    // args.funABI, args.address [fun only]
    // args.contractName [constr only]
    const lookupOnly = args.funABI.stateMutability === 'view' || args.funABI.stateMutability === 'pure' || args.funABI.constant

    const outputOverride = yo`<div class=${css.value}></div>` // show return value

    const clickButton = (valArr, inputsValues) => {
      let logMsg
      if (!lookupOnly) {
        logMsg = `call to ${args.contractName}.${(args.funABI.name) ? args.funABI.name : '(fallback)'}`
      } else {
        logMsg = `transact to ${args.contractName}.${(args.funABI.name) ? args.funABI.name : '(fallback)'}`
      }

      const confirmationCb = this.getConfirmationCb(modalDialog, confirmDialog)
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
      this.blockchain.runOrCallContractMethod(args.contractName, args.contractAbi, args.funABI, inputsValues, args.address, callType, lookupOnly, logMsg, this.logCallback, outputCb, confirmationCb, continueCb, promptCb)
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

}

module.exports = UniversalDAppUI
