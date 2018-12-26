var yo = require('yo-yo')
var csjs = require('csjs-inject')
var css = require('../styles/run-tab-styles')
var helper = require('../../../lib/helper.js')
var executionContext = require('../../../execution-context')
var Recorder = require('../../../recorder')
var modalDialogCustom = require('../../ui/modal-dialog-custom')

class RecorderUI {

  constructor (runTabEvent, parentSelf) {
    this.parentSelf = parentSelf
    this.recorder = new Recorder(this.parentSelf._deps.udapp, this.parentSelf._deps.logCallback)

    this.recorder.event.register('newTxRecorded', (count) => {
      this.parentSelf.data.count = count
      this.parentSelf._view.recorderCount.innerText = count
    })
    this.recorder.event.register('cleared', () => {
      this.parentSelf.data.count = 0
      this.parentSelf._view.recorderCount.innerText = 0
    })

    executionContext.event.register('contextChanged', () => {
      this.recorder.clearAll()
    })

    runTabEvent.register('clearInstance', () => {
      this.recorder.clearAll()
    })
  }

  render () {
    var css2 = csjs`
      .container {}
      .runTxs {}
      .recorder {}
    `

    this.runButton = yo`<i class="fa fa-play runtransaction ${css2.runTxs} ${css.icon}"  title="Run Transactions" aria-hidden="true"></i>`
    this.recordButton = yo`
      <i class="fa fa-floppy-o savetransaction ${css2.recorder} ${css.icon}"
        onclick=${this.triggerRecordButton.bind(this)} title="Save Transactions" aria-hidden="true">
      </i>`

    this.runButton.onclick = this.runScenario.bind(this)
  }

  runScenario () {
    var currentFile = this.parentSelf._deps.config.get('currentFile')
    this.parentSelf._deps.fileManager.fileProviderOf(currentFile).get(currentFile, (error, json) => {
      if (error) {
        modalDialogCustom.alert('Invalid Scenario File ' + error)
      } else {
        if (currentFile.match('.json$')) {
          try {
            var obj = JSON.parse(json)
            var txArray = obj.transactions || []
            var accounts = obj.accounts || []
            var options = obj.options || {}
            var abis = obj.abis || {}
            var linkReferences = obj.linkReferences || {}
          } catch (e) {
            return modalDialogCustom.alert('Invalid Scenario File, please try again')
          }
          if (txArray.length) {
            var noInstancesText = this.parentSelf._view.noInstancesText
            if (noInstancesText.parentNode) { noInstancesText.parentNode.removeChild(noInstancesText) }
            this.recorder.run(txArray, accounts, options, abis, linkReferences, this.parentSelf._deps.udapp, (abi, address, contractName) => {
              this.parentSelf._view.instanceContainer.appendChild(this.parentSelf._deps.udappUI.renderInstanceFromABI(abi, address, contractName))
            })
          }
        } else {
          modalDialogCustom.alert('A scenario file is required. Please make sure a scenario file is currently displayed in the editor. The file must be of type JSON. Use the "Save Transactions" Button to generate a new Scenario File.')
        }
      }
    })
  }

  triggerRecordButton () {
    var txJSON = JSON.stringify(this.recorder.getAll(), null, 2)
    var fileManager = this.parentSelf._deps.fileManager
    var path = fileManager.currentPath()
    modalDialogCustom.prompt(null, 'Transactions will be saved in a file under ' + path, 'scenario.json', input => {
      var fileProvider = fileManager.fileProviderOf(path)
      if (fileProvider) {
        var newFile = path + '/' + input
        helper.createNonClashingName(newFile, fileProvider, (error, newFile) => {
          if (error) return modalDialogCustom.alert('Failed to create file. ' + newFile + ' ' + error)
          if (!fileProvider.set(newFile, txJSON)) {
            modalDialogCustom.alert('Failed to create file ' + newFile)
          } else {
            fileManager.switchFile(newFile)
          }
        })
      }
    })
  }

}

module.exports = RecorderUI
