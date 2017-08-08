'use strict'
var ethJSABI = require('ethereumjs-abi')

/**
  * Register to txListener and extract events
  *
  */
class EventsDecoder {
  constructor (opt = {}) {
    this._api = opt.api
  }

/**
  * use Transaction Receipt to decode logs. assume that the transaction as already been resolved by txListener.
  * logs are decoded only if the contract if known by remix.
  *
  * @param {Object} tx - transaction object
  * @param {Function} cb - callback
  */
  parseLogs (tx, contractName, compiledContracts, cb) {
    this._api.resolveReceipt(tx, (error, receipt) => {
      if (error) cb(error)
      this._decodeLogs(tx, receipt, contractName, compiledContracts, cb)
    })
  }

  _decodeLogs (tx, receipt, contract, contracts, cb) {
    if (!contract || !receipt) {
      return cb('cannot decode logs - contract or receipt not resolved ')
    }
    if (!receipt.logs) {
      return cb(null, [])
    }
    this._decodeEvents(tx, receipt.logs, contract, contracts, cb)
  }

  _eventABI (contractName, compiledContracts) {
    var contractabi = JSON.parse(compiledContracts[contractName].interface)
    var eventABI = {}
    contractabi.forEach(function (funABI, i) {
      if (funABI.type !== 'event') {
        return
      }
      var hash = ethJSABI.eventID(funABI.name, funABI.inputs.map(function (item) { return item.type }))
      eventABI[hash.toString('hex')] = { event: funABI.name, inputs: funABI.inputs }
    })
    return eventABI
  }

  _decodeEvents (tx, logs, contractName, compiledContracts, cb) {
    var eventABI = this._eventABI(contractName, compiledContracts)
    // FIXME: support indexed events
    var events = []
    for (var i in logs) {
      // [address, topics, mem]
      var log = logs[i]
      var event
      var decoded

      try {
        var abi = eventABI[log.topics[0].replace('0x', '')]
        event = abi.event
        var types = abi.inputs.map(function (item) {
          return item.type
        })
        decoded = ethJSABI.rawDecode(types, new Buffer(log.data.replace('0x', ''), 'hex'))
        decoded = ethJSABI.stringify(types, decoded)
      } catch (e) {
        decoded = log.data
      }
      events.push({ event: event, args: decoded })
    }
    cb(null, events)
  }
}

module.exports = EventsDecoder
