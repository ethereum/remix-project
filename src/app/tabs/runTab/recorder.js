var yo = require('yo-yo')
var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager
var csjs = require('csjs-inject')
var css = require('../styles/run-tab-styles')

var modalDialogCustom = require('../../ui/modal-dialog-custom')
var modalDialog = require('../../ui/modaldialog')
var confirmDialog = require('../../execution/confirmDialog')

class RecorderUI {

  constructor (recorder, logCallBack) {
    this.recorder = recorder
    this.logCallBack = logCallBack
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

    this.runButton.onclick = this.runScenario.bind(this)
  }

  runScenario () {
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

    var promptCb = (okCb, cancelCb) => {
      modalDialogCustom.promptPassphrase('Passphrase requested', 'Personal mode is enabled. Please provide passphrase of account', '', okCb, cancelCb)
    }

    var alertCb = (msg) => {
      modalDialogCustom.alert(msg)
    }

    // TODO: there is still a UI dependency to remove here, it's still too coupled at this point to remove easily
    this.recorder.runScenario(continueCb, promptCb, alertCb, confirmDialog, modalDialog, this.logCallBack, (error, abi, address, contractName) => {
      if (error) {
        return modalDialogCustom.alert(error)
      }

      this.event.trigger('newScenario', [abi, address, contractName])
    })
  }

  triggerRecordButton () {
    this.recorder.saveScenario(
      (path, cb) => {
        modalDialogCustom.prompt('Save transactions as scenario', 'Transactions will be saved in a file under ' + path, 'scenario.json', cb)
      },
      (error) => {
        if (error) return modalDialogCustom.alert(error)
      }
    )
  }

}

module.exports = RecorderUI
