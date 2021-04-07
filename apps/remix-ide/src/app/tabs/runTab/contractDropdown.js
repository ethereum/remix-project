import publishToStorage from '../../../publishToStorage'
const yo = require('yo-yo')
const ethJSUtil = require('ethereumjs-util')
const css = require('../styles/run-tab-styles')
const modalDialogCustom = require('../../ui/modal-dialog-custom')
const remixLib = require('@remix-project/remix-lib')
const EventManager = remixLib.EventManager
const confirmDialog = require('../../ui/confirmDialog')
const modalDialog = require('../../ui/modaldialog')
const MultiParamManager = require('../../ui/multiParamManager')
const helper = require('../../../lib/helper')
const _paq = window._paq = window._paq || []

class ContractDropdownUI {
  constructor (blockchain, dropdownLogic, logCallback, runView) {
    this.blockchain = blockchain
    this.dropdownLogic = dropdownLogic
    this.logCallback = logCallback
    this.runView = runView
    this.event = new EventManager()

    this.listenToEvents()
    this.ipfsCheckedState = false
    this.exEnvironment = blockchain.getProvider()
    this.listenToContextChange()
    this.loadType = 'other'
  }

  listenToEvents () {
    this.dropdownLogic.event.register('newlyCompiled', (success, data, source, compiler, compilerFullName, file) => {
      if (!this.selectContractNames) return
      this.selectContractNames.innerHTML = ''
      if (success) {
        this.dropdownLogic.getCompiledContracts(compiler, compilerFullName).forEach((contract) => {
          this.selectContractNames.appendChild(yo`<option value="${contract.name}" compiler="${compilerFullName}">${contract.name} - ${contract.file}</option>`)
        })
      }
      this.enableAtAddress(success)
      this.enableContractNames(success)
      this.setInputParamsPlaceHolder()

      if (success) {
        this.compFails.style.display = 'none'
      } else {
        this.compFails.style.display = 'block'
      }
    })
  }

  listenToContextChange () {
    this.blockchain.event.register('contextChanged', () => {
      this.blockchain.updateNetwork((err, { name } = {}) => {
        if (err) {
          console.log('can\'t detect network')
          return
        }
        this.exEnvironment = this.blockchain.getProvider()
        this.networkName = name

        const savedConfig = window.localStorage.getItem(`ipfs/${this.exEnvironment}/${this.networkName}`)

        // check if an already selected option exist else use default workflow
        if (savedConfig !== null) {
          this.setCheckedState(savedConfig)
        } else {
          this.setCheckedState(this.networkName === 'Main')
        }
      })
    })
  }

  setCheckedState (value) {
    value = value === 'true' ? true : value === 'false' ? false : value
    this.ipfsCheckedState = value
    if (this.ipfsCheckbox) this.ipfsCheckbox.checked = value
  }

  toggleCheckedState () {
    if (this.exEnvironment === 'vm') this.networkName = 'VM'
    this.ipfsCheckedState = !this.ipfsCheckedState
    window.localStorage.setItem(`ipfs/${this.exEnvironment}/${this.networkName}`, this.ipfsCheckedState)
  }

  enableContractNames (enable) {
    if (enable) {
      if (this.selectContractNames.value === '') return
      this.selectContractNames.removeAttribute('disabled')
      this.selectContractNames.setAttribute('title', 'Select contract for Deploy or At Address.')
    } else {
      this.selectContractNames.setAttribute('disabled', true)
      if (this.loadType === 'sol') {
        this.selectContractNames.setAttribute('title', '⚠ Select and compile *.sol file to deploy or access a contract.')
      } else {
        this.selectContractNames.setAttribute('title', '⚠ Selected *.abi file allows accessing contracts, select and compile *.sol file to deploy and access one.')
      }
    }
  }

  enableAtAddress (enable) {
    if (enable) {
      const address = this.atAddressButtonInput.value
      if (!address || !ethJSUtil.isValidChecksumAddress(address)) return
      this.atAddress.removeAttribute('disabled')
      this.atAddress.setAttribute('title', 'Interact with the given contract.')
    } else {
      this.atAddress.setAttribute('disabled', true)
      if (this.atAddressButtonInput.value === '') {
        this.atAddress.setAttribute('title', '⚠ Compile *.sol file or select *.abi file & then enter the address of deployed contract.')
      } else {
        this.atAddress.setAttribute('title', '⚠ Compile *.sol file or select *.abi file.')
      }
    }
  }

  render () {
    this.compFails = yo`<i title="No contract compiled yet or compilation failed. Please check the compile tab for more information." class="m-2 ml-3 fas fa-times-circle ${css.errorIcon}" ></i>`
    this.atAddress = yo`<button class="${css.atAddress} btn btn-sm btn-info" id="runAndDeployAtAdressButton" onclick=${this.loadFromAddress.bind(this)}>At Address</button>`
    this.atAddressButtonInput = yo`<input class="${css.input} ${css.ataddressinput} ataddressinput form-control" placeholder="Load contract from Address" title="address of contract" oninput=${this.atAddressChanged.bind(this)} />`
    this.selectContractNames = yo`<select class="${css.contractNames} custom-select" disabled title="Please compile *.sol file to deploy or access a contract"></select>`
    this.abiLabel = yo`<span class="py-1">ABI file selected</span>`
    if (this.exEnvironment === 'vm') this.networkName = 'VM'
    this.enableAtAddress(false)
    this.abiLabel.style.display = 'none'

    const savedConfig = window.localStorage.getItem(`ipfs/${this.exEnvironment}/${this.networkName}`)
    this.ipfsCheckedState = savedConfig === 'true' ? true : false // eslint-disable-line

    this.ipfsCheckbox = yo`
      <input
        id="deployAndRunPublishToIPFS"
        data-id="contractDropdownIpfsCheckbox"
        class="form-check-input custom-control-input"
        type="checkbox"
        onchange=${() => this.toggleCheckedState()}
      >
    `
    if (this.ipfsCheckedState) this.ipfsCheckbox.checked = true

    this.deployCheckBox = yo`
      <div class="d-flex py-1 align-items-center custom-control custom-checkbox">
        ${this.ipfsCheckbox}
        <label
          for="deployAndRunPublishToIPFS"
          data-id="contractDropdownIpfsCheckboxLabel"
          class="m-0 form-check-label custom-control-label ${css.checkboxAlign}"
          title="Publishing the source code and metadata to IPFS facilitates source code verification using Sourcify and will greatly foster contract adoption (auditing, debugging, calling it, etc...)"
        >
          Publish to IPFS
        </label>
      </div>
      `
    this.createPanel = yo`<div class="${css.deployDropdown}"></div>`
    this.orLabel = yo`<div class="${css.orLabel} mt-2">or</div>`

    const contractNamesContainer = yo`
      <div class="${css.container}" data-id="contractDropdownContainer">
        <label class="${css.settingsLabel}">Contract</label>
        <div class="${css.subcontainer}">
          ${this.selectContractNames} ${this.compFails}
          ${this.abiLabel}
        </div>
        <div>
          ${this.createPanel}
          ${this.orLabel}
          <div class="${css.button} ${css.atAddressSect}">
            ${this.atAddress}
            ${this.atAddressButtonInput}
          </div>
        </div>
      </div>
    `
    this.selectContractNames.addEventListener('change', this.setInputParamsPlaceHolder.bind(this))
    this.setInputParamsPlaceHolder()
    if (!this.contractNamesContainer) {
      this.contractNamesContainer = contractNamesContainer
    }
    return contractNamesContainer
  }

  atAddressChanged (event) {
    if (!this.atAddressButtonInput.value) {
      this.enableAtAddress(false)
    } else {
      if ((this.selectContractNames && !this.selectContractNames.getAttribute('disabled') && this.loadType === 'sol') ||
        this.loadType === 'abi') {
        this.enableAtAddress(true)
      } else {
        this.enableAtAddress(false)
      }
    }
  }

  changeCurrentFile (currentFile) {
    if (!this.selectContractNames) return
    if (/.(.abi)$/.exec(currentFile)) {
      this.createPanel.style.display = 'none'
      this.orLabel.style.display = 'none'
      this.compFails.style.display = 'none'
      this.loadType = 'abi'
      this.contractNamesContainer.style.display = 'block'
      this.abiLabel.style.display = 'block'
      this.abiLabel.innerHTML = currentFile
      this.selectContractNames.style.display = 'none'
      this.enableContractNames(true)
      this.enableAtAddress(true)
    } else if (/.(.sol)$/.exec(currentFile) ||
        /.(.vy)$/.exec(currentFile) || // vyper
        /.(.lex)$/.exec(currentFile) || // lexon
        /.(.contract)$/.exec(currentFile)) {
      this.createPanel.style.display = 'block'
      this.orLabel.style.display = 'block'
      this.contractNamesContainer.style.display = 'block'
      this.loadType = 'sol'
      this.selectContractNames.style.display = 'block'
      this.abiLabel.style.display = 'none'
      if (this.selectContractNames.value === '') this.enableAtAddress(false)
    } else {
      this.loadType = 'other'
      this.createPanel.style.display = 'none'
      this.orLabel.style.display = 'none'
      this.compFails.style.display = 'none'
      this.contractNamesContainer.style.display = 'none'
      this.abiLabel.style.display = 'none'
    }
  }

  setInputParamsPlaceHolder () {
    this.createPanel.innerHTML = ''
    if (this.selectContractNames.selectedIndex < 0 || this.selectContractNames.children.length <= 0) {
      this.createPanel.innerHTML = 'No compiled contracts'
      return
    }

    const selectedContract = this.getSelectedContract()
    const clickCallback = async (valArray, inputsValues) => {
      var selectedContract = this.getSelectedContract()
      this.createInstance(selectedContract, inputsValues)
    }
    const createConstructorInstance = new MultiParamManager(
      0,
      selectedContract.getConstructorInterface(),
      clickCallback,
      selectedContract.getConstructorInputs(),
      'Deploy',
      selectedContract.bytecodeObject,
      true
    )
    this.createPanel.appendChild(createConstructorInstance.render())
    this.createPanel.appendChild(this.deployCheckBox)
  }

  getSelectedContract () {
    var contract = this.selectContractNames.children[this.selectContractNames.selectedIndex]
    var contractName = contract.getAttribute('value')
    var compilerAtributeName = contract.getAttribute('compiler')

    return this.dropdownLogic.getSelectedContract(contractName, compilerAtributeName)
  }

  async createInstance (selectedContract, args) {
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

    const self = this

    var promptCb = (okCb, cancelCb) => {
      modalDialogCustom.promptPassphrase('Passphrase requested', 'Personal mode is enabled. Please provide passphrase of account', '', okCb, cancelCb)
    }

    var statusCb = (msg) => {
      return this.logCallback(msg)
    }

    var finalCb = (error, contractObject, address) => {
      self.event.trigger('clearInstance')

      if (error) {
        return this.logCallback(error)
      }
      self.event.trigger('newContractInstanceAdded', [contractObject, address, contractObject.name])

      const data = self.runView.compilersArtefacts.getCompilerAbstract(contractObject.contract.file)
      self.runView.compilersArtefacts.addResolvedContract(helper.addressToString(address), data)
      if (self.ipfsCheckedState) {
        _paq.push(['trackEvent', 'udapp', `DeployAndPublish_${this.networkName}`])
        publishToStorage('ipfs', self.runView.fileProvider, self.runView.fileManager, selectedContract)
      } else {
        _paq.push(['trackEvent', 'udapp', `DeployOnly_${this.networkName}`])
      }
    }

    let contractMetadata
    try {
      contractMetadata = await this.runView.call('compilerMetadata', 'deployMetadataOf', selectedContract.name, selectedContract.contract.file)
    } catch (error) {
      return statusCb(`creation of ${selectedContract.name} errored: ` + (error.message ? error.message : error))
    }

    const compilerContracts = this.dropdownLogic.getCompilerContracts()
    const confirmationCb = this.getConfirmationCb(modalDialog, confirmDialog)

    if (selectedContract.isOverSizeLimit()) {
      return modalDialog('Contract code size over limit', yo`<div>Contract creation initialization returns data with length of more than 24576 bytes. The deployment will likely fails. <br>
      More info: <a href="https://github.com/ethereum/EIPs/blob/master/EIPS/eip-170.md" target="_blank">eip-170</a>
      </div>`,
      {
        label: 'Force Send',
        fn: () => {
          this.deployContract(selectedContract, args, contractMetadata, compilerContracts, { continueCb, promptCb, statusCb, finalCb }, confirmationCb)
        }
      }, {
        label: 'Cancel',
        fn: () => {
          this.logCallback(`creation of ${selectedContract.name} canceled by user.`)
        }
      })
    }
    this.deployContract(selectedContract, args, contractMetadata, compilerContracts, { continueCb, promptCb, statusCb, finalCb }, confirmationCb)
  }

  deployContract (selectedContract, args, contractMetadata, compilerContracts, callbacks, confirmationCb) {
    _paq.push(['trackEvent', 'udapp', 'DeployContractTo', this.networkName])
    const { statusCb } = callbacks
    if (!contractMetadata || (contractMetadata && contractMetadata.autoDeployLib)) {
      return this.blockchain.deployContractAndLibraries(selectedContract, args, contractMetadata, compilerContracts, callbacks, confirmationCb)
    }
    if (Object.keys(selectedContract.bytecodeLinkReferences).length) statusCb(`linking ${JSON.stringify(selectedContract.bytecodeLinkReferences, null, '\t')} using ${JSON.stringify(contractMetadata.linkReferences, null, '\t')}`)
    this.blockchain.deployContractWithLibrary(selectedContract, args, contractMetadata, compilerContracts, callbacks, confirmationCb)
  }

  getConfirmationCb (modalDialog, confirmDialog) {
    // this code is the same as in recorder.js. TODO need to be refactored out
    const confirmationCb = (network, tx, gasEstimation, continueTxExecution, cancelCb) => {
      if (network.name !== 'Main') {
        return continueTxExecution(null)
      }
      const amount = this.blockchain.fromWei(tx.value, true, 'ether')
      const content = confirmDialog(tx, amount, gasEstimation, null, this.blockchain.determineGasFees(tx), this.blockchain.determineGasPrice.bind(this.blockchain))

      modalDialog('Confirm transaction', content,
        {
          label: 'Confirm',
          fn: () => {
            this.blockchain.config.setUnpersistedProperty('doNotShowTransactionConfirmationAgain', content.querySelector('input#confirmsetting').checked)
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
