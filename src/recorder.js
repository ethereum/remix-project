var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager
var util = remixLib.util
var executionContext = require('./execution-context')
var async = require('async')

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
    self.data = { _listen: true, _replay: false, journal: [], _pendingTxs: {}, _createdContracts: {}, _createdContractsReverse: {}, _usedAccounts: {}, _abis: {} }
    opts.events.executioncontext.register('contextChanged', () => {
      self.clearAll()
    })

    opts.events.udapp.register('initiatingTransaction', (timestamp, tx) => {
      var { from, to, value, data, useCall } = tx
      var record = { value, data, useCall }

      this.data._pendingTxs[timestamp] = tx

      // convert to and from to tokens
      if (this.data._listen) {
        if (!to) {
          var selectedContract = self._api.getSelectedContract()
          if (selectedContract) {
            var abi = selectedContract.contract.object.abi
            var sha3 = util.sha3_256(JSON.stringify(abi))
            record.abi = sha3
            record.contractName = selectedContract.name
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
      var tx = this.data._pendingTxs[timestamp]

      var address = executionContext.isVM() ? txResult.result.createdAddress : tx.result.contractAddress
      if (!address) return // not a contract creation
      address = '0x' + address.toString('hex')
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
      options: {
        useAccountList: true
      },
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
    self.data._pendingTxs = {}
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
      self._api.udapp().rerunTx(record, function (err, txResult) {
        if (err) {
          console.error(err)
        } else {
          var address = executionContext.isVM() ? txResult.result.createdAddress : tx.result.contractAddress
          if (!address) return // not a contract creation
          address = '0x' + address.toString('hex')
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

module.exports = Recorder
