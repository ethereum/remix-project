var yo = require('yo-yo')
var ethJSUtil = require('ethereumjs-util')
var css = require('../styles/run-tab-styles')
var executionContext = require('../../../execution-context')
var modalDialogCustom = require('../../ui/modal-dialog-custom')
var modalCustom = require('../../ui/modal-dialog-custom')
var CompilerAbstract = require('../../compiler/compiler-abstract')
var remixLib = require('remix-lib')
var txExecution = remixLib.execution.txExecution
var txFormat = remixLib.execution.txFormat
var txHelper = remixLib.execution.txHelper
var typeConversion = remixLib.execution.typeConversion
var confirmDialog = require('../../execution/confirmDialog')
var modalDialog = require('../../ui/modaldialog')
var MultiParamManager = require('../../../multiParamManager')

class ContractDropdownUI {
  constructor (parentSelf) {
    this.parentSelf = parentSelf
  }

  render () {
    this.instanceContainer = this.parentSelf._view.instanceContainer
    var instanceContainerTitle = this.parentSelf._view.instanceContainerTitle
    this.instanceContainer.appendChild(instanceContainerTitle)
    this.instanceContainer.appendChild(this.parentSelf._view.noInstancesText)
    var compFails = yo`<i title="Contract compilation failed. Please check the compile tab for more information." class="fa fa-times-circle ${css.errorIcon}" ></i>`
    var info = yo`<i class="fa fa-info ${css.infoDeployAction}" aria-hidden="true" title="*.sol files allows deploying and accessing contracts. *.abi files only allows accessing contracts."></i>`

    var newlyCompiled = (success, data, source, compiler, compilerFullName) => {
      this.getContractNames(success, data, compiler, compilerFullName)
      if (success) {
        compFails.style.display = 'none'
        document.querySelector(`.${css.contractNames}`).classList.remove(css.contractNamesError)
      } else {
        compFails.style.display = 'block'
        document.querySelector(`.${css.contractNames}`).classList.add(css.contractNamesError)
      }
    }

    this.parentSelf._deps.pluginManager.event.register('sendCompilationResult', (file, source, languageVersion, data) => {
      // TODO check whether the tab is configured
      let compiler = new CompilerAbstract(languageVersion, data)
      this.parentSelf._deps.compilersArtefacts[languageVersion] = compiler
      this.parentSelf._deps.compilersArtefacts['__last'] = compiler
      newlyCompiled(true, data, source, compiler, languageVersion)
    })

    this.parentSelf._deps.compiler.event.register('compilationFinished', (success, data, source) => {
      var name = 'solidity'
      let compiler = new CompilerAbstract(name, data)
      this.parentSelf._deps.compilersArtefacts[name] = compiler
      this.parentSelf._deps.compilersArtefacts['__last'] = compiler
      newlyCompiled(success, data, source, this.parentSelf._deps.compiler, name)
    })

    var deployAction = (value) => {
      this.parentSelf._view.createPanel.style.display = value
      this.parentSelf._view.orLabel.style.display = value
    }

    this.parentSelf._deps.fileManager.event.register('currentFileChanged', (currentFile) => {
      document.querySelector(`.${css.contractNames}`).classList.remove(css.contractNamesError)
      var contractNames = document.querySelector(`.${css.contractNames.classNames[0]}`)
      contractNames.innerHTML = ''
      if (/.(.abi)$/.exec(currentFile)) {
        deployAction('none')
        compFails.style.display = 'none'
        contractNames.appendChild(yo`<option>(abi)</option>`)
        this.selectContractNames.setAttribute('disabled', true)
      } else if (/.(.sol)$/.exec(currentFile)) {
        deployAction('block')
      }
    })

    this.atAddressButtonInput = yo`<input class="${css.input} ataddressinput" placeholder="Load contract from Address" title="atAddress" />`
    this.selectContractNames = yo`<select class="${css.contractNames}" disabled></select>`

    this.parentSelf._view.createPanel = yo`<div class="${css.button}"></div>`
    this.parentSelf._view.orLabel = yo`<div class="${css.orLabel}">or</div>`
    var el = yo`
      <div class="${css.container}">
        <div class="${css.subcontainer}">
          ${this.selectContractNames} ${compFails} ${info}
        </div>
        <div>
          ${this.parentSelf._view.createPanel}
          ${this.parentSelf._view.orLabel}
          <div class="${css.button} ${css.atAddressSect}">
            <div class="${css.atAddress}" onclick=${function () { this.loadFromAddress() }}>At Address</div>
            ${this.atAddressButtonInput}
          </div>
        </div>
      </div>
    `
    this.selectContractNames.addEventListener('change', this.setInputParamsPlaceHolder.bind(this))

    return el
  }

  setInputParamsPlaceHolder () {
    this.parentSelf._view.createPanel.innerHTML = ''
    if (this.selectContractNames.selectedIndex >= 0 && this.selectContractNames.children.length > 0) {
      var selectedContract = this.getSelectedContract()
      var ctrabi = txHelper.getConstructorInterface(selectedContract.contract.object.abi)
      var ctrEVMbc = selectedContract.contract.object.evm.bytecode.object
      var createConstructorInstance = new MultiParamManager(0, ctrabi, (valArray, inputsValues) => {
        this.createInstance(inputsValues, selectedContract.compiler)
      }, txHelper.inputParametersDeclarationToString(ctrabi.inputs), 'Deploy', ctrEVMbc)
      this.parentSelf._view.createPanel.appendChild(createConstructorInstance.render())
      return
    } else {
      this.parentSelf._view.createPanel.innerHTML = 'No compiled contracts'
    }
  }

  getSelectedContract () {
    var contract = this.selectContractNames.children[this.selectContractNames.selectedIndex]
    var contractName = contract.innerHTML
    var compiler = this.parentSelf._deps.compilersArtefacts[contract.getAttribute('compiler')]
    if (!compiler) return null

    if (contractName) {
      return {
        name: contractName,
        contract: compiler.getContract(contractName),
        compiler
      }
    }
    return null
  }

  createInstanceCallback (selectedContract, data) {
    this.parentSelf._deps.logCallback(`creation of ${selectedContract.name} pending...`)
    if (data) {
      data.contractName = selectedContract.name
      data.linkReferences = selectedContract.contract.object.evm.bytecode.linkReferences
      data.contractABI = selectedContract.contract.object.abi
    }
    this.parentSelf._deps.udapp.createContract(data,

      (network, tx, gasEstimation, continueTxExecution, cancelCb) => {
        if (network.name !== 'Main') {
          return continueTxExecution(null)
        }
        var amount = executionContext.web3().fromWei(typeConversion.toInt(tx.value), 'ether')
        var content = confirmDialog(tx, amount, gasEstimation, this.parentSelf,
          (gasPrice, cb) => {
            let txFeeText, priceStatus
            // TODO: this try catch feels like an anti pattern, can/should be
            // removed, but for now keeping the original logic
            try {
              var fee = executionContext.web3().toBigNumber(tx.gas).mul(executionContext.web3().toBigNumber(executionContext.web3().toWei(gasPrice.toString(10), 'gwei')))
              txFeeText = ' ' + executionContext.web3().fromWei(fee.toString(10), 'ether') + ' Ether'
              priceStatus = true
            } catch (e) {
              txFeeText = ' Please fix this issue before sending any transaction. ' + e.message
              priceStatus = false
            }
            cb(txFeeText, priceStatus)
          },
          (cb) => {
            executionContext.web3().eth.getGasPrice((error, gasPrice) => {
              var warnMessage = ' Please fix this issue before sending any transaction. '
              if (error) {
                return cb('Unable to retrieve the current network gas price.' + warnMessage + error)
              }
              try {
                var gasPriceValue = executionContext.web3().fromWei(gasPrice.toString(10), 'gwei')
                cb(null, gasPriceValue)
              } catch (e) {
                cb(warnMessage + e.message, null, false)
              }
            })
          }
        )
        modalDialog('Confirm transaction', content,
          { label: 'Confirm',
            fn: () => {
              this.parentSelf._deps.config.setUnpersistedProperty('doNotShowTransactionConfirmationAgain', content.querySelector('input#confirmsetting').checked)
              // TODO: check if this is check is still valid given the refactor
              if (!content.gasPriceStatus) {
                cancelCb('Given gas price is not correct')
              } else {
                var gasPrice = executionContext.web3().toWei(content.querySelector('#gasprice').value, 'gwei')
                continueTxExecution(gasPrice)
              }
            }}, {
              label: 'Cancel',
              fn: () => {
                return cancelCb('Transaction canceled by user.')
              }
            })
      },
      (error, continueTxExecution, cancelCb) => {
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
      },
      function (okCb, cancelCb) {
        modalCustom.promptPassphrase(null, 'Personal mode is enabled. Please provide passphrase of account', '', okCb, cancelCb)
      },
      (error, txResult) => {
        if (!error) {
          var isVM = executionContext.isVM()
          if (isVM) {
            var vmError = txExecution.checkVMError(txResult)
            if (vmError.error) {
              this.parentSelf._deps.logCallback(vmError.message)
              return
            }
          }
          if (txResult.result.status && txResult.result.status === '0x0') {
            this.parentSelf._deps.logCallback(`creation of ${selectedContract.name} errored: transaction execution failed`)
            return
          }
          var noInstancesText = this.parentSelf._view.noInstancesText
          if (noInstancesText.parentNode) { noInstancesText.parentNode.removeChild(noInstancesText) }
          var address = isVM ? txResult.result.createdAddress : txResult.result.contractAddress
          this.instanceContainer.appendChild(this.parentSelf._deps.udappUI.renderInstance(selectedContract.contract.object, address, this.selectContractNames.value))
        } else {
          this.parentSelf._deps.logCallback(`creation of ${selectedContract.name} errored: ${error}`)
        }
      }
    )
  }

  // DEPLOY INSTANCE
  createInstance (args, compiler) {
    var selectedContract = this.getSelectedContract()

    if (selectedContract.contract.object.evm.bytecode.object.length === 0) {
      modalDialogCustom.alert('This contract may be abstract, not implement an abstract parent\'s methods completely or not invoke an inherited contract\'s constructor correctly.')
      return
    }

    var forceSend = () => {
      var constructor = txHelper.getConstructorInterface(selectedContract.contract.object.abi)
      this.parentSelf._deps.filePanel.compilerMetadata().deployMetadataOf(selectedContract.name, (error, contractMetadata) => {
        if (error) return this.parentSelf._deps.logCallback(`creation of ${selectedContract.name} errored: ` + error)
        if (!contractMetadata || (contractMetadata && contractMetadata.autoDeployLib)) {
          txFormat.buildData(selectedContract.name, selectedContract.contract.object, compiler.getContracts(), true, constructor, args, (error, data) => {
            if (error) return this.parentSelf._deps.logCallback(`creation of ${selectedContract.name} errored: ` + error)
            this.createInstanceCallback(selectedContract, data)
          }, (msg) => {
            this.parentSelf._deps.logCallback(msg)
          }, (data, runTxCallback) => {
            // called for libraries deployment
            this.parentSelf._deps.udapp.runTx(data,
              (network, tx, gasEstimation, continueTxExecution, cancelCb) => {
                if (network.name !== 'Main') {
                  return continueTxExecution(null)
                }
                var amount = executionContext.web3().fromWei(typeConversion.toInt(tx.value), 'ether')
                var content = confirmDialog(tx, amount, gasEstimation, this.parentSelf,
                  (gasPrice, cb) => {
                    let txFeeText, priceStatus
                    // TODO: this try catch feels like an anti pattern, can/should be
                    // removed, but for now keeping the original logic
                    try {
                      var fee = executionContext.web3().toBigNumber(tx.gas).mul(executionContext.web3().toBigNumber(executionContext.web3().toWei(gasPrice.toString(10), 'gwei')))
                      txFeeText = ' ' + executionContext.web3().fromWei(fee.toString(10), 'ether') + ' Ether'
                      priceStatus = true
                    } catch (e) {
                      txFeeText = ' Please fix this issue before sending any transaction. ' + e.message
                      priceStatus = false
                    }
                    cb(txFeeText, priceStatus)
                  },
                  (cb) => {
                    executionContext.web3().eth.getGasPrice((error, gasPrice) => {
                      var warnMessage = ' Please fix this issue before sending any transaction. '
                      if (error) {
                        return cb('Unable to retrieve the current network gas price.' + warnMessage + error)
                      }
                      try {
                        var gasPriceValue = executionContext.web3().fromWei(gasPrice.toString(10), 'gwei')
                        cb(null, gasPriceValue)
                      } catch (e) {
                        cb(warnMessage + e.message, null, false)
                      }
                    })
                  }
                )
                modalDialog('Confirm transaction', content,
                  { label: 'Confirm',
                    fn: () => {
                      this.parentSelf._deps.config.setUnpersistedProperty('doNotShowTransactionConfirmationAgain', content.querySelector('input#confirmsetting').checked)
                      // TODO: check if this is check is still valid given the refactor
                      if (!content.gasPriceStatus) {
                        cancelCb('Given gas price is not correct')
                      } else {
                        var gasPrice = executionContext.web3().toWei(content.querySelector('#gasprice').value, 'gwei')
                        continueTxExecution(gasPrice)
                      }
                    }}, {
                      label: 'Cancel',
                      fn: () => {
                        return cancelCb('Transaction canceled by user.')
                      }
                    })
              },
              function (okCb, cancelCb) {
                modalCustom.promptPassphrase(null, 'Personal mode is enabled. Please provide passphrase of account', '', okCb, cancelCb)
              },
              runTxCallback)
          })
        } else {
          if (Object.keys(selectedContract.contract.object.evm.bytecode.linkReferences).length) this.parentSelf._deps.logCallback(`linking ${JSON.stringify(selectedContract.contract.object.evm.bytecode.linkReferences, null, '\t')} using ${JSON.stringify(contractMetadata.linkReferences, null, '\t')}`)
          txFormat.encodeConstructorCallAndLinkLibraries(selectedContract.contract.object, args, constructor, contractMetadata.linkReferences, selectedContract.contract.object.evm.bytecode.linkReferences, (error, data) => {
            if (error) return this.parentSelf._deps.logCallback(`creation of ${selectedContract.name} errored: ` + error)
            this.createInstanceCallback(selectedContract, data)
          })
        }
      })
    }

    if (selectedContract.contract.object.evm.deployedBytecode && selectedContract.contract.object.evm.deployedBytecode.object.length / 2 > 24576) {
      modalDialog('Contract code size over limit', yo`<div>Contract creation initialization returns data with length of more than 24576 bytes. The deployment will likely fails. <br>
      More info: <a href="https://github.com/ethereum/EIPs/blob/master/EIPS/eip-170.md" target="_blank">eip-170</a>
      </div>`,
        {
          label: 'Force Send',
          fn: () => {
            forceSend()
          }}, {
            label: 'Cancel',
            fn: () => {
              this.parentSelf._deps.logCallback(`creation of ${selectedContract.name} canceled by user.`)
            }
          })
    } else {
      forceSend()
    }
  }

  // ACCESS DEPLOYED INSTANCE
  loadFromAddress () {
    var noInstancesText = this.parentSelf._view.noInstancesText
    if (noInstancesText.parentNode) { noInstancesText.parentNode.removeChild(noInstancesText) }
    var address = this.atAddressButtonInput.value
    if (!ethJSUtil.isValidAddress(address)) {
      return modalDialogCustom.alert('Invalid address.')
    }
    if (/[a-f]/.test(address) && /[A-F]/.test(address) && !ethJSUtil.isValidChecksumAddress(address)) {
      return modalDialogCustom.alert('Invalid checksum address.')
    }
    if (/.(.abi)$/.exec(this.parentSelf._deps.config.get('currentFile'))) {
      modalDialogCustom.confirm(null, 'Do you really want to interact with ' + address + ' using the current ABI definition ?', () => {
        var abi
        try {
          abi = JSON.parse(this.parentSelf._deps.editor.currentContent())
        } catch (e) {
          return modalDialogCustom.alert('Failed to parse the current file as JSON ABI.')
        }
        this.instanceContainer.appendChild(this.parentSelf._deps.udappUI.renderInstanceFromABI(abi, address, address))
      })
    } else {
      var selectedContract = this.getSelectedContract()
      this.instanceContainer.appendChild(this.parentSelf._deps.udappUI.renderInstance(selectedContract.contract.object, address, this.selectContractNames.value))
    }
  }

  // GET NAMES OF ALL THE CONTRACTS
  getContractNames (success, data, compiler, compilerFullName) {
    var contractNames = document.querySelector(`.${css.contractNames.classNames[0]}`)
    contractNames.innerHTML = ''
    if (success) {
      this.selectContractNames.removeAttribute('disabled')
      compiler.visitContracts((contract) => {
        contractNames.appendChild(yo`<option compiler="${compilerFullName}">${contract.name}</option>`)
      })
    } else {
      this.selectContractNames.setAttribute('disabled', true)
    }
    this.setInputParamsPlaceHolder()
  }

}

module.exports = ContractDropdownUI
