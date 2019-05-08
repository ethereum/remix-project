var async = require('async')
var ethutil = require('ethereumjs-util')
var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager
var executionContext = remixLib.execution.executionContext
var format = remixLib.execution.txFormat
var txHelper = remixLib.execution.txHelper
var typeConversion = remixLib.execution.typeConversion
var helper = require('../../../../lib/helper.js')

/**
  * Record transaction as long as the user create them.
  *
  *
  */
class Recorder {
  constructor (udapp, fileManager, config) {
    var self = this
    self.event = new EventManager()
    self.data = { _listen: true, _replay: false, journal: [], _createdContracts: {}, _createdContractsReverse: {}, _usedAccounts: {}, _abis: {}, _contractABIReferences: {}, _linkReferences: {} }
    this.udapp = udapp
    this.fileManager = fileManager
    this.config = config

    this.udapp.event.register('initiatingTransaction', (timestamp, tx, payLoad) => {
      if (tx.useCall) return
      var { from, to, value } = tx

      // convert to and from to tokens
      if (this.data._listen) {
        var record = { value, parameters: payLoad.funArgs }
        if (!to) {
          var abi = payLoad.contractABI
          var keccak = ethutil.bufferToHex(ethutil.keccak(abi))
          record.abi = keccak
          record.contractName = payLoad.contractName
          record.bytecode = payLoad.contractBytecode
          record.linkReferences = payLoad.linkReferences
          if (record.linkReferences && Object.keys(record.linkReferences).length) {
            for (var file in record.linkReferences) {
              for (var lib in record.linkReferences[file]) {
                self.data._linkReferences[lib] = '<address>'
              }
            }
          }
          self.data._abis[keccak] = abi

          this.data._contractABIReferences[timestamp] = keccak
        } else {
          var creationTimestamp = this.data._createdContracts[to]
          record.to = `created{${creationTimestamp}}`
          record.abi = this.data._contractABIReferences[creationTimestamp]
        }
        record.name = payLoad.funAbi.name
        record.inputs = txHelper.serializeInputs(payLoad.funAbi)
        record.type = payLoad.funAbi.type
        for (var p in record.parameters) {
          var thisarg = record.parameters[p]
          var thistimestamp = this.data._createdContracts[thisarg]
          if (thistimestamp) record.parameters[p] = `created{${thistimestamp}}`
        }

        this.udapp.getAccounts((error, accounts) => {
          if (error) return console.log(error)
          record.from = `account{${accounts.indexOf(from)}}`
          self.data._usedAccounts[record.from] = from
          self.append(timestamp, record)
        })
      }
    })

    this.udapp.event.register('transactionExecuted', (error, from, to, data, call, txResult, timestamp) => {
      if (error) return console.log(error)
      if (call) return

      var address = executionContext.isVM() ? txResult.result.createdAddress : txResult.result.contractAddress
      if (!address) return // not a contract creation
      address = this.addressToString(address)
      // save back created addresses for the convertion from tokens to real adresses
      this.data._createdContracts[address] = timestamp
      this.data._createdContractsReverse[timestamp] = address
    })
    executionContext.event.register('contextChanged', this.clearAll.bind(this))
    this.event.register('newTxRecorded', (count) => {
      this.event.trigger('recorderCountChange', [count])
    })
    this.event.register('cleared', () => {
      this.event.trigger('recorderCountChange', [0])
    })
  }

  /**
    * stop/start saving txs. If not listenning, is basically in replay mode
    *
    * @param {Bool} listen
    */
  setListen (listen) {
    this.data._listen = listen
    this.data._replay = !listen
  }

  extractTimestamp (value) {
    var stamp = /created{(.*)}/g.exec(value)
    if (stamp) {
      return stamp[1]
    }
    return null
  }

  /**
    * convert back from/to from tokens to real addresses
    *
    * @param {Object} record
    * @param {Object} accounts
    * @param {Object} options
    *
    */
  resolveAddress (record, accounts, options) {
    if (record.to) {
      var stamp = this.extractTimestamp(record.to)
      if (stamp) {
        record.to = this.data._createdContractsReverse[stamp]
      }
    }
    record.from = accounts[record.from]
    // @TODO: writing browser test
    return record
  }

  /**
    * save the given @arg record
    *
    * @param {Number/String} timestamp
    * @param {Object} record
    *
    */
  append (timestamp, record) {
    var self = this
    self.data.journal.push({ timestamp, record })
    self.event.trigger('newTxRecorded', [self.data.journal.length])
  }

  /**
    * basically return the records + associate values (like abis / accounts)
    *
    */
  getAll () {
    var self = this
    var records = [].concat(self.data.journal)
    return {
      accounts: self.data._usedAccounts,
      linkReferences: self.data._linkReferences,
      transactions: records.sort((A, B) => {
        var stampA = A.timestamp
        var stampB = B.timestamp
        return stampA - stampB
      }),
      abis: self.data._abis
    }
  }

  /**
    * delete the seen transactions
    *
    */
  clearAll () {
    var self = this
    self.data._listen = true
    self.data._replay = false
    self.data.journal = []
    self.data._createdContracts = {}
    self.data._createdContractsReverse = {}
    self.data._usedAccounts = {}
    self.data._abis = {}
    self.data._contractABIReferences = {}
    self.data._linkReferences = {}
    self.event.trigger('cleared', [])
  }

  /**
    * run the list of records
    *
    * @param {Object} accounts
    * @param {Object} options
    * @param {Object} abis
    * @param {Object} udapp
    * @param {Function} newContractFn
    *
    */
  run (records, accounts, options, abis, linkReferences, confirmationCb, continueCb, promptCb, alertCb, logCallBack, newContractFn) {
    var self = this
    self.setListen(false)
    logCallBack(`Running ${records.length} transaction(s) ...`)
    async.eachOfSeries(records, function (tx, index, cb) {
      var record = self.resolveAddress(tx.record, accounts, options)
      var abi = abis[tx.record.abi]
      if (!abi) {
        alertCb('cannot find ABI for ' + tx.record.abi + '.  Execution stopped at ' + index)
        return
      }
      /* Resolve Library */
      if (record.linkReferences && Object.keys(record.linkReferences).length) {
        for (var k in linkReferences) {
          var link = linkReferences[k]
          var timestamp = self.extractTimestamp(link)
          if (timestamp && self.data._createdContractsReverse[timestamp]) {
            link = self.data._createdContractsReverse[timestamp]
          }
          tx.record.bytecode = format.linkLibraryStandardFromlinkReferences(k, link.replace('0x', ''), tx.record.bytecode, tx.record.linkReferences)
        }
      }
      /* Encode params */
      var fnABI
      if (tx.record.type === 'constructor') {
        fnABI = txHelper.getConstructorInterface(abi)
      } else if (tx.record.type === 'fallback') {
        fnABI = txHelper.getFallbackInterface(abi)
      } else {
        fnABI = txHelper.getFunction(abi, record.name + record.inputs)
      }
      if (!fnABI) {
        alertCb('cannot resolve abi of ' + JSON.stringify(record, null, '\t') + '. Execution stopped at ' + index)
        cb('cannot resolve abi')
        return
      }
      if (tx.record.parameters) {
        /* check if we have some params to resolve */
        try {
          tx.record.parameters.forEach((value, index) => {
            var isString = true
            if (typeof value !== 'string') {
              isString = false
              value = JSON.stringify(value)
            }
            for (var timestamp in self.data._createdContractsReverse) {
              value = value.replace(new RegExp('created\\{' + timestamp + '\\}', 'g'), self.data._createdContractsReverse[timestamp])
            }
            if (!isString) value = JSON.parse(value)
            tx.record.parameters[index] = value
          })
        } catch (e) {
          alertCb('cannot resolve input parameters ' + JSON.stringify(tx.record.parameters) + '. Execution stopped at ' + index)
          return
        }
      }
      var data = format.encodeData(fnABI, tx.record.parameters, tx.record.bytecode)
      if (data.error) {
        alertCb(data.error + '. Record:' + JSON.stringify(record, null, '\t') + '. Execution stopped at ' + index)
        cb(data.error)
        return
      } else {
        logCallBack(`(${index}) ${JSON.stringify(record, null, '\t')}`)
        logCallBack(`(${index}) data: ${data.data}`)
        record.data = { dataHex: data.data, funArgs: tx.record.parameters, funAbi: fnABI, contractBytecode: tx.record.bytecode, contractName: tx.record.contractName, timestamp: tx.timestamp }
      }
      self.udapp.runTx(record, confirmationCb, continueCb, promptCb,
        function (err, txResult) {
          if (err) {
            console.error(err)
            logCallBack(err + '. Execution failed at ' + index)
          } else {
            var address = executionContext.isVM() ? txResult.result.createdAddress : txResult.result.contractAddress
            if (address) {
              address = self.addressToString(address)
              // save back created addresses for the convertion from tokens to real adresses
              self.data._createdContracts[address] = tx.timestamp
              self.data._createdContractsReverse[tx.timestamp] = address
              newContractFn(abi, address, record.contractName)
            }
          }
          cb(err)
        }
      )
    }, () => { self.setListen(true); self.clearAll() })
  }

  addressToString (address) {
    if (!address) return null
    if (typeof address !== 'string') {
      address = address.toString('hex')
    }
    if (address.indexOf('0x') === -1) {
      address = '0x' + address
    }
    return address
  }

  runScenario (continueCb, promptCb, alertCb, confirmDialog, modalDialog, logCallBack, cb) {
    var currentFile = this.config.get('currentFile')
    this.fileManager.fileProviderOf(currentFile).get(currentFile, (error, json) => {
      if (error) {
        return cb('Invalid Scenario File ' + error)
      }
      if (!currentFile.match('.json$')) {
        return cb('A scenario file is required. Please make sure a scenario file is currently displayed in the editor. The file must be of type JSON. Use the "Save Transactions" Button to generate a new Scenario File.')
      }
      try {
        var obj = JSON.parse(json)
        var txArray = obj.transactions || []
        var accounts = obj.accounts || []
        var options = obj.options || {}
        var abis = obj.abis || {}
        var linkReferences = obj.linkReferences || {}
      } catch (e) {
        return cb('Invalid Scenario File, please try again')
      }

      if (!txArray.length) {
        return
      }

      var confirmationCb = (network, tx, gasEstimation, continueTxExecution, cancelCb) => {
        if (network.name !== 'Main') {
          return continueTxExecution(null)
        }
        var amount = executionContext.web3().fromWei(typeConversion.toInt(tx.value), 'ether')

        // TODO: there is still a UI dependency to remove here, it's still too coupled at this point to remove easily
        var content = confirmDialog(tx, amount, gasEstimation, this.recorder,
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
              this.config.setUnpersistedProperty('doNotShowTransactionConfirmationAgain', content.querySelector('input#confirmsetting').checked)
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
      }

      this.run(txArray, accounts, options, abis, linkReferences, confirmationCb, continueCb, promptCb, alertCb, logCallBack, (abi, address, contractName) => {
        cb(null, abi, address, contractName)
      })
    })
  }

  saveScenario (promptCb, cb) {
    var txJSON = JSON.stringify(this.getAll(), null, 2)
    var path = this.fileManager.currentPath()
    promptCb(path, input => {
      var fileProvider = this.fileManager.fileProviderOf(path)
      if (!fileProvider) return
      var newFile = path + '/' + input
      helper.createNonClashingName(newFile, fileProvider, (error, newFile) => {
        if (error) return cb('Failed to create file. ' + newFile + ' ' + error)
        if (!fileProvider.set(newFile, txJSON)) return cb('Failed to create file ' + newFile)
        this.fileManager.switchFile(newFile)
      })
    })
  }

}

module.exports = Recorder
