import { Plugin } from '@remixproject/engine'

import * as packageJson from '../../../../../../package.json'
var yo = require('yo-yo')
var remixLib = require('@remix-project/remix-lib')
var EventManager = remixLib.EventManager
var csjs = require('csjs-inject')
var css = require('../styles/run-tab-styles')

var modalDialogCustom = require('../../ui/modal-dialog-custom')
var modalDialog = require('../../ui/modaldialog')
var confirmDialog = require('../../ui/confirmDialog')

var helper = require('../../../lib/helper.js')

const profile = {
  name: 'recorder',
  methods: ['runScenario'],
  version: packageJson.version
}

class RecorderUI extends Plugin {
  constructor (blockchain, fileManager, recorder, logCallBack, config) {
    super(profile)
    this.fileManager = fileManager
    this.blockchain = blockchain
    this.recorder = recorder
    this.logCallBack = logCallBack
    this.config = config
    this.event = new EventManager()
  }

  render () {
    var css2 = csjs`
      .container {}
      .runTxs {}
      .recorder {}
    `

    this.runButton = yo`<i class="fas fa-play runtransaction ${css2.runTxs} ${css.icon}"  title="Run Transactions" aria-hidden="true"></i>`
    this.recordButton = yo`
      <i class="fas fa-save savetransaction ${css2.recorder} ${css.icon}"
        onclick=${this.triggerRecordButton.bind(this)} title="Save Transactions" aria-hidden="true">
      </i>`

    this.runButton.onclick = () => {
      const file = this.config.get('currentFile')
      if (!file) return modalDialogCustom.alert('A scenario file has to be selected')
      this.runScenario(file)
    }
  }

  runScenario (file) {
    if (!file) return modalDialogCustom.alert('Unable to run scenerio, no specified scenario file')
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
          }
        }, {
          label: 'Cancel Transaction',
          fn: () => {
            cancelCb()
          }
        })
      } else {
        continueTxExecution()
      }
    }

    var promptCb = (okCb, cancelCb) => {
      modalDialogCustom.promptPassphrase('Passphrase requested', 'Personal mode is enabled. Please provide passphrase of account', '', okCb, cancelCb)
    }

    var alertCb = (msg) => {
      modalDialogCustom.alert(msg)
    }

    const confirmationCb = this.getConfirmationCb(modalDialog, confirmDialog)

    this.fileManager.readFile(file).then((json) => {
      // TODO: there is still a UI dependency to remove here, it's still too coupled at this point to remove easily
      this.recorder.runScenario(json, continueCb, promptCb, alertCb, confirmationCb, this.logCallBack, (error, abi, address, contractName) => {
        if (error) {
          return modalDialogCustom.alert(error)
        }

        this.event.trigger('newScenario', [abi, address, contractName])
      })
    }).catch((error) => modalDialogCustom.alert(error))
  }

  getConfirmationCb (modalDialog, confirmDialog) {
    // this code is the same as in contractDropdown.js. TODO need to be refactored out
    const confirmationCb = (network, tx, gasEstimation, continueTxExecution, cancelCb) => {
      if (network.name !== 'Main') {
        return continueTxExecution(null)
      }
      const amount = this.blockchain.fromWei(tx.value, true, 'ether')
      const content = confirmDialog(tx, network, amount, gasEstimation, this.blockchain.determineGasFees(tx), this.blockchain.determineGasPrice.bind(this.blockchain))

      modalDialog('Confirm transaction', content,
        {
          label: 'Confirm',
          fn: () => {
            this.config.setUnpersistedProperty('doNotShowTransactionConfirmationAgain', content.querySelector('input#confirmsetting').checked)
            // TODO: check if this is check is still valid given the refactor
            if (!content.gasPriceStatus) {
              cancelCb('Given transaction fee is not correct')
            } else {
              continueTxExecution(content.txFee)
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

  triggerRecordButton () {
    this.saveScenario(
      (path, cb) => {
        modalDialogCustom.prompt('Save transactions as scenario', 'Transactions will be saved in a file under ' + path, 'scenario.json', cb)
      },
      (error) => {
        if (error) return modalDialogCustom.alert(error)
      }
    )
  }

  async saveScenario (promptCb, cb) {
    var txJSON = JSON.stringify(this.recorder.getAll(), null, 2)
    var path = this.fileManager.currentPath()
    promptCb(path, async input => {
      var fileProvider = this.fileManager.fileProviderOf(path)
      if (!fileProvider) return
      var newFile = path + '/' + input
      try {
        newFile = await helper.createNonClashingNameAsync(newFile, this.fileManager)
        await fileProvider.set(newFile, txJSON)
        await this.fileManager.open(newFile)
      } catch (error) {
        if (error) return cb('Failed to create file. ' + newFile + ' ' + error)
      }
    })
  }
}

module.exports = RecorderUI
