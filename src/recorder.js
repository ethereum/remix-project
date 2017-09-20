var csjs = require('csjs-inject')
var yo = require('yo-yo')
var remix = require('ethereum-remix')
var EventManager = remix.lib.EventManager

class Recorder {
  constructor (opts = {}) {
    var self = this
    self._api = opts.api
    self.event = new EventManager()
    self.data = { journal: [] }
    opts.events.txlogger.register('initiatingTransaction', (stamp, tx) => {
      var { from, to, value, gas, data /*, gasPrice?, nonce? */ } = tx
      from = self.translate(from) // see comments above regarding what `translate(...)` is doing
      to = self.translate(to)
      var deTx = { from, to, value, gas, data /*, gasPrice?, nonce? */ }
      self.append(stamp, deTx)
    })
    opts.events.txlogger.register('transactionExecuted', args => {
      var [err, from, to, data, isUserCall, result, stamp] = args
      console.log('@TODO: should i do something here?')
    })
    opts.events.txlogger.register('callExecuted', args => {
      var [err, from, to, data, isUserCall, result, stamp] = args
      console.log('@TODO: should i do something here?')
    })
    opts.events.executioncontext.register('contextChanged', function () {
      self.clearAll()
    })
  }
  translate (prop) {
    /*  what to apply this to and why and how does it work?
        > Basically, transaction from / to tokens will be resolved as follow:
        > if (start with 0x) do nothing (we already have a supposed address)
        > if not : <account - 0> is resolved to the first account in the list of accounts given from universaldapp.
        > <account - 1> is resolved to second first account in the list of accounts given from universaldapp.
        > if the account list is not large enough, we take the last one.

        @TODO: what does it mean? (does that talk about the same as the next 4 lines of comments?)

        > Real addresses should be translated into token (apply to: to / from / return value of contract creation)
        > e.g: from: 0x123...123 , to: 0x123...145 should be saved as: from:, to:
        > e.g: from: 0x123...123, to: null (cause this is a contract creation),
        > the return value is the address of the created contract.
    */
    return prop
  }
  append (timestamp, record) {
    var self = this
    self.data.journal.push({ timestamp, record })
  }
  getAllJSON () {
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
