var remix = require('ethereum-remix')
var EventManager = remix.lib.EventManager

class Recorder {
  constructor (opts = {}) {
    var self = this
    self._api = opts.api
    self.event = new EventManager()
    self.data = { journal: [], _pendingCreation: {} }
    opts.events.executioncontext.register('contextChanged', function () {
      self.clearAll()
    })
    var counter = 0
    self._addressCache = {}
    opts.events.udapp.register('initiatingTransaction', (timestamp, tx) => {
      var { from, to, value, gas, data } = tx
      var record = { value, gas, data }
      record.from = self._addressCache[from] || (self._addressCache[from] = `<account -${(++counter)}>`)
      if (to === null) self.data._pendingCreation[timestamp] = record
      else record.to = self._addressCache[to] || (self._addressCache[to] = `<account -${(++counter)}>`)
      self.append(timestamp, record)
    })
    opts.events.udapp.register('transactionExecuted', (...args) => {
      var err = args[0]
      if (err) console.error(err)
      var timestamp = args[6]
      // update transaction which was pending with correct `to` address
      var record = self._pendingCreation[timestamp]
      delete self._pendingCreation[timestamp]
      if (!record) return
      var to = args[2]
      record.to = self._addressCache[to] || (self._addressCache[to] = `<contract -${++counter}>`)
    })
  }
  append (timestamp, record) {
    var self = this
    self.data.journal.push({ timestamp, record })
  }
  getAll () {
    var self = this
    var records = [].concat(self.data.journal)
    return records.sort((A, B) => {
      var stampA = A.timestamp
      var stampB = B.timestamp
      return stampA - stampB
    })
  }
  clearAll () {
    var self = this
    self.data.journal = []
  }
}

module.exports = Recorder
