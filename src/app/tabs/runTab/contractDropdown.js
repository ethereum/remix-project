var yo = require('yo-yo')
var css = require('../styles/run-tab-styles')
var modalDialogCustom = require('../../ui/modal-dialog-custom')
var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager
var confirmDialog = require('../../execution/confirmDialog')
var modalDialog = require('../../ui/modaldialog')
var MultiParamManager = require('../../../multiParamManager')

class ContractDropdownUI {
  constructor (dropdownLogic, logCallback) {
    this.dropdownLogic = dropdownLogic
    this.logCallback = logCallback
    this.event = new EventManager()

    this.listenToEvents()
  }

  listenToEvents () {
    this.dropdownLogic.event.register('newlyCompiled', (success, data, source, compiler, compilerFullName) => {
      if (!document.querySelector(`.${css.contractNames.classNames[0]}`)) return
      var contractNames = document.querySelector(`.${css.contractNames.classNames[0]}`)
      contractNames.innerHTML = ''
      if (success) {
        this.selectContractNames.removeAttribute('disabled')
        this.dropdownLogic.getCompiledContracts(compiler, compilerFullName).forEach((contract) => {
          contractNames.appendChild(yo`<option compiler="${compilerFullName}">${contract.name}</option>`)
        })
      } else {
        this.selectContractNames.setAttribute('disabled', true)
      }
      this.setInputParamsPlaceHolder()

      if (success) {
        this.compFails.style.display = 'none'
        document.querySelector(`.${css.contractNames}`).classList.remove(css.contractNamesError)
      } else {
        this.compFails.style.display = 'block'
        document.querySelector(`.${css.contractNames}`).classList.add(css.contractNamesError)
      }
    })

    this.dropdownLogic.event.register('currentFileChanged', this.changeCurrentFile.bind(this))
  }

  render () {
    this.compFails = yo`<i title="No contract compiled yet or compilation failed. Please check the compile tab for more information." class="fas fa-times-circle ${css.errorIcon}" ></i>`
    var info = yo`<i class="fas fa-info ${css.infoDeployAction}" aria-hidden="true" title="*.sol files allows deploying and accessing contracts. *.abi files only allows accessing contracts."></i>`

    this.atAddressButtonInput = yo`<input class="${css.input} ${css.ataddressinput} ataddressinput form-control" placeholder="Load contract from Address" title="atAddress" />`
    this.selectContractNames = yo`<select class="${css.contractNames} custom-select" disabled></select>`

    this.createPanel = yo`<div class="${css.button}"></div>`
    this.orLabel = yo`<div class="${css.orLabel}">or</div>`
    var el = yo`
      <div class="${css.container}">
        <div class="${css.subcontainer}">
          ${this.selectContractNames} ${this.compFails} ${info}
        </div>
        <div>
          ${this.createPanel}
          ${this.orLabel}
          <div class="${css.button} ${css.atAddressSect}">
            <div class="${css.atAddress} btn btn-sm btn-info" onclick=${this.loadFromAddress.bind(this)}>At Address</div>
            ${this.atAddressButtonInput}
          </div>
        </div>
      </div>
    `
    this.selectContractNames.addEventListener('change', this.setInputParamsPlaceHolder.bind(this))
    this.setInputParamsPlaceHolder()
    return el
  }

  changeCurrentFile (currentFile) {
    if (!document.querySelector(`.${css.contractNames}`)) return
    document.querySelector(`.${css.contractNames}`).classList.remove(css.contractNamesError)
    var contractNames = document.querySelector(`.${css.contractNames.classNames[0]}`)
    contractNames.innerHTML = ''
    if (/.(.abi)$/.exec(currentFile)) {
      this.createPanel.style.display = 'none'
      this.orLabel.style.display = 'none'
      this.compFails.style.display = 'none'
      contractNames.appendChild(yo`<option>(abi)</option>`)
      this.selectContractNames.setAttribute('disabled', true)
    } else if (/.(.sol)$/.exec(currentFile)) {
      this.createPanel.style.display = 'block'
      this.orLabel.style.display = 'block'
    }
  }

  setInputParamsPlaceHolder () {
    this.createPanel.innerHTML = ''
    if (this.selectContractNames.selectedIndex < 0 || this.selectContractNames.children.length <= 0) {
      this.createPanel.innerHTML = 'No compiled contracts'
      return
    }

    var selectedContract = this.getSelectedContract()
    var createConstructorInstance = new MultiParamManager(0, selectedContract.getConstructorInterface(), (valArray, inputsValues) => {
      this.createInstance(inputsValues)
    }, selectedContract.getConstructorInputs(), 'Deploy', selectedContract.bytecodeObject)
    this.createPanel.appendChild(createConstructorInstance.render())
  }

  getSelectedContract () {
    var contract = this.selectContractNames.children[this.selectContractNames.selectedIndex]
    var contractName = contract.innerHTML
    var compilerAtributeName = contract.getAttribute('compiler')

    return this.dropdownLogic.getSelectedContract(contractName, compilerAtributeName)
  }

  createInstance (args) {
    var selectedContract = this.getSelectedContract()

    if (selectedContract.bytecodeObject.length === 0) {
      return modalDialogCustom.alert('This contract may be abstract, not implement an abstract parent\'s methods completely or not invoke an inherited contract\'s constructor correctly.')
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

    var promptCb = (okCb, cancelCb) => {
      modalDialogCustom.promptPassphrase('Passphrase requested', 'Personal mode is enabled. Please provide passphrase of account', '', okCb, cancelCb)
    }

    var statusCb = (msg) => {
      return this.logCallback(msg)
    }

    var finalCb = (error, contractObject, address) => {
      this.event.trigger('clearInstance')

      if (error) {
        return this.logCallback(error)
      }

      this.event.trigger('newContractInstanceAdded', [contractObject, address, contractObject.name])
    }

    if (selectedContract.isOverSizeLimit()) {
      return modalDialog('Contract code size over limit', yo`<div>Contract creation initialization returns data with length of more than 24576 bytes. The deployment will likely fails. <br>
      More info: <a href="https://github.com/ethereum/EIPs/blob/master/EIPS/eip-170.md" target="_blank">eip-170</a>
      </div>`,
        {
          label: 'Force Send',
          fn: () => {
            this.dropdownLogic.forceSend(selectedContract, args, continueCb, promptCb, modalDialog, confirmDialog, statusCb, finalCb)
          }}, {
            label: 'Cancel',
            fn: () => {
              this.logCallback(`creation of ${selectedContract.name} canceled by user.`)
            }
          })
    }
    this.dropdownLogic.forceSend(selectedContract, args, continueCb, promptCb, modalDialog, confirmDialog, statusCb, finalCb)
  }

  loadFromAddress () {
    this.event.trigger('clearInstance')

    var address = this.atAddressButtonInput.value
    this.dropdownLogic.loadContractFromAddress(address,
      (cb) => {
        modalDialogCustom.confirm(null, 'Do you really want to interact with ' + address + ' using the current ABI definition?', cb)
      },
      (error, loadType, abi) => {
        if (error) {
          return modalDialogCustom.alert(error)
        }
        if (loadType === 'abi') {
          return this.event.trigger('newContractABIAdded', [abi, address])
        }
        var selectedContract = this.getSelectedContract()
        this.event.trigger('newContractInstanceAdded', [selectedContract.object, address, this.selectContractNames.value])
      }
    )
  }

}

module.exports = ContractDropdownUI
