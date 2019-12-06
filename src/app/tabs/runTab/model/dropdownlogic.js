var ethJSUtil = require('ethereumjs-util')
var remixLib = require('remix-lib')
var txHelper = remixLib.execution.txHelper
var txFormat = remixLib.execution.txFormat
var executionContext = remixLib.execution.executionContext
var typeConversion = remixLib.execution.typeConversion
var txExecution = remixLib.execution.txExecution
var CompilerAbstract = require('../../../compiler/compiler-abstract')
var EventManager = remixLib.EventManager
var Web3 = require('web3')

class DropdownLogic {
  constructor (fileManager, compilersArtefacts, config, editor, udapp, filePanel, runView) {
    this.compilersArtefacts = compilersArtefacts
    this.config = config
    this.editor = editor
    this.udapp = udapp
    this.runView = runView
    this.filePanel = filePanel

    this.event = new EventManager()

    this.listenToCompilationEvents()

    fileManager.events.on('currentFileChanged', (currentFile) => {
      this.event.trigger('currentFileChanged', [currentFile])
    })
  }

  // TODO: can be moved up; the event in contractDropdown will have to refactored a method instead
  listenToCompilationEvents () {
    let broadcastCompilationResult = (file, source, languageVersion, data) => {
      // TODO check whether the tab is configured
      let compiler = new CompilerAbstract(languageVersion, data, source)
      this.compilersArtefacts[languageVersion] = compiler
      this.compilersArtefacts['__last'] = compiler
      this.event.trigger('newlyCompiled', [true, data, source, compiler, languageVersion, file])
    }
    this.runView.on('solidity', 'compilationFinished', (file, source, languageVersion, data) =>
      broadcastCompilationResult(file, source, languageVersion, data)
    )
    this.runView.on('vyper', 'compilationFinished', (file, source, languageVersion, data) =>
      broadcastCompilationResult(file, source, languageVersion, data)
    )
  }

  loadContractFromAddress (address, confirmCb, cb) {
    if (!ethJSUtil.isValidAddress(address)) {
      return cb('Invalid address.')
    }
    if (/[a-f]/.test(address) && /[A-F]/.test(address) && !ethJSUtil.isValidChecksumAddress(address)) {
      return cb('Invalid checksum address.')
    }
    if (/.(.abi)$/.exec(this.config.get('currentFile'))) {
      confirmCb(() => {
        var abi
        try {
          abi = JSON.parse(this.editor.currentContent())
        } catch (e) {
          return cb('Failed to parse the current file as JSON ABI.')
        }
        cb(null, 'abi', abi)
      })
    } else {
      cb(null, 'instance')
    }
  }

  getCompiledContracts (compiler, compilerFullName) {
    var contracts = []
    compiler.visitContracts((contract) => {
      contracts.push(contract)
    })
    return contracts
  }

  getSelectedContract (contractName, compilerAtributeName) {
    if (!contractName) return null

    var compiler = this.compilersArtefacts[compilerAtributeName]
    if (!compiler) return null

    var contract = compiler.getContract(contractName)

    return {
      name: contractName,
      contract: contract,
      compiler: compiler,
      abi: contract.object.abi,
      bytecodeObject: contract.object.evm.bytecode.object,
      bytecodeLinkReferences: contract.object.evm.bytecode.linkReferences,
      object: contract.object,
      deployedBytecode: contract.object.evm.deployedBytecode,
      getConstructorInterface: () => {
        return txHelper.getConstructorInterface(contract.object.abi)
      },
      getConstructorInputs: () => {
        var constructorInteface = txHelper.getConstructorInterface(contract.object.abi)
        return txHelper.inputParametersDeclarationToString(constructorInteface.inputs)
      },
      isOverSizeLimit: () => {
        var deployedBytecode = contract.object.evm.deployedBytecode
        return (deployedBytecode && deployedBytecode.object.length / 2 > 24576)
      }
    }
  }

  fromWei (value, doTypeConversion, unit) {
    if (doTypeConversion) {
      return Web3.utils.fromWei(typeConversion.toInt(value), unit || 'ether')
    }
    return Web3.utils.fromWei(value.toString(10), unit || 'ether')
  }

  toWei (value, unit) {
    return Web3.utils.toWei(value, unit || 'gwei')
  }

  calculateFee (gas, gasPrice, unit) {
    return Web3.utils.toBN(gas).mul(Web3.utils.toBN(Web3.utils.toWei(gasPrice.toString(10), unit || 'gwei')))
  }

  getGasPrice (cb) {
    return executionContext.web3().eth.getGasPrice(cb)
  }

  isVM () {
    return executionContext.isVM()
  }

  // TODO: check if selectedContract and data can be joined
  createContract (selectedContract, data, continueCb, promptCb, modalDialog, confirmDialog, finalCb) {
    if (data) {
      data.contractName = selectedContract.name
      data.linkReferences = selectedContract.bytecodeLinkReferences
      data.contractABI = selectedContract.abi
    }

    var confirmationCb = (network, tx, gasEstimation, continueTxExecution, cancelCb) => {
      if (network.name !== 'Main') {
        return continueTxExecution(null)
      }
      var amount = Web3.utils.fromWei(typeConversion.toInt(tx.value), 'ether')

      // TODO: there is still a UI dependency to remove here, it's still too coupled at this point to remove easily
      var content = confirmDialog(tx, amount, gasEstimation, this.recorder,
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
          executionContext.web3().eth.getGasPrice((error, gasPrice) => {
            var warnMessage = ' Please fix this issue before sending any transaction. '
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
      modalDialog('Confirm transaction', content,
        { label: 'Confirm',
          fn: () => {
            this.config.setUnpersistedProperty('doNotShowTransactionConfirmationAgain', content.querySelector('input#confirmsetting').checked)
            // TODO: check if this is check is still valid given the refactor
            if (!content.gasPriceStatus) {
              cancelCb('Given gas price is not correct')
            } else {
              var gasPrice = Web3.utils.toWei(content.querySelector('#gasprice').value, 'gwei')
              continueTxExecution(gasPrice)
            }
          }}, {
            label: 'Cancel',
            fn: () => {
              return cancelCb('Transaction canceled by user.')
            }
          })
    }

    this.udapp.createContract(data, confirmationCb, continueCb, promptCb,
      (error, txResult) => {
        if (error) {
          return finalCb(`creation of ${selectedContract.name} errored: ${error}`)
        }
        var isVM = executionContext.isVM()
        if (isVM) {
          var vmError = txExecution.checkVMError(txResult)
          if (vmError.error) {
            return finalCb(vmError.message)
          }
        }
        if (txResult.result.status && txResult.result.status === '0x0') {
          return finalCb(`creation of ${selectedContract.name} errored: transaction execution failed`)
        }
        var address = isVM ? txResult.result.createdAddress : txResult.result.contractAddress
        finalCb(null, selectedContract, address)
      }
    )
  }

  runTransaction (data, continueCb, promptCb, modalDialog, confirmDialog, finalCb) {
    var confirmationCb = (network, tx, gasEstimation, continueTxExecution, cancelCb) => {
      if (network.name !== 'Main') {
        return continueTxExecution(null)
      }
      var amount = this.fromWei(tx.value, true, 'ether')
      var content = confirmDialog(tx, amount, gasEstimation, null,
        (gasPrice, cb) => {
          let txFeeText, priceStatus
          // TODO: this try catch feels like an anti pattern, can/should be
          // removed, but for now keeping the original logic
          try {
            var fee = this.calculateFee(tx.gas, gasPrice)
            txFeeText = ' ' + this.fromWei(fee, false, 'ether') + ' Ether'
            priceStatus = true
          } catch (e) {
            txFeeText = ' Please fix this issue before sending any transaction. ' + e.message
            priceStatus = false
          }
          cb(txFeeText, priceStatus)
        },
        (cb) => {
          this.getGasPrice((error, gasPrice) => {
            var warnMessage = ' Please fix this issue before sending any transaction. '
            if (error) {
              return cb('Unable to retrieve the current network gas price.' + warnMessage + error)
            }
            try {
              var gasPriceValue = this.fromWei(gasPrice, false, 'gwei')
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
            this.config.setUnpersistedProperty('doNotShowTransactionConfirmationAgain', content.querySelector('input#confirmsetting').checked)
            // TODO: check if this is check is still valid given the refactor
            if (!content.gasPriceStatus) {
              cancelCb('Given gas price is not correct')
            } else {
              var gasPrice = this.toWei(content.querySelector('#gasprice').value, 'gwei')
              continueTxExecution(gasPrice)
            }
          }}, {
            label: 'Cancel',
            fn: () => {
              return cancelCb('Transaction canceled by user.')
            }
          }
      )
    }

    this.udapp.runTx(data, confirmationCb, continueCb, promptCb, finalCb)
  }

  async forceSend (selectedContract, args, continueCb, promptCb, modalDialog, confirmDialog, statusCb, cb) {
    var constructor = selectedContract.getConstructorInterface()
    // TODO: deployMetadataOf can be moved here
    let contractMetadata
    try {
      contractMetadata = await this.runView.call('compilerMetadata', 'deployMetadataOf', selectedContract.name)
    } catch (error) {
      return statusCb(`creation of ${selectedContract.name} errored: ` + error)
    }
    if (!contractMetadata || (contractMetadata && contractMetadata.autoDeployLib)) {
      return txFormat.buildData(selectedContract.name, selectedContract.object, this.compilersArtefacts['__last'].getData().contracts, true, constructor, args, (error, data) => {
        if (error) return statusCb(`creation of ${selectedContract.name} errored: ` + error)

        statusCb(`creation of ${selectedContract.name} pending...`)
        this.createContract(selectedContract, data, continueCb, promptCb, modalDialog, confirmDialog, cb)
      }, statusCb, (data, runTxCallback) => {
        // called for libraries deployment
        this.runTransaction(data, continueCb, promptCb, modalDialog, confirmDialog, runTxCallback)
      })
    }
    if (Object.keys(selectedContract.bytecodeLinkReferences).length) statusCb(`linking ${JSON.stringify(selectedContract.bytecodeLinkReferences, null, '\t')} using ${JSON.stringify(contractMetadata.linkReferences, null, '\t')}`)
    txFormat.encodeConstructorCallAndLinkLibraries(selectedContract.object, args, constructor, contractMetadata.linkReferences, selectedContract.bytecodeLinkReferences, (error, data) => {
      if (error) return statusCb(`creation of ${selectedContract.name} errored: ` + error)

      statusCb(`creation of ${selectedContract.name} pending...`)
      this.createContract(selectedContract, data, continueCb, promptCb, modalDialog, confirmDialog, cb)
    })
  }

}

module.exports = DropdownLogic
