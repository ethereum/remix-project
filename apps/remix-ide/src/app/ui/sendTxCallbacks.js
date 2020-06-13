const yo = require('yo-yo')
const remixLib = require('remix-lib')
const confirmDialog = require('./confirmDialog')
const modalCustom = require('./modal-dialog-custom')
const modalDialog = require('./modaldialog')
const typeConversion = remixLib.execution.typeConversion
const Web3 = require('web3')

module.exports = {
  getCallBacksWithContext: (udappUI, blockchain) => {
    let callbacks = {}
    callbacks.confirmationCb = confirmationCb
    callbacks.continueCb = continueCb
    callbacks.promptCb = promptCb
    callbacks.udappUI = udappUI
    callbacks.blockchain = blockchain
    return callbacks
  }
}

const continueCb = function (error, continueTxExecution, cancelCb) {
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

const promptCb = function (okCb, cancelCb) {
  modalCustom.promptPassphrase('Passphrase requested', 'Personal mode is enabled. Please provide passphrase of account', '', okCb, cancelCb)
}

const confirmationCb = function (network, tx, gasEstimation, continueTxExecution, cancelCb) {
  let self = this
  if (network.name !== 'Main') {
    return continueTxExecution(null)
  }
  var amount = Web3.utils.fromWei(typeConversion.toInt(tx.value), 'ether')
  var content = confirmDialog(tx, amount, gasEstimation, self.udappUI,
    (gasPrice, cb) => {
      let txFeeText, priceStatus
      // TODO: this try catch feels like an anti pattern, can/should be
      // removed, but for now keeping the original logic
      try {
        var fee = Web3.utils.toBN(tx.gas).mul(Web3.utils.toBN(Web3.utils.toWei(gasPrice.toString(10), 'gwei')))
        txFeeText = ' ' + Web3.utils.fromWei(fee.toString(10), 'ether') + ' Ether'
        priceStatus = true
      } catch (e) {
        txFeeText = ' Please fix this issue before sending any transaction. ' + e.message
        priceStatus = false
      }
      cb(txFeeText, priceStatus)
    },
    (cb) => {
      self.blockchain.web3().eth.getGasPrice((error, gasPrice) => {
        const warnMessage = ' Please fix this issue before sending any transaction. '
        if (error) {
          return cb('Unable to retrieve the current network gas price.' + warnMessage + error)
        }
        try {
          var gasPriceValue = Web3.utils.fromWei(gasPrice.toString(10), 'gwei')
          cb(null, gasPriceValue)
        } catch (e) {
          cb(warnMessage + e.message, null, false)
        }
      })
    }
  )
  modalDialog(
    'Confirm transaction',
    content,
    { label: 'Confirm',
      fn: () => {
        self.blockchain.config.setUnpersistedProperty(
          'doNotShowTransactionConfirmationAgain',
          content.querySelector('input#confirmsetting').checked
        )
        // TODO: check if this is check is still valid given the refactor
        if (!content.gasPriceStatus) {
          cancelCb('Given gas price is not correct')
        } else {
          var gasPrice = Web3.utils.toWei(content.querySelector('#gasprice').value, 'gwei')
          continueTxExecution(gasPrice)
        }
      }
    },
    {
      label: 'Cancel',
      fn: () => {
        return cancelCb('Transaction canceled by user.')
      }
    }
  )
}
