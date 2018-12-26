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

function contractDropdown (events, self) {
  var instanceContainer = self._view.instanceContainer
  var instanceContainerTitle = self._view.instanceContainerTitle
  instanceContainer.appendChild(instanceContainerTitle)
  instanceContainer.appendChild(self._view.noInstancesText)
  var compFails = yo`<i title="Contract compilation failed. Please check the compile tab for more information." class="fa fa-times-circle ${css.errorIcon}" ></i>`
  var info = yo`<i class="fa fa-info ${css.infoDeployAction}" aria-hidden="true" title="*.sol files allows deploying and accessing contracts. *.abi files only allows accessing contracts."></i>`

  var newlyCompiled = (success, data, source, compiler, compilerFullName) => {
    getContractNames(success, data, compiler, compilerFullName)
    if (success) {
      compFails.style.display = 'none'
      document.querySelector(`.${css.contractNames}`).classList.remove(css.contractNamesError)
    } else {
      compFails.style.display = 'block'
      document.querySelector(`.${css.contractNames}`).classList.add(css.contractNamesError)
    }
  }

  self._deps.pluginManager.event.register('sendCompilationResult', (file, source, languageVersion, data) => {
    // TODO check whether the tab is configured
    let compiler = new CompilerAbstract(languageVersion, data)
    self._deps.compilersArtefacts[languageVersion] = compiler
    self._deps.compilersArtefacts['__last'] = compiler
    newlyCompiled(true, data, source, compiler, languageVersion)
  })

  self._deps.compiler.event.register('compilationFinished', (success, data, source) => {
    var name = 'solidity'
    let compiler = new CompilerAbstract(name, data)
    self._deps.compilersArtefacts[name] = compiler
    self._deps.compilersArtefacts['__last'] = compiler
    newlyCompiled(success, data, source, self._deps.compiler, name)
  })

  var deployAction = (value) => {
    self._view.createPanel.style.display = value
    self._view.orLabel.style.display = value
  }

  self._deps.fileManager.event.register('currentFileChanged', (currentFile) => {
    document.querySelector(`.${css.contractNames}`).classList.remove(css.contractNamesError)
    var contractNames = document.querySelector(`.${css.contractNames.classNames[0]}`)
    contractNames.innerHTML = ''
    if (/.(.abi)$/.exec(currentFile)) {
      deployAction('none')
      compFails.style.display = 'none'
      contractNames.appendChild(yo`<option>(abi)</option>`)
      selectContractNames.setAttribute('disabled', true)
    } else if (/.(.sol)$/.exec(currentFile)) {
      deployAction('block')
    }
  })

  var atAddressButtonInput = yo`<input class="${css.input} ataddressinput" placeholder="Load contract from Address" title="atAddress" />`
  var selectContractNames = yo`<select class="${css.contractNames}" disabled></select>`

  function getSelectedContract () {
    var contract = selectContractNames.children[selectContractNames.selectedIndex]
    var contractName = contract.innerHTML
    var compiler = self._deps.compilersArtefacts[contract.getAttribute('compiler')]
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

  self._view.createPanel = yo`<div class="${css.button}"></div>`
  self._view.orLabel = yo`<div class="${css.orLabel}">or</div>`
  var el = yo`
    <div class="${css.container}">
      <div class="${css.subcontainer}">
        ${selectContractNames} ${compFails} ${info}
      </div>
      <div>
        ${self._view.createPanel}
        ${self._view.orLabel}
        <div class="${css.button} ${css.atAddressSect}">
          <div class="${css.atAddress}" onclick=${function () { loadFromAddress() }}>At Address</div>
          ${atAddressButtonInput}
        </div>
      </div>
    </div>
  `

  function setInputParamsPlaceHolder () {
    self._view.createPanel.innerHTML = ''
    if (selectContractNames.selectedIndex >= 0 && selectContractNames.children.length > 0) {
      var selectedContract = getSelectedContract()
      var ctrabi = txHelper.getConstructorInterface(selectedContract.contract.object.abi)
      var ctrEVMbc = selectedContract.contract.object.evm.bytecode.object
      var createConstructorInstance = new MultiParamManager(0, ctrabi, (valArray, inputsValues) => {
        createInstance(inputsValues, selectedContract.compiler)
      }, txHelper.inputParametersDeclarationToString(ctrabi.inputs), 'Deploy', ctrEVMbc)
      self._view.createPanel.appendChild(createConstructorInstance.render())
      return
    } else {
      self._view.createPanel.innerHTML = 'No compiled contracts'
    }
  }

  selectContractNames.addEventListener('change', setInputParamsPlaceHolder)

  function createInstanceCallback (selectedContract, data) {
    self._deps.logCallback(`creation of ${selectedContract.name} pending...`)
    if (data) {
      data.contractName = selectedContract.name
      data.linkReferences = selectedContract.contract.object.evm.bytecode.linkReferences
      data.contractABI = selectedContract.contract.object.abi
    }
    self._deps.udapp.createContract(data,

      (network, tx, gasEstimation, continueTxExecution, cancelCb) => {
        if (network.name !== 'Main') {
          return continueTxExecution(null)
        }
        var amount = executionContext.web3().fromWei(typeConversion.toInt(tx.value), 'ether')
        var content = confirmDialog(tx, amount, gasEstimation, self,
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
              self._deps.config.setUnpersistedProperty('doNotShowTransactionConfirmationAgain', content.querySelector('input#confirmsetting').checked)
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
              self._deps.logCallback(vmError.message)
              return
            }
          }
          if (txResult.result.status && txResult.result.status === '0x0') {
            self._deps.logCallback(`creation of ${selectedContract.name} errored: transaction execution failed`)
            return
          }
          var noInstancesText = self._view.noInstancesText
          if (noInstancesText.parentNode) { noInstancesText.parentNode.removeChild(noInstancesText) }
          var address = isVM ? txResult.result.createdAddress : txResult.result.contractAddress
          instanceContainer.appendChild(self._deps.udappUI.renderInstance(selectedContract.contract.object, address, selectContractNames.value))
        } else {
          self._deps.logCallback(`creation of ${selectedContract.name} errored: ${error}`)
        }
      }
    )
  }

  // DEPLOY INSTANCE
  function createInstance (args, compiler) {
    var selectedContract = getSelectedContract()

    if (selectedContract.contract.object.evm.bytecode.object.length === 0) {
      modalDialogCustom.alert('This contract may be abstract, not implement an abstract parent\'s methods completely or not invoke an inherited contract\'s constructor correctly.')
      return
    }

    var forceSend = () => {
      var constructor = txHelper.getConstructorInterface(selectedContract.contract.object.abi)
      self._deps.filePanel.compilerMetadata().deployMetadataOf(selectedContract.name, (error, contractMetadata) => {
        if (error) return self._deps.logCallback(`creation of ${selectedContract.name} errored: ` + error)
        if (!contractMetadata || (contractMetadata && contractMetadata.autoDeployLib)) {
          txFormat.buildData(selectedContract.name, selectedContract.contract.object, compiler.getContracts(), true, constructor, args, (error, data) => {
            if (error) return self._deps.logCallback(`creation of ${selectedContract.name} errored: ` + error)
            createInstanceCallback(selectedContract, data)
          }, (msg) => {
            self._deps.logCallback(msg)
          }, (data, runTxCallback) => {
            // called for libraries deployment
            self._deps.udapp.runTx(data,
              (network, tx, gasEstimation, continueTxExecution, cancelCb) => {
                if (network.name !== 'Main') {
                  return continueTxExecution(null)
                }
                var amount = executionContext.web3().fromWei(typeConversion.toInt(tx.value), 'ether')
                var content = confirmDialog(tx, amount, gasEstimation, self,
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
                      self._deps.config.setUnpersistedProperty('doNotShowTransactionConfirmationAgain', content.querySelector('input#confirmsetting').checked)
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
          if (Object.keys(selectedContract.contract.object.evm.bytecode.linkReferences).length) self._deps.logCallback(`linking ${JSON.stringify(selectedContract.contract.object.evm.bytecode.linkReferences, null, '\t')} using ${JSON.stringify(contractMetadata.linkReferences, null, '\t')}`)
          txFormat.encodeConstructorCallAndLinkLibraries(selectedContract.contract.object, args, constructor, contractMetadata.linkReferences, selectedContract.contract.object.evm.bytecode.linkReferences, (error, data) => {
            if (error) return self._deps.logCallback(`creation of ${selectedContract.name} errored: ` + error)
            createInstanceCallback(selectedContract, data)
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
              self._deps.logCallback(`creation of ${selectedContract.name} canceled by user.`)
            }
          })
    } else {
      forceSend()
    }
  }

  // ACCESS DEPLOYED INSTANCE
  function loadFromAddress () {
    var noInstancesText = self._view.noInstancesText
    if (noInstancesText.parentNode) { noInstancesText.parentNode.removeChild(noInstancesText) }
    var address = atAddressButtonInput.value
    if (!ethJSUtil.isValidAddress(address)) {
      return modalDialogCustom.alert('Invalid address.')
    }
    if (/[a-f]/.test(address) && /[A-F]/.test(address) && !ethJSUtil.isValidChecksumAddress(address)) {
      return modalDialogCustom.alert('Invalid checksum address.')
    }
    if (/.(.abi)$/.exec(self._deps.config.get('currentFile'))) {
      modalDialogCustom.confirm(null, 'Do you really want to interact with ' + address + ' using the current ABI definition ?', () => {
        var abi
        try {
          abi = JSON.parse(self._deps.editor.currentContent())
        } catch (e) {
          return modalDialogCustom.alert('Failed to parse the current file as JSON ABI.')
        }
        instanceContainer.appendChild(self._deps.udappUI.renderInstanceFromABI(abi, address, address))
      })
    } else {
      var selectedContract = getSelectedContract()
      instanceContainer.appendChild(self._deps.udappUI.renderInstance(selectedContract.contract.object, address, selectContractNames.value))
    }
  }

  // GET NAMES OF ALL THE CONTRACTS
  function getContractNames (success, data, compiler, compilerFullName) {
    var contractNames = document.querySelector(`.${css.contractNames.classNames[0]}`)
    contractNames.innerHTML = ''
    if (success) {
      selectContractNames.removeAttribute('disabled')
      compiler.visitContracts((contract) => {
        contractNames.appendChild(yo`<option compiler="${compilerFullName}">${contract.name}</option>`)
      })
    } else {
      selectContractNames.setAttribute('disabled', true)
    }
    setInputParamsPlaceHolder()
  }

  return el
}

module.exports = contractDropdown
