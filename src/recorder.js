var remix = require('ethereum-remix')
var EventManager = remix.lib.EventManager

class Recorder {
  constructor (opts = {}) {
    var self = this
    self._api = opts.api
    self.event = new EventManager()
    self.data = { journal: [], _pending: {} }
    opts.events.executioncontext.register('contextChanged', function () {
      self.clearAll()
    })
    var counter = 1
    self._addressCache = {}
    opts.events.udapp.register('initiatingTransaction', (stamp, tx) => {
      var { from, to, value, gas, data } = tx
      var record = { value, gas, data }
      record.from = self._addressCache[from] || (self._addressCache[from] = `<account -${(++counter)}>`)
      if (to === null) self.data._pending[stamp] = record
      else record.to = self._addressCache[to] || (self._addressCache[to] = `<account -${(++counter)}>`)
      self.append(stamp, record)
    })
    opts.events.udapp.register('transactionExecuted', args => {
      var err = args[0]
      if (err) console.error(err)
      var stamp = args[6]
      var record = self._pending[stamp]
      delete self._pending[stamp]
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
