var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager

class Recorder {
  constructor (opts = {}) {
    var self = this
    self._api = opts.api
    self.event = new EventManager()
    self.data = { journal: [], _pendingCreation: {} }
    opts.events.executioncontext.register('contextChanged', () => self.clearAll())
    var counter = 0
    self._addressCache = {}

    function getAddresses (cb) {
      self._api.getAccounts(function (err, accounts = []) {
        if (err) console.error(err)
        var addresses = accounts.reduce((addr, account) => {
          if (!addr[account]) addr[account] = `account{${++counter}}`
          return addr
        }, self._addressCache)
        cb(addresses)
      })
    }
    function getCurrentContractName () {
      var contractNames = document.querySelector(`[class^="contractNames"]`)
      var contractName = contractNames.children[contractNames.selectedIndex].innerHTML
      return contractName
    }
    opts.events.udapp.register('initiatingTransaction', (timestamp, tx) => {
      var { from, to, value, gas, data } = tx
      var record = { value, gas, data }
      getAddresses(addresses => {
        if (to) record.to = addresses[to] || (addresses[to] = self._addressCache[to] = `contract{${++counter}}`)
        else {
          record.src = getCurrentContractName()
          self.data._pendingCreation[timestamp] = record
        }
        record.from = addresses[from] || (addresses[from] = self._addressCache[from] = `account{${++counter}}`)
        self.append(timestamp, record)
      })
    })
    opts.events.udapp.register('transactionExecuted', (...args) => {
      var err = args[0]
      if (err) console.error(err)
      var timestamp = args[6]
      // update transaction which was pending with correct `to` address
      var record = self.data._pendingCreation[timestamp]
      delete self.data._pendingCreation[timestamp]
      if (!record) return
      var to = args[2]
      getAddresses(addresses => {
        if (to) {
          delete record.src
          record.to = addresses[to] || (addresses[to] = self._addressCache[to] = `account{${++counter}}`)
        } else record.src = getCurrentContractName()
      })
    })
  }
  resolveAddress (record, addresses) {
    // var getPseudoAddress = placeholder => placeholder.split(' ')[0]//.split('-')[1].slice(1)
    var pseudos = Object.keys(addresses).reduce((pseudos, address) => {
      // var p = addresses[address]//getPseudoAddress()//.split('>')[0].split('-')[1].slice(1)
      pseudos[addresses[address]] = address
      return pseudos
    }, {})
    if (record.to && record.to[0] !== '0') record.to = pseudos[record.to]
    if (record.from && record.from[0] !== '0') record.from = pseudos[record.from]

    // @TODO: fix load transactions and execute !
    // @TODO: add 'clean' button to clear all recorded transactions
    // @TODO: prefix path with `browser/` or `localhost/` if user provides
    // @TODO: offer users by default a "save path" prefixed with the currently open file in the editor
    // @TODO: offer users by default a "load path" prefixed with the currently open file in the editor (show first one that comes)

    // @TODO: writing browser test

    return record
  }
  append (timestamp, record) {
    var self = this
    self.data.journal.push({ timestamp, record })
  }
  getAll () {
    var self = this
    var records = [].concat(self.data.journal)
    return {
      addresses: self._addressCache,
      transactions: records.sort((A, B) => {
        var stampA = A.timestamp
        var stampB = B.timestamp
        return stampA - stampB
      })
    }
  }
  clearAll () {
    var self = this
    self.data.journal = []
  }
}

module.exports = Recorder
