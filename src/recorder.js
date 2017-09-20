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
    opts.events.udapp.register('initiatingTransaction', (stamp, tx) => {
      var { from, to, value, gas, data } = tx
      var deTx = { from, to, value, gas, data, pending: true }
      self.data._pending[stamp] = deTx
    })
    opts.events.udapp.register('transactionExecuted', args => {
      var [err, from, to, data, /* isUserCall, result, */ stamp] = args
      if (err) console.error(err)
      else update(stamp, from, to, data)
    })
    opts.events.udapp.register('callExecuted', args => {
      var [err, from, to, data, /* isUserCall, result, */ stamp] = args
      if (err) console.error(err)
      else update(stamp, from, to, data)
    })
    function update (stamp, from, to, data) {
      var record = self._pending[stamp]
      delete self._pending[stamp]
      if (!record) return
      // at this point you have a map 0x123789 <=> < contractName - 1>
      // if a from` is 0x123789 you ill replace it by < contractName - 1>
      // > if (start with 0x) do nothing (we already have a supposed address)
      // > if not : <account - 0> is resolved to the first account in the list of accounts given from universaldapp.
      // > <account - 1> is resolved to second first account in the list of accounts given from universaldapp.
      // > if the account list is not large enough, we take the last one.
      // > Real addresses should be translated into token (apply to: to / from / return value of contract creation)
      // > e.g: from: 0x123...123 , to: 0x123...145 should be saved as: from:, to:
      // > e.g: from: 0x123...123, to: null (cause this is a contract creation),
      // > the return value is the address of the created contract.
      console.log('@TODO: probably the below translation need to be adapted to the comments above')
      record.from = from
      record.to = to
      record.data = data
      self.append(stamp, record)
    }
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
