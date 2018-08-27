var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager
var ethutil = require('ethereumjs-util')
var executionContext = require('./execution-context')
var format = remixLib.execution.txFormat
var txHelper = remixLib.execution.txHelper
var async = require('async')
var modal = require('./app/ui/modal-dialog-custom')

/**
  * Record transaction as long as the user create them.
  *
  *
  */
class Recorder {
  constructor (compiler, udapp, logCallBack) {
    var self = this
    self.logCallBack = logCallBack
    self.event = new EventManager()
    self.data = { _listen: true, _replay: false, journal: [], _createdContracts: {}, _createdContractsReverse: {}, _usedAccounts: {}, _abis: {}, _contractABIReferences: {}, _linkReferences: {} }

    udapp.event.register('initiatingTransaction', (timestamp, tx, payLoad) => {
      if (tx.useCall) return
      var { from, to, value } = tx

      // convert to and from to tokens
      if (this.data._listen) {
        var record = { value, parameters: payLoad.funArgs }
        if (!to) {
          var selectedContract = compiler.getContract(payLoad.contractName)
          if (selectedContract) {
            var abi = selectedContract.object.abi
            var sha3 = ethutil.bufferToHex(ethutil.sha3(abi))
            record.abi = sha3
            record.contractName = payLoad.contractName
            record.bytecode = payLoad.contractBytecode
            record.linkReferences = selectedContract.object.evm.bytecode.linkReferences
            if (record.linkReferences && Object.keys(record.linkReferences).length) {
              for (var file in record.linkReferences) {
                for (var lib in record.linkReferences[file]) {
                  self.data._linkReferences[lib] = '<address>'
                }
              }
            }
            self.data._abis[sha3] = abi

            this.data._contractABIReferences[timestamp] = sha3
          }
        } else {
          var creationTimestamp = this.data._createdContracts[to]
          record.to = `created{${creationTimestamp}}`
          record.abi = this.data._contractABIReferences[creationTimestamp]
        }
        record.name = payLoad.funAbi.name
        record.inputs = txHelper.serializeInputs(payLoad.funAbi)
        record.type = payLoad.funAbi.type

        udapp.getAccounts((error, accounts) => {
          if (error) return console.log(error)
          record.from = `account{${accounts.indexOf(from)}}`
          self.data._usedAccounts[record.from] = from
          self.append(timestamp, record)
        })
      }
    })

    udapp.event.register('transactionExecuted', (error, from, to, data, call, txResult, timestamp) => {
      if (error) return console.log(error)
      if (call) return

      var address = executionContext.isVM() ? txResult.result.createdAddress : txResult.result.contractAddress
      if (!address) return // not a contract creation
      address = addressToString(address)
      // save back created addresses for the convertion from tokens to real adresses
      this.data._createdContracts[address] = timestamp
      this.data._createdContractsReverse[timestamp] = address
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
  run (records, accounts, options, abis, linkReferences, udapp, newContractFn) {
    var self = this
    self.setListen(false)
    self.logCallBack(`Running ${records.length} transaction(s) ...`)
    async.eachOfSeries(records, function (tx, index, cb) {
      var record = self.resolveAddress(tx.record, accounts, options)
      var abi = abis[tx.record.abi]
      if (!abi) {
        modal.alert('cannot find ABI for ' + tx.record.abi + '.  Execution stopped at ' + index)
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
        modal.alert('cannot resolve abi of ' + JSON.stringify(record, null, '\t') + '. Execution stopped at ' + index)
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
          modal.alert('cannot resolve input parameters ' + JSON.stringify(tx.record.parameters) + '. Execution stopped at ' + index)
          return
        }
      }
      var data = format.encodeData(fnABI, tx.record.parameters, tx.record.bytecode)
      if (data.error) {
        modal.alert(data.error + '. Record:' + JSON.stringify(record, null, '\t') + '. Execution stopped at ' + index)
        cb(data.error)
        return
      } else {
        self.logCallBack(`(${index}) ${JSON.stringify(record, null, '\t')}`)
        self.logCallBack(`(${index}) data: ${data.data}`)
        record.data = { dataHex: data.data, funArgs: tx.record.parameters, funAbi: fnABI, contractBytecode: tx.record.bytecode, contractName: tx.record.contractName }
      }
      udapp.runTx(record, function (err, txResult) {
        if (err) {
          console.error(err)
          self.logCallBack(err + '. Execution failed at ' + index)
        } else {
          var address = executionContext.isVM() ? txResult.result.createdAddress : txResult.result.contractAddress
          if (address) {
            address = addressToString(address)
            // save back created addresses for the convertion from tokens to real adresses
            self.data._createdContracts[address] = tx.timestamp
            self.data._createdContractsReverse[tx.timestamp] = address
            newContractFn(abi, address, record.contractName)
          }
        }
        cb(err)
      })
    }, () => { self.setListen(true); self.clearAll() })
  }
}

function addressToString (address) {
  if (!address) return null
  if (typeof address !== 'string') {
    address = address.toString('hex')
  }
  if (address.indexOf('0x') === -1) {
    address = '0x' + address
  }
  return address
}

module.exports = Recorder
