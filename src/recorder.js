var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager
var ethutil = require('ethereumjs-util')
var executionContext = require('./execution-context')
var format = require('./app/execution/txFormat')
var async = require('async')
var modal = require('./app/ui/modal-dialog-custom')

/**
  * Record transaction as long as the user create them.
  *
  *
  */
class Recorder {
  constructor (opts = {}) {
    var self = this
    self._api = opts.api
    self.event = new EventManager()
    self.data = { _listen: true, _replay: false, journal: [], _createdContracts: {}, _createdContractsReverse: {}, _usedAccounts: {}, _abis: {} }
    opts.events.executioncontext.register('contextChanged', () => {
      self.clearAll()
    })

    opts.events.udapp.register('initiatingTransaction', (timestamp, tx, payLoad) => {
      if (tx.useCall) return
      var { from, to, value } = tx

      // convert to and from to tokens
      if (this.data._listen) {
        var record = { value, parameters: { definitions: payLoad.funAbi, values: payLoad.funArgs } }
        if (!to) {
          var selectedContract = self._api.getSelectedContract()
          if (selectedContract) {
            var abi = selectedContract.contract.object.abi
            var sha3 = ethutil.bufferToHex(ethutil.sha3(abi))
            record.abi = sha3
            record.contractName = selectedContract.name
            record.bytecode = payLoad.contractBytecode
            self.data._abis[sha3] = abi
          }
        } else {
          record.to = `created-contract{${this.data._createdContracts[to]}}`
        }

        self._api.getAccounts((error, accounts) => {
          if (error) return console.log(error)
          record.from = `account{${accounts.indexOf(from)}}`
          self.data._usedAccounts[record.from] = from
          self.append(timestamp, record)
        })
      }
    })

    opts.events.udapp.register('transactionExecuted', (error, from, to, data, call, txResult, timestamp) => {
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
      var timestamp = /created-contract{(.*)}/g.exec(record.to)
      record.to = this.data._createdContractsReverse[timestamp[1]]
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
    self.data.journal = []
    self.data._createdContracts = {}
    self.data._createdContractsReverse = {}
    self.data._usedAccounts = {}
    self.data._abis = {}
  }

  /**
    * run the list of records
    *
    * @param {Object} accounts
    * @param {Object} options
    * @param {Object} abis
    * @param {Function} newContractFn
    *
    */
  run (records, accounts, options, abis, newContractFn) {
    var self = this
    self.setListen(false)
    async.eachSeries(records, function (tx, cb) {
      var record = self.resolveAddress(tx.record, accounts, options)
      var data = format.encodeData(tx.record.parameters.definitions, tx.record.parameters.values, tx.record.bytecode)
      if (data.error) {
        modal.alert(data.error)
      } else {
        record.data = data.data
      }
      self._api.udapp().rerunTx(record, function (err, txResult) {
        if (err) {
          console.error(err)
        } else {
          var address = executionContext.isVM() ? txResult.result.createdAddress : txResult.result.contractAddress
          if (!address) return // not a contract creation
          address = addressToString(address)
          // save back created addresses for the convertion from tokens to real adresses
          self.data._createdContracts[address] = tx.timestamp
          self.data._createdContractsReverse[tx.timestamp] = address
          var abi = abis[tx.record.abi]
          if (abi) {
            newContractFn(abi, address, record.contractName)
          }
        }
        cb()
      })
    }, () => { self.setListen(true) })
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
